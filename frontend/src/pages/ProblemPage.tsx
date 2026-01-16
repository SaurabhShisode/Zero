import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { api } from "../api/client";

type Problem = {
  _id: string;
  title: string;
  link: string;
  difficulty: "Easy" | "Medium" | "Hard";
  skills: string[];
};

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
  const { id } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [problemRes, commentsRes] = await Promise.all([
          api.get(`/api/problems/${id}`),
          api.get(`/api/discussion/problem/${id}?page=1&limit=20`)
        ]);

        setProblem(problemRes.data.problem || problemRes.data);
        setComments(commentsRes.data.comments || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const postComment = async () => {
    if (!message.trim() || posting) return;
    setPosting(true);

    try {
      const res = await api.post(`/api/discussion/problem/${id}`, {
        message
      });

      setComments((prev) => [res.data.comment, ...prev]);
      setMessage("");
    } finally {
      setPosting(false);
    }
  };

  const loadMore = async () => {
    const next = page + 1;
    const res = await api.get(
      `/api/discussion/problem/${id}?page=${next}&limit=20`
    );

    setComments((prev) => [...prev, ...(res.data.comments || [])]);
    setPage(next);
  };

  if (loading) {
    return <p className="text-white/40 p-10">Loading problem...</p>;
  }

  if (!problem) {
    return <p className="text-white/40 p-10">Problem not found</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-4xl mx-auto mt-10 space-y-8 font-geist"
    >
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs uppercase tracking-wide px-2 py-0.5 rounded border
              ${
                problem.difficulty === "Easy"
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
              className="text-xs uppercase tracking-wide px-2 py-0.5 rounded border border-white/20 text-white/40"
            >
              {s}
            </span>
          ))}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {problem.title}
        </h1>

        <a
          href={problem.link}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-white/60 hover:text-white transition"
        >
          Open on platform ↗
        </a>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-white/40" />
          <p className="text-xs uppercase tracking-wide text-white/40">
            Discussions
          </p>
        </div>

        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c._id}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <div className="text-sm text-white/80 font-medium">
                {c.user.name}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                {c.message}
              </p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-sm text-white/40">
              No discussion yet. Share your approach or insight.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your approach or insight..."
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none"
          />

          <button
            disabled={posting}
            onClick={postComment}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium disabled:opacity-50"
          >
            Post
          </button>
        </div>

        {comments.length >= 20 && (
          <button
            onClick={loadMore}
            className="text-sm text-white/50 hover:text-white transition"
          >
            Load more
          </button>
        )}
      </div>
    </motion.section>
    </div>
  );
}
