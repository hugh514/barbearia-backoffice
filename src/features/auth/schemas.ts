import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
  tenantSlug: z.string().trim().min(1).optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const tokenPairSchema = z.object({
  accessToken: z.string().min(10),
  refreshToken: z.string().min(10),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

const strongPassword = z
  .string()
  .min(8, 'Mínimo de 8 caracteres')
  .regex(/[A-Z]/, 'Inclua uma letra maiúscula')
  .regex(/[a-z]/, 'Inclua uma letra minúscula')
  .regex(/[0-9]/, 'Inclua um número');

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const registerClientSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome'),
  phone: z.string().trim().min(8, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional(),
  password: strongPassword,
  tenantSlug: z.string().trim().min(1, 'Informe a barbearia'),
});
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
