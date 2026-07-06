import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bookmark, ExternalLink, Tag, Folder, ChevronLeft, ArrowLeft } from "lucide-react"
import { api } from "../api/client"
import { useNavigate, useLocation } from "react-router-dom"
import toast from "react-hot-toast"

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
    collection?: string
    tags?: string[]
    notes?: string
    createdAt: string
}

type Collection = {
    name: string
    count: number
}

type TagItem = {
    name: string
    count: number
}

export default function SavedView() {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
    const [collections, setCollections] = useState<Collection[]>([])
    const [tags, setTags] = useState<TagItem[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"all" | "collections" | "tags">("all")
    const [openedCollection, setOpenedCollection] = useState<string | null>(null)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [bookmarksRes, collectionsRes, tagsRes] = await Promise.all([
                api.get("/api/bookmarks"),
                api.get("/api/bookmarks/collections/list").catch(() => ({ data: { collections: [] } })),
                api.get("/api/bookmarks/tags/list").catch(() => ({ data: { tags: [] } }))
            ])
            setBookmarks(bookmarksRes.data?.bookmarks || [])
            setCollections(collectionsRes.data?.collections || [])
            setTags(tagsRes.data?.tags || [])
        } catch {
            toast.error("Failed to load bookmarks")
        } finally {
            setLoading(false)
        }
    }

    function removeBookmark(e: React.MouseEvent, problemId: string) {
        e.stopPropagation()
        api.post("/api/bookmarks/toggle", { problemId }).then(() => {
            setBookmarks((prev) => prev.filter((b) => b.problem._id !== problemId))
        })
    }

    const diffColor = (d: string) =>
        d === "Easy" ? "text-green-400 border-green-400/30 bg-green-400/10"
            : d === "Medium" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                : "text-red-400 border-red-400/30 bg-red-400/10"

    // Which bookmarks to show in the list
    const displayedBookmarks = (() => {
        if (activeTab === "collections" && openedCollection)
            return bookmarks.filter(b => b.collection === openedCollection)
        if (activeTab === "tags" && selectedTag)
            return bookmarks.filter(b => b.tags?.includes(selectedTag))
        if (activeTab === "all") return bookmarks
        return []
    })()

    const BookmarkCard = ({ b, i }: { b: BookmarkItem; i: number }) => (
        <motion.div
            key={b._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
            className="relative group"
        >
            <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
            <div
                onClick={() => navigate(`/problems/${b.problem._id}`, {
                    state: { fromLabel: "Saved", fromPath: location.pathname + location.search, contextLabel: b.problem.title }
                })}
                className="relative rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl text-left cursor-pointer"
            >
                <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex text-[11px] tracking-wide px-2 py-0.5 rounded border ${diffColor(b.problem.difficulty)}`}>
                            {b.problem.difficulty}
                        </span>
                        {b.problem.skills?.slice(0, 2).map((s) => (
                            <span key={s} className="inline-flex text-[11px] tracking-wide text-white/60 border border-white/20 px-2 py-0.5 rounded">{s}</span>
                        ))}
                        {b.collection && (
                            <span className="inline-flex items-center gap-1 text-[11px] tracking-wide text-white/50 border border-white/15 bg-white/5 px-2 py-0.5 rounded">
                                <Folder className="w-3 h-3" />{b.collection}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-base font-medium text-white tracking-tight flex-1 min-w-0">{b.problem.title}</p>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); window.open(b.problem.link, "_blank") }}
                                className="px-3 py-1.5 rounded-lg border border-white/20 text-xs text-white/70 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                            >Solve <ExternalLink className="w-3.5 h-3.5" /></button>
                            <button
                                onClick={(e) => removeBookmark(e, b.problem._id)}
                                className="p-1.5 rounded-lg border border-white/20 hover:bg-red-500/10 hover:border-red-500/30 transition cursor-pointer"
                                title="Remove bookmark"
                            >
                                <Bookmark className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </button>
                        </div>
                    </div>
                    {(b.tags?.length || b.notes) && (
                        <div className="space-y-2 border-t border-white/10 pt-2">
                            {b.tags?.length ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {b.tags.map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1 rounded border border-purple-300/20 bg-purple-300/10 px-2 py-0.5 text-[11px] text-purple-200/80">
                                            <Tag className="w-3 h-3" />{tag}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                            {b.notes && <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/55">{b.notes}</p>}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )

    return (
        <section className="space-y-6 font-geist mx-4 sm:mx-6 md:mx-10 mt-6 sm:mt-8 md:mt-10 mb-10">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">Saved Problems</h1>
                {bookmarks.length > 0 && <span className="text-xs text-white/30">{bookmarks.length} saved</span>}
            </div>

            {loading && (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                            className="h-20 bg-white/10 rounded-xl animate-pulse" />
                    ))}
                </div>
            )}

            {!loading && (
                <>
                    {/* ── Tab bar ── */}
                    <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
                        {[
                            { id: "all", label: "All Bookmarks" },
                            { id: "collections", label: `Collections${collections.length ? ` (${collections.length})` : ""}`, icon: <Folder size={14} /> },
                            { id: "tags", label: `Tags${tags.length ? ` (${tags.length})` : ""}`, icon: <Tag size={14} /> },
                        ].map(({ id, label, icon }) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setActiveTab(id as any)
                                    setOpenedCollection(null)
                                    setSelectedTag(null)
                                }}
                                className={`rounded-lg px-4 py-2 text-sm transition flex items-center gap-1.5 cursor-pointer ${activeTab === id ? "bg-white text-black" : "text-white/50 hover:bg-white/10 hover:text-white/80"}`}
                            >
                                {icon}{label}
                            </button>
                        ))}
                    </div>

                    {/* ── Collections tab ── */}
                    <AnimatePresence mode="wait">
                        {activeTab === "collections" && (
                            <motion.div key="collections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {/* Folder open state — show back btn + problem list */}
                                {openedCollection ? (
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => setOpenedCollection(null)}
                                            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition cursor-pointer"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to collections
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <Folder className="w-4 h-4 text-white/50" />
                                            <h2 className="font-semibold text-white">{openedCollection}</h2>
                                            <span className="text-xs text-white/30">{displayedBookmarks.length} problem{displayedBookmarks.length !== 1 ? "s" : ""}</span>
                                        </div>
                                        {displayedBookmarks.length === 0 ? (
                                            <p className="text-sm text-white/35 py-8 text-center">No problems in this collection yet</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {displayedBookmarks.map((b, i) => <BookmarkCard key={b._id} b={b} i={i} />)}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Collection grid
                                    collections.length === 0 ? (
                                        <p className="text-white/40 text-sm py-8 text-center">No collections yet. Save a problem to a named collection from any problem page.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {collections.map((col) => (
                                                <button
                                                    key={col.name}
                                                    onClick={() => setOpenedCollection(col.name)}
                                                    className="group p-4 rounded-xl border border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/8 transition text-left cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-white">{col.name}</p>
                                                            <p className="text-xs text-white/45 mt-0.5">{col.count} problem{col.count !== 1 ? "s" : ""}</p>
                                                        </div>
                                                        <Folder className="w-5 h-5 text-white/35 group-hover:text-white/60 transition" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )
                                )}
                            </motion.div>
                        )}

                        {/* ── Tags tab ── */}
                        {activeTab === "tags" && (
                            <motion.div key="tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {selectedTag ? (
                                    <div className="space-y-4">
                                        <button onClick={() => setSelectedTag(null)} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition cursor-pointer">
                                            <ArrowLeft className="w-4 h-4" />Back to tags
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-purple-300" />
                                            <h2 className="font-semibold text-white">{selectedTag}</h2>
                                            <span className="text-xs text-white/30">{displayedBookmarks.length} problem{displayedBookmarks.length !== 1 ? "s" : ""}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {displayedBookmarks.map((b, i) => <BookmarkCard key={b._id} b={b} i={i} />)}
                                        </div>
                                    </div>
                                ) : (
                                    tags.length === 0 ? (
                                        <p className="text-white/40 text-sm py-8 text-center">No tags yet</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <button
                                                    key={tag.name}
                                                    onClick={() => setSelectedTag(tag.name)}
                                                    className="px-4 py-2 rounded-lg border border-white/15 text-white/70 hover:border-white/30 hover:text-white transition text-sm cursor-pointer"
                                                >
                                                    {tag.name} <span className="text-xs text-white/35 ml-1">({tag.count})</span>
                                                </button>
                                            ))}
                                        </div>
                                    )
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── All bookmarks list ── */}
                    {activeTab === "all" && (
                        <div className="space-y-3">
                            {bookmarks.length === 0 ? (
                                <div className="py-16 text-center">
                                    <Bookmark className="w-10 h-10 text-white/15 mx-auto mb-4" />
                                    <p className="text-white/40 text-sm">No saved problems yet</p>
                                    <p className="text-white/25 text-xs mt-1">Bookmark problems from their detail page to review them later</p>
                                </div>
                            ) : (
                                bookmarks.map((b, i) => <BookmarkCard key={b._id} b={b} i={i} />)
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    )
}
