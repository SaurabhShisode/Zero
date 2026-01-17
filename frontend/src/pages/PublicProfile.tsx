import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useParams } from "react-router-dom"
import { api } from "../api/client"
import { Award } from "lucide-react"

type HeatmapDay = {
  date: string
  count: number
}

type HeatCell = {
  date: string | null
  count: number | null
}

type PublicUser = {
  _id?: string
  name: string
  profileSlug: string
  streak: {
    current: number
    max: number
    freezeAvailable?: number
  }
  badges?: string[]
}

type ProfileStats = {
  easySolved: number
  easyTotal: number
  mediumSolved: number
  mediumTotal: number
  hardSolved: number
  hardTotal: number
}

export default function PublicProfileView() {
  const { slug } = useParams<{ slug: string }>()

  const [user, setUser] = useState<PublicUser | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    Promise.all([
      api.get(`/api/profile/public/${slug}`),
      api.get(`/api/profile/public/${slug}/stats`),
      api.get(`/api/profile/public/${slug}/heatmap`)
    ])
      .then(([userRes, statsRes, heatmapRes]) => {
        setUser(userRes.data.user)
        setStats(statsRes.data.stats)
        setHeatmap(heatmapRes.data.heatmap || [])
      })
      .catch(() => {
        setUser(null)
        setStats(null)
        setHeatmap([])
      })
      .finally(() => setLoading(false))
  }, [slug])

  function formatDMY(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  function getLast12Months() {
    const months = []
    const today = new Date()

    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString("en-US", { month: "short" })
      })
    }

    return months
  }

  function buildMonthHeatmaps(days: HeatmapDay[]): HeatCell[][][] {
    const map = new Map<string, number>()
    days.forEach(d => map.set(d.date, d.count))

    function format(d: Date) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`
    }

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const startDate = new Date()
    startDate.setFullYear(today.getFullYear() - 1)
    startDate.setHours(0, 0, 0, 0)

    const monthsMeta = getLast12Months()
    const months: HeatCell[][][] = []

    monthsMeta.forEach(({ year, month }) => {
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      let date = new Date(firstDay)
      let monthMatrix: HeatCell[][] = []
      let week: HeatCell[] = Array.from({ length: 7 }, () => ({
        date: null,
        count: null
      }))

      const offset = date.getDay()
      for (let i = 0; i < offset; i++) {
        week[i] = { date: null, count: null }
      }

      while (date <= lastDay) {
        const dayIndex = date.getDay()
        const key = format(date)

        if (date >= startDate && date <= today) {
          week[dayIndex] = {
            date: key,
            count: map.get(key) ?? 0
          }
        } else {
          week[dayIndex] = { date: null, count: null }
        }

        if (dayIndex === 6) {
          monthMatrix.push(week)
          week = Array.from({ length: 7 }, () => ({
            date: null,
            count: null
          }))
        }

        date.setDate(date.getDate() + 1)
      }

      monthMatrix.push(week)
      months.push(monthMatrix)
    })

    return months
  }

  function getColor(count: number | null) {
    if (count === null) return "transparent"
    if (count === 0) return "rgba(255,255,255,0.05)"
    if (count === 1) return "rgba(34,197,94,0.25)"
    if (count <= 3) return "rgba(34,197,94,0.45)"
    if (count <= 6) return "rgba(34,197,94,0.65)"
    return "rgba(34,197,94,0.9)"
  }

  if (loading) {
    return <p className="text-white/40 p-10">Loading profile...</p>
  }

  if (!user || !stats) {
    return <p className="text-red-400 p-10">Profile not found</p>
  }

  const solvedTotal =
    stats.easySolved +
    stats.mediumSolved +
    stats.hardSolved

  const allTotal =
    stats.easyTotal +
    stats.mediumTotal +
    stats.hardTotal

  const monthHeatmaps = buildMonthHeatmaps(heatmap)
  const monthsMeta = getLast12Months()

  return (
    <section className="font-geist bg-black text-white px-10 pt-10 pb-10 space-y-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 flex items-center gap-6"
      >
        <img
          src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${user.profileSlug}`}
          className="w-24 h-24 rounded-2xl shadow-xl"
        />

        <div>
          <h1 className="text-2xl font-semibold">
            {user.name}
          </h1>
          <p className="text-sm text-white/40">
            @{user.profileSlug}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6">
          <p className="text-sm text-white/50">Current streak</p>
          <p className="text-4xl font-semibold">
            {user.streak.current} days
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6">
          <p className="text-sm text-white/50">Longest streak</p>
          <p className="text-4xl font-semibold">
            {user.streak.max} days
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 text-white/60">
          <Award className="w-4 h-4" />
          <p className="text-sm tracking-wide">Badges</p>
        </div>

        {(user.badges?.length || 0) === 0 && (
          <p className="text-sm text-white/40">
            No badges yet
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {(user.badges || []).map(b => (
            <span
              key={b}
              className="text-xs px-2 py-1 rounded border border-white/20 text-white/70"
            >
              {b}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4"
      >
        <p className="text-sm tracking-wide text-white/40">
          Consistency heatmap
        </p>

        <div className="w-full overflow-x-auto flex justify-center">
          <div className="flex gap-4 w-max">
            {monthHeatmaps.map((month, mIdx) => (
              <div key={mIdx} className="flex-shrink-0">
                <p className="text-white/40 text-sm mb-2 text-center">
                  {monthsMeta[mIdx].label}
                </p>

                <div className="flex gap-[3px]">
                  {month.map((week, w) => (
                    <div key={w} className="flex flex-col gap-[3px]">
                      {week.map((cell, d) =>
                        cell.count === null ? (
                          <div key={d} className="w-[11px] h-[11px]" />
                        ) : (
                          <div
                            key={d}
                            className="w-[11px] h-[11px] rounded-[2px] cursor-pointer transition"
                            style={{ backgroundColor: getColor(cell.count) }}
                            title={
                              cell.date
                                ? `${formatDMY(cell.date)} · ${cell.count} solves`
                                : ""
                            }
                          />
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
