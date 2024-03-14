import "../styles/FilesExplorer.css"
import FileItem, {IFile} from "./FileItem";
import FilesStore from "../store/FilesStore";
import {useMemo} from "react";
import {observer} from "mobx-react-lite";

const FilesExplorer = () => {
    const {files, currentFolder} = FilesStore

    const findFolderById = (folderId: string, files: IFile[]): IFile[] | null => {
        if(folderId === "") return files
        for (const file of files) {
            if (file[".tag"] === "folder" && file.id === folderId) {
                return file.files || [];
            }

            if (file[".tag"] === "folder" && file.files) {
                const foundFolder: IFile[] | null = findFolderById(folderId, file.files);
                if (foundFolder !== null) {
                    return foundFolder;
                }
            }
        }
        return null;
    }


    const sortedFiles = useMemo(() => {
        return findFolderById(currentFolder, files || [])
        // eslint-disable-next-line
    }, [currentFolder, files])

    return (
        <div className="explorer">
            {
                sortedFiles && sortedFiles.map((f: IFile) => (
                    <FileItem key={f.id} file={f}/>
                ))
            }
        </div>
    );
};

export default observer(FilesExplorer)
