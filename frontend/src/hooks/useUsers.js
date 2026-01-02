import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`users/${userId}/`);
        await fetchUsers();
        return true;
      } catch (error) {
        console.error('Error deleting user:', error);
        return false;
      }
    }
    return false;
  };

  const updateUser = async (userId, updateData) => {
    try {
      await api.patch(`users/${userId}/`, updateData);
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    deleteUser,
    updateUser
  };
};