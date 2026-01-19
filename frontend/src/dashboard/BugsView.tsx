import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "../api/client"
import { Bug, Plus, Trash, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import toast from "react-hot-toast"
const ADMIN_EMAILS = ["shisodesaurabh48@gmail.com"]

type BugReport = {
  _id: string
  title: string
  description: string
  status: "open" | "in_progress" | "fixed"
  author: {
    name: string
    profileSlug: string
    _id: string
  }
  createdAt: string
}

export default function BugsView() {
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const userId = useAuthStore(s => s.user?._id)

  useEffect(() => {
    loadBugs()
  }, [])

  async function loadBugs() {
    setLoading(true)
    try {
      const res = await api.get("/api/bugs")
      setBugs(res.data.bugs || [])
    } catch {
      toast.error("Failed to load bug reports")
    } finally {
      setLoading(false)
    }
  }
const user = useAuthStore(s => s.user)
const isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email))
async function updateStatus(
  id: string,
  status: "open" | "in_progress" | "fixed"
) {
  try {
    const res = await api.patch(`/api/bugs/${id}/status`, {
      status
    })

    setBugs(prev =>
      prev.map(b =>
        b._id === id ? res.data.bug : b
      )
    )

    toast.success("Bug status updated")
  } catch {
    toast.error("You are not authorized to update status")
  }
}

  async function createBug() {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description required")
      return
    }

    try {
      const res = await api.post("/api/bugs", {
        title,
        description
      })

      setBugs(prev => [res.data.bug, ...prev])
      setTitle("")
      setDescription("")
      setShowCreate(false)
      toast.success("Bug reported successfully")
    } catch {
      toast.error("Failed to report bug")
    }
  }

  async function deleteBug(id: string) {
    try {
      await api.delete(`/api/bugs/${id}`)
      setBugs(prev => prev.filter(b => b._id !== id))
      toast("Bug removed", { icon: "✖" })
    } catch {
      toast.error("Failed to delete bug")
    }
  }

  function timeAgo(date: string) {
    const seconds = Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000
    )

    const intervals = [
      { label: "y", seconds: 31536000 },
      { label: "mo", seconds: 2592000 },
      { label: "d", seconds: 86400 },
      { label: "h", seconds: 3600 },
      { label: "m", seconds: 60 }
    ]

    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds)
      if (count >= 1) return `${count}${i.label} ago`
    }

    return "just now"
  }

  function statusBadge(status: BugReport["status"]) {
    if (status === "fixed") {
      return (
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-green-400/30 bg-green-400/10 text-green-400">
          <CheckCircle className="w-3 h-3" />
          Fixed
        </span>
      )
    }

    if (status === "in_progress") {
      return (
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
          <Clock className="w-3 h-3" />
          In progress
        </span>
      )
    }

    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-400/30 bg-red-400/10 text-red-400">
        <AlertTriangle className="w-3 h-3" />
        Open
      </span>
    )
  }

  return (
    <section className="font-geist px-8 pt-8 pb-20 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bug Reports
          </h1>
         
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-400 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Report Bug
        </button>
      </div>

      {loading && (
        <p className="text-white/40 text-sm">
          Loading bug reports...
        </p>
      )}

      {!loading && bugs.length === 0 && (
        <p className="text-white/40 text-sm">
          No bugs reported yet. Everything looks good.
        </p>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {bugs.map(bug => (
            <motion.div
              key={bug._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Bug className="w-4 h-4 text-red-400" />
                  <span>{bug.author.name}</span>
                  <span className="text-white/30">•</span>
                  <span>{timeAgo(bug.createdAt)}</span>
                </div>

                <div className="flex items-center gap-3">
  {statusBadge(bug.status)}

  {isAdmin && (
    <div className="flex gap-1">
      <button
        onClick={() => updateStatus(bug._id, "open")}
        className="text-xs px-2 py-1 rounded border border-red-400/40 text-red-400 hover:bg-red-400/10 transition cursor-pointer"
      >
        Open
      </button>

      <button
        onClick={() => updateStatus(bug._id, "in_progress")}
        className="text-xs px-2 py-1 rounded border border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 transition cursor-pointer"
      >
        Progress
      </button>

      <button
        onClick={() => updateStatus(bug._id, "fixed")}
        className="text-xs px-2 py-1 rounded border border-green-400/40 text-green-400 hover:bg-green-400/10 transition cursor-pointer"
      >
        Fix
      </button>
    </div>
  )}

  {bug.author._id === userId && (
    <button
      onClick={() => deleteBug(bug._id)}
      className="text-red-400 hover:text-red-300 transition cursor-pointer"
      title="Delete bug"
    >
      <Trash className="w-4 h-4" />
    </button>
  )}
</div>

              </div>

              <h2 className="text-lg font-semibold tracking-tight">
                {bug.title}
              </h2>

              <p className="text-sm text-white/60 leading-relaxed">
                {bug.description}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl border border-white/15 bg-black/80 p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold text-red-400">
                Report a Bug
              </h2>

              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Bug title"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              />

              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Steps to reproduce, expected behavior, actual behavior"
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none resize-none scrollbar-hide"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={createBug}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-400 transition cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
