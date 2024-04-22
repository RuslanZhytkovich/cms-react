import React, { useState, useEffect } from 'react';
import './Home.css';
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

const Home = () => {
    const [reports, setReports] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        hours: '',
        comment: '',
        project_id: '',
    });
    const [editingReportId, setEditingReportId] = useState(null);
    const [projectNames, setProjectNames] = useState({});
    const [projects, setProjects] = useState([]);

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
                    console.error('Error fetching reports:', response.statusText);
                }
            } catch (error) {
                console.error('Error executing request:', error);
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
                const projectName = await fetchProjectNameById(report.project_id);
                names[report.report_id] = projectName;
            }
            setProjectNames(names);
        };

        fetchProjectNames();
    }, [reports]);

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
                    console.error('Error fetching projects:', response.statusText);
                }
            } catch (error) {
                console.error('Error executing request:', error);
            }
        };

        if (accessToken) {
            fetchProjects();
        }
    }, [accessToken]);

    const fetchProjectNameById = async (projectId) => {
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
                console.error('Error fetching project name:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error executing request:', error);
            return null;
        }
    };

    const handleDeleteReport = async (reportId) => {
        try {
            const confirmDelete = window.confirm(`Are you sure you want to delete report with ID: ${reportId}`);
            if (confirmDelete) {
                const response = await fetch(`http://localhost:8000/reports/soft_delete/${reportId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.ok) {
                    alert('Отчет успешно удален');
                    const updatedReports = reports.filter(report => report.report_id !== reportId);
                    setReports(updatedReports);
                } else {
                    console.error('Error deleting report:', response.statusText);
                }
            }
        } catch (error) {
            console.error('Error executing request:', error);
        }
    };

    const handleEditReport = async (reportId) => {
        setEditingReportId(reportId);
        const reportToEdit = reports.find(report => report.report_id === reportId);
        if (reportToEdit) {
            setFormData({
                date: reportToEdit.date,
                hours: reportToEdit.hours,
                comment: reportToEdit.comment,
                project_id: reportToEdit.project_id,
                user_id: reportToEdit.user_id,
            });
            setShowModal(true);
        } else {
            console.error(`Report with id ${reportId} not found.`);
        }
    };

    const cancelEditReport = () => {
        setEditingReportId(null);
        setFormData({
            date: '',
            hours: '',
            comment: '',
            project_id: '',
        });
        setShowModal(false);
    };

    const updateReport = async () => {
        try {
            const response = await fetch(`http://localhost:8000/reports/update_by_id/${editingReportId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                console.log('Report successfully updated');
                cancelEditReport();
                window.location.reload();
            } else {
                console.error('Error updating report:', response.statusText);
            }
        } catch (error) {
            console.error('Error executing request:', error);
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

        if (editingReportId) {
            updateReport();
        } else {
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
                    console.log('Report successfully created');
                    handleCloseModal();
                    window.location.reload();
                } else {
                    console.error('Error creating report:', response.statusText);
                }
            } catch (error) {
                console.error('Error executing request:', error);
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
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2>Отчеты</h2>
            <button onClick={handleOpenModal}>Создать отчет <FontAwesomeIcon icon={faPlus}/></button>
            {showModal && (
                <Modal closeModal={handleCloseModal}>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Date:
                            <input type="date" name="date" value={formData.date} onChange={handleChange} />
                        </label>
                        <label>
                            Hours:
                            <input type="number" name="hours" value={formData.hours} onChange={handleChange} min="0" max="24" />
                        </label>
                        <label>
                            Comment:
                            <input type="text" name="comment" value={formData.comment} onChange={handleChange} />
                        </label>
                        <label>
                            Project:
                            <select name="project_id" value={formData.project_id} onChange={handleChange}>
                                <option value="">Select project</option>
                                {projects.map((project) => (
                                    <option key={project.project_id} value={project.project_id}>{project.project_name}</option>
                                ))}
                            </select>
                        </label>
                        <button type="submit">Submit</button>
                    </form>
                </Modal>
            )}
            <table className="table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Comment</th>
                    <th>Project</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {reports.map((report, index) => (
                    <tr key={index}>
                        <td>{report.report_id}</td>
                        <td>{report.date}</td>
                        <td>{report.hours}</td>
                        <td>{report.comment}</td>
                        <td>{projectNames[report.report_id]}</td>
                        <td className="icon-container">
                            <FontAwesomeIcon
                                className="icon"
                                icon={faTrash}
                                onClick={() => handleDeleteReport(report.report_id)}
                            />
                            <FontAwesomeIcon
                                className="icon"
                                icon={faPenSquare}
                                onClick={() => handleEditReport(report.report_id)}
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
