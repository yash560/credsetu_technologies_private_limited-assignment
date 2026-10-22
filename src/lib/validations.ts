import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .transform((v) => v.trim()),
  email: z
    .string()
    .email('Please provide a valid email address')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password is too long'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[+]?[0-9\s-]+$/, 'Invalid phone number format')
    .optional()
    .nullable(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .transform((v) => v.toLowerCase().trim()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token or security code is required'),
  new_password: z
    .string()
    .min(6, 'New password must be at least 6 characters long')
    .max(128, 'Password is too long'),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(6, 'New password must be at least 6 characters long'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10).max(15).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[+]?[0-9\s-]+$/, 'Invalid phone number format'),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long'),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]{6}$/, 'OTP must be numeric'),
});

export const createLoanSchema = z.object({
  friend_name: z
    .string()
    .min(2, 'Friend name must be at least 2 characters')
    .max(100, 'Friend name cannot exceed 100 characters')
    .transform((val) => val.trim()),
  amount: z
    .number({ invalid_type_error: 'Amount must be a valid number' })
    .positive('Loan amount must be greater than 0')
    .max(10000000, 'Amount cannot exceed ₹1,00,00,000'),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must follow YYYY-MM-DD format'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  receipt_url: z.string().optional().nullable(),
  category: z.enum(['dining', 'trips', 'rent', 'cash', 'general']).optional().default('general'),
  phone: z.string().optional().nullable(),
});

export const repayLoanSchema = z.object({
  is_repaid: z.boolean().default(true),
  repayment_amount: z.number().positive().optional(),
});

export const remindLoanSchema = z.object({
  channel: z.enum(['whatsapp', 'email', 'both']).default('both'),
  friend_email: z.string().email().optional(),
  friend_phone: z.string().optional(),
  custom_note: z.string().max(300).optional(),
});
