import { Card } from '@repo/ui/card'
export const OnRampTransactions = ({
  transactions,
  title = 'Recent wallet Transactions',
}: {
  transactions: {
    time: Date
    amount: number
    status: string
    provider: string
  }[]
  title?: string
}) => {
  if (!transactions.length) {
    return (
      <Card title={title}>
        <div className="text-center pb-8 pt-8">No {title}</div>
      </Card>
    )
  }
  return (
    <Card title={title}>
      <div className="pt-2">
        {transactions.map((t) => (
          <div className="flex justify-between">
            <div>
              <div className="text-sm">Received INR</div>
              <div className="text-slate-600 text-xs">
                {t.time.toDateString()}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              + Rs {t.amount / 100}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
