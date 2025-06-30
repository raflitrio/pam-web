import React, { useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  Users as UsersIcon,
  Droplet as WaterIcon,
  CreditCard as PaymentIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  LogOut as LogOutIcon,
  DollarSign as DollarSignIcon,
  UserPlus as UserPlusIcon
} from 'react-feather';

const allSidebarItems = [
  { href: '/dashboard', icon: HomeIcon, title: 'Dashboard' },
  { href: '/pelanggan', icon: UsersIcon, title: 'Pelanggan' },
  { href: '/penggunaanair', icon: WaterIcon, title: 'Penggunaan Air' },
  { href: '/transaksi', icon: PaymentIcon, title: 'Status Pembayaran' },
  { href: '/kelompok', icon: SettingsIcon, title: 'Atur Kelompok/Golongan' },
  { href: '/tarif', icon: DollarSignIcon, title: 'Atur Tarif' },
  { href: '/notifikasi', icon: BellIcon, title: 'Informasi Pelanggan' },
  { href: '/invite-admin', icon: UserPlusIcon, title: 'Invite Admin' }
];

const getSidebarItemsByRole = (role) => {
  if (role === 'admin') {
    return [
      { href: '/penggunaanair', icon: WaterIcon, title: 'Penggunaan Air' },
      { href: '/transaksi', icon: PaymentIcon, title: 'Status Pembayaran' }
    ];
  }
  return allSidebarItems;
};

const Sidebar = ({ open, onClose, variant, drawerWidth, topBarHeightXs, topBarHeightSmUp }) => {
  const location = useLocation();
  const userDataString = localStorage.getItem('userData');
  const user = userDataString ? JSON.parse(userDataString) : { username: 'Admin', role: 'Administrator' };
  const { logout } = useAuth();
  const prevLocationPathnameRef = useRef(location.pathname);

  useEffect(() => {
    if (
      variant === 'temporary' &&
      open &&
      onClose &&
      location.pathname !== prevLocationPathnameRef.current
    ) {
      onClose();
    }
    prevLocationPathnameRef.current = location.pathname;
  }, [location.pathname, variant, open, onClose]);

  const handleLogout = () => {
    logout();
  }

  const sidebarItems = getSidebarItemsByRole(user.role);

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      {variant === 'temporary' && (
        <Box sx={{ height: { xs: topBarHeightXs, sm: topBarHeightSmUp }, flexShrink: 0 }} />
      )}
      <Box 
        sx={{ 
          alignItems: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Avatar
            component={RouterLink}
            sx={{ 
              cursor: 'pointer', 
              width: 80, 
              height: 80, 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.2)',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold',
              backdropFilter: 'blur(10px)',
            }}
            to="/app/account"
          >
            {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {user.username || 'Nama Admin'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            {user.role || 'Administrator'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ flexShrink: 0, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
      
      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        <List component="nav">
          {sidebarItems.map((item) => (
            <ListItemButton
              key={item.title}
              component={RouterLink}
              to={item.href}
              selected={location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))}
              sx={{
                mb: 1,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transform: 'translateX(5px)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateX(5px)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                  ? 'white'
                  : '#666'
              }}>
                <item.icon size={20} />
              </ListItemIcon>
              <ListItemText 
                primary={item.title} 
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                    ? 700
                    : 500,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider sx={{ flexShrink: 0, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
      
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Button
          color="error"
          fullWidth
          startIcon={<LogOutIcon size="20" />}
          onClick={handleLogout}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'rgba(244, 67, 54, 0.3)',
            color: '#f44336',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              borderColor: '#f44336',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      variant={variant}
      PaperProps={{
        sx: {
          width: drawerWidth,
          height: '100vh',
          borderRight: 'none',
        }
      }}
    >
      {content}
    </Drawer>
  );
};

Sidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(['permanent', 'persistent', 'temporary']).isRequired,
  drawerWidth: PropTypes.number.isRequired,
  topBarHeightXs: PropTypes.string.isRequired,
  topBarHeightSmUp: PropTypes.string.isRequired,
};

export default Sidebar;
