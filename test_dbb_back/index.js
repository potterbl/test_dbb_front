const express = require("express")
const session = require("express-session")
const passport = require("passport")
const DropboxOAuth2Strategy = require("passport-dropbox-auth").Strategy
const Dropbox = require("dropbox")
const cors = require("cors")
const multer = require("multer")
const upload = multer()

const app = express()

app.use(cors({
    origin: function(origin, callback) {
        // Check if the origin is allowed, or if it's undefined (e.g., not a cross-origin request)
        if (!origin || origin === 'http://localhost:3000') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(session({
    secret: "secret_test",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new DropboxOAuth2Strategy({
    v: 2,
    clientID: "ca6p7ivowka0mcf",
    clientSecret: "gdcxsie5veujmb3",
    callbackURL: "http://localhost:3000/auth",
    passReqToCallback: true
}, function(token, tokenSecret, _, accessToken, profile, cb) {
    return cb(null, { accessToken: accessToken.access_token, profile: profile });
}))

app.get('/auth/dropbox', passport.authenticate('dropbox'))
app.get('/auth/dropbox/callback', passport.authenticate('dropbox'), (req, res) => {
    const accessToken = req.user.accessToken

    const dbx = new Dropbox.Dropbox({ accessToken })

    async function processFolder(folderPath) {
        try {
            const response = await dbx.filesListFolder({ path: folderPath });
            const entries = response.result.entries;

            const files = await Promise.all(entries.map(async (entry) => {
                if (entry['.tag'] === 'file') {
                    const temporaryLinkResponse = await dbx.filesGetTemporaryLink({ path: entry.path_display });
                    const temporaryLink = temporaryLinkResponse.result.link;
                    return {
                        ...entry,
                        url: temporaryLink
                    };
                } else if (entry['.tag'] === 'folder') {
                    const subFolderPath = entry.path_display;
                    const subFiles = await processFolder(subFolderPath);
                    const temporaryLinkResponse = await dbx.filesDownloadZip({path: entry.path_display});
                    const file = temporaryLinkResponse.result.fileBinary;
                    return {
                        ...entry,
                        files: subFiles,
                        file: file
                    };
                }
            }));

            return files;
        } catch (error) {
            console.error("Error processing folder:", error);
            throw error;
        }
    }

    processFolder('')
        .then((files) => {
            const responseData = {
                user: req.user,
                files,
            };

            res.json(responseData);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({error: 'Failed to process Dropbox folders and files'});
        });

})
app.post('/uploadFile', upload.single("file") ,async (req, res) => {
    try {
        if (!req.body.accessToken) {
            return res.status(400).json({error: 'Missing accessToken in request body'})
        }
        if (!req.body.path) {
            req.body.path = ""
        }
        if (!req.file) {
            return res.status(400).json({error: 'No file uploaded'});
        }

        const accessToken = req.body.accessToken

        const dbx = new Dropbox.Dropbox({accessToken})

        const {path} = req.body
        const file = req.file.buffer

        const fileName = req.file.originalname.replace(/[^\w.-]/g, '_')

        const response = await dbx.filesUpload({path: path + "/" + fileName, contents: file});
        const uploadedFileMetadata = response.result;
        const temporaryLinkResponse = await dbx.filesGetTemporaryLink({ path: uploadedFileMetadata.path_display });
        const temporaryLink = temporaryLinkResponse.result.link;
        res.json({
            result: {...uploadedFileMetadata, ".tag": "file", url: temporaryLink, path: path}
        });

    } catch (e) {
        throw new Error(e)
    }
})

app.listen(5000)
