import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { handlers } from '../test/handlers'
import GestionDossiers from '../pages/GestionDossiers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const renderPage = () =>
  render(
    <MemoryRouter>
      <GestionDossiers />
    </MemoryRouter>
  )

describe('GestionDossiers', () => {
  it('affiche le spinner pendant le chargement', () => {
    renderPage()
    expect(screen.getByText('Chargement des dossiers...')).toBeInTheDocument()
  })

  it('affiche les dossiers après chargement', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    })
  })

  it('affiche "Aucun dossier trouvé" sur liste vide', async () => {
    server.use(
      http.get('http://localhost:8000/api/dossiers/', () => {
        return HttpResponse.json([])
      })
    )
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Aucun dossier trouvé.')).toBeInTheDocument()
    })
  })

  it("affiche un message d'erreur si l'API échoue", async () => {
    server.use(
      http.get('http://localhost:8000/api/dossiers/', () => {
        return HttpResponse.error()
      })
    )
    renderPage()
    await waitFor(() => {
      expect(
        screen.getByText(/Impossible de charger les dossiers/)
      ).toBeInTheDocument()
    })
  })

  it('affiche une erreur sur soumission du formulaire vide', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => screen.getByText('Jean Dupont'))
    await user.click(screen.getByRole('button', { name: /Ajouter le dossier/ }))
    expect(
      screen.getByText('Tous les champs sont obligatoires.')
    ).toBeInTheDocument()
  })

  it('soumet le formulaire correctement et réinitialise les champs', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => screen.getByText('Jean Dupont'))

    await user.type(screen.getByPlaceholderText('Nom du bénéficiaire'), 'Paul Durand')
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'ISOLATION')
    await user.type(screen.getByPlaceholderText('0'), '150')
    await user.type(screen.getByPlaceholderText('0.00'), '750')

    await user.click(screen.getByRole('button', { name: /Ajouter le dossier/ }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nom du bénéficiaire')).toHaveValue('')
    })
  })

  it('le filtre par type réduit la liste affichée', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    })

    const filtreSelect = screen.getAllByRole('combobox')[1]
    await user.selectOptions(filtreSelect, 'ISOLATION')

    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    expect(screen.queryByText('Marie Martin')).not.toBeInTheDocument()
  })
})
