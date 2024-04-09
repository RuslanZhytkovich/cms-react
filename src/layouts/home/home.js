import React, { useState, useEffect } from 'react';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenSquare, faPlus } from '@fortawesome/free-solid-svg-icons'; // Иконки удаления, редактирования и добавления

const Home = () => {
    const [reports, setReports] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);

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

    // Обработчик для удаления отчета
    const handleDeleteReport = (index) => {
        // Реализуйте логику удаления отчета по индексу
    };

    // Обработчик для редактирования отчета
    const handleEditReport = (index) => {
        // Реализуйте логику редактирования отчета по индексу
    };

    // Обработчик для создания нового отчета
    const handleCreateReport = () => {
        // Реализуйте логику создания нового отчета
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (reports.length === 0) {
        return (
            <div>
                <h2>Главная!</h2>
                <p>Отчетов нету</p>
                <button onClick={handleCreateReport}>Сделать отчет <FontAwesomeIcon icon={faPlus}/></button>
            </div>
        );
    }

    return (
        <div>
            <h2>Главная!</h2>
            <p>Мои отчеты!</p>
            <button onClick={handleCreateReport}>Сделать отчет <FontAwesomeIcon icon={faPlus}/></button>
            <table className="table">
                <thead>
                <tr>
                    <th>Дата</th>
                    <th>Часы</th>
                    <th>Комментарий</th>
                    <th>Проект ID</th>
                    <th>Действие</th>
                </tr>
                </thead>
                <tbody>
                {reports.map((report, index) => (
                    <tr key={index}>
                        <td>{report.date}</td>
                        <td>{report.hours}</td>
                        <td>{report.comment}</td>
                        <td>{report.project_id}</td>
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
