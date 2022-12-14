require('express-async-errors')
require('dotenv').config()
const Order = require('../models/Order')
const User = require('../models/User')
const Product = require('../models/Product')
const Book = require('../models/Book')

const stripe = require('stripe')(process.env.STRIPE_SECRET)

const payment = async (req, res) => {

  const { username, product, createdAt, inventoryIds } = req.body

  console.log('stripe', createdAt)

  const currentUser = await User.findOne({ username }).exec()
  if (!currentUser) return res.status(400).json({ message: 'No User Found' })

  const unixTimestamp = Math.floor(createdAt / 1000)


  const customer = await stripe.customers.create({
    metadata: {
      userId: (currentUser._id).toString(),
      cartId: product._id
    }
  })

  const line_items = product.details.map(item => {
    return {
      price_data: {
        currency: 'cad',
        product_data: {
          name: item.title,
          // images: [item.image],  not working some reasons
          metadata: {
            product_id: item.bookId
          }
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }
  })

  const info = {
    submit_type: 'pay',
    mode: 'payment',
    payment_method_types: ['card'],
    shipping_address_collection: { allowed_countries: ['CA'] },
    shipping_options: [
      { shipping_rate: 'shr_1LNP85K4K0yDBdautvs6d1Jl' },
      { shipping_rate: 'shr_1LNPAbK4K0yDBdauAezenimx' },
      { shipping_rate: 'shr_1LNP9vK4K0yDBdaujqxdZlnA' },
    ],
    customer: customer.id,
    line_items,
    phone_number_collection: {
      enabled: true
    },
    mode: 'payment',
    // to the location when payment is successed
    success_url: `${process.env.CLIENT_URL}/payment-success`,
    // to the location when press back or cancel the payment
    cancel_url: `${process.env.CLIENT_URL}/carts`,
    expires_at: unixTimestamp + 30 * 60
  }

  const session = await stripe.checkout.sessions.create(info)
  // console.log('session', session)


  // below it's from original code "form controll"
  // res.redirect(303, session.url)

  // since using onClick event, we're using this
  res.status(201).json({ url: session.url })
}

// after payment successed, save all the info to mongodb

const createOrder = async (customer, data) => {
  const { cartId } = customer.metadata
  const { userId } = customer.metadata

  const paidItems = await Product.findById(cartId).exec()
  const paidUser = await User.findById(userId).select('-password').lean().exec()

  const newOrder = new Order({
    user: paidUser,
    customerId: data.customer,
    paymentId: data.payment_intent,
    products: paidItems,
    subtotal: data.amount_subtotal,
    total: data.amount_total,
    shipping: data.customer_details,
    payment_status: data.payment_status
  })

  const saveOrder = await newOrder.save()
  console.log("Processed Order", saveOrder)
  // send email event here if needed
}




const webHook = (req, res) => {

  // This is your Stripe CLI webhook secret for testing your endpoint locally.
  const endpointSecret = process.env.SIGNING_SECRET

  const sig = req.headers['stripe-signature']

  let data
  let eventType

  if (endpointSecret) {

    let event

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } catch (err) {
      // On error, log and return the error message
      // console.log(`??? Error message: ${err.message}`)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    data = event.data.object
    eventType = event.type

  } else {
    data = req.body.data.object
    eventType = req.body.type
  }

  // only handle one event
  if (eventType === 'checkout.session.completed') {
    stripe.customers
      .retrieve(data.customer)
      .then(customer => {
        createOrder(customer, data)
      })
      .catch(error => console.log(error.message))
  }


  // Successfully constructed event
  // console.log('??? Success:', event.id)

  // Return a response to acknowledge receipt of the event
  res.json({ received: true })
}




module.exports = { payment, webHook }