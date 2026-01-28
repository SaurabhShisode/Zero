import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { api } from "../api/client"
import { ChevronDown, ChevronUp } from "lucide-react"
import toast from "react-hot-toast"

const ALL_SKILLS: Skill[] = [
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
]


const DEFAULT_DIFFICULTY: Difficulty = "Easy"

type Skill =
  | "DSA"
  | "SQL"
  | "JavaScript"
  | "Java"
  | "SystemDesign"
  | "OperatingSystems"
  | "DBMS"
  | "Networking"
  | "Aptitude"
  | "Behavioral"

type Difficulty = "Easy" | "Medium" | "Hard"

type SkillPreference = {
  skill: Skill
  enabled: boolean
  difficulty: Difficulty
}



const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"]
function DifficultySelect({
  value,
  disabled,
  onChange
}: {
  value: Difficulty
  disabled: boolean
  onChange: (d: Difficulty) => void
}) {
  const [open, setOpen] = useState(false)

  if (disabled) {
    return (
      <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white/40">
        {value}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-sm hover:bg-white/15 transition cursor-pointer"
      >
        <span>{value}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-white/70" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/70" />
        )}
      </button>


      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="absolute right-0 mt-2 w-28 rounded-xl border border-white/15 bg-black/80 backdrop-blur-xl overflow-hidden z-50 "
        >
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => {
                onChange(d)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm transition cursor-pointer ${d === value
                ? "bg-white/20"
                : "hover:bg-white/10"
                }`}
            >
              {d}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
function SettingsSkeleton() {
  return (
    <section className="font-geist space-y-6 sm:space-y-8 mx-4 sm:mx-6 md:mx-10 mt-6 sm:mt-8 md:mt-10 mb-6 sm:mb-8 md:mb-10 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-32 rounded bg-white/10" />
        <div className="h-4 w-64 rounded bg-white/5" />
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        <div className="h-5 w-40 rounded bg-white/10" />

        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 rounded-full bg-white/20" />
                <div className="h-4 w-24 rounded bg-white/10" />
              </div>

              <div className="h-8 w-20 rounded-lg bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-white/10" />
          <div className="h-4 w-56 rounded bg-white/5" />
        </div>

        <div className="w-14 h-8 rounded-full bg-white/20" />
      </div>
    </section>
  )
}

export default function SettingsView() {
  const [preferences, setPreferences] = useState<SkillPreference[]>([])
  const [placementMode, setPlacementMode] = useState(false)
  const [saved, setSaved] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreferences()
  }, [])

  function loadPreferences() {
    setLoading(true)

    api
      .get("/api/preferences")
      .then(res => {
        const user = res.data.user

        setPreferences(
          normalizePreferences(user.preferences || [])
        )
        setPlacementMode(user.placementMode || false)
        setSaved(true)
      })
      .catch(() => {
        toast.error("Failed to load preferences")
      })
      .finally(() => {
        setLoading(false)
      })
  }


  function toggleSkill(skill: Skill) {
    setSaved(false)

    setPreferences(prev =>
      prev.map(p =>
        p.skill === skill
          ? { ...p, enabled: !p.enabled }
          : p
      )
    )
  }

  function changeDifficulty(skill: Skill, diff: Difficulty) {
    setSaved(false)

    setPreferences(prev =>
      prev.map(p =>
        p.skill === skill
          ? { ...p, difficulty: diff }
          : p
      )
    )
  }
  function normalizePreferences(
    saved: SkillPreference[]
  ): SkillPreference[] {
    return ALL_SKILLS.map(skill => {
      const found = saved.find(p => p.skill === skill)

      if (found) return found

      return {
        skill,
        enabled: false,
        difficulty: DEFAULT_DIFFICULTY
      }
    })
  }
  function saveChanges() {
    api
      .put("/api/preferences", {
        preferences,
        placementMode
      })
      .then(() => {
        toast.success("Preferences updated")
        loadPreferences()
      })
      .catch(() => {
        toast.error("Failed to save preferences")
      })
  }


  function discardChanges() {
    loadPreferences()
    toast("Changes discarded", { icon: "↩" })
  }




  if (loading) {
    return <SettingsSkeleton />
  }


  return (
    <section className="font-geist space-y-6 sm:space-y-8 mx-4 sm:mx-6 md:mx-10  mt-6 sm:mt-8 md:mt-10 mb-6 sm:mb-8 md:mb-10">
      <div>
        <h1 className="text-xl font-semibold">
          Settings
        </h1>
        <p className="text-white/40">
          Configure daily skills and placement discipline
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4"
      >
        <h2 className="text-lg font-medium">
          Daily skills
        </h2>

        <div className="space-y-3">
          {preferences.map(pref => (
            <div
              key={pref.skill}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleSkill(pref.skill)}
                  className={`w-10 h-6 rounded-full transition cursor-pointer ${pref.enabled
                    ? "bg-white/80 "
                    : "bg-white/20"
                    }`}

                >
                  <div
                    className={`h-5 w-5 bg-black rounded-full transition transform ${pref.enabled
                      ? "translate-x-4"
                      : "translate-x-1"
                      }`}
                  />
                </button>

                <span className="text-sm">
                  {pref.skill}
                </span>
              </div>

              <DifficultySelect
                value={pref.difficulty}
                disabled={!pref.enabled}
                onChange={d => changeDifficulty(pref.skill, d)}
              />

            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-lg font-medium">
            Placement mode
          </h2>
          <p className="text-sm text-white/40">
            Forces core interview skills to stay enabled
          </p>
        </div>

        <button
          onClick={() => {
            setPlacementMode(!placementMode)
            setSaved(false)
          }}
          className={`w-14 h-8 rounded-full transition cursor-pointer ${placementMode
            ? "bg-green-500"
            : "bg-white/20"
            }`}
        >
          <div
            className={`h-7 w-7 bg-black rounded-full transition transform ${placementMode
              ? "translate-x-6"
              : "translate-x-1"
              }`}
          />
        </button>
      </motion.div>

      {!saved && (
        <div className="flex gap-3">
          <button
            onClick={saveChanges}
            className="px-5 py-2 rounded-lg bg-white text-black cursor-pointer text-sm font-medium"
          >
            Save changes
          </button>

          <button
            onClick={discardChanges}
            className="px-5 py-2 rounded-lg border cursor-pointer border-white/20 text-sm text-white/70"
          >
            Discard
          </button>
        </div>
      )}
    </section>
  )
}
