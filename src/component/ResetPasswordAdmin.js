import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../utils/axiosConfig'; // Menggunakan apiClient
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Container, Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

const ResetPasswordAdmin = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('Token reset password tidak ditemukan di URL.');
        }
        return () => {
            mounted.current = false;
        };
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!newPassword || !confirmPassword) {
            setError('Password baru dan konfirmasi password wajib diisi.'); return;
        }
        if (newPassword.length < 8) {
            setError('Password baru minimal 8 karakter.'); return;
        }
        if (newPassword !== confirmPassword) {
            setError('Password baru dan konfirmasi password tidak cocok.'); return;
        }
        if (!token) {
            setError('Token tidak valid atau hilang.'); return;
        }

        if (mounted.current) setLoading(true);
        try {
            const response = await apiClient.post(`/perform-admin-password-reset`, {
                token: token,
                newPassword: newPassword
            });

            if (response.data.success) {
                if (mounted.current) setSuccessMessage(response.data.message || 'Password berhasil direset! Anda akan diarahkan ke halaman login.');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                if (mounted.current) setError(response.data.message || 'Gagal mereset password.');
            }
        } catch (err) {
            if (mounted.current) setError(err.response?.data?.message || 'Terjadi kesalahan pada server.');
        } finally {
            if (mounted.current) setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', p: 3 }}>
            <Container component="main" maxWidth="xs">
                <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                    <LockResetIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                    <Typography component="h1" variant="h5" sx={{ mb: 2 }}>Reset Password Admin</Typography>
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMessage}</Alert>}

                    {!successMessage && token && (
                        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
                            <TextField margin="normal" required fullWidth name="newPassword" label="Password Baru" type="password"
                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
                            <TextField margin="normal" required fullWidth name="confirmPassword" label="Konfirmasi Password Baru" type="password"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={loading || !token}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                            </Button>
                        </Box>
                    )}
                    {(successMessage || !token) && (
                        <Button component={RouterLink} to="/login" fullWidth variant="outlined" sx={{ mt: 2 }}>
                            Kembali ke Login
                        </Button>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default ResetPasswordAdmin;
