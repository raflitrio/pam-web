import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/axiosConfig';
import { useAuth } from '../utils/AuthContext';
import { useBackgroundJob } from '../utils/backgroundJobHook';
import { useNotification } from '../utils/NotificationContext';
import { sendAdminNotification } from '../utils/adminNotification';
import {
  Container,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const Pelanggan = () => {
  const initialFormData = {
    nama: '', pekerjaan: '', no_telp: '', nik: '',  nama_perusahaan: '', jml_peng: '', dyl: '', status_rumah: '',
    id_pelanggan: '',
    users_id: '',
    id_kelompok: '',
    alamat: '', kelurahan: '', kecamatan: '', kota: '', provinsi: '', kode_pos: '',
    diameter: '', lokasi_pasang: '', tanggal_pasang: '', status: '',
    keterangan: '',
    email_pelanggan: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [pelangganList, setPelangganList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [isModalUpdateAlamatOpen, setIsModalUpdateAlamatOpen] = useState(false);
  const [isModalUpdateMeteranOpen, setIsModalUpdateMeteranOpen] = useState(false);
  const [isModalFetchOpen, setIsModalFetchOpen] = useState(false);
  const [isModalAlamatOpen, setIsModalAlamatOpen] = useState(false);
  const [isModalMeteranOpen, setIsModalMeteranOpen] = useState(false);
  const [isModalEmailOpen, setIsModalEmailOpen] = useState(false);
  const [isModalAlamatFetchOpen, setIsModalAlamatFetchOpen] = useState(false);
  const [isModalMeteranFetchOpen, setIsModalMeteranFetchOpen] = useState(false);
  const [selectedPelanggan, setSelectedPelanggan] = useState(null);
  const [selectedAlamat, setSelectedAlamat] = useState(null);
  const [selectedMeteran, setSelectedMeteran] = useState(null);
  const [error, setError] = useState('');
  const [kelompokOptions, setKelompokOptions] = useState([]);
  const [isLoadingKelompok, setIsLoadingKelompok] = useState(false);
  const [errorKelompok, setErrorKelompok] = useState('');

  const [isFetchingList, setIsFetchingList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingPelangganId, setDeletingPelangganId] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const [groupedPelangganData, setGroupedPelangganData] = useState({});
  const [directlyFilteredPelangganList, setDirectlyFilteredPelangganList] = useState([]);
  const [expandedKecamatan, setExpandedKecamatan] = useState({});
  const [expandedKelurahan, setExpandedKelurahan] = useState({});

  const { isAuthenticated, logout, userData } = useAuth();
  const { submitToBackground } = useBackgroundJob();
  const { showSuccess, showError, showInfo } = useNotification();

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'auto',
    maxWidth: '90vw',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto'
  };

  const handleApiError = useCallback((error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        showError('Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.');
        logout();
      } else {
        setError(error.response.data?.message || 'Terjadi kesalahan server.');
      }
    } else if (error.request) {
      setError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    } else {
      setError(`Terjadi kesalahan: ${error.message}`);
    }
  }, [logout, showError]);

  const fetchPelanggan = useCallback(async () => {
    setIsFetchingList(true);
    setError('');
    if (!isAuthenticated) {
      setError("Autentikasi diperlukan. Silakan login kembali.");
      setIsFetchingList(false);
      return;
    }
    try {
      const response = await apiClient.get(`/pelanggan`);
      if (response.data.success && Array.isArray(response.data.data)) {
        let data = response.data.data;
        if (userData && userData.role === 'admin') {
          data = data.filter(item => item.users_id === userData.users_id);
        }
        setPelangganList(data);
      } else {
        setPelangganList([]);
        setError(response.data?.message || 'Gagal mengambil data pelanggan dengan format respons yang tidak diharapkan.');
      }
    } catch (error) {
      handleApiError(error);
      setPelangganList([]);
    } finally {
      setIsFetchingList(false);
    }
  }, [isAuthenticated, handleApiError, userData]);

  const fetchKelompokOptions = useCallback(async () => {
    setIsLoadingKelompok(true);
    setErrorKelompok('');
    if (!isAuthenticated) {
      setErrorKelompok("Autentikasi diperlukan untuk mengambil data kelompok.");
      setIsLoadingKelompok(false);
      return;
    }
    try {
      const response = await apiClient.get(`/kelompok`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setKelompokOptions(response.data.data);
      } else {
        setErrorKelompok(response.data?.message || 'Gagal mengambil data kelompok.');
        setKelompokOptions([]);
      }
    } catch (error) {
      handleApiError(error);
      setErrorKelompok(error.response?.data?.message || 'Terjadi kesalahan saat mengambil opsi kelompok.');
      setKelompokOptions([]);
    } finally {
      setIsLoadingKelompok(false);
    }
  }, [isAuthenticated, handleApiError]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPelanggan();
      fetchKelompokOptions();
    } else {
      setPelangganList([]);
      setGroupedPelangganData({});
      setDirectlyFilteredPelangganList([]);
    }
  }, [isAuthenticated, fetchPelanggan, fetchKelompokOptions]);

  useEffect(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (keyword === '') {
      const newGroupedData = pelangganList.reduce((acc, pelanggan) => {
          const kecamatanKey = pelanggan.kecamatan || 'Kecamatan Tidak Diketahui';
          const kelurahanKey = pelanggan.kelurahan || 'Kelurahan Tidak Diketahui';

          if (!acc[kecamatanKey]) acc[kecamatanKey] = {};
          if (!acc[kecamatanKey][kelurahanKey]) acc[kecamatanKey][kelurahanKey] = [];
          acc[kecamatanKey][kelurahanKey].push(pelanggan);
          return acc;
      }, {});
      setGroupedPelangganData(newGroupedData);
      setDirectlyFilteredPelangganList([]);
    } else {
      const filtered = pelangganList.filter((pelanggan) =>
        (pelanggan.nama?.toLowerCase() || '').includes(keyword)
      );
      setDirectlyFilteredPelangganList(filtered);
      setGroupedPelangganData({});
    }
  }, [pelangganList, searchKeyword]);

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!isAuthenticated) {
      setError("Autentikasi diperlukan. Silakan login kembali.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.nama || !formData.pekerjaan || !formData.no_telp || !formData.nik || !formData.jml_peng || !formData.dyl || !formData.status_rumah || !formData.id_kelompok) {
        setError('Semua field data pelanggan (kecuali Nama Perusahaan) wajib diisi untuk melanjutkan.');
        setIsSubmitting(false);
        return;
    }
    setError('');
    setIsModalOpen(false);
    setIsModalAlamatOpen(true);
    setIsSubmitting(false);
  };

  const handleSubmitAlamat = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    if (!isAuthenticated) {
      setError("Autentikasi diperlukan. Silakan login kembali.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.alamat || !formData.kelurahan || !formData.kecamatan || !formData.kota || !formData.provinsi || !formData.kode_pos) {
        setError("Semua field alamat wajib diisi untuk melanjutkan.");
        setIsSubmitting(false);
        return;
    }
    setError('');
    setIsModalAlamatOpen(false);
    setIsModalMeteranOpen(true);
    setIsSubmitting(false);
  };

  const handleSubmitMeteran = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    if (!isAuthenticated) {
      setError("Autentikasi diperlukan. Silakan login kembali.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.diameter || !formData.lokasi_pasang || !formData.tanggal_pasang || !formData.status) {
      setError("Semua field meteran wajib diisi untuk melanjutkan.");
      setIsSubmitting(false);
      return;
    }
    setError('');
    setIsModalMeteranOpen(false);
    setIsModalEmailOpen(true);
    setIsSubmitting(false);
  };

  const handleFinalSubmitSequence = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!isAuthenticated) {
      setError("Autentikasi diperlukan. Silakan login kembali.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.nama || !formData.pekerjaan || !formData.no_telp || !formData.nik || !formData.jml_peng || !formData.dyl || !formData.status_rumah || !formData.id_kelompok) {
      setError('Semua field data pelanggan (kecuali Nama Perusahaan) wajib diisi untuk melanjutkan.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.alamat || !formData.kelurahan || !formData.kecamatan || !formData.kota || !formData.provinsi || !formData.kode_pos) {
      setError("Semua field alamat wajib diisi untuk melanjutkan.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.diameter || !formData.lokasi_pasang || !formData.tanggal_pasang || !formData.status) {
      setError("Semua field meteran wajib diisi untuk melanjutkan.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.email_pelanggan) {
      setError("Email pelanggan wajib diisi untuk melanjutkan.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitToBackground(
        'pelanggan/queue',
        formData,
        'pelanggan',
        `Input data pelanggan ${formData.nama}`
      );

      if (result.success) {
        setError('');
        resetFormStates();
        setIsModalEmailOpen(false);
        setIsModalMeteranOpen(false);
        setIsModalAlamatOpen(false);
        setIsModalOpen(false);
        
        showSuccess('Data pelanggan telah ditambahkan ke antrian pemrosesan. Anda dapat melanjutkan aktivitas lain sambil menunggu data selesai diproses.');
        
        // Send admin notification for success
        sendAdminNotification(
          'success',
          'Input Data Pelanggan Berhasil',
          `Data pelanggan ${formData.nama} berhasil ditambahkan ke antrian pemrosesan.`
        );
        
        setTimeout(() => {
          fetchPelanggan();
        }, 3000);
      } else {
        setError(result.error || 'Gagal menambahkan data pelanggan ke antrian');
        
        // Send admin notification for failure
        sendAdminNotification(
          'error',
          'Input Data Pelanggan Gagal',
          `Gagal menambahkan data pelanggan ${formData.nama} ke antrian: ${result.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error submitting pelanggan:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data pelanggan.');
      
      // Send admin notification for error
      sendAdminNotification(
        'error',
        'Input Data Pelanggan Error',
        `Error saat input data pelanggan ${formData.nama}: ${error.response?.data?.message || error.message || 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormStates = () => {
      setFormData(initialFormData);
  };

  const handleDelete = async (pelangganToDelete) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data pelanggan ${pelangganToDelete.nama} beserta alamat dan meteran terkait?`)) {
      setIsDeleting(true);
      setDeletingPelangganId(pelangganToDelete.id_pelanggan);
      setError('');
      if (!isAuthenticated) {
        setError("Autentikasi diperlukan. Silakan login kembali.");
        setIsDeleting(false);
        setDeletingPelangganId(null);
        return;
      }
      try {
        const response = await apiClient.delete(`/pelanggan/delete/${pelangganToDelete.id_pelanggan}`);
        if (response.data.success) {
          showSuccess('Data berhasil dihapus!');
          
          // Send admin notification for success
          sendAdminNotification(
            'success',
            'Hapus Data Pelanggan Berhasil',
            `Data pelanggan ${pelangganToDelete.nama} berhasil dihapus.`
          );
          
          fetchPelanggan();
        } else {
          setError(response.data?.message || 'Gagal menghapus data.');
          
          // Send admin notification for failure
          sendAdminNotification(
            'error',
            'Hapus Data Pelanggan Gagal',
            `Gagal menghapus data pelanggan ${pelangganToDelete.nama}: ${response.data?.message || 'Unknown error'}`
          );
        }
      } catch (error) {
        handleApiError(error);
        
        // Send admin notification for error
        sendAdminNotification(
          'error',
          'Hapus Data Pelanggan Error',
          `Error saat menghapus data pelanggan ${pelangganToDelete.nama}: ${error.response?.data?.message || error.message || 'Unknown error'}`
        );
      } finally {
        setIsDeleting(false);
        setDeletingPelangganId(null);
      }
    }
  };

  const handleUpdate = async (e, andThen) => {
    e.preventDefault(); // Pastikan event default dicegah
    if (!selectedPelanggan || !selectedPelanggan.id_pelanggan) {
      setError('Data pelanggan tidak valid untuk diperbarui.');
      return;
    }
    setIsUpdating(true);
    setError('');
    if (!isAuthenticated) {
      setError("Autentikasi diperlukan. Silakan login kembali.");
      setIsUpdating(false);
      return;
    }
    try {
      const response = await apiClient.put(
        `/pelanggan/update/${selectedPelanggan.id_pelanggan}`,
        selectedPelanggan);
      if (response.data.success) {
        if (andThen === 'next') {
          if (!selectedAlamat) {
            setError('Data alamat tidak termuat, tidak bisa melanjutkan. Anda bisa menyimpan data pelanggan saja.');
            setIsUpdating(false);
            fetchPelanggan(); // refresh data
            return;
          }
          setIsModalUpdateOpen(false);
          setIsModalUpdateAlamatOpen(true);
        } else {
          showSuccess('Data pelanggan berhasil diperbarui!');
          
          // Send admin notification for success
          sendAdminNotification(
            'success',
            'Update Data Pelanggan Berhasil',
            `Data pelanggan ${selectedPelanggan.nama} berhasil diperbarui.`
          );
          
          closeUpdateModal();
          fetchPelanggan();
        }
      } else {
        setError(response.data?.message || 'Gagal memperbarui data.');
        
        // Send admin notification for failure
        sendAdminNotification(
          'error',
          'Update Data Pelanggan Gagal',
          `Gagal memperbarui data pelanggan ${selectedPelanggan.nama}: ${response.data?.message || 'Unknown error'}`
        );
      }
    } catch (error) {
      handleApiError(error);
      
      // Send admin notification for error
      sendAdminNotification(
        'error',
        'Update Data Pelanggan Error',
        `Error saat update data pelanggan ${selectedPelanggan.nama}: ${error.response?.data?.message || error.message || 'Unknown error'}`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAlamat = async (e, andThen) => {
    e.preventDefault();
    if (!selectedAlamat || !selectedAlamat.id_pelanggan) {
      setError('Data alamat tidak valid untuk diperbarui.');
      return;
    }
    setIsUpdating(true);
    setError('');
    try {
      const response = selectedAlamat.id_alamat
        ? await apiClient.put(`/alamat_pelanggan/${selectedAlamat.id_alamat}`, selectedAlamat)
        : await apiClient.post('/alamat_pelanggan/input', selectedAlamat);

      if (response.data.success) {
        if (andThen === 'next') {
          if (!selectedMeteran) {
            showInfo('Data alamat berhasil disimpan. Data meteran tidak ditemukan, proses update selesai.');
            closeUpdateModal();
            fetchPelanggan();
            return;
          }
          setIsModalUpdateAlamatOpen(false);
          setIsModalUpdateMeteranOpen(true);
        } else {
          showSuccess('Data alamat berhasil diperbarui!');
          
          // Send admin notification for success
          sendAdminNotification(
            'success',
            'Update Alamat Pelanggan Berhasil',
            `Data alamat pelanggan ${selectedPelanggan?.nama} berhasil diperbarui.`
          );
          
          closeUpdateModal();
          fetchPelanggan();
        }
      } else {
        setError(response.data?.message || 'Gagal memperbarui data alamat.');
        
        // Send admin notification for failure
        sendAdminNotification(
          'error',
          'Update Alamat Pelanggan Gagal',
          `Gagal memperbarui data alamat pelanggan ${selectedPelanggan?.nama}: ${response.data?.message || 'Unknown error'}`
        );
      }
    } catch (error) {
      handleApiError(error);
      
      // Send admin notification for error
      sendAdminNotification(
        'error',
        'Update Alamat Pelanggan Error',
        `Error saat update data alamat pelanggan ${selectedPelanggan?.nama}: ${error.response?.data?.message || error.message || 'Unknown error'}`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateMeteran = async (e) => {
    e.preventDefault();
    if (!selectedMeteran || !selectedMeteran.id_meteran) {
      setError('Data meteran tidak valid untuk diperbarui.');
      return;
    }
    setIsUpdating(true);
    setError('');
    try {
      const response = await apiClient.put(`/meteran-air/update/${selectedMeteran.id_meteran}`, selectedMeteran);
      if (response.data.success) {
        showSuccess('Semua data berhasil diperbarui!');
        
        // Send admin notification for success
        sendAdminNotification(
          'success',
          'Update Meteran Pelanggan Berhasil',
          `Data meteran pelanggan ${selectedPelanggan?.nama} berhasil diperbarui.`
        );
        
        closeUpdateModal();
        fetchPelanggan();
      } else {
        setError(response.data?.message || 'Gagal memperbarui data meteran.');
        
        // Send admin notification for failure
        sendAdminNotification(
          'error',
          'Update Meteran Pelanggan Gagal',
          `Gagal memperbarui data meteran pelanggan ${selectedPelanggan?.nama}: ${response.data?.message || 'Unknown error'}`
        );
      }
    } catch (error) {
      handleApiError(error);
      
      // Send admin notification for error
      sendAdminNotification(
        'error',
        'Update Meteran Pelanggan Error',
        `Error saat update data meteran pelanggan ${selectedPelanggan?.nama}: ${error.response?.data?.message || error.message || 'Unknown error'}`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const openAlamatFetchModal = async (pelanggan) => {
    if (!pelanggan || !pelanggan.id_pelanggan) return;
    setIsFetchingDetails(true);
    setError('');
    setSelectedAlamat(null);
    setIsModalFetchOpen(false);
    if (!isAuthenticated) {
      setError("Autentikasi diperlukan. Silakan login kembali.");
      setIsFetchingDetails(false);
      return;
    }
    try {
      const response = await apiClient.get(`/alamat_pelanggan/${pelanggan.id_pelanggan}`);
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        setSelectedAlamat(response.data.data[0]);
        setSelectedPelanggan(pelanggan);
        setIsModalAlamatFetchOpen(true);
      } else {
         showInfo('Data alamat tidak ditemukan untuk pelanggan ini.');
         setIsModalFetchOpen(true);
      }
    } catch (error) {
      handleApiError(error);
      setIsModalFetchOpen(true);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const openMeteranFetchModal = async (pelanggan) => {
    if (!pelanggan || !pelanggan.id_pelanggan) return;
    setIsFetchingDetails(true);
    setError('');
    setSelectedMeteran(null);
    setIsModalAlamatFetchOpen(false);
    if (!isAuthenticated) {
      setError("Autentikasi diperlukan. Silakan login kembali.");
      setIsFetchingDetails(false);
      return;
    }
    try {
      const response = await apiClient.get(`/meteran-air/${pelanggan.id_pelanggan}`);
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        setSelectedMeteran(response.data.data[0]);
        setSelectedPelanggan(pelanggan);
        setIsModalMeteranFetchOpen(true);
      } else {
         showInfo('Data meteran tidak ditemukan untuk pelanggan ini.');
         setIsModalAlamatFetchOpen(true);
      }
    } catch (error) {
      handleApiError(error);
      setIsModalAlamatFetchOpen(true);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const openSubmitModal = () => {
    setFormData(initialFormData);
    setError('');
    setIsModalOpen(true);
  };
  const closeSubmitModal = () => setIsModalOpen(false);

  const openUpdateModal = async (pelanggan) => {
    const { email, ...restPelanggan } = pelanggan;
    setSelectedPelanggan({ ...restPelanggan });
    setError('');
    setIsModalUpdateOpen(true);

    setIsFetchingDetails(true);
    try {
      // Fetch Alamat
      const alamatResponse = await apiClient.get(`/alamat_pelanggan/${pelanggan.id_pelanggan}`);
      if (alamatResponse.data.success && alamatResponse.data.data.length > 0) {
        setSelectedAlamat(alamatResponse.data.data[0]);
      } else {
        // Sediakan struktur default jika tidak ditemukan, agar bisa dibuat baru saat update
        setSelectedAlamat({
          id_pelanggan: pelanggan.id_pelanggan,
          alamat: '', kelurahan: '', kecamatan: '', kota: '', provinsi: '', kode_pos: ''
        });
        console.warn(`No address found for customer ${pelanggan.id_pelanggan}. A new one can be created via update.`);
      }

      // Fetch Meteran
      const meteranResponse = await apiClient.get(`/meteran-air/${pelanggan.id_pelanggan}`);
      if (meteranResponse.data.success && meteranResponse.data.data.length > 0) {
        setSelectedMeteran(meteranResponse.data.data[0]);
      } else {
        setSelectedMeteran(null); // Tidak bisa membuat meteran baru dari sini, jadi null
        console.warn(`No meter found for customer ${pelanggan.id_pelanggan}.`);
      }
    } catch (error) {
      handleApiError(error);
      setError("Gagal memuat data alamat/meteran. Anda masih bisa mengupdate data pelanggan.");
    } finally {
      setIsFetchingDetails(false);
    }
  };
  const closeUpdateModal = () => {
    setIsModalUpdateOpen(false);
    setIsModalUpdateAlamatOpen(false);
    setIsModalUpdateMeteranOpen(false);
    setSelectedPelanggan(null);
  };

  const openFetchModal = (pelanggan) => {
    setSelectedPelanggan(pelanggan);
    setSelectedAlamat(null);
    setSelectedMeteran(null);
    setError('');
    setIsModalFetchOpen(true);
  };
  const closeFetchModal = () => {
    setIsModalFetchOpen(false);
    setSelectedPelanggan(null);
    setSelectedAlamat(null);
    setSelectedMeteran(null);
  };

  const closeEmailModal = () => setIsModalEmailOpen(false);

  const closeAlamatModal = () => setIsModalAlamatOpen(false);
  const closeMeteranModal = () => setIsModalMeteranOpen(false);

  const closeAlamatFetchModal = () => {
    setIsModalAlamatFetchOpen(false);
    if (selectedPelanggan) {
        setIsModalFetchOpen(true);
    }
  };

  const closeMeteranFetchModal = () => {
    setIsModalMeteranFetchOpen(false);
    if (selectedPelanggan && selectedAlamat) {
        setIsModalAlamatFetchOpen(true);
    } else if (selectedPelanggan) {
        setIsModalFetchOpen(true);
    }
  };

  const closeAllFetchModals = () => {
      setIsModalMeteranFetchOpen(false);
      setIsModalAlamatFetchOpen(false);
      setIsModalFetchOpen(false);
      setSelectedPelanggan(null);
      setSelectedAlamat(null);
      setSelectedMeteran(null);
      resetFormStates();
  }

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedPelanggan((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateAlamatInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedAlamat((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateMeteranInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedMeteran((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleKecamatan = (kecamatan) => {
    setExpandedKecamatan(prev => ({ ...prev, [kecamatan]: !prev[kecamatan] }));
    if (expandedKecamatan[kecamatan]) { 
        setExpandedKelurahan(prev => ({...prev, [kecamatan]: {}})); 
    }
  };

  const handleToggleKelurahan = (kecamatan, kelurahan) => {
    setExpandedKelurahan(prev => ({
      ...prev,
      [kecamatan]: {
        ...(prev[kecamatan] || {}), 
        [kelurahan]: !prev[kecamatan]?.[kelurahan]
      }
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {(isSubmitting || isUpdating || isDeleting || isFetchingDetails) && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
          <Typography sx={{ ml: 1 }}>Proses...</Typography>
        </Box>
      )}
      {isFetchingList && pelangganList.length === 0 && !searchKeyword.trim() && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress color="info" />
          <Typography sx={{ ml: 1 }}>Memuat daftar pelanggan...</Typography>
        </Box>
      )}
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <TextField
          label="Cari pelanggan berdasarkan nama..."
          variant="outlined"
          value={searchKeyword}
          onChange={handleSearchChange}
          disabled={
            isFetchingList ||
            isSubmitting ||
            isUpdating ||
            isDeleting ||
            isFetchingDetails
          }
          sx={{ flexGrow: 1, mr: 2 }}
          size="small"
        />
        <Button
          variant="contained"
          onClick={openSubmitModal}
          disabled={
            isFetchingList ||
            isSubmitting ||
            isUpdating ||
            isDeleting ||
            isFetchingDetails
          }
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          Tambah Pelanggan Baru
        </Button>
      </Box>

      {!isFetchingList && (
        <Paper sx={{ p: 2, mt: 2 }}>
          {searchKeyword.trim() === '' ? (
            <>
              <Typography variant="h6" gutterBottom component="div">
                Daftar Pelanggan Berdasarkan Wilayah
              </Typography>
              {Object.keys(groupedPelangganData).length === 0 ? (
                <Typography align="center" sx={{ my: 2 }}>
                  Tidak ada data pelanggan untuk ditampilkan.
                </Typography>
              ) : (
                <List component="nav" aria-labelledby="nested-list-subheader">
                  {Object.entries(groupedPelangganData).map(([kecamatan, kelurahanData]) => (
                    <React.Fragment key={kecamatan}>
                      <ListItemButton onClick={() => handleToggleKecamatan(kecamatan)}>
                        <ListItemText primaryTypographyProps={{ fontWeight: 'bold' }} primary={`Kecamatan: ${kecamatan}`} />
                        {expandedKecamatan[kecamatan] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </ListItemButton>
                      <Collapse in={expandedKecamatan[kecamatan]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding sx={{ pl: 2 }}>
                          {Object.entries(kelurahanData).map(([kelurahan, pelangganInKelurahan]) => (
                            <React.Fragment key={kelurahan}>
                              <ListItemButton onClick={() => handleToggleKelurahan(kecamatan, kelurahan)}>
                                <ListItemText 
                                  primaryTypographyProps={{ fontStyle: 'italic' }} 
                                  primary={`Kelurahan: ${kelurahan} (${pelangganInKelurahan.length} pelanggan)`} 
                                />
                                {expandedKelurahan[kecamatan]?.[kelurahan] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </ListItemButton>
                              <Collapse in={expandedKelurahan[kecamatan]?.[kelurahan]} timeout="auto" unmountOnExit>
                                <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                                  <TableContainer component={Paper} sx={{ mt: 1, mb: 1 }}>
                                    <Table stickyHeader size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Nama</TableCell>
                                          <TableCell>Pekerjaan</TableCell>
                                          <TableCell>No. Telepon</TableCell>
                                          <TableCell>Nama Perusahaan</TableCell>
                                          <TableCell align="right">Aksi</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {pelangganInKelurahan.map((pelanggan) => (
                                          <TableRow key={pelanggan.id_pelanggan}>
                                            <TableCell>{pelanggan.nama}</TableCell>
                                            <TableCell>{pelanggan.pekerjaan}</TableCell>
                                            <TableCell>{pelanggan.no_telp}</TableCell>
                                            <TableCell>{pelanggan.nama_perusahaan || '-'}</TableCell>
                                            <TableCell align="right">
                                              <IconButton size="small" color="primary" onClick={() => openFetchModal(pelanggan)} disabled={isFetchingList || isSubmitting || isUpdating || isDeleting || isFetchingDetails}>
                                                {isFetchingDetails && selectedPelanggan?.id_pelanggan === pelanggan.id_pelanggan ? <CircularProgress size={20} /> : <VisibilityIcon fontSize="small" />}
                                              </IconButton>
                                              <IconButton size="small" color="info" onClick={() => openUpdateModal(pelanggan)} disabled={isFetchingList || isSubmitting || isUpdating || isDeleting || isFetchingDetails}>
                                                <EditIcon fontSize="small" />
                                              </IconButton>
                                              <IconButton size="small" color="error" onClick={() => handleDelete(pelanggan)} disabled={isFetchingList || isSubmitting || isUpdating || isDeleting || isFetchingDetails}>
                                                {isDeleting && deletingPelangganId === pelanggan.id_pelanggan ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
                                              </IconButton>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Box>
                              </Collapse>
                            </React.Fragment>
                          ))}
                        </List>
                      </Collapse>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom component="div">
                Hasil Pencarian Pelanggan "{searchKeyword}"
              </Typography>
              {directlyFilteredPelangganList.length === 0 ? (
                <Typography align="center" sx={{ my: 2 }}>
                  Tidak ada data pelanggan yang cocok dengan pencarian.
                </Typography>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 1, mb: 1 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nama</TableCell>
                        <TableCell>Pekerjaan</TableCell>
                        <TableCell>No. Telepon</TableCell>
                        <TableCell>Nama Perusahaan</TableCell>
                        <TableCell>Kecamatan</TableCell>
                        <TableCell>Kelurahan</TableCell>
                        <TableCell align="right">Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {directlyFilteredPelangganList.map((pelanggan) => (
                        <TableRow key={pelanggan.id_pelanggan}>
                          <TableCell>{pelanggan.nama}</TableCell>
                          <TableCell>{pelanggan.pekerjaan}</TableCell>
                          <TableCell>{pelanggan.no_telp}</TableCell>
                          <TableCell>{pelanggan.nama_perusahaan || '-'}</TableCell>
                          <TableCell>{pelanggan.kecamatan || 'N/A'}</TableCell>
                          <TableCell>{pelanggan.kelurahan || 'N/A'}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" color="primary" onClick={() => openFetchModal(pelanggan)} disabled={isFetchingList || isSubmitting || isUpdating || isDeleting || isFetchingDetails}>
                              {isFetchingDetails && selectedPelanggan?.id_pelanggan === pelanggan.id_pelanggan ? <CircularProgress size={20} /> : <VisibilityIcon fontSize="small" />}
                            </IconButton>
                            <IconButton size="small" color="info" onClick={() => openUpdateModal(pelanggan)} disabled={isFetchingList || isSubmitting || isUpdating || isDeleting || isFetchingDetails}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(pelanggan)} disabled={isFetchingList || isSubmitting || isUpdating || isDeleting || isFetchingDetails}>
                              {isDeleting && deletingPelangganId === pelanggan.id_pelanggan ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Paper>
      )}

      {isModalFetchOpen && selectedPelanggan && (
        <Modal open={isModalFetchOpen} onClose={closeFetchModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2">
              Detail Pelanggan
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                {error}
              </Alert>
            )}
            <Typography component="div" sx={{ mt: 2 }}>
              <p>
                <strong style={{ color: "black" }}>Nama:</strong>{" "}
                {selectedPelanggan.nama}
              </p>
              <p>
                <strong style={{ color: "black" }}>Pekerjaan:</strong>{" "}
                {selectedPelanggan.pekerjaan}
              </p>
              <p>
                <strong style={{ color: "black" }}>No. Telp:</strong>{" "}
                {selectedPelanggan.no_telp}
              </p>
              <p>
                <strong style={{ color: "black" }}>NIK:</strong>{" "}
                {selectedPelanggan.nik}
              </p>
              <p>
                <strong style={{ color: "black" }}>Nama Perusahaan:</strong>{" "}
                {selectedPelanggan.nama_perusahaan || "N/A"}
              </p>
              <p>
                <strong style={{ color: "black" }}>Jumlah Penghuni:</strong>{" "}
                {selectedPelanggan.jml_peng || "N/A"}
              </p>
              <p>
                <strong style={{ color: "black" }}>Daya Listrik:</strong>{" "}
                {selectedPelanggan.dyl || "N/A"}{' Watt'}
              </p>
              <p>
                <strong style={{ color: "black" }}>Status Rumah:</strong>{" "}
                {selectedPelanggan.status_rumah}
              </p>
              <p>
                <strong style={{ color: "black" }}>Kelompok:</strong>{" "}
                {kelompokOptions.find(
                  (k) => k.id_kelompok === selectedPelanggan.id_kelompok
                )?.nama_kelompok ||
                  selectedPelanggan.id_kelompok ||
                  "N/A"}{" "}
                (
                {kelompokOptions.find(
                  (k) => k.id_kelompok === selectedPelanggan.id_kelompok
                )?.sub_kelompok || ""}
                )
              </p>
            </Typography>
             {selectedPelanggan.email && (
                <p><strong style={{ color: 'black' }}>Email:</strong> {selectedPelanggan.email}</p>
             )}

            <Box
              sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
            >
              <Button onClick={closeFetchModal} disabled={isFetchingDetails}>
                Tutup
              </Button>
              <Button
                variant="contained"
                onClick={() => openAlamatFetchModal(selectedPelanggan)}
                disabled={isFetchingDetails}
                startIcon={
                  isFetchingDetails ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                Lihat Alamat
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      {isModalAlamatFetchOpen && selectedAlamat && selectedPelanggan && (
        <Modal open={isModalAlamatFetchOpen} onClose={closeAlamatFetchModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2">
              Alamat Pelanggan: {selectedPelanggan.nama}
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                {error}
              </Alert>
            )}
            <Typography component="div" sx={{ mt: 2 }}>
              <p>
                <strong style={{ color: "black" }}>Jalan:</strong>{" "}
                {selectedAlamat.alamat}
              </p>
              <p>
                <strong style={{ color: "black" }}>Kelurahan:</strong>{" "}
                {selectedAlamat.kelurahan}
              </p>
              <p>
                <strong style={{ color: "black" }}>Kecamatan:</strong>{" "}
                {selectedAlamat.kecamatan}
              </p>
              <p>
                <strong style={{ color: "black" }}>Kota:</strong>{" "}
                {selectedAlamat.kota}
              </p>
              <p>
                <strong style={{ color: "black" }}>Provinsi:</strong>{" "}
                {selectedAlamat.provinsi}
              </p>
              <p>
                <strong style={{ color: "black" }}>Kode Pos:</strong>{" "}
                {selectedAlamat.kode_pos}
              </p>
            </Typography>
            <Box
              sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
            >
              <Button
                onClick={closeAlamatFetchModal}
                disabled={isFetchingDetails}
              >
                Kembali ke Detail
              </Button>
              <Button
                variant="contained"
                onClick={() => openMeteranFetchModal(selectedPelanggan)}
                disabled={isFetchingDetails}
                startIcon={
                  isFetchingDetails ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                Lihat Meteran
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      {isModalMeteranFetchOpen &&
        selectedMeteran &&
        selectedPelanggan &&
        selectedAlamat && (
          <Modal
            open={isModalMeteranFetchOpen}
            onClose={closeMeteranFetchModal}
          >
            <Box sx={modalStyle}>
              <Typography variant="h6" component="h2">
                Meteran Pelanggan: {selectedPelanggan.nama}
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                  {error}
                </Alert>
              )}
              <Typography component="div" sx={{ mt: 2 }}>
                <p>
                  <strong style={{ color: "black" }}>Diameter:</strong>{" "}
                  {selectedMeteran.diameter}
                </p>
                <p>
                  <strong style={{ color: "black" }}>Lokasi Pasang:</strong>{" "}
                  {selectedMeteran.lokasi_pasang}
                </p>
                <p>
                  <strong style={{ color: "black" }}>Tanggal Pasang:</strong>{" "}
                  {selectedMeteran.tanggal_pasang
                    ? new Date(
                        selectedMeteran.tanggal_pasang
                      ).toLocaleDateString("id-ID")
                    : "-"}
                </p>
                <p>
                  <strong style={{ color: "black" }}>Status:</strong>{" "}
                  {selectedMeteran.status}
                </p>
                {selectedMeteran.keterangan && (
                  <p>
                    <strong style={{ color: "black" }}>Keterangan:</strong>{" "}
                    {selectedMeteran.keterangan}
                  </p>
                )}
              </Typography>
              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  onClick={closeMeteranFetchModal}
                  disabled={isFetchingDetails}
                >
                  Kembali ke Alamat
                </Button>
                <Button
                  onClick={closeAllFetchModals}
                  disabled={isFetchingDetails}
                >
                  Tutup Semua
                </Button>
              </Box>
            </Box>
          </Modal>
        )}

      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={isSubmitting ? undefined : closeSubmitModal}
        >
          <Box sx={{ ...modalStyle, width: 1000 }}>
            {" "}
            <Typography variant="h6" component="h2">
              Input Data Pelanggan
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nama"
                    name="nama"
                    placeholder="Nama Lengkap"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    required
                    disabled={isSubmitting}
                    size="small"
                  >
                    <InputLabel>Pekerjaan</InputLabel>
                    <Select
                      name="pekerjaan"
                      value={formData.pekerjaan}
                      label="Pekerjaan"
                      onChange={handleChange}
                      size="small"
                      sx={{
                        minWidth: 150,
                        fontSize: 14,
                        maxWidth: 200,
                        mx: "auto",
                        display: "block",
                      }}
                    >
                      <MenuItem value="">Pilih Jenis Pekerjaan</MenuItem>
                      <MenuItem value="PNS">Pegawai Negeri Sipil</MenuItem>
                      <MenuItem value="Swasta">Pegawai Swasta</MenuItem>
                      <MenuItem value="Wiraswasta">Wiraswasta</MenuItem>
                      <MenuItem value="Pelajar/Mahasiswa">
                        Pelajar/Mahasiswa
                      </MenuItem>
                      <MenuItem value="Lainnya">Lainnya</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="No. Telepon"
                    type="tel"
                    name="no_telp"
                    placeholder="Contoh: 08123456789"
                    value={formData.no_telp}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="NIK"
                    name="nik"
                    placeholder="16 Digit NIK"
                    value={formData.nik}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                    inputProps={{
                      pattern: "\\d{16}",
                      title: "NIK harus 16 digit angka",
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nama Perusahaan (Opsional)"
                    name="nama_perusahaan"
                    placeholder="Nama Perusahaan (jika ada)"
                    value={formData.nama_perusahaan}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Jumlah Penghuni"
                    name="jml_peng"
                    placeholder="Jumlah Penghuni"
                    value={formData.jml_peng}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Daya Listrik"
                    name="dyl"
                    placeholder="Daya Listrik (Watt)"
                    value={formData.dyl}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    required
                    disabled={isSubmitting}
                    size="small"
                  >
                    <InputLabel>Status Kepemilikan Rumah</InputLabel>
                    <Select
                      name="status_rumah"
                      value={formData.status_rumah}
                      label="Status Kepemilikan Rumah"
                      onChange={handleChange}
                      size="small"
                      sx={{
                        minWidth: 250,
                        fontSize: 14,
                        maxWidth: 250,
                        mx: "auto",
                        display: "block",
                      }}
                    >
                      <MenuItem value="">Pilih Status Rumah</MenuItem>
                      <MenuItem value="Milik Sendiri">Milik Sendiri</MenuItem>
                      <MenuItem value="Kontrak">Kontrak</MenuItem>
                      <MenuItem value="Sewa">Sewa</MenuItem>
                      <MenuItem value="Lainnya">Lainnya</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    required
                    disabled={isSubmitting || isLoadingKelompok}
                    size="small"
                  >
                    <InputLabel>Kelompok Pelanggan</InputLabel>
                    <Select
                      name="id_kelompok"
                      value={formData.id_kelompok}
                      label="Kelompok Pelanggan"
                      onChange={handleChange}
                      size="small"
                      sx={{
                        minWidth: 210,
                        fontSize: 14,
                        maxWidth: 250,
                        mx: "auto",
                        display: "block",
                      }}
                    >
                      <MenuItem value="">Pilih Kelompok</MenuItem>
                      {kelompokOptions.map((kelompok) => (
                        <MenuItem
                          key={kelompok.id_kelompok}
                          value={kelompok.id_kelompok}
                        >
                          {kelompok.nama_kelompok} ({kelompok.sub_kelompok})
                        </MenuItem>
                      ))}
                    </Select>
                    {errorKelompok && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {errorKelompok}
                      </Alert>
                    )}
                    {isLoadingKelompok && (
                      <Typography variant="caption">
                        Memuat kelompok...
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Button onClick={closeSubmitModal} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  Lanjut ke Alamat
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}

      {isModalAlamatOpen && (
        <Modal
          open={isModalAlamatOpen}
          onClose={isSubmitting ? undefined : closeAlamatModal}
        >
          <Box sx={{ ...modalStyle, width: 500 }}>
            <Typography variant="h6" component="h2">
              Input Alamat Pelanggan
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmitAlamat} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Alamat"
                    placeholder="Nama Jalan, Nomor Rumah, RT/RW"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kelurahan / Desa"
                    placeholder="Kelurahan atau Desa"
                    name="kelurahan"
                    value={formData.kelurahan}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kecamatan"
                    placeholder="Kecamatan"
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kota / Kabupaten"
                    placeholder="Kota atau Kabupaten"
                    name="kota"
                    value={formData.kota}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Provinsi"
                    placeholder="Provinsi"
                    name="provinsi"
                    value={formData.provinsi}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kode Pos"
                    placeholder="Kode Pos"
                    name="kode_pos"
                    value={formData.kode_pos}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                    inputProps={{
                      pattern: "\\d{5}",
                      title: "Kode Pos harus 5 digit angka",
                    }}
                  />
                </Grid>
              </Grid>
              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  onClick={() => {
                    closeAlamatModal();
                    setIsModalOpen(true);
                  }}
                  disabled={isSubmitting}
                >
                  Kembali
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  Lanjut ke Meteran
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}

      {isModalMeteranOpen && (
        <Modal
          open={isModalMeteranOpen}
          onClose={isSubmitting ? undefined : closeMeteranModal}
        >
          <Box sx={{ ...modalStyle, width: 500 }}>
            <Typography variant="h6" component="h2">
              Input Meteran Air
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmitMeteran} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    required
                    disabled={isSubmitting}
                    size="small"
                  >
                    <InputLabel>Diameter Meteran</InputLabel>
                    <Select
                      name="diameter"
                      value={formData.diameter}
                      label="Diameter Meteran"
                      onChange={handleChange}
                      size="small"
                      sx={{
                        minWidth: 150,
                        fontSize: 14,
                        maxWidth: 200,
                        mx: "auto",
                        display: "block",
                      }}
                    >
                      <MenuItem value="">Pilih Diameter</MenuItem>
                      <MenuItem value="1/2 Inch">1/2 Inch</MenuItem>
                      <MenuItem value="3/4 Inch">3/4 Inch</MenuItem>
                      <MenuItem value="1 Inch">1 Inch</MenuItem>
                      <MenuItem value="1 1/2 Inch">1 1/2 Inch</MenuItem>
                      <MenuItem value="1 3/4 Inch">1 3/4 Inch</MenuItem>
                      <MenuItem value="2 Inch">2 Inch</MenuItem>
                      <MenuItem value="2 1/2 Inch">2 1/2 Inch</MenuItem>
                      <MenuItem value="2 3/4 Inch">2 3/4 Inch</MenuItem>
                      <MenuItem value="3 Inch">3 Inch</MenuItem>
                      <MenuItem value="3 1/2 Inch">3 1/2 Inch</MenuItem>
                      <MenuItem value="3 3/4 Inch">3 3/4 Inch</MenuItem>
                      <MenuItem value="4 Inch">4 Inch</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Lokasi Pemasangan"
                    name="lokasi_pasang"
                    placeholder="Contoh: Depan rumah, Dalam pagar"
                    value={formData.lokasi_pasang}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tanggal Pemasangan"
                    type="date"
                    name="tanggal_pasang"
                    value={formData.tanggal_pasang}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    required
                    disabled={isSubmitting}
                    size="small"
                  >
                    <InputLabel>Status Meteran</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      label="Status Meteran"
                      onChange={handleChange}
                      size="small"
                      sx={{
                        minWidth: 150,
                        fontSize: 14,
                        maxWidth: 200,
                        mx: "auto",
                        display: "block",
                      }}
                    >
                      <MenuItem value="">Pilih Status</MenuItem>
                      <MenuItem value="Aktif">Aktif</MenuItem>
                      <MenuItem value="Tidak Aktif">Nonaktif</MenuItem>
                      <MenuItem value="Segel">Segel</MenuItem>
                      <MenuItem value="Rusak">Rusak</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Keterangan (Opsional)"
                    name="keterangan"
                    placeholder="Keterangan tambahan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    size="small"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  onClick={() => {
                    closeMeteranModal();
                    setIsModalAlamatOpen(true);
                  }}
                  disabled={isSubmitting}
                >
                  Kembali
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  Lanjut ke Email
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}

      {isModalEmailOpen && (
        <Modal
          open={isModalEmailOpen}
          onClose={isSubmitting ? undefined : closeEmailModal}
        >
          <Box sx={{ ...modalStyle, width: 400 }}>
            <Typography variant="h6" component="h2">
              Input Email Pelanggan
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleFinalSubmitSequence} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email Pelanggan"
                type="email"
                name="email_pelanggan"
                placeholder="cth: pelanggan@example.com"
                value={formData.email_pelanggan}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                size="small"
              />
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  Simpan Semua Data & Kirim Verifikasi
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}

      {isModalUpdateAlamatOpen && selectedAlamat && (
        <Modal
          open={isModalUpdateAlamatOpen}
          onClose={isUpdating ? undefined : closeUpdateModal}
        >
          <Box sx={{ ...modalStyle, width: 500 }}>
            <Typography variant="h6" component="h2">
              Update Alamat Pelanggan: {selectedPelanggan?.nama}
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>
            )}
            <Box component="form" onSubmit={(e) => handleUpdateAlamat(e)} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Alamat" placeholder="Nama Jalan, Nomor Rumah, RT/RW" name="alamat" value={selectedAlamat.alamat} onChange={handleUpdateAlamatInputChange} required disabled={isUpdating} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Kelurahan / Desa" placeholder="Kelurahan atau Desa" name="kelurahan" value={selectedAlamat.kelurahan} onChange={handleUpdateAlamatInputChange} required disabled={isUpdating} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Kecamatan" placeholder="Kecamatan" name="kecamatan" value={selectedAlamat.kecamatan} onChange={handleUpdateAlamatInputChange} required disabled={isUpdating} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Kota / Kabupaten" placeholder="Kota atau Kabupaten" name="kota" value={selectedAlamat.kota} onChange={handleUpdateAlamatInputChange} required disabled={isUpdating} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Provinsi" placeholder="Provinsi" name="provinsi" value={selectedAlamat.provinsi} onChange={handleUpdateAlamatInputChange} required disabled={isUpdating} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Kode Pos" placeholder="Kode Pos" name="kode_pos" value={selectedAlamat.kode_pos} onChange={handleUpdateAlamatInputChange} required disabled={isUpdating} size="small" inputProps={{ pattern: "\\d{5}", title: "Kode Pos harus 5 digit angka" }} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button onClick={() => { setIsModalUpdateAlamatOpen(false); setIsModalUpdateOpen(true); }} disabled={isUpdating}>
                  Kembali
                </Button>
                <Box>
                  <Button variant="contained" color="success" type="submit" disabled={isUpdating} sx={{ mr: 1 }} startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : null}>
                    Simpan Alamat
                  </Button>
                  <Button variant="contained" onClick={(e) => handleUpdateAlamat(e, 'next')} disabled={isUpdating || !selectedMeteran} startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : null}>
                    Lanjut ke Meteran
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}

      {isModalUpdateMeteranOpen && selectedMeteran && (
        <Modal
          open={isModalUpdateMeteranOpen}
          onClose={isUpdating ? undefined : closeUpdateModal}
        >
          <Box sx={{ ...modalStyle, width: 500 }}>
            <Typography variant="h6" component="h2">
              Update Meteran Pelanggan: {selectedPelanggan?.nama}
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>
            )}
            <Box component="form" onSubmit={handleUpdateMeteran} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={isUpdating} size="small">
                    <InputLabel>Diameter Meteran</InputLabel>
                    <Select
                      name="diameter"
                      value={selectedMeteran.diameter}
                      label="Diameter Meteran"
                      onChange={handleUpdateMeteranInputChange}
                    >
                      <MenuItem value="">Pilih Diameter</MenuItem>
                      <MenuItem value="1/2 Inch">1/2 Inch</MenuItem>
                      <MenuItem value="3/4 Inch">3/4 Inch</MenuItem>
                      <MenuItem value="1 Inch">1 Inch</MenuItem>
                      <MenuItem value="1 1/2 Inch">1 1/2 Inch</MenuItem>
                      <MenuItem value="1 3/4 Inch">1 3/4 Inch</MenuItem>
                      <MenuItem value="2 Inch">2 Inch</MenuItem>
                      <MenuItem value="2 1/2 Inch">2 1/2 Inch</MenuItem>
                      <MenuItem value="2 3/4 Inch">2 3/4 Inch</MenuItem>
                      <MenuItem value="3 Inch">3 Inch</MenuItem>
                      <MenuItem value="3 1/2 Inch">3 1/2 Inch</MenuItem>
                      <MenuItem value="3 3/4 Inch">3 3/4 Inch</MenuItem>
                      <MenuItem value="4 Inch">4 Inch</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Lokasi Pemasangan"
                    name="lokasi_pasang"
                    value={selectedMeteran.lokasi_pasang}
                    onChange={handleUpdateMeteranInputChange}
                    required
                    disabled={isUpdating}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tanggal Pemasangan"
                    type="date"
                    name="tanggal_pasang"
                    value={selectedMeteran.tanggal_pasang ? new Date(selectedMeteran.tanggal_pasang).toISOString().split('T')[0] : ''}
                    onChange={handleUpdateMeteranInputChange}
                    required
                    disabled={isUpdating}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={isUpdating} size="small">
                    <InputLabel>Status Meteran</InputLabel>
                    <Select
                      name="status"
                      value={selectedMeteran.status}
                      label="Status Meteran"
                      onChange={handleUpdateMeteranInputChange}
                    >
                      <MenuItem value="">Pilih Status</MenuItem>
                      <MenuItem value="Aktif">Aktif</MenuItem>
                      <MenuItem value="Tidak Aktif">Nonaktif</MenuItem>
                      <MenuItem value="Segel">Segel</MenuItem>
                      <MenuItem value="Rusak">Rusak</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Keterangan (Opsional)"
                    name="keterangan"
                    value={selectedMeteran.keterangan || ''}
                    onChange={handleUpdateMeteranInputChange}
                    disabled={isUpdating}
                    size="small"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button onClick={() => { setIsModalUpdateMeteranOpen(false); setIsModalUpdateAlamatOpen(true); }} disabled={isUpdating}>
                  Kembali
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  type="submit"
                  disabled={isUpdating}
                  startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  Simpan Meteran & Selesai
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}

      {isModalUpdateOpen && selectedPelanggan && (
        <Modal
          open={isModalUpdateOpen}
          onClose={isUpdating ? undefined : closeUpdateModal}
        >
          <Box sx={{ ...modalStyle, width: 600 }}>
            <Typography variant="h6" component="h2">
              Update Data Pelanggan
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={(e) => handleUpdate(e)} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ID Pelanggan"
                    name="id_pelanggan"
                    value={selectedPelanggan.id_pelanggan}
                    InputProps={{ readOnly: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nama"
                    name="nama"
                    value={selectedPelanggan.nama}
                    onChange={handleUpdateInputChange}
                    required
                    disabled={isUpdating}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    required
                    disabled={isUpdating}
                    size="small"
                  >
                    <InputLabel>Pekerjaan</InputLabel>
                    <Select
                      name="pekerjaan"
                      value={selectedPelanggan.pekerjaan}
                      label="Pekerjaan"
                      onChange={handleUpdateInputChange}
                      size="small"
                    >
                      <MenuItem value="">Pilih Jenis Pekerjaan</MenuItem>
                      <MenuItem value="PNS">Pegawai Negeri Sipil</MenuItem>
                      <MenuItem value="Swasta">Pegawai Swasta</MenuItem>
                      <MenuItem value="Wiraswasta">Wiraswasta</MenuItem>
                      <MenuItem value="Pelajar/Mahasiswa">
                        Pelajar/Mahasiswa
                      </MenuItem>
                      <MenuItem value="Lainnya">Lainnya</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="No. Telepon"
                    type="tel"
                    name="no_telp"
                    value={selectedPelanggan.no_telp}
                    onChange={handleUpdateInputChange}
                    required
                    disabled={isUpdating}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="NIK"
                    name="nik"
                    value={selectedPelanggan.nik}
                    onChange={handleUpdateInputChange}
                    required
                    disabled={isUpdating}
                    size="small"
                    inputProps={{
                      pattern: "\\d{16}",
                      title: "NIK harus 16 digit angka",
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nama Perusahaan (Opsional)"
                    name="nama_perusahaan"
                    placeholder="Nama Perusahaan (jika ada)"
                    value={selectedPelanggan.nama_perusahaan || ""}
                    onChange={handleUpdateInputChange}
                    disabled={isUpdating}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    required
                    disabled={isUpdating}
                    size="small"
                  >
                    <InputLabel>Status Kepemilikan Rumah</InputLabel>
                    <Select
                      name="status_rumah"
                      value={selectedPelanggan.status_rumah}
                      label="Status Kepemilikan Rumah"
                      onChange={handleUpdateInputChange}
                      size="small"
                    >
                      <MenuItem value="">Pilih Status Rumah</MenuItem>
                      <MenuItem value="Milik Sendiri">Milik Sendiri</MenuItem>
                      <MenuItem value="Kontrak">Kontrak</MenuItem>
                      <MenuItem value="Sewa">Sewa</MenuItem>
                      <MenuItem value="Lainnya">Lainnya</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    required
                    disabled={isUpdating || isLoadingKelompok}
                    size="small"
                  >
                    <InputLabel>Kelompok Pelanggan</InputLabel>
                    <Select
                      name="id_kelompok"
                      value={selectedPelanggan.id_kelompok || ""}
                      label="Kelompok Pelanggan"
                      onChange={handleUpdateInputChange}
                      size="small"
                    >
                      <MenuItem value="">Pilih Kelompok</MenuItem>
                      {kelompokOptions.map((kelompok) => (
                        <MenuItem
                          key={kelompok.id_kelompok}
                          value={kelompok.id_kelompok}
                        >
                          {kelompok.nama_kelompok} ({kelompok.sub_kelompok})
                        </MenuItem>
                      ))}
                    </Select>
                    {errorKelompok && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {errorKelompok}
                      </Alert>
                    )}
                    {isLoadingKelompok && (
                      <Typography variant="caption">
                        Memuat kelompok...
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Button onClick={closeUpdateModal} disabled={isUpdating || isFetchingDetails}>
                  Batal
                </Button>
                <Box>
                  <Button
                    variant="contained"
                    color="success"
                    type="submit"
                    disabled={isUpdating || isFetchingDetails}
                    startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ mr: 1 }}
                  >
                    Simpan Pelanggan
                  </Button>
                  <Button
                    variant="contained"
                    onClick={(e) => handleUpdate(e, 'next')}
                    disabled={isUpdating || isFetchingDetails || !selectedAlamat}
                    startIcon={isUpdating || isFetchingDetails ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    Lanjut ke Alamat
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}
    </Container>
  );
};

export default Pelanggan;
