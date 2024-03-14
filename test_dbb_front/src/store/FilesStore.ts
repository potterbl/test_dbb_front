import {makeAutoObservable} from "mobx";
import {IFile} from "../components/FileItem";

class FilesStore {
    files: IFile[] = []
    currentFolder: string = ""
    selectedItem: string = ""

    constructor() {
        makeAutoObservable(this)
    }

    setFiles(newFiles: any) {
        this.files = newFiles
    }
    setCurrentFolder(newCurrentFolder: string){
        this.currentFolder = newCurrentFolder
    }
    setSelectedItem(newSelectedItem: string){
        this.selectedItem = newSelectedItem
        return "asd"
    }
}

const filesStore = new FilesStore();
export default filesStore;
