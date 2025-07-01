import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Button, TextField, Box, Container, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../utils/AuthContext';
import apiClient, { initializeCsrfToken } from '../utils/axiosConfig'; // Import apiClient dan initializeCsrfToken

// const API_BASE_URL = process.env.REACT_APP_API_URL; // Tidak lagi diperlukan jika apiClient dikonfigurasi dengan baseURL

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAdminExistence, setCheckingAdminExistence] = useState(true);
    const [adminExists, setAdminExists] = useState(false);
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        const checkAdmin = async () => {
            try {
                if (mounted.current) setCheckingAdminExistence(true);
                const response = await apiClient.get(`/admins/check-existence`); 
                if (mounted.current) {
                    setAdminExists(response.data.hasAdmin);
                }
            } catch (checkError) {
                if (mounted.current) setAdminExists(false);
            } finally {
                if (mounted.current) {
                    setCheckingAdminExistence(false);
                }
            }
        };
        checkAdmin();
        // Inisialisasi CSRF token sebelum login
        initializeCsrfToken();
        return () => {
            mounted.current = false;
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (mounted.current) setLoading(true);

        if (!email || !password) {
            if (mounted.current) {
                setError('Email dan password wajib diisi.');
                setLoading(false);
            }
            return;
        }

        try {
            const response = await apiClient.post(`/login`, {
                email,
                password
            });

            if (response.data.success && response.data.user) {
                loginSuccess(response.data.user); 
                
                if (response.data.user.role === 'super_admin') {
                    navigate("/dashboard");
                } else {
                    if (mounted.current) setError('Akses ditolak. Akun bukan super admin.');
                }
            } else {
                if (mounted.current) setError(response.data.message || 'Login gagal atau data pengguna tidak diterima.');
            }
        } catch (err) {
            if (mounted.current) {
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message || 'Login gagal.');
                } else {
                    setError('Terjadi kesalahan saat mencoba login. Periksa koneksi Anda.');
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
                    <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
                        Selamat Datang
                    </Typography>
                    <Typography component="p" variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                        Login ke PANDA PAM-Pay
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                        <TextField
                            label="Email"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            type="submit"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </Button>
                        {checkingAdminExistence ? (
                            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                                <CircularProgress size={16} /> Memeriksa status admin...
                            </Typography>
                        ) : adminExists ? (
                            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                                <RouterLink to="/forgot-password-admin" style={{ textDecoration: 'none' }}>
                                    <Typography component="span" color="primary.main">Lupa Password?</Typography>
                                </RouterLink>
                            </Typography>
                        ) : (
                            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                                Belum ada akun admin?{' '}
                                <RouterLink to="/register" style={{ textDecoration: 'none' }}>
                                    <Typography component="span" color="primary.main">Daftarkan Admin Baru</Typography>
                                </RouterLink>
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
