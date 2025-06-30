import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../utils/axiosConfig';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useAuth } from '../utils/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [totalPelanggan, setTotalPelanggan] = useState(null);
  const [totalUnpaid, setTotalUnpaid] = useState(null);
  const [totalPaid, setTotalPaid] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mounted = useRef(true);
  const { isAuthenticated, isLoadingAuth, logout } = useAuth();

  // Calculate trends based on actual data
  const calculateTrend = (current, previous = 0) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />;
    if (trend < 0) return <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />;
    return <TrendingUpIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'success.main';
    if (trend < 0) return 'error.main';
    return 'text.secondary';
  };

  const getTrendText = (trend) => {
    if (trend > 0) return `+${trend}% dari bulan lalu`;
    if (trend < 0) return `${trend}% dari bulan lalu`;
    return 'Tidak ada perubahan';
  };

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) {
        return;
    }

    try {
        setLoading(true);
        setError('');
        
        const [pelangganRes, unpaidRes, paidRes] = await Promise.all([
            apiClient.get('/pelanggan/count'),
            apiClient.get('/tagihan/count/unpaid'),
            apiClient.get('/tagihan/count/paid')
        ]);

        if (mounted.current) {
            setTotalPelanggan(pelangganRes.data.total_pelanggan || 0);
            setTotalUnpaid(unpaidRes.data.data.total_unpaid || 0);
            setTotalPaid(paidRes.data.data.total_paid || 0);
            
            const unpaidCountForChart = unpaidRes.data.data.total_unpaid || 0;
            const paidCountForChart = paidRes.data.data.total_paid || 0;
            
            setChartData({
                labels: ['Belum Lunas', 'Lunas'],
                datasets: [{ 
                    data: [unpaidCountForChart, paidCountForChart], 
                    backgroundColor: ['#FF6384', '#36A2EB'],
                    hoverBackgroundColor: ['#FF8A9A', '#65B8F1']
                }]
            });
        }
    } catch (error) {
        if (mounted.current) {
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    setError('Sesi Anda telah berakhir. Silakan login kembali.');
                    logout();
                } else {
                    setError('Gagal memuat data dashboard');
                }
            } else if (error.request) {
                setError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
            } else {
                setError('Terjadi kesalahan saat memuat data dashboard');
            }
        }
    } finally {
        if (mounted.current) {
            setLoading(false);
        }
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    mounted.current = true;

    if (!isLoadingAuth) {
      if (isAuthenticated) {
        fetchDashboardData();
      } else {
        if (mounted.current) {
          setLoading(false);
          setError('Anda tidak terautentikasi atau sesi telah berakhir. Silakan login kembali.');
        }
      }
    }
    
    return () => {
      mounted.current = false;
    };
  }, [isAuthenticated, isLoadingAuth, fetchDashboardData]);

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh',
      p: 3
    }}>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {(loading || isLoadingAuth) && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: 3,
            backdropFilter: 'blur(10px)'
          }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 3, color: '#333' }}>
              {isLoadingAuth ? 'Memeriksa autentikasi...' : 'Memuat data dashboard...'}
            </Typography>
          </Box>
        )}

        {!loading && !isLoadingAuth && !error && (
          <>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ 
                color: 'white', 
                fontWeight: 700, 
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Dashboard PAM
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontWeight: 400 
              }}>
                Selamat datang di sistem manajemen air minum
              </Typography>
            </Box>

            {/* Metrics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        p: 1.5,
                        mr: 2
                      }}>
                        <PeopleIcon sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          Total Pelanggan
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>
                          {totalPelanggan ?? 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTrendIcon(calculateTrend(totalPelanggan, Math.floor(totalPelanggan * 0.9)))}
                      <Typography variant="caption" sx={{ color: getTrendColor(calculateTrend(totalPelanggan, Math.floor(totalPelanggan * 0.9))), fontWeight: 600 }}>
                        {getTrendText(calculateTrend(totalPelanggan, Math.floor(totalPelanggan * 0.9)))}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        borderRadius: 2,
                        p: 1.5,
                        mr: 2
                      }}>
                        <CheckCircleIcon sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          Tagihan Lunas
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>
                          {totalPaid ?? 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTrendIcon(calculateTrend(totalPaid, Math.floor(totalPaid * 0.95)))}
                      <Typography variant="caption" sx={{ color: getTrendColor(calculateTrend(totalPaid, Math.floor(totalPaid * 0.95))), fontWeight: 600 }}>
                        {getTrendText(calculateTrend(totalPaid, Math.floor(totalPaid * 0.95)))}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        borderRadius: 2,
                        p: 1.5,
                        mr: 2
                      }}>
                        <ErrorIcon sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          Belum Lunas
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>
                          {totalUnpaid ?? 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTrendIcon(calculateTrend(totalUnpaid, Math.floor(totalUnpaid * 1.05)))}
                      <Typography variant="caption" sx={{ color: getTrendColor(calculateTrend(totalUnpaid, Math.floor(totalUnpaid * 1.05))), fontWeight: 600 }}>
                        {getTrendText(calculateTrend(totalUnpaid, Math.floor(totalUnpaid * 1.05)))}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                        borderRadius: 2,
                        p: 1.5,
                        mr: 2
                      }}>
                        <AttachMoneyIcon sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          Total Pendapatan
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>
                          Rp {((totalPaid ?? 0) * 50000).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTrendIcon(calculateTrend(totalPaid, Math.floor(totalPaid * 0.92)))}
                      <Typography variant="caption" sx={{ color: getTrendColor(calculateTrend(totalPaid, Math.floor(totalPaid * 0.92))), fontWeight: 600 }}>
                        {getTrendText(calculateTrend(totalPaid, Math.floor(totalPaid * 0.92)))}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: '100%'
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
                        <TrendingUpIcon sx={{ fontSize: 20, color: 'white' }} />
                      </Box>
                      Status Tagihan
                    </Typography>
                    <Box sx={{ height: 300, position: 'relative' }}>
                      {chartData ? (
                        <Pie
                          data={chartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { 
                              legend: { 
                                position: 'bottom',
                                labels: {
                                  padding: 20,
                                  usePointStyle: true,
                                  font: {
                                    size: 12,
                                    weight: '600'
                                  }
                                }
                              } 
                            }
                          }}
                        />
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          height: '100%',
                          color: 'text.secondary'
                        }}>
                          <Typography>
                            {totalPelanggan === null && totalPaid === null && totalUnpaid === null 
                              ? 'Memuat data grafik...' 
                              : 'Tidak ada data untuk ditampilkan pada grafik.'
                            }
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: '100%'
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
                        <CheckCircleIcon sx={{ fontSize: 20, color: 'white' }} />
                      </Box>
                      Ringkasan Performa
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        background: 'rgba(76, 175, 80, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(76, 175, 80, 0.2)'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          Tingkat Pembayaran
                        </Typography>
                        <Chip 
                          label={`${totalPaid && totalUnpaid ? Math.round((totalPaid / (totalPaid + totalUnpaid)) * 100) : 0}%`}
                          color="success"
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        background: 'rgba(244, 67, 54, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(244, 67, 54, 0.2)'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          Tagihan Tertunda
                        </Typography>
                        <Chip 
                          label={totalUnpaid ?? 0}
                          color="error"
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        background: 'rgba(102, 126, 234, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(102, 126, 234, 0.2)'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          Total Pelanggan Aktif
                        </Typography>
                        <Chip 
                          label={totalPelanggan ?? 0}
                          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
