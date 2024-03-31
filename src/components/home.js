import React, { useState, useEffect } from 'react';

const Home = () => {
    const [reports, setReports] = useState([]);
    const [accessToken, setAccessToken] = useState('');

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
            }
        };

        if (accessToken) {
            fetchReports();
        }
    }, [accessToken]);

    return (
        <div>
            <h2>Добро пожаловать!</h2>
            <p>Мои отчеты! </p>
            <table>
                <thead>
                <tr>
                    <th>Дата</th>
                    <th>Часы</th>
                    <th>Комментарий</th>
                </tr>
                </thead>
                <tbody>
                {reports.map((report, index) => (
                    <tr key={index}>
                        <td>{report.date}</td>
                        <td>{report.hours}</td>
                        <td>{report.comment}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Home;
