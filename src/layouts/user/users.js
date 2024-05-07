import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenSquare, faMagnifyingGlass, faTimes } from '@fortawesome/free-solid-svg-icons';
import Modal from "../../components/modal";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { fetchUserData } from "../../utils/profile-info";
import "../../App.css";

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [specializationNames, setSpecializationNames] = useState({});
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [formData, setFormData] = useState({
        role: '',
    });
    const [editingUserId, setEditingUserId] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchUserData();
                console.log(data.current_user);

                setCurrentUserRole(data.current_user.role);
                // Проверяем каждое поле на наличие значения
                for (const key in data.current_user) {
                    if (key !== 'on_bench' && !data.current_user[key]) {
                        // Если хотя бы одно поле, кроме 'on_bench', пустое, выполняем редирект на страницу 'account'
                        navigate('/account');
                        return; // Завершаем выполнение цикла после первого пустого поля
                    }
                }
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        const fetchAccessToken = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    setAccessToken(token);
                } else {
                    console.error('Access token not found in local storage');
                }
            } catch (error) {
                console.error('Error fetching access token:', error);
            }
        };

        fetchAccessToken();
    }, []);

    const fetchSpecializationNameById = async (specializationId) => {
        try {
            const response = await fetch(`http://localhost:8000/specializations/get_by_id/${specializationId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                return data.specialization_name;
            } else {
                console.error('Ошибка при получении имени специализации:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchSpecializationNames = async () => {
            const names = {};
            for (const user of users) {
                const specializationName = await fetchSpecializationNameById(user.specialization_id);
                names[user.user_id] = specializationName;
            }
            setSpecializationNames(names);
        };

        fetchSpecializationNames();
    }, [users]);

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

    const clearSearch = () => {
        setFilters({ global: { value: '', matchMode: FilterMatchMode.CONTAINS } });
    };

    const handleEditUser = async (userId) => {
        setEditingUserId(userId);
        const userToEdit = users.find(user => user.user_id === userId);
        if (userToEdit) {
            setFormData({
                role: userToEdit.role,
            });
            setShowModal(true);
        } else {
            console.error(`Ошибка`);
        }
    };

    const cancelEditUser = () => {
        setEditingUserId(null);
        setFormData({
            role: '',
        });
        setShowModal(false);
    };

    const handleUpdateUser = async () => {
        try {
            const response = await fetch(`http://localhost:8000/users/update/${editingUserId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
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
            handleUpdateUser();
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
            <div className="datatable">
                {showModal && (
                    <Modal closeModal={handleCloseModal}>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Роль:
                                <select name="role" value={formData.role} onChange={handleChange}>
                                    <option value="">Выберите роль</option>
                                    <option value="admin">Администратор</option>
                                    <option value="manager">Менеджер</option>
                                    <option value="developer">Разработчик</option>
                                </select>
                            </label>
                            <button type="submit">Изменить роль</button>
                        </form>
                    </Modal>
                )}

                <div className="buttons-upper-table">
                    <div className="search-prompt" style={{ right: "160px", width: 'calc(100% - 320px)'}}>
                        <InputText
                            placeholder="Напишите что-нибудь"
                            style={{borderRadius: '5px', width: '40%', marginLeft: '50px', paddingLeft: '30px'}}
                            value={filters.global.value}
                            onChange={(e) => setFilters({
                                global: {value: e.target.value, matchMode: FilterMatchMode.CONTAINS}
                            })}
                        />
                        {filters.global.value && (
                            <FontAwesomeIcon
                                icon={faTimes}
                                onClick={clearSearch}
                                style={{ marginLeft: '-20px', top: '50%'}}
                            />
                        )}
                        <FontAwesomeIcon
                            className="icon"
                            icon={faMagnifyingGlass}
                            style={{position: 'absolute', left: '54px', top: '50%', transform: 'translateY(-50%)'}}
                        />
                    </div>
                </div>
                <DataTable
                    value={users}
                    sortMode="multiple"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    totalRows={users.length}
                    emptyMessage="Пользователи не найдены."
                    className="custom-datatable"
                    filters={filters}
                    onFilter={(e) => {
                        const value = e.target.value.toLowerCase();
                        setFilters({
                            ...filters,
                            global: { value: value, matchMode: 'contains' }
                        });
                    }}
                >
                    <Column field="name" header="Имя" sortable />
                    <Column field="last_name" header="Фамилия" sortable />
                    <Column field="email" header="Почта" sortable />
                    <Column field="telegram" header="Телеграм" sortable />
                    <Column field="phone_number" header="Телефон" sortable />
                    <Column
                        header="Статус"
                        body={(rowData) => (
                            <span style={{ color: rowData.on_bench ? "red" : "black" }}>
                                {rowData.on_bench ? "Без проекта" : "На проекте"}
                            </span>
                        )}
                        sortable
                        sortField="on_bench"
                    />
                    <Column
                        field="specialization_id"
                        header="Специализация"
                        sortable
                        body={(rowData) => `${specializationNames[rowData.user_id]}`}
                    />
                    {currentUserRole !== 'developer' && (
                        <Column
                            header="Действие"
                            body={(rowData) => (
                                <span className="icon-container">
                                    <FontAwesomeIcon
                                        className="icon"
                                        icon={faPenSquare}
                                        onClick={() => handleEditUser(rowData.user_id)}
                                    />
                                </span>
                            )}
                        />
                    )}
                </DataTable>
            </div>
        </div>
    );
};

export default Users;
