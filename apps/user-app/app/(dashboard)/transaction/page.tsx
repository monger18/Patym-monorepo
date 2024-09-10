import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import prisma from '@repo/db/client'
import { OnRampTransactions } from '../../../components/OnRampTransaction'

async function getOnRampTransactions(status: any) {
  const session = await getServerSession(authOptions)
  const trans = await prisma.onRampTransaction.findMany({
    where: {
      userId: Number(session?.user?.id),
      status: status,
    },
  })
  return trans.map((t) => ({
    time: t.startTime,
    amount: t.amount,
    status: t.status,
    provider: t.provider,
  }))
}

async function getsentP2PTransaction() {
  const session = await getServerSession(authOptions)
  const trans = await prisma.p2pTransfer.findMany({
    where: {
      fromUserId: Number(session?.user?.id),
    },
  })

  return trans.map((t) => ({
    time: t.timestamp,
    amount: t.amount,
    status: 'Success',
    provider: String(t.toUserId),
  }))
}
async function getreceivedP2PTransaction() {
  const session = await getServerSession(authOptions)
  const trans = await prisma.p2pTransfer.findMany({
    where: {
      toUserId: Number(session?.user?.id),
    },
  })

  return trans.map((t) => ({
    time: t.timestamp,
    amount: t.amount,
    status: 'Success',
    provider: String(t.fromUserId),
  }))
}

export default async function () {
  const successTransactions = await getOnRampTransactions('Success')
  const processingTransactions = await getOnRampTransactions('Processing')
  const failureTransactions = await getOnRampTransactions('Failure')
  const sentTransactions = await getsentP2PTransaction()
  const receivedTransactions = await getreceivedP2PTransaction()

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
        Transactions
      </h1>
      <div className="w-[80vw] grid grid-cols-1 md:grid-cols-2 px-10 gap-3">
        <h1 className="text-2xl text-[#6a51a6] pt-2 font-bold col-span-2">
          P2P Transactions
        </h1>
        <div>
          <OnRampTransactions
            title={'Sent Transactions'}
            transactions={sentTransactions}
          />
        </div>
        <div>
          <OnRampTransactions
            title="Received Transactions"
            transactions={receivedTransactions}
          />
        </div>
      </div>
      <div className="w-[80vw] grid grid-cols-1 md:grid-cols-2 px-10 gap-3">
        <h1 className="text-2xl text-[#6a51a6] pt-2 font-bold col-span-2">
          Wallet Transactions
        </h1>
        <div>
          <OnRampTransactions
            title={'Successful Transactions'}
            transactions={successTransactions}
          />
        </div>
        <div>
          <OnRampTransactions
            title={'Processing Transactions'}
            transactions={processingTransactions}
          />
        </div>
        <div>
          <OnRampTransactions
            title={'Failed Transactions'}
            transactions={failureTransactions}
          />
        </div>
      </div>
    </div>
  )
}
