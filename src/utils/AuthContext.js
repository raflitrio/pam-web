import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate jika ingin redirect di context
import apiClient from './axiosConfig'; // Import apiClient

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoadingAuth(true);
      try {
        const response = await apiClient.get('/auth/status');
        if (response.data.isAuthenticated) {
          setUserData(response.data.user);
          setIsAuthenticated(true);
        } else {
          setUserData(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUserData(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

  const loginSuccess = (user) => { // Token tidak lagi diterima/disimpan di frontend state
    setIsAuthenticated(true);
    setUserData(user);
    localStorage.setItem('userData', JSON.stringify(user));
  };

  // Fungsi yang dipanggil saat logout dari Sidebar
  const logout = async () => {
    try {
        await apiClient.post('/logout');
    } catch (error) {
        // Logout error handling
    } finally {
        setUserData(null);
        setIsAuthenticated(false);
        localStorage.removeItem('userData');
        navigate('/');
    }
  };


  const contextValue = {
    isAuthenticated,
    isLoadingAuth,
    userData,
    loginSuccess,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;

}
