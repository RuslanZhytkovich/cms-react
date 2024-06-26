import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./auth/login/login";
import Registration from "./auth/registration/register";
import NotFound from "./layouts/errors/NotFound";
import {RequireToken} from "./auth/Auth";
import Header from "./layouts/header/header";
import Customer from "./layouts/customer/customer";
import Account from "./layouts/account/account";
import Home from "./layouts/home/home";
import Project from "./layouts/project/project";


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
                    <Route path="/projects" element={<RequireToken><Header /><Project /></RequireToken>} /> {}
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
