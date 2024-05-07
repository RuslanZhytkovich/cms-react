import React, {useEffect, useRef, useState} from "react";
import {Navigate, useLocation, useNavigate} from "react-router-dom";
import {fetchUserData} from "../utils/profile-info";

export const setRefreshTokenToCookie = (refreshToken) => {
    document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`;
}

export const setAccessTokenToLocalStorage = (token) => {
    localStorage.setItem('accessToken', token);
}

function getCookie(name) {
    const fullCookieString = '; ' + document.cookie;
    const splitCookie = fullCookieString.split('; ' + name + '=');
    return splitCookie.length === 2 ? splitCookie.pop().split(';').shift() : null;
}

export const fetchToken = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        return false;
    }

    const requestAccessOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    const formDataToSend = new FormData();
    formDataToSend.append('refresh_token', getCookie('refreshToken'));

    const requestRefreshOptions = {
        method: 'POST',
        body: formDataToSend
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/login/test_auth_endpoint', requestAccessOptions);
        if (response.status === 401) {
            console.log("401");

            const response2 = await fetch('http://127.0.0.1:8000/login/token/refresh', requestRefreshOptions);
            if (response2.ok) {
                const data = await response2.json();
                setAccessTokenToLocalStorage(data['access_token']);
                // Вызываем fetchToken снова, чтобы проверить токен после обновления
                return fetchToken();
            } else {
                console.error('Failed to refresh token');
                return false;
            }
        }
        return response.status === 200;
    } catch (error) {
        console.error('Error fetching token:', error);
        return false;
    }
}

export function RequireToken({ children }) {
    const [auth, setAuth] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchAuth = async () => {
            const isAuthenticated = await fetchToken();
            setAuth(isAuthenticated);
        }
        fetchAuth();
    }, []);

    if (auth === null) {
        return <div>Loading...</div>;
    }


    if (!auth) {
        return <Navigate to="/" state={{ from: location }} />;
    }

    return children;
}

export const RequireRole = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const alertShown = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const isAuthenticated = await fetchToken();
                setAuth(isAuthenticated);
            } catch (error) {
                console.error(error.message);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchUserData();
                const role = data['current_user'].role;
                setUserRole(role);
            } catch (error) {
                console.error(error.message);
            }
        };
        if (auth) {
            fetchData();
        }
    }, [auth]);

    useEffect(() => {
        if (userRole === "developer" && !alertShown.current) {
            alertShown.current = true;
            navigate('/home');
            alert('Только для администраторов и менеджеров!');
        }
    }, [userRole]);

    if (auth === null || userRole === null) {
        return <div>Loading...</div>;
    }

    return children;
};




