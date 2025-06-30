import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const PamCard = ({
  children,
  title,
  subtitle,
  gradient = "primary",
  icon,
  sx = {},
  ...props
}) => {
  const getGradientColors = (gradientType) => {
    switch (gradientType) {
      case 'success':
        return 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
      case 'error':
        return 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
      case 'info':
        return 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return (
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
      },
      ...sx
    }} {...props}>
      <CardContent sx={{ p: 3 }}>
        {(title || subtitle || icon) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {icon && (
              <Box sx={{ 
                background: getGradientColors(gradient),
                borderRadius: 2,
                p: 1.5,
                mr: 2
              }}>
                {React.cloneElement(icon, { sx: { fontSize: 28, color: 'white' } })}
              </Box>
            )}
            <Box>
              {title && (
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#333',
                  mb: subtitle ? 0.5 : 0
                }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500 
                }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default PamCard; 