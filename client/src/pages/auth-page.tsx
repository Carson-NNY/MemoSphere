import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  BookOpen, 
  Brain, 
  History, 
  BookMarked,
  MessageSquareHeart, 
  ChevronRight,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

// Animated Logo component with pure CSS
function LogoAnimation() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute w-32 h-32 bg-indigo-600 rounded-lg opacity-40 animate-float" 
           style={{ 
             animationDuration: '6s',
             left: '10%', 
             top: '20%' 
           }} />
      <div className="absolute w-40 h-40 bg-purple-600 rounded-lg opacity-30 animate-float" 
           style={{ 
             animationDuration: '8s', 
             animationDelay: '1s',
             right: '15%', 
             bottom: '25%' 
           }} />
      <div className="absolute w-24 h-24 bg-pink-600 rounded-lg opacity-20 animate-float" 
           style={{ 
             animationDuration: '7s', 
             animationDelay: '0.5s',
             right: '30%', 
             top: '15%' 
           }} />
           
      {/* Star field background */}
      <div className="absolute inset-0 overflow-hidden opacity-50">
        {Array.from({ length: 100 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
          
      {/* Journal overlay */}
      <div className="absolute w-64 h-80 border-4 border-white/20 rounded-lg shadow-lg transform rotate-6 animate-gentle-float"
           style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)' }}>
        <div className="w-full h-4 bg-white/20 mt-6 mx-auto" style={{ width: '70%' }} />
        <div className="w-full h-4 bg-white/20 mt-4 mx-auto" style={{ width: '80%' }} />
        <div className="w-full h-4 bg-white/20 mt-4 mx-auto" style={{ width: '60%' }} />
        <div className="w-full h-4 bg-white/20 mt-4 mx-auto" style={{ width: '75%' }} />
        <div className="w-full h-4 bg-white/20 mt-4 mx-auto" style={{ width: '50%' }} />
      </div>
    </div>
  );
}

// Feature item component for the hero section
const FeatureItem = ({ icon: Icon, title, description }: { 
  icon: React.ElementType, 
  title: string, 
  description: string 
}) => (
  <motion.div 
    className="flex items-start"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1 mr-4">
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <h3 className="font-medium text-lg mb-1">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  </motion.div>
);

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation, user, signInWithGoogle } = useAuth();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };
  
  const onRegisterSubmit = (values: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };
  
  // Redirect to dashboard if already logged in
  if (user) {
    navigate("/");
    return null;
  }
  
  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      if (firebaseUser) {
        // Success - the backend session will be created by the auth state listener
        // and we'll be redirected once the user data is set in the context
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      // Toast is already shown in signInWithGoogle
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="relative md:w-1/2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <LogoAnimation />
        </div>
        
        <motion.div 
          className="max-w-md mx-auto relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="flex items-center mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BookMarked className="h-12 w-12 mr-3" />
            <h1 className="text-5xl font-heading font-bold">MemoSphere</h1>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-heading font-medium mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Your AI-Powered Journal Experience
          </motion.h2>
          
          <motion.p 
            className="text-white/90 text-lg mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Record your thoughts, track your emotions, and gain powerful insights with our intelligent journaling platform enhanced by cutting-edge AI technology.
          </motion.p>
          
          <div className="space-y-6">
            <FeatureItem 
              icon={BookOpen} 
              title="Simple & Intuitive" 
              description="Create journal entries effortlessly with our beautiful interface" 
            />
            
            <FeatureItem 
              icon={Brain} 
              title="AI-Powered Insights" 
              description="Receive emotional analysis and personalized reflections" 
            />
            
            <FeatureItem 
              icon={History} 
              title="Memory Timelines" 
              description="Rediscover past experiences with 'On This Day' memories" 
            />
            
            <FeatureItem 
              icon={MessageSquareHeart} 
              title="Mood Tracking" 
              description="Visualize emotional patterns and track your wellbeing" 
            />
          </div>
        </motion.div>
      </div>
      
      {/* Auth Forms */}
      <div className="md:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-heading font-semibold mb-6 text-neutral-800 dark:text-neutral-200">
                  Welcome Back!
                </h2>
                
                <motion.form 
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)} 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <Input 
                      id="login-username"
                      {...loginForm.register("username")} 
                      className="mt-1"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-destructive text-sm mt-1">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input 
                      id="login-password"
                      type="password" 
                      {...loginForm.register("password")} 
                      className="mt-1"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-destructive text-sm mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary-600 hover:bg-primary-700 mt-6"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Logging in...
                      </>
                    ) : (
                      "Login with Username"
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-neutral-800 px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black border border-gray-300"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                          </g>
                        </svg>
                        Sign in with Google
                      </>
                    )}
                  </Button>
                </motion.form>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Don't have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary-600"
                      onClick={() => setActiveTab("register")}
                    >
                      Create one
                    </Button>
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-heading font-semibold mb-6 text-neutral-800 dark:text-neutral-200">
                  Create an Account
                </h2>
                
                <motion.form 
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)} 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <Label htmlFor="register-username">Username</Label>
                    <Input 
                      id="register-username"
                      {...registerForm.register("username")} 
                      className="mt-1"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-destructive text-sm mt-1">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password"
                      type="password" 
                      {...registerForm.register("password")} 
                      className="mt-1"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-destructive text-sm mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input 
                      id="register-confirm-password"
                      type="password" 
                      {...registerForm.register("confirmPassword")} 
                      className="mt-1"
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-destructive text-sm mt-1">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary-600 hover:bg-primary-700 mt-6"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-neutral-800 px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black border border-gray-300"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                          </g>
                        </svg>
                        Sign up with Google
                      </>
                    )}
                  </Button>
                </motion.form>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary-600"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in
                    </Button>
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
