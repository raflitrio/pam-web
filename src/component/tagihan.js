import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/axiosConfig';
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';
import { useAuth } from '../utils/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
// import { getAuthHeaders } from '../utils/auth'; // Tidak lagi dibutuhkan

const TARIF_PER_METER_KUBIK = 5000;

const formatDateForBackend = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const InputTagihan = () => {
    const theme = useTheme();
    const [penggunaanList, setPenggunaanList] = useState([]);
    const [selectedPenggunaanId, setSelectedPenggunaanId] = useState('');
    const [selectedPenggunaanData, setSelectedPenggunaanData] = useState(null);

    const [customerName, setCustomerName] = useState('');
    const [loadingCustomer, setLoadingCustomer] = useState(false);
    const [customerError, setCustomerError] = useState(null);

    const [biayaAdministrasi, setBiayaAdministrasi] = useState(0);
    const [biayaPemakaian, setBiayaPemakaian] = useState(0);
    const [totalTagihan, setTotalTagihan] = useState(0);
    const [statusPembayaran] = useState('BELUM DIBAYAR');
    const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState('');

    const [loadingPenggunaan, setLoadingPenggunaan] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            setError('Autentikasi diperlukan atau token tidak valid. Silakan login kembali.');
            setLoadingPenggunaan(false);
            setPenggunaanList([]);
            return;
        }
        setLoadingPenggunaan(true);
        setError(null);

        apiClient.get(`/penggunaanair`)
            .then(response => {
                if (response.data && response.data.success) {
                    setPenggunaanList(response.data.data || []);
                } else {
                    setPenggunaanList([]);
                    setError(response.data.message || 'Gagal mengambil data penggunaan air.');
                }
            })
            .catch(err => {
                console.error("Error fetching penggunaan air:", err);
                let errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengambil data penggunaan.';
                if (err.response?.status === 401 || err.response?.status === 403) {
                    errMsg = 'Sesi Anda berakhir atau tidak valid. Silakan login kembali.';
                }
                setError(errMsg);
                setPenggunaanList([]);
            })
            .finally(() => {
                setLoadingPenggunaan(false);
            });
    }, [isAuthenticated]);

    const fetchCustomerName = useCallback(async (pelangganId) => {
        if (!pelangganId) {
            setCustomerName('');
            setCustomerError("ID Pelanggan tidak valid untuk fetch nama.");
            return;
        }
        if (!isAuthenticated) {
            setCustomerError('Autentikasi diperlukan untuk mengambil nama pelanggan.');
            setLoadingCustomer(false);
            return;
        }

        setLoadingCustomer(true);
        setCustomerError(null);

        try {
            const response = await apiClient.get(`/pelanggan/${pelangganId}`);

            if (response.data && response.data.success && response.data.data) {
                 const customerData = response.data.data;
                 if (customerData && customerData.nama) {
                    setCustomerName(customerData.nama);
                 } else {
                    setCustomerName('Nama tidak ditemukan di data pelanggan');
                 }
            } else {
                throw new Error(response.data.message || `Gagal mengambil data pelanggan ID: ${pelangganId}`);
            }
        } catch (err) {
            console.error("Error fetching customer name:", err);
            let errorMsg = err.response?.data?.message || err.message || 'Kesalahan mengambil nama pelanggan.';
             if (err.response?.status === 404) {
                 errorMsg = `Pelanggan dengan ID ${pelangganId} tidak ditemukan.`;
             } else if (err.response?.status === 401 || err.response?.status === 403) {
                 errorMsg = 'Sesi Anda berakhir atau tidak valid.';
             }
            setCustomerError(errorMsg);
            setCustomerName('');
        } finally {
            setLoadingCustomer(false);
        }
    }, [isAuthenticated]);

    const handlePenggunaanChange = (selectedOption) => {
        const selectedId = selectedOption ? selectedOption.value : '';
        setSelectedPenggunaanId(selectedId);
        setError(null);
        setSuccessMessage(null);

        setCustomerName('');
        setCustomerError(null);
        setSelectedPenggunaanData(null);

        if (selectedId) {
            const selectedData = penggunaanList.find(p => p.id_penggunaan === selectedId);
            setSelectedPenggunaanData(selectedData);

            if (selectedData && selectedData.id_pelanggan) {
                if (selectedData.nama) {
                    setCustomerName(selectedData.nama);
                    setLoadingCustomer(false);
                } else {
                    fetchCustomerName(selectedData.id_pelanggan);
                }
            } else if (selectedData) {
                 setCustomerError("Data penggunaan terpilih tidak memiliki ID Pelanggan (Kesalahan data server).");
            }
        }
    };

    useEffect(() => {
        let calculatedBiayaPemakaian = 0;
        const adminFee = parseFloat(biayaAdministrasi) || 0;

        if (selectedPenggunaanData && selectedPenggunaanData.pemakaian_air !== undefined) {
            const pemakaian = parseFloat(selectedPenggunaanData.pemakaian_air);
            if (!isNaN(pemakaian)) {
                calculatedBiayaPemakaian = pemakaian * TARIF_PER_METER_KUBIK;
            }
        }
        setBiayaPemakaian(calculatedBiayaPemakaian);
        setTotalTagihan(calculatedBiayaPemakaian + adminFee);

    }, [selectedPenggunaanData, biayaAdministrasi]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoadingSubmit(true);
        setError(null);
        setSuccessMessage(null);

        if (!isAuthenticated) {
            setError('Autentikasi diperlukan. Silakan login kembali.');
            setLoadingSubmit(false);
            return;
        }
        if (!selectedPenggunaanId || !selectedPenggunaanData) {
            setError('Silakan pilih data penggunaan air terlebih dahulu.');
            setLoadingSubmit(false);
            return;
        }
        if (biayaAdministrasi === '' || isNaN(parseFloat(biayaAdministrasi))) {
            setError('Biaya administrasi harus diisi dan berupa angka.');
            setLoadingSubmit(false);
            return;
        }
         if (!tanggalJatuhTempo) {
            setError('Tanggal jatuh tempo harus diisi.');
            setLoadingSubmit(false);
            return;
        }

        if (customerError) {
             setError(`Tidak dapat membuat tagihan karena gagal mengambil data pelanggan: ${customerError}`);
             setLoadingSubmit(false);
             return;
        }

        if (loadingCustomer) {
             setError(`Harap tunggu, sedang memuat nama pelanggan...`);
             setLoadingSubmit(false);
             return;
        }

        if (!customerName && selectedPenggunaanData?.id_pelanggan) {
             setError(`Nama pelanggan belum termuat. Coba pilih ulang atau tunggu sebentar.`);
             setLoadingSubmit(false);
             return;
        }

        const id_tagihan_baru = uuidv4();
        const tanggal_dibuat_sekarang = formatDateForBackend(new Date());
        const tanggal_jatuh_tempo_formatted = formatDateForBackend(new Date(tanggalJatuhTempo + 'T00:00:00'));

        const tagihanData = {
            id_tagihan: id_tagihan_baru,
            id_penggunaan: selectedPenggunaanId,
            biaya_pemakaian: biayaPemakaian,
            biaya_administrasi: parseFloat(biayaAdministrasi),
            total_tagihan: totalTagihan,
            status_pembayaran: statusPembayaran,
            tanggal_jatuh_tempo: tanggal_jatuh_tempo_formatted,
            tanggal_dibuat: tanggal_dibuat_sekarang,
        };

        try {
            const response = await apiClient.post(`/tagihan/input`, tagihanData);

            if (response.data && response.data.success) {
                setSuccessMessage(`Tagihan berhasil dibuat untuk ${customerName || 'pelanggan terpilih'} dengan ID: ${id_tagihan_baru}`);
                setSelectedPenggunaanId('');
                setSelectedPenggunaanData(null);
                setCustomerName('');
                setCustomerError(null);
                setBiayaAdministrasi(0);
                setTanggalJatuhTempo('');
                setBiayaPemakaian(0);
                setTotalTagihan(0);
            } else {
                setError(response.data.message || 'Gagal menyimpan tagihan.');
            }
        } catch (err) {
            console.error("Error submitting tagihan:", err);
            let errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan tagihan.';
             if (err.response?.status === 401 || err.response?.status === 403) {
                 errMsg = 'Sesi Anda berakhir atau tidak valid. Silakan login kembali.';
             }
            setError(errMsg);
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary' }}>
                Input Tagihan Baru
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3, boxShadow: theme.shadows[2] }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
                                Detail Tagihan
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}

                            {successMessage && (
                                <Alert severity="success" sx={{ mb: 3 }}>
                                    {successMessage}
                                </Alert>
                            )}

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Select
                                        isLoading={loadingPenggunaan}
                                        isDisabled={loadingPenggunaan}
                                        options={penggunaanList.map(p => ({
                                            value: p.id_penggunaan,
                                            label: `${p.nama || 'Pelanggan'} - ${p.pemakaian_air} m³ (${format(new Date(p.tanggal_pencatatan), 'dd MMMM yyyy', { locale: id })})`
                                        }))}
                                        value={penggunaanList.find(p => p.id_penggunaan === selectedPenggunaanId) ? {
                                            value: selectedPenggunaanId,
                                            label: `${customerName || 'Pelanggan'} - ${selectedPenggunaanData?.pemakaian_air} m³ (${format(new Date(selectedPenggunaanData?.tanggal_pencatatan), 'dd MMMM yyyy', { locale: id })})`
                                        } : null}
                                        onChange={handlePenggunaanChange}
                                        placeholder="Pilih data penggunaan air..."
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: '56px',
                                                borderRadius: '8px',
                                            }),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Biaya Administrasi"
                                        type="number"
                                        value={biayaAdministrasi}
                                        onChange={(e) => setBiayaAdministrasi(e.target.value)}
                                        InputProps={{
                                            startAdornment: <Typography sx={{ mr: 1 }}>Rp</Typography>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Tanggal Jatuh Tempo"
                                        value={tanggalJatuhTempo}
                                        onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={loadingSubmit || loadingPenggunaan || loadingCustomer}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                        }}
                    >
                        {loadingSubmit ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Simpan Tagihan'
                        )}
                    </Button>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ boxShadow: theme.shadows[2] }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
                                Ringkasan Tagihan
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Pelanggan
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {customerName || '-'}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Pemakaian Air
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {selectedPenggunaanData?.pemakaian_air || 0} m³
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Biaya Pemakaian
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {formatCurrency(biayaPemakaian)}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Biaya Administrasi
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {formatCurrency(parseFloat(biayaAdministrasi) || 0)}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Tagihan
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {formatCurrency(totalTagihan)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default InputTagihan;
