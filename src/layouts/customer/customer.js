import React, { useState, useEffect } from 'react';
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

const Customer = () => {
    const [customers, setCustomers] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        is_deleted: false,
    });
    const [editingCustomerId, setEditingCustomerId] = useState(null);

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
            <h2>Заказчики</h2>
            <button onClick={handleOpenModal}>Добавить заказчика <FontAwesomeIcon icon={faPlus}/></button>
            {showModal && (
                <Modal closeModal={handleCloseModal}>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Имя заказчика:
                            <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} />
                        </label>
                        <label>
                            Удален ли:
                            <input type="checkbox" name="is_deleted" checked={formData.is_deleted} onChange={handleChange} />
                        </label>
                        {editingCustomerId ? (
                            <button onClick={updateCustomer}>Сохранить изменения</button>
                        ) : (
                            <button type="submit">Добавить заказчика</button>
                        )}
                    </form>
                </Modal>
            )}
            <table className="table">
                <thead>
                <tr>
                    <th>Имя заказчика</th>
                    <th>Действие</th>
                </tr>
                </thead>
                <tbody>
                {customers.map((customer, index) => (
                    <tr key={index}>
                        <td>{customer.customer_name}</td>
                        <td className="icon-container">
                            <FontAwesomeIcon
                                className="icon"
                                icon={faTrash}
                                onClick={() => handleDeleteCustomer(customer.customer_id)}
                            />
                            <FontAwesomeIcon
                                className="icon"
                                icon={faPenSquare}
                                onClick={() => handleEditCustomer(customer.customer_id)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Customer;
