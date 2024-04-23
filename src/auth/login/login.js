import React, { useState } from 'react';
import './login.css';
import { setAccessTokenToLocalStorage, setRefreshTokenToCookie } from "../Auth";
import { useNavigate } from "react-router-dom";
import email_icon from "./assets/email.png";
import password_icon from "./assets/password.png";

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        setErrors({});
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};

        if (!formData.email.trim()) {
            validationErrors.email = "Обязательное поле";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            validationErrors.email = "Некорректный email";
        }

        if (!formData.password.trim()) {
            validationErrors.password = "Обязательное поле";
        } else if (formData.password.length < 6) {
            validationErrors.password = "Пароль должен быть более 6 символов";
        } else if (!/^[a-zA-Z0-9]+$/.test(formData.password)) {
            validationErrors.password = "Пароль должен содержать только латиницу и цифры";
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                const formDataToSend = new FormData();
                formDataToSend.append('username', formData.email);
                formDataToSend.append('password', formData.password);

                const requestOptions = {
                    method: "POST",
                    body: formDataToSend
                };

                const response = await fetch("http://127.0.0.1:8000/login/token", requestOptions);
                const data = await response.json();

                if (!response.ok) {
                    console.log("11111_" + response.status)
                    console.log('not ok(')
                } else {
                    setRefreshTokenToCookie(data['refresh_token']);
                    setAccessTokenToLocalStorage(data['access_token'])

                    navigate('/home');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при отправке данных');
            }
        }
    };

    return (
        <div className="container">
            <div className="header">
                <div className="text">Вход в систему</div>
                <div className="underline"></div>
            </div>
            <div className="inputs">
                <div className="input">
                    <img src={email_icon} alt=""/>
                    <input
                        name="email"
                        placeholder='Email'
                        autoComplete='off'
                        onChange={handleChange}
                        title="Введите корректный email адрес (например, example@gmail.com)"
                    />
                    {errors.email && <span>{errors.email}</span>}
                </div>
                <div className="input">
                    <img src={password_icon} alt=""/>
                    <input
                        type="password"
                        name="password"
                        placeholder='Пароль'
                        onChange={handleChange}
                    />
                    {errors.password && <span>{errors.password}</span>}
                </div>
            </div>
            <div className="forgot-password">Еще не зарегестрированы? <span onClick={handleRegisterClick}> Зарегестрироваться!</span></div>
            <div className="submit-container">
                <button type="button" className="submit" onClick={handleSubmit}>Подтвердить</button>
            </div>
        </div>
    );
};

export default Login;
