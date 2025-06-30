import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';
import { Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
    else setError('Token undangan tidak ditemukan di URL.');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!password || !confirmPassword) return setError('Password dan konfirmasi wajib diisi.');
    if (password.length < 8) return setError('Password minimal 8 karakter.');
    if (password !== confirmPassword) return setError('Password tidak cocok.');
    if (!token) return setError('Token tidak valid.');

    setLoading(true);
    try {
      const response = await apiClient.post('/complete-invitation', { token, password });
      if (response.data.success) {
        setSuccessMessage(response.data.message || 'Akun admin berhasil diaktifkan. Silakan login.');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError(response.data.message || 'Gagal mengaktifkan akun admin.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan pada server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', p: 3 }}>
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Aktivasi Akun Admin
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
          {!successMessage && (
            <form onSubmit={handleSubmit}>
              <TextField
                label="Password Baru"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <TextField
                label="Konfirmasi Password"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Aktifkan Akun'}
              </Button>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AcceptInvitation;