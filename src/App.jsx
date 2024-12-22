import { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import { AppProvider } from './context/AppContext';

function App() {

  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </AppProvider>
  )
}

export default App
