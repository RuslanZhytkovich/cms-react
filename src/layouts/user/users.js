import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenSquare } from '@fortawesome/free-solid-svg-icons';

const Modal = ({ children, closeModal }) => {
    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                {children}
            </div>
        </div>
    );
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        last_name: '',
        telegram: '',
        phone_number: '',
        specialization_id: '',
        role: '',
        time_created: '',
        on_bench: false,
        is_deleted: false,
    });
    const [editingUserId, setEditingUserId] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('accessToken');

                const response = await fetch('http://localhost:8000/users/get_all', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                } else {
                    console.error('Ошибка при получении пользователей:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8000/users/soft_delete/${userId}`, {
                method: 'PATCH',
            });
            if (response.ok) {
                console.log('Пользователь успешно удален');
                window.location.reload();
            } else {
                console.error('Ошибка при удалении пользователя:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };

    const handleEditUser = async (userId) => {
        setEditingUserId(userId);
        const userToEdit = users.find(user => user.id === userId);
        if (userToEdit) {
            setFormData({
                username: userToEdit.username,
                email: userToEdit.email,
                role: userToEdit.role,
                is_deleted: userToEdit.is_deleted,
            });
            setShowModal(true);
        } else {
            console.error(`Пользователь с идентификатором ${userId} не найден.`);
        }
    };

    const cancelEditUser = () => {
        setEditingUserId(null);
        setFormData({
            email: '',
            role: '',
            is_deleted: false,
        });
        setShowModal(false);
    };

    const updateUser = async () => {
        try {
            const response = await fetch(`http://localhost:8000/users/update_by_id/${editingUserId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                console.log('Пользователь успешно обновлен');
                cancelEditUser();
                window.location.reload();
            } else {
                console.error('Ошибка при обновлении пользователя:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };


    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (editingUserId) {
            updateUser();
        }
    };

    const handleChange = (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setFormData({
            ...formData,
            [event.target.name]: value
        });
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    return (
        <div>
            <h2>Пользователи</h2>
            {showModal && (
                <Modal closeModal={handleCloseModal}>
                    <form onSubmit={handleSubmit}>

                        <label>
                            Email:
                            <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        </label>
                        <label>
                            Роль:
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="">Выберите роль</option>
                                <option value="admin">Администратор</option>
                                <option value="user">Пользователь</option>
                            </select>
                        </label>
                        <label>
                            Удален ли:
                            <input type="checkbox" name="is_deleted" checked={formData.is_deleted} onChange={handleChange} />
                        </label>
                        {editingUserId ? (
                            <button onClick={handleSubmit}>Сохранить изменения</button>
                        ) : (
                            <button type="submit">Добавить пользователя</button>
                        )}
                    </form>
                </Modal>
            )}
            <table className="table">
                <thead>
                <tr>
                    <th>Идентификатор</th>
                    <th>Имя</th>
                    <th>Фамилия</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Телеграм</th>
                    <th>Номер телефона</th>
                    <th>На бенче</th>
                    <th>Дата регистрации</th>
                    <th>ID специализации</th>
                    <th>Действие</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user, index) => (
                    <tr key={index}>
                        <td>{user.user_id}</td>
                        <td>{user.name}</td>
                        <td>{user.last_name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.telegram}</td>
                        <td>{user.phone_number}</td>
                        <td>{user.on_bench}</td>
                        <td>{user.time_created}</td>
                        <td>{user.specialization_id}</td>
                        <td className="icon-container">
                            <FontAwesomeIcon
                                className="icon"
                                icon={faTrash}
                                onClick={() => handleDeleteUser(user.id)}
                            />
                            <FontAwesomeIcon
                                className="icon"
                                icon={faPenSquare}
                                onClick={() => handleEditUser(user.id)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Users;
