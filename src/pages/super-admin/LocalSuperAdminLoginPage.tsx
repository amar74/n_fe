import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/shared';
import LogoIcon from '@assets/Asset 2 1.svg';
import VectorGrid1 from '@assets/Vector.svg';
import VectorGrid2 from '@assets/Vector-1.svg';

const SuperAdminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type SuperAdminLoginFormData = z.infer<typeof SuperAdminLoginSchema>;

interface SuperAdminLoginResponse {
  message: string;
  token: string;
  expire_at: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export default function LocalSuperAdminLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SuperAdminLoginFormData>({
    resolver: zodResolver(SuperAdminLoginSchema),
    defaultValues: {
      email: 'admin@megapolis.com',
      password: '',
      rememberMe: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (data: SuperAdminLoginFormData) => {
    setIsSubmitting(true);
    form.clearErrors();

    try {
      const response = await apiClient.post<SuperAdminLoginResponse>('/super-admin/login', {
        email: data.email,
        password: data.password,
      });

      const { token, user } = response.data;

      // Store the token
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast({
        title: 'Login Successful',
        description: 'Welcome to Super Admin Dashboard!',
      });

      // Navigate to super admin dashboard
      navigate('/super-admin/dashboard');
    } catch (error: any) {
      console.error('Super admin login error:', error);
      
      const errorMessage = error.response?.data?.detail || 'Login failed';
      
      if (errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('credentials')) {
        form.setError('email', {
          type: 'manual',
          message: 'Invalid email or password',
        });
        form.setError('password', {
          type: 'manual',
          message: 'Invalid email or password',
        });
      } else {
        toast({
          title: 'Login Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex items-center justify-center mb-6">
              <img src={LogoIcon} alt="Logo" className="h-12 w-12" />
            </div>
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900">Super Admin</h2>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                ADMIN
              </span>
            </div>
            <p className="text-center text-sm text-gray-600">
              Access the Super Admin Dashboard with elevated privileges
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address*</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@megapolis.com"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password*</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Keep me logged in
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Authenticating...' : 'Login'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-purple-600 hover:text-purple-500 flex items-center justify-center mx-auto"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure Admin Authentication
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-blue-900 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={VectorGrid1}
            alt="Grid pattern"
            className="absolute top-0 left-0 w-full h-full opacity-10"
          />
          <img
            src={VectorGrid2}
            alt="Grid pattern"
            className="absolute top-0 left-0 w-full h-full opacity-5"
          />
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white p-4 rounded-lg mr-4">
              <img src={LogoIcon} alt="Logo" className="h-16 w-16" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#ffffff' }}>
                Megapolis
              </h1>
              <p className="text-xl" style={{ color: '#ffffff' }}>
                Advisory
              </p>
            </div>
          </div>
          <p className="text-lg opacity-90 max-w-md">
            Complete system control with elevated privileges for managing vendors, users, and platform operations.
          </p>
        </div>
      </div>
    </div>
  );
}