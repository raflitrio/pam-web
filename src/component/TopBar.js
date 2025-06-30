import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Badge,
  Chip,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { Menu as MenuIcon } from 'react-feather';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import apiClient from '../utils/axiosConfig';
import { useAuth } from '../utils/AuthContext';

const TopBar = ({ onSidebarOpen, drawerWidth, isDesktop }) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const fetchAdminNotifications = async () => {
    try {
      const res = await apiClient.get('/notifikasi-admin');
      if (res.data.success) setAdminNotifications(res.data.data || []);
    } catch {}
  };

  const fetchAdminUnreadCount = async () => {
    try {
      const res = await apiClient.get('/notifikasi-admin/unread/count');
      if (res.data.success) setAdminUnreadCount(res.data.data.unread_count || 0);
    } catch {}
  };

  const markAdminAsRead = async (id) => {
    await apiClient.put(`/notifikasi-admin/mark-read/${id}`);
    fetchAdminUnreadCount();
    fetchAdminNotifications();
  };

  const markAllAdminAsRead = async () => {
    await apiClient.put('/notifikasi-admin/mark-all-read');
    fetchAdminUnreadCount();
    fetchAdminNotifications();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminNotifications();
      fetchAdminUnreadCount();
      // Polling untuk update notifikasi setiap 30 detik
      const interval = setInterval(() => {
        fetchAdminUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
    setLoadingNotifications(true);
    fetchAdminNotifications().finally(() => setLoadingNotifications(false));
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const handleNotificationItemClick = async (notificationId) => {
    await markAdminAsRead(notificationId);
  };

  const handleMarkAllRead = async () => {
    await markAllAdminAsRead();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        ...(isDesktop && {
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }),
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: '56px', sm: '64px' },
          px: { xs: 2, sm: 3 },
        }}
      >
        {!isDesktop && (
          <IconButton
            color="inherit"
            onClick={onSidebarOpen}
            edge="start"
            sx={{
              mr: 2,
              color: '#333',
              background: 'rgba(102, 126, 234, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
              },
            }}
          >
            <MenuIcon size={20} />
          </IconButton>
        )}

        {/* Date and Time Display - Left Side */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          mr: 3
        }}>
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          >
            {formatDate(currentTime)}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#333',
              fontWeight: 700,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {formatTime(currentTime)}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Typography
          variant="h6"
          sx={{
            color: '#333',
            fontWeight: 700,
            display: { xs: 'none', sm: 'block' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PAM Admin Panel
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Admin Notifications */}
        <IconButton
          onClick={handleNotificationClick}
          sx={{
            mr: 2,
            color: '#333',
            background: 'rgba(102, 126, 234, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
            },
          }}
        >
          <Badge badgeContent={adminUnreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Notification Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseNotifications}
          PaperProps={{
            sx: {
              width: 400,
              maxHeight: 500,
              mt: 1,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
              Notifikasi Admin
            </Typography>
            {adminUnreadCount > 0 && (
              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                {adminUnreadCount} belum dibaca
              </Typography>
            )}
          </Box>
          
          {loadingNotifications ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : adminNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Tidak ada notifikasi admin
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {adminNotifications.map((notification, index) => (
                <MenuItem
                  key={notification.id_notifikasi}
                  onClick={() => handleNotificationItemClick(notification.id_notifikasi)}
                  sx={{
                    borderBottom: index < adminNotifications.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    opacity: notification.dibaca ? 0.7 : 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                        {notification.judul}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                          {notification.waktu_kirim}
                        </Typography>
                      </Box>
                    }
                  />
                </MenuItem>
              ))}
            </Box>
          )}
          
          {adminNotifications.length > 0 && (
            <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {adminUnreadCount > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleMarkAllRead}
                    sx={{
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                      color: '#667eea',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      },
                    }}
                  >
                    Tandai Semua Dibaca
                  </Button>
                )}
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={handleCloseNotifications}
                  sx={{
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    },
                  }}
                >
                  Tutup
                </Button>
              </Box>
            </Box>
          )}
        </Menu>

        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label="Admin"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
            }}
          />
          <Avatar
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: 32,
              height: 32,
            }}
          >
            <AccountCircleIcon />
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

TopBar.propTypes = {
  onSidebarOpen: PropTypes.func.isRequired,
  drawerWidth: PropTypes.number.isRequired,
  isDesktop: PropTypes.bool.isRequired,
};

export default TopBar;
