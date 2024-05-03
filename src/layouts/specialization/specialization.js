import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrash, faPenSquare, faPlus, faMagnifyingGlass, faTimes} from '@fortawesome/free-solid-svg-icons'; // Иконки удаления, редактирования и добавления
import Modal from "../../components/modal";
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column"
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext"
import {useNavigate} from "react-router-dom";
import {fetchUserData} from "../../utils/profile-info";
import "../../App.css";

const Specialization = () => {

    const navigate = useNavigate();
    const [specializations, setSpecializations] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [formData, setFormData] = useState({
        specialization_name: '',
    });

    const clearSearch = () => {
        setFilters({ global: { value: '', matchMode: FilterMatchMode.CONTAINS } });
    };

    const [editingSpecializationId, setEditingSpecializationId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchUserData();
                console.log(data.current_user);

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
    }, []);


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

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch('http://localhost:8000/specializations/get_all', {
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
            } finally {
                setLoading(false);
            }
        };

        if (accessToken) {
            fetchCustomers();
        }
    }, [accessToken]);

    // Обработчик для удаления специализации
    const handleDeleteSpecialization = async (specializationId) => {
        try {
            const specializationToDelete = specializations.find(c => c.specialization_id === specializationId);
            const confirmDelete = window.confirm(`Вы точно хотите удалить специализацию с именем: ${specializationToDelete.specialization_name}`);
            if (confirmDelete) {
                const response = await fetch(`http://localhost:8000/specializations/soft_delete/${specializationId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.ok) {
                    console.log('Специализация успешно удалена');
                    setSpecializations(specializations.filter(specialization => specialization.specialization_id !== specializationId));
                } else {
                    console.error('Ошибка при удалении специализации:', response.statusText);
                }
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };

    // Обработчик для редактирования специализации
    const handleEditSpecialization = (specializationId) => {
        setEditingSpecializationId(specializationId);
        const specializationToEdit = specializations.find(specialization => specialization.specialization_id === specializationId);
        setFormData({
            specialization_name: specializationToEdit.specialization_name,
        });
        setShowModal(true);
    };

    // Обработчик для отмены редактирования
    const cancelEditSpecialization = () => {
        setEditingSpecializationId(null);
        // Очищаем данные формы
        setFormData({
            specialization_name: '',
        });
        setShowModal(false);
    };

    // Обновление специализации
    const updateSpecialization = async () => {
        try {
            const response = await fetch(`http://localhost:8000/specializations/update_by_id/${editingSpecializationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                console.log('Специализация успешно обновлена');
                cancelEditSpecialization(); // Отменяем редактирование после успешного обновления
                window.location.reload(); // Перезагружаем страницу после успешного создания
            } else {
                console.error('Ошибка при обновлении специализации:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };

    // Обработчик для открытия модального окна
    const handleOpenModal = () => {
        setShowModal(true);
    };

    // Обработчик для закрытия модального окна
    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Обработчик для отправки формы
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (editingSpecializationId) {
            updateSpecialization();
        } else {
            try {
                const response = await fetch('http://localhost:8000/specializations/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(formData)
                });
                if (response.ok) {
                    console.log('Специализация успешно создан');
                    handleCloseModal(); // Закрываем модальное окно после успешного создания
                    window.location.reload(); // Перезагружаем страницу после успешного создания
                } else {
                    console.error('Ошибка при создании специализации:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }
        }
    };


    // Обработчик изменения значений формы
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
                                Специализация:
                                <input type="text" name="specialization_name" value={formData.specialization_name}
                                       onChange={handleChange}/>
                            </label>
                            {editingSpecializationId ? (
                                <button type="button" onClick={updateSpecialization}>Сохранить изменения</button>
                            ) : (
                                <button type="submit">Добавить специализацию</button>
                            )}
                        </form>
                    </Modal>
                )}


                <div className="buttons-upper-table">
                    <button
                        className="createbtn"
                        onClick={handleOpenModal}
                    >
                        <FontAwesomeIcon icon={faPlus} style={{marginRight: '20px'}}/>
                        Добавить специализацию
                    </button>
                    <div className="search-prompt" style={{position: 'relative', width: 'calc(100% - 120px)'}}>
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
                                style={{position: 'absolute', left: '430px', top: '50%', transform: 'translateY(-50%)'}}
                            />

                        )}
                        <FontAwesomeIcon
                            className="icon"
                            icon={faMagnifyingGlass}
                            style={{position: 'absolute', left: '55px', top: '50%', transform: 'translateY(-50%)'}}
                        />
                    </div>
                </div>


                <DataTable
                    value={specializations}
                    sortMode="multiple"
                    paginator
                    rows={10}
                    filters={filters}
                    rowsPerPageOptions={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    totalRows={specializations.length}
                    emptyMessage="Специализаций не найдено."
                    className="custom-datatable"
                >
                    <Column field="specialization_id" header="Номер" sortable/>
                    <Column field="specialization_name" header="Специализация" sortable/>
                    <Column
                        header="Действие"
                        body={(rowData) => (
                            <span className="icon-container">
                <FontAwesomeIcon
                    className="icon"
                    icon={faTrash}
                    onClick={() => handleDeleteSpecialization(rowData.specialization_id)}
                />
                <FontAwesomeIcon
                    className="icon"
                    icon={faPenSquare}
                    onClick={() => handleEditSpecialization(rowData.specialization_id)}
                />
            </span>
                        )}
                    />
                </DataTable>
            </div>

        </div>
    );
};

export default Specialization;
