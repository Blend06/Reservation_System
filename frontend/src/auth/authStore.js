import api from '../api/axios';

class AuthStore {
  constructor() {
    this.user = null;
    this.token = localStorage.getItem('token');
  }

  async login(username, password) {
    try {
      const response = await api.post('auth/login/', { username, password });
      this.token = response.data.access;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async register(userData) {
    try {
      const response = await api.post('auth/register/', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return !!this.token;
  }
}

export const authStore = new AuthStore();