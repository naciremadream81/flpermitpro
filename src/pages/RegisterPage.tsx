import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, UserPlus, Mail, Lock, User } from 'lucide-react';
import { auth } from '@/config/firebase';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required').max(100),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function friendlyFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters.';
    case 'auth/operation-not-allowed':
      return 'Account creation is currently disabled. Contact support.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [firebaseError, setFirebaseError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setFirebaseError('');
    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(credential.user, { displayName: data.fullName });
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
            Create your account to get started
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute left-3 top-[38px] text-gray-400"
              />
              <Input
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                className="pl-9"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
            </div>

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
                autoComplete="new-password"
                className="pl-9"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3 top-[38px] text-gray-400"
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="pl-9"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            {firebaseError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {firebaseError}
              </div>
            )}

            <Button type="submit" className="w-full" loading={submitting}>
              <UserPlus size={16} className="mr-2" />
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
