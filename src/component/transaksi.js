import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../utils/axiosConfig';
// import { getAuthHeaders } from '../utils/auth'; // Tidak lagi dibutuhkan
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Snackbar,
  Pagination,
  Grid,
  Menu,
} from '@mui/material';
import { useAuth } from '../utils/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { id as localeID } from 'date-fns/locale'; // Indonesian locale for date picker
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const DaftarRiwayatTagihan = () => {
  const [riwayatTagihanList, setRiwayatTagihanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'tanggal_tagihan', direction: 'descending' });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState('date'); // 'date' or 'month'
  const [selectedDateForDelete, setSelectedDateForDelete] = useState(null);
  const [selectedMonthForDelete, setSelectedMonthForDelete] = useState('');
  const [selectedYearForDelete, setSelectedYearForDelete] = useState(new Date().getFullYear().toString());

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Jumlah item per halaman

  const { isAuthenticated, userData } = useAuth(); // Menggunakan isAuthenticated

  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const handleExportClick = (event) => setExportAnchorEl(event.currentTarget);
  const handleExportClose = () => setExportAnchorEl(null);

  const fetchRiwayatTagihan = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!isAuthenticated) {
      setError('Autentikasi diperlukan atau token tidak valid. Silakan login kembali.');
      setLoading(false);
      setRiwayatTagihanList([]);
      return;
    }
    try {
      // const headers = getAuthHeaders(authToken); // Dihapus
      // if (!headers['Authorization']) { // Dihapus
      //   setError('Autentikasi diperlukan atau token tidak valid. Silakan login kembali.');
      //   setLoading(false);
      //   setRiwayatTagihanList([]);
      //   return;
      // }
      const response = await apiClient.get(`/tagihan_histori`); // Headers otomatis ditangani oleh apiClient

      const data = response.data;
      if (data.success && Array.isArray(data.data)) {
        let filtered = data.data;
        if (userData && userData.role === 'admin') {
          // Asumsi ada field petugas_pencatat atau users_id di data transaksi
          filtered = filtered.filter(item => item.petugas_pencatat === userData.username || item.users_id === userData.users_id);
        }
        setRiwayatTagihanList(filtered);
      } else {
        setRiwayatTagihanList([]);
        setError(data.message || 'Gagal mengambil data riwayat tagihan.');
      }
    } catch (err) {
      setError('Failed to fetch transaction history');
      setRiwayatTagihanList([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userData]);

  useEffect(() => {
    if (isAuthenticated) { // Panggil fetch jika sudah terautentikasi
        fetchRiwayatTagihan();
    } else {
        setLoading(false);
        setError('Autentikasi diperlukan untuk melihat riwayat tagihan.');
        setRiwayatTagihanList([]);
    }
  }, [isAuthenticated, fetchRiwayatTagihan]);


  const sortedRiwayatTagihanList = useMemo(() => {
    let sortableItems = [...riwayatTagihanList];
    if (sortConfig !== null && sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] == null && b[sortConfig.key] == null) return 0;
        if (a[sortConfig.key] == null) return 1;
        if (b[sortConfig.key] == null) return -1;

        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [riwayatTagihanList, sortConfig]);

  // Effect untuk menyesuaikan halaman saat ini jika keluar dari batas setelah data berubah
  // Dipindahkan ke sini SETELAH sortedRiwayatTagihanList dideklarasikan
  useEffect(() => {
    const newTotalPages = Math.ceil(sortedRiwayatTagihanList.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && sortedRiwayatTagihanList.length === 0 && currentPage !== 1) {
        setCurrentPage(1); // Reset ke halaman 1 jika tidak ada data
    }
  }, [sortedRiwayatTagihanList, itemsPerPage, currentPage]);
  const paginatedRiwayatTagihanList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRiwayatTagihanList.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRiwayatTagihanList, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedRiwayatTagihanList.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    // Reset form state
    setDeleteType('date');
    setSelectedDateForDelete(null);
    setSelectedMonthForDelete('');
    setSelectedYearForDelete(new Date().getFullYear().toString());
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    let payload = { delete_type: deleteType };
    let valid = false;

    if (deleteType === 'date') {
      if (selectedDateForDelete) {
        // Format date to YYYY-MM-DD
        const year = selectedDateForDelete.getFullYear();
        const month = (selectedDateForDelete.getMonth() + 1).toString().padStart(2, '0');
        const day = selectedDateForDelete.getDate().toString().padStart(2, '0');
        payload.date = `${year}-${month}-${day}`;
        valid = true;
      } else {
        setSnackbarMessage('Silakan pilih tanggal tagihan untuk dihapus.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    } else if (deleteType === 'month') {
      if (selectedMonthForDelete && selectedYearForDelete) {
        payload.month = selectedMonthForDelete;
        payload.year = selectedYearForDelete;
        valid = true;
      } else {
        setSnackbarMessage('Silakan pilih bulan dan tahun periode untuk dihapus.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }

    if (!valid) return;

    setLoading(true); // Menunjukkan proses loading
    try {
      const response = await apiClient.delete('/tagihan_histori/delete', { data: payload });
      setSnackbarMessage(response.data.message || (response.data.success ? 'Data berhasil dihapus.' : 'Gagal menghapus data.'));
      setSnackbarSeverity(response.data.success ? 'success' : 'error');
      if (response.data.success) {
        setCurrentPage(1);
        fetchRiwayatTagihan();
      }
    } catch (err) {
      setSnackbarMessage('Failed to delete transaction history');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      handleCloseDeleteDialog();
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Riwayat Tagihan', 14, 16);
    doc.autoTable({
      startY: 22,
      head: [[
        'ID Tagihan', 'Tgl Catat Meteran', 'Pemakaian (m³)', 'Petugas', 'Tgl Tagihan', 'Tgl Jatuh Tempo', 'Total Tagihan', 'Tunggakan', 'Status Tagihan'
      ]],
      body: sortedRiwayatTagihanList.map(item => [
        item.id_tagihan,
        item.tanggal_pencatatan_meteran ? new Date(item.tanggal_pencatatan_meteran).toLocaleDateString('id-ID') : '-',
        item.pemakaian_air != null ? `${item.pemakaian_air} m³` : '-',
        item.petugas_pencatat || '-',
        item.tanggal_tagihan ? new Date(item.tanggal_tagihan).toLocaleDateString('id-ID') : '-',
        item.tanggal_jatuh_tempo ? new Date(item.tanggal_jatuh_tempo).toLocaleDateString('id-ID') : '-',
        `Rp ${(parseFloat(item.total_tagihan) || 0).toLocaleString('id-ID')}`,
        `Rp ${(parseFloat(item.biaya_tunggakan) || 0).toLocaleString('id-ID')}`,
        item.status_tagihan || 'N/A',
      ]),
    });
    doc.save('riwayat_tagihan.pdf');
    handleExportClose();
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedRiwayatTagihanList.map(item => ({
      'ID Tagihan': item.id_tagihan,
      'Tgl Catat Meteran': item.tanggal_pencatatan_meteran ? new Date(item.tanggal_pencatatan_meteran).toLocaleDateString('id-ID') : '-',
      'Pemakaian (m³)': item.pemakaian_air != null ? `${item.pemakaian_air} m³` : '-',
      'Petugas': item.petugas_pencatat || '-',
      'Tgl Tagihan': item.tanggal_tagihan ? new Date(item.tanggal_tagihan).toLocaleDateString('id-ID') : '-',
      'Tgl Jatuh Tempo': item.tanggal_jatuh_tempo ? new Date(item.tanggal_jatuh_tempo).toLocaleDateString('id-ID') : '-',
      'Total Tagihan': `Rp ${(parseFloat(item.total_tagihan) || 0).toLocaleString('id-ID')}`,
      'Tunggakan': `Rp ${(parseFloat(item.biaya_tunggakan) || 0).toLocaleString('id-ID')}`,
      'Status Tagihan': item.status_tagihan || 'N/A',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Tagihan');
    XLSX.writeFile(wb, 'riwayat_tagihan.xlsx');
    handleExportClose();
  };

  const handleExportWord = () => {
    // Ekspor sederhana ke .docx (HTML table to Word)
    let html = `<h2>Riwayat Tagihan</h2><table border='1' cellpadding='4' cellspacing='0'><tr><th>ID Tagihan</th><th>Tgl Catat Meteran</th><th>Pemakaian (m³)</th><th>Petugas</th><th>Tgl Tagihan</th><th>Tgl Jatuh Tempo</th><th>Total Tagihan</th><th>Tunggakan</th><th>Status Tagihan</th></tr>`;
    sortedRiwayatTagihanList.forEach(item => {
      html += `<tr><td>${item.id_tagihan}</td><td>${item.tanggal_pencatatan_meteran ? new Date(item.tanggal_pencatatan_meteran).toLocaleDateString('id-ID') : '-'}</td><td>${item.pemakaian_air != null ? `${item.pemakaian_air} m³` : '-'}</td><td>${item.petugas_pencatat || '-'}</td><td>${item.tanggal_tagihan ? new Date(item.tanggal_tagihan).toLocaleDateString('id-ID') : '-'}</td><td>${item.tanggal_jatuh_tempo ? new Date(item.tanggal_jatuh_tempo).toLocaleDateString('id-ID') : '-'}</td><td>Rp ${(parseFloat(item.total_tagihan) || 0).toLocaleString('id-ID')}</td><td>Rp ${(parseFloat(item.biaya_tunggakan) || 0).toLocaleString('id-ID')}</td><td>${item.status_tagihan || 'N/A'}</td></tr>`;
    });
    html += '</table>';
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'riwayat_tagihan.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    handleExportClose();
  };

  const renderContent = () => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Memuat data riwayat tagihan...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!isAuthenticated && riwayatTagihanList.length === 0) { 
        return (
            <Alert severity="warning" sx={{ m: 2 }}>
                Silakan login untuk melihat riwayat tagihan.
            </Alert>
        );
    }
    
    if (riwayatTagihanList.length === 0) {
        return (
            <Alert severity="info" sx={{ m: 2 }}>
                Tidak ada data riwayat tagihan yang tersedia saat ini.
            </Alert>
        );
    }

    const headCells = [
        { id: 'id_tagihan', label: 'ID Tagihan' },
        { id: 'tanggal_pencatatan_meteran', label: 'Tgl Catat Meteran' },
        { id: 'pemakaian_air', label: 'Pemakaian (m³)' },
        { id: 'petugas_pencatat', label: 'Petugas' },
        { id: 'tanggal_tagihan', label: 'Tgl Tagihan' },
        { id: 'tanggal_jatuh_tempo', label: 'Tgl Jatuh Tempo' },
        { id: 'total_tagihan', label: 'Total Tagihan', numeric: true },
        { id: 'biaya_tunggakan', label: 'Tunggakan', numeric: true },
        { id: 'status_tagihan', label: 'Status Tagihan' },
    ];

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={sortConfig.key === headCell.id ? sortConfig.direction : false}
                    >
                        <TableSortLabel
                            active={sortConfig.key === headCell.id}
                            direction={sortConfig.key === headCell.id ? sortConfig.direction : 'asc'}
                            onClick={() => requestSort(headCell.id)}
                        >
                            {headCell.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRiwayatTagihanList.map((item) => { // Menggunakan data yang sudah dipaginasi
              let statusColor = "default";
              switch (item.status_tagihan?.toUpperCase()) {
                case "LUNAS":
                case "DIBAYAR":
                  statusColor = "success";
                  break;
                case "BELUM ADA TAGIHAN": // Dianggap lunas jika tidak ada tagihan
                  statusColor = "success";
                  break;
                case "BELUM LUNAS":
                case "BELUM DIBAYAR":
                case "MENUNGGU PEMBAYARAN":
                case "DIAKUMULASIKAN":
                  statusColor = "warning";
                  break;
                case "KADALUARSA":
                case "EXPIRED":
                case "DIBATALKAN":
                case "GAGAL":
                case "FAILED":
                  statusColor = "error";
                  break;
                default:
                  statusColor = "default";
              }
              const uniqueKey = `${item.id_tagihan}-${item.tanggal_pencatatan_meteran}-${item.pemakaian_air}-${item.status_tagihan}-${item.tanggal_tagihan}`;
              return (
                <TableRow hover key={uniqueKey}> {/* Menggunakan TableRow dan menambahkan hover effect */}
                  <TableCell>{item.id_tagihan}</TableCell>
                  <TableCell>
                    {item.tanggal_pencatatan_meteran
                      ? new Date(item.tanggal_pencatatan_meteran).toLocaleDateString(
                          "id-ID",
                          { day: "2-digit", month: "long", year: "numeric" }
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>{item.pemakaian_air != null ? `${item.pemakaian_air} m³` : "-"}</TableCell>
                  <TableCell>{item.petugas_pencatat || "-"}</TableCell>
                  <TableCell>
                    {item.tanggal_tagihan
                      ? new Date(item.tanggal_tagihan).toLocaleDateString(
                          "id-ID",
                          { day: "2-digit", month: "long", year: "numeric" }
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.tanggal_jatuh_tempo
                      ? new Date(item.tanggal_jatuh_tempo).toLocaleDateString(
                          "id-ID",
                          { day: "2-digit", month: "long", year: "numeric" }
                        )
                      : "-"}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="semibold">
                      Rp {(parseFloat(item.total_tagihan) || 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="semibold">
                      Rp {(parseFloat(item.biaya_tunggakan) || 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.status_tagihan || "N/A"} color={statusColor} size="small" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container
        maxWidth={false} 
        sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            mt: 0,
            mb: 2,
            height: 'calc(100vh - 64px)', // Adjust based on your topbar height
            overflow: 'auto'
        }}
    >
        <Paper
            sx={{
                p: 2,
                borderRadius: 1,
                boxShadow: (theme) => theme.shadows[1],
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Riwayat Tagihan
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleExportClick}
                        disabled={!isAuthenticated || loading || riwayatTagihanList.length === 0}
                    >
                        Unduh Data
                    </Button>
                    <Menu
                        anchorEl={exportAnchorEl}
                        open={Boolean(exportAnchorEl)}
                        onClose={handleExportClose}
                    >
                        <MenuItem onClick={handleExportPDF}>Unduh PDF</MenuItem>
                        <MenuItem onClick={handleExportExcel}>Unduh Excel</MenuItem>
                        <MenuItem onClick={handleExportWord}>Unduh Word</MenuItem>
                    </Menu>
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleOpenDeleteDialog} 
                        disabled={!isAuthenticated || loading || riwayatTagihanList.length === 0}
                    >
                        Hapus Riwayat
                    </Button>
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {renderContent()}
            </Box>

            {/* Pagination */}
            {riwayatTagihanList.length > 0 && !loading && !error && (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    p: 2, 
                    mt: 2, 
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="body2">
                        Menampilkan {paginatedRiwayatTagihanList.length} dari {sortedRiwayatTagihanList.length} data.
                        Halaman {currentPage} dari {totalPages}.
                    </Typography>
                    {totalPages > 1 && (
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    )}
                </Box>
            )}
        </Paper>

        {/* Dialog Konfirmasi Hapus */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Hapus Riwayat Tagihan</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Pilih kriteria untuk menghapus data riwayat tagihan. Tindakan ini tidak dapat diurungkan.
                </DialogContentText>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <RadioGroup
                        row
                        aria-label="delete-type"
                        name="delete-type-radio"
                        value={deleteType}
                        onChange={(e) => setDeleteType(e.target.value)}
                    >
                        <FormControlLabel value="date" control={<Radio />} label="Berdasarkan Tanggal Tagihan" />
                        <FormControlLabel value="month" control={<Radio />} label="Berdasarkan Bulan & Tahun Periode" />
                    </RadioGroup>
                </FormControl>

                {deleteType === 'date' && (
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeID}>
                        <DatePicker
                            label="Pilih Tanggal Tagihan"
                            value={selectedDateForDelete}
                            onChange={(newValue) => setSelectedDateForDelete(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} helperText="Pilih tanggal tagihan yang akan dihapus." />}
                            inputFormat="dd/MM/yyyy" // Format tampilan tanggal
                        />
                    </LocalizationProvider>
                )}

                {deleteType === 'month' && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="select-month-label">Bulan Periode</InputLabel>
                                <Select
                                    labelId="select-month-label"
                                    value={selectedMonthForDelete}
                                    label="Bulan Periode"
                                    onChange={(e) => setSelectedMonthForDelete(e.target.value)}
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <MenuItem key={m} value={m.toString()}>
                                            {new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' })} {/* Tahun arbitrer untuk nama bulan */}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Tahun Periode"
                                type="number"
                                fullWidth
                                value={selectedYearForDelete}
                                onChange={(e) => setSelectedYearForDelete(e.target.value)}
                                sx={{ mb: 2 }}
                                inputProps={{ min: "2000", max: new Date().getFullYear() + 5 }} // Rentang tahun yang valid
                                helperText="Masukkan tahun periode (YYYY)."
                            />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDeleteDialog}>Batal</Button>
                <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Hapus"}
                </Button>
            </DialogActions>
        </Dialog>

        {/* Snackbar untuk Notifikasi */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled">
                {snackbarMessage}
            </Alert>
        </Snackbar>
    </Container>
  );
};

export default DaftarRiwayatTagihan;
