/**
 * Custom Hook: useUsers
 * Manages user list fetching and operations
 *
 * React 19: No memoization needed - React Compiler handles optimization
 */

import { useState } from 'react';
import userService from '../services/user.service';
import { CreateUserRequest, UpdateUserRequest, User, UserListParams } from '../types/api.types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (params?: UserListParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers(params);
      setUsers(data);
      return data;
    } catch (err: unknown) {
      const errorMessage =
        (err as { error?: { message?: string } }).error?.message || 'Failed to fetch users';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.createUser(data);
      await fetchUsers(); // Refresh list
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as { error?: { message?: string } }).error?.message || 'Failed to create user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, data: UpdateUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.updateUser(userId, data);
      await fetchUsers(); // Refresh list
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as { error?: { message?: string } }).error?.message || 'Failed to update user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.deleteUser(userId);
      await fetchUsers(); // Refresh list
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as { error?: { message?: string } }).error?.message || 'Failed to delete user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.approveUser({ user_id: userId });
      await fetchUsers(); // Refresh list
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as { error?: { message?: string } }).error?.message || 'Failed to approve user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectUser = async (userId: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.rejectUser(userId, { reason });
      await fetchUsers(); // Refresh list
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as { error?: { message?: string } }).error?.message || 'Failed to reject user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    approveUser,
    rejectUser,
  };
};
