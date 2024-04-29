import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"
import {faTrash, faPenSquare, faPlus, faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {InputText} from "primereact/inputtext";
import {FilterMatchMode} from "primereact/api";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {fetchUserData} from "../../utils/profile-info";
import {useNavigate} from "react-router-dom"; // Иконки удаления, редактирования и добавления
import Modal from "../../components/modal";
import "../../App.css";

const Customer = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [formData, setFormData] = useState({
        customer_name: '',
    });
    const [editingCustomerId, setEditingCustomerId] = useState(null);

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
                const response = await fetch('http://localhost:8000/customers/get_all', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCustomers(data);
                } else {
                    console.error('Ошибка при получении заказчиков:', response.statusText);
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

    // Обработчик для удаления заказчика
    const handleDeleteCustomer = async (customerId) => {
        try {
            const customerToDelete = customers.find(c => c.customer_id === customerId);
            const confirmDelete = window.confirm(`Вы точно хотите удалить заказчика с именем: ${customerToDelete.customer_name}`);
            if (confirmDelete) {
                const response = await fetch(`http://localhost:8000/customers/soft_delete/${customerId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.ok) {
                    console.log('Заказчик успешно удален');
                    window.location.reload(); // Перезагружаем страницу после успешного удаления
                } else {
                    console.error('Ошибка при удалении заказчика:', response.statusText);
                }
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };

    // Обработчик для редактирования заказчика
    const handleEditCustomer = (customerId) => {
        setEditingCustomerId(customerId);
        const customerToEdit = customers.find(customer => customer.customer_id === customerId);
        setFormData({
            customer_name: customerToEdit.customer_name,
            is_deleted: customerToEdit.is_deleted,
        });
        setShowModal(true);
    };

    // Обработчик для отмены редактирования
    const cancelEditCustomer = () => {
        setEditingCustomerId(null);
        // Очищаем данные формы
        setFormData({
            customer_name: '',
            is_deleted: false,
        });
        setShowModal(false);
    };

    // Обновление заказчика
    const updateCustomer = async () => {
        try {
            const response = await fetch(`http://localhost:8000/customers/update_by_id/${editingCustomerId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                console.log('Заказчик успешно обновлен');
                cancelEditCustomer(); // Отменяем редактирование после успешного обновления
                window.location.reload(); // Перезагружаем страницу после успешного обновления
            } else {
                console.error('Ошибка при обновлении заказчика:', response.statusText);
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

        if (editingCustomerId) {
            updateCustomer();
        } else {
            try {
                const response = await fetch('http://localhost:8000/customers/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(formData)
                });
                if (response.ok) {
                    console.log('Заказчик успешно создан');
                    handleCloseModal(); // Закрываем модальное окно после успешного создания
                    window.location.reload(); // Перезагружаем страницу после успешного создания
                } else {
                    console.error('Ошибка при создании заказчика:', response.statusText);
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
            <h2>Заказчики</h2>
            <button onClick={handleOpenModal}>Добавить заказчика <FontAwesomeIcon icon={faPlus}/></button>
            {showModal && (
                <Modal closeModal={handleCloseModal}>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Имя заказчика:
                            <input type="text" name="customer_name" value={formData.customer_name}
                                   onChange={handleChange}/>
                        </label>
                        {editingCustomerId ? (
                            <button onClick={updateCustomer}>Сохранить изменения</button>
                        ) : (
                            <button type="submit">Добавить заказчика</button>
                        )}
                    </form>
                </Modal>
            )}
            <div style={{position: 'relative'}}>
                <InputText
                    style={{paddingLeft: '2rem',}}
                    onInput={(e) => {
                        setFilters({
                            global: {value: e.target.value, matchMode: FilterMatchMode.CONTAINS},
                        });
                    }}
                />
                <FontAwesomeIcon
                    className="icon"
                    icon={faMagnifyingGlass}
                    style={{position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)'}}
                />
            </div>

            <DataTable
                value={customers}
                sortMode="multiple"
                paginator
                rows={10}
                filters={filters}
                rowsPerPageOptions={[1,2,3,4,5,6,7,8,9,10]}
                totalRows={customers.length}
                emptyMessage="Заказчиков не найдено."
                className="custom-datatable"
            >
                <Column field="customer_id" header="Номер" sortable/>
                <Column field="customer_name" header="Заказчик" sortable/>
                <Column
                    header="Действие"
                    body={(rowData) => (
                        <span className="icon-container">
                <FontAwesomeIcon
                    className="icon"
                    icon={faTrash}
                    onClick={() => handleDeleteCustomer(rowData.customer_id)}
                />
                <FontAwesomeIcon
                    className="icon"
                    icon={faPenSquare}
                    onClick={() => handleEditCustomer(rowData.customer_id)}
                />
            </span>
                    )}
                />
            </DataTable>
            </div>

        </div>
    );
};

export default Customer;
