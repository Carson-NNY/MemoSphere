import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { 
  User as FirebaseUser, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type User = {
  id: number;
  username: string;
  createdAt: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  uid?: string;
};

type AuthContextType = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  signInWithGoogle: () => Promise<FirebaseUser | void>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = z.infer<typeof insertUserSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setFirebaseLoading(false);
      
      // If user is signed in with Firebase, create or sync the backend user
      if (user) {
        // Call backend to sync Firebase user
        apiRequest("POST", "/api/firebase-auth", {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        }).then(async (res) => {
          if (res.ok) {
            const userData = await res.json();
            queryClient.setQueryData(["/api/user"], userData);
          }
        }).catch(err => {
          console.error("Error syncing Firebase user with backend:", err);
        });
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const {
    data: user,
    error,
    isLoading: backendLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      // Add some additional scopes for better profile data
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // The signed-in user info
      const user = result.user;
      
      // This gives you a Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        const token = credential.accessToken;
        // Use token if needed
      }
      
      // API call to backend happens in the onAuthStateChanged listener
      // So we don't need to do it here
      
      toast({
        title: "Successfully signed in with Google",
        description: `Welcome, ${user.displayName || user.email}!`,
      });
      
      return user;
    } catch (error: any) {
      // Handle specific error codes
      let errorTitle = "Google Sign-In Failed";
      let errorMessage = error.message;
      
      // Handle specific Firebase Auth error codes
      if (error.code) {
        switch(error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "Sign-in was cancelled. Please try again.";
            break;
          case 'auth/popup-blocked':
            errorMessage = "Pop-up was blocked by your browser. Please allow pop-ups for this site.";
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = "Multiple pop-up requests were made. Please try again.";
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = "An account already exists with the same email address but different sign-in credentials.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "A network error occurred. Please check your connection and try again.";
            break;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error; // Re-throw to let the calling code handle it
    }
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created!",
        description: `Welcome to MemoSphere, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Sign out from Firebase
      if (firebaseUser) {
        await signOut(auth);
      }
      // Also sign out from backend
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Combine loading states
  const isLoading = backendLoading || firebaseLoading;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        firebaseUser,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
