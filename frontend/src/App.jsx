import React from 'react'
import NavBar from './components/NavBar'
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage"
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage"
const App = () => {
  return (
    <div>
      <NavBar />
      <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='/profile' element={<ProfilePage />} />
      </Routes>
    </div>
  )
}

export default App