import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

type DailyProblem = {
  _id: string;
  skill: string;
  problem: {
    _id: string;
    title: string;
    link: string;
    difficulty: "Easy" | "Medium" | "Hard";
  };
};



export default function DailyView() {
    const [daily, setDaily] = useState<DailyProblem[]>([]);
    const [loading, setLoading] = useState(false);
    const [solved, setSolved] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api
            .get("/api/daily")
            .then((res) => setDaily(res.data.daily))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="space-y-8 font-geist mx-10 mt-10 scrollbar-hide">


            <h1 className="text-xl font-semibold">
                Today’s Problems
            </h1>

            {loading && (
                <p className="text-white/40">
                    Loading daily problems...
                </p>
            )}

            {!loading && daily.length === 0 && (
                <p className="text-white/40">
                    No daily problems yet. Check back tomorrow.
                </p>
            )}

            {daily.map((item, index) => (
                <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                    className="relative mt-8 flex justify-center"
                >
                    <div className="relative group w-full ">
                        <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

                        <div
                            onClick={() => navigate(`/problems/${item.problem._id}`)}

                            className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl text-left cursor-pointer"
                        >




                            <div className="p-6 space-y-6">

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex text-[11px] uppercase tracking-wide text-white/60 border border-white/20 px-2 py-0.5 rounded">
                                            {item.skill}
                                        </span>

                                        <span
                                            className={`inline-flex text-[11px] uppercase tracking-wide px-2 py-0.5 rounded border
      ${item.problem.difficulty === "Easy"
                                                    ? "text-green-400 border-green-400/30 bg-green-400/10"
                                                    : item.problem.difficulty === "Medium"
                                                        ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                                                        : "text-red-400 border-red-400/30 bg-red-400/10"
                                                }
    `}
                                        >
                                            {item.problem.difficulty}
                                        </span>
                                    </div>


                                    <div className="flex items-center gap-8 flex-wrap">

                                        <Link
                                           to={`/problems/${item.problem._id}`}

                                            className="text-lg text-white font-medium tracking-tight hover:underline"
                                        >
                                            {item.problem.title}
                                        </Link>

                                        <a
                                            href={item.problem.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-sm text-white/50 hover:text-white transition"
                                        >

                                            Open platform ↗
                                        </a>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSolved((prev) => ({
                                                    ...prev,
                                                    [item._id]: !prev[item._id]
                                                }));
                                            }}
                                            className="flex items-center gap-2 text-sm text-white/60 select-none cursor-pointer ml-auto"
                                        >


                                            <span
                                                className={`
                          h-5 w-5 rounded-md
                          border border-white/30
                          flex items-center justify-center
                          transition
                          ${solved[item._id] ? "bg-white border-white" : "bg-transparent"}
                        `}
                                            >
                                                {solved[item._id] && (
                                                    <svg
                                                        className="h-3 w-3 text-black"
                                                        viewBox="0 0 20 20"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                    >
                                                        <path d="M5 10l3 3 7-7" />
                                                    </svg>
                                                )}
                                            </span>
                                            Mark solved
                                        </button>

                                    </div>
                                </div>



                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </section>
    );
}
