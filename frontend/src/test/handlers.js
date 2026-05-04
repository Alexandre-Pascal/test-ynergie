import { http, HttpResponse } from 'msw'

const DOSSIERS = [
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    beneficiaire: 'Jean Dupont',
    type_travaux: 'ISOLATION',
    volume: 100,
    prime: 500,
    date_creation: '2026-05-01T10:00:00Z',
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000002',
    beneficiaire: 'Marie Martin',
    type_travaux: 'CHAUFFAGE',
    volume: 100,
    prime: 500,
    date_creation: '2026-05-02T10:00:00Z',
  },
]

export const handlers = [
  http.get('http://localhost:8000/api/dossiers/', () => {
    return HttpResponse.json(DOSSIERS)
  }),

  http.post('http://localhost:8000/api/dossiers/', async ({ request }) => {
    const body = await request.json()
    const created = {
      id: 'aaaaaaaa-0000-0000-0000-000000000099',
      date_creation: new Date().toISOString(),
      ...body,
    }
    return HttpResponse.json(created, { status: 201 })
  }),

  http.get('http://localhost:8000/api/dossiers/stats/', () => {
    return HttpResponse.json({
      total_dossiers: 2,
      somme_volumes: 200,
      prix_unitaire_moyen: 5.0,
    })
  }),
]
