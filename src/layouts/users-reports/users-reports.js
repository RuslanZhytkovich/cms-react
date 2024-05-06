import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faTimes } from '@fortawesome/free-solid-svg-icons';
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column"
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext"
import { useNavigate } from "react-router-dom";
import { fetchUserData } from "../../utils/profile-info";
import "../../App.css";

const UsersReports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchUserData();
                for (const key in data.current_user) {
                    if (key !== 'on_bench' && !data.current_user[key]) {
                        navigate('/account');
                        return;
                    }
                }
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error('Access token not found in local storage');
                    return;
                }

                const reportsResponse = await fetch('http://localhost:8000/reports/get_all', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (reportsResponse.ok) {
                    const reportsData = await reportsResponse.json();
                    const updatedReports = await Promise.all(reportsData.map(async (report) => {
                        const user = await fetchUserById(report.user_id, token);
                        const projectName = await fetchProjectById(report.project_id, token);
                        return {
                            ...report,
                            user,
                            projectName
                        };
                    }));
                    setReports(updatedReports);
                    setLoading(false);
                    localStorage.setItem('reports', JSON.stringify(updatedReports));
                } else {
                    console.error('Ошибка при получении отчётов:', reportsResponse.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchProjectById = async (projectId, token) => {
        try {
            const response = await fetch(`http://localhost:8000/projects/get_by_id/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                return data.project_name;
            } else {
                console.error('Error fetching project:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error executing request:', error);
            return null;
        }
    };

    const fetchUserById = async (userId, token) => {
        try {
            const response = await fetch(`http://localhost:8000/users/get_by_id/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                return { name: data.name, last_name: data.last_name, email: data.email };
            } else {
                console.error('Error fetching user data:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error executing request:', error);
            return null;
        }
    };

    const clearSearch = () => {
        setFilters({ global: { value: '', matchMode: FilterMatchMode.CONTAINS } });
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    return (
        <div>
            <div className="datatable">
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
                    value={reports}
                    sortMode="multiple"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    totalRows={reports.length}
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
                    <Column
                        field="user.email"
                        header="Email"
                        sortable
                        body={(rowData) => rowData.user ? rowData.user.email : ''}
                    />
                    <Column
                        field="user.name"
                        header="Имя"
                        sortable
                        body={(rowData) => rowData.user ? rowData.user.name : ''}
                    />
                    <Column
                        field="user.last_name"
                        header="Фамилия"
                        sortable
                        body={(rowData) => rowData.user ? rowData.user.last_name : ''}
                    />
                    <Column
                        field="date"
                        header="Дата"
                        sortable
                    />
                    <Column
                        field="comment"
                        header="Описание"
                        sortable
                    />
                    <Column
                        field="hours"
                        header="Часы"
                        sortable
                    />
                    <Column
                        field="projectName"
                        header="Проект"
                        sortable
                        body={(rowData) => rowData.projectName || ''}
                    />
                </DataTable>
            </div>
        </div>
    );
};

export default UsersReports;
