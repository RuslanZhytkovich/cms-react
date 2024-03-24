import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Registration from './components/registration/register';
import Login from './components/login/login';
import NotFound from './components/errors/NotFound';
import { RequireToken } from './components/Auth.js';
import Home from './components/home';
import Projects from './components/projects';
import Header from "./components/header"; // Подключаем компонент Projects

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/home" element={<RequireToken><Header /><Home /></RequireToken>} />
                    <Route path="/projects" element={<RequireToken><Header /><Projects /></RequireToken>} /> {}
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
