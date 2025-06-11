import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Create the Auth Context
const AuthContext = createContext();

// API base URL - you might want to store this in a config file
// Use your local network IP instead of localhost so mobile devices can connect
const API_BASE_URL = 'http://10.0.2.2:8000'; // Android emulator pointing to host's localhost
// If using a physical device or iOS simulator, use your computer's actual IP address:
// const API_BASE_URL = 'http://192.168.1.x:8000'; // Replace with your actual IP

// Auth token key
const AUTH_TOKEN_KEY = 'auth_token';
// User data key
const USER_DATA_KEY = 'user_data';

// Create a provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Attempting to load token from SecureStore...');
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        console.log('Token from SecureStore:', token ? 'Found' : 'Not found');
        
        if (token) {
          try {
            console.log('Attempting to load user data from SecureStore...');
            const userDataString = await SecureStore.getItemAsync(USER_DATA_KEY);
            console.log('User data from SecureStore:', userDataString ? 'Found' : 'Not found');
            
            if (userDataString) {
              const userData = JSON.parse(userDataString);
              setAuthToken(token);
              setUser(userData);
              console.log('User authenticated from storage');
            }
          } catch (userDataError) {
            console.error('Error parsing user data:', userDataError);
          }
        } else {
          console.log('No token found in SecureStore.');
        }
      } catch (error) {
        console.error('Error loading from SecureStore:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Sign in function
  const signIn = async (email, password) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/api/mobile/login`);
      
      // Make actual API call to login endpoint
      const response = await fetch(`${API_BASE_URL}/api/mobile/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response status:', response.status);
      const data = await response.json();
      
      // Handle different response statuses
      if (!response.ok) {
        console.log('Login failed:', data.message);
        // If login failed, return error message
        return { 
          success: false, 
          error: data.message || 'Authentication failed. Please check your credentials.'
        };
      }
      
      console.log('Login successful, saving auth data...');
      
      try {
        // Save token in SecureStore
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.token);
        
        // Save user data in SecureStore
        const userDataString = JSON.stringify(data.user);
        await SecureStore.setItemAsync(USER_DATA_KEY, userDataString);
        
        // Update state
        setAuthToken(data.token);
        setUser(data.user);
        
        return { success: true };
      } catch (storageError) {
        console.error('Error saving to SecureStore:', storageError);
        return {
          success: false,
          error: 'Failed to save authentication data.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Connection error. Please check your internet connection and try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Only make API call if we have a token
      if (authToken) {
        try {
          await fetch(`${API_BASE_URL}/api/mobile/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Accept': 'application/json',
            },
          });
        } catch (apiError) {
          console.error('Logout API call error:', apiError);
          // Continue with local logout even if API call fails
        }
      }
      
      try {
        // Clear stored data
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_DATA_KEY);
      } catch (storageError) {
        console.error('Error clearing SecureStore:', storageError);
      }
      
      // Reset state
      setAuthToken(null);
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if error occurs, try to clear state anyway
      setAuthToken(null);
      setUser(null);
      
      return { success: true };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || 'Failed to send reset link. Please try again.'
        };
      }
      
      return { 
        success: true, 
        message: data.message || 'Password reset link sent to your email.'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
  };

  // Reset password function
  const resetPassword = async (token, password, passwordConfirmation) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password, 
          password_confirmation: passwordConfirmation 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || 'Failed to reset password. Please try again.'
        };
      }
      
      return { 
        success: true, 
        message: data.message || 'Password has been reset successfully.'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
  };

  // The context value that will be supplied to any descendants of this provider
  const value = {
    user,
    isLoading,
    authToken,
    isAuthenticated: !!user,
    signIn,
    signOut,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 