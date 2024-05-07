import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
                    <li><Link to="/home" style={{ }}><FontAwesomeIcon icon={faClock} /> Мои отчеты</Link></li>
                    <li><Link to="/account" style={{ }}><FontAwesomeIcon icon={faAddressCard} /> Профиль</Link></li>
                    <li><Link to="/users" style={{ }}><FontAwesomeIcon icon={faUser} /> Сотрудники</Link></li>
                    <li><Link to="/projects" style={{ color: linkColor}}><FontAwesomeIcon icon={faFolder} /> Проекты</Link></li>
                    <li><Link to="/customers" style={{color: linkColor }}><FontAwesomeIcon icon={faPeopleArrows} /> Заказчики</Link></li>
                    <li><Link to="/specializations" style={{ color: linkColor }}><FontAwesomeIcon icon={faFolder} /> Специализации</Link></li>
                    <li><Link to="/users-reports" style={{ color: linkColor }}><FontAwesomeIcon icon={faBook} /> Все отчеты</Link></li>
                </ul>
            </nav>
            <div className="logout-button-container">
                <button className="logout-button" onClick={logout}><FontAwesomeIcon icon={faArrowRight} /> Выйти</button>
            </div>
        </header>
    );
};

export default Header;
