import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ListaPage from './pages/ListaPage.jsx'
import FichaPage from './pages/FichaPage.jsx'

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<ListaPage />} />
        <Route path="/processo/:id" element={<FichaPage />} />
        <Route path="*" element={<Navigate to="/" replace state={{ de: pathname }} />} />
      </Routes>
    </div>
  )
}
