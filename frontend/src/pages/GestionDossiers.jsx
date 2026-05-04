import { useState, useEffect } from 'react'
import axios from 'axios'
import { PlusCircle, FolderOpen, Filter, Loader2, AlertCircle } from 'lucide-react'

const TYPES_TRAVAUX_PREDEFINED = [
  { value: 'ISOLATION', label: 'Isolation' },
  { value: 'CHAUFFAGE', label: 'Chauffage' },
  { value: 'POMPE À CHALEUR', label: 'Pompe à chaleur' },
]

const BADGE_COLORS = {
  'ISOLATION': 'bg-blue-100 text-blue-700',
  'CHAUFFAGE': 'bg-orange-100 text-orange-700',
  'POMPE À CHALEUR': 'bg-purple-100 text-purple-700',
}

const INITIAL_FORM = {
  beneficiaire: '',
  type_travaux: '',
  volume: '',
  prime: '',
}

export default function GestionDossiers() {
  const [dossiers, setDossiers] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [typeLibre, setTypeLibre] = useState(false)
  const [filtre, setFiltre] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)

  const fetchDossiers = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await axios.get('http://localhost:8000/api/dossiers/')
      setDossiers(data)
    } catch {
      setError('Impossible de charger les dossiers. Vérifiez que le serveur est démarré.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDossiers()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleTypeSelect = (e) => {
    const val = e.target.value
    if (val === '__autre__') {
      setTypeLibre(true)
      setForm({ ...form, type_travaux: '' })
    } else {
      setTypeLibre(false)
      setForm({ ...form, type_travaux: val })
    }
  }

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setTypeLibre(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.beneficiaire || !form.type_travaux || !form.volume || !form.prime) {
      setFormError('Tous les champs sont obligatoires.')
      return
    }
    try {
      setSubmitting(true)
      setFormError(null)
      await axios.post('http://localhost:8000/api/dossiers/', {
        ...form,
        volume: Number(form.volume),
        prime: Number(form.prime),
      })
      resetForm()
      await fetchDossiers()
    } catch {
      setFormError("Erreur lors de l'ajout du dossier.")
    } finally {
      setSubmitting(false)
    }
  }

  const typesUniques = [
    ...new Set(dossiers.map((d) => d.type_travaux)),
  ].sort()

  const dossiersFiltres = filtre
    ? dossiers.filter((d) => d.type_travaux === filtre)
    : dossiers

  const badgeClass = (type) =>
    BADGE_COLORS[type] ?? 'bg-gray-100 text-gray-700'

  const labelType = (value) =>
    TYPES_TRAVAUX_PREDEFINED.find((t) => t.value === value)?.label ?? value

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Dossiers</h1>
          <p className="text-sm text-gray-500 mt-1">Ajout et consultation des dossiers CEE</p>
        </div>

        {/* Formulaire d'ajout */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-5 flex items-center gap-2">
            <PlusCircle size={20} className="text-emerald-600" />
            Ajouter un dossier
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Bénéficiaire</label>
              <input
                type="text"
                name="beneficiaire"
                value={form.beneficiaire}
                onChange={handleChange}
                placeholder="Nom du bénéficiaire"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Type de travaux</label>
              {!typeLibre ? (
                <select
                  name="type_travaux"
                  value={form.type_travaux}
                  onChange={handleTypeSelect}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Sélectionner...</option>
                  {TYPES_TRAVAUX_PREDEFINED.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                  <option value="__autre__">Autre...</option>
                </select>
              ) : (
                <div className="flex gap-1">
                  <input
                    type="text"
                    name="type_travaux"
                    value={form.type_travaux}
                    onChange={handleChange}
                    placeholder="Type personnalisé"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => { setTypeLibre(false); setForm({ ...form, type_travaux: '' }) }}
                    className="px-2 py-2 text-gray-400 hover:text-gray-600 text-xs border border-gray-300 rounded-lg transition"
                    title="Revenir à la liste"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Volume</label>
              <input
                type="number"
                name="volume"
                value={form.volume}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Prime (€)</label>
              <input
                type="number"
                name="prime"
                value={form.prime}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex flex-col gap-2">
              {formError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="self-start flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-lg transition text-sm"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <PlusCircle size={16} />
                )}
                Ajouter le dossier
              </button>
            </div>
          </form>
        </section>

        {/* Filtre + Tableau */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <FolderOpen size={20} className="text-emerald-600" />
              Liste des dossiers
              <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {dossiersFiltres.length}
              </span>
            </h2>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filtre}
                onChange={(e) => setFiltre(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
              >
                <option value="">Tous les types</option>
                {typesUniques.map((type) => (
                  <option key={type} value={type}>{labelType(type)}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 text-sm mb-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16 text-gray-400 gap-3">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm">Chargement des dossiers...</span>
            </div>
          ) : dossiersFiltres.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FolderOpen size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun dossier trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Bénéficiaire</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Type de travaux</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Volume</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Prime (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dossiersFiltres.map((dossier, index) => (
                    <tr key={dossier.id ?? index} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{dossier.beneficiaire}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass(dossier.type_travaux)}`}>
                          {labelType(dossier.type_travaux)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{dossier.volume}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                        {Number(dossier.prime).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
