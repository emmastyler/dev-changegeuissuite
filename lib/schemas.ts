import { z } from 'zod'

const email = z.string().min(1, 'Email is required').email('Enter a valid email').max(255).toLowerCase().trim()
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[a-z]/, 'Must include a lowercase letter')
  .regex(/[0-9]/, 'Must include a number')

export const signUpSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
    email,
    password,
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(128),
})

export const forgotSchema = z.object({ email })

export const resetSchema = z
  .object({
    password,
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotInput = z.infer<typeof forgotSchema>
export type ResetInput = z.infer<typeof resetSchema>
