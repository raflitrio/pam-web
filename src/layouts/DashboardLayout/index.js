import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, styled, CssBaseline } from '@mui/material';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const DashboardLayoutRoot = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default, // Warna latar dari tema
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
  width: '100%'
}));

const DashboardLayoutWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  overflow: 'hidden',
  paddingTop: 56,
  [theme.breakpoints.up('lg')]: {
    paddingLeft: 240
  }
}));

const DashboardLayoutContainer = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  overflow: 'hidden'
});

const DashboardLayoutContent = styled('div')(({ theme }) => ({
  flex: '1 1 auto',
  height: '100%',
  overflow: 'auto',
  padding: '16px',
  [theme.breakpoints.up('sm')]: {
    padding: '20px'
  }
}));

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile

  return (
    <DashboardLayoutRoot>
      <CssBaseline /> {/* Menerapkan reset CSS dasar MUI */}
      <TopBar onSidebarOpen={() => setSidebarOpen(true)} />
      <Sidebar
        onClose={() => setSidebarOpen(false)}
        open={isSidebarOpen}
      />
      <DashboardLayoutWrapper>
        <DashboardLayoutContainer>
          <DashboardLayoutContent>
            {children || <Outlet />} {/* Merender children atau Outlet untuk nested routes */}
          </DashboardLayoutContent>
        </DashboardLayoutContainer>
      </DashboardLayoutWrapper>
    </DashboardLayoutRoot>
  );
};

export default DashboardLayout;
