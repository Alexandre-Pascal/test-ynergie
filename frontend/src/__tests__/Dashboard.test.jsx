import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { handlers } from '../test/handlers'
import Dashboard from '../pages/Dashboard'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )

describe('Dashboard', () => {
  it('affiche le spinner pendant le chargement', () => {
    renderDashboard()
    expect(screen.getByText('Chargement des statistiques...')).toBeInTheDocument()
  })

  it('affiche les 3 cartes avec les bonnes valeurs', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Nombre de dossiers')).toBeInTheDocument()
      expect(screen.getByText('Volume total')).toBeInTheDocument()
      expect(screen.getByText('Prix unitaire moyen')).toBeInTheDocument()
    })
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('affiche le prix unitaire moyen avec 2 décimales et €', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText(/5,00 €/)).toBeInTheDocument()
    })
  })

  it('affiche un message d\'erreur si l\'API échoue', async () => {
    server.use(
      http.get('http://localhost:8000/api/dossiers/stats/', () => {
        return HttpResponse.error()
      })
    )
    renderDashboard()
    await waitFor(() => {
      expect(
        screen.getByText(/Impossible de charger les statistiques/)
      ).toBeInTheDocument()
    })
  })
})
