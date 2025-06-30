import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from './axiosConfig';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback(async (judul, isi, type = 'info') => {
    try {
      const response = await apiClient.post('/notifikasi-admin/input', {
        judul,
        isi,
        dibaca: 0
      });

      if (response.data.success) {
        // Update unread count
        setUnreadCount(prev => prev + 1);
        
        // Add to notifications list
        const newNotification = {
          id_notifikasi: Date.now(), // Temporary ID
          judul,
          isi,
          dibaca: false,
          waktu_kirim: 'Baru saja',
          type
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 latest
      }
    } catch (error) {
      // If notification creation fails, we can't do much about it
      // The main functionality should still work
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiClient.put(`/notifikasi-admin/mark-read/${notificationId}`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => 
        prev.map(notif => 
          notif.id_notifikasi === notificationId 
            ? { ...notif, dibaca: true }
            : notif
        )
      );
    } catch (error) {
      // Handle error silently
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put('/notifikasi-admin/mark-all-read');
      setUnreadCount(0);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, dibaca: true }))
      );
    } catch (error) {
      // Handle error silently
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiClient.get('/notifikasi');
      if (response.data.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      // Handle error silently
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/notifikasi-admin/unread/count');
      if (response.data.success) {
        setUnreadCount(response.data.data.unread_count || 0);
      }
    } catch (error) {
      // Handle error silently
    }
  }, []);

  const showSuccess = useCallback((message, title = 'Berhasil') => {
    addNotification(title, message, 'success');
  }, [addNotification]);

  const showError = useCallback((message, title = 'Gagal') => {
    addNotification(title, message, 'error');
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Informasi') => {
    addNotification(title, message, 'info');
  }, [addNotification]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    fetchUnreadCount,
    showSuccess,
    showError,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 