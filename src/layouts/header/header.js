import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './header.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faClock, faFolder, faUser, faPeopleArrows, faAddressCard, faFolderBlank, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import {fetchUserData} from "../../utils/profile-info";

const Header = () => {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchUserData();
                const role = data['current_user'].role;
                setUserRole(role);
            } catch (error) {
                console.error(error.message);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Ошибка загрузки данных о пользователе: {error}</div>;
    }

    const logout = () => {
        document.cookie = 'refreshToken=; path=/;';
        localStorage.removeItem('accessToken');
        window.location.href = '/';
    };

    const linkColor = userRole === "developer" ? "darkgray" : "white"; // Если пользователь developer, цвет будет красный, иначе черный

    return (
        <header className="header-container">
            <nav>
                <ul className="nav-list">
                    <li><NavLink to="/home" activeClassName="active"><FontAwesomeIcon icon={faClock} /> Мои отчеты</NavLink></li>
                    <li><NavLink to="/account" activeClassName="active"><FontAwesomeIcon icon={faAddressCard} /> Профиль</NavLink></li>
                    <li><NavLink to="/users" activeClassName="active"><FontAwesomeIcon icon={faUser} /> Сотрудники</NavLink></li>
                    <li><NavLink to="/projects" activeClassName="active" className={userRole === "developer" ? "red-link" : ""}><FontAwesomeIcon icon={faFolder} /> Проекты</NavLink></li>
                    <li><NavLink to="/customers" activeClassName="active" className={userRole === "developer" ? "red-link" : ""}><FontAwesomeIcon icon={faPeopleArrows} /> Заказчики</NavLink></li>
                    <li><NavLink to="/specializations" activeClassName="active" className={userRole === "developer" ? "red-link" : ""}><FontAwesomeIcon icon={faFolder} /> Специализации</NavLink></li>
                    <li><NavLink to="/users-reports" activeClassName="active" className={userRole === "developer" ? "red-link" : ""}><FontAwesomeIcon icon={faBook} /> Все отчеты</NavLink></li>
                </ul>
            </nav>
            <div className="logout-button-container">
                <button className="logout-button" onClick={logout}><FontAwesomeIcon icon={faArrowRight} /> Выйти</button>
            </div>
        </header>
    );
};

export default Header;
