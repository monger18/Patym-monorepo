import z from 'zod'

export const userLoginSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, { message: 'Must be a valid phone number' })
    .max(12, { message: 'Must be a valid phone number' }),
  password: z
    .string()
    .min(6, { message: 'password must be atleast 3 characters long' }),
  name: z.string(),
})

export const onRampTransSchema = z.object({
  amount: z.number({ message: 'Enter a valid amount' }).nonnegative(),
  provider: z.string().min(1),
})

export const p2pTransferSchema = z.object({
  amount: z.number({ message: 'Enter a valid amount' }).nonnegative(),
  to: z.string({ message: 'Invalid Phone Number' }),
})
