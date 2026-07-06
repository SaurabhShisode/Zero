import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Filter, Search, Star, Trash2, X } from "lucide-react"
import { api } from "../api/client"
import toast from "react-hot-toast"

interface Problem {
  _id: string
  title: string
  link: string
  difficulty: "Easy" | "Medium" | "Hard"
  skills: string[]
  companyTags: string[]
}

type SavedFilter = {
  _id: string
  name: string
  skills: string[]
  difficulties: string[]
  companyTags: string[]
}

const SKILLS = ["DSA", "SQL", "JavaScript", "Java", "SystemDesign", "OperatingSystems", "DBMS", "Networking", "Aptitude", "Behavioral"]
const DIFFICULTIES = ["Easy", "Medium", "Hard"]
const COMPANIES = ["FAANG", "Service", "Startup"]

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (problems: Problem[]) => void
}

const pillBase = "rounded-lg border px-3 py-2 text-sm transition"
const inactivePill = "border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"

function difficultyClass(diff: string, active: boolean) {
  if (!active) return inactivePill
  if (diff === "Easy") return "border-green-400/35 bg-green-400/10 text-green-300"
  if (diff === "Medium") return "border-yellow-400/35 bg-yellow-400/10 text-yellow-300"
  return "border-red-400/35 bg-red-400/10 text-red-300"
}

export default function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultsCount, setResultsCount] = useState<number | null>(null)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [presetName, setPresetName] = useState("")

  useEffect(() => {
    if (!isOpen) return
    api.get("/api/filters").then((res) => {
      setSavedFilters(res.data.filters || [])
    }).catch(() => {})
  }, [isOpen])

  const activeCount = selectedSkills.length + selectedDifficulties.length + selectedCompanies.length + (searchQuery.trim() ? 1 : 0)

  const buildParams = () => {
    const params = new URLSearchParams()
    selectedSkills.forEach((s) => params.append("skills", s))
    selectedDifficulties.forEach((d) => params.append("difficulties", d))
    selectedCompanies.forEach((c) => params.append("companyTags", c.toLowerCase()))
    if (searchQuery.trim()) params.append("search", searchQuery.trim())
    params.append("limit", "40")
    return params
  }

  const applyFilter = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/problems/advanced/filter?${buildParams().toString()}`)
      const problems = res.data.problems || []
      setResultsCount(res.data.pagination?.total ?? problems.length)
      onApply(problems)
      toast.success(`Found ${res.data.pagination?.total ?? problems.length} problems`)
    } catch {
      toast.error("Failed to filter problems")
    } finally {
      setLoading(false)
    }
  }

  const savePreset = async () => {
    if (!presetName.trim()) {
      toast.error("Name the preset first")
      return
    }

    try {
      const res = await api.post("/api/filters", {
        name: presetName.trim(),
        skills: selectedSkills,
        difficulties: selectedDifficulties,
        companyTags: selectedCompanies.map((company) => company.toLowerCase())
      })
      setSavedFilters((prev) => [res.data.filter, ...prev])
      setPresetName("")
      toast.success("Filter preset saved")
    } catch {
      toast.error("Failed to save preset")
    }
  }

  const deletePreset = async (id: string) => {
    try {
      await api.delete(`/api/filters/${id}`)
      setSavedFilters((prev) => prev.filter((filter) => filter._id !== id))
      toast.success("Preset deleted")
    } catch {
      toast.error("Failed to delete preset")
    }
  }

  const applyPreset = (filter: SavedFilter) => {
    setSelectedSkills(filter.skills || [])
    setSelectedDifficulties(filter.difficulties || [])
    setSelectedCompanies((filter.companyTags || []).map((tag) => tag === "startup" ? "Startup" : tag.toUpperCase() === "FAANG" ? "FAANG" : "Service"))
  }

  const clearFilters = () => {
    setSelectedSkills([])
    setSelectedDifficulties([])
    setSelectedCompanies([])
    setSearchQuery("")
    setResultsCount(null)
  }

  const toggle = (value: string, values: string[], setter: (next: string[]) => void) => {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <motion.div
            className="w-full max-w-3xl max-h-[85dvh] overflow-hidden rounded-xl border border-white/15 bg-black/95 shadow-2xl"
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Filter className="w-4 h-4 text-white/70" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">Advanced Filter</h2>
                  <p className="text-xs text-white/35">{activeCount} active criteria</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[calc(85dvh-8.5rem)] overflow-y-auto scrollbar-hide p-5 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    type="text"
                    placeholder="Search by title, skill, or tag"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-white/35"
                  />
                </div>
              </div>

              {savedFilters.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-white/80">Saved Presets</label>
                    <span className="text-xs text-white/35">{savedFilters.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {savedFilters.map((filter) => (
                      <span key={filter._id} className="inline-flex items-center overflow-hidden rounded-lg border border-white/15 bg-white/5">
                        <button onClick={() => applyPreset(filter)} className="px-3 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white">
                          {filter.name}
                        </button>
                        <button onClick={() => deletePreset(filter._id)} className="border-l border-white/10 px-2 py-2 text-white/35 transition hover:bg-red-500/10 hover:text-red-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <FilterSection title="Skills">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggle(skill, selectedSkills, setSelectedSkills)}
                    className={`${pillBase} ${selectedSkills.includes(skill) ? "border-white bg-white text-black" : inactivePill}`}
                  >
                    {skill}
                  </button>
                ))}
              </FilterSection>

              <FilterSection title="Difficulty">
                {DIFFICULTIES.map((diff) => {
                  const active = selectedDifficulties.includes(diff)
                  return (
                    <button
                      key={diff}
                      onClick={() => toggle(diff, selectedDifficulties, setSelectedDifficulties)}
                      className={`${pillBase} flex-1 ${difficultyClass(diff, active)}`}
                    >
                      {diff}
                    </button>
                  )
                })}
              </FilterSection>

              <FilterSection title="Company Tags">
                {COMPANIES.map((company) => (
                  <button
                    key={company}
                    onClick={() => toggle(company, selectedCompanies, setSelectedCompanies)}
                    className={`${pillBase} ${selectedCompanies.includes(company) ? "border-purple-400/35 bg-purple-400/10 text-purple-300" : inactivePill}`}
                  >
                    {company}
                  </button>
                ))}
              </FilterSection>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <label className="mb-2 block text-xs text-white/40">Save current criteria</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Preset name"
                    className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm outline-none placeholder:text-white/25 focus:border-white/35"
                  />
                  <button onClick={savePreset} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
                    <Star className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center">
              <div className="flex-1 text-xs text-white/35">
                {resultsCount === null ? "Run a search to update topic results." : `${resultsCount} matching problems`}
              </div>
              <button onClick={clearFilters} className="rounded-lg px-4 py-2 text-sm text-white/50 transition hover:bg-white/10 hover:text-white">
                Clear
              </button>
              <button onClick={onClose} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white">
                Cancel
              </button>
              <button
                onClick={applyFilter}
                disabled={loading}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Apply Filters"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-white/80">{title}</label>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
