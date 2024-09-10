'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import prisma from '@repo/db/client'
import { p2pTransferSchema } from '@repo/zodtypes/types'

export async function p2pTransfer(to: string, amount: number) {
  const res = p2pTransferSchema.safeParse({ amount: amount, to: to })
  if (!res.success) {
    return {
      message: 'Invalid Data',
    }
  }
  const session = await getServerSession(authOptions)
  const fromUser = session?.user?.id

  if (!fromUser) {
    return {
      message: 'Error while sending',
    }
  }
  const toUser = await prisma.user.findFirst({
    where: {
      number: to,
    },
  })
  if (!toUser) {
    return {
      message: 'User does not exists',
    }
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.$queryRaw`SELECT * from "Balance" WHERE "userId"=${Number(fromUser)} FOR UPDATE`
    const fromBalance = await tx.balance.findUnique({
      where: {
        userId: Number(fromUser),
      },
    })
    if (!fromBalance || fromBalance.amount < amount) {
      throw new Error('Insufficient Funds')
    }
    await tx.balance.update({
      where: {
        userId: Number(fromUser),
      },
      data: {
        amount: { decrement: amount },
      },
    })
    await tx.balance.update({
      where: {
        userId: Number(toUser.id),
      },
      data: {
        amount: { increment: amount },
      },
    })

    await tx.p2pTransfer.create({
      data: {
        fromUserId: Number(fromUser),
        toUserId: toUser.id,
        amount,
        timestamp: new Date(),
      },
    })
  })
}
