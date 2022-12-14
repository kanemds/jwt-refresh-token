const Cart = require('../models/Cart')
const Product = require('../models/Product')
const User = require('../models/User')

require('express-async-errors')

const getAllCarts = async (req, res) => {
  const products = await Cart.find()
  if (!products.length) {
    return res.status(400).json({ message: 'No Products Found' })
  }
  res.json(products)
}

const createCart = async (req, res) => {
  const { id, user, productId, totalprice, totalproducts } = req.body

  const existCart = await Cart.findById(id).exec()
  const existProduct = await Cart.findOne({ productId }).exec()
  if (existCart) {
    if (!existProduct) {
      existCart.productId.push(productId)
      existCart.totalprice += totalprice
      existCart.totalproducts += totalproducts
    } else if (existProduct) {

      existCart.totalprice += totalprice
      existCart.totalproducts += totalproducts
    }
    existCart.save()
    return res.status(201).json(existCart._id)
  } else {

    const info = { user, productId, totalprice, totalproducts }

    const newCart = await Cart.create(info)

    return res.status(201).json(newCart._id)
  }
}


const updateCart = async (req, res) => {
  const { id, cartname, email, password } = req.body

  const lowerCase = email.toLowerCase()

  if (!cartname || !lowerCase) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const currentCart = await Cart.findById(id).exec()

  if (!currentCart) {
    return res.status(400).json({ message: 'Cart not Found' })
  }

  const duplicateName = await Cart.findOne({ cartname }).collation({ locale: 'en', strength: 2 }).lean().exec()

  if (duplicateName && duplicateName?._id.toString() !== id) {
    return res.status(409).json({ message: 'Cart Name already exist, Please try another one' })
  }

  const duplicateEmail = await Cart.findOne({ lowerCase }).collation({ locale: 'en', strength: 2 }).lean().exec()

  if (duplicateEmail && duplicateEmail?._id.toString() !== id) {
    return res.status(409).json({ message: 'Email already exist, Please try another one' })
  }

  currentCart.cartname = cartname
  currentCart.email = lowerCase

  if (password) {
    currentCart.password = await bcrypt.hash(password, 10)
  }

  const update = await currentCart.save()

  res.json({ message: `${update.cartname} updated` })

}

const deleteCart = async (req, res) => {
  const { id } = req.body

  if (!id) return res.status(400).json({ message: 'Cart Id required' })

  const currentCart = await Cart.findById(id).exec()

  if (!currentCart) return res.status(400).json({ message: 'Cart not Found' })

  const result = await currentCart.deleteOne()

  const reply = `Cart '${result.cartname}' delete`

  res.json(reply)

}

module.exports = { getAllCarts, createCart, updateCart, deleteCart }