import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const PamWrapper = ({ children, title, subtitle, maxWidth = "xl" }) => {
  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh',
      p: 3
    }}>
      <Container maxWidth={maxWidth} sx={{ mt: 2, mb: 4 }}>
        {(title || subtitle) && (
          <Box sx={{ mb: 4 }}>
            {title && (
              <Typography variant="h3" sx={{ 
                color: 'white', 
                fontWeight: 700, 
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontWeight: 400 
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        {children}
      </Container>
    </Box>
  );
};

export default PamWrapper; 