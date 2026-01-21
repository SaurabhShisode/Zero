import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/client"
import { useAuthStore } from "../store/authStore"
import bgImage from "../assets/authbg3.png"
import { motion } from "framer-motion"

const SKILLS = [
  "DSA",
  "SQL",
  "JavaScript",
  "Java",
  "SystemDesign",
  "OperatingSystems",
  "DBMS",
  "Networking",
  "Aptitude",
  "Behavioral"
] as const

const SKILL_LABELS: Record<Skill, string> = {
  DSA: "DSA",
  SQL: "SQL",
  JavaScript: "JavaScript",
  Java: "Java",
  SystemDesign: "System Design",
  OperatingSystems: "Operating Systems",
  DBMS: "DBMS",
  Networking: "Networking",
  Aptitude: "Aptitude",
  Behavioral: "Behavioral"
}

type Skill = typeof SKILLS[number]
type Difficulty = "Easy" | "Medium" | "Hard"

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"]

const STEP_DEFAULTS: Record<number, string> = {
  1: "Pick your skills to begin your Zero journey.",
  2: "Choose your difficulty. Discipline beats burnout.",
  3: "Placement Mode simulates real interview conditions."
}

const DEFAULT_DIFFICULTY: Difficulty = "Easy"

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, token, setAuth } = useAuthStore()

  if (!user || !token) {
    navigate("/login")
    return null
  }

  const [step, setStep] = useState(1)
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])
  const [difficulty, setDifficulty] =
    useState<Difficulty>(DEFAULT_DIFFICULTY)
  const [placementMode, setPlacementMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [funMessage, setFunMessage] =
    useState(STEP_DEFAULTS[1])

  useEffect(() => {
    setFunMessage(STEP_DEFAULTS[step])
  }, [step])

  const showFun = (msg: string) => {
    setFunMessage(msg)
  }

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills(prev => {
      const next = prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]

      if (!prev.includes(skill)) {
        showFun(`${SKILL_LABELS[skill]}
 added to your daily loop`)
      }

      return next
    })
  }

  const savePreferences = async () => {
    if (!selectedSkills.length) {
      setError("Pick at least one skill to continue")
      return
    }

    try {
      setLoading(true)
      setError("")

      const updatedPreferences = SKILLS.map(skill => ({
        skill,
        enabled: selectedSkills.includes(skill),
        difficulty
      }))

      const res = await api.put(
        "/api/preferences",
        {
          preferences: updatedPreferences,
          placementMode
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setAuth(res.data.user, token)
      navigate("/")
    } catch {
      setError("Failed to save preferences")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#0f172a]/80 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-8 shadow-[0_40px_120px_rgba(0,0,0,0.6)] font-geist">

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">
            Welcome to Zero
          </h1>
          <p className="text-sm text-white/60">
            Let’s set up your daily practice loop
          </p>
        </div>

        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="h-6 flex items-center justify-center overflow-hidden">
          <motion.div
            key={funMessage}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center text-sm text-white/70"
          >
            {funMessage}
          </motion.div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              What do you want to practice?
            </p>

            <div className="grid grid-cols-2 gap-3">
              {SKILLS.map(skill => {
                const active = selectedSkills.includes(skill)

                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-3 rounded-lg border transition cursor-pointer ${
                      active
                        ? "bg-white text-black border-white"
                        : "bg-white/5 border-white/15 text-white hover:border-white/40"
                    }`}
                  >
                    {SKILL_LABELS[skill]}

                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              How hard should it be?
            </p>

            <div className="flex gap-3">
              {DIFFICULTIES.map(level => (
                <button
                  key={level}
                  onClick={() => {
                    setDifficulty(level)
                    showFun(
                      level === "Easy"
                        ? "Starting steady. Discipline beats burnout."
                        : level === "Medium"
                        ? "Good. You are building real interview strength."
                        : "Hard mode. Respect. This is where growth happens."
                    )
                  }}
                  className={`flex-1 py-3 rounded-lg border transition cursor-pointer ${
                    difficulty === level
                      ? "bg-white text-black border-white"
                      : "bg-white/5 border-white/15 text-white hover:border-white/40"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Do you want placement simulation?
            </p>

            <div className="flex items-center justify-between border border-white/10 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm">
                  Placement Mode
                </p>
                <p className="text-xs text-white/50">
                  Mixed skills, time pressure, HR and behavioral questions
                </p>
              </div>

              <button
                onClick={() =>
                  setPlacementMode(v => {
                    const next = !v
                    showFun(
                      next
                        ? "Placement Mode on. You are simulating real interviews now."
                        : "Placement Mode off. Focused practice mode."
                    )
                    return next
                  })
                }
                className={`w-12 h-6 rounded-full transition relative cursor-pointer ${
                  placementMode
                    ? "bg-white"
                    : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full transition ${
                    placementMode
                      ? "translate-x-6 bg-black"
                      : "translate-x-0 bg-white"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        <div className="flex justify-between gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 rounded-lg cursor-pointer bg-white/5 border border-white/15 text-white transition hover:border-white/40"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 py-3 rounded-lg bg-white cursor-pointer text-black transition hover:bg-white/90"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => {
                showFun("Day 1 starts now. Do not break the chain.")
                setTimeout(savePreferences, 600)
              }}
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-white cursor-pointer text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {loading
                ? "Starting Zero..."
                : "Enter Zero"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
