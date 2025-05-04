import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen } from "lucide-react";

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

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation, user } = useAuth();
  const [, navigate] = useLocation();
  
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
  
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="md:w-1/2 bg-gradient-to-r from-primary-400 to-accent-400 text-white p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-4">
            <BookOpen className="h-10 w-10 mr-2" />
            <h1 className="text-4xl font-heading font-bold">MemoSphere</h1>
          </div>
          <h2 className="text-2xl font-heading font-medium mb-6">
            Your AI-Powered Journal
          </h2>
          <p className="text-white/90 text-lg mb-8 accent-font leading-relaxed">
            Record your thoughts, track your emotions, and gain insights with our intelligent journaling platform.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1 mr-4">
                <i className="fas fa-pen-to-square text-white"></i>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">
                  Simple & Seamless
                </h3>
                <p className="text-white/80">
                  Create journal entries in seconds with our intuitive interface
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1 mr-4">
                <i className="fas fa-brain text-white"></i>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">
                  AI-Powered Insights
                </h3>
                <p className="text-white/80">
                  Get emotional analysis and personalized reflections
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1 mr-4">
                <i className="fas fa-clock-rotate-left text-white"></i>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">
                  Memory Recaps
                </h3>
                <p className="text-white/80">
                  Rediscover past experiences with "On This Day" memories
                </p>
              </div>
            </div>
          </div>
        </div>
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
                
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
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
                    className="w-full bg-primary-400 hover:bg-primary-500 mt-6"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Don't have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary-400"
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
                
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
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
                    className="w-full bg-primary-400 hover:bg-primary-500 mt-6"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Creating account...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </form>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary-400"
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
