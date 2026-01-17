import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, CircleCheckBig } from "lucide-react";
import { api } from "../api/client";
import { MoveRight } from 'lucide-react';
import { useAuthStore } from "../store/authStore";
import { Trash2 } from "lucide-react";

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

type Comment = {
  _id: string;
  message: string;
  createdAt: string;
  user: {
    name: string;
    profileSlug: string;
  };
};

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [history, setHistory] = useState<HistoryItem[]>([])

  const [problem, setProblem] = useState<Problem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [isSolved, setIsSolved] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const [problemRes, commentsRes, solvedRes] = await Promise.all([
          api.get(`/api/problems/${id}`),
          api.get(`/api/discussion/problem/${id}?page=1&limit=20`),
          api.get(`/api/solve/${id}`)
        ]);

        setProblem(problemRes.data.problem || problemRes.data);
        const initialComments = commentsRes.data.comments || [];
        setComments(initialComments);
        setHasMore(initialComments.length === 20);
        setIsSolved(Boolean(solvedRes.data.solved));
      } catch {
        setProblem(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        const [problemRes, commentsRes, solvedRes, historyRes] =
          await Promise.all([
            api.get(`/api/problems/${id}`),
            api.get(`/api/discussion/problem/${id}?page=1&limit=20`),
            api.get(`/api/solve/${id}`),
            api.get(`/api/daily/history/${id}`)
          ])

        setProblem(problemRes.data.problem || problemRes.data)

        const initialComments = commentsRes.data.comments || []
        setComments(initialComments)
        setHasMore(initialComments.length === 20)

        setIsSolved(Boolean(solvedRes.data.solved))
        setHistory(historyRes.data.history || [])
      } catch {
        setProblem(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])


  const postComment = async () => {
    if (!message.trim() || posting || !id) return;

    setPosting(true);

    try {
      const res = await api.post(`/api/discussion/problem/${id}`, {
        message
      });

      setComments((prev) => [res.data.comment, ...prev]);
      setMessage("");
    } catch {
      alert("You must be logged in to post a comment");
    } finally {
      setPosting(false);
    }
  };

  const loadMore = async () => {
    if (!id || !hasMore) return;

    const nextPage = page + 1;

    try {
      const res = await api.get(
        `/api/discussion/problem/${id}?page=${nextPage}&limit=20`
      );

      const newComments = res.data.comments || [];

      setComments((prev) => [...prev, ...newComments]);
      setPage(nextPage);
      setHasMore(newComments.length === 20);
    } catch {
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await api.delete(`/api/discussion/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      alert("Failed to delete comment");
    }
  };


  if (loading) {
    return <p className="text-white/40 p-10">Loading problem...</p>;
  }

  if (!problem) {
    return <p className="text-white/40 p-10">Problem not found</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white ">
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
                <span
                  className={`text-xs  tracking-wide px-2 py-0.5 rounded 
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
                    className="text-xs  tracking-wide px-2 py-0.5 rounded border border-white/20 text-white/40"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {problem.title}
                </h1>

                {isSolved && (
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <CircleCheckBig className="w-4 h-4" />
                    Solved
                  </span>
                )}
              </div>

              <a
                href={problem.link}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-white/60 hover:text-white transition"
              >
                Open on platform ↗
              </a>
              {history.length > 0 && (
                <div className=" py-2 flex items-center gap-2">
                  <p className="text-sm tracking-wide text-white/40">
                    This problem was a Daily Problem on:
                  </p>

                  
                    {history.map((h) => {
                      const d = new Date(h.date)
                      const day = String(d.getDate()).padStart(2, "0")
                      const month = String(d.getMonth() + 1).padStart(2, "0")
                      const year = d.getFullYear()

                      return (
                        <span
                          key={h._id}
                          className="text-sm   text-white/60"
                        >
                          {day}/{month}/{year}
                          
                        </span>
                      )
                    })}
                  
                </div>
              )}

            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-white/40" />
                <p className="text-sm tracking-wide text-white/40">
                  Discussions
                </p>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
                {[...comments]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((c) => (
                    <div
                      key={c._id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center">
                            <svg
                              className="h-4 w-4 text-white/60"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>

                          <span className="text-sm text-white/80 font-medium">
                            {c.user.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">
                            {(() => {
                              const d = new Date(c.createdAt);
                              const day = String(d.getDate()).padStart(2, "0");
                              const month = String(d.getMonth() + 1).padStart(2, "0");
                              const year = d.getFullYear();
                              let hours = d.getHours();
                              const minutes = String(d.getMinutes()).padStart(2, "0");
                              const ampm = hours >= 12 ? "pm" : "am";
                              hours = hours % 12 || 12;
                              return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
                            })()}
                          </span>

                          {user?.profileSlug === c.user.profileSlug && (
                            <button
                              onClick={() => deleteComment(c._id)}
                              className="text-white/40 hover:text-red-500 transition cursor-pointer"
                              title="Delete comment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>


                      <p className="text-sm text-white/60 leading-relaxed pl-9">
                        {c.message}
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

              <div className="flex gap-2 pt-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your approach or insight..."
                  className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none"
                />

                <button
                  disabled={posting}
                  onClick={postComment}
                  className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium disabled:opacity-50 cursor-pointer"
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>


            </div>
          </div>

          <div className="lg:col-span-3 flex">
            <div className="sticky top-10 w-full self-stretch rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 flex flex-col justify-center items-center text-center">

              <p className="text-white/40 text-lg">
                Solution not available
              </p>

              <p className="text-white/30 text-sm mt-2 max-w-md">
                Solve the problem on the platform, then return to ZERO to write your approach.
                In the future, AI-generated and peer-reviewed solutions will appear here.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
