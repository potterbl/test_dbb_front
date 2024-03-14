import {observer} from "mobx-react-lite";

import "../styles/ExplorerToolbar.css"
import UserStore from "../store/UserStore";
import FilesStore from "../store/FilesStore";
import {IFile} from "./FileItem";
import {useMemo, useState} from "react";
import axios from "axios";

const ExplorerToolbar = () => {
    const [file, setFile] = useState<File | undefined>(undefined)

    const user = UserStore.user
    const {currentFolder, files, selectedItem} = FilesStore

    const userName = user?.profile.name.display_name || ""

    const findPrevFolder = (files: IFile[]): string => {
        for(const file of files){
            if(file[".tag"] === "folder" && file.files?.find((f: IFile) => f.id === currentFolder)){
                return file.id
            }else if(file[".tag"] === "folder" && file.files){
                const foundFileId: string | undefined = findPrevFolder(file.files)
                if(foundFileId){
                    return  foundFileId
                }
            }
        }
        return ""
    }

    const handleBackFromFolder = () => {
        FilesStore.setCurrentFolder(findPrevFolder(files))
    }

    const handleLogout = () => {
        window.location.reload()
    }

    const findSelectedItem = (files: IFile[], selectedItem: string): IFile | undefined => {
        for (const file of files) {
            if (file.id === selectedItem) {
                return file;
            } else if (file[".tag"] === "folder" && file.files) {
                const foundFile = findSelectedItem(file.files, selectedItem);
                if (foundFile) {
                    return foundFile;
                }
            }
        }
        return undefined;
    }

    const selectedItemFile = useMemo(() => {
        return findSelectedItem(files, selectedItem)
        // eslint-disable-next-line
    }, [files, selectedItem])

    const findFolderById = (folderId: string, files: IFile[]): IFile | null => {
        for (const file of files) {
            if (file[".tag"] === "folder" && file.id === folderId) {
                return file || null;
            }

            if (file[".tag"] === "folder" && file.files) {
                const foundFolder: IFile | null = findFolderById(folderId, file.files);
                if (foundFolder !== null) {
                    return foundFolder;
                }
            }
        }
        return null;
    }

    const insertFile = (files: IFile[], newFile: IFile, filePath: string): IFile[] => {
        for (const file of files) {
            if(filePath === "") {
                files.push(newFile)
                return files
            }
            if (file[".tag"] === "folder" && file.path_display === filePath) {
                if (!file.files) {
                    file.files = [];
                }
                file.files.push(newFile);
                return files;
            }
            if (file[".tag"] === "folder" && file.files) {
                const foundFolder: IFile[] | undefined = insertFile(file.files, newFile, filePath);
                if (foundFolder) {
                    return files;
                }
            }
        }
        return files;
    };

    const handleUploadFile = async () => {
        const formData = new FormData()
        if (file) {
            formData.append("file", file)
        }
        formData.append("accessToken", user.accessToken)
        const pathName = findFolderById(currentFolder, files)?.path_display
        if (pathName) {
            formData.append("path", pathName)
        }

        await axios
            .post("http://localhost:5000/uploadFile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            .then(res => {
                const { path, ...newFile } = res.data.result
                const newFiles = insertFile(files.slice(), newFile, path)
                FilesStore.setFiles(newFiles)
            })
            .catch(err => console.log(err))
    }

    const handleDownloadTarget = () => {
        window.open(selectedItemFile?.url, "_blank")
    }

    return (
        <header className="header">
            <div className="header-left">
                {
                    currentFolder !== "" &&
                    <button className="header-btn_back" onClick={handleBackFromFolder}/>
                }
                <h1>Explorer</h1>
                <label>
                    <input type="file" className="header_btn" onChange={e => e.target.files ? setFile(e.target.files[0]) : undefined}/>
                    <button className="header_btn" onClick={handleUploadFile}>Upload</button>
                </label>
                {
                    selectedItem !== "" && selectedItemFile && selectedItemFile.url &&
                    <button className="header_btn" onClick={handleDownloadTarget}>Download</button>
                }
            </div>
            <div className="header-right">
                <p>{userName}</p>
                <button className="header_btn" onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </header>
    );
};

export default observer(ExplorerToolbar)
