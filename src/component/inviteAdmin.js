import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../utils/axiosConfig';
import {
    Container,
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { UserPlus as UserPlusIcon } from 'react-feather';
import { useTheme } from '@mui/material/styles';
import { sendAdminNotification } from '../utils/adminNotification';
import { useAuth } from '../utils/AuthContext';

const InviteAdmin = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const mounted = useRef(true);
    const theme = useTheme();
    const { userData } = useAuth();
    const [role, setRole] = useState('admin');

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
        if (!mounted.current) return;
        setLoading(true);

        if (!username.trim() || !email.trim() || (userData && userData.role === 'super_admin' && !role)) {
            if (mounted.current) {
                setError('Username, Email, dan Role wajib diisi.');
                setLoading(false);
            }
            return;
        }

        try {
            const response = await apiClient.post(`/invite-new-admin`, {
                username: username.trim(),
                email: email.trim(),
                role: userData && userData.role === 'super_admin' ? role : 'admin',
            });

            if (response.data.success) {
                if (mounted.current) {
                    setSuccessMessage(response.data.message || 'Undangan admin berhasil dikirim. Admin baru perlu mengecek email mereka.');
                    setUsername('');
                    setEmail('');
                    if (userData && userData.role === 'super_admin') setRole('admin');
                    await sendAdminNotification('Input Berhasil', 'Data pelanggan berhasil diinput');
                }
            } else {
                if (mounted.current) setError(response.data.message || 'Gagal mengirim undangan admin.');
                await sendAdminNotification('Input Gagal', 'Data pelanggan gagal diinput');
            }
        } catch (err) {
            console.error('Invite Admin Error:', err.response ? err.response.data : err.message);
            if (mounted.current) {
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else if (err.request) {
                    setError('Tidak dapat terhubung ke server. Periksa koneksi Anda atau konfigurasi API URL.');
                } else {
                    setError('Terjadi kesalahan saat memproses permintaan undangan admin.');
                }
                await sendAdminNotification('Input Gagal', 'Data pelanggan gagal diinput');
            }
        } finally {
            if (mounted.current) {
                setLoading(false);
            }
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ padding: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <UserPlusIcon size={40} color={theme.palette.primary.main} />
                    <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
                        Undang Admin Baru
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                {successMessage && (
                    <Alert severity="success" sx={{ width: '100%', mb: 2 }} onClose={() => setSuccessMessage('')}>
                        {successMessage}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="username"
                                label="Username Calon Admin"
                                name="username"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                helperText="Username unik untuk admin baru."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                type="email"
                                id="email"
                                label="Email Calon Admin"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                helperText="Email aktif untuk pengiriman link undangan."
                            />
                        </Grid>
                        {userData && userData.role === 'super_admin' && (
                          <Grid item xs={12}>
                            <FormControl fullWidth required>
                              <InputLabel id="role-label">Role</InputLabel>
                              <Select
                                labelId="role-label"
                                id="role"
                                value={role}
                                label="Role"
                                onChange={(e) => setRole(e.target.value)}
                                disabled={loading}
                              >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="super_admin">Super Admin</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        )}
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, py: 1.5 }}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UserPlusIcon size={20} />}
                    >
                        {loading ? 'Mengirim Undangan...' : 'Kirim Undangan Admin'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default InviteAdmin;
