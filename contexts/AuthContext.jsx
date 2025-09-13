'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        console.log('Stored user data:', storedUser);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const getUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        console.log('Stored user data:', storedUser);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('user');
      }
    }
  };
  const login = (userData) => {
    try {
      console.log('Login data:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
      throw new Error('Failed to save user session');
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      setSelectedHospital(null);
      setSelectedInsumo(null);
      // You can add any additional cleanup here if needed
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const selectHospital = (hospital) => {
    setSelectedHospital(hospital);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
  };

  const selectSede = (sede) => {
    setSelectedSede(sede);
  };

  const clearSelectedHospital = () => {
    setSelectedHospital(null);
  };

  const selectInsumo = (insumo) => {
    setSelectedInsumo(insumo);
  };

  const clearSelectedInsumo = () => {
    setSelectedInsumo(null);
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
  };

  const clearSelectedSede = () => {
    setSelectedSede(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        getUser,
        selectedHospital,
        selectHospital,
        clearSelectedHospital,
        selectedInsumo,
        selectInsumo,
        clearSelectedInsumo,
        selectedUser,
        selectUser,
        clearSelectedUser,
        selectedSede,
        selectSede,
        clearSelectedSede,
      }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
