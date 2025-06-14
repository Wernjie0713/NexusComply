import * as SecureStore from 'expo-secure-store';

// API base URL - should match the one in AuthContext
// Use your local network IP instead of localhost so mobile devices can connect
// const API_BASE_URL = 'http://10.0.2.2:8000'; // Android emulator pointing to host's localhost
// If using a physical device or iOS simulator, use your computer's actual IP address:
const API_BASE_URL = 'http://192.168.94.143:8000'; // Replace with your actual IP

// Auth token key - must match the one in AuthContext.jsx
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * ApiClient provides utilities for making authenticated API requests
 * to the Laravel backend.
 */
class ApiClient {
  /**
   * Make an authenticated GET request
   * 
   * @param {string} endpoint - The API endpoint (without the base URL)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - The JSON response
   */
  static async get(endpoint, options = {}) {
    return this.request(endpoint, { 
      method: 'GET',
      ...options
    });
  }
  
  /**
   * Make an authenticated POST request
   * 
   * @param {string} endpoint - The API endpoint (without the base URL)
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - The JSON response
   */
  static async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
  }
  
  /**
   * Make an authenticated PUT request
   * 
   * @param {string} endpoint - The API endpoint (without the base URL)
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - The JSON response
   */
  static async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
  }
  
  /**
   * Make an authenticated DELETE request
   * 
   * @param {string} endpoint - The API endpoint (without the base URL)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - The JSON response
   */
  static async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }
  
  /**
   * Make an authenticated request to the API
   * 
   * @param {string} endpoint - The API endpoint (without the base URL)
   * @param {Object} options - The fetch options
   * @returns {Promise<any>} - The JSON response
   */
  static async request(endpoint, options = {}) {
    // Create headers
    const headers = {
      'Accept': 'application/json',
      ...(options.headers || {}),
    };
    
    try {
      // Get the auth token - using the correct async method
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token from SecureStore:', error);
    }
    
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Parse the response as JSON
    const data = await response.json();
    
    // Handle 401 Unauthorized errors (token expired)
    if (response.status === 401) {
      // You might want to trigger a logout or token refresh here
      console.warn('Authentication token expired or invalid');
    }
    
    // If response is not ok, throw an error
    if (!response.ok) {
      const error = new Error(data.message || 'API request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  }
}

export default ApiClient; 