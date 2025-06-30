import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../utils/AuthContext';
import apiClient from '../utils/axiosConfig';
import { sendAdminNotification } from '../utils/adminNotification';
import {
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
    Alert,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useBackgroundJob } from '../utils/backgroundJobHook';

function Tarif() {
    const [selectedIdKelompok, setSelectedIdKelompok] = useState('');
    const [selectedIdBlok, setSelectedIdBlok] = useState('');
    const [nilaiTarif, setNilaiTarif] = useState('');

    const [kelompokOptions, setKelompokOptions] = useState([]);

    const [blokOptions, setBlokOptions] = useState([]);

    const [tarifList, setTarifList] = useState([]);
    const [isSubmittingTarif, setIsSubmittingTarif] = useState(false);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedTarifForUpdate, setSelectedTarifForUpdate] = useState(null);
    const [updateIdKelompok, setUpdateIdKelompok] = useState('');
    const [updateIdBlok, setUpdateIdBlok] = useState('');
    const [updateNilaiTarif, setUpdateNilaiTarif] = useState('');
    const [isUpdatingTarif, setIsUpdatingTarif] = useState(false);

    const [selectedIdKelompokBiayaAdmin, setSelectedIdKelompokBiayaAdmin] = useState('');
    const [diameterBiayaAdmin, setDiameterBiayaAdmin] = useState('');
    const [nilaiBiayaAdminInput, setNilaiBiayaAdminInput] = useState('');
    const [keteranganBiayaAdmin, setKeteranganBiayaAdmin] = useState('');
    const [isSubmittingBiayaAdmin, setIsSubmittingBiayaAdmin] = useState(false);
    const [biayaAdminList, setBiayaAdminList] = useState([]);

    const [diameterOptions, setDiameterOptions] = useState([]);

    const [selectedIdKelompokBebanTetap, setSelectedIdKelompokBebanTetap] = useState('');
    const [jumlahBebanTetap, setJumlahBebanTetap] = useState('');
    const [keteranganBebanTetap, setKeteranganBebanTetap] = useState('');
    const [isSubmittingBebanTetap, setIsSubmittingBebanTetap] = useState(false);
    const [bebanTetapList, setBebanTetapList] = useState([]);
    const [hariPenagihanDefault, setHariPenagihanDefault] = useState('');
    const [hariJatuhTempoDefault, setHariJatuhTempoDefault] = useState('');
    const [isSubmittingBillingDates, setIsSubmittingBillingDates] = useState(false);

    const [selectedInputType, setSelectedInputType] = useState('');

    const { isAuthenticated } = useAuth();
    const { submitToBackground } = useBackgroundJob();

    const fetchKelompokOptions = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }
        try {
            const response = await apiClient.get(`/kelompok`);
            if (response.data.success) {
                setKelompokOptions(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error("Error fetching kelompok options:", error);
        }
    }, [isAuthenticated]);

    const fetchBlokOptions = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }
        try {
            const response = await apiClient.get(`/blok`);
            if (response.data.success) {
                setBlokOptions(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error("Error fetching blok options:", error);
        }
    }, [isAuthenticated]);

    const fetchTarifList = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }
        try {
            const response = await apiClient.get(`/tarif`);
            if (response.data.success) {
                setTarifList(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error("Error fetching tarif list:", error);
        }
    }, [isAuthenticated]);

    const fetchBiayaAdminListData = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }
        try {
            const response = await apiClient.get(`/biayaadmin`);
            if (response.data.success) {
                setBiayaAdminList(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error("Error fetching biaya admin list:", error);
        }
    }, [isAuthenticated]);

    const fetchDiameterOptions = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }
        try {
            const response = await apiClient.get(`/meteran-air/unique/diameters`);
            if (response.data.success) {
                setDiameterOptions(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error("Error fetching diameter options:", error);
        }
    }, [isAuthenticated]);

    const fetchBebanTetapListData = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }
        try {
            const response = await apiClient.get(`/beban_tetap`);
            if (response.data.success) {
                setBebanTetapList(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error("Error fetching beban tetap list:", error);
        }
    }, [isAuthenticated]);

    const fetchGlobalBillingDates = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }
        try {
            const response = await apiClient.get(`/pengaturan/billing-dates`);
            if (response.data.success && response.data.data) {
                setHariPenagihanDefault(response.data.data.HARI_PENAGIHAN_DEFAULT || '');
                setHariJatuhTempoDefault(response.data.data.HARI_JATUH_TEMPO_DEFAULT || '');
            }
        } catch (error) {
            console.error("Error fetching global billing dates:", error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchKelompokOptions();
            fetchBlokOptions();
            fetchTarifList();
            fetchGlobalBillingDates();
            fetchBiayaAdminListData();
            fetchBebanTetapListData();
            fetchDiameterOptions();
        }
    }, [isAuthenticated, fetchKelompokOptions, fetchBlokOptions, fetchTarifList, fetchGlobalBillingDates, fetchBiayaAdminListData, fetchBebanTetapListData, fetchDiameterOptions]);

    const handleSubmitTarif = async () => {
        setIsSubmittingTarif(true);

        if (!selectedIdKelompok || !selectedIdBlok || nilaiTarif === '') {
            Swal.fire('Data Tidak Lengkap', 'Harap pilih Kelompok, Blok, dan isi nilai Tarif.', 'error');
            setIsSubmittingTarif(false);
            return;
        }
        const numNilaiTarif = parseFloat(nilaiTarif);
        if (isNaN(numNilaiTarif) || numNilaiTarif < 0) {
            Swal.fire('Data Tidak Valid', 'Nilai tarif harus berupa angka dan tidak boleh negatif.', 'error');
            setIsSubmittingTarif(false);
            return;
        }
        if (!isAuthenticated) {
            Swal.fire('Autentikasi Gagal', 'Autentikasi diperlukan. Silakan login kembali.', 'error');
            setIsSubmittingTarif(false);
            return;
        }

        try {
            const result = await submitToBackground(
                'tarif/queue',
                {
                    id_kelompok: selectedIdKelompok,
                    id_blok: selectedIdBlok,
                    tarif: numNilaiTarif
                },
                'tarif',
                `Input tarif untuk kelompok ${selectedIdKelompok} dan blok ${selectedIdBlok}`
            );

            if (result.success) {
                Swal.fire('Berhasil!', 'Data Tarif telah ditambahkan ke antrian pemrosesan. Anda dapat melanjutkan aktivitas lain sambil menunggu data selesai diproses.', 'success');
                
                // Send admin notification for success
                sendAdminNotification(
                    'success',
                    'Input Tarif Berhasil',
                    `Data tarif untuk kelompok ${selectedIdKelompok} dan blok ${selectedIdBlok} berhasil ditambahkan ke antrian pemrosesan.`
                );
                
                setSelectedIdKelompok('');
                setSelectedIdBlok('');
                setNilaiTarif('');
                
                setTimeout(() => {
                    fetchTarifList();
                }, 3000);
            } else {
                Swal.fire('Gagal!', result.error || 'Gagal menambahkan data tarif ke antrian.', 'error');
                
                // Send admin notification for failure
                sendAdminNotification(
                    'error',
                    'Input Tarif Gagal',
                    `Gagal menambahkan data tarif untuk kelompok ${selectedIdKelompok} dan blok ${selectedIdBlok} ke antrian: ${result.error || 'Unknown error'}`
                );
            }
        } catch (error) {
            console.error('Error submitting tarif:', error);
            Swal.fire('Error!', error.response?.data?.message || 'Kesalahan jaringan saat menyimpan data tarif.', 'error');
            
            // Send admin notification for error
            sendAdminNotification(
                'error',
                'Input Tarif Error',
                `Error saat input data tarif untuk kelompok ${selectedIdKelompok} dan blok ${selectedIdBlok}: ${error.response?.data?.message || error.message || 'Unknown error'}`
            );
        } finally {
            setIsSubmittingTarif(false);
        }
    };

    const handleSubmitBiayaAdmin = async () => {
        setIsSubmittingBiayaAdmin(true);

        if (!selectedIdKelompokBiayaAdmin || diameterBiayaAdmin.trim() === '' || nilaiBiayaAdminInput === '' || keteranganBiayaAdmin.trim() === '') {
            Swal.fire('Data Tidak Lengkap', 'Harap pilih Kelompok, isi Diameter, Biaya Admin, dan Keterangan.', 'error');
            setIsSubmittingBiayaAdmin(false);
            return;
        }
        const numNilaiBiayaAdmin = parseFloat(nilaiBiayaAdminInput);
        if (isNaN(numNilaiBiayaAdmin) || numNilaiBiayaAdmin < 0) {
            Swal.fire('Data Tidak Valid', 'Nilai Biaya Admin harus berupa angka dan tidak boleh negatif.', 'error');
            setIsSubmittingBiayaAdmin(false);
            return;
        }
        if (!isAuthenticated) {
            Swal.fire('Autentikasi Gagal', 'Autentikasi diperlukan. Silakan login kembali.', 'error');
            setIsSubmittingBiayaAdmin(false);
            return;
        }

        try {
            const response = await apiClient.post(`/biayaadmin/input`, {
                id_kelompok: selectedIdKelompokBiayaAdmin,
                diameter: diameterBiayaAdmin.trim(),
                biaya_admin: numNilaiBiayaAdmin,
                keterangan_biaya: keteranganBiayaAdmin.trim()
            });
            if (response.data.success) {
                Swal.fire('Berhasil!', 'Data Biaya Admin berhasil disimpan.', 'success');
                
                // Send admin notification for success
                sendAdminNotification(
                    'success',
                    'Input Biaya Admin Berhasil',
                    `Data biaya admin untuk kelompok ${selectedIdKelompokBiayaAdmin} dan diameter ${diameterBiayaAdmin} berhasil disimpan.`
                );
                
                setSelectedIdKelompokBiayaAdmin('');
                setDiameterBiayaAdmin('');
                setNilaiBiayaAdminInput('');
                setKeteranganBiayaAdmin('');
                fetchBiayaAdminListData();
            } else {
                Swal.fire('Gagal!', response.data.message || 'Terjadi kesalahan saat menyimpan data biaya admin.', 'error');
                
                // Send admin notification for failure
                sendAdminNotification(
                    'error',
                    'Input Biaya Admin Gagal',
                    `Gagal menyimpan data biaya admin untuk kelompok ${selectedIdKelompokBiayaAdmin} dan diameter ${diameterBiayaAdmin}: ${response.data.message || 'Unknown error'}`
                );
            }
        } catch (error) {
            console.error('Error submitting biaya admin:', error);
            Swal.fire('Error!', error.response?.data?.message || 'Kesalahan jaringan saat menyimpan data biaya admin.', 'error');
            
            // Send admin notification for error
            sendAdminNotification(
                'error',
                'Input Biaya Admin Error',
                `Error saat input data biaya admin untuk kelompok ${selectedIdKelompokBiayaAdmin} dan diameter ${diameterBiayaAdmin}: ${error.response?.data?.message || error.message || 'Unknown error'}`
            );
        } finally {
            setIsSubmittingBiayaAdmin(false);
        }
    };

    const handleSubmitBebanTetap = async () => {
        setIsSubmittingBebanTetap(true);

        if (!selectedIdKelompokBebanTetap || jumlahBebanTetap === '') {
            Swal.fire('Data Tidak Lengkap', 'Harap pilih Kelompok dan isi Jumlah Beban Tetap.', 'error');
            setIsSubmittingBebanTetap(false);
            return;
        }
        const numJumlahBeban = parseFloat(jumlahBebanTetap);
        if (isNaN(numJumlahBeban) || numJumlahBeban < 0) {
            Swal.fire('Data Tidak Valid', 'Jumlah Beban Tetap harus berupa angka dan tidak boleh negatif.', 'error');
            setIsSubmittingBebanTetap(false);
            return;
        }
        if (!isAuthenticated) {
            Swal.fire('Autentikasi Gagal', 'Autentikasi diperlukan. Silakan login kembali.', 'error');
            setIsSubmittingBebanTetap(false);
            return;
        }

        try {
            const response = await apiClient.post(`/beban_tetap/input`, {
                id_kelompok: selectedIdKelompokBebanTetap,
                jumlah_beban: numJumlahBeban,
                keterangan: keteranganBebanTetap.trim() || null
            });
            if (response.data.success) {
                Swal.fire('Berhasil!', 'Data Beban Tetap berhasil disimpan.', 'success');
                
                // Send admin notification for success
                sendAdminNotification(
                    'success',
                    'Input Beban Tetap Berhasil',
                    `Data beban tetap untuk kelompok ${selectedIdKelompokBebanTetap} berhasil disimpan.`
                );
                
                setSelectedIdKelompokBebanTetap('');
                setJumlahBebanTetap('');
                setKeteranganBebanTetap('');
                fetchBebanTetapListData();
            } else {
                Swal.fire('Gagal!', response.data.message || 'Terjadi kesalahan saat menyimpan data beban tetap.', 'error');
                
                // Send admin notification for failure
                sendAdminNotification(
                    'error',
                    'Input Beban Tetap Gagal',
                    `Gagal menyimpan data beban tetap untuk kelompok ${selectedIdKelompokBebanTetap}: ${response.data.message || 'Unknown error'}`
                );
            }
        } catch (error) {
            console.error('Error submitting beban tetap:', error);
            Swal.fire('Error!', error.response?.data?.message || 'Kesalahan jaringan saat menyimpan data beban tetap.', 'error');
            
            // Send admin notification for error
            sendAdminNotification(
                'error',
                'Input Beban Tetap Error',
                `Error saat input data beban tetap untuk kelompok ${selectedIdKelompokBebanTetap}: ${error.response?.data?.message || error.message || 'Unknown error'}`
            );
        } finally {
            setIsSubmittingBebanTetap(false);
        }
    };

    const handleSubmitBillingDates = async () => {
        setIsSubmittingBillingDates(true);

        if (!hariPenagihanDefault || !hariJatuhTempoDefault) {
            Swal.fire('Data Tidak Lengkap', 'Hari Penagihan Default dan Hari Jatuh Tempo Default wajib diisi.', 'error');
            setIsSubmittingBillingDates(false);
            return;
        }
        const numHariPenagihan = parseInt(hariPenagihanDefault, 10);
        const numHariJatuhTempo = parseInt(hariJatuhTempoDefault, 10);

        if (isNaN(numHariPenagihan) || numHariPenagihan < 1 || numHariPenagihan > 28 ||
            isNaN(numHariJatuhTempo) || numHariJatuhTempo < 1 || numHariJatuhTempo > 28) {
            Swal.fire('Data Tidak Valid', 'Hari harus berupa angka antara 1 dan 28.', 'error');
            setIsSubmittingBillingDates(false);
            return;
        }
        if (numHariPenagihan >= numHariJatuhTempo) {
            Swal.fire('Data Tidak Valid', 'Hari Penagihan Default harus sebelum Hari Jatuh Tempo Default.', 'error');
            setIsSubmittingBillingDates(false);
            return;
        }
        if (!isAuthenticated) {
            Swal.fire('Autentikasi Gagal', 'Autentikasi diperlukan.', 'error');
            setIsSubmittingBillingDates(false);
            return;
        }

        try {
            const response = await apiClient.post(`/pengaturan/billing-dates`, {
                HARI_PENAGIHAN_DEFAULT: numHariPenagihan,
                HARI_JATUH_TEMPO_DEFAULT: numHariJatuhTempo
            });
            if (response.data.success) {
                Swal.fire('Berhasil!', 'Pengaturan tanggal billing global berhasil disimpan.', 'success');
                
                // Send admin notification for success
                sendAdminNotification(
                    'success',
                    'Update Tanggal Billing Berhasil',
                    `Pengaturan tanggal billing global berhasil diperbarui: Hari Penagihan ${numHariPenagihan}, Hari Jatuh Tempo ${numHariJatuhTempo}.`
                );
                
                fetchGlobalBillingDates();
            } else {
                Swal.fire('Gagal!', response.data.message || 'Gagal menyimpan pengaturan tanggal billing.', 'error');
                
                // Send admin notification for failure
                sendAdminNotification(
                    'error',
                    'Update Tanggal Billing Gagal',
                    `Gagal menyimpan pengaturan tanggal billing global: ${response.data.message || 'Unknown error'}`
                );
            }
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Kesalahan jaringan.', 'error');
            
            // Send admin notification for error
            sendAdminNotification(
                'error',
                'Update Tanggal Billing Error',
                `Error saat update pengaturan tanggal billing global: ${error.response?.data?.message || error.message || 'Unknown error'}`
            );
        } finally {
            setIsSubmittingBillingDates(false);
        }
    };

    const openUpdateModal = (tarif) => {
        setSelectedTarifForUpdate(tarif);
        setUpdateIdKelompok(tarif.id_kelompok);
        setUpdateIdBlok(tarif.id_blok);
        setUpdateNilaiTarif(String(tarif.tarif));
        setIsUpdateModalOpen(true);
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedTarifForUpdate(null);
        setUpdateIdKelompok('');
        setUpdateIdBlok('');
        setUpdateNilaiTarif('');
    };

    const handleUpdateTarif = async () => {
        if (!selectedTarifForUpdate) return;
        setIsUpdatingTarif(true);

        if (!updateIdKelompok || !updateIdBlok || updateNilaiTarif === '') {
            Swal.fire('Data Tidak Lengkap', 'Harap pilih Kelompok, Blok, dan isi nilai Tarif.', 'error');
            setIsUpdatingTarif(false);
            return;
        }
        const numNilaiTarif = parseFloat(updateNilaiTarif);
        if (isNaN(numNilaiTarif) || numNilaiTarif < 0) {
            Swal.fire('Data Tidak Valid', 'Nilai tarif harus berupa angka dan tidak boleh negatif.', 'error');
            setIsUpdatingTarif(false);
            return;
        }
        if (!isAuthenticated) {
            Swal.fire('Autentikasi Gagal', 'Autentikasi diperlukan.', 'error');
            setIsUpdatingTarif(false);
            return;
        }

        try {
            const response = await apiClient.put(`/tarif/update/${selectedTarifForUpdate.id_tarif}`, {
                id_kelompok: updateIdKelompok,
                id_blok: updateIdBlok,
                tarif: numNilaiTarif
            });
            if (response.data.success) {
                Swal.fire('Berhasil!', 'Data Tarif berhasil diperbarui.', 'success');
                closeUpdateModal();
                fetchTarifList();
            } else {
                Swal.fire('Gagal!', response.data.message || 'Terjadi kesalahan saat memperbarui data tarif.', 'error');
            }
        } catch (error) {
            console.error('Error updating tarif:', error);
            Swal.fire('Error!', error.response?.data?.message || 'Kesalahan jaringan saat memperbarui data tarif.', 'error');
        } finally {
            setIsUpdatingTarif(false);
        }
    };

    return (
        <Box sx={{ 
            width: '100%', 
            minHeight: '100vh',
            p: 3
        }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" sx={{ 
                    color: 'white', 
                    fontWeight: 700, 
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    Atur Tarif
                </Typography>
                <Typography variant="h6" sx={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontWeight: 400 
                }}>
                    Kelola pengaturan tarif dan biaya administrasi
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
                            <MenuItem value="tarif">Pengaturan Tarif</MenuItem>
                            <MenuItem value="biayaAdmin">Biaya Administrasi</MenuItem>
                            <MenuItem value="bebanTetap">Beban Tetap</MenuItem>
                            <MenuItem value="tanggalPenagihan">Tanggal Penagihan Global</MenuItem>
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Input Forms */}
            {selectedInputType === 'tarif' && (
                <Card sx={{ 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    mb: 3
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            mb: 3, 
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 1,
                                p: 0.5,
                                mr: 1.5
                            }}>
                                <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            Pengaturan Tarif
                        </Typography>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Kelompok</InputLabel>
                                    <Select
                                        size="small"
                                        value={selectedIdKelompok}
                                        onChange={(e) => setSelectedIdKelompok(e.target.value)}
                                        label="Kelompok"
                                    >
                                        {kelompokOptions.map((kelompok) => (
                                            <MenuItem key={kelompok.id_kelompok} value={kelompok.id_kelompok}>
                                                {kelompok.nama_kelompok}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Blok Konsumsi</InputLabel>
                                    <Select
                                        fullWidth
                                        size="small"
                                        value={selectedIdBlok}
                                        onChange={(e) => setSelectedIdBlok(e.target.value)}
                                        label="Blok Konsumsi"
                                    >
                                        {blokOptions.map((blok) => (
                                            <MenuItem key={blok.id_blok} value={blok.id_blok}>
                                                {blok.nama_blok}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Nilai Tarif"
                                    type="number"
                                    value={nilaiTarif}
                                    onChange={(e) => setNilaiTarif(e.target.value)}
                                    placeholder="Masukkan nilai tarif"
                                />
                            </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                onClick={handleSubmitTarif}
                                disabled={isSubmittingTarif || !selectedIdKelompok || !selectedIdBlok || !nilaiTarif}
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
                            >
                                {isSubmittingTarif ? <CircularProgress size={20} color="inherit" /> : 'Simpan Tarif'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {selectedInputType === 'biayaAdmin' && (
                <Card sx={{ 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    mb: 3
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            mb: 3, 
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                borderRadius: 1,
                                p: 0.5,
                                mr: 1.5
                            }}>
                                <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            Biaya Administrasi
                        </Typography>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Kelompok</InputLabel>
                                    <Select
                                        fullWidth
                                        size="small"
                                        value={selectedIdKelompokBiayaAdmin}
                                        onChange={(e) => setSelectedIdKelompokBiayaAdmin(e.target.value)}
                                        label="Kelompok"
                                    >
                                        {kelompokOptions.map((kelompok) => (
                                            <MenuItem key={kelompok.id_kelompok} value={kelompok.id_kelompok}>
                                                {kelompok.nama_kelompok}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Diameter</InputLabel>
                                    <Select
                                        fullWidth
                                        size="small"
                                        value={diameterBiayaAdmin}
                                        onChange={(e) => setDiameterBiayaAdmin(e.target.value)}
                                        label="Diameter"
                                    >
                                        {diameterOptions.map((diameter) => (
                                            <MenuItem key={diameter} value={diameter}>
                                                {diameter}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Nilai Biaya Admin"
                                    type="number"
                                    value={nilaiBiayaAdminInput}
                                    onChange={(e) => setNilaiBiayaAdminInput(e.target.value)}
                                    placeholder="Masukkan nilai biaya admin"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Keterangan"
                                    value={keteranganBiayaAdmin}
                                    onChange={(e) => setKeteranganBiayaAdmin(e.target.value)}
                                    placeholder="Masukkan keterangan"
                                />
                            </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                onClick={handleSubmitBiayaAdmin}
                                disabled={isSubmittingBiayaAdmin || !selectedIdKelompokBiayaAdmin || !diameterBiayaAdmin || !nilaiBiayaAdminInput}
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
                            >
                                {isSubmittingBiayaAdmin ? <CircularProgress size={20} color="inherit" /> : 'Simpan Biaya Admin'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {selectedInputType === 'bebanTetap' && (
                <Card sx={{ 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    mb: 3
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            mb: 3, 
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                borderRadius: 1,
                                p: 0.5,
                                mr: 1.5
                            }}>
                                <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            Beban Tetap
                        </Typography>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Kelompok</InputLabel>
                                    <Select
                                        fullWidth
                                        size="small"
                                        value={selectedIdKelompokBebanTetap}
                                        onChange={(e) => setSelectedIdKelompokBebanTetap(e.target.value)}
                                        label="Kelompok"
                                    >
                                        {kelompokOptions.map((kelompok) => (
                                            <MenuItem key={kelompok.id_kelompok} value={kelompok.id_kelompok}>
                                                {kelompok.nama_kelompok}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Jumlah Beban Tetap"
                                    type="number"
                                    value={jumlahBebanTetap}
                                    onChange={(e) => setJumlahBebanTetap(e.target.value)}
                                    placeholder="Masukkan jumlah beban tetap"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Keterangan"
                                    value={keteranganBebanTetap}
                                    onChange={(e) => setKeteranganBebanTetap(e.target.value)}
                                    placeholder="Masukkan keterangan"
                                />
                            </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                onClick={handleSubmitBebanTetap}
                                disabled={isSubmittingBebanTetap || !selectedIdKelompokBebanTetap || !jumlahBebanTetap}
                                sx={{
                                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)'
                                    }
                                }}
                            >
                                {isSubmittingBebanTetap ? <CircularProgress size={20} color="inherit" /> : 'Simpan Beban Tetap'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {selectedInputType === 'tanggalPenagihan' && (
                <Card sx={{ 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    mb: 3
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            mb: 3, 
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                                borderRadius: 1,
                                p: 0.5,
                                mr: 1.5
                            }}>
                                <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            Tanggal Penagihan Global
                        </Typography>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Hari Penagihan Default"
                                    type="number"
                                    value={hariPenagihanDefault}
                                    onChange={(e) => setHariPenagihanDefault(e.target.value)}
                                    placeholder="Masukkan hari penagihan default"
                                    inputProps={{ min: 1, max: 31 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Hari Jatuh Tempo Default"
                                    type="number"
                                    value={hariJatuhTempoDefault}
                                    onChange={(e) => setHariJatuhTempoDefault(e.target.value)}
                                    placeholder="Masukkan hari jatuh tempo default"
                                    inputProps={{ min: 1, max: 31 }}
                                />
                            </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                onClick={handleSubmitBillingDates}
                                disabled={isSubmittingBillingDates || !hariPenagihanDefault || !hariJatuhTempoDefault}
                                sx={{
                                    background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)'
                                    }
                                }}
                            >
                                {isSubmittingBillingDates ? <CircularProgress size={20} color="inherit" /> : 'Simpan Tanggal Penagihan'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* Data Display */}
            {selectedInputType === 'tarif' && (
                <Card sx={{ 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            mb: 3, 
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 1,
                                p: 0.5,
                                mr: 1.5
                            }}>
                                <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            Data Tarif
                        </Typography>
                        
                        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Kelompok</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Blok Konsumsi</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nilai Tarif</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Aksi</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tarifList.map((tarif) => (
                                        <TableRow key={tarif.id} sx={{ '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' } }}>
                                            <TableCell>{tarif.nama_kelompok}</TableCell>
                                            <TableCell>{tarif.nama_blok}</TableCell>
                                            <TableCell>Rp {tarif.tarif?.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => openUpdateModal(tarif)}
                                                    sx={{ color: '#667eea' }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {selectedInputType === 'biayaAdmin' && (
                <Card sx={{ 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            mb: 3, 
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                borderRadius: 1,
                                p: 0.5,
                                mr: 1.5
                            }}>
                                <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            Data Biaya Administrasi
                        </Typography>
                        
                        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Kelompok</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Diameter</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nilai Biaya Admin</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Keterangan</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {biayaAdminList.map((biayaAdmin) => (
                                        <TableRow key={biayaAdmin.id} sx={{ '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.05)' } }}>
                                            <TableCell>{biayaAdmin.nama_kelompok}</TableCell>
                                            <TableCell>{biayaAdmin.diameter}</TableCell>
                                            <TableCell>Rp {biayaAdmin.biaya_admin?.toLocaleString()}</TableCell>
                                            <TableCell>{biayaAdmin.keterangan_biaya}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {selectedInputType === 'bebanTetap' && (
                <Card sx={{ 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            mb: 3, 
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                borderRadius: 1,
                                p: 0.5,
                                mr: 1.5
                            }}>
                                <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            Data Beban Tetap
                        </Typography>
                        
                        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Kelompok</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Jumlah Beban Tetap</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Keterangan</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bebanTetapList.map((bebanTetap) => (
                                        <TableRow key={bebanTetap.id} sx={{ '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.05)' } }}>
                                            <TableCell>{bebanTetap.nama_kelompok}</TableCell>
                                            <TableCell>Rp {bebanTetap.jumlah_beban?.toLocaleString()}</TableCell>
                                            <TableCell>{bebanTetap.keterangan}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Update Modal */}
            <Dialog 
                open={isUpdateModalOpen} 
                onClose={closeUpdateModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 700
                }}>
                    Update Tarif
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Kelompok</InputLabel>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={updateIdKelompok}
                                    onChange={(e) => setUpdateIdKelompok(e.target.value)}
                                    label="Kelompok"
                                >
                                    {kelompokOptions.map((kelompok) => (
                                        <MenuItem key={kelompok.id_kelompok} value={kelompok.id_kelompok}>
                                            {kelompok.nama_kelompok}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Blok Konsumsi</InputLabel>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={updateIdBlok}
                                    onChange={(e) => setUpdateIdBlok(e.target.value)}
                                    label="Blok Konsumsi"
                                >
                                    {blokOptions.map((blok) => (
                                        <MenuItem key={blok.id_blok} value={blok.id_blok}>
                                            {blok.nama_blok}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nilai Tarif"
                                type="number"
                                value={updateNilaiTarif}
                                onChange={(e) => setUpdateNilaiTarif(e.target.value)}
                                placeholder="Masukkan nilai tarif"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={closeUpdateModal}
                        sx={{ 
                            color: '#666',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
                        }}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleUpdateTarif}
                        disabled={isUpdatingTarif || !updateIdKelompok || !updateIdBlok || !updateNilaiTarif}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                            }
                        }}
                    >
                        {isUpdatingTarif ? <CircularProgress size={20} color="inherit" /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Tarif;

