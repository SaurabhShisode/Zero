import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "../store/authStore"
import { Send, Users, Lock, ExternalLink } from "lucide-react"
import { useNavigate } from "react-router-dom"

type Member = { _id: string; name: string; profileSlug: string }

type Discussion = {
  _id: string
  type: "hint" | "approach" | "complexity" | "mistake" | "note" | "system"
  message: string
  createdAt: string
  isSystem?: boolean
  user: Member
  mentionedUsers?: Member[]
  problem?: { _id: string; title: string; difficulty: string }
}

type DiscussionForm = {
  problemId: string
  type: string
  message: string
}

const TYPE_COLORS: Record<string, string> = {
  hint: "bg-amber-400/15 text-amber-300 border-amber-400/20",
  approach: "bg-blue-400/15 text-blue-300 border-blue-400/20",
  complexity: "bg-purple-400/15 text-purple-300 border-purple-400/20",
  mistake: "bg-red-400/15 text-red-300 border-red-400/20",
  note: "bg-white/8 text-white/40 border-white/10",
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
}

function avatarColor(name: string) {
  const colors = ["bg-violet-500", "bg-blue-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500", "bg-pink-500"]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

/** Highlight @mentions in a message string */
function renderMessage(text: string) {
  return text.split(/(@[A-Za-z0-9_.'\- ]+)/g).map((part, i) =>
    part.startsWith("@")
      ? <span key={i} className="text-purple-700 font-medium">{part}</span>
      : <span key={i}>{part}</span>
  )
}

interface Props {
  groupId: string
  groupName: string
  members: Member[]
  discussions: Discussion[]
  form: DiscussionForm
  setForm: (f: DiscussionForm) => void
  onPost: () => Promise<void> | void
}

export default function GroupChatTab({ groupName: _gn, members, discussions, form, setForm, onPost }: Props) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [sending, setSending] = useState(false)

  // @mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState("")
  const [showMentionPopup, setShowMentionPopup] = useState(false)
  const [mentionStartIdx, setMentionStartIdx] = useState(-1)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [discussions.length])

  // Sort chronologically
  const sorted = [...discussions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  // Group by date
  const grouped = sorted.reduce<{ date: string; messages: Discussion[] }[]>((acc, msg) => {
    const d = new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    const last = acc[acc.length - 1]
    if (last && last.date === d) last.messages.push(msg)
    else acc.push({ date: d, messages: [msg] })
    return acc
  }, [])

  // Filtered members for mention autocomplete (exclude self)
  const filteredMembers = members.filter(
    (m) => m._id !== (user as any)?._id &&
      m.name.toLowerCase().includes(mentionQuery.toLowerCase())
  )

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setForm({ ...form, message: val })

    // Auto-resize
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"

    // Detect @mention
    const cursor = e.target.selectionStart ?? val.length
    const textBefore = val.slice(0, cursor)
    const atIdx = textBefore.lastIndexOf("@")
    if (atIdx !== -1) {
      const query = textBefore.slice(atIdx + 1)
      if (!query.includes("\n") && query.length <= 30) {
        setMentionQuery(query)
        setMentionStartIdx(atIdx)
        setShowMentionPopup(true)
        return
      }
    }
    setShowMentionPopup(false)
    setMentionQuery("")
    setMentionStartIdx(-1)
  }

  const insertMention = (name: string) => {
    if (mentionStartIdx === -1) return
    const before = form.message.slice(0, mentionStartIdx)
    const after = form.message.slice(mentionStartIdx + 1 + mentionQuery.length)
    const newMsg = `${before}@${name} ${after}`
    setForm({ ...form, message: newMsg })
    setShowMentionPopup(false)
    setMentionQuery("")
    setMentionStartIdx(-1)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const handleSend = useCallback(async () => {
    if (!form.message.trim() || sending) return
    setSending(true)
    try { await onPost() }
    finally {
      setSending(false)
      // Reset textarea height
      if (textareaRef.current) textareaRef.current.style.height = "40px"
      textareaRef.current?.focus()
    }
  }, [form.message, sending, onPost])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentionPopup) {
      if (e.key === "Escape") { setShowMentionPopup(false); e.preventDefault() }
      return
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[600px] rounded-xl border border-white/15 bg-black/30 backdrop-blur-xl overflow-visible">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5 rounded-t-xl shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Group Discussion</p>
          <p className="text-xs text-white/40">{discussions.length} message{discussions.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-white/20" />
          <span className="text-xs text-white/25">Members only</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 py-4 space-y-1 min-h-0">
        {discussions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-sm text-white/35">No messages yet.</p>
            <p className="text-xs text-white/20">Share hints, approaches, or insights. Type @ to mention someone.</p>
          </div>
        ) : (
          grouped.map((grp) => (
            <div key={grp.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-[11px] text-white/25 px-2">{grp.date}</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              <div className="space-y-1">
                {grp.messages.map((msg, idx) => {
                  const isMe = (user as any)?._id === msg.user._id
                  const prevMsg = idx > 0 ? grp.messages[idx - 1] : null
                  const showAvatar = !prevMsg || prevMsg.user._id !== msg.user._id

                  // System message (e.g. "@group tagged on problem")
                  if (msg.isSystem || msg.type === "system") {
                    return (
                      <div key={msg._id} className="flex justify-center my-2">
                        <div
                          className={`flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/40 max-w-[90%] ${msg.problem ? "cursor-pointer hover:bg-white/8 hover:text-white/60 transition" : ""}`}
                          onClick={() => msg.problem && navigate(`/problems/${msg.problem._id}`)}
                        >
                          <span>{msg.message}</span>
                          {msg.problem && (
                            <>
                              <span className="text-white/20">·</span>
                              <span className="text-blue-400/70 flex items-center gap-1">
                                {msg.problem.title}
                                <ExternalLink className="w-3 h-3" />
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <AnimatePresence key={msg._id} mode="popLayout">
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-7">
                          {showAvatar && !isMe ? (
                            <div
                              title={msg.user.name}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${avatarColor(msg.user.name)}`}
                            >
                              {getInitials(msg.user.name)}
                            </div>
                          ) : <div className="w-7" />}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                          {showAvatar && !isMe && (
                            <span className="text-xs text-white/40 ml-1">{msg.user.name}</span>
                          )}

                          {/* Type tag — separate line, NOT inside bubble */}
                          {msg.type !== "note" && (
                            <span className={`self-start text-[10px] px-2 py-0.5 rounded-full border ${TYPE_COLORS[msg.type]} ${isMe ? "self-end" : "self-start"} mb-0.5`}>
                              {msg.type}
                            </span>
                          )}

                          <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words shadow-sm ${
                            isMe ? "bg-white text-black rounded-br-sm" : "bg-white/10 border border-white/10 text-white/90 rounded-bl-sm"
                          }`}>
                            <p>{renderMessage(msg.message)}</p>

                            

                            {/* Timestamp */}
                            <div className={`text-[10px] mt-1 ${isMe ? "text-black/35 text-right" : "text-white/25"}`}>
                              {timeAgo(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 bg-black/20 px-3 py-3 shrink-0 relative">
        {/* @ mention popup */}
        <AnimatePresence>
          {showMentionPopup && filteredMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.12 }}
              className="absolute bottom-full mb-2 left-3 z-50 w-52 rounded-xl border border-white/15 bg-black/95 backdrop-blur-xl shadow-xl overflow-hidden"
            >
              <p className="px-3 py-1.5 text-[11px] text-white/30 border-b border-white/8">
                Mention a member — they'll be notified
              </p>
              {filteredMembers.map((m) => (
                <button
                  key={m._id}
                  onMouseDown={(e) => { e.preventDefault(); insertMention(m.name) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/8 transition text-left"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${avatarColor(m.name)}`}>
                    {getInitials(m.name)}
                  </div>
                  <span className="text-sm text-white/80">{m.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Type selector pills */}
        <div className="flex gap-1.5 mb-2 overflow-x-auto scrollbar-hide pb-0.5">
          {(["note", "hint", "approach", "complexity", "mistake"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setForm({ ...form, type: t })}
              className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
                form.type === t ? TYPE_COLORS[t] : "border-white/10 text-white/25 hover:border-white/20 hover:text-white/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Message row */}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={form.message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setShowMentionPopup(false), 150)}
            placeholder="Share a hint, approach… type @ to mention someone"
            className="flex-1 resize-none overflow-hidden rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/25 transition"
            style={{ height: "40px", minHeight: "40px", maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!form.message.trim() || sending}
            className="shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black transition hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {sending
              ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>

        {members.length > 0 && (
          <p className="text-[11px] text-white/15 mt-1.5 pl-0.5">
            Type <span className="text-purple-400/60">@name</span> to mention a member · Enter to send
          </p>
        )}
      </div>
    </div>
  )
}
