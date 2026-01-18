import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, } from "react-router-dom"
import { api } from "../api/client"
import { ExternalLink } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

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

export default function DailyView() {
  const [daily, setDaily] = useState<DailyProblem[]>([])
  const [loading, setLoading] = useState(false)
  const [solved, setSolved] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()

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
    try {
      const status = nextSolved ? "solved" : "wrong"

      await api.post("/api/solve", {
        problemId,
        status,
        approachNote: nextSolved
          ? "Solved using standard approach"
          : undefined,
        placementMode: false
      })

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
    } catch {
      alert("Failed to update solve status")
    }
  }

  return (
    <section className="space-y-8 font-geist mx-10 mt-10 scrollbar-hide mb-10">
      <h1 className="text-xl font-semibold">Today’s Problems</h1>

      {loading && (
        <p className="text-white/40">Loading daily problems...</p>
      )}

      {!loading && daily.length === 0 && (
        <p className="text-white/40">
          No daily problems yet. Check back tomorrow.
        </p>
      )}

      {daily.map((item, index) => (
        <motion.div
          key={item._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
          className="relative mt-8 flex justify-center "
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


              className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl text-left cursor-pointer"
            >
              <div className="p-6 space-y-6">
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

                  <div className="flex items-center gap-6">
                    <div

                      className="flex-1 text-lg text-white font-medium tracking-tight  min-w-0"
                    >
                      {item.problem.title}
                    </div>

                    <a
                      href={item.problem.link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 text-sm text-white/50 hover:text-white transition flex items-center gap-2 justify-center"
                    >
                      Open Platform <ExternalLink className="inline-block h-4 w-4 " />
                    </a>

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
    </section>
  )
}
