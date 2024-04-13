import React, { useState } from 'react';
import './register-styles.css';
import { useNavigate } from "react-router-dom";

const Registration = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate(); // Перемещаем хук за пределы компонента

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        setErrors({});
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};

        if(!formData.email.trim()) {
            validationErrors.email = "Обязательное поле";
        } else if(!/\S+@\S+\.\S+/.test(formData.email)){
            validationErrors.email = "Некорректный email";
        }

        if(!formData.password.trim()) {
            validationErrors.password = "Обязательное поле";
        } else if(formData.password.length < 6){
            validationErrors.password = "Пароль должен быть более 6 символов";
        } else if(!/^[a-zA-Z0-9]+$/.test(formData.password)) {
            validationErrors.password = "Пароль должен содержать только латиницу и цифры";
        }
        else if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(formData.email)) {
            validationErrors.email = "Email должен содержать только латинские буквы и цифры";
        }

        if(formData.confirmPassword !== formData.password) {
            validationErrors.confirmPassword = "Пароли не совпадают";
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await fetch('http://127.0.0.1:8000/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    }),
                });

                if (response.ok) {
                    setErrorMessage('');
                    navigate('/'); // Используем navigate для перехода на главную страницу
                } else if (response.status === 409) {
                    const responseData = await response.json();
                    setErrorMessage(responseData.detail); // Вывести сообщение о существующем пользователе
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
            <div>
                <label>Повтор пароля:</label>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder='******'
                    onChange={handleChange}
                />
                {errors.confirmPassword && <span>{errors.confirmPassword}</span>}
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button type="submit">Подтвердить</button>
        </form>
    );
};

export default Registration;
