import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenSquare, faPlus } from '@fortawesome/free-solid-svg-icons'; // Иконки удаления, редактирования и добавления
import Modal from "../../components/modal";

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
        customer_name: '', // Включаем поле для имени заказчика
        is_deleted: false,
    });
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [customerNames, setCustomerNames] = useState({});
    const [customers, setCustomers] = useState([]);

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

    useEffect(() => {
        const fetchCustomerNames = async () => {
            const names = {};
            for (const project of projects) {
                const customerName = await fetchCustomerNameById(project.customer_id);
                names[project.project_id] = customerName;
            }
            setCustomerNames(names);
        };

        fetchCustomerNames();
    }, [projects]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch('http://localhost:8000/customers/get_all', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCustomers(data);
                } else {
                    console.error('Ошибка при получении списка заказчиков:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }
        };

        if (accessToken) {
            fetchCustomers();
        }
    }, [accessToken]);

    const fetchCustomerNameById = async (customerId) => {
        try {
            const response = await fetch(`http://localhost:8000/customers/get_by_id/${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                return data.customer_name;
            } else {
                console.error('Ошибка при получении имени заказчика:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
            return null;
        }
    };

    const handleDeleteProject = async (projectId) => {
        try {
            const projectToDelete = projects.find(c => c.project_id === projectId);
            const confirmDelete = window.confirm(`Вы точно хотите проект: ${projectToDelete.project_name}`);
            if (confirmDelete) {
                const response = await fetch(`http://localhost:8000/projects/soft_delete/${projectId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.ok) {
                    console.log('Проект успешно удален');
                    window.location.reload();
                } else {
                    console.error('Ошибка при удалении проекта:', response.statusText);
                }
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };


    const handleEditProject = async (projectId) => {
        setEditingProjectId(projectId);
        const projectToEdit = projects.find(project => project.project_id === projectId);
        if (projectToEdit) {
            const customerName = await fetchCustomerNameById(projectToEdit.customer_id);
            setFormData({
                project_name: projectToEdit.project_name,
                start_date: projectToEdit.start_date,
                end_date: projectToEdit.end_date,
                customer_id: projectToEdit.customer_id,
                customer_name: customerName, // Устанавливаем имя заказчика в форму
                is_deleted: projectToEdit.is_deleted,
            });
            setShowModal(true);
        } else {
            console.error(`Проект с идентификатором ${projectId} не найден.`);
        }
    };

    const cancelEditProject = () => {
        setEditingProjectId(null);
        setFormData({
            project_name: '',
            start_date: '',
            end_date: '',
            customer_id: '',
            customer_name: '', // Очищаем имя заказчика
            is_deleted: false,
        });
        setShowModal(false);
    };

    const updateProject = async () => {
        try {
            const response = await fetch(`http://localhost:8000/projects/update_by_id/${editingProjectId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                console.log('Проект успешно обновлен');
                cancelEditProject();
                window.location.reload();
            } else {
                console.error('Ошибка при обновлении проекта:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (editingProjectId) {
            updateProject();
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
                    handleCloseModal();
                    window.location.reload();
                } else {
                    console.error('Ошибка при создании преокта:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }
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
                            Заказчик:
                            <select name="customer_id" value={formData.customer_id} onChange={handleChange}>
                                <option value="">Выберите заказчика</option>
                                {customers.map(customer => (
                                    <option key={customer.customer_id} value={customer.customer_id}>
                                        {customer.customer_name}
                                    </option>
                                ))}
                            </select>
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
                    <th>Номер</th>
                    <th>Название проекта</th>
                    <th>Начало проекта</th>
                    <th>Конец проекта</th>
                    <th>Имя заказчика</th>
                    <th>Действие</th>
                </tr>
                </thead>
                <tbody>
                {projects.map((project, index) => (
                    <tr key={index}>
                        <td>{project.project_id}</td>
                        <td>{project.project_name}</td>
                        <td>{project.start_date}</td>
                        <td>{project.end_date}</td>
                        <td>{customerNames[project.project_id]}</td>
                        <td className="icon-container">
                            <FontAwesomeIcon
                                className="icon"
                                icon={faTrash}
                                onClick={() => handleDeleteProject(project.project_id)}
                            />
                            <FontAwesomeIcon
                                className="icon"
                                icon={faPenSquare}
                                onClick={() => handleEditProject(project.project_id)}
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
