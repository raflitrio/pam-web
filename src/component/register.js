import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';
import {
    Container,
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
        mounted.current = false;
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (mounted.current) setLoading(true);

    if (!username || !email || !password) {
        if (mounted.current) {
            setError('Semua field (username, email, password) wajib diisi.');
            setLoading(false);
        }
        return;
    }

    try {
      
      const response = await apiClient.post(`/request-admin-registration`, {
        username: username,
        email: email,
        password: password
      });

      console.log('Admin Registration Response:', response.data);

      if (response.data.success) {
        if (mounted.current) {
            setSuccessMessage(response.data.message || 'Permintaan registrasi berhasil. Silakan cek email Anda untuk verifikasi.');
            setUsername('');
            setEmail('');
            setPassword('');
        }
      } else {
        if (mounted.current) setError(response.data.message || 'Permintaan registrasi admin gagal.');
      }
    } catch (err) {
      console.error('Admin Registration Error:', err.response ? err.response.data : err.message);
      if (mounted.current) {
        if (err.response && err.response.data && err.response.data.message) {
            setError(err.response.data.message);
        } else if (err.request) {
            setError('Tidak dapat terhubung ke server. Periksa koneksi Anda atau konfigurasi API URL.');
        }
        else {
            setError('Terjadi kesalahan saat memproses permintaan registrasi admin.');
        }
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'background.default',
            p: 3,
        }}
    >
        <Container component="main" maxWidth="xs">
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                }}
            >
                <PersonAddIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
                    Registrasi Admin Baru
                </Typography>
                <Typography component="p" variant="subtitle1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    Isi detail di bawah untuk membuat akun admin baru PANDA PAM-Pay.
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {successMessage && (
                    <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                        {successMessage}
                    </Alert>
                )}

                {!successMessage && (
                    <Box component="form" onSubmit={handleRegister} sx={{ width: '100%', mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Alamat Email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Daftarkan Admin'}
                        </Button>
                        <Typography variant="body2" align="center">
                            Sudah punya akun admin?{' '}
                            <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                                <Typography component="span" color="primary.main">Login di sini</Typography>
                            </RouterLink>
                        </Typography>
                    </Box>
                )}
                 {successMessage && (
                     <Button
                        component={RouterLink}
                        to="/login"
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                    >
                        Kembali ke Login
                    </Button>
                )}
            </Paper>
        </Container>
    </Box>
  );
};

export default Register;
