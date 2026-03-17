import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bookmark, ExternalLink } from "lucide-react"
import { api } from "../api/client"
import { useNavigate, useLocation } from "react-router-dom"

type BookmarkItem = {
    _id: string
    problem: {
        _id: string
        title: string
        link: string
        difficulty: "Easy" | "Medium" | "Hard"
        skills: string[]
        companyTags: string[]
    }
    createdAt: string
}

export default function SavedView() {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        setLoading(true)
        api
            .get("/api/bookmarks")
            .then((res) => setBookmarks(res.data?.bookmarks || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    function removeBookmark(e: React.MouseEvent, problemId: string) {
        e.stopPropagation()
        api.post("/api/bookmarks/toggle", { problemId }).then(() => {
            setBookmarks((prev) => prev.filter((b) => b.problem._id !== problemId))
        })
    }

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
                    {Array.from({ length: 5 }).map((_, i) => (
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
        <section className="space-y-8 font-geist mx-4 sm:mx-6 md:mx-10 mt-6 sm:mt-8 md:mt-10 mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-center gap-3">

                <h2 className="text-xl font-semibold">Saved Problems</h2>
                {bookmarks.length > 0 && (
                    <span className="text-xs text-white/30">{bookmarks.length} saved</span>
                )}
            </div>

            {bookmarks.length === 0 && (
                <div className="py-16 text-center">
                    <Bookmark className="w-10 h-10 text-white/15 mx-auto mb-4" />
                    <p className="text-white/40 text-sm">No saved problems yet</p>
                    <p className="text-white/25 text-xs mt-1">
                        Bookmark problems from their detail page to review them later
                    </p>
                </div>
            )}

            {bookmarks.map((b, i) => (
                <motion.div
                    key={b._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                    className="relative mt-4 flex justify-center"
                >
                    <div className="relative group w-full">
                        <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

                        <div
                            onClick={() =>
                                navigate(`/problems/${b.problem._id}`, {
                                    state: {
                                        fromLabel: "Saved",
                                        fromPath: location.pathname + location.search,
                                        contextLabel: b.problem.title
                                    }
                                })
                            }
                            className="relative rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl text-left cursor-pointer"
                        >
                            <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-flex text-[11px] tracking-wide px-2 py-0.5 rounded 
                                                ${b.problem.difficulty === "Easy"
                                                    ? "text-green-400 border-green-400/30 bg-green-400/10"
                                                    : b.problem.difficulty === "Medium"
                                                        ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                                                        : "text-red-400 border-red-400/30 bg-red-400/10"
                                                }
                                            `}
                                        >
                                            {b.problem.difficulty}
                                        </span>

                                        {b.problem.skills?.slice(0, 2).map((s) => (
                                            <span
                                                key={s}
                                                className="inline-flex text-[11px] tracking-wide text-white/60 border border-white/20 px-2 py-0.5 rounded"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                        <div className="flex-1 text-base sm:text-lg text-white font-medium tracking-tight min-w-0">
                                            {b.problem.title}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    window.open(b.problem.link, "_blank")
                                                }}
                                                className="px-3 py-2 rounded-lg border border-white/20 text-xs sm:text-sm text-white/70 hover:text-white transition cursor-pointer flex items-center gap-2"
                                            >
                                                Solve
                                                <ExternalLink className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={(e) => removeBookmark(e, b.problem._id)}
                                                className="shrink-0 ml-2 p-2 rounded-lg border border-white/20 hover:bg-red-500/10 hover:border-red-500/30 transition cursor-pointer"
                                                title="Remove bookmark"
                                            >
                                                <Bookmark className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            </button>
                                        </div>
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
