import { z } from 'zod';

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
});

export const repayLoanSchema = z.object({
  is_repaid: z.boolean().default(true),
});
