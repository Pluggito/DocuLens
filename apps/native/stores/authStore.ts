import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import Platform from "react-native";

// In React Native development, localhost/127.0.0.1 works on iOS simulators.
// On Android emulator, localhost points to the emulator itself, so we use 10.0.2.2.
// In production, change this to your actual deployed backend URL.
const API_URL = "http://localhost:3000"; 

interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  image: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (fullName: string, email: string, password: string, phoneNumber?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = await SecureStore.getItemAsync("access_token");
      const userStr = await SecureStore.getItemAsync("user_data");
      
      if (token && userStr) {
        // Validate session or just load it
        // In a real app, you would make a call to /api/auth/session with the token
        const response = await fetch(`${API_URL}/api/auth/session`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Cookie: `access_token=${token}` // Fallback for cookie-based auth
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            set({ token, user: data.user, isLoading: false });
            return;
          }
        }
      }
      
      // If validation fails or no token
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("user_data");
      set({ token: null, user: null, isLoading: false });
    } catch (err) {
      console.error("Auth initialization failed:", err);
      set({ token: null, user: null, isLoading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const { user, accessToken } = data;
      
      await SecureStore.setItemAsync("access_token", accessToken);
      await SecureStore.setItemAsync("user_data", JSON.stringify(user));
      
      set({ user, token: accessToken, isLoading: false });
      return true;
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Invalid credentials", 
        isLoading: false 
      });
      return false;
    }
  },

  signUp: async (fullName, email, password, phoneNumber) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sign up failed");
      }

      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Sign up failed", 
        isLoading: false 
      });
      return false;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await fetch(`${API_URL}/api/auth/logout`, { method: "POST" });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("user_data");
      set({ user: null, token: null, isLoading: false, error: null });
    }
  }
}));
