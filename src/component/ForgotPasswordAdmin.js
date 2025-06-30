import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../utils/axiosConfig'; // Ganti import axios
import { Link as RouterLink } from 'react-router-dom';
import { Container, Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

    // const API_BASE_URL = process.env.REACT_APP_API_URL; // Tidak lagi diperlukan jika apiClient dikonfigurasi dengan baseURL

const ForgotPasswordAdmin = () => {
    const [email, setEmail] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!email) {
            setError('Email wajib diisi.');
            return;
        }
        if (mounted.current) setLoading(true);

        try {
            const response = await apiClient.post(`/request-admin-password-reset`, { email }); // Gunakan apiClient
            if (response.data.success) {
                if (mounted.current) setSuccessMessage(response.data.message || 'Link reset password telah dikirim ke email Anda (jika terdaftar).');
            } else {
                if (mounted.current) setError(response.data.message || 'Gagal mengirim permintaan reset password.');
            }
        } catch (err) {
            if (mounted.current) setError(err.response?.data?.message || 'Terjadi kesalahan pada server.');
        } finally {
            if (mounted.current) setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '80vh', p: 3,
            }}
        >
            <Container component="main" maxWidth="xs">
                <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                    <LockResetIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                    <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                        Lupa Password Admin
                    </Typography>
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMessage}</Alert>}

                    {!successMessage && (
                        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
                            <TextField
                                margin="normal" required fullWidth id="email" label="Alamat Email Terdaftar"
                                name="email" autoComplete="email" autoFocus
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={loading}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Kirim Link Reset'}
                            </Button>
                        </Box>
                    )}
                    <Button component={RouterLink} to="/login" fullWidth variant="outlined" sx={{ mt: 1 }}>
                        Kembali ke Login
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};

export default ForgotPasswordAdmin;
