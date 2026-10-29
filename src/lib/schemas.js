import { z } from 'zod'

export function phoneSchema(t) {
  return z
    .string()
    .trim()
    .min(1, t('auth.errors.phoneRequired'))
    .refine(
      (value) => /^(?:\+?249|0)?9\d{8}$/.test(value.replace(/[\s()-]/g, '')),
      t('auth.errors.phoneInvalid')
    )
}

export function makeLoginSchema(t) {
  return z.object({
    phone: phoneSchema(t),
    password: z.string().min(1, t('auth.errors.passwordRequired')),
  })
}

export function makeRegisterSchema(t) {
  return z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, t('auth.errors.firstNameRequired'))
        .max(50, t('auth.errors.tooLong')),
      lastName: z.string().trim().max(50, t('auth.errors.tooLong')).optional(),
      phone: phoneSchema(t),
      email: z
        .union([z.string().trim().email(t('auth.errors.emailInvalid')), z.literal('')])
        .optional(),
      city: z.string().trim().min(1, t('auth.errors.cityRequired')),
      password: z
        .string()
        .min(8, t('auth.errors.passwordMin'))
        .max(72, t('auth.errors.passwordMax')),
      confirmPassword: z.string().min(1, t('auth.errors.confirmRequired')),
      role: z.enum(['CUSTOMER', 'PROVIDER']),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('auth.errors.passwordMismatch'),
    })
}

export function makeProfileSchema(t) {
  return z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, t('auth.errors.firstNameRequired'))
        .max(50, t('auth.errors.tooLong')),
      lastName: z.string().trim().max(50, t('auth.errors.tooLong')).optional(),
      city: z.string().trim().min(1, t('auth.errors.cityRequired')),
    })
}

export function makeProviderProfileSchema(t) {
  return z.object({
    bio: z.string().trim().max(1000, t('auth.errors.tooLong')).optional(),
    experienceYears: z
      .union([z.literal(''), z.coerce.number().int().min(0).max(60)])
      .optional(),
    startingPrice: z
      .union([z.literal(''), z.coerce.number().int().min(0).max(100000000)])
      .optional(),
    isAvailable: z.boolean(),
  })
}
