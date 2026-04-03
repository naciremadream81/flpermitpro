import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock } from 'lucide-react';
import { auth } from '@/config/firebase';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Maps Firebase Auth error codes to user-friendly messages so the
 * person at the keyboard isn't staring at a cryptic string.
 */
function friendlyFirebaseError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password. Please try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled for this project. In Firebase Console, open Authentication → Sign-in method and enable Email/Password.';
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API key. Check your .env VITE_FIREBASE_* values match the web app in Project settings.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const [firebaseError, setFirebaseError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setFirebaseError('');
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setFirebaseError(friendlyFirebaseError(code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PermitPro FL</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sign in to manage your Florida permits
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3 top-[38px] text-gray-400"
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="pl-9"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3 top-[38px] text-gray-400"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-9"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {firebaseError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {firebaseError}
              </div>
            )}

            <Button type="submit" className="w-full" loading={submitting}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
