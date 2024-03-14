import "../styles/LoginPage.css"
import Auth from "../components/Auth";
import {observer} from "mobx-react-lite";
import UserStore from "../store/UserStore";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

const LoginPage = () => {
    const user = UserStore.user

    const navigate = useNavigate()

    useEffect(() => {
        if(user !== null) return navigate("/")
    }, [user, navigate])

    return (
        <main className="login_page">
            <Auth/>
        </main>
    );
};

export default observer(LoginPage)
