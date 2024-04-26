export const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        const response = await fetch('http://localhost:8000/login/test_auth_endpoint', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Ошибка при получении данных: ${response.statusText}`);
        }
    } else {
        throw new Error('Access token not found in local storage');
    }
};