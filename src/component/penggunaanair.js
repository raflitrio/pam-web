import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/axiosConfig';
import Select from 'react-select';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotificationContext';
import { sendAdminNotification } from '../utils/adminNotification';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    FormControl,
    Card,
    CardContent,
    CardMedia,
    Tooltip,
    Modal,
    Select as MuiSelect,
    MenuItem,
    InputLabel,
    Divider,
    Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useBackgroundJob } from '../utils/backgroundJobHook';

function PenggunaanAir() {
    const [dataPenggunaan, setDataPenggunaan] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [isMeteranLoading, setIsMeteranLoading] = useState(false);
    const [meteranList, setMeteranList] = useState([]);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [meteranError, setMeteranError] = useState(null);
    const [formData, setFormData] = useState({
        nama:'',
        id_meteran: '',
        tanggal_pencatatan: '',
        angka_meter_sekarang: '',
        petugas_pencatat: ''
    });
    const [currentEditingIdPenggunaan, setCurrentEditingIdPenggunaan] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedBuktiFoto, setSelectedBuktiFoto] = useState(null);
    const [previewBuktiFoto, setPreviewBuktiFoto] = useState(null);
    const [openImageModal, setOpenImageModal] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');
    const [selectedInputType, setSelectedInputType] = useState('');
    const { isAuthenticated, userData } = useAuth();
    const { submitToBackground } = useBackgroundJob();
    const { showSuccess, showError } = useNotification();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (!isAuthenticated) {
            setError('Autentikasi diperlukan atau token tidak valid. Silakan login kembali.');
            setIsLoading(false);
            setDataPenggunaan([]);
            return;
        }
        try {
            const response = await apiClient.get(`/penggunaanair`);
            let data = response.data.data || [];
            // Jika admin, filter data berdasarkan petugas_pencatat = username
            if (userData && userData.role === 'admin') {
                data = data.filter(item => item.petugas_pencatat === userData.username);
            }
            setDataPenggunaan(data);
        } catch (err) {
            let errMsg = err.response?.data?.message || err.message || 'Gagal mengambil data penggunaan air';
            if (err.response?.status === 401 || err.response?.status === 403) {
                 errMsg = 'Sesi Anda berakhir atau tidak valid. Silakan login kembali.';
            }
            setError(errMsg);
            setDataPenggunaan([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, userData]);

    const fetchMeteranPelanggan = useCallback(async () => {
        setIsMeteranLoading(true);
        setMeteranError(null);
        if (!isAuthenticated) {
            setMeteranError('Autentikasi diperlukan untuk mengambil data meteran.');
            setIsMeteranLoading(false);
            return;
        }
        try {
            const response = await apiClient.get(`/meteranair/withpelanggan`);
            setMeteranList(response.data.data || []);
        } catch (err) {
            setMeteranError(err.response?.data?.message || err.message || 'Gagal mengambil data meteran/pelanggan');
            setMeteranList([]);
        } finally {
            setIsMeteranLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
            fetchMeteranPelanggan();
        }
    }, [isAuthenticated, fetchData, fetchMeteranPelanggan]);

    useEffect(() => {
        if (userData?.username && !currentEditingIdPenggunaan) {
            setFormData(prevState => ({
                ...prevState,
                petugas_pencatat: userData.username
            }));
        }
    }, [userData, currentEditingIdPenggunaan]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleMeteranChange = (selectedOption) => {
        setFormData(prevState => ({
            ...prevState,
            id_meteran: selectedOption ? selectedOption.value : ''
        }));
        if (formError && selectedOption) {
            setFormError(null);
        }
    }

    const handleBuktiFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedBuktiFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewBuktiFoto(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedBuktiFoto(null);
            setPreviewBuktiFoto(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsFormLoading(true);
        setFormError(null);

        if (!isAuthenticated) {
            setFormError('Autentikasi diperlukan. Silakan login kembali.');
            setIsFormLoading(false);
            return;
        }

        if (!formData.id_meteran || !formData.tanggal_pencatatan || !formData.angka_meter_sekarang) {
            setFormError("Field Pelanggan, Tanggal Pencatatan, dan Angka Meter Sekarang wajib diisi.");
            setIsFormLoading(false);
            return;
        }
        if (isNaN(parseFloat(formData.angka_meter_sekarang))) {
            setFormError("Angka meter sekarang harus berupa angka.");
            setIsFormLoading(false);
            return;
        }

        const submissionData = new FormData();
        submissionData.append('id_meteran', formData.id_meteran);
        submissionData.append('tanggal_pencatatan', formData.tanggal_pencatatan);
        submissionData.append('pemakaian_air', formData.angka_meter_sekarang);

        if (currentEditingIdPenggunaan) {
            submissionData.append('id_penggunaan', currentEditingIdPenggunaan);
        }

        if (selectedBuktiFoto) {
            submissionData.append('bukti_foto', selectedBuktiFoto);
        }

        try {
            const result = await submitToBackground(
                'penggunaan-air/queue',
                submissionData,
                'penggunaan_air',
                `Input data penggunaan air untuk meteran ${formData.id_meteran}`
            );

            if (result.success) {
                showSuccess('Data telah ditambahkan ke antrian pemrosesan. Anda dapat melanjutkan aktivitas lain sambil menunggu data selesai diproses.');
                
                // Send admin notification for success
                sendAdminNotification(
                    'success',
                    'Input Penggunaan Air Berhasil',
                    `Data penggunaan air untuk meteran ${formData.id_meteran} berhasil ditambahkan ke antrian pemrosesan.`
                );
                
                setFormData({
                    nama:'',
                    id_meteran: '',
                    tanggal_pencatatan: '',
                    angka_meter_sekarang: '',
                    petugas_pencatat: userData?.username || ''
                });
                setCurrentEditingIdPenggunaan(null);
                setSelectedBuktiFoto(null);
                setPreviewBuktiFoto(null);
                setSelectedInputType('');
                
                setTimeout(() => {
                    fetchData();
                }, 3000);
            } else {
                showError(result.error || 'Gagal menambahkan data ke antrian');
                
                // Send admin notification for failure
                sendAdminNotification(
                    'error',
                    'Input Penggunaan Air Gagal',
                    `Gagal menambahkan data penggunaan air untuk meteran ${formData.id_meteran} ke antrian: ${result.error || 'Unknown error'}`
                );
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || (currentEditingIdPenggunaan ? 'Gagal memperbarui data' : 'Gagal menambahkan data');
            showError(errorMessage);
            
            // Send admin notification for error
            sendAdminNotification(
                'error',
                'Input Penggunaan Air Error',
                `Error saat input data penggunaan air untuk meteran ${formData.id_meteran}: ${errorMessage}`
            );
        } finally {
            setIsFormLoading(false);
        }
    };

    const handleDelete = async (id, idMeteran) => {
        if (!isAuthenticated) {
            showError('Autentikasi diperlukan. Silakan login kembali.');
            return;
        }
        const namaPelanggan = dataPenggunaan.find(item => item.id_penggunaan === id)?.nama;
        const confirmMessage = namaPelanggan
            ? `Apakah Anda yakin ingin menghapus data penggunaan untuk ${namaPelanggan} (Meteran: ${idMeteran})?`
            : `Apakah Anda yakin ingin menghapus data dengan ID Penggunaan ${id} (Meteran: ${idMeteran})?`;

        if (window.confirm(confirmMessage)) {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.delete(`/penggunaanair/delete/${id}`);
                showSuccess(response.data.message || 'Data berhasil dihapus!');
                
                // Send admin notification for success
                sendAdminNotification(
                    'success',
                    'Hapus Data Penggunaan Air Berhasil',
                    `Data penggunaan air untuk meteran ${idMeteran} berhasil dihapus.`
                );
                
                fetchData();
            } catch (err) {
                showError(err.response?.data?.message || err.message || 'Gagal menghapus data');
                
                // Send admin notification for failure
                sendAdminNotification(
                    'error',
                    'Hapus Data Penggunaan Air Gagal',
                    `Gagal menghapus data penggunaan air untuk meteran ${idMeteran}: ${err.response?.data?.message || err.message || 'Unknown error'}`
                );
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleUpdate = (itemToEdit) => {
        setCurrentEditingIdPenggunaan(itemToEdit.id_penggunaan);
        setFormData({
            id_meteran: itemToEdit.id_meteran,
            tanggal_pencatatan: itemToEdit.tanggal_pencatatan ? new Date(itemToEdit.tanggal_pencatatan).toISOString().split('T')[0] : '',
            angka_meter_sekarang: itemToEdit.angka_meter_sekarang || '',
            petugas_pencatat: itemToEdit.petugas_pencatat,
            bukti_foto_path: itemToEdit.bukti_foto_path
        });
        setFormError(null);
        setSelectedBuktiFoto(null);
        setPreviewBuktiFoto(itemToEdit.bukti_foto_path ? `${apiClient.defaults.baseURL.replace('/api', '')}/${itemToEdit.bukti_foto_path}` : null);
        setSelectedInputType('manual');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setCurrentEditingIdPenggunaan(null);
        setFormData({
            nama:'',
            id_meteran: '',
            tanggal_pencatatan: '',
            angka_meter_sekarang: '',
            petugas_pencatat: userData?.username || ''
        });
        setFormError(null);
        setSelectedBuktiFoto(null);
        setPreviewBuktiFoto(null);
        setSelectedInputType('');
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setFormError(null);
        setError(null);
    };

    const handleFileUpload = async () => {
        if (!isAuthenticated) {
            showError('Autentikasi diperlukan. Silakan login kembali.');
            return;
        }
        if (!selectedFile) {
            showError("Pilih file terlebih dahulu.");
            return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('dataFile', selectedFile);

        setIsFormLoading(true);
        setFormError(null);
        setError(null);

        try {
            const result = await submitToBackground(
                'file-upload/queue',
                uploadFormData,
                'file_upload',
                `Upload file ${selectedFile.name} untuk data penggunaan air`
            );

            if (result.success) {
                showSuccess('File telah ditambahkan ke antrian pemrosesan. Anda dapat melanjutkan aktivitas lain sambil menunggu file selesai diproses.');
                
                // Send admin notification for success
                sendAdminNotification(
                    'success',
                    'Upload File Penggunaan Air Berhasil',
                    `File ${selectedFile.name} berhasil ditambahkan ke antrian pemrosesan untuk data penggunaan air.`
                );
                
                setSelectedFile(null);
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.value = null;
                }
                setSelectedInputType('');
                
                setTimeout(() => {
                    fetchData();
                }, 5000);
            } else {
                showError(result.error || 'Gagal menambahkan file ke antrian');
                
                // Send admin notification for failure
                sendAdminNotification(
                    'error',
                    'Upload File Penggunaan Air Gagal',
                    `Gagal menambahkan file ${selectedFile.name} ke antrian: ${result.error || 'Unknown error'}`
                );
            }
        } catch (err) {
            const errorData = err.response?.data;
            const uploadErrorMessage = errorData?.message || err.message || 'Gagal mengunggah file';
            showError(uploadErrorMessage);
            
            // Send admin notification for error
            sendAdminNotification(
                'error',
                'Upload File Penggunaan Air Error',
                `Error saat upload file ${selectedFile.name}: ${uploadErrorMessage}`
            );
        } finally {
            setIsFormLoading(false);
        }
    };

    const meteranOptions = meteranList.map(m => ({
        value: m.id_meteran,
        label: `${m.nama_pelanggan} (${m.id_meteran})`
    }));

    const getApiOrigin = (baseUrl) => {
        if (!baseUrl) return '';
        try {
          const url = new URL(baseUrl);
          return `${url.protocol}//${url.host}`;
        } catch (e) {
          const parts = baseUrl.split('/');
          if (parts.length >= 3 && parts[0].includes(':') && parts[1] === '') {
              return `${parts[0]}//${parts[2]}`;
          }
          return '';
        }
      };
    const selectedMeteranValue = meteranOptions.find(option => option.value === formData.id_meteran);
    const BACKEND_BASE_URL = getApiOrigin(apiClient.defaults.baseURL);

    const handleOpenImageModal = (imageUrl) => {
        setModalImageUrl(imageUrl);
        setOpenImageModal(true);
    };

    const handleCloseImageModal = () => {
        setOpenImageModal(false);
        setModalImageUrl('');
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
                    Atur Penggunaan Air
                </Typography>
                <Typography variant="h6" sx={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontWeight: 400 
                }}>
                    Input dan kelola data penggunaan air pelanggan
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
                        <MuiSelect
                            value={selectedInputType}
                            onChange={(e) => setSelectedInputType(e.target.value)}
                            label="Pilih Jenis Input"
                        >
                            <MenuItem value="">Pilih Jenis Inputan</MenuItem>
                            <MenuItem value="manual">Input Manual</MenuItem>
                            <MenuItem value="file">Upload File</MenuItem>
                        </MuiSelect>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Form Input Manual */}
            {selectedInputType === 'manual' && (
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
                            <Box sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)', borderRadius: 1, p: 0.5, mr: 1.5 }}>
                                <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            {currentEditingIdPenggunaan ? 'Edit Data Penggunaan' : 'Tambah Data Penggunaan'}
                        </Typography>
                        {formError && <Alert severity="error" onClose={() => setFormError(null)} sx={{ mb: 2 }}>{formError}</Alert>}
                        {meteranError && (
                            <Alert severity="warning" onClose={() => setMeteranError(null)} sx={{ mb: 2 }}>Error Dropdown: {meteranError}</Alert>
                        )}
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <Select
                                            options={meteranOptions}
                                            value={selectedMeteranValue}
                                            label="Pelanggan (ID Meteran)"
                                            onChange={handleMeteranChange}
                                            placeholder="Cari atau pilih pelanggan..."
                                            isClearable
                                            isSearchable
                                            isLoading={isMeteranLoading}
                                            isDisabled={isFormLoading || isMeteranLoading || !!meteranError || !!currentEditingIdPenggunaan}
                                            noOptionsMessage={() => isMeteranLoading ? 'Memuat data pelanggan...' : (meteranError ? 'Gagal memuat data' : 'Tidak ada pelanggan/meteran ditemukan')}
                                            classNamePrefix="react-select"
                                            inputId="id_meteran_select"
                                            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                                            menuPosition="fixed"
                                            styles={{
                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                menu: base => ({ ...base, zIndex: 9999 })
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="tanggal_pencatatan"
                                        label="Per Tanggal"
                                        type="date"
                                        value={formData.tanggal_pencatatan}
                                        onChange={handleInputChange}
                                        disabled={isFormLoading}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="angka_meter_sekarang"
                                        label="Angka Meter Sekarang (m³)"
                                        type="number"
                                        value={formData.angka_meter_sekarang}
                                        onChange={handleInputChange}
                                        disabled={isFormLoading}
                                        inputProps={{ step: "0.01", min: "0" }}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            disabled={isFormLoading}
                                            size="small"
                                        >
                                            Pilih Foto
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleBuktiFotoChange}
                                            />
                                        </Button>
                                        {previewBuktiFoto && (
                                            <Card sx={{ mt: 2, maxWidth: 200 }}>
                                                <CardMedia
                                                    component="img"
                                                    height="150"
                                                    image={previewBuktiFoto}
                                                    alt="Preview Bukti Foto"
                                                    sx={{ objectFit: 'contain' }}
                                                />
                                            </Card>
                                        )}
                                        {!previewBuktiFoto && currentEditingIdPenggunaan && formData.bukti_foto_path && (
                                             <Typography variant="caption" sx={{mt:1, display:'block'}}>
                                                Foto saat ini: {formData.bukti_foto_path.split('/').pop()}
                                             </Typography>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="petugas_pencatat"
                                        label="Petugas Pencatat"
                                        type="text"
                                        value={currentEditingIdPenggunaan ? formData.petugas_pencatat : (userData?.username || '')}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="small"
                                    disabled={isFormLoading || ( !currentEditingIdPenggunaan && (isMeteranLoading || !formData.id_meteran || !!meteranError))}
                                    startIcon={isFormLoading ? <CircularProgress size={16} color="inherit"/> : null}
                                    sx={{
                                        background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                                        borderRadius: 2,
                                        px: 4,
                                        py: 1.5,
                                        fontWeight: 600,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1976D2 0%, #00BCD4 100%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(33, 203, 243, 0.3)'
                                        }
                                    }}
                                >
                                    {currentEditingIdPenggunaan ? 'Simpan Perubahan' : 'Tambah Data'}
                                </Button>
                                {currentEditingIdPenggunaan && (
                                    <Button 
                                        variant="outlined" 
                                        onClick={handleCancelEdit} 
                                        disabled={isFormLoading} 
                                        size="small"
                                    >
                                        Batal Edit
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Form Upload File */}
            {selectedInputType === 'file' && (
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
                            <Box sx={{ background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)', borderRadius: 1, p: 0.5, mr: 1.5 }}>
                                <CloudUploadIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            Upload Data dari File (CSV/Excel)
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    disabled={isFormLoading}
                                    startIcon={<CloudUploadIcon />}
                                    size="small"
                                >
                                    Pilih File
                                    <input
                                        type="file"
                                        hidden
                                        id="fileInput"
                                        accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                                {selectedFile && <Typography variant="body2">File terpilih: {selectedFile.name}</Typography>}
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    onClick={handleFileUpload}
                                    disabled={isFormLoading || !selectedFile}
                                    startIcon={isFormLoading ? <CircularProgress size={16} color="inherit"/> : null}
                                    size="small"
                                    sx={{
                                        background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
                                        borderRadius: 2,
                                        px: 4,
                                        py: 1.5,
                                        fontWeight: 600,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #009688 0%, #689f38 100%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(0, 176, 155, 0.3)'
                                        }
                                    }}
                                >
                                    Upload File
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* Data Section */}
            <Card sx={{ 
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333', display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)', borderRadius: 1, p: 0.5, mr: 1.5 }}>
                            <EditIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        Data Penggunaan Air
                    </Typography>
                    {isLoading && dataPenggunaan.length === 0 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Memuat data tabel... <CircularProgress size={20} sx={{ ml: 1 }} />
                        </Alert>
                    )}
                    {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>Error Tabel: {error}</Alert>}
                    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Pelanggan (ID Meteran)</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tanggal Pencatatan</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Angka Meter Sekarang (m³)</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Petugas Pencatat</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Bukti Foto</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading && dataPenggunaan.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <CircularProgress /> Memuat...
                                        </TableCell>
                                    </TableRow>
                                ) : !isLoading && dataPenggunaan.length === 0 && !error ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Tidak ada data penggunaan air.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    dataPenggunaan.map((item) => (
                                        <TableRow key={item.id_penggunaan} sx={{ '&:hover': { backgroundColor: 'rgba(33, 203, 243, 0.05)' } }}>
                                            <TableCell>{item.nama ? `${item.nama} (${item.id_meteran})` : item.id_meteran}</TableCell>
                                            <TableCell>{new Date(item.tanggal_pencatatan).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell>{item.angka_meter_sekarang !== null ? item.angka_meter_sekarang : '-'}</TableCell>
                                            <TableCell>{item.petugas_pencatat}</TableCell>
                                            <TableCell>
                                                {item.bukti_foto_path ? (
                                                    <Tooltip title="Lihat Bukti Foto">
                                                        <Box
                                                            onClick={() => handleOpenImageModal(`${BACKEND_BASE_URL}/${item.bukti_foto_path}`)}
                                                            sx={{ cursor: 'pointer' }}
                                                        >
                                                            <img
                                                                src={`${BACKEND_BASE_URL}/${item.bukti_foto_path}`}
                                                                alt="Bukti"
                                                                style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                                                            />
                                                        </Box>
                                                    </Tooltip>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    onClick={() => handleUpdate(item)}
                                                    disabled={isLoading || isFormLoading}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(item.id_penggunaan, item.id_meteran)}
                                                    disabled={isLoading || isFormLoading}
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

            <Modal
                open={openImageModal}
                onClose={handleCloseImageModal}
                aria-labelledby="image-modal-title"
                aria-describedby="image-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 1,
                    outline: 'none',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                }}>
                    <img src={modalImageUrl} alt="Bukti Foto Detail" style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 16px)', display: 'block' }} />
                </Box>
            </Modal>
        </Box>
    );
}

export default PenggunaanAir;
