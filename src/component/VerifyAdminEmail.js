import React, { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Alert, CircularProgress, Button, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import apiClient, { initializeCsrfToken } from '../utils/axiosConfig';


const VerifyAdminEmail = () => {
    const [searchParams] = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Sedang memverifikasi email Anda...');
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setMessage('Token verifikasi tidak ditemukan di URL.');
            setVerificationStatus('error');
            return;
        }

        const verifyEmailAndToken = async () => {
            try {
                // Pastikan CSRF token sudah siap sebelum melakukan POST
                await initializeCsrfToken();

                const response = await apiClient.post(`/verify-admin-email`, { token });
                if (response.data.success) {
                    setMessage(response.data.message || 'Email berhasil diverifikasi! Anda akan diarahkan ke halaman login.');
                    setVerificationStatus('success');
                    setTimeout(() => {
                        navigate('/login');
                    }, 5000); // Beri waktu lebih untuk membaca pesan sukses
                } else {
                    setMessage(response.data.message || 'Verifikasi email gagal.');
                    setVerificationStatus('error');
                }
            } catch (err) {
                const apiErrorMessage = err.response?.data?.message || 'Terjadi kesalahan saat verifikasi email.';
                const csrfRelatedError = err.response?.status === 403 && apiErrorMessage.toLowerCase().includes('csrf');
                setMessage(csrfRelatedError ? `Gagal memverifikasi email karena masalah keamanan (CSRF). Coba muat ulang halaman atau hubungi admin jika masalah berlanjut. Detail: ${apiErrorMessage}` : apiErrorMessage);
                setVerificationStatus('error');
            }
        };
        verifyEmailAndToken();
    }, [searchParams, navigate]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh',
                p: 3,
            }}
        >
            <Container component="main" maxWidth="sm">
                <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                    {verificationStatus === 'verifying' && (
                        <>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography variant="h6">{message}</Typography>
                        </>
                    )}
                    {verificationStatus === 'success' && (
                        <>
                            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>
                            <Button component={RouterLink} to="/login" variant="contained">
                                Ke Halaman Login
                            </Button>
                        </>
                    )}
                    {verificationStatus === 'error' && (
                        <>
                            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{message}</Alert>
                            <Button component={RouterLink} to="/register" variant="outlined" sx={{ mr: 1 }}>
                                Coba Registrasi Lagi
                            </Button>
                            <Button component={RouterLink} to="/login" variant="contained">
                                Ke Halaman Login
                            </Button>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default VerifyAdminEmail;
