import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import TechOrbit from "../components/TechOrbit";
import { MessageCircle } from 'lucide-react';
export default function Landing() {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showStickyLogin, setShowStickyLogin] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const [solved, setSolved] = useState(false);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (ctaRef.current) {
      const rect = ctaRef.current.getBoundingClientRect();
      setShowStickyLogin(rect.bottom < 0);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#0f172a] to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

        <nav className="relative z-20 w-full">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center gap-10">
            <div className="text-2xl text-white font-geist font-semibold tracking-tight">
              Zero
            </div>

            <div className="flex gap-6 items-center text-sm font-geist">
              <Link to="/" className="text-white/60 hover:text-white transition hover:bg-white/10   hover:backdrop-blur p-2 rounded-md">
                Home
              </Link>
              <Link
                to="#how-it-works"
                className="text-white/60 hover:text-white transition hover:bg-white/10   hover:backdrop-blur p-2 rounded-md"
              >
                How it works
              </Link>
              <Link
                to="#why-zero"
                className="text-white/60 hover:text-white transition hover:bg-white/10   hover:backdrop-blur p-2 rounded-md"
              >
                Why Zero
              </Link>
            </div>
          </div>


        </nav>

        <div className="relative z-10 flex justify-center pt-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto px-8 text-center"
          >
            <h1 className="text-5xl text-white md:text-[84px] tracking-[0.02em] leading-tight font-garamond">
              #1 Consistency-First
              <br /> Practice Platform
            </h1>

            <p className="mt-8 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-geist">
              Zero gives you one focused problem every day.
              Built for consistency,<br /> not overwhelm.
            </p>

            <div className="mt-10 flex justify-center gap-4 font-geist">
              <Link
                ref={ctaRef}
                to="/signup"
                className="
    relative bg-white/90 text-black px-3 py-3 rounded-md font-medium
    backdrop-blur-sm
    shadow-[0_10px_30px_rgba(0,0,0,0.15)]
    transition-all duration-300 ease-out
    hover:bg-white 
    active:translate-y-0 hover:scale-106
  "
              >
                Start with Zero
              </Link>




            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
              className="relative mt-14 flex justify-center font-geist"
            >
              <div className="relative group w-full max-w-4xl">
                <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

                <div className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl font-geist text-left">

                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-2">
                        <span className="inline-flex text-[11px] uppercase tracking-wide text-white/60 border border-white/20 px-2 py-0.5 rounded text-left">
                          DSA
                        </span>

                        <div className="flex items-center gap-8 flex-wrap">
                          <Link
                            to="/problems/longest-substring-without-repeating-characters"
                            className="text-lg text-white font-medium tracking-tight hover:underline"
                          >
                            Longest Substring Without Repeating Characters
                          </Link>

                          <a
                            href="https://leetcode.com/problems/longest-substring-without-repeating-characters/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-white/50 hover:text-white transition"
                          >
                            LeetCode ↗
                          </a>
                          <button
                            type="button"
                            onClick={() => setSolved(!solved)}
                            className="flex items-center gap-2 text-sm text-white/60 select-none cursor-pointer"
                          >
                            <span
                              className={`
      h-5 w-5 rounded-md
      border border-white/30
      flex items-center justify-center
      transition
      ${solved ? "bg-white border-white" : "bg-transparent"}
    `}
                            >
                              {solved && (
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



                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-white/40 " />
                        <p className="text-xs uppercase tracking-wide text-white/40">Discussions</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-3 items-start bg-white/20 p-4 rounded-lg bg-blur-sm border border-white/10">
                          <img
                            src="/avatars/user1.png"
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-sm text-white/80 font-medium">
                              aman.dev
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed">
                              Sliding window clicks once you track last seen indices instead of counts.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start bg-white/20 p-4 rounded-lg bg-blur-sm border border-white/10">
                          <img
                            src="/avatars/user2.png"
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-sm text-white/80 font-medium">
                              codewithneha
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed">
                              Resetting the window incorrectly is the most common mistake here.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start bg-white/20 p-4 rounded-lg bg-blur-sm border border-white/10">
                          <img
                            src="/avatars/user3.png"
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-sm text-white/80 font-medium">
                              rahul.codes
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed">
                              HashMap gives linear time. Brute force fails on long strings.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/discussions/longest-substring-without-repeating-characters"
                        className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition"
                      >
                        View full discussion →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>


          </motion.div>

        </div>
      </section>

      <section className="relative bg-black text-white py-28 mt-24">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="font-geist text-6xl mb-20">Four ways we make your
            <br /> preparations better</h1>

          <div className="grid md:grid-cols-2 md:grid-rows-2 gap-16 font-geist">


            <div className="flex items-end p-8  bg-[#0f172a]  rounded-4xl bg-blur-sm border border-white/10">
          
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
                <span className="text-white/30">
                  Everything You <br /> Need To <br />
                </span>
                <span className="text-white">
                  Stay Interview-Ready
                </span>
              </h2>
            </div>

  
            <div className="flex flex-col justify-end   p-8  bg-white/10  rounded-4xl bg-blur-sm border border-white/10">
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Zero helps you build interview confidence through focused daily practice,
                clear thinking, and reflection without overwhelm or burnout.
              </p>
            </div>

      
            <div className="space-y-6  p-8  bg-white/10  rounded-4xl bg-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold tracking-tight">
                Practice what interviews actually test
              </h3>

              <p className="text-white/60 leading-relaxed max-w-lg">
                Zero gives you one carefully chosen problem each day, aligned with real
                interview patterns across DSA, logic, and problem solving. You decide what
                topics and difficulty you want to focus on.
              </p>

              <p className="text-white/60 leading-relaxed max-w-lg">
                No random grinding. No endless lists. Just focused practice, configured once,
                that compounds into real confidence over time.
              </p>

           
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                className="relative mt-6"
              >
                <div className="relative group max-w-lg">
                  <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

                  <div className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl text-sm text-white/70">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <span className="text-white font-medium">
                        Configure daily practice
                      </span>
                      <span className="text-xs text-white/40">
                        Edit anytime
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      {[
                        ["Arrays & Strings", "Medium"],
                        ["Linked Lists", "Easy"],
                        ["Sliding Window", "Medium"],
                        ["System Design", "Hard"]
                      ].map(([topic, level], i) => {
                        const enabled = i < 2;

                        return (
                          <div
                            key={topic}
                            className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5 transition"
                          >
                            <span>{topic}</span>

                            <div className="flex items-center gap-3">
                              <span className="text-xs text-white/40">
                                {level}
                              </span>

                              <div
                                className={`w-9 h-5 rounded-full relative
                        ${enabled ? "bg-white/30" : "bg-white/10"}
                      `}
                              >
                                <div
                                  className={`absolute top-1 h-3 w-3 rounded-full
                          ${enabled ? "right-1 bg-white" : "left-1 bg-white/50"}
                        `}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="px-4 py-3 border-t border-white/10 text-xs text-white/40">
                      Zero will pick one focused problem each day from your enabled topics.
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            
            <div className="relative  p-8  bg-white/10  bg-blur-sm border border-white/10 rounded-4xl">
              <h3 className="text-xl font-semibold tracking-tight mb-6">
                A consistency-first learning loop
              </h3>

              <p className="text-white/60 leading-relaxed max-w-lg mb-14">
                Zero is designed as a simple daily loop that builds clarity, discipline,
                and confidence until interviews feel natural.
              </p>

              <div className="relative grid grid-cols-3 gap-12">
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 600 400"
                  fill="none"
                >
                  <path
                    d="M100 50 L300 50 L500 50 L300 200 L500 350"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    style={{
                      strokeDasharray: 1000,
                      strokeDashoffset: 1000,
                      animation: "drawLine 2.5s ease-out forwards"
                    }}
                  />
                </svg>

                <div className="roadmap-step">
                  <span className="step-index">01</span>
                  One problem per day
                </div>

                <div className="roadmap-step">
                  <span className="step-index">02</span>
                  Explain before coding
                </div>

                <div className="roadmap-step">
                  <span className="step-index">03</span>
                  Solve with intent
                </div>

                <div className="roadmap-step col-start-2">
                  <span className="step-index">04</span>
                  Learn from discussions
                </div>

                <div className="roadmap-step col-start-3 border-white/40">
                  <span className="step-index">05</span>
                  Placement offer
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>



      <section
        id="how-it-works"
        className="max-w-5xl mx-auto px-8 py-24 "
      >
        <h2 className="font-grotesk text-2xl font-semibold text-center">
          How Zero works
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-14">
          {[
            ["Configure once", "Choose skills, difficulty, and daily time."],
            ["One problem daily", "Same curated question. No noise."],
            ["Build streaks", "Track consistency with heatmaps."]
          ].map(([title, desc], i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-xl"
            >
              <h3 className="font-grotesk font-medium">
                {i + 1}. {title}
              </h3>
              <p className="text-sm text-white/70 mt-3 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="why-zero"
        className="max-w-5xl mx-auto px-8 py-24 border-t border-white/10"
      >
        <h2 className="font-grotesk text-2xl font-semibold text-center">
          Why Zero
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mt-14">
          {[
            ["Placement focused", "Practice exactly what interviews test."],
            ["Habit over hype", "Consistency beats rankings."],
            ["Explain before code", "Thinking before typing."],
            ["No regret system", "Designed to keep regret at zero."]
          ].map(([title, desc], i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-xl"
            >
              <h3 className="font-grotesk font-medium">{title}</h3>
              <p className="text-sm text-white/70 mt-3 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-28 text-center border-t border-white/10">
        <h2 className="font-grotesk text-3xl md:text-4xl font-semibold">
          Start today. Stay consistent.
        </h2>

        <p className="text-white/70 mt-6 text-lg">
          One problem a day is enough if you never skip.
        </p>

        <Link
          to="/signup"
          className="inline-block mt-10 bg-white text-black px-10 py-3 rounded-md font-medium hover:bg-white/90 transition"
        >
          Create your Zero account
        </Link>
      </section>

      <Link
        to="/login"
        className={`fixed top-6 right-8 z-50 bg-white text-black px-6 py-2 rounded-md text-sm font-medium shadow-lg transition-all duration-300 ease-out
          ${showStickyLogin
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
          }
        `}
      >
        Start with Zero
      </Link>
    </div>
  );
}
