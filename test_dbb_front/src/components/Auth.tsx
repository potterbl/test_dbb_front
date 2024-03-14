import '../styles/Auth.css'
import axios from "axios";
import {useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import UserStore from "../store/UserStore";
import FilesStore from "../store/FilesStore";

const Auth = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('code');
        if (accessToken) {
            setIsLoading(true)
            const fetchData = async () => {
                axios
                    .get(`http://localhost:5000/auth/dropbox/callback?code=${accessToken}`)
                    .then(res => {
                        UserStore.setUser(res.data.user)
                        FilesStore.setFiles(res.data.files)
                    })
                    .catch(err => console.log(err.message))
                    .finally(() => {
                        setIsLoading(false)
                    })
            }
            fetchData()
        }
    }, [location.search]);

    const onClick = async () => {
        window.location.href = "http://localhost:5000/auth/dropbox"
    };

    return (
        <>
            {
                isLoading &&
                <div className="loader">
                    <span className="loader_span"></span>
                </div>
            }
            <div className="auth">
                <h1>Enter to account using dropbox</h1>

                <button className="btn_auth" onClick={onClick}>
                    <img src="dropbox.png" className="dropbox-img_btn" alt="dropbox icon"/>
                    <h2 style={{color: "black"}}>Login</h2>
                </button>
            </div>
        </>
    );
};

export default Auth
