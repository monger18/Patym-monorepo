import db from '@repo/db/client'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import prisma from '@repo/db/client'
import { userLoginSchema } from '@repo/zodtypes/types'

const validateSiginDetails = (
  name: string,
  phoneNumber: string,
  password: string
) => {
  const res = userLoginSchema.safeParse({
    name: name,
    phone: phoneNumber,
    password: password,
  })
  return res.success
}
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        name: {
          label: 'Full Name',
          type: 'text',
          placeholder: 'Satyam Srinath',
          required: true,
        },
        phone: {
          label: 'Phone number',
          type: 'text',
          placeholder: '1231231231',
          required: true,
        },
        password: { label: 'Password', type: 'password', required: true },
      },
      // TODO: User credentials type from next-aut
      async authorize(credentials: any) {
        // Do zod validation, OTP validation here
        const hashedPassword = await bcrypt.hash(credentials.password, 10)
        const existingUser = await db.user.findFirst({
          where: {
            number: credentials.phone,
          },
        })

        if (existingUser) {
          const passwordValidation = await bcrypt.compare(
            credentials.password,
            existingUser.password
          )
          if (passwordValidation) {
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.number,
            }
          }
          return null
        }

        try {
          const user =
            (await db.user.create({
              data: {
                name: credentials.name,
                number: credentials.phone,
                password: hashedPassword,
              },
            })) || 0

          const newBalanceEntry =
            user &&
            (await prisma.balance.create({
              data: {
                amount: 0,
                locked: 0,
                userId: user.id,
              },
            }))

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.number,
          }
        } catch (e) {
          console.error(e)
        }

        return null
      },
    }),
  ],
  secret: process.env.JWT_SECRET || 'secret',
  callbacks: {
    // TODO: can u fix the type here? Using any is bad
    async session({ token, session }: any) {
      session.user.id = token.sub

      return session
    },
  },
}
