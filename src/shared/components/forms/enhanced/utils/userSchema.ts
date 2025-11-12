import { z } from 'zod';

export const userSchema = z.object({
  firstName: z.string().min(2, 'First name too short').max(30, 'First name too long'),
  lastName: z.string().min(2, 'Last name too short').max(30, 'Last name too long'),
  email: z.string().email('Invalid email').max(100, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(50, 'Password too long'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UserFormData = z.infer<typeof userSchema>;
