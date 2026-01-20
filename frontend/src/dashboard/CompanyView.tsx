import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { api } from "../api/client"
import { ExternalLink } from "lucide-react"

type Problem = {
  _id: string
  title: string
  link: string
  difficulty: "Easy" | "Medium" | "Hard"
  skills: string[]
  companyTags: string[]
}

const TAGS = [
  { key: "faang", label: "FAANG" },
  { key: "service", label: "Service-based" },
  { key: "startup", label: "Startups" },
  { key: "any", label: "Any" }
]

export default function CompanyView() {
  const [selected, setSelected] = useState("faang")
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(false)
  const [solved, setSolved] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)

    api
      .get(`/api/problems/company/${selected}`)
      .then(async (res) => {
        const data = res.data.problems as Problem[]
        setProblems(data)

        const solvedMap: Record<string, boolean> = {}

        await Promise.all(
          data.map(async (p) => {
            try {
              const res = await api.get(`/api/solve/${p._id}`)
              if (res.data?.solved) {
                solvedMap[p._id] = true
              }
            } catch {
            }
          })
        )

        setSolved(solvedMap)
      })
      .finally(() => setLoading(false))
  }, [selected])

  const markSolved = async (
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
        [problemId]: nextSolved
      }))
    } catch {
      alert("Failed to update solve status")
    }
  }


  return (
    <section className="space-y-6 font-geist mx-10 mt-10 mb-10">
      <div>
        <h1 className="text-xl font-semibold">Company Wise Problems</h1>
        <p className="text-white/40">
          Practice problems filtered by FAANG, Service-based, and Startups.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TAGS.map((tag) => (
          <button
            key={tag.key}
            onClick={() => setSelected(tag.key)}

            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition cursor-pointer ${selected === tag.key
              ? "bg-white text-black"
              : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
          >
            {tag.label}
          </button>
        ))}
      </div>



      {!loading && problems.length === 0 && (
        <p className="text-white/40 font-geist">
          No problems found for this category.
        </p>
      )}

      <div className="space-y-6">
        {loading && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3 min-w-0">
                      <div className="flex gap-2">
                        <div className="h-5 w-14 bg-white/20 rounded" />
                        <div className="h-5 w-16 bg-white/10 rounded" />
                        <div className="h-5 w-12 bg-white/10 rounded" />
                      </div>

                      <div className="h-5 w-64 bg-white/20 rounded" />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-4 w-28 bg-white/10 rounded" />
                      <div className="h-6 w-6 bg-white/20 rounded-md" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}

        {!loading &&
          problems.map((p, index) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.4 }}
              className="relative group"
            >
              <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition" />

              <div
                onClick={() =>
                  navigate(`/problems/${p._id}`, {
                    state: {
                      fromLabel: "Company-wise",
                      fromPath: location.pathname + location.search,
                      contextLabel: p.title
                    }
                  })
                }
                className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 flex items-center justify-between cursor-pointer"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded
                      ${p.difficulty === "Easy"
                          ? "text-green-400 border-green-400/30 bg-green-400/10"
                          : p.difficulty === "Medium"
                            ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                            : "text-red-400 border-red-400/30 bg-red-400/10"
                        }
                    `}
                    >
                      {p.difficulty}
                    </span>

                    {p.skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2 py-0.5 rounded border border-white/20 text-white/40"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <p className="text-white font-medium truncate">
                    {p.title}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(p.link, "_blank")
                    }}
                    className="px-3 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:text-white transition cursor-pointer flex items-center gap-2"
                  >
                    Open
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      const next = !solved[p._id]
                      markSolved(p._id, next)
                    }}
                    className="flex items-center gap-2 text-sm text-white/60 select-none cursor-pointer"
                  >
                    <span
                      className={`
                      h-5 w-5 rounded-md
                      border border-white/30
                      flex items-center justify-center
                      transition
                      ${solved[p._id]
                          ? "bg-white border-white"
                          : "bg-transparent"
                        }
                    `}
                    >
                      {solved[p._id] && (
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
            </motion.div>
          ))}
      </div>

    </section>
  )
}
