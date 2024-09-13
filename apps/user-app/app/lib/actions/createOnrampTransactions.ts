'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import prisma from '@repo/db/client'
import { onRampTransSchema } from '@repo/zodtypes/types'
import axios from 'axios'

export async function createOnRampTransactions(
  provider: string,
  amount: number
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !session.user?.id) {
    return {
      message: 'Unauthenticated request',
    }
  }

  const res = onRampTransSchema.safeParse({ amount, provider })
  if (!res.success) {
    return {
      message: 'Invalid data',
      data: null,
    }
  }

  try {
    const token = (Math.random() * 1000).toString()
    await prisma.onRampTransaction.create({
      data: {
        provider,
        status: 'Processing',
        startTime: new Date(),
        token: token,
        userId: Number(session?.user?.id),
        amount: amount * 100,
      },
    })
    const onRampBackEndRequest = await axios.post(
      'http://localhost:3003/hdfcWebhook',
      {
        amount: amount * 100,
        user_identifier: Number(session?.user?.id),
        token: token,
      }
    )

    if (onRampBackEndRequest.status !== 200) {
      throw { message: 'Internal Server Error' }
    }
    return {
      message: 'Transactions initiated Successfully',
    }
  } catch (error) {
    return {
      Error: (error as Error).message,
    }
  }
}
