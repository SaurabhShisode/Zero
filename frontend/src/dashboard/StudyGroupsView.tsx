import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { api } from "../api/client"
import {
  Calendar,
  ChevronLeft,
  Clock,
  Copy,
  Flame,
  Folder,
  Lock,
  LogOut,
  MessageCircle,
  Plus,
  Share2,
  Trophy,
  Trash2,
  Users,
  X
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"
import GroupChatTab from "./GroupChatTab"

interface StudyGroupMember {
  _id: string
  name: string
  profileSlug: string
}

interface StudyGroup {
  _id: string
  name: string
  description?: string
  creator: StudyGroupMember
  members: StudyGroupMember[]
  maxMembers?: number
  isPrivate: boolean
  inviteCode?: string
  createdAt: string
}

type Leader = {
  user: StudyGroupMember
  weeklySolved: number
  weeklyAttempts: number
  successRate: number
  streak: number
  avgCompletionTime: number
}

type Session = {
  _id: string
  title: string
  focusSkill?: string
  difficulty?: "Easy" | "Medium" | "Hard"
  durationMinutes?: number
  status: "active" | "completed"
  participants: StudyGroupMember[]
  attempted: number
  solved: number
  wrong: number
  skipped: number
  totalFocusMinutes: number
  startedAt: string
}

type Discussion = {
  _id: string
  type: "hint" | "approach" | "complexity" | "mistake" | "note" | "system"
  message: string
  createdAt: string
  isSystem?: boolean
  user: StudyGroupMember
  mentionedUsers?: StudyGroupMember[]
  problem?: { _id: string; title: string; difficulty: string }
}

type GroupCollection = {
  _id: string
  name: string
  notes?: string
  problems: Array<{ _id: string; title: string; difficulty: string; skills?: string[]; link?: string }>
}

type GroupEvent = {
  _id: string
  title: string
  type: "session" | "revision" | "contest" | "reminder"
  scheduledFor: string
  durationMinutes?: number
  notes?: string
}

type Tab = "leaderboard" | "sessions" | "discussion" | "collections" | "calendar"

const shell = "rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl"
const inputClass =
  "w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/35"

const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "sessions", label: "Sessions", icon: Clock },
  { id: "discussion", label: "Discussion", icon: MessageCircle },
  { id: "collections", label: "Collections", icon: Folder },
  { id: "calendar", label: "Calendar", icon: Calendar }
]

export default function StudyGroupsView() {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: "", description: "", isPrivate: false })
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/study-groups")
      setGroups(res.data.groups || [])
    } catch {
      toast.error("Failed to load study groups")
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async () => {
    try {
      if (!createForm.name.trim()) {
        toast.error("Group name is required")
        return
      }

      const res = await api.post("/api/study-groups", {
        ...createForm,
        name: createForm.name.trim(),
        description: createForm.description.trim()
      })
      setGroups((prev) => [res.data.group, ...prev])
      setCreateForm({ name: "", description: "", isPrivate: false })
      setShowCreate(false)
      toast.success("Study group created")
    } catch {
      toast.error("Failed to create study group")
    }
  }

  const joinGroup = async () => {
    try {
      if (!joinCode.trim()) {
        toast.error("Invite code is required")
        return
      }

      const res = await api.post("/api/study-groups/join", { inviteCode: joinCode.trim() })
      setGroups((prev) => [res.data.group, ...prev.filter((group) => group._id !== res.data.group._id)])
      setJoinCode("")
      setShowJoin(false)
      toast.success("Joined study group")
    } catch {
      toast.error("Failed to join group. Check the invite code.")
    }
  }

  const leaveGroup = async (groupId: string) => {
    if (!confirm("Leave this study group?")) return

    try {
      await api.delete(`/api/study-groups/${groupId}/leave`)
      setGroups((prev) => prev.filter((g) => g._id !== groupId))
      if (selectedGroup?._id === groupId) setSelectedGroup(null)
      toast.success("Left study group")
    } catch {
      toast.error("Failed to leave group")
    }
  }

  const deleteGroup = async (groupId: string) => {
    if (!confirm("Delete this study group? This cannot be undone.")) return

    try {
      await api.delete(`/api/study-groups/${groupId}`)
      setGroups((prev) => prev.filter((g) => g._id !== groupId))
      if (selectedGroup?._id === groupId) setSelectedGroup(null)
      toast.success("Study group deleted")
    } catch {
      toast.error("Failed to delete group")
    }
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Invite code copied")
  }

  if (selectedGroup) {
    return (
      <GroupWorkspace
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
        onDelete={deleteGroup}
        onLeave={leaveGroup}
        onCopyInvite={copyInviteCode}
        isOwner={user?._id === selectedGroup.creator?._id}
      />
    )
  }

  return (
    <section className="font-geist mx-4 sm:mx-6 md:mx-10 mt-6 sm:mt-8 md:mt-10 mb-10 space-y-6 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Study Groups</h1>
          <p className="text-sm text-white/40 mt-1">Create focused circles, compete, discuss, and plan study work together.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowJoin(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
            Join
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {showCreate && (
        <Modal title="Create Study Group" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <input type="text" placeholder="Group name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className={inputClass} />
            <textarea placeholder="Description (optional)" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className={`${inputClass} h-24 resize-none`} />
            <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-3 cursor-pointer">
              <span>
                <span className="block text-sm text-white">Private group</span>
                <span className="block text-xs text-white/40">Requires an invite code to join</span>
              </span>
              <input type="checkbox" checked={createForm.isPrivate} onChange={(e) => setCreateForm({ ...createForm, isPrivate: e.target.checked })} className="h-4 w-4 accent-white" />
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">Cancel</button>
              <button onClick={createGroup} className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">Create</button>
            </div>
          </div>
        </Modal>
      )}

      {showJoin && (
        <Modal title="Join Study Group" onClose={() => setShowJoin(false)}>
          <div className="space-y-4">
            <input type="text" placeholder="Invite code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className={`${inputClass} text-center font-mono text-lg tracking-widest`} />
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowJoin(false)} className="flex-1 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">Cancel</button>
              <button onClick={joinGroup} className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">Join</button>
            </div>
          </div>
        </Modal>
      )}

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className={`${shell} h-48 animate-pulse`} />)}
        </div>
      ) : groups.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${shell} p-10 text-center`}>
          <Users className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-sm text-white/45">No study groups yet. Create one or join with an invite code.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {groups.map((group, index) => {
            const isOwner = user?._id === group.creator?._id
            return (
              <motion.article
                key={group._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`${shell} p-5 sm:p-6 hover:bg-white/[0.12] transition`}
              >
                <button onClick={() => setSelectedGroup(group)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold truncate">{group.name}</h2>
                        {group.isPrivate && (
                          <span className="inline-flex items-center gap-1 rounded border border-purple-400/25 bg-purple-400/10 px-2 py-0.5 text-[11px] text-purple-300">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        )}
                      </div>
                      {group.description && <p className="text-sm text-white/45 mt-2 line-clamp-2">{group.description}</p>}
                    </div>
                    <span className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50">
                      {group.members.length}/{group.maxMembers || 50}
                    </span>
                  </div>
                </button>

                {group.inviteCode && (
                  <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-3">
                    <p className="text-xs text-white/35 mb-2">Invite code</p>
                    <div className="flex items-center justify-between gap-3">
                      <code className="font-mono text-sm tracking-widest text-white/80">{group.inviteCode}</code>
                      <button onClick={() => copyInviteCode(group.inviteCode!)} className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white" title="Copy invite code">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <p className="text-xs text-white/35 mb-2">Members</p>
                  <div className="flex flex-wrap gap-2">
                    {group.members.slice(0, 6).map((member) => (
                      <span key={member._id} className="max-w-36 truncate rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">{member.name}</span>
                    ))}
                    {group.members.length > 6 && <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/35">+{group.members.length - 6}</span>}
                  </div>
                </div>

                <div className="mt-6 flex justify-between gap-2">
                  <button onClick={() => setSelectedGroup(group)} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
                    Open workspace
                  </button>
                  {isOwner ? (
                    <button onClick={() => deleteGroup(group._id)} className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  ) : (
                    <button onClick={() => leaveGroup(group._id)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white">
                      <LogOut className="w-4 h-4" />
                      Leave
                    </button>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function GroupWorkspace({
  group,
  onBack,
  onDelete,
  onLeave,
  onCopyInvite,
  isOwner
}: {
  group: StudyGroup
  onBack: () => void
  onDelete: (groupId: string) => void
  onLeave: (groupId: string) => void
  onCopyInvite: (code: string) => void
  isOwner: boolean
}) {
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard")
  const [leaderboard, setLeaderboard] = useState<Leader[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [collections, setCollections] = useState<GroupCollection[]>([])
  const [events, setEvents] = useState<GroupEvent[]>([])
  const [loading, setLoading] = useState(true)

  const [sessionForm, setSessionForm] = useState({ title: "", focusSkill: "DSA", difficulty: "Easy", durationMinutes: 45 })
  const [sessionLog, setSessionLog] = useState({ sessionId: "", attempted: 0, solved: 0, wrong: 0, skipped: 0, totalFocusMinutes: 45 })
  const [discussionForm, setDiscussionForm] = useState({ problemId: "", type: "note", message: "" })



  const activeSession = useMemo(() => sessions.find((session) => session.status === "active"), [sessions])

  useEffect(() => {
    loadWorkspace()
  }, [group._id])

  const loadWorkspace = async () => {
    try {
      setLoading(true)
      const [leaderboardRes, sessionsRes, discussionsRes, collectionsRes, eventsRes] = await Promise.all([
        api.get(`/api/study-groups/${group._id}/leaderboard`),
        api.get(`/api/study-groups/${group._id}/sessions`),
        api.get(`/api/study-groups/${group._id}/discussions`),
        api.get(`/api/study-groups/${group._id}/collections`),
        api.get(`/api/study-groups/${group._id}/events`)
      ])
      setLeaderboard(leaderboardRes.data.leaderboard || [])
      setSessions(sessionsRes.data.sessions || [])
      setDiscussions(discussionsRes.data.discussions || [])
      setCollections(collectionsRes.data.collections || [])
      setEvents(eventsRes.data.events || [])
    } catch {
      toast.error("Failed to load group workspace")
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    try {
      const res = await api.post(`/api/study-groups/${group._id}/sessions`, sessionForm)
      setSessions((prev) => [res.data.session, ...prev])
      setSessionForm({ title: "", focusSkill: "DSA", difficulty: "Easy", durationMinutes: 45 })
      toast.success("Study session started")
    } catch {
      toast.error("Failed to start session")
    }
  }

  const completeSession = async () => {
    try {
      if (!sessionLog.sessionId) {
        toast.error("Choose an active session first")
        return
      }
      await api.put(`/api/study-groups/sessions/${sessionLog.sessionId}/end`, sessionLog)
      setSessionLog({ sessionId: "", attempted: 0, solved: 0, wrong: 0, skipped: 0, totalFocusMinutes: 45 })
      await loadWorkspace()
      toast.success("Session logged")
    } catch {
      toast.error("Failed to log session")
    }
  }

  const postDiscussion = async () => {
    try {
      if (!discussionForm.message.trim()) {
        toast.error("Write a message first")
        return
      }
      const res = await api.post(`/api/study-groups/${group._id}/discussions`, {
        type: discussionForm.type,
        message: discussionForm.message
      })
      setDiscussions((prev) => [res.data.discussion, ...prev])
      setDiscussionForm({ problemId: "", type: "note", message: "" })
    } catch {
      toast.error("Failed to post discussion")
    }
  }

  const createCollection = async (name: string, notes: string) => {
    try {
      if (!name.trim()) {
        toast.error("Collection name is required")
        return
      }
      const res = await api.post(`/api/study-groups/${group._id}/collections`, { name: name.trim(), notes })
      setCollections((prev) => [res.data.collection, ...prev])
      toast.success("Shared collection created")
    } catch {
      toast.error("Failed to create collection")
    }
  }

  const createEvent = async (formData: { title: string; type: string; scheduledFor: string; durationMinutes: number; notes: string }) => {
    try {
      const res = await api.post(`/api/study-groups/${group._id}/events`, formData)
      setEvents((prev) => [...prev, res.data.event].sort((a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor)))
      toast.success("Event scheduled")
    } catch {
      toast.error("Failed to schedule event")
    }
  }

  return (
    <section className="font-geist mx-4 sm:mx-6 md:mx-10 mt-6 sm:mt-8 md:mt-10 mb-10 space-y-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
            <ChevronLeft className="w-4 h-4" />
            Back to groups
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold">{group.name}</h1>
            {group.isPrivate && <span className="rounded border border-purple-400/25 bg-purple-400/10 px-2 py-0.5 text-xs text-purple-300">Private</span>}
          </div>
          {group.description && <p className="text-sm text-white/40 mt-1">{group.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {group.inviteCode && (
            <button onClick={() => onCopyInvite(group.inviteCode!)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/65 hover:bg-white/10 hover:text-white">
              <Copy className="w-4 h-4" />
              Copy invite
            </button>
          )}
          {isOwner ? (
            <button onClick={() => onDelete(group._id)} className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          ) : (
            <button onClick={() => onLeave(group._id)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white">
              <LogOut className="w-4 h-4" />
              Leave
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Members" value={group.members.length} />
        <Metric label="Sessions" value={sessions.length} />
        <Metric label="Discussions" value={discussions.length} />
        <Metric label="Events" value={events.length} />
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${activeTab === tab.id ? "bg-white text-black" : "text-white/55 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {loading ? <div className={`${shell} h-72 animate-pulse`} /> : (
        <>
          {activeTab === "leaderboard" && <LeaderboardTab leaderboard={leaderboard} />}
          {activeTab === "sessions" && (
            <SessionsTab
              sessions={sessions}
              activeSession={activeSession}
              sessionForm={sessionForm}
              setSessionForm={setSessionForm}
              sessionLog={sessionLog}
              setSessionLog={setSessionLog}
              onStart={startSession}
              onComplete={completeSession}
            />
          )}
          {activeTab === "discussion" && (
            <GroupChatTab
              groupId={group._id}
              groupName={group.name}
              members={group.members}
              discussions={discussions}
              form={discussionForm}
              setForm={setDiscussionForm}
              onPost={postDiscussion}
            />
          )}
          {activeTab === "collections" && (
            <CollectionsTab
              groupId={group._id}
              collections={collections}
              onCreate={createCollection}
            />
          )}
          {activeTab === "calendar" && (
            <CalendarTab events={events} onCreate={createEvent} />
          )}
        </>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className={`${shell} p-4`}>
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}

function LeaderboardTab({ leaderboard }: { leaderboard: Leader[] }) {
  return (
    <div className={`${shell} overflow-hidden`}>
      <div className="grid grid-cols-[2.5rem_1fr_repeat(4,minmax(5rem,0.7fr))] gap-3 border-b border-white/10 px-4 py-3 text-xs text-white/35">
        <span>#</span><span>Member</span><span>Solved</span><span>Success</span><span>Streak</span><span>Avg time</span>
      </div>
      {leaderboard.length === 0 ? (
        <p className="p-6 text-sm text-white/40">No solves this week yet.</p>
      ) : leaderboard.map((row, index) => (
        <div key={row.user._id} className="grid grid-cols-[2.5rem_1fr_repeat(4,minmax(5rem,0.7fr))] gap-3 border-b border-white/5 px-4 py-4 text-sm last:border-b-0">
          <span className="text-white/40">{index + 1}</span>
          <span className="font-medium">{row.user.name}</span>
          <span>{row.weeklySolved}/{row.weeklyAttempts}</span>
          <span>{row.successRate}%</span>
          <span className="inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-300" />{row.streak}</span>
          <span>{row.avgCompletionTime ? `${Math.round(row.avgCompletionTime / 60)}m` : "-"}</span>
        </div>
      ))}
    </div>
  )
}

function SessionsTab(props: {
  sessions: Session[]
  activeSession?: Session
  sessionForm: { title: string; focusSkill: string; difficulty: string; durationMinutes: number }
  setSessionForm: (form: { title: string; focusSkill: string; difficulty: string; durationMinutes: number }) => void
  sessionLog: { sessionId: string; attempted: number; solved: number; wrong: number; skipped: number; totalFocusMinutes: number }
  setSessionLog: (form: { sessionId: string; attempted: number; solved: number; wrong: number; skipped: number; totalFocusMinutes: number }) => void
  onStart: () => void
  onComplete: () => void
}) {
  const { sessions, activeSession, sessionForm, setSessionForm, sessionLog, setSessionLog, onStart, onComplete } = props
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-4">
      <div className={`${shell} p-5 space-y-3`}>
        <h2 className="font-semibold">Start Session</h2>
        <input className={inputClass} placeholder="Session title" value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className={inputClass} placeholder="Skill" value={sessionForm.focusSkill} onChange={(e) => setSessionForm({ ...sessionForm, focusSkill: e.target.value })} />
          <select className={inputClass} value={sessionForm.difficulty} onChange={(e) => setSessionForm({ ...sessionForm, difficulty: e.target.value })}>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </div>
        <input className={inputClass} type="number" min={5} value={sessionForm.durationMinutes} onChange={(e) => setSessionForm({ ...sessionForm, durationMinutes: Number(e.target.value) })} />
        <button onClick={onStart} className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">Start</button>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <h2 className="font-semibold">Log Result</h2>
          <select className={inputClass} value={sessionLog.sessionId || activeSession?._id || ""} onChange={(e) => setSessionLog({ ...sessionLog, sessionId: e.target.value })}>
            <option value="">Choose active session</option>
            {sessions.filter((session) => session.status === "active").map((session) => <option key={session._id} value={session._id}>{session.title}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            {(["attempted", "solved", "wrong", "skipped", "totalFocusMinutes"] as const).map((field) => (
              <input key={field} className={inputClass} type="number" min={0} placeholder={field} value={sessionLog[field]} onChange={(e) => setSessionLog({ ...sessionLog, [field]: Number(e.target.value), sessionId: sessionLog.sessionId || activeSession?._id || "" })} />
            ))}
          </div>
          <button onClick={onComplete} className="w-full rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">Complete Session</button>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.length === 0 ? <Empty label="No study sessions yet." /> : sessions.map((session) => (
          <div key={session._id} className={`${shell} p-4`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{session.title}</h3>
                <p className="text-xs text-white/40 mt-1">{session.focusSkill || "General"} · {session.difficulty || "Mixed"} · {session.durationMinutes || 0} min</p>
              </div>
              <span className={`rounded px-2 py-1 text-xs ${session.status === "active" ? "bg-green-400/10 text-green-300" : "bg-white/10 text-white/50"}`}>{session.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              <MiniStat label="Attempted" value={session.attempted} />
              <MiniStat label="Solved" value={session.solved} />
              <MiniStat label="Wrong" value={session.wrong} />
              <MiniStat label="Focus" value={`${session.totalFocusMinutes || session.durationMinutes || 0}m`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



function CollectionsTab({
  groupId: _groupId,
  collections,
  onCreate,
}: {
  groupId: string
  collections: GroupCollection[]
  onCreate: (name: string, notes: string) => Promise<void>
}) {
  const [openedId, setOpenedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    await onCreate(newName.trim(), newNotes.trim())
    setCreating(false)
    setNewName("")
    setNewNotes("")
    setShowModal(false)
  }

  const diffColor = (d: string) =>
    d === "Easy" ? "text-green-400 bg-green-400/10 border-green-400/25"
    : d === "Medium" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/25"
    : "text-red-400 bg-red-400/10 border-red-400/25"

  const openedCol = collections.find(c => c._id === openedId)

  return (
    <div className="space-y-5">

      {/* ── Folder open view ── */}
      {openedCol ? (
        <div className="space-y-4">
          <button
            onClick={() => setOpenedId(null)}
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back to collections
          </button>
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-white/50" />
            <h2 className="font-semibold">{openedCol.name}</h2>
            <span className="text-xs text-white/30">{openedCol.problems.length} problem{openedCol.problems.length !== 1 ? "s" : ""}</span>
          </div>
          {openedCol.notes && <p className="text-sm text-white/40">{openedCol.notes}</p>}

          {openedCol.problems.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/3 p-8 text-center">
              <Folder className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/35">No problems yet</p>
              <p className="text-xs text-white/20 mt-1">Add problems from any problem page using the bookmark button</p>
            </div>
          ) : (
            <div className="space-y-2">
              {openedCol.problems.map((prob) => (
                <div
                  key={prob._id}
                  onClick={() => navigate(`/problems/${prob._id}`)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 px-4 py-3 cursor-pointer transition group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/85 group-hover:text-white truncate">{prob.title}</p>
                    {(prob.skills?.length ?? 0) > 0 && (
                      <p className="text-xs text-white/35 mt-0.5 truncate">{prob.skills?.slice(0, 3).join(" · ")}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded border ${diffColor(prob.difficulty)}`}>
                    {prob.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Grid view ── */
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/40">
              {collections.length} shared collection{collections.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/8 hover:text-white transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New collection
            </button>
          </div>

          {collections.length === 0 ? (
            <Empty label="No shared collections yet. Create one with the + button above." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {collections.map((col) => (
                <button
                  key={col._id}
                  onClick={() => setOpenedId(col._id)}
                  className="group p-4 rounded-xl border border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/8 transition text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{col.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {col.problems.length} problem{col.problems.length !== 1 ? "s" : ""}
                        {col.notes && ` · ${col.notes}`}
                      </p>
                    </div>
                    <Folder className="w-5 h-5 text-white/35 group-hover:text-white/60 transition" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create collection modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-2xl border border-white/15 bg-black p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">New shared collection</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Amazon prep, Hard DP…" className={inputClass} />
              <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notes (optional)" rows={2} className={`${inputClass} resize-none`} />
              <p className="text-xs text-white/25">Add problems from any problem page via the bookmark button.</p>
              <button type="submit" disabled={creating || !newName.trim()}
                className="w-full rounded-lg bg-white py-2 text-sm font-medium text-black disabled:opacity-40 hover:bg-white/90 transition cursor-pointer">
                {creating ? "Creating…" : "Create"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function CalendarTab({
  events,
  onCreate,
}: {
  events: GroupEvent[]
  onCreate: (form: { title: string; type: string; scheduledFor: string; durationMinutes: number; notes: string }) => Promise<void>
}) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [form, setForm] = useState({ title: "", type: "session", durationMinutes: 45, notes: "", time: "10:00" })
  const [creating, setCreating] = useState(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" })

  // Build calendar cells — week starts Monday
  const firstDOW = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDOW).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  // Index events by day key
  const eventsByDay: Record<string, GroupEvent[]> = {}
  for (const ev of events) {
    const d = new Date(ev.scheduledFor)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = String(d.getDate())
      if (!eventsByDay[key]) eventsByDay[key] = []
      eventsByDay[key].push(ev)
    }
  }

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const typeColor: Record<string, string> = {
    session: "bg-blue-400",
    revision: "bg-emerald-400",
    contest: "bg-amber-400",
    reminder: "bg-purple-400",
  }

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day))
    setForm({ title: "", type: "session", durationMinutes: 45, notes: "", time: "10:00" })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !form.title.trim()) return
    setCreating(true)
    const [h, m] = form.time.split(":").map(Number)
    const scheduledFor = new Date(selectedDate)
    scheduledFor.setHours(h, m, 0, 0)
    await onCreate({ title: form.title, type: form.type, scheduledFor: scheduledFor.toISOString(), durationMinutes: form.durationMinutes, notes: form.notes })
    setCreating(false)
    setSelectedDate(null)
  }

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

      {/* ── Calendar grid ── */}
      <div className={`${shell} p-5 space-y-4`}>
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center text-white/50 hover:bg-white/8 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold">{monthName}</span>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center text-white/50 hover:bg-white/8 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[11px] text-white/30 py-1">{d}</div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />
            const dayEvents = eventsByDay[String(day)] || []
            const active = isToday(day)
            return (
              <button
                key={idx}
                onClick={() => handleDayClick(day)}
                className={`relative flex flex-col items-center rounded-xl py-1.5 px-1 transition cursor-pointer group ${
                  active
                    ? "bg-white text-black"
                    : "hover:bg-white/8 text-white/70 hover:text-white"
                }`}
              >
                <span className={`text-xs font-medium ${active ? "text-black" : ""}`}>{day}</span>
                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${typeColor[ev.type] || "bg-white/40"} ${active ? "opacity-50" : ""}`} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-white/8">
          {Object.entries(typeColor).map(([type, cls]) => (
            <span key={type} className="flex items-center gap-1.5 text-xs text-white/35">
              <span className={`w-2 h-2 rounded-full ${cls}`} />{type}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right panel: upcoming events ── */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <Empty label="No events yet. Click a date to schedule one." />
        ) : (
          events.map((ev) => (
            <div key={ev._id} className={`${shell} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-1.5 self-stretch rounded-full ${typeColor[ev.type] || "bg-white/20"}`} />
                  <div>
                    <p className="font-medium text-sm">{ev.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {new Date(ev.scheduledFor).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      {" · "}
                      {new Date(ev.scheduledFor).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      {ev.durationMinutes ? ` · ${ev.durationMinutes}min` : ""}
                    </p>
                    {ev.notes && <p className="text-xs text-white/35 mt-1">{ev.notes}</p>}
                  </div>
                </div>
                <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40`}>{ev.type}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Create event popup ── */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-2xl border border-white/15 bg-black p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold">Schedule event</h2>
              <button onClick={() => setSelectedDate(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/35 mb-4">
              {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
            <form onSubmit={handleCreate} className="space-y-3">
              <input autoFocus value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Session title, contest name…" className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
                  <option value="session">Session</option>
                  <option value="revision">Revision</option>
                  <option value="contest">Contest</option>
                  <option value="reminder">Reminder</option>
                </select>
                <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className={inputClass} />
              </div>
              <input type="number" min={0} value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                placeholder="Duration (minutes)" className={inputClass} />
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes (optional)" rows={2} className={`${inputClass} resize-none`} />
              <button type="submit" disabled={creating || !form.title.trim()}
                className="w-full rounded-lg bg-white py-2 text-sm font-medium text-black disabled:opacity-40 hover:bg-white/90 transition cursor-pointer">
                {creating ? "Saving…" : "Schedule"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2">
      <p className="text-white/70">{value}</p>
      <p className="mt-1 text-white/35">{label}</p>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return <div className={`${shell} p-8 text-center text-sm text-white/40`}>{label}</div>
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md rounded-xl border border-white/15 bg-black/90 p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}
