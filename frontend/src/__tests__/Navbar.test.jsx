import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'

const renderNavbar = (initialEntry = '/dossiers') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Navbar />
    </MemoryRouter>
  )

describe('Navbar', () => {
  it('affiche les deux liens de navigation', () => {
    renderNavbar()
    expect(screen.getByText('Dossiers')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('affiche le logo Ynergie', () => {
    renderNavbar()
    expect(screen.getByText('Ynergie')).toBeInTheDocument()
  })

  it('le lien actif a la classe text-emerald-700', () => {
    renderNavbar('/dossiers')
    const link = screen.getByText('Dossiers').closest('a')
    expect(link).toHaveClass('text-emerald-700')
  })
})
