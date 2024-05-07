import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./auth/login";
import Registration from "./auth/register";
import NotFound from "./layouts/errors/NotFound";
import {RequireRole, RequireToken} from "./auth/Auth";
import Header from "./layouts/header/header";
import Customer from "./layouts/customer/customer";
import Account from "./layouts/account/account";
import Home from "./layouts/home/home";
import Project from "./layouts/project/project";
import Specialization from "./layouts/specialization/specialization";
import Users from "./layouts/user/users";
import UsersReports from "./layouts/users-reports/users-reports";
import {fetchUserData} from "./utils/profile-info";

function App() {
    // 1. Создаем состояние для userRole
    const [userRole, setUserRole] = useState(null);

    // 2. Предполагая, что у вас есть функция fetchUserData, которая получает данные о пользователе
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchUserData();
                const role = data['current_user'].role;
                // Обновляем состояние userRole
                setUserRole(role);
            } catch (error) {
                console.error(error.message);
            }
        };
        fetchData();
    }, []);

    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/register" element={<Registration />} />

                    {/* 3. Передаем userRole в компонент Header */}
                    <Route path="/home" element={<RequireToken><Header userRole={userRole} /><Home /></RequireToken>} />
                    <Route path="/customers" element={<RequireToken><RequireRole><Header userRole={userRole} /><Customer /></RequireRole></RequireToken>} />
                    <Route path="/account" element={<RequireToken><Header userRole={userRole} /><Account /></RequireToken>} />
                    <Route path="/users" element={<RequireToken><Header userRole={userRole} /><Users /></RequireToken>} />
                    <Route path="/specializations" element={<RequireToken><RequireRole><Header userRole={userRole} /><Specialization /></RequireRole></RequireToken>} />
                    <Route path="/users-reports" element={<RequireToken><Header userRole={userRole} /><UsersReports /></RequireToken>} />
                    <Route path="/projects" element={<RequireToken><RequireRole><Header userRole={userRole} /><Project /></RequireRole></RequireToken>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
