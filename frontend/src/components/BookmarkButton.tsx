import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Bookmark, Folder, Users, ChevronRight, Check, Plus, X } from "lucide-react"
import { api } from "../api/client"
import { motion, AnimatePresence } from "framer-motion"

type PersonalCollection = { name: string; count: number }
type GroupCollection = { _id: string; name: string; notes?: string }
type GroupWithCollections = {
  _id: string
  name: string
  collections: GroupCollection[]
  fetchError?: boolean
}

type Props = { problemId: string }

export default function BookmarkButton({ problemId }: Props) {
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPopup, setShowPopup] = useState(false)
  const [popupPos, setPopupPos] = useState({ top: 0, right: 0 })
  const [personalCollections, setPersonalCollections] = useState<PersonalCollection[]>([])
  const [groupsWithCollections, setGroupsWithCollections] = useState<GroupWithCollections[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedCollection, setSavedCollection] = useState<string | null>(null)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [showNewInput, setShowNewInput] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    api.get(`/api/bookmarks/check/${problemId}`)
      .then((res) => setBookmarked(res.data?.bookmarked || false))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [problemId])

  // Close on outside click
  useEffect(() => {
    if (!showPopup) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      // The portal popup has data-bookmark-popup; check for it
      const popup = document.querySelector("[data-bookmark-popup]")
      if (popup && popup.contains(target)) return
      if (btnRef.current && btnRef.current.contains(target)) return
      setShowPopup(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showPopup])

  const openPopup = async (e: React.MouseEvent) => {
    e.stopPropagation()

    // Calculate position from the button's screen rect
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPopupPos({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right - window.scrollX,
      })
    }

    setShowPopup(true)
    setCollectionsLoading(true)
    try {
      const [personalRes, groupsRes] = await Promise.all([
        api.get("/api/bookmarks/collections/list"),
        api.get("/api/study-groups"),
      ])
      setPersonalCollections(personalRes.data.collections || [])

      const groups: { _id: string; name: string }[] = groupsRes.data.groups || []
      const withCollections = await Promise.all(
        groups.map(async (g) => {
          try {
            const res = await api.get(`/api/study-groups/${g._id}/collections`)
            return { _id: g._id, name: g.name, collections: res.data.collections || [] }
          } catch {
            return { _id: g._id, name: g.name, collections: [], fetchError: true }
          }
        })
      )
      // Show ALL groups even if they have no collections yet
      setGroupsWithCollections(withCollections)
    } catch {
      // silent
    } finally {
      setCollectionsLoading(false)
    }
  }

  const saveToPersonal = async (collectionName: string) => {
    setSaving(true)
    try {
      await api.post("/api/bookmarks/to-collection", { problemId, collection: collectionName })
      setBookmarked(true)
      setSavedCollection(collectionName)
      setTimeout(() => { setShowPopup(false); setSavedCollection(null) }, 900)
    } catch { }
    finally { setSaving(false) }
  }

  const saveToGroup = async (groupId: string, collectionId: string, collectionName: string) => {
    setSaving(true)
    try {
      await api.post("/api/bookmarks/add-to-group-collection", { problemId, groupId, collectionId })
      setSavedCollection(collectionName)
      setTimeout(() => { setShowPopup(false); setSavedCollection(null) }, 900)
    } catch { }
    finally { setSaving(false) }
  }

  const removeBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const prev = bookmarked
    setBookmarked(false)
    try { await api.post("/api/bookmarks/toggle", { problemId }) }
    catch { setBookmarked(prev) }
  }

  const handleNewCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCollectionName.trim()) return
    await saveToPersonal(newCollectionName.trim())
    setNewCollectionName("")
    setShowNewInput(false)
  }

  if (loading) return null

  const popup = (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          data-bookmark-popup
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "absolute",
            top: popupPos.top,
            right: popupPos.right,
            zIndex: 99999,
          }}
          className="w-72 rounded-xl border border-white/15 bg-black shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Save to collection</span>
            </div>
            <button onClick={() => setShowPopup(false)} className="text-white/30 hover:text-white/70 transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {collectionsLoading ? (
              <div className="px-4 py-6 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Personal collections */}
                <div className="px-3 pt-3 pb-1">
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <Folder className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-xs text-white/35 font-medium uppercase tracking-wider">My Collections</span>
                  </div>

                  <CollectionRow
                    icon={<Bookmark className="w-3.5 h-3.5" />}
                    label="Default"
                    sublabel="Quick save"
                    saved={savedCollection === "Default"}
                    disabled={saving}
                    onClick={() => saveToPersonal("Default")}
                  />

                  {personalCollections
                    .filter((c) => c.name !== "Default")
                    .map((c) => (
                      <CollectionRow
                        key={c.name}
                        icon={<Folder className="w-3.5 h-3.5" />}
                        label={c.name}
                        sublabel={`${c.count} problem${c.count !== 1 ? "s" : ""}`}
                        saved={savedCollection === c.name}
                        disabled={saving}
                        onClick={() => saveToPersonal(c.name)}
                      />
                    ))}

                  {showNewInput ? (
                    <form onSubmit={handleNewCollection} className="flex gap-1.5 mt-1.5 px-1">
                      <input
                        autoFocus
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Collection name…"
                        className="flex-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-white/30"
                      />
                      <button type="submit" className="shrink-0 rounded-lg bg-white px-2 py-1.5 text-xs font-medium text-black hover:bg-white/90 cursor-pointer">
                        Save
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowNewInput(true)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-white/35 hover:bg-white/5 hover:text-white/60 transition text-xs mt-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New collection…
                    </button>
                  )}
                </div>

                {/* Group collections */}
                {groupsWithCollections.length > 0 && (
                  <div className="px-3 pb-3 border-t border-white/10 mt-2 pt-3">
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                      <Users className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-xs text-white/35 font-medium uppercase tracking-wider">Group Collections</span>
                    </div>

                    {groupsWithCollections.map((g) => (
                      <div key={g._id} className="mb-2">
                        <p className="text-[11px] text-white/30 px-2 mb-1 font-medium">{g.name}</p>
                        {g.collections.length === 0 ? (
                          <p className="text-[11px] text-white/20 px-2 py-1 italic">
                            No collections yet — create one in the group workspace
                          </p>
                        ) : (
                          g.collections.map((col) => (
                            <CollectionRow
                              key={col._id}
                              icon={<Folder className="w-3.5 h-3.5 text-purple-400" />}
                              label={col.name}
                              sublabel={col.notes || "Group collection"}
                              saved={savedCollection === col.name}
                              disabled={saving}
                              onClick={() => saveToGroup(g._id, col._id, col.name)}
                            />
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <button
        ref={btnRef}
        onClick={bookmarked ? removeBookmark : openPopup}
        className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
        title={bookmarked ? "Remove bookmark" : "Save to collection"}
      >
        <Bookmark
          className={`w-5 h-5 transition ${bookmarked ? "text-yellow-400 fill-yellow-400" : "text-white/30 hover:text-white/60"}`}
        />
      </button>

      {/* Portal: renders at document.body level, outside all stacking contexts */}
      {typeof document !== "undefined" && createPortal(popup, document.body)}
    </>
  )
}

function CollectionRow({
  icon, label, sublabel, saved, disabled, onClick,
}: {
  icon: React.ReactNode
  label: string
  sublabel: string
  saved: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/8 transition disabled:opacity-50 group cursor-pointer"
    >
      <span className={`text-white/40 group-hover:text-white/60 transition ${saved ? "text-yellow-400" : ""}`}>
        {saved ? <Check className="w-3.5 h-3.5 text-green-400" /> : icon}
      </span>
      <div className="flex-1 text-left min-w-0">
        <p className={`text-xs font-medium truncate ${saved ? "text-green-400" : "text-white/75"}`}>{label}</p>
        <p className="text-[11px] text-white/30 truncate">{sublabel}</p>
      </div>
      {!saved && <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/30 transition" />}
    </button>
  )
}
