import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "../api/client"
import { useNavigate } from "react-router-dom"
import { CircleCheck, RefreshCcw, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline"

type Problem = {
    _id: string
    title: string
    difficulty: "Easy" | "Medium" | "Hard"
    link: string
    skills: string[]
}

type RevisionTask = {
    _id: string
    scheduledFor: string
    status: "pending" | "done"
    problem: Problem
}

export default function RevisionView() {
    const [tasks, setTasks] = useState<RevisionTask[]>([])
    const [loading, setLoading] = useState(true)
    const [marking, setMarking] = useState<string | null>(null)

    const navigate = useNavigate()

    useEffect(() => {
        loadRevisions()
    }, [])

    async function loadRevisions() {
        try {
            const res = await api.get("/api/revision/pending")
            setTasks(res.data.tasks || [])
        } catch {
            toast.error("Failed to load revisions")
        } finally {
            setLoading(false)
        }
    }

    async function markDone(taskId: string) {
        try {
            setMarking(taskId)

            await api.post(`/api/revision/${taskId}/done`)

            setTasks(prev =>
                prev.filter(t => t._id !== taskId)
            )

            toast.success("Revision completed")
        } catch {
            toast.error("Failed to update revision")
        } finally {
            setMarking(null)
        }
    }

    function diffColor(diff: "Easy" | "Medium" | "Hard") {
        if (diff === "Easy") return "text-green-400 border-green-400/30 bg-green-400/10"
        if (diff === "Medium") return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
        return "text-red-400 border-red-400/30 bg-red-400/10"
    }

    function formatDate(date: string) {
        const d = new Date(date)
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    return (
        <section className="font-geist px-8 pt-8 pb-20 space-y-6 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Revisions
                    </h1>
                    <p className="text-white/40 text-sm mt-1">
                        Strengthen weak areas through spaced repetition
                    </p>
                </div>

                <div className="flex items-center gap-2 text-white/50">
                    <RefreshCcw className="w-4 h-4" />
                    <span className="text-sm">
                        {tasks.length} pending
                    </span>
                </div>
            </div>

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

            {!loading && tasks.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl  p-8 text-center"
                >
                    <p className="text-white/40 text-2xl">
                    <ClipboardDocumentCheckIcon className="w-24 h-24 text-white mx-auto mb-4" />

                        No pending revisions. You are on track.
                    </p>
                </motion.div>
            )}

            <AnimatePresence>
                {!loading &&
                    tasks.map(task => (
                        <motion.div
                            key={task._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            onClick={() =>
                                navigate(`/problems/${task.problem._id}`, {
                                    state: {
                                        fromLabel: "Revisions",
                                        fromPath: location.pathname + location.search,
                                        contextLabel: task.problem.title
                                    }
                                })
                            }

                            className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/15 transition"
                        >

                            <div className="space-y-2 min-w-0">
                                <h2 className="text-lg font-semibold truncate">
                                    {task.problem.title}
                                </h2>

                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <span
                                        className={`px-2 py-0.5 rounded border ${diffColor(
                                            task.problem.difficulty
                                        )}`}
                                    >
                                        {task.problem.difficulty}
                                    </span>

                                    <span className="text-white/40">
                                        Due {formatDate(task.scheduledFor)}
                                    </span>

                                    {task.problem.skills.map(s => (
                                        <span
                                            key={s}
                                            className="text-xs px-2 py-0.5 rounded border border-white/20 text-white/50"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        window.open(task.problem.link, "_blank")
                                    }}
                                    className="px-3 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:text-white transition cursor-pointer flex items-center gap-2"
                                >
                                    Solve
                                    <ExternalLink className="w-4 h-4" />
                                </button>


                                <button
                                    disabled={marking === task._id}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        markDone(task._id)
                                    }}
                                    className="px-3 py-2 rounded-lg bg-white text-black text-sm font-medium transition hover:bg-white/90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    <CircleCheck className="w-4 h-4" />
                                    {marking === task._id ? "Saving..." : "Mark Done"}
                                </button>

                            </div>
                        </motion.div>
                    ))}
            </AnimatePresence>
        </section>
    )
}
