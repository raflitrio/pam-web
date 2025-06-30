import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import { useBackgroundJob } from '../utils/backgroundJobHook';

function NotifikasiForm() {
  // State untuk field form
  const [idPelanggan, setIdPelanggan] = useState('');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');

  // State untuk interaksi API
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Untuk pesan sukses atau error dari API
  const [error, setError] = useState('');     // Untuk error umum atau error validasi frontend

  const { submitToBackground } = useBackgroundJob();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    // Validasi dasar di frontend
    if (!judul.trim() || !isi.trim()) {
      setError('Judul dan Isi tidak boleh kosong.');
      setLoading(false);
      return;
    }

    const payload = {
      judul: judul.trim(),
      isi: isi.trim(),
    };

    // Tambahkan id_pelanggan jika diisi
    if (idPelanggan.trim() !== '') {
      payload.id_pelanggan = idPelanggan.trim();
    }

    try {
      // Gunakan background processing untuk notifikasi
      const result = await submitToBackground(
        'notifikasi/queue',
        payload,
        'notifikasi',
        `Kirim notifikasi: ${judul}`
      );

      if (result.success) {
        setMessage('Notifikasi telah ditambahkan ke antrian pemrosesan. Anda dapat melanjutkan aktivitas lain sambil menunggu notifikasi selesai dikirim.');
        
        // Reset form setelah berhasil
        setIdPelanggan('');
        setJudul('');
        setIsi('');
      } else {
        setError(result.error || 'Gagal menambahkan notifikasi ke antrian');
      }
    } catch (err) {
      console.error('Error jaringan atau lainnya:', err);
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan jaringan atau server tidak merespons.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <SendIcon sx={{ fontSize: 40, color: 'primary.main', mb:1 }} />
          <Typography component="h1" variant="h5">
            Kirim Notifikasi Pelanggan
          </Typography>
        </Box>

        {message && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="id_pelanggan"
                label="ID Pelanggan (Opsional)"
                name="id_pelanggan"
                value={idPelanggan}
                onChange={(e) => setIdPelanggan(e.target.value)}
                placeholder="Kosongkan untuk kirim ke semua pelanggan"
                disabled={loading}
                helperText="Jika diisi, notifikasi hanya dikirim ke pelanggan spesifik."
                sx={{ minWidth: 380, fontSize: 14, maxWidth: 600, mx: 'auto', display: 'block' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="judul"
                label="Judul Notifikasi"
                name="judul"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                disabled={loading}
                sx={{ minWidth: 380, fontSize: 14, maxWidth: 600, mx: 'auto', display: 'block' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="isi"
                label="Isi Notifikasi"
                name="isi"
                multiline
                rows={4}
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                disabled={loading}
                sx={{ minWidth: 780, fontSize: 14, maxWidth: 1000, mx: 'auto', display: 'block' }}
              
              />
            </Grid>
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading}
            startIcon={loading ? null : <SendIcon />}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
            ) : null}
            {loading ? 'Mengirim...' : 'Kirim Notifikasi'}
          </Button>
        </Box>
      </Paper>
    </Container>
                
  );
}

export default NotifikasiForm;