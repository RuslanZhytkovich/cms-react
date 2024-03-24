import React, {useContext, useState} from 'react';
import './login.css';
import {setAccessTokenToLocalStorage, setRefreshTokenToCookie, setToken} from "../Auth";
import {useNavigate} from "react-router-dom";


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
        <form onSubmit={handleSubmit}>
            <div>
                <h1>Login</h1>
                <label>Email:</label>
                <input
                    name="email"
                    placeholder='example@gmail.com'
                    autoComplete='off'
                    onChange={handleChange}
                    title="Введите корректный email адрес (например, example@gmail.com)"
                />
                {errors.email && <span>{errors.email}</span>}
            </div>
            <div>
                <label>Пароль:</label>
                <input
                    type="password"
                    name="password"
                    placeholder='******'
                    onChange={handleChange}
                />
                {errors.password && <span>{errors.password}</span>}
            </div>

            <button type="submit">Подтвердить</button>
        </form>
    );
};

export default Login;


