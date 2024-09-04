import express from 'express'
import db from '@repo/db/client'
const app = express()

app.post('/hdfcWebhook', async (req, res) => {
  const paymentInformation = {
    token: req.body.token,
    userId: req.body.user_identifier,
    amount: req.body.amount,
  }
  try {
    await db.balance.update({
      where: {
        userId: paymentInformation.userId,
      },
      data: {
        amount: {
          increment: paymentInformation.amount,
        },
      },
    })
    await db.onRampTransaction.update({
      where: {
        token: paymentInformation.token,
      },
      data: {
        status: 'Success',
      },
    })
    res.status(200).json({
      message: 'Captured',
    })
  } catch (error) {
    console.log(error)
    res.status(411).json({
      message: 'Error while processing webHook',
    })
  }
})

app.listen(3003)
