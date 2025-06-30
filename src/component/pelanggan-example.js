import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../utils/AuthContext';
import apiClient from '../utils/axiosConfig';
import {
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Divider,
    IconButton,
    Chip,
    Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

// Import PAM Components
import PamWrapper from './PamWrapper';
import PamCard from './PamCard';
import PamButton from './PamButton';
import PamTable from './PamTable';

function PelangganExample() {
    const [pelangganList, setPelangganList] = useState([]);
    const [isLoadingPelangganList, setIsLoadingPelangganList] = useState(false);
    const [errorPelangganList, setErrorPelangganList] = useState(null);
    
    const [namaPelanggan, setNamaPelanggan] = useState('');
    const [alamatPelanggan, setAlamatPelanggan] = useState('');
    const [nomorMeteran, setNomorMeteran] = useState('');
    const [selectedIdKelompok, setSelectedIdKelompok] = useState('');
    const [isSubmittingPelanggan, setIsSubmittingPelanggan] = useState(false);
    
    const [kelompokOptions, setKelompokOptions] = useState([]);
    const [isLoadingKelompokOptions, setIsLoadingKelompokOptions] = useState(false);
    const [errorKelompokOptions, setErrorKelompokOptions] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPelanggan, setFilteredPelanggan] = useState([]);

    const { isAuthenticated } = useAuth();

    // Fetch data functions
    const fetchPelangganList = useCallback(async () => {
        setIsLoadingPelangganList(true);
        setErrorPelangganList(null);

        if (!isAuthenticated) {
            setErrorPelangganList("Autentikasi diperlukan. Tidak dapat memuat data pelanggan.");
            setIsLoadingPelangganList(false);
            return;
        }

        try {
            const response = await apiClient.get(`/pelanggan`);
            if (response.data.success) {
                setPelangganList(Array.isArray(response.data.data) ? response.data.data : []);
            } else {
                setErrorPelangganList(response.data.message || "Gagal memuat data pelanggan.");
            }
        } catch (error) {
            console.error("Error fetching pelanggan list:", error);
            setErrorPelangganList(error.response?.data?.message || "Terjadi kesalahan jaringan saat memuat data pelanggan.");
        } finally {
            setIsLoadingPelangganList(false);
        }
    }, [isAuthenticated]);

    const fetchKelompokOptions = useCallback(async () => {
        setIsLoadingKelompokOptions(true);
        setErrorKelompokOptions(null);

        if (!isAuthenticated) {
            setErrorKelompokOptions("Autentikasi diperlukan. Tidak dapat memuat opsi kelompok.");
            setIsLoadingKelompokOptions(false);
            return;
        }

        try {
            const response = await apiClient.get(`/kelompok`);
            if (response.data.success) {
                setKelompokOptions(Array.isArray(response.data.data) ? response.data.data : []);
            } else {
                setErrorKelompokOptions(response.data.message || "Gagal memuat opsi kelompok.");
            }
        } catch (error) {
            console.error("Error fetching kelompok options:", error);
            setErrorKelompokOptions(error.response?.data?.message || "Terjadi kesalahan jaringan saat memuat opsi kelompok.");
        } finally {
            setIsLoadingKelompokOptions(false);
        }
    }, [isAuthenticated]);

    // Submit function
    const handleSubmitPelanggan = async () => {
        if (!namaPelanggan || !alamatPelanggan || !nomorMeteran || !selectedIdKelompok) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Semua field harus diisi!'
            });
            return;
        }

        setIsSubmittingPelanggan(true);

        try {
            const response = await apiClient.post('/pelanggan', {
                nama_pelanggan: namaPelanggan,
                alamat_pelanggan: alamatPelanggan,
                nomor_meteran: nomorMeteran,
                id_kelompok: selectedIdKelompok
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data pelanggan berhasil ditambahkan!'
                });
                
                // Reset form
                setNamaPelanggan('');
                setAlamatPelanggan('');
                setNomorMeteran('');
                setSelectedIdKelompok('');
                
                // Refresh data
                fetchPelangganList();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.data.message || 'Gagal menambahkan data pelanggan!'
                });
            }
        } catch (error) {
            console.error("Error submitting pelanggan:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Terjadi kesalahan jaringan saat menambahkan data pelanggan!'
            });
        } finally {
            setIsSubmittingPelanggan(false);
        }
    };

    // Search and filter
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPelanggan(pelangganList);
        } else {
            const filtered = pelangganList.filter(pelanggan =>
                pelanggan.nama_pelanggan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pelanggan.alamat_pelanggan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pelanggan.nomor_meteran?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPelanggan(filtered);
        }
    }, [searchTerm, pelangganList]);

    // Load data on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchPelangganList();
            fetchKelompokOptions();
        }
    }, [isAuthenticated, fetchPelangganList, fetchKelompokOptions]);

    // Table columns configuration
    const columns = [
        { field: 'nama_pelanggan', label: 'Nama Pelanggan' },
        { field: 'alamat_pelanggan', label: 'Alamat' },
        { field: 'nomor_meteran', label: 'Nomor Meteran' },
        { 
            field: 'nama_kelompok', 
            label: 'Kelompok',
            render: (value) => (
                <Chip 
                    label={value} 
                    size="small"
                    sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}
                />
            )
        },
        {
            field: 'actions',
            label: 'Aksi',
            render: (value, row) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        size="small"
                        sx={{ color: '#667eea' }}
                        onClick={() => console.log('Edit:', row.id)}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        sx={{ color: '#f44336' }}
                        onClick={() => console.log('Delete:', row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <PamWrapper 
            title="Data Pelanggan"
            subtitle="Kelola data pelanggan PAM"
        >
            {/* Input Form */}
            <PamCard 
                title="Tambah Pelanggan Baru"
                subtitle="Masukkan data pelanggan baru"
                icon={<AddIcon />}
                gradient="success"
                sx={{ mb: 3 }}
            >
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Nama Pelanggan"
                            value={namaPelanggan}
                            onChange={(e) => setNamaPelanggan(e.target.value)}
                            placeholder="Masukkan nama pelanggan"
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Nomor Meteran"
                            value={nomorMeteran}
                            onChange={(e) => setNomorMeteran(e.target.value)}
                            placeholder="Masukkan nomor meteran"
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Alamat"
                            value={alamatPelanggan}
                            onChange={(e) => setAlamatPelanggan(e.target.value)}
                            placeholder="Masukkan alamat pelanggan"
                            multiline
                            rows={3}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Kelompok</InputLabel>
                            <Select
                                value={selectedIdKelompok}
                                onChange={(e) => setSelectedIdKelompok(e.target.value)}
                                label="Kelompok"
                                disabled={isLoadingKelompokOptions}
                            >
                                {kelompokOptions.map((kelompok) => (
                                    <MenuItem key={kelompok.id} value={kelompok.id}>
                                        {kelompok.nama_kelompok}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <PamButton
                        variant="contained"
                        color="success"
                        disabled={isSubmittingPelanggan || !namaPelanggan || !alamatPelanggan || !nomorMeteran || !selectedIdKelompok}
                        onClick={handleSubmitPelanggan}
                    >
                        Tambah Pelanggan
                    </PamButton>
                </Box>
            </PamCard>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* Search Bar */}
            <PamCard 
                title="Cari Pelanggan"
                subtitle="Filter data pelanggan"
                icon={<SearchIcon />}
                gradient="info"
                sx={{ mb: 3 }}
            >
                <TextField
                    fullWidth
                    label="Cari pelanggan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Masukkan nama, alamat, atau nomor meteran"
                    sx={{ mb: 2 }}
                />
            </PamCard>

            {/* Data Table */}
            <PamCard 
                title="Daftar Pelanggan"
                subtitle={`Total: ${filteredPelanggan.length} pelanggan`}
                icon={<PeopleIcon />}
                gradient="primary"
            >
                <PamTable
                    columns={columns}
                    data={filteredPelanggan}
                    loading={isLoadingPelangganList}
                    error={errorPelangganList}
                />
            </PamCard>
        </PamWrapper>
    );
}

export default PelangganExample; 