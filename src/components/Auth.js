import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export const setRefreshTokenToCookie = (refreshToken) => {
    document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`;
}

export const setAccessTokenToLocalStorage = (token) => {
    localStorage.setItem('accessToken', token);
}

export const fetchToken = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        return false;
    }

    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/login/test_auth_endpoint', requestOptions);
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
        // Пока выполняется запрос, отображаем заглушку
        return <div>Loading...</div>;
    }

    if (!auth) {
        // Если запрос не был успешным или нет токена, перенаправляем на страницу входа
        return <Navigate to="/" state={{ from: location }} />;
    }

    return children;
}
