import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { api } from "../api/client"
import { Copy, Award, UserPlus, BarChart2 } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useShallow } from "zustand/react/shallow"


type HeatmapDay = {
  date: string
  count: number
}

type HeatCell = {
  date: string | null
  count: number | null
}

type RecentSolve = {
  date: string
  problem: {
    _id: string
    title: string
    difficulty: "Easy" | "Medium" | "Hard"
  }
}


type ProfileStats = {
  easySolved: number
  easyTotal: number
  mediumSolved: number
  mediumTotal: number
  hardSolved: number
  hardTotal: number
}



export default function ProfileView() {
  const { user, hydrated } = useAuthStore(
    useShallow(state => ({
      user: state.user,
      hydrated: state.hydrated
    }))
  )


  const navigate = useNavigate()

  const [recent, setRecent] = useState<RecentSolve[]>([])

  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([])
  const badges = user?.badges || []

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ProfileStats | null>(null)


  const solvedTotal =
    (stats?.easySolved || 0) +
    (stats?.mediumSolved || 0) +
    (stats?.hardSolved || 0)

  const allTotal =
    (stats?.easyTotal || 0) +
    (stats?.mediumTotal || 0) +
    (stats?.hardTotal || 0)


  const [friendSlug, setFriendSlug] = useState("")
  const [compareData, setCompareData] = useState<{
    you: { streak: any }
    friend: { streak: any }
  } | null>(null)

  const [friends, setFriends] = useState<
    { _id: string; name: string; profileSlug: string }[]
  >([])
  const [fetched, setFetched] = useState(false)


  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    if (!user?._id) return
    if (fetched) return

    setLoading(true)

    Promise.all([
      api.get("/api/profile/heatmap"),
      api.get("/api/profile/friends"),
      api.get("/api/profile/recent"),
      api.get("/api/profile/stats")
    ])
      .then(([heatRes, friendsRes, recentRes, statsRes]) => {
        setHeatmap(heatRes.data.heatmap || [])
        setFriends(friendsRes.data.friends || [])
        setRecent(recentRes.data.recent || [])
        setStats(statsRes.data.stats)
        setFetched(true)
      })
      .finally(() => setLoading(false))
  }, [hydrated, user, fetched])

  function timeAgo(dateStr: string) {
    const now = new Date()
    const then = new Date(dateStr)

    const diffMs = now.getTime() - then.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffSec < 60) return "Just now"
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`

    return then.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }


  function formatDMY(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  function diffColor(diff: "Easy" | "Medium" | "Hard") {
    if (diff === "Easy") return "text-green-400 border-green-400/30"
    if (diff === "Medium") return "text-yellow-400 border-yellow-400/30"
    return "text-red-400 border-red-400/30"
  }



  const copyProfileLink = () => {
    if (!user?.profileSlug) return

    const url = `${window.location.origin}/u/${user.profileSlug}`
    navigator.clipboard.writeText(url)

    setCopied(true)
    toast.success("Profile link copied")

    setTimeout(() => setCopied(false), 1500)
  }


  const addFriend = async () => {
    if (!friendSlug.trim()) {
      toast.error("Enter a profile slug")
      return
    }

    try {
      await api.post("/api/profile/friends", {
        friendSlug: friendSlug.trim()
      })

      toast.success("Friend added")
      setFriendSlug("")
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast("Already friends", { icon: "✓" })
      } else if (err.response?.status === 400) {
        toast.error("You cannot add yourself")
      } else if (err.response?.status === 404) {
        toast.error("User not found")
      } else {
        toast.error("Failed to add friend")
      }
    }
  }


  const compareFriend = async () => {
    if (!friendSlug.trim()) {
      toast.error("Enter a profile slug")
      return
    }

    try {
      const res = await api.get(
        `/api/profile/public/${friendSlug.trim()}`
      )

      const friendId = res.data.user._id

      const compareRes = await api.get(
        `/api/profile/compare/${friendId}`
      )

      setCompareData(compareRes.data)
      toast.success("Comparison loaded")
    } catch {
      toast.error("Could not compare with friend")
    }
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

    days.forEach(d => {
      map.set(d.date, d.count)
    })

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
  const monthHeatmaps = buildMonthHeatmaps(heatmap)
  const monthsMeta = getLast12Months()


  if (!hydrated) return null


  if (!fetched || loading || !user || !stats) {

    return (
      <section className="font-geist mx-10 mt-10 mb-10 space-y-8 text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 flex flex-col md:flex-row gap-6 animate-pulse"
        >
          <div className="w-24 h-24 rounded-2xl bg-white/20" />

          <div className="flex-1 space-y-2">
            <div className="h-6 w-40 bg-white/20 rounded" />
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-4 w-48 bg-white/10 rounded" />
          </div>

          <div className="h-9 w-28 bg-white/20 rounded-lg" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-3 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 animate-pulse"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-52 h-52 rounded-full bg-white/10" />

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
                  >
                    <div className="h-4 w-12 bg-white/20 rounded mx-auto mb-2" />
                    <div className="h-6 w-16 bg-white/20 rounded mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2 flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 animate-pulse"
          >
            <div>
              <div className="h-4 w-24 bg-white/20 rounded mb-2" />
              <div className="h-10 w-20 bg-white/20 rounded" />
            </div>

            <div className="h-12 w-px bg-white/10" />

            <div>
              <div className="h-4 w-28 bg-white/20 rounded mb-2" />
              <div className="h-10 w-20 bg-white/20 rounded" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-3 animate-pulse"
        >
          <div className="h-4 w-48 bg-white/20 rounded" />
          <div className="flex gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-[11px] h-[11px] bg-white/10 rounded-[2px]"
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-3 animate-pulse"
        >
          <div className="h-4 w-40 bg-white/20 rounded" />
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-10 w-full bg-white/10 rounded"
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-3 animate-pulse"
        >
          <div className="h-4 w-24 bg-white/20 rounded" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-6 w-16 bg-white/10 rounded"
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-3 animate-pulse"
        >
          <div className="h-4 w-32 bg-white/20 rounded" />
          <div className="h-10 w-full bg-white/10 rounded" />
        </motion.div>
      </section>
    )
  }




  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    }
  }

  function describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) {
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

    return [
      "M",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      1,
      end.x,
      end.y
    ].join(" ")
  }

  const GAP = 14
  const SEG = 120

  const cx = 104
  const cy = 104
  const r = 90

  const easySolved = stats?.easySolved || 0
  const medSolved = stats?.mediumSolved || 0
  const hardSolved = stats?.hardSolved || 0

  const easyTotal = stats?.easyTotal || 1
  const medTotal = stats?.mediumTotal || 1
  const hardTotal = stats?.hardTotal || 1

  const arcLen = SEG - GAP

  const easyFillDeg = (easySolved / easyTotal) * arcLen
  const medFillDeg = (medSolved / medTotal) * arcLen
  const hardFillDeg = (hardSolved / hardTotal) * arcLen

  const easyStart = -90 + GAP / 2
  const medStart = easyStart + SEG
  const hardStart = medStart + SEG

  const removeFriend = async (friendId: string) => {
    try {
      await api.delete(`/api/profile/friends/${friendId}`)

      setFriends(
        friends.filter(f => f._id !== friendId)
      )

      toast("Friend removed", { icon: "✖" })
    } catch {
      toast.error("Failed to remove friend")
    }
  }



  return (
    <section className="font-geist mx-10 mt-10 mb-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center"
      >
        <img
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.name)}`}










          className="w-24 h-24 rounded-2xl shadow-xl"
        />

        <div className="space-y-1 flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.name}
          </h1>

          <p className="text-sm text-white/40">
            {user.email}
          </p>

          <div className="flex items-center gap-4 text-sm text-white/60">
            <span>
              Slug:
              <span className="ml-1 text-white/80">
                {user.profileSlug}
              </span>
            </span>



          </div>
        </div>

        <button
          onClick={copyProfileLink}
          className="self-start cursor-pointer md:self-center px-4 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:text-white transition flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copied" : "Copy link"}
        </button>
      </motion.div>


      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="lg:col-span-3 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-8 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="relative flex items-center justify-center">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="w-52 h-52" viewBox="0 0 208 208">

                <path
                  d={describeArc(cx, cy, r, easyStart, easyStart + arcLen)}
                  fill="none"
                  stroke="rgba(34,197,94,0.25)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />


                <path
                  d={describeArc(cx, cy, r, easyStart, easyStart + easyFillDeg)}
                  fill="none"
                  stroke="rgb(34 197 94)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                <path
                  d={describeArc(cx, cy, r, medStart, medStart + arcLen)}
                  fill="none"
                  stroke="rgba(250,204,21,0.25)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                <path
                  d={describeArc(cx, cy, r, medStart, medStart + medFillDeg)}
                  fill="none"
                  stroke="rgb(250 204 21)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />


                <path
                  d={describeArc(cx, cy, r, hardStart, hardStart + arcLen)}
                  fill="none"
                  stroke="rgba(239,68,68,0.25)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />


                <path
                  d={describeArc(cx, cy, r, hardStart, hardStart + hardFillDeg)}
                  fill="none"
                  stroke="rgb(239 68 68)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </svg>




            </div>




            <div className="absolute text-center">
              <p className="text-4xl font-semibold">
                {solvedTotal}/{allTotal}
              </p>

              <p className="text-sm text-white/50">
                Solved
              </p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-sm text-green-500">
                Easy
              </p>
              <p className="text-lg font-semibold">
                {stats?.easySolved || 0}/
                {stats?.easyTotal || 0}

              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-sm text-yellow-500">
                Med.
              </p>
              <p className="text-lg font-semibold">
                {stats?.mediumSolved || 0}/{stats?.mediumTotal || 0}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-sm text-red-500">
                Hard
              </p>
              <p className="text-lg font-semibold">
                {stats?.hardSolved || 0}/{stats?.hardTotal || 0}

              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="lg:col-span-2 flex flex-row items-center justify-between rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-8"
        >
          <div className="items-center justify-center">
            <p className="text-base text-white/50">
              Current streak
            </p>
            <p className="text-6xl font-semibold">
              {user.streak?.current || 0}
              <span className="text-base text-white/40 ml-1">
                days
              </span>
            </p>
          </div>

          <div className="h-12 w-px bg-white/10" />

          <div>
            <p className="text-base text-white/50">
              Longest streak
            </p>
            <p className="text-6xl font-semibold">
              {user.streak?.max || 0}
              <span className="text-base text-white/40 ml-1">
                days
              </span>
            </p>
          </div>
        </motion.div>

      </div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4"
      >
        <p className="text-sm tracking-wide text-white/40">
          Consistency Heatmap
        </p>

        <div
          className="
    w-full
    overflow-x-auto
    overflow-y-hidden
    scrollbar-thin
    scrollbar-thumb-white/20
    scrollbar-track-transparent
    flex
    justify-center
  "
        >

          <div className="flex gap-4 w-max ">
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4"
      >
        <p className="text-sm tracking-wide text-white/40">
          Recently solved problems
        </p>

        {recent.length === 0 && (
          <p className="text-sm text-white/40">
            No problems solved yet. Start today.
          </p>
        )}

        <div className="space-y-2">
          {recent.map((r, i) => (
            <div
              key={i}
              onClick={() => navigate(`/problems/${r.problem._id}`)}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm text-white/90 truncate">
                  {r.problem.title}
                </p>
                <p className="text-xs text-white/40">
                  {timeAgo(r.date)}
                </p>

              </div>

              <span
                className={`text-sm px-2 py-1 rounded ${diffColor(
                  r.problem.difficulty
                )}`}
              >
                {r.problem.difficulty}
              </span>
            </div>
          ))}

        </div>
      </motion.div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 text-white/60">
          <Award className="w-4 h-4" />
          <p className="text-sm tracking-wide">Badges</p>
        </div>

        {badges.length === 0 && (
          <p className="text-sm text-white/40">
            No badges yet. Stay consistent to unlock milestones.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <p className="text-sm tracking-wide text-white/40">
            Friends
          </p>

          <span className="text-sm text-white/50">
            ({friends.length})
          </span>
        </div>

        {friends.length === 0 && (
          <p className="text-sm text-white/40">
            You have not added any friends yet.
          </p>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide cursor-pointer">
          {friends.map((f) => (
            <div
              key={f._id}
              onClick={() => navigate(`/u/${f.profileSlug}`)}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${f.profileSlug}`}
                  className="w-8 h-8 rounded-md"
                />

                <div className="min-w-0">
                  <p className="text-sm text-white/80 font-medium truncate">
                    {f.name}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {f.profileSlug}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFriend(f._id)
                }}
                className="text-sm px-2 py-1 rounded border border-red-400/40 text-red-400 hover:bg-red-400/10 transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}


        </div>
      </motion.div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-4 md:p-6 space-y-4"
      >
        <div className="flex items-center gap-2 text-white/60">
          <UserPlus className="w-4 h-4" />
          <p className="text-sm tracking-wide">Add friend</p>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={friendSlug}
            onChange={(e) => setFriendSlug(e.target.value)}
            placeholder="Enter profile slug"
            className="w-full md:flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none"
          />

          <div className="flex mt-4 md:mt-0 gap-2 w-full md:w-auto">
            <button
              onClick={addFriend}
              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white text-black text-sm font-medium cursor-pointer"
            >
              Add
            </button>

            <button
              onClick={compareFriend}
              className="flex-1 md:flex-none px-4 py-2 cursor-pointer rounded-lg border border-white/20 text-sm text-white/70 hover:text-white transition flex items-center justify-center gap-2"
            >
              <BarChart2 className="w-4 h-4" />
              Compare
            </button>
          </div>
        </div>

        {compareData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-white/40">You</p>
              <p className="text-lg font-semibold">
                {compareData.you.streak.current} day streak
              </p>
            </div>

            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-white/40">Friend</p>
              <p className="text-lg font-semibold">
                {compareData.friend.streak.current} day streak
              </p>
            </div>
          </div>
        )}
      </motion.div>

    </section>
  )
}
