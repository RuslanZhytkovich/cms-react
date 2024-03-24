import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const logout = () => {

        document.cookie = 'refreshToken=; path=/;';
        localStorage.removeItem('accessToken');
        window.location.href = '/';
    };

    return (
        <header>
            <nav>
                <ul>
                    <li>
                        <Link to="/home">Home</Link>
                    </li>
                    <li>
                        <button onClick={logout}>Logout</button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
