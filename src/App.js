import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./auth/login";
import Registration from "./auth/register";
import NotFound from "./layouts/errors/NotFound";
import {RequireToken} from "./auth/Auth";
import Header from "./layouts/header/header";
import Customer from "./layouts/customer/customer";
import Account from "./layouts/account/account";
import Home from "./layouts/home/home";
import Project from "./layouts/project/project";
import Specialization from "./layouts/specialization/specialization";
import Users from "./layouts/user/users";
import UsersReports from "./layouts/users-reports/users-reports";


function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/home" element={<RequireToken><Header /><Home /></RequireToken>} />
                    <Route path="/customers" element={<RequireToken><Header /><Customer /></RequireToken>} />
                    <Route path="/account" element={<RequireToken><Header /><Account /></RequireToken>} />
                    <Route path="/users" element={<RequireToken><Header /><Users /></RequireToken>} />
                    <Route path="/specializations" element={<RequireToken><Header /><Specialization /></RequireToken>} />
                    <Route path="/users-reports" element={<RequireToken><Header /><UsersReports /></RequireToken>} />
                    <Route path="/projects" element={<RequireToken><Header /><Project /></RequireToken>} /> {}
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
