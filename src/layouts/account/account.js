import React, { useState, useEffect } from 'react';
import './account.css';

const Account = ({ navigate }) => {
    const [userData, setUserData] = useState(null);
    const [accessToken, setAccessToken] = useState('');
    const [editableUserData, setEditableUserData] = useState(null);
    const [specializations, setSpecializations] = useState([]);
    const [allFieldsFilled, setAllFieldsFilled] = useState(true); // Флаг для проверки заполненности всех полей

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    setAccessToken(token);
                    const response = await fetch('http://localhost:8000/login/test_auth_endpoint', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                        setEditableUserData({ ...data.current_user });
                    } else {
                        console.error('Ошибка при получении данных:', response.statusText);
                    }
                } else {
                    console.error('Access token not found in local storage');
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }
        };

        const fetchSpecializations = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/specializations/get_all', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setSpecializations(data);
                } else {
                    console.error('Ошибка при получении специализаций:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }
        };

        fetchUserData();
        fetchSpecializations();
    }, [accessToken]);

    useEffect(() => {
        // Проверяем, что все поля заполнены
        if (editableUserData) {
            const keys = Object.keys(editableUserData);
            for (const key of keys) {
                // Если какое-то поле пустое, устанавливаем флаг allFieldsFilled в false и выходим из цикла
                if (!editableUserData[key]) {
                    setAllFieldsFilled(false);
                    return;
                }
            }
            // Если все поля заполнены, устанавливаем флаг allFieldsFilled в true
            setAllFieldsFilled(true);
        }
    }, [editableUserData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value;
        setEditableUserData({ ...editableUserData, [name]: inputValue });
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/users/profile/update/${userData.current_user.user_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(editableUserData)
            });
            if (response.ok) {
                alert("Данные успешно обновлены");
            } else {
                console.error('Ошибка при обновлении профиля:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };

    return (
        <div className="container" style={{marginTop: '10px', height: '930px'}}>
            <div className="header">
                <div className="text">Профиль</div>
                <div className="underline"></div>
                {/* Выводим сообщение, если не все поля заполнены */}
                {!allFieldsFilled &&
                    <div className="message" style={{color: 'red'}}>Заполните все данные для дальнейшей работы</div>}
                {allFieldsFilled && <div className="message" style={{color: 'black'}}>Все данные заполнены</div>}
            </div>
            <div className="inputs">
                {editableUserData && (
                    <div className="input">
                        <label htmlFor="name">Имя:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={editableUserData.name || ''}
                            onChange={handleInputChange}
                            title="Введите ваше имя"
                        />
                    </div>
                )}
                {editableUserData && (
                    <div className="input">
                        <label htmlFor="last_name">Фамилия:</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={editableUserData.last_name || ''}
                            onChange={handleInputChange}
                            title="Введите вашу фамилию"
                        />
                    </div>
                )}
                {editableUserData && (
                    <div className="input">
                        <label htmlFor="telegram">Телеграм:</label>
                        <input
                            type="text"
                            id="telegram"
                            name="telegram"
                            value={editableUserData.telegram || ''}
                            onChange={handleInputChange}
                            title="Введите ваш ник в Telegram"
                        />
                    </div>
                )}
                {editableUserData && (
                    <div className="input">
                        <label htmlFor="phone_number">Номер телефона:</label>
                        <input
                            type="text"
                            id="phone_number"
                            name="phone_number"
                            value={editableUserData.phone_number || ''}
                            onChange={handleInputChange}
                            title="Введите ваш номер телефона"
                        />
                    </div>
                )}
                {editableUserData && (
                    <div className="input">
                        <label htmlFor="on_bench">На бенче:</label>
                        <input
                            type="checkbox"
                            id="on_bench"
                            name="on_bench"
                            checked={editableUserData.on_bench || false}
                            onChange={handleInputChange}
                            title="Отметьте, если вы находитесь на бенче"
                        />
                    </div>
                )}
                {editableUserData && (
                    <div className="input">
                        <label htmlFor="specialization">Специализация:</label>
                        <select
                            id="specialization"
                            name="specialization_id"
                            value={editableUserData.specialization_id || ''}
                            onChange={handleInputChange}
                            title="Выберите вашу специализацию"
                        >
                            <option value="">Выберите специализацию</option>
                            {specializations.map(spec => (
                                <option key={spec.specialization_id}
                                        value={spec.specialization_id}>{spec.specialization_name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="submit-container">
                <button type="button" className="submit" onClick={handleUpdateProfile}>Подтвердить</button>
            </div>

        </div>
    );
};

export default Account;
