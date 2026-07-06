import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, CircleCheckBig, Users } from "lucide-react";
import { api } from "../api/client";
import { MoveRight } from 'lucide-react';
import { useAuthStore } from "../store/authStore";
import { Trash2 } from "lucide-react";
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal"
import { ExternalLink } from "lucide-react"
import BookmarkButton from "../components/BookmarkButton"

type Problem = {
  _id: string;
  title: string;
  link: string;
  difficulty: "Easy" | "Medium" | "Hard";
  skills: string[];
};
type HistoryItem = {
  _id: string
  date: string
  skill: string
}

type MentionedGroup = { _id: string; name: string }

type Comment = {
  _id: string;
  message: string;
  createdAt: string;
  isGroupOnly?: boolean;
  mentionedGroups?: MentionedGroup[];
  user: {
    name: string;
    profileSlug: string;
  };
};

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [history, setHistory] = useState<HistoryItem[]>([])
  const navigate = useNavigate();
  const location = useLocation();

  const fromLabel = (location.state as any)?.fromLabel;
  const fromPath = (location.state as any)?.fromPath;
  const contextLabel = (location.state as any)?.contextLabel;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [isSolved, setIsSolved] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [pendingCommentId, setPendingCommentId] = useState<string | null>(null)

  // @ mention autocomplete state
  const [myGroups, setMyGroups] = useState<{ _id: string; name: string }[]>([])
  const [mentionQuery, setMentionQuery] = useState("")
  const [showMentionPopup, setShowMentionPopup] = useState(false)
  const [mentionStartIdx, setMentionStartIdx] = useState(-1)
  // Explicitly track which groups were selected from autocomplete
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const [problemRes, commentsRes, solvedRes, historyRes] = await Promise.all([
          api.get(`/api/problems/${id}`),
          api.get(`/api/discussion/problem/${id}?page=1&limit=20`),
          api.get(`/api/solve/${id}`),
          api.get(`/api/daily/history/${id}`)
        ]);

        setProblem(problemRes.data.problem || problemRes.data);
        const initialComments = commentsRes.data.comments || [];
        setComments(initialComments);
        setHasMore(initialComments.length === 20);
        setIsSolved(Boolean(solvedRes.data.solved));
        setHistory(historyRes.data.history || [])
      } catch {
        setProblem(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Load user's groups for @-mention
  useEffect(() => {
    if (!user) return
    api.get("/api/discussion/my-groups")
      .then((res) => setMyGroups(res.data.groups || []))
      .catch(() => { })
  }, [user])

  // Handle @-mention detection in the input
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMessage(val)

    const cursor = e.target.selectionStart ?? val.length
    // Find the last @ before the cursor
    const textBeforeCursor = val.slice(0, cursor)
    const atIdx = textBeforeCursor.lastIndexOf("@")

    if (atIdx !== -1) {
      const query = textBeforeCursor.slice(atIdx + 1)
      // Only show if no space in query (still typing the name)
      if (!query.includes(" ") || query.length < 20) {
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

  const filteredGroups = myGroups.filter((g) =>
    g.name.toLowerCase().includes(mentionQuery.toLowerCase())
  )

  const insertMention = (groupId: string, groupName: string) => {
    if (mentionStartIdx === -1) return
    const before = message.slice(0, mentionStartIdx)
    const after = message.slice(mentionStartIdx + 1 + mentionQuery.length)
    const newMsg = `${before}@${groupName} ${after}`
    setMessage(newMsg)
    // Track this group ID explicitly
    setSelectedGroupIds((prev) => prev.includes(groupId) ? prev : [...prev, groupId])
    setShowMentionPopup(false)
    setMentionQuery("")
    setMentionStartIdx(-1)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const postComment = async () => {
    if (!message.trim() || posting || !id) return;
    setPosting(true);
    try {
      const res = await api.post(`/api/discussion/problem/${id}`, {
        message,
        mentionedGroupIds: selectedGroupIds  // send explicit IDs, not parsed text
      });
      setComments((prev) => [res.data.comment, ...prev]);
      setMessage("");
      setSelectedGroupIds([]);  // reset after post
    } catch {
      alert("You must be logged in to post a comment");
    } finally {
      setPosting(false);
    }
  };

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
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

  const loadMore = async () => {
    if (!id || !hasMore) return;
    const nextPage = page + 1;
    try {
      const res = await api.get(`/api/discussion/problem/${id}?page=${nextPage}&limit=20`);
      const newComments = res.data.comments || [];
      setComments((prev) => [...prev, ...newComments]);
      setPage(nextPage);
      setHasMore(newComments.length === 20);
    } catch { }
  };

  async function handleConfirmDelete() {
    if (!pendingCommentId) return
    try {
      setConfirmLoading(true)
      await api.delete(`/api/discussion/comment/${pendingCommentId}`)
      setComments(prev => prev.filter(c => c._id !== pendingCommentId))
    } catch {
      alert("Failed to delete comment")
    } finally {
      setConfirmLoading(false)
      setConfirmOpen(false)
      setPendingCommentId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black text-white">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto pt-10 px-6 font-geist pb-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4 animate-pulse">
                <div className="h-4 w-32 bg-white/20 rounded" />
                <div className="h-8 w-3/4 bg-white/20 rounded" />
                <div className="h-4 w-24 bg-white/20 rounded" />
                <div className="h-4 w-full bg-white/10 rounded" />
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4 animate-pulse">
                <div className="h-4 w-24 bg-white/20 rounded" />
                <div className="h-24 w-full bg-white/10 rounded" />
              </div>
            </div>
            <div className="lg:col-span-3 flex">
              <div className="sticky top-10 w-full self-stretch rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 animate-pulse">
                <div className="h-6 w-48 bg-white/20 rounded mb-4" />
                <div className="h-4 w-3/4 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    )
  }

  if (!problem) {
    return <p className="text-white/40 p-10">Problem not found</p>;
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto pt-10 px-6 font-geist pb-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <button
                    onClick={() => {
                      if (fromPath) {
                        navigate("/")
                      } else {
                        navigate(-1)
                      }
                    }}
                    className="flex gap-2 hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <span>/</span>
                  <span className="text-white/70">{fromLabel || "Problems"}</span>
                  <span>›</span>
                  <span className="truncate max-w-[300px] text-white/90">
                    {contextLabel || problem.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold tracking-tight">{problem.title}</h1>
                <div className="flex items-center gap-2">
                  <BookmarkButton problemId={problem._id} />
                  {isSolved && (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CircleCheckBig className="w-4 h-4" />
                      Solved
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm tracking-wide px-2 py-0.5 rounded
                    ${problem.difficulty === "Easy"
                      ? "text-green-400 border-green-400/30 bg-green-400/10"
                      : problem.difficulty === "Medium"
                        ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                        : "text-red-400 border-red-400/30 bg-red-400/10"
                    }`}
                >
                  {problem.difficulty}
                </span>
                {problem.skills.map((s) => (
                  <span
                    key={s}
                    className="text-sm tracking-wide px-2 py-0.5 rounded border border-white/20 text-white/40"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <a
                href={problem.link}
                target="_blank"
                rel="noreferrer"
                className="text-sm flex gap-2 text-white/60 hover:text-white transition"
              >
                Solve <ExternalLink className="inline-block w-4 h-4" />
              </a>

              {history.length > 0 && (
                <div className="py-2 flex flex-wrap items-start gap-2">
                  <p className="text-sm tracking-wide text-white/40 shrink-0">
                    This problem was a Daily Problem on:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {history.map((h) => {
                      const d = new Date(h.date)
                      const day = String(d.getDate()).padStart(2, "0")
                      const month = String(d.getMonth() + 1).padStart(2, "0")
                      const year = d.getFullYear()

                      return (
                        <span key={h._id} className="text-sm text-white/60">
                          {day}/{month}/{year}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Discussion section */}
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-white/40" />
                <p className="text-sm tracking-wide text-white/40">Discussions</p>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
                {[...comments]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((c) => (
                    <div
                      key={c._id}
                      className={`bg-white/5 border rounded-lg p-4 ${c.isGroupOnly ? "border-purple-400/25 bg-purple-400/5" : "border-white/15"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center">
                            <svg className="h-4 w-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                          <button
                            onClick={() => navigate(`/u/${c.user.profileSlug}`)}
                            className="text-sm text-white/80 font-medium hover:text-white transition cursor-pointer"
                            title="View public profile"
                          >
                            {c.user.name}
                          </button>
                          {/* Group-only badge */}
                          {c.isGroupOnly && c.mentionedGroups && c.mentionedGroups.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-purple-400/25 bg-purple-400/10 text-purple-300">
                              <Users className="w-2.5 h-2.5" />
                              {c.mentionedGroups.map((g) => g.name).join(", ")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">{timeAgo(c.createdAt)}</span>
                          {user?.profileSlug === c.user.profileSlug && (
                            <button
                              onClick={() => {
                                setPendingCommentId(c._id)
                                setConfirmOpen(true)
                              }}
                              className="text-red-400 hover:text-red-300 transition cursor-pointer"
                              title="Delete comment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Render @mentions highlighted */}
                      <p className="text-sm text-white/60 leading-relaxed pl-9">
                        {renderMessageWithMentions(c.message)}
                      </p>
                    </div>
                  ))}

                {hasMore && (
                  <button
                    onClick={loadMore}
                    className="text-sm text-white/50 hover:text-white transition cursor-pointer"
                  >
                    Load more comments
                    <MoveRight className="inline-block w-4 h-4 ml-2" />
                  </button>
                )}

                {comments.length === 0 && (
                  <p className="text-sm text-white/40">
                    No discussion yet. Share your approach or insight.
                  </p>
                )}
              </div>

              {/* Comment input with @ mention */}
              <div className="relative">
                {/* @ mention popup */}
                <AnimatePresence>
                  {showMentionPopup && filteredGroups.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.12 }}
                      className="absolute bottom-full mb-2 left-0 z-50 w-56 rounded-xl border border-white/15 bg-black/90 backdrop-blur-xl shadow-xl overflow-hidden"
                    >
                      <p className="px-3 py-1.5 text-[11px] text-white/30 border-b border-white/8">
                        Tag a group — members will be notified
                      </p>
                      {filteredGroups.map((g) => (
                        <button
                          key={g._id}
                          onMouseDown={(e) => {
                            e.preventDefault() // prevent blur
                            insertMention(g._id, g.name)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/8 transition text-left"
                        >
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-sm text-white/80">{g.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 pt-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      value={message}
                      onChange={handleMessageChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !showMentionPopup) postComment()
                        if (e.key === "Escape") setShowMentionPopup(false)
                      }}
                      onBlur={() => setTimeout(() => setShowMentionPopup(false), 150)}
                      placeholder={user ? "Share your approach… type @ to tag a group" : "Log in to comment"}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition placeholder:text-white/25"
                    />
                  </div>
                  <button
                    disabled={posting}
                    onClick={postComment}
                    className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium disabled:opacity-50 cursor-pointer hover:bg-white/90 transition"
                  >
                    {posting ? "Posting…" : "Post"}
                  </button>
                </div>

                {user && myGroups.length > 0 && (
                  <p className="text-[11px] text-white/20 mt-1.5 pl-1">
                    Tip: type <span className="text-purple-400/70">@GroupName</span> to send a private notification to your group
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex">
            <div className="sticky top-10 w-full self-stretch rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 flex flex-col justify-center items-center text-center">
              <p className="text-white/40 text-lg">Solution not available</p>
              <p className="text-white/30 text-sm mt-2 max-w-md">
                Solve the problem on the platform, then return to ZERO to write your approach.
                In the future, AI-generated and peer-reviewed solutions will appear here.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <ConfirmModal
        open={confirmOpen}
        loading={confirmLoading}
        title="Delete Comment"
        description="This comment will be permanently removed."
        confirmText="Delete"
        onCancel={() => {
          setConfirmOpen(false)
          setPendingCommentId(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

/** Render a message string with @GroupName spans highlighted */
function renderMessageWithMentions(text: string) {
  const parts = text.split(/(@[A-Za-z0-9 _-]+)/g)
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="text-purple-300 font-medium">
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}
