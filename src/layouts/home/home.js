import React, { useState, useEffect } from 'react';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenSquare, faPlus } from '@fortawesome/free-solid-svg-icons'; // Иконки удаления, редактирования и добавления

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

const Home = () => {
    const [reports, setReports] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [projectNames, setProjectNames] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        hours: '',
        comment: '',
        project_id: ''
    });

    const getProjectName = async (projectId) => {
        try {
            const response = await fetch(`http://localhost:8000/projects/get_by_id/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                return data.project_name;
            } else {
                console.error('Ошибка при получении имени проекта:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };

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
        const fetchReports = async () => {
            try {
                const response = await fetch('http://localhost:8000/reports/get_my_reports', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setReports(data);
                } else {
                    console.error('Ошибка при получении отчетов:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            } finally {
                setLoading(false);
            }
        };

        if (accessToken) {
            fetchReports();
        }
    }, [accessToken]);

    useEffect(() => {
        const fetchProjectNames = async () => {
            const names = {};
            for (const report of reports) {
                if (!projectNames[report.project_id]) {
                    const projectName = await getProjectName(report.project_id);
                    names[report.project_id] = projectName;
                }
            }
            setProjectNames(names);
        };

        if (reports.length > 0) {
            fetchProjectNames();
        }
    }, [reports]);

    // Обработчик для удаления отчета
    const handleDeleteReport = (index) => {
        // Реализуйте логику удаления отчета по индексу
    };

    // Обработчик для редактирования отчета
    const handleEditReport = (index) => {
        // Реализуйте логику редактирования отчета по индексу
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

        // Валидация часов от 0 до 24
        const hours = parseInt(formData.hours);
        if (hours < 0 || hours > 24) {
            alert('Пожалуйста, введите количество часов от 0 до 24.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/reports/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                // Успешно создан отчет
                // После успешного создания отчета можно сбросить форму или выполнить другие действия
                console.log('Отчет успешно создан');
                handleCloseModal(); // Закрываем модальное окно после успешного создания отчета
                window.location.reload(); // Обновляем страницу
            } else {
                console.error('Ошибка при создании отчета:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };

    // Обработчик изменения значений формы
    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (reports.length === 0) {
        return (
            <div>
                <h2>Главная!</h2>
                <p>Отчетов нету</p>
                <button onClick={handleOpenModal}>Сделать отчет <FontAwesomeIcon icon={faPlus}/></button>
            </div>
        );
    }

    return (
        <div>
            <h2>Главная!</h2>
            <p>Мои отчеты!</p>
            <button onClick={handleOpenModal}>Сделать отчет <FontAwesomeIcon icon={faPlus}/></button>
            {showModal && (
                <Modal closeModal={handleCloseModal}>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Дата:
                            <input type="text" name="date" value={formData.date} onChange={handleChange} />
                        </label>
                        <label>
                            Часы:
                            <input type="number" name="hours" value={formData.hours} onChange={handleChange} min="0" max="24" />
                        </label>
                        <label>
                            Комментарий:
                            <input type="text" name="comment" value={formData.comment} onChange={handleChange} />
                        </label>
                        <label>
                            Проект ID:
                            <input type="text" name="project_id" value={formData.project_id} onChange={handleChange} />
                        </label>
                        <button type="submit">Отправить</button>
                    </form>
                </Modal>
            )}
            <table className="table">
                <thead>
                <tr>
                    <th>Дата</th>
                    <th>Часы</th>
                    <th>Комментарий</th>
                    <th>Проект</th>
                    <th>Действие</th>
                </tr>
                </thead>
                <tbody>
                {reports.map((report, index) => (
                    <tr key={index}>
                        <td>{report.date}</td>
                        <td>{report.hours}</td>
                        <td>{report.comment}</td>
                        <td>{projectNames[report.project_id]}</td>
                        <td className="icon-container">
                            <FontAwesomeIcon
                                className="icon"
                                icon={faTrash}
                                onClick={() => handleDeleteReport(index)}
                            />
                            <FontAwesomeIcon
                                className="icon"
                                icon={faPenSquare}
                                onClick={() => handleEditReport(index)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Home;
