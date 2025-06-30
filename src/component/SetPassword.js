import React, { useState, useEffect, useRef } from 'react';
import { userApiClient } from '../utils/axiosConfig';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

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
import LockResetIcon from '@mui/icons-material/LockReset';

const SetPassword = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const mounted = useRef(true);
    useAuth(); // Memanggil useAuth untuk memastikan AuthContext aktif

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            if (mounted.current) setError('Token tidak ditemukan di URL. Link mungkin tidak valid.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!username || !newPassword || !confirmPassword) {
            if (mounted.current) setError('Username, password baru, dan konfirmasi password wajib diisi.');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
            if (mounted.current) setError("Username hanya boleh huruf, angka, dan underscore.");
            return;
        }
        if (newPassword.length < 8) {
            if (mounted.current) setError('Password baru minimal 8 karakter.');
            return;
        }
        if (newPassword !== confirmPassword) {
            if (mounted.current) setError('Password baru dan konfirmasi password tidak cocok.');
            return;
        }
        if (!token) {
            if (mounted.current) setError('Token tidak valid atau hilang. Tidak bisa melanjutkan.');
            return;
        }

        if (mounted.current) setLoading(true);
        try {
            const response = await userApiClient.post(`/set-password`, {
                username: username.trim(),
                token: token,
                newPassword: newPassword
            });

            if (response.data.success) {
                if (mounted.current) setSuccessMessage('Password berhasil diatur! Silahkan buka aplikasi PANDA PAM-pay dan login menggunakan email yang sudah didaftarkan dan password yang baru Anda buat. Jika terdapat kendala, silahkan hubungi admin PAM-Pay untuk bantuan lebih lanjut.');
                setTimeout(() => {
                   console.log('Silahkan login pada aplikasi  dengan email dan password baru Anda.');
                }, 3000);
            } else {
                if (mounted.current) setError(response.data.message || 'Gagal mengatur password.');
            }
        } catch (err) {
            console.error('Error saat mengatur password:', err.response ? err.response.data : err.message);
            if (mounted.current) {
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Terjadi kesalahan pada server.');
                }
            }
        } finally {
            if (mounted.current) {
                setLoading(false);
            }
        }
    };


    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                <LockResetIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                    Atur Password Akun Anda
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

                {!successMessage && token && (
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username Baru"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            error={!!error && username === ''}
                            helperText={!!error && username === '' ? "Username wajib diisi" : ""}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="newPassword"
                            label="Password Baru"
                            type="password"
                            id="newPassword"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                            error={!!error && newPassword.length < 8 && newPassword !== ''}
                            helperText={!!error && newPassword.length < 8 && newPassword !== '' ? "Password minimal 8 karakter" : ""}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Konfirmasi Password Baru"
                            type="password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            error={!!error && newPassword !== confirmPassword && confirmPassword !== ''}
                            helperText={!!error && newPassword !== confirmPassword && confirmPassword !== '' ? "Password tidak cocok" : ""}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                            disabled={loading || !token }
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Atur Password'}
                        </Button>
                    </Box>
                )}

                {!token && !error && !successMessage && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography variant="body1">Memverifikasi token...</Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default SetPassword;
