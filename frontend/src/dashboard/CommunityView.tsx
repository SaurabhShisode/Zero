import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "../api/client"
import { useNavigate } from "react-router-dom"
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import {
  Plus,
  MessageSquare,
  Flame,
  Clock,
  Trophy
} from "lucide-react"
import toast from "react-hot-toast"

type Post = {
  _id: string
  title: string
  body: string
  tags: string[]
  commentsCount: number
  upvotes: number
  downvotes: number
  myVote?: "up" | "down" | null
  author: {
    name: string
    profileSlug: string
  }
  createdAt: string
}

const SORTS = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "top", label: "Top", icon: Trophy },
  { id: "new", label: "New", icon: Clock }
]

export default function DiscussionsView() {
  const navigate = useNavigate()
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const [posts, setPosts] = useState<Post[]>([])
  const [sort, setSort] = useState("trending")
  const [loading, setLoading] = useState(true)
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({})

  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState("")
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const myUserId = localStorage.getItem("userId")



  useEffect(() => {
    loadPosts()
  }, [sort])

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await api.get(`/api/community/posts?sort=${sort}`)
      setPosts(res.data.posts)
    } catch {
      toast.error("Failed to load discussions")
    } finally {
      setLoading(false)
    }
  }
  function toggleComments(postId: string) {
    if (openComments === postId) {
      setOpenComments(null)
      return
    }

    setOpenComments(postId)

    if (!comments[postId]) {
      loadComments(postId)
    }
  }
  function toggleExpand(postId: string) {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }
  async function deleteComment(postId: string, commentId: string) {
    try {
      await api.delete(`/api/community/comments/${commentId}`)

      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(
          c => c._id !== commentId
        )
      }))

      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? { ...p, commentsCount: p.commentsCount - 1 }
            : p
        )
      )

      toast.success("Comment deleted")
    } catch {
      toast.error("Failed to delete comment")
    }
  }

  async function loadComments(postId: string) {
    try {
      const res = await api.get(
        `/api/community/posts/${postId}/comments`
      )
      setComments(prev => ({
        ...prev,
        [postId]: res.data.comments
      }))
    } catch {
      toast.error("Failed to load comments")
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
  async function submitComment(postId: string) {
    const text = commentText[postId]
    if (!text || !text.trim()) return

    try {
      setSubmitting(prev => ({ ...prev, [postId]: true }))

      const res = await api.post(
        `/api/community/posts/${postId}/comments`,
        { message: text.trim() }
      )

      setComments(prev => ({
        ...prev,
        [postId]: [res.data.comment, ...(prev[postId] || [])]
      }))

      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? { ...p, commentsCount: p.commentsCount + 1 }
            : p
        )
      )

      setCommentText(prev => ({ ...prev, [postId]: "" }))
    } catch {
      toast.error("Failed to post comment")
    } finally {
      setSubmitting(prev => ({ ...prev, [postId]: false }))
    }
  }

  async function createPost() {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body required")
      return
    }

    try {
      const res = await api.post("/api/community/posts", {
        title,
        body,
        tags: tags
          .split(",")
          .map(t => t.trim())
          .filter(Boolean)
      })

      setPosts(prev => [res.data.post, ...prev])
      setShowCreate(false)
      setTitle("")
      setBody("")
      setTags("")
      toast.success("Post published")
    } catch {
      toast.error("Failed to publish post")
    }
  }

  async function vote(id: string, type: "up" | "down") {
    try {
      const res = await api.post(
        `/api/community/posts/${id}/vote`,
        { type }
      )

      setPosts(prev =>
        prev.map(p =>
          p._id === id
            ? {
              ...p,
              upvotes: res.data.upvotes,
              downvotes: res.data.downvotes,
              myVote: res.data.myVote
            }
            : p
        )
      )



    } catch {
      toast.error("Vote failed")
    }
  }



  return (
    <section className="font-geist px-8 pt-8 pb-20 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Community Discussions
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Share ideas, strategies, and insights with ZERO builders
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      <div className="flex gap-2">
        {SORTS.map(s => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition cursor-pointer ${sort === s.id
                ? "bg-white text-black"
                : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
            >
              <Icon className="w-4 h-4" />
              {s.label}
            </button>
          )
        })}
      </div>

      <div className="space-y-4">

        {!loading && posts.length === 0 && (
          <p className="text-white/40 text-sm">
            No discussions yet. Start one.
          </p>
        )}

        <AnimatePresence>
          {posts.map(post => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 flex gap-5"
            >


              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() =>
                      navigate(`/u/${post.author.profileSlug}`)
                    }
                    className="flex items-center gap-2 text-white/80 hover:text-white font-medium transition cursor-pointer"
                  >
                    <img
                      src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${post.author.profileSlug}`}
                      className="w-6 h-6 rounded-full border border-white/20"
                    />
                    {post.author.name}
                  </button>


                  <span className="text-white/30">•</span>

                  <span className="text-white/40">
                    {timeAgo(post.createdAt)}
                  </span>


                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <h2
                    onClick={() =>
                      navigate(`/discussions/${post._id}`)
                    }
                    className="text-lg font-semibold tracking-tight hover:text-white transition cursor-pointer"
                  >
                    {post.title}
                  </h2>



                  {post.tags.map(t => (
                    <span
                      key={t}
                      className="text-xs px-2 py-1 rounded border border-white/20 text-white/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="text-white/50 text-sm">
                  <p className={expandedPosts[post._id] ? "" : "line-clamp-3"}>
                    {post.body}
                  </p>

                  {post.body.length > 180 && (
                    <button
                      onClick={() => toggleExpand(post._id)}
                      className="mt-1 text-xs text-white/60 hover:text-white transition cursor-pointer"
                    >
                      {expandedPosts[post._id] ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>



                <div className="flex items-center justify-between pt-3  ">
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <button
                      onClick={() => vote(post._id, "up")}
                      className={`flex items-center gap-1 transition cursor-pointer ${post.myVote === "up"
                        ? "text-green-400"
                        : "text-white/50 hover:text-white"
                        }`}
                    >
                      <ArrowBigUp className="w-4 h-4" />
                      {post.upvotes}
                    </button>



                    <button
                      onClick={() => vote(post._id, "down")}
                      className={`flex items-center gap-1 transition cursor-pointer ${post.myVote === "down"
                        ? "text-red-400"
                        : "text-white/50 hover:text-white"
                        }`}
                    >
                      <ArrowBigDown className="w-4 h-4" />
                      {post.downvotes}
                    </button>



                    <button
                      onClick={() => toggleComments(post._id)}
                      className="flex items-center gap-1 hover:text-white transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {post.commentsCount}
                    </button>
                  </div>
                </div>
                {openComments === post._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-4"
                  >
                    {/* Comment Input */}
                    <div className="flex gap-3">
                      <img
                        src={`https://api.dicebear.com/6.x/thumbs/svg?seed=me`}
                        className="w-8 h-8 rounded-full border border-white/20"
                      />

                      <div className="flex-1 relative">
                        <textarea
                          value={commentText[post._id] || ""}
                          onChange={e =>
                            setCommentText(prev => ({
                              ...prev,
                              [post._id]: e.target.value
                            }))
                          }
                          placeholder="Write a comment..."
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-16 text-sm outline-none resize-none scrollbar-hide"
                        />

                        <button
                          disabled={submitting[post._id]}
                          onClick={() => submitComment(post._id)}
                          className="absolute top-2 right-2 px-3 py-1.5 rounded-md bg-white text-black text-xs hover:bg-white/90 transition disabled:opacity-50 cursor-pointer"
                        >
                          {submitting[post._id] ? "Posting..." : "Post"}
                        </button>
                      </div>

                    </div>

                    <div className=" p-4  gap-3  space-y-3 ">
                      {(comments[post._id] || [])
                        .slice(0, expanded[post._id] ? undefined : 5)
                        .map(c => (
                          <div
                            key={c._id}
                            className="flex gap-3 bg-white/5 border border-white/10 rounded-lg p-3"
                          >
                            <img
                              src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${c.author.profileSlug}`}
                              className="w-7 h-7 rounded-full border border-white/20"
                            />

                            <div className="flex-1 gap-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                  <span>{c.author.name}</span>
                                  <span className="text-white/30">•</span>
                                  <span>{timeAgo(c.createdAt)}</span>
                                </div>


                                {String(c.author._id) === String(myUserId) && (

                                  <button
                                    onClick={() => deleteComment(post._id, c._id)}
                                    className="text-xs text-red-400 hover:text-red-300 transition cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>

                              <p className="text-sm text-white/70">
                                {c.message}
                              </p>
                            </div>
                          </div>
                        ))}



                      {(comments[post._id]?.length || 0) > 5 &&
                        !expanded[post._id] && (
                          <button
                            onClick={() =>
                              setExpanded(prev => ({
                                ...prev,
                                [post._id]: true
                              }))
                            }
                            className="text-xs text-white/50 hover:text-white transition cursor-pointer"
                          >
                            Load more comments
                          </button>
                        )}
                    </div>
                  </motion.div>
                )}



              </div>
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
              <h2 className="text-lg font-semibold">
                Create Discussion
              </h2>

              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              />

              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your thoughts..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none resize-none scrollbar-hide"
              />

              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Tags, comma separated"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={createPost}
                  className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition cursor-pointer"
                >
                  Publish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
