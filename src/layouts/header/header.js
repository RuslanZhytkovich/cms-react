import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './header.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faClock, faFolder, faUser, faPeopleArrows, faAddressCard, faFolderBlank, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const Header = ({ userRole }) => {
    const logout = () => {
        document.cookie = 'refreshToken=; path=/;';
        localStorage.removeItem('accessToken');
        window.location.href = '/';
    };

    return (
        <header className="header-container">
            <nav>
                <ul className="nav-list">
                    <li><Link to="/home"><FontAwesomeIcon icon={faClock}/> Мои отчеты</Link></li>
                    <li><Link to="/users"><FontAwesomeIcon icon={faUser}/> Сотрудники</Link></li>
                    {userRole !== "developer" && <li><Link to="/projects"><FontAwesomeIcon icon={faFolder}/> Проекты</Link></li>}
                    {userRole !== "developer" && <li><Link to="/customers"><FontAwesomeIcon icon={faPeopleArrows}/> Заказчики</Link></li>}
                    {userRole !== "developer" && <li><Link to="/specializations"><FontAwesomeIcon icon={faFolder}/> Специализации</Link></li>}

                    {userRole !== "developer" && <li><Link to="/users-reports"><FontAwesomeIcon icon={faBook}/> Все отчеты</Link></li>}

                    <li><Link to="/account"><FontAwesomeIcon icon={faAddressCard}/> Профиль</Link></li>
                </ul>
            </nav>
            <div className="logout-button-container">
            <button className="logout-button" onClick={logout}><FontAwesomeIcon icon={faArrowRight}/> Выход</button>
            </div>
        </header>

    );
};

export default Header;
