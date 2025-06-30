import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/axiosConfig';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    Divider,
    Grid
} from '@mui/material';
import { useAuth } from '../utils/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Kelompok() {
    const [namaKelompok, setNamaKelompok] = useState('');
    const [subKelompok, setSubKelompok] = useState('');
    const [editingKelompokId, setEditingKelompokId] = useState(null);

    const [namaBlok, setNamaBlok] = useState('');
    const [batasBawah, setBatasBawah] = useState('');
    const [batasAtas, setBatasAtas] = useState('');
    const [keteranganBlok, setKeteranganBlok] = useState('');
    const [editingBlokId, setEditingBlokId] = useState(null);

    const [kelompokList, setKelompokList] = useState([]);
    const [isLoadingKelompokList, setIsLoadingKelompokList] = useState(false);
    const [errorKelompokList, setErrorKelompokList] = useState(null);

    const [blokList, setBlokList] = useState([]);
    const [isLoadingBlokList, setIsLoadingBlokList] = useState(false);
    const [errorBlokList, setErrorBlokList] = useState(null);

    const [isSubmittingKelompok, setIsSubmittingKelompok] = useState(false);
    const [isSubmittingBlok, setIsSubmittingBlok] = useState(false);

    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
    const [selectedInputType, setSelectedInputType] = useState('');
    
    const { isAuthenticated } = useAuth();

    const showNotification = (message, severity = 'info') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const fetchKelompokData = useCallback(async () => {
        setIsLoadingKelompokList(true);
        setErrorKelompokList(null);
        if (!isAuthenticated) {
            setErrorKelompokList("Autentikasi diperlukan.");
            setIsLoadingKelompokList(false);
            return;
        }
        try {
            const response = await apiClient.get(`/kelompok`);
            const data = response.data;
            if (data.success) {
                setKelompokList(data.data || []);
            } else {
                setErrorKelompokList(data.message || "Gagal memuat data kelompok pelanggan.");
            }
        } catch (error) {
            console.error("Error fetching kelompok data:", error);
            setErrorKelompokList(error.response?.data?.message || "Terjadi kesalahan jaringan saat memuat data kelompok pelanggan.");
        } finally {
            setIsLoadingKelompokList(false);
        }
    }, [isAuthenticated]);

    const fetchBlokData = useCallback(async () => {
        setIsLoadingBlokList(true);
        setErrorBlokList(null);
        if (!isAuthenticated) {
            setErrorBlokList("Autentikasi diperlukan.");
            setIsLoadingBlokList(false);
            return;
        }
        try {
            const response = await apiClient.get(`/blok`);
            const data = response.data;
            if (data.success) {
                setBlokList(data.data || []);
            } else {
                setErrorBlokList(data.message || "Gagal memuat data blok konsumsi.");
            }
        } catch (error) {
            console.error("Error fetching blok data:", error);
            setErrorBlokList(error.response?.data?.message || "Terjadi kesalahan jaringan saat memuat data blok konsumsi.");
        } finally {
            setIsLoadingBlokList(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchKelompokData();
            fetchBlokData();
        }
    }, [isAuthenticated, fetchKelompokData, fetchBlokData]);

    const handleSubmitKelompok = async (e) => {
        if (e) e.preventDefault();
        setIsSubmittingKelompok(true);
        setErrorKelompokList(null);

        if (!namaKelompok || !subKelompok) {
            showNotification('Nama Kelompok dan Sub Kelompok wajib diisi.', 'error');
            setIsSubmittingKelompok(false);
            return;
        }

        if (!isAuthenticated) {
            showNotification('Autentikasi gagal. Silakan login kembali.', 'error');
            setIsSubmittingKelompok(false);
            return;
        }

        const url = editingKelompokId
            ? `/kelompok/update/${editingKelompokId}`
            : `/kelompok/input`;
        
        const payload = { nama_kelompok: namaKelompok, sub_kelompok: subKelompok };

        try {
            let response;
            if (editingKelompokId) {
                response = await apiClient.put(url, payload);
            } else {
                response = await apiClient.post(url, payload);
            }
            const data = response.data;

            if (data.success) {
                showNotification(editingKelompokId ? 'Data Kelompok berhasil diperbarui.' : 'Data Kelompok berhasil disimpan.', 'success');
                setNamaKelompok('');
                setSubKelompok('');
                setEditingKelompokId(null);
                setSelectedInputType('');
                fetchKelompokData();
            } else {
                showNotification(data.message || (editingKelompokId ? 'Gagal memperbarui data kelompok.' : 'Gagal menyimpan data kelompok.'), 'error');
            }
        } catch (error) {
            console.error('Error submitting kelompok:', error);
            showNotification(error.response?.data?.message || (editingKelompokId ? 'Kesalahan jaringan saat memperbarui data kelompok.' : 'Kesalahan jaringan saat menyimpan data kelompok.'), 'error');
        } finally {
            setIsSubmittingKelompok(false);
        }
    };

    const handleEditKelompok = (kelompok) => {
        setEditingKelompokId(kelompok.id_kelompok);
        setNamaKelompok(kelompok.nama_kelompok);
        setSubKelompok(kelompok.sub_kelompok);
        setSelectedInputType('kelompok');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEditKelompok = () => {
        setEditingKelompokId(null);
        setNamaKelompok('');
        setSubKelompok('');
        setSelectedInputType('');
    };

    const handleDeleteKelompok = async (idKelompok) => {
        if (!isAuthenticated) {
            showNotification('Autentikasi gagal. Silakan login kembali.', 'error');
            return;
        }
        if (window.confirm('Apakah Anda yakin ingin menghapus kelompok ini? Ini mungkin mempengaruhi data tarif terkait.')) {
            setIsSubmittingKelompok(true);
            try {
                const response = await apiClient.delete(`/kelompok/delete/${idKelompok}`);
                const data = response.data;
                showNotification(data.message, data.success ? 'success' : 'error');
                if (data.success) {
                    fetchKelompokData();
                    if (editingKelompokId === idKelompok) {
                        setEditingKelompokId(null);
                        setNamaKelompok('');
                        setSubKelompok('');
                        setSelectedInputType('');
                    }
                }
            } catch (error) {
                showNotification(error.response?.data?.message || 'Kesalahan jaringan saat menghapus kelompok.', 'error');
            } finally {
                setIsSubmittingKelompok(false);
            }
        }
    };

    const handleSubmitBlok = async (e) => {
        if (e) e.preventDefault();
        setIsSubmittingBlok(true);
        setErrorBlokList(null);

        if (!namaBlok || batasBawah === '' || !keteranganBlok) {
            showNotification('Nama Blok, Batas Bawah, dan Keterangan Blok wajib diisi.', 'error');
            setIsSubmittingBlok(false);
            return;
        }

        const numBatasBawah = parseFloat(batasBawah);
        let apiBatasAtas = null;

        if (isNaN(numBatasBawah)) {
            showNotification('Batas Bawah harus berupa angka.', 'error');
            setIsSubmittingBlok(false);
            return;
        }

        if (batasAtas !== '') {
            apiBatasAtas = parseFloat(batasAtas);
            if (isNaN(apiBatasAtas)) {
                showNotification('Jika Batas Atas diisi, nilainya harus berupa angka.', 'error');
                setIsSubmittingBlok(false);
                return;
            }
            if (numBatasBawah >= apiBatasAtas) {
                showNotification('Batas Bawah harus lebih kecil dari Batas Atas (jika diisi).', 'error');
                setIsSubmittingBlok(false);
                return;
            }
        }

        if (!isAuthenticated) {
            showNotification('Autentikasi gagal. Silakan login kembali.', 'error');
            setIsSubmittingBlok(false);
            return;
        }

        const url = editingBlokId
            ? `/blok/update/${editingBlokId}`
            : `/blok/input`;
        
        const payload = { nama_blok: namaBlok, batas_bawah: numBatasBawah, batas_atas: apiBatasAtas, keterangan_blok: keteranganBlok };

        try {
            let response;
            if (editingBlokId) {
                response = await apiClient.put(url, payload);
            } else {
                response = await apiClient.post(url, payload);
            }
            const data = response.data;
            if (data.success) {
                showNotification(editingBlokId ? 'Data Blok berhasil diperbarui.' : 'Data Blok berhasil disimpan.', 'success');
                setNamaBlok('');
                setBatasBawah('');
                setBatasAtas('');
                setKeteranganBlok('');
                setEditingBlokId(null);
                setSelectedInputType('');
                fetchBlokData();
            } else {
                showNotification(data.message || (editingBlokId ? 'Gagal memperbarui data blok.' : 'Gagal menyimpan data blok.'), 'error');
            }
        } catch (error) {
            console.error('Error submitting blok:', error);
            showNotification(error.response?.data?.message || (editingBlokId ? 'Kesalahan jaringan saat memperbarui data blok.' : 'Kesalahan jaringan saat menyimpan data blok.'), 'error');
        } finally {
            setIsSubmittingBlok(false);
        }
    };

    const handleEditBlok = (blok) => {
        setEditingBlokId(blok.id_blok);
        setNamaBlok(blok.nama_blok);
        setBatasBawah(String(blok.batas_bawah));
        setBatasAtas(blok.batas_atas === null ? '' : String(blok.batas_atas));
        setKeteranganBlok(blok.keterangan_blok);
        setSelectedInputType('blok');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEditBlok = () => {
        setEditingBlokId(null);
        setNamaBlok('');
        setBatasBawah('');
        setBatasAtas('');
        setKeteranganBlok('');
        setSelectedInputType('');
    };

    const handleDeleteBlok = async (idBlok) => {
        if (!isAuthenticated) {
            showNotification('Autentikasi gagal. Silakan login kembali.', 'error');
            return;
        }
        if (window.confirm('Apakah Anda yakin ingin menghapus blok konsumsi ini? Ini mungkin mempengaruhi data tarif terkait.')) {
            setIsSubmittingBlok(true);
            try {
                const response = await apiClient.delete(`/blok/delete/${idBlok}`);
                const data = response.data;
                showNotification(data.message, data.success ? 'success' : 'error');
                if (data.success) {
                    fetchBlokData();
                    if (editingBlokId === idBlok) {
                        setEditingBlokId(null);
                        setNamaBlok('');
                        setBatasBawah('');
                        setBatasAtas('');
                        setKeteranganBlok('');
                        setSelectedInputType('');
                    }
                }
            } catch (error) {
                showNotification(error.response?.data?.message || 'Kesalahan jaringan saat menghapus blok konsumsi.', 'error');
            } finally {
                setIsSubmittingBlok(false);
            }
        }
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" sx={{ 
                    color: 'white', 
                    fontWeight: 700, 
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    Atur Kelompok & Blok
                </Typography>
                <Typography variant="h6" sx={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontWeight: 400 
                }}>
                    Kelola data kelompok pelanggan dan blok konsumsi
                </Typography>
            </Box>

            {/* Input Type Selection */}
            <Card sx={{ 
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                mb: 3
            }}>
                <CardContent sx={{ p: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>Pilih Jenis Input</InputLabel>
                        <Select
                            value={selectedInputType}
                            onChange={(e) => setSelectedInputType(e.target.value)}
                            label="Pilih Jenis Input"
                        >
                            <MenuItem value="kelompok">Kelompok Pelanggan</MenuItem>
                            <MenuItem value="blok">Blok Konsumsi</MenuItem>
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Form Kelompok Pelanggan */}
            {selectedInputType === 'kelompok' && (
                <Card sx={{ 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    mb: 3
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333', display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 1, p: 0.5, mr: 1.5 }}>
                                <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            {editingKelompokId ? 'Update Kelompok Pelanggan' : 'Input Kelompok Pelanggan'}
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Nama Kelompok"
                                    value={namaKelompok}
                                    onChange={(e) => setNamaKelompok(e.target.value)}
                                    fullWidth
                                    placeholder="Contoh: Rumah Tangga A"
                                    required
                                    disabled={isSubmittingKelompok || isSubmittingBlok}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Sub Kelompok / Deskripsi"
                                    value={subKelompok}
                                    onChange={(e) => setSubKelompok(e.target.value)}
                                    fullWidth
                                    placeholder="Contoh: Subsidi"
                                    required
                                    disabled={isSubmittingKelompok || isSubmittingBlok}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button 
                                variant="contained" 
                                onClick={handleSubmitKelompok} 
                                size="small"
                                disabled={isSubmittingKelompok || isSubmittingBlok}
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                                    }
                                }}
                                startIcon={isSubmittingKelompok ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {isSubmittingKelompok ? "Menyimpan..." : (editingKelompokId ? "Update Kelompok" : "Simpan Kelompok")}
                            </Button>
                            {editingKelompokId && (
                                <Button 
                                    variant="outlined" 
                                    onClick={handleCancelEditKelompok} 
                                    size="small"
                                    disabled={isSubmittingKelompok || isSubmittingBlok}
                                >
                                    Batal Edit
                                </Button>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Form Blok Konsumsi */}
            {selectedInputType === 'blok' && (
                <Card sx={{ 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    mb: 3
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333', display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', borderRadius: 1, p: 0.5, mr: 1.5 }}>
                                <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            {editingBlokId ? 'Update Blok Konsumsi' : 'Input Blok Konsumsi'}
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Nama Blok"
                                    value={namaBlok}
                                    onChange={(e) => setNamaBlok(e.target.value)}
                                    fullWidth
                                    placeholder="Contoh: Blok 1 (0-10 m³)"
                                    required
                                    disabled={isSubmittingBlok || isSubmittingKelompok}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Batas Bawah (m³)"
                                    type="number"
                                    value={batasBawah}
                                    onChange={(e) => setBatasBawah(e.target.value)}
                                    fullWidth
                                    placeholder="Contoh: 0"
                                    required
                                    inputProps={{ step: "any" }}
                                    disabled={isSubmittingBlok || isSubmittingKelompok}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Batas Atas (m³)"
                                    type="number"
                                    value={batasAtas}
                                    onChange={(e) => setBatasAtas(e.target.value)}
                                    fullWidth
                                    placeholder="Contoh: 10 (kosongkan jika tanpa batas atas)"
                                    inputProps={{ step: "any" }}
                                    disabled={isSubmittingBlok || isSubmittingKelompok}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Keterangan Blok"
                                    value={keteranganBlok}
                                    onChange={(e) => setKeteranganBlok(e.target.value)}
                                    fullWidth
                                    placeholder="Contoh: Tarif normal untuk pemakaian 0-10 m³"
                                    required
                                    disabled={isSubmittingBlok || isSubmittingKelompok}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button 
                                variant="contained" 
                                onClick={handleSubmitBlok} 
                                size="small"
                                disabled={isSubmittingBlok || isSubmittingKelompok}
                                sx={{
                                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
                                    }
                                }}
                                startIcon={isSubmittingBlok ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {isSubmittingBlok ? "Menyimpan..." : (editingBlokId ? "Update Blok" : "Simpan Blok")}
                            </Button>
                            {editingBlokId && (
                                <Button 
                                    variant="outlined" 
                                    onClick={handleCancelEditBlok} 
                                    size="small"
                                    disabled={isSubmittingBlok || isSubmittingKelompok}
                                >
                                    Batal Edit
                                </Button>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* Data Kelompok */}
            <Card sx={{ 
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                mb: 3
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333', display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 1, p: 0.5, mr: 1.5 }}>
                            <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        Data Kelompok Tersimpan
                    </Typography>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nama Kelompok</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Sub Kelompok</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoadingKelompokList ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            <CircularProgress size={20} /> Memuat...
                                        </TableCell>
                                    </TableRow>
                                ) : errorKelompokList ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            <Alert severity="error">{errorKelompokList}</Alert>
                                        </TableCell>
                                    </TableRow>
                                ) : kelompokList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            Belum ada data kelompok.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    kelompokList.map((k) => (
                                        <TableRow key={k.id_kelompok} sx={{ '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' } }}>
                                            <TableCell>{k.nama_kelompok}</TableCell>
                                            <TableCell>{k.sub_kelompok}</TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleEditKelompok(k)} 
                                                    disabled={isSubmittingKelompok || isSubmittingBlok}
                                                    sx={{ color: '#667eea' }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteKelompok(k.id_kelompok)}
                                                    disabled={isSubmittingKelompok || isSubmittingBlok}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Data Blok */}
            <Card sx={{ 
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333', display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', borderRadius: 1, p: 0.5, mr: 1.5 }}>
                            <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        Data Blok Konsumsi Tersimpan
                    </Typography>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nama Blok</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Batas Bawah (m³)</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Batas Atas (m³)</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Keterangan</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoadingBlokList ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <CircularProgress size={20} /> Memuat...
                                        </TableCell>
                                    </TableRow>
                                ) : errorBlokList ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Alert severity="error">{errorBlokList}</Alert>
                                        </TableCell>
                                    </TableRow>
                                ) : blokList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            Belum ada data blok.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    blokList.map((b) => (
                                        <TableRow key={b.id_blok} sx={{ '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.05)' } }}>
                                            <TableCell>{b.nama_blok}</TableCell>
                                            <TableCell>{b.batas_bawah}</TableCell>
                                            <TableCell>{b.batas_atas === null ? '∞' : b.batas_atas}</TableCell>
                                            <TableCell>{b.keterangan_blok}</TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleEditBlok(b)} 
                                                    disabled={isSubmittingBlok || isSubmittingKelompok}
                                                    sx={{ color: '#4CAF50' }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteBlok(b.id_blok)}
                                                    disabled={isSubmittingBlok || isSubmittingKelompok}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Kelompok;
