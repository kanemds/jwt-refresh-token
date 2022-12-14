import { Typography, Table, TableCell, Box, TableContainer, TableHead, TableRow, Paper, Link, Button } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import LoadingMessage from '../../components/LoadingMessage'
import { useGetCartsQuery } from './cartApiSlice'
import CartList from './CartList'
import { styled } from '@mui/material/styles'
import { grey, red, pink } from '@mui/material/colors'
import { useGetProductsQuery } from '../products/productApiSlice'
import PayButton from '../payments/PayButton'
import useAuth from '../../hooks/useAuth'



const KEEPSHOPPING = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(grey[50]),
  backgroundColor: grey[50],
  '&:hover': {
    backgroundColor: grey[200],
    border: '1px #9e9e9e solid'
  },
  border: '1px #bdbdbd solid',
}))



const STICKY = styled(Box)(({ theme }) => ({
  position: 'fixed'
}))




const ShoppingCart = () => {

  const navigate = useNavigate()
  const { username } = useAuth()


  const [cartId, setCartId] = useState(localStorage.getItem('BookShopCartId') || null)

  const { product } = useGetProductsQuery('productList', {
    selectFromResult: ({ data }) => ({
      product: data?.entities[cartId]
    })
  })




  let content

  if (cartId && product?.details?.length === 0) {
    content = (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant='h6'>
          Your cart is currently empty.
        </Typography>
        <Link to='/' component={RouterLink} underline='none' color='#1976d2'>Keep Shopping to K Book Shop</Link>
      </Box >
    )
  }

  if (cartId && product?.details?.length > 0) {
    if (!product) {
      content = (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingMessage />
        </Box >
      )
    } else {
      content = (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box >
            <Typography variant='h5'>SHOPPING CART</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }} >
            <Box sx={{ width: '65%', height: '100%' }}>
              {product.details.map(product =>
                <CartList key={product.bookId} product={product} />
              )}
            </Box>

            <Box sx={{ width: '30%' }}>
              <STICKY sx={{ display: 'flex', flexDirection: 'column', border: '1px solid lightGrey' }}>
                <Typography sx={{ mt: 4, ml: 2, mr: 2 }}>ORDER SUMMARY | {product.totalcounts} ITEM(S)</Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 4, ml: 2, mr: 2
                }} >
                  <Typography>SUBTOTAL</Typography>
                  <Typography>CAD $ {product.totalprice.toFixed(2)}</Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 4, ml: 2, mr: 2
                }}>
                  <Typography variant='body2'>Estimated Tax</Typography>
                  <Typography variant='body2'>TBD</Typography>
                </Box>

                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 4, ml: 2, mr: 2
                }}>
                  <Typography>ORDER TOTAL</Typography>
                  <Typography>CAD $ {product.totalprice.toFixed(2)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4 }}>
                  <PayButton product={product} cartId={cartId} />
                  <KEEPSHOPPING variant='contained' sx={{ mt: 2 }} onClick={() => navigate('/')}>COUTINUE SHOPPING</KEEPSHOPPING>
                </Box>
              </STICKY>


            </Box>
          </Box>
        </Box >
      )
    }
  }



  return content
}

export default ShoppingCart

