import apiClient from './axiosConfig';

export const sendAdminNotification = async (type, judul, message) => {
  try {
    await apiClient.post('/notifikasi-admin/input', { judul, message });
  } catch (e) {
    // Optional: fallback ke alert jika gagal
    console.error('Failed to send admin notification:', e);
  }
}; 