import { useState, useEffect } from 'react'
import axios from 'axios'
import { FolderOpen, Zap, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'

const API_STATS = 'http://localhost:8000/api/dossiers/stats/'

function StatCard({ icon: Icon, iconColor, iconBg, label, value, subLabel }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className={`p-2 rounded-xl ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
        {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await axios.get(API_STATS)
        setStats(data)
      } catch {
        setError('Impossible de charger les statistiques. Vérifiez que le serveur est démarré.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de l'activité CEE</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-24 text-gray-400 gap-3">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Chargement des statistiques...</span>
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              icon={FolderOpen}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
              label="Nombre de dossiers"
              value={stats.total_dossiers.toLocaleString('fr-FR')}
              subLabel="dossiers enregistrés"
            />
            <StatCard
              icon={Zap}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              label="Volume total"
              value={Number(stats.somme_volumes).toLocaleString('fr-FR')}
              subLabel="MWh cumac"
            />
            <StatCard
              icon={TrendingUp}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
              label="Prix unitaire moyen"
              value={`${Number(stats.prix_unitaire_moyen).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} €`}
              subLabel="prime / volume"
            />
          </div>
        )}
      </main>
    </div>
  )
}
