import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Public from './pages/Public'
import DashBoard from './pages/DashBoard'
import UsersList from './pages/users/UsersList'
import NotesList from './pages/notes/NotesList'
import DashBoardLayout from './components/DashBoardLayout'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />} >
          <Route index element={<Public />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />

          <Route path='dash' element={<DashBoardLayout />}>

            <Route index element={<DashBoard />} />

            <Route path='users'>
              <Route index element={<UsersList />} />
            </Route>

            <Route path='notes'>
              <Route index element={<NotesList />} />
            </Route>

          </Route>
        </Route>
      </Routes>



    </BrowserRouter >
  )
}

export default App
