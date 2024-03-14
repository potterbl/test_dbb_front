import "../styles/FileItem.css"
import {useEffect, useRef, useState} from "react";
import FilesStore from "../store/FilesStore";

export interface IFile {
    ".tag": string,
    files?: IFile[],
    file?: Buffer,
    id: string,
    is_downloadable?: boolean,
    name: string,
    path_display: string,
    path_lower: string,
    rev?: string,
    server_modified?: string,
    size?: number
    url?: string
}

const FileItem = ({file}: {file: IFile}) => {
    const [isActive, setIsActive] = useState<boolean>(false)
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number, opacity: number }>({ x: 0, y: 0, opacity: 0});
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

    const itemRef = useRef<HTMLDivElement>(null)

    const handleClick = () => {
        FilesStore.setSelectedItem(file.id)
        setIsActive(prevState => !prevState)
    }

    const handleDoubleClick = () => {
        if(file[".tag"] === "folder"){
            FilesStore.setSelectedItem("")
            FilesStore.setCurrentFolder(file.id)
        }
    }

    const showCustomMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setMenuVisible(true);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if(itemRef.current && !itemRef.current.contains(e.target as Node)){
                setIsActive(prevState => {
                    if(prevState && (e.target as HTMLElement).tagName !== "BUTTON"){
                        FilesStore.setSelectedItem("")
                        return !prevState
                    } else {
                        return prevState
                    }
                })
                if((e.target as HTMLElement).tagName !== "A") {
                    setMenuVisible(false)
                }
            }
        }

        window.addEventListener('mousedown', handleClickOutside)

        return () => {
            window.removeEventListener('mousedown', handleClickOutside)
        }
    }, [itemRef])


    const handleMouseEnter = () => {
        const rect = itemRef.current?.getBoundingClientRect();
        if(rect){
            setTooltipPosition({ x: rect.left + window.scrollX, y: rect.top + window.scrollY, opacity: 1 });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = itemRef.current?.getBoundingClientRect();
        if(rect) {
            setTooltipPosition({x: e.clientX - rect.left, y: e.clientY - rect.top + 10, opacity: 1});
        }
    };

    const handleMouseLeave = () => {
        setTooltipPosition({ x: 0, y: 0, opacity: 0 });
    };

    return (
        <>
            {
                menuVisible &&
                <div className="contextMenu" style={{
                    left: menuPosition.x,
                    top: menuPosition.y
                }}>
                    <a href={file.url}>Download</a>
                </div>
            }
            <div ref={itemRef} className={`file ${isActive ? 'active_file' : ''}`} onClick={handleClick}
                 onDoubleClick={handleDoubleClick} {...(file[".tag"] === "file" && { onContextMenu: showCustomMenu })}>
                <div className={`file_image ${isActive ? 'active_image' : ''}`}>
                    {
                        file[".tag"] === "folder" ?
                            <img src="/folder.svg" alt="folder" className="file_image_icon"/>
                            : file[".tag"] === "file" && file.url && (file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") || file.name.endsWith(".gif") || file.name.endsWith(".bmp") || file.name.endsWith(".svg") || file.name.endsWith(".webp") || file.name.endsWith(".tiff") || file.name.endsWith(".ico") || file.name.endsWith(".apng") || file.name.endsWith(".avif") || file.name.endsWith(".jxr") || file.name.endsWith(".wbmp") || file.name.endsWith(".heic") || file.name.endsWith(".heif") || file.name.endsWith(".pdf") || file.name.endsWith(".eps")) ?
                                <img src={file.url} alt={file[".tag"]} className="file_image_icon"/>
                                : file[".tag"] === "file" && file.url && file.name.endsWith(".json") ?
                                    <img src="/json.svg" alt={file[".tag"]} className="file_image_icon"/>
                                    : file[".tag"] === "file" && file.url && (
                                        file.name.endsWith(".mp4") ||
                                        file.name.endsWith(".avi") ||
                                        file.name.endsWith(".mov") ||
                                        file.name.endsWith(".mkv") ||
                                        file.name.endsWith(".wmv") ||
                                        file.name.endsWith(".flv") ||
                                        file.name.endsWith(".webm") ||
                                        file.name.endsWith(".mpeg") ||
                                        file.name.endsWith(".mpg") ||
                                        file.name.endsWith(".m4v") ||
                                        file.name.endsWith(".3gp") ||
                                        file.name.endsWith(".ogg") ||
                                        file.name.endsWith(".ogv") ||
                                        file.name.endsWith(".m2v") ||
                                        file.name.endsWith(".m2ts") ||
                                        file.name.endsWith(".mts") ||
                                        file.name.endsWith(".ts") ||
                                        file.name.endsWith(".divx") ||
                                        file.name.endsWith(".rm") ||
                                        file.name.endsWith(".vob") ||
                                        file.name.endsWith(".dat") ||
                                        file.name.endsWith(".f4v") ||
                                        file.name.endsWith(".mxf") ||
                                        file.name.endsWith(".flv") ||
                                        file.name.endsWith(".amv") ||
                                        file.name.endsWith(".asf") ||
                                        file.name.endsWith(".r3d") ||
                                        file.name.endsWith(".swf") ||
                                        file.name.endsWith(".weba") ||
                                        file.name.endsWith(".mod") ||
                                        file.name.endsWith(".mpeg4") ||
                                        file.name.endsWith(".avi") ||
                                        file.name.endsWith(".dav") ||
                                        file.name.endsWith(".dvr-ms")
                                    ) ?
                                        <img src="/video.svg" alt={file[".tag"]}className="file_image_icon"/>
                                        : null

                    }
                </div>
                <p className="file_title" onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove}
                   onMouseLeave={handleMouseLeave}>{file.name}</p>
                <span className="file_title_tooltip" style={{
                    left: tooltipPosition.x,
                    top: tooltipPosition.y,
                    opacity: tooltipPosition.opacity
                }}>{file.name}</span>
            </div>
        </>
    );
};

export default FileItem;
