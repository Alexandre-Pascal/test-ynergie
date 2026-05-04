import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import GestionDossiers from './pages/GestionDossiers'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dossiers" replace />} />
        <Route path="/dossiers" element={<GestionDossiers />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
