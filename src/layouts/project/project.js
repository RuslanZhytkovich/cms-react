import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenSquare, faPlus } from '@fortawesome/free-solid-svg-icons';

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

const Project = () => {
    const [projects, setProjects] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        project_name: '',
        start_date: '',
        end_date: '',
        customer_id: '',
        is_deleted: false,
    });
    const [editingProjectId, setEditingProjectId] = useState(null);

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
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:8000/projects/get_all', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data);
                } else {
                    console.error('Ошибка при получении проектов:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            } finally {
                setLoading(false);
            }
        };

        if (accessToken) {
            fetchProjects();
        }
    }, [accessToken]);

    // Обработчик для удаления проекта
    const handleDeleteProject = async (projectId) => {
        try {
            const response = await fetch(`http://localhost:8000/projects/delete/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                console.log('Проект успешно удален');
                window.location.reload(); // Перезагружаем страницу после успешного удаления
            } else {
                console.error('Ошибка при удалении проекта:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };

    // Обработчик для редактирования проекта
    const handleEditProject = (projectId) => {
        setEditingProjectId(projectId);
        const projectToEdit = projects.find(project => project.id === projectId);
        setFormData({
            project_name: projectToEdit.project_name,
            start_date: projectToEdit.start_date,
            end_date: projectToEdit.end_date,
            customer_id: projectToEdit.customer_id,
            is_deleted: projectToEdit.is_deleted,
        });
        setShowModal(true);
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

        if (editingProjectId) {
            try {
                const response = await fetch(`http://localhost:8000/projects/update/${editingProjectId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(formData)
                });
                if (response.ok) {
                    console.log('Проект успешно обновлен');
                    handleCloseModal(); // Закрываем модальное окно после успешного обновления
                    window.location.reload(); // Перезагружаем страницу после успешного обновления
                } else {
                    console.error('Ошибка при обновлении проекта:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }
        } else {
            try {
                const response = await fetch('http://localhost:8000/projects/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(formData)
                });
                if (response.ok) {
                    console.log('Проект успешно создан');
                    handleCloseModal(); // Закрываем модальное окно после успешного создания
                    window.location.reload(); // Перезагружаем страницу после успешного создания
                } else {
                    console.error('Ошибка при создании проекта:', response.statusText);
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
            <h2>Проекты</h2>
            <button onClick={handleOpenModal}>Добавить проект <FontAwesomeIcon icon={faPlus}/></button>
            {showModal && (
                <Modal closeModal={handleCloseModal}>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Название проекта:
                            <input type="text" name="project_name" value={formData.project_name} onChange={handleChange} />
                        </label>
                        <label>
                            Начало проекта:
                            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                        </label>
                        <label>
                            Конец проекта:
                            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                        </label>
                        <label>
                            ID заказчика:
                            <input type="text" name="customer_id" value={formData.customer_id} onChange={handleChange} />
                        </label>
                        <label>
                            Удален ли:
                            <input type="checkbox" name="is_deleted" checked={formData.is_deleted} onChange={handleChange} />
                        </label>
                        {editingProjectId ? (
                            <button onClick={handleSubmit}>Сохранить изменения</button>
                        ) : (
                            <button type="submit">Добавить проект</button>
                        )}
                    </form>
                </Modal>
            )}
            <table className="table">
                <thead>
                <tr>
                    <th>Название проекта</th>
                    <th>Начало проекта</th>
                    <th>Конец проекта</th>
                    <th>ID заказчика</th>
                    <th>Действие</th>
                </tr>
                </thead>
                <tbody>
                {projects.map((project, index) => (
                    <tr key={index}>
                        <td>{project.project_name}</td>
                        <td>{project.start_date}</td>
                        <td>{project.end_date}</td>
                        <td>{project.customer_id}</td>
                        <td className="icon-container">
                            <FontAwesomeIcon
                                className="icon"
                                icon={faTrash}
                                onClick={() => handleDeleteProject(project.id)}
                            />
                            <FontAwesomeIcon
                                className="icon"
                                icon={faPenSquare}
                                onClick={() => handleEditProject(project.id)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Project;
