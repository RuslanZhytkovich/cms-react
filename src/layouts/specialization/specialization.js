import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenSquare, faPlus } from '@fortawesome/free-solid-svg-icons'; // Иконки удаления, редактирования и добавления

const Modal = ({ children, closeModal }) => {
    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    return (
        <div className="modal" onClick={handleModalClick}>
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                {children}
            </div>
        </div>
    );
};

const Specialization = () => {
    const [specializations, setSpecializations] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        specialization_name: '',
    });
    const [editingSpecializationId, setEditingSpecializationId] = useState(null);

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
            <h2>Специализации</h2>
            <button onClick={handleOpenModal}>Добавить специализацию <FontAwesomeIcon icon={faPlus}/></button>
            {showModal && (
                <Modal closeModal={handleCloseModal}>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Специализация:
                            <input type="text" name="specialization_name" value={formData.specialization_name} onChange={handleChange} />
                        </label>
                        {editingSpecializationId ? (
                            <button type="button" onClick={updateSpecialization}>Сохранить изменения</button>
                        ) : (
                            <button type="submit">Добавить специализацию</button>
                        )}
                    </form>
                </Modal>
            )}
            <table className="table">
                <thead>
                <tr>
                    <th>Номер</th>
                    <th>Специализация</th>
                    <th>Действие</th>
                </tr>
                </thead>
                <tbody>
                {specializations.map((specialization, index) => (
                    <tr key={index}>
                        <td>{specialization.specialization_id}</td>
                        <td>{specialization.specialization_name}</td>
                        <td className="icon-container">
                            <FontAwesomeIcon
                                className="icon"
                                icon={faTrash}
                                onClick={() => handleDeleteSpecialization(specialization.specialization_id)}
                            />
                            <FontAwesomeIcon
                                className="icon"
                                icon={faPenSquare}
                                onClick={() => handleEditSpecialization(specialization.specialization_id)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Specialization;
