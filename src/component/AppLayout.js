import React, { useState, useCallback } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BackgroundJobStatus from './BackgroundJobStatus';

const drawerWidth = 280;
const topBarHeightXs = '56px';
const topBarHeightSmUp = '64px';

const AppLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prevMobileOpen) => !prevMobileOpen);
  }, []);

  const sidebarOpen = isDesktop ? true : mobileOpen;
  const sidebarVariant = isDesktop ? 'permanent' : 'temporary';

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      <CssBaseline />

      <TopBar
        onSidebarOpen={handleDrawerToggle}
        drawerWidth={drawerWidth}
        isDesktop={isDesktop}
      />

      <Sidebar
        onClose={handleDrawerToggle}
        open={sidebarOpen}
        variant={sidebarVariant}
        drawerWidth={drawerWidth}
        topBarHeightXs={topBarHeightXs}
        topBarHeightSmUp={topBarHeightSmUp}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: 'transparent',
          overflow: 'auto',
          mt: { xs: topBarHeightXs, sm: topBarHeightSmUp },
          ml: { lg: `${drawerWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(isDesktop && {
            width: `calc(100% - ${drawerWidth}px)`,
          }),
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            zIndex: 0
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </Box>
      
      <BackgroundJobStatus />
    </Box>
  );
};

export default AppLayout;