import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { z } from 'zod';
import { GraduationCap, Mail, Lock, User, Camera } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const displayNameSchema = z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long');

export default function Auth() {
  const navigate = useNavigate();
  const { user, signUp, signIn, loading } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profilePhotoBase64, setProfilePhotoBase64] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('Invalid') || error.message.includes('credentials')) {
        toast.error('Invalid email or password');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch') || error.message.includes('NetworkError')) {
        toast.error(
          'Cannot reach the server. Set VITE_API_URL to your backend URL (e.g. Railway) and redeploy the frontend.'
        );
      } else if (error.message.includes('Request failed')) {
        const hint = error.message.includes('503')
          ? ' Backend or database may be down—check Railway (or your backend host) and MongoDB.'
          : error.message.includes('404')
            ? ' Wrong API URL. Set VITE_API_URL to your backend URL including /api and redeploy.'
            : ' Check backend is running and VITE_API_URL is correct.';
        toast.error(error.message + hint);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back!');
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      displayNameSchema.parse(displayName);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, displayName, profilePhotoBase64);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('already exists')) {
        toast.error('An account with this email already exists');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch') || error.message.includes('NetworkError')) {
        toast.error(
          'Cannot reach the server. Set VITE_API_URL to your backend URL (e.g. Railway) and redeploy the frontend.'
        );
      } else if (error.message.includes('Request failed')) {
        const hint = error.message.includes('503')
          ? ' Backend or database may be down—check Railway (or your backend host) and MongoDB.'
          : error.message.includes('404')
            ? ' Wrong API URL. Set VITE_API_URL to your backend URL including /api and redeploy.'
            : ' Check backend is running and VITE_API_URL is correct.';
        toast.error(error.message + hint);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account created successfully!');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">PALM Learning</h1>
          <p className="text-muted-foreground mt-2">Personalized Adaptive Learning with Multimodality</p>
        </div>

        <Card className="shadow-elevated">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="pt-4">
              <TabsContent value="login" className="mt-0">
                <CardTitle className="text-xl mb-2">Welcome back</CardTitle>
                <CardDescription className="mb-6">
                  Sign in to continue your learning journey
                </CardDescription>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <CardTitle className="text-xl mb-2">Create account</CardTitle>
                <CardDescription className="mb-6">
                  Start your personalized learning experience
                </CardDescription>
                
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="display-name"
                        type="text"
                        placeholder="Your name"
                        className="pl-10"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profile-photo">Profile Photo (For Proctoring)</Label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="profile-photo"
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="pl-10 pt-1.5 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        onChange={handlePhotoUpload}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Admin Login Link */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
          >
            <Lock className="w-3 h-3" />
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
