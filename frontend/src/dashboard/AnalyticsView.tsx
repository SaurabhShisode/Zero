import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { api } from "../api/client"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { AlertCircle, CheckCircle2, Clock, FastForward, Flame, TrendingUp } from "lucide-react"
import toast from "react-hot-toast"

interface SkillStat {
  skill: string
  easy: { solved: number; total: number; rate: number }
  medium: { solved: number; total: number; rate: number }
  hard: { solved: number; total: number; rate: number }
  totalSolved: number
  totalAttempts: number
}

interface Analytics {
  totalSolved: number
  totalWrong: number
  totalSkipped: number
  avgTimePerProblem: number
  skillStats: SkillStat[]
  bestPerformingHours: Array<{ hour: number; solveCount: number }>
  weeklyTrends: Array<{ date: string; solveCount: number; wrongCount: number; skippedCount: number }>
  monthlyTrends: Array<{ date: string; solveCount: number; wrongCount: number; skippedCount: number }>
}

const tooltipStyle = {
  backgroundColor: "rgba(10,10,10,0.96)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "8px",
  color: "white"
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0m"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

function glassCard(extra = "") {
  return `rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl ${extra}`
}

export default function AnalyticsView() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get("/api/analytics")
      .then((res) => setAnalytics(res.data.analytics))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="font-geist mx-4 sm:mx-6 md:mx-10 mt-6 sm:mt-8 md:mt-10 mb-10 space-y-6">
        <div className="space-y-2 animate-pulse">
          <div className="h-6 w-36 rounded bg-white/20" />
          <div className="h-4 w-72 rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${glassCard("p-5")} h-28 animate-pulse`} />
          ))}
        </div>
        <div className={`${glassCard("p-6")} h-80 animate-pulse`} />
      </section>
    )
  }

  if (!analytics) {
    return (
      <section className="font-geist mx-4 sm:mx-6 md:mx-10 mt-10">
        <div className={`${glassCard("p-10 text-center")}`}>
          <p className="text-white/40">No analytics data available yet.</p>
        </div>
      </section>
    )
  }

  const totalAttempts = analytics.totalSolved + analytics.totalWrong + analytics.totalSkipped
  const solveRate = totalAttempts > 0 ? (analytics.totalSolved / totalAttempts) * 100 : 0
  const outcomeData = [
    { name: "Solved", value: analytics.totalSolved, color: "#22c55e" },
    { name: "Wrong", value: analytics.totalWrong, color: "#ef4444" },
    { name: "Skipped", value: analytics.totalSkipped, color: "#f59e0b" }
  ].filter((item) => item.value > 0)

  const topHour = analytics.bestPerformingHours[0]
  const statCards = [
    { label: "Problems solved", value: analytics.totalSolved, icon: CheckCircle2, tone: "text-green-400" },
    { label: "Success rate", value: `${solveRate.toFixed(1)}%`, icon: TrendingUp, tone: "text-blue-400" },
    { label: "Avg completion", value: formatTime(analytics.avgTimePerProblem), icon: Clock, tone: "text-purple-300" },
    {
      label: "Best hour",
      value: topHour ? `${topHour.hour}:00` : "No data",
      icon: Flame,
      tone: "text-orange-300"
    }
  ]

  return (
    <section className="font-geist mx-4 sm:mx-6 md:mx-10 mt-6 sm:mt-8 md:mt-10 mb-10 space-y-6 text-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-white/40 mt-1">Track momentum, mastery, and practice quality.</p>
        </div>
        <div className="text-xs text-white/40">{totalAttempts} total attempts</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`${glassCard("p-5")} min-h-28`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/45">{card.label}</p>
                  <p className="text-2xl font-semibold tracking-tight mt-2">{card.value}</p>
                </div>
                <span className="h-10 w-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${card.tone}`} />
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-4">
        <motion.div
          className={glassCard("p-5 sm:p-6")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Weekly Trend</h2>
            <span className="text-xs text-white/35">Solved, wrong, skipped</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.42)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.42)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="solveCount" fill="#22c55e" name="Solved" radius={[6, 6, 0, 0]} />
              <Bar dataKey="wrongCount" fill="#ef4444" name="Wrong" radius={[6, 6, 0, 0]} />
              <Bar dataKey="skippedCount" fill="#f59e0b" name="Skipped" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className={glassCard("p-5 sm:p-6")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Attempt Mix</h2>
            <span className="text-xs text-white/35">{solveRate.toFixed(0)}% solved</span>
          </div>
          {outcomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={outcomeData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={104} paddingAngle={4}>
                  {outcomeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-white/40">No attempts yet</div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">
        <motion.div
          className={glassCard("p-5 sm:p-6")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <h2 className="text-lg font-semibold mb-5">Skill Mastery</h2>
          <div className="space-y-5">
            {analytics.skillStats.slice(0, 6).map((skill) => (
              <div key={skill.skill} className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium truncate">{skill.skill}</p>
                  <span className="text-xs text-white/40">
                    {skill.totalSolved}/{skill.totalAttempts || 0}
                  </span>
                </div>
                {[
                  { label: "Easy", rate: skill.easy.rate, color: "bg-green-400" },
                  { label: "Medium", rate: skill.medium.rate, color: "bg-yellow-400" },
                  { label: "Hard", rate: skill.hard.rate, color: "bg-red-400" }
                ].map((row) => (
                  <div key={row.label} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-xs">
                    <span className="text-white/45">{row.label}</span>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${Math.min(100, row.rate)}%` }} />
                    </div>
                    <span className="text-right text-white/45">{row.rate.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={glassCard("p-5 sm:p-6")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Monthly Trend</h2>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400" /> Solved</span>
              <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-400" /> Wrong</span>
              <span className="flex items-center gap-1"><FastForward className="w-3 h-3 text-yellow-400" /> Skipped</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.42)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.42)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="solveCount" fill="#22c55e" name="Solved" radius={[6, 6, 0, 0]} />
              <Bar dataKey="wrongCount" fill="#ef4444" name="Wrong" radius={[6, 6, 0, 0]} />
              <Bar dataKey="skippedCount" fill="#f59e0b" name="Skipped" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {analytics.bestPerformingHours.length > 0 && (
        <motion.div
          className={glassCard("p-5 sm:p-6")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-5">Best Performing Hours</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.bestPerformingHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.42)" tickFormatter={(hour) => `${hour}:00`} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.42)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(hour) => `${hour}:00 - ${hour}:59`} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="solveCount" fill="#60a5fa" name="Solves" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </section>
  )
}
