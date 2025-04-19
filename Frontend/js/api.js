class ApiService {
    constructor() {
        this.baseUrl = '/api';
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Something went wrong');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.token = response.token;
        localStorage.setItem('token', response.token);
        return response;
    }

    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // Product endpoints
    async getProducts(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        return await this.request(`/products?${queryParams}`);
    }

    async getProduct(id) {
        return await this.request(`/products/${id}`);
    }

    async searchProducts(query) {
        return await this.request(`/products/search?q=${encodeURIComponent(query)}`);
    }

    // Order endpoints
    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return await this.request('/orders/my-orders');
    }

    async getOrder(id) {
        return await this.request(`/orders/${id}`);
    }

    async cancelOrder(id) {
        return await this.request(`/orders/${id}/cancel`, {
            method: 'PUT'
        });
    }

    // Payment endpoints
    async createPaymentIntent(orderId) {
        return await this.request(`/payments/create-payment-intent`, {
            method: 'POST',
            body: JSON.stringify({ orderId })
        });
    }

    async savePaymentMethod(paymentMethodId) {
        return await this.request('/payments/save-payment-method', {
            method: 'POST',
            body: JSON.stringify({ paymentMethodId })
        });
    }

    async getPaymentHistory() {
        return await this.request('/payments/history');
    }

    // Helper methods
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
    }
}

// Create a singleton instance
const api = new ApiService();
export default api; 