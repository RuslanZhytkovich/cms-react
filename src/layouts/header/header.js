import React from 'react';
import { Link } from 'react-router-dom';
import './header.css'; // Подключаем файл стилей

const Header = () => {
    const logout = () => {
        document.cookie = 'refreshToken=; path=/;';
        localStorage.removeItem('accessToken');
        window.location.href = '/';
    };

    return (
        <header className="header-container">
            <nav>
                <ul className="nav-list">
                    <li><Link to="/home">Главная</Link></li>
                    <li><Link to="/projects">Проекты</Link></li>
                    <li><Link to="/customers">Заказчики</Link></li>
                    <li><Link to="/account">Аккаунт</Link></li>
                    <li><button onClick={logout}>Выйти</button></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
