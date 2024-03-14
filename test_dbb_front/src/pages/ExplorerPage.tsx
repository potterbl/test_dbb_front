import UserStore from "../store/UserStore";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import ExplorerToolbar from "../components/ExplorerToolbar";
import FilesExplorer from "../components/FilesExplorer";
import {observer} from "mobx-react-lite";

import "../styles/ExplorerPage.css"

const ExplorerPage = () => {
    const user = UserStore.user

    const navigate = useNavigate()

    useEffect(() => {
        if(user === null) navigate("/auth")
    }, [user, navigate])
    return (
        <>
            <ExplorerToolbar/>
            <main className="main">
                <FilesExplorer/>
            </main>
        </>
    );
};

export default observer(ExplorerPage)
