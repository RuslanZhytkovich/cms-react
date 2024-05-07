import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrash, faPenSquare, faPlus, faMagnifyingGlass, faTimes} from '@fortawesome/free-solid-svg-icons';
import "../../App.css";
import {InputText} from "primereact/inputtext";
import {FilterMatchMode} from "primereact/api";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"
import {fetchUserData} from "../../utils/profile-info";
import {useNavigate} from "react-router-dom";


const Modal = ({ children, closeModal }) => {
    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    return (
        <div className="modal" onClick={handleModalClick}>
            <div className="modal-content-b">
                <span className="close" onClick={closeModal}>&times;</span>
                {children}
            </div>
        </div>
    );
};



const Home = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
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
        const fetchData = async () => {
            try {
                const data = await fetchUserData();

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

    const clearSearch = () => {
        setFilters({ global: { value: '', matchMode: FilterMatchMode.CONTAINS } });
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
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value, // Или можно использовать russianDate вместо value, если требуется отображать русское представление даты в UI
        });
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <div className="datatable">
                {showModal && (
                    <Modal closeModal={handleCloseModal}>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Дата:
                                <input type="date" name="date" value={formData.date} onChange={handleChange}/>
                            </label>
                            <label>
                                Часы:
                                <input type="number" name="hours" value={formData.hours} onChange={handleChange} min="0"
                                       max="16"/>
                            </label>
                            <label>
                                Описание:
                                <textarea name="comment" value={formData.comment} onChange={handleChange}/>
                            </label>
                            <label>
                                Проект:
                                <select name="project_id" value={formData.project_id} onChange={handleChange}>
                                    <option value="">Выберите проект</option>
                                    {projects.map((project) => (
                                        <option key={project.project_id}
                                                value={project.project_id}>{project.project_name}</option>
                                    ))}
                                </select>
                            </label>
                            <button type="submit">Создать</button>
                        </form>
                    </Modal>
                )}

                <div className="buttons-upper-table">
                    <button
                        className="createbtn"
                        onClick={handleOpenModal}
                    >
                        <FontAwesomeIcon icon={faPlus} style={{ marginRight: '20px' }} />
                         Создать отчет
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
                                style={{ position: 'absolute', left: '430px', top: '50%', transform: 'translateY(-50%)' }}
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
                    value={reports}
                    sortMode="multiple"
                    paginator
                    rows={10}
                    filters={filters}
                    rowsPerPageOptions={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    totalRows={reports.length}
                    emptyMessage="Отчетов не найдено."
                    className="custom-datatable"
                >
                    <Column field="date" header="Дата" sortable/>
                    <Column field="hours" header="Часы" sortable/>
                    <Column field="comment" header="Описание" sortable/>
                    <Column
                        field="project_id"
                        header="Проект"
                        sortable
                        body={(rowData) => `${projectNames[rowData.report_id]}`}
                    />
                    <Column
                        header="Действие"
                        body={(rowData) => (
                            <span className="icon-container">
                <FontAwesomeIcon
                    className="icon"
                    icon={faTrash}
                    onClick={() => handleDeleteReport(rowData.report_id)}
                />
                <FontAwesomeIcon
                    className="icon"
                    icon={faPenSquare}
                    onClick={() => handleEditReport(rowData.report_id)}
                />
            </span>
                        )}
                    />
                </DataTable>
            </div>
        </div>
    );
};

export default Home;

