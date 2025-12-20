import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useHybridAuth } from '@/hooks/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/shared';
import LogoIcon from '@assets/Asset 2 1.svg';
import VectorGrid1 from '@assets/Vector.svg';
import VectorGrid2 from '@assets/Vector-1.svg';

const LoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof LoginFormSchema>;

export default function HybridLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, error } = useHybridAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (data: LoginFormData) => {
    setIsSubmitting(true);
    form.clearErrors();

    try {
      const { data: authResponse, error: authError } = await signIn(data.email, data.password);

      if (authError) {
        const isInvalidCredentials =
          authError.message.toLowerCase().includes('invalid') ||
          authError.message.toLowerCase().includes('credentials') ||
          authError.message.toLowerCase().includes('incorrect');

        if (isInvalidCredentials) {
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
            description: authError.message,
            variant: 'destructive',
          });
        }
        return;
      }

      if (authResponse?.user) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });

        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
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
            <h2 className="text-center text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email and password to sign in!
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
                        placeholder="Enter your email"
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
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center">
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </a>
              </div>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Contact Us
                </a>
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
            Streamline your business operations with our comprehensive advisory platform.
          </p>
        </div>
      </div>
    </div>
  );
}
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useHybridAuth } from '@/hooks/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/shared';
import LogoIcon from '@assets/Asset 2 1.svg';
import VectorGrid1 from '@assets/Vector.svg';
import VectorGrid2 from '@assets/Vector-1.svg';

const LoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof LoginFormSchema>;

export default function HybridLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, error } = useHybridAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (data: LoginFormData) => {
    setIsSubmitting(true);
    form.clearErrors();

    try {
      const { data: authResponse, error: authError } = await signIn(data.email, data.password);

      if (authError) {
        const isInvalidCredentials =
          authError.message.toLowerCase().includes('invalid') ||
          authError.message.toLowerCase().includes('credentials') ||
          authError.message.toLowerCase().includes('incorrect');

        if (isInvalidCredentials) {
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
            description: authError.message,
            variant: 'destructive',
          });
        }
        return;
      }

      if (authResponse?.user) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });

        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
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
            <h2 className="text-center text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email and password to sign in!
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
                        placeholder="Enter your email"
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
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center">
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </a>
              </div>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Contact Us
                </a>
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
            Streamline your business operations with our comprehensive advisory platform.
          </p>
        </div>
      </div>
    </div>
  );
}