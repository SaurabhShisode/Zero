import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { api } from "../api/client"
import { ExternalLink } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import confetti from "canvas-confetti"
import toast from "react-hot-toast"
import { useAuthStore } from "../store/authStore"
import { useKeyboardNav } from "../hooks/useKeyboardNav"
import KeyboardHelp from "../components/KeyboardHelp"
import { BADGE_MAP } from "../constants/badges"
import type { BadgeId } from "../constants/badges"

type DailyProblem = {
  _id: string
  skill: string
  problem: {
    _id: string
    title: string
    link: string
    difficulty: "Easy" | "Medium" | "Hard"
  }
  solveStatus: "solved" | "wrong" | "skipped" | null
}

const MILESTONES = [1, 7, 14, 30, 50, 100, 200, 365]

function fireConfetti() {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#22c55e", "#facc15", "#3b82f6", "#a855f7", "#ef4444"]
  })
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.5 }
    })
  }, 300)
}

export default function DailyView() {
  const [daily, setDaily] = useState<DailyProblem[]>([])
  const [loading, setLoading] = useState(false)
  const [solved, setSolved] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()
  const hydrate = useAuthStore(s => s.hydrate)

  const location = useLocation()

  useEffect(() => {
    setLoading(true)
    api
      .get("/api/daily")
      .then((res) => {
        const data = res.data.daily as DailyProblem[]
        setDaily(data)

        const initialSolved: Record<string, boolean> = {}
        data.forEach((item) => {
          if (item.solveStatus === "solved") {
            initialSolved[item._id] = true
          }
        })

        setSolved(initialSolved)
      })
      .finally(() => setLoading(false))
  }, [])

  const markSolved = async (
    dailyId: string,
    problemId: string,
    nextSolved: boolean
  ) => {
    const previousValue = solved[dailyId]

    setSolved((prev) => ({
      ...prev,
      [dailyId]: nextSolved
    }))

    setDaily((prev) =>
      prev.map((item) =>
        item._id === dailyId
          ? { ...item, solveStatus: nextSolved ? "solved" : "wrong" }
          : item
      )
    )

    try {
      const status = nextSolved ? "solved" : "wrong"

      const solveRes = await api.post("/api/solve", {
        problemId,
        status,
        approachNote: nextSolved
          ? "Solved using standard approach"
          : undefined,
        placementMode: false
      })

      if (nextSolved) {
        const newBadges: string[] = solveRes.data?.newBadges || []
        for (const badgeId of newBadges) {
          const badge = BADGE_MAP[badgeId as BadgeId]
          if (badge) {
            toast(`${badge.emoji} Badge unlocked: ${badge.label}`, { duration: 4000 })
          }
        }
        if (newBadges.length > 0) {
          fireConfetti()
        }

        await hydrate()
        const currentStreak = useAuthStore.getState().user?.streak?.current || 0
        if (MILESTONES.includes(currentStreak)) {
          fireConfetti()
        }
      }
    } catch {
      setSolved((prev) => ({
        ...prev,
        [dailyId]: previousValue
      }))

      setDaily((prev) =>
        prev.map((item) =>
          item._id === dailyId
            ? {
              ...item,
              solveStatus: previousValue ? "solved" : "wrong"
            }
            : item
        )
      )

      alert("Failed to update solve status")
    }
  }

  const handleOpen = useCallback(
    (index: number) => {
      const item = daily[index]
      if (item) {
        navigate(`/problems/${item.problem._id}`, {
          state: {
            fromLabel: "Daily",
            fromPath: location.pathname + location.search,
            contextLabel: item.problem.title
          }
        })
      }
    },
    [daily, navigate, location]
  )

  const handleToggle = useCallback(
    (index: number) => {
      const item = daily[index]
      if (item) {
        const next = !solved[item._id]
        markSolved(item._id, item.problem._id, next)
      }
    },
    [daily, solved]
  )

  const { activeIndex, showHelp, setShowHelp } = useKeyboardNav({
    itemCount: daily.length,
    onOpen: handleOpen,
    onToggle: handleToggle,
    enabled: !loading
  })

  if (loading) {
    return (
      <section className="space-y-6 sm:space-y-8 font-geist mx-4 sm:mx-6 md:mx-10 mt-6 sm:mt-8 md:mt-10 mb-6 sm:mb-8 md:mb-10 text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2 animate-pulse"
        >
          <div className="h-5 sm:h-6 w-36 sm:w-48 bg-white/20 rounded" />
          <div className="h-4 w-72 bg-white/10 rounded" />
        </motion.div>

        <div className="space-y-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative mt-8 flex justify-center"
            >
              <div className="relative w-full">
                <div className="rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-4 sm:p-5 md:p-6 animate-pulse space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-16 bg-white/20 rounded" />
                    <div className="h-4 w-14 bg-white/10 rounded" />
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <div className="h-5 w-64 bg-white/20 rounded" />

                    <div className="flex items-center gap-4">
                      <div className="h-4 w-28 bg-white/10 rounded" />
                      <div className="h-5 w-5 bg-white/20 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-8 font-geist mx-10 mt-10 scrollbar-hide mb-10">
      <h1 className="text-xl font-semibold">Today's Problems</h1>



      {!loading && daily.length === 0 && (
        <p className="text-white/40">
          No daily problems yet. Check back tomorrow.
        </p>
      )}

      {daily.map((item, index) => (
        <motion.div
          key={item._id}
          data-kb-index={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
          className={`relative mt-4 flex justify-center ${activeIndex === index ? "ring-2 ring-white/40 rounded-2xl" : ""
            }`}
        >
          <div className="relative group w-full">
            <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

            <div
              onClick={() =>
                navigate(`/problems/${item.problem._id}`, {
                  state: {
                    fromLabel: "Daily",
                    fromPath: location.pathname + location.search,
                    contextLabel: item.problem.title
                  }
                })
              }


              className="relative rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl text-left cursor-pointer"
            >
              <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex text-[11px] tracking-wide text-white/60 border border-white/20 px-2 py-0.5 rounded">
                      {item.skill}
                    </span>

                    <span
                      className={`inline-flex text-[11px]  tracking-wide px-2 py-0.5 rounded 
                        ${item.problem.difficulty === "Easy"
                          ? "text-green-400 border-green-400/30 bg-green-400/10"
                          : item.problem.difficulty === "Medium"
                            ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                            : "text-red-400 border-red-400/30 bg-red-400/10"
                        }
                      `}
                    >
                      {item.problem.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div

                      className="flex-1 text-base sm:text-lg text-white font-medium tracking-tight  min-w-0"
                    >
                      {item.problem.title}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(item.problem.link, "_blank")
                      }}
                      className="px-3 py-2 rounded-lg border border-white/20 text-xs sm:text-sm text-white/70 hover:text-white transition cursor-pointer flex items-center gap-2"
                    >
                      Solve
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const next = !solved[item._id]
                        markSolved(item._id, item.problem._id, next)
                      }}
                      className="shrink-0 ml-4 flex items-center gap-2 text-sm text-white/60 select-none cursor-pointer"
                    >
                      <span
                        className={`
                          h-5 w-5 rounded-md
                          border border-white/30
                          flex items-center justify-center
                          transition
                          ${solved[item._id]
                            ? "bg-white border-white"
                            : "bg-transparent"
                          }
                        `}
                      >
                        {solved[item._id] && (
                          <svg
                            className="h-3 w-3 text-black"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M5 10l3 3 7-7" />
                          </svg>
                        )}
                      </span>
                      Mark solved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      <KeyboardHelp
        visible={showHelp}
        onClose={() => setShowHelp((v) => !v)}
      />
    </section>
  )
}
