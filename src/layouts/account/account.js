import React, { useState, useEffect } from 'react';
import './account.css';

const Account = () => {
    const [userData, setUserData] = useState(null);
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    setAccessToken(token);
                    const response = await fetch('http://localhost:8000/login/test_auth_endpoint', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                    } else {
                        console.error('Ошибка при получении данных:', response.statusText);
                    }
                } else {
                    console.error('Access token not found in local storage');
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="account-container">
            <p className="account-title">Аккаунт </p>
            {userData && (
                <div className="user-info">
                    <p><strong>Email:</strong> {userData.current_user.email}</p>
                    <p><strong>Роль:</strong> {userData.current_user.role}</p>
                    <p><strong>Имя:</strong> {userData.current_user.name}</p>
                    <p><strong>Фамилия:</strong> {userData.current_user.last_name}</p>
                    <p><strong>Телеграм:</strong> @{userData.current_user.telegram}</p>
                    <p><strong>Без проекта:</strong> {userData.current_user.on_bench}</p>
                    <p><strong>Специализация:</strong> {userData.current_user.specialization_id}</p>
                    <p><strong>Дата регистрации:</strong> {userData.current_user.time_created}</p>
                    {/* Другие данные пользователя */}
                </div>
            )}
        </div>
    );
};

export default Account;
