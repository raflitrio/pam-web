import React from 'react';
import { Button } from '@mui/material';

const PamButton = ({
  children,
  variant = "contained",
  color = "primary",
  size = "medium",
  startIcon,
  endIcon,
  disabled = false,
  onClick,
  sx = {},
  ...props
}) => {
  const getGradientStyle = (colorType) => {
    switch (colorType) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
          },
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
            boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
          },
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
            boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
          },
        };
      case 'info':
        return {
          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
            boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
          },
        };
      default:
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
          },
        };
    }
  };

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      startIcon={startIcon}
      endIcon={endIcon}
      disabled={disabled}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
        ...(variant === 'contained' && getGradientStyle(color)),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default PamButton; 