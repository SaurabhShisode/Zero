import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from 'lucide-react';
import zeroLogo from "/icons/zero.svg"

const faqs = [
  {
    q: "What is Zero built for?",
    a: "Zero is designed for students and engineers preparing for technical interviews who want a calm, focused system instead of endless problem lists and random grinding."
  },
  {
    q: "How is Zero different from LeetCode or practice sheets?",
    a: "Zero gives you one carefully selected problem per day based on your chosen topics and difficulty, helping you build consistency and deep thinking rather than chasing volume."
  },
  {
    q: "Can I choose what topics I practice?",
    a: "Yes. You configure your focus areas like DSA, system design, or SQL, and Zero curates daily problems aligned with your goals."
  },
  {
    q: "Do I need to solve every day for it to work?",
    a: "Consistency is the core idea. Even one problem a day compounds into strong problem solving habits and real interview confidence over time."
  },
  {
    q: "Does Zero help with understanding solutions?",
    a: "Yes. Zero encourages you to explain your approach before coding and learn from discussions so you build clarity, not just correct answers."
  },
  {
    q: "Is Zero free to use?",
    a: "Zero offers a free experience with core features and optional upgrades for advanced tracking, curated roadmaps, and deeper insights."
  }
];

export default function Landing() {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showStickyLogin, setShowStickyLogin] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const [solved, setSolved] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (ctaRef.current) {
      const rect = ctaRef.current.getBoundingClientRect();
      setShowStickyLogin(rect.bottom < 0);
    }

    setLastScrollY(currentScrollY);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative min-h-screen overflow-hidden">
       

        <div className="absolute  inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#0f172a] to-black" />


        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

        <nav className="relative z-20 w-full">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center gap-10">
            <div className="flex items-center">
              <img
                src={zeroLogo}
                alt="Zero logo"
                className="h-15 w-15 "
              />


              <p className=" text-2xl text-white font-geist ">zero</p>
            </div>

            <div className="flex gap-6 items-center text-sm font-geist">
              <button
                onClick={() => scrollToSection("home")}
                className="text-white/60 hover:text-white transition hover:bg-white/10 hover:backdrop-blur p-2 rounded-md cursor-pointer"
              >

                Home
              </button>

              <button
                onClick={() => scrollToSection("faqs")}
                className="text-white/60 hover:text-white transition hover:bg-white/10 hover:backdrop-blur p-2 rounded-md cursor-pointer"
              >
                FAQs
              </button>

              <button
                onClick={() => scrollToSection("why-zero")}
                className="text-white/60 hover:text-white transition hover:bg-white/10 hover:backdrop-blur p-2 rounded-md cursor-pointer"
              >
                Why Zero
              </button>
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
    active:translate-y-0 hover:scale-106 flex items-center gap-1
  "
              >
                Start with
                Zero
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

      <section id="why-zero" className="relative bg-black text-white py-28 mt-24">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="font-geist text-6xl mb-20">Four ways we make your
            <br /> preparations better</h1>

          <div className="grid md:grid-cols-2 md:grid-rows-2 gap-16 font-geist">


            <div className="relative flex items-end p-8 bg-[#314d8d] rounded-4xl border border-white/10 overflow-hidden">


              <div className="absolute top-24 right-[-68px] w-[440px]">


                <div className="absolute -top-6 -left-6 w-[360px] rounded-xl border border-white/10 bg-[#1b2436]/80 backdrop-blur-md shadow-md z-0">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                    <span className="h-3 w-3 rounded-full bg-red-500/40" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/40" />
                    <span className="h-3 w-3 rounded-full bg-green-500/40" />
                  </div>

                  <pre className="px-4 py-3 text-sm font-mono text-white/50 leading-relaxed">
                    {`// daily discipline
for (day in journey) {
  practice(day);
  reflect(day);
}`}
                  </pre>
                </div>


                <div className="relative rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-lg z-10">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                    <span className="h-3 w-3 rounded-full bg-red-500/70" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <span className="h-3 w-3 rounded-full bg-green-500/70" />
                  </div>

                  <pre className="px-4 py-3 text-base font-mono text-white/70 leading-relaxed">
                    {`function stayInterviewReady(day) {
  if (!practice(day)) return false;

  explainBeforeCode();
  solveWithIntent();

  return confidence++;
}`}
                  </pre>
                </div>
              </div>


              <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#0f172a]/90 z-20 to-transparent" />


              <h2 className="relative z-10 text-4xl md:text-5xl font-semibold leading-tight  z-24">
                <span className="text-white/30">
                  Everything You <br /> Need To <br />
                </span>
                <span className="text-white">
                  Stay Interview-Ready
                </span>
              </h2>
            </div>




            <div className="flex flex-col gap-6 p-8 bg-white/10 backdrop-blur-sm border border-white/10 rounded-4xl relative overflow-hidden font-geist">


              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40 pointer-events-none" />


              <div className="relative">
                <h3 className="text-lg font-medium text-white">
                  Daily focused practice
                </h3>
                <p className="text-white/50 text-sm mt-1">
                  One problem. Clear thinking. Real progress.
                </p>
              </div>
              <p className="relative text-white/60 text-lg leading-relaxed max-w-md">
                Zero helps you build interview confidence through focused daily practice,
                clear thinking, and reflection without overwhelm or burnout.
              </p>


              <div className="relative rounded-2xl bg-white/90 text-black shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden right-[-40px] top-20">

                <div className="flex items-center gap-2 px-4 py-3 border-b border-black/10 bg-white">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                </div>


                <div className="p-5 space-y-4">

                  <div>
                    <h4 className="font-semibold text-base">
                      Today’s Problem
                    </h4>
                    <p className="text-sm ">
                      System Design · High level · Architecture
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/5 px-4 py-3 text-sm">
                    Design a URL shortening service
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-black/50">
                      Explain before coding
                    </span>

                    <button className="px-3 py-1.5 rounded-md bg-black text-white text-xs font-medium hover:bg-black/90 transition">
                      Start
                    </button>
                  </div>
                </div>
              </div>


            </div>



            <div className="space-y-6  p-8  bg-white/10  rounded-4xl bg-blur-sm border border-white/10 relative overflow-hidden font-geist">
              <h3 className="text-xl font-semibold tracking-tight">
                Practice what interviews actually test
              </h3>

              <p className="text-white/60 leading-relaxed max-w-lg">
                Zero gives you one carefully chosen problem each day, aligned with real
                interview patterns across DSA, logic, and problem solving. You decide what
                topics and difficulty you want to focus on.
              </p>




              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                className="relative mt-6 top-24 "
              >
                <div className="relative group max-w-lg ">
                  <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

                  <div className="relative rounded-2xl border border-white/15 
                  bg-[#122244] backdrop-blur-xl text-sm text-white/70 ">
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


            <div className="relative p-8 bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden font-geist">

              <h3 className="text-xl font-semibold tracking-tight mb-6">
                A consistency-first learning loop
              </h3>

              <p className="text-white/60 leading-relaxed max-w-lg mb-12">
                Zero is designed as a simple daily loop that builds clarity, discipline,
                and confidence until interviews feel natural.
              </p>

              <div className="relative rounded-2xl bg-white/80 text-black shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden right-10 top-16">


                <div className="flex items-center gap-2 px-4 py-3 border-b border-black/10 bg-white/90">
                  <span className="h-3 w-3 rounded-full bg-red-500/60" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/60" />
                  <span className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>


                <div className="p-5 space-y-4 text-sm">

                  <div>
                    <h4 className="font-semibold text-base">
                      Learn from discussions
                    </h4>
                    <p className=" text-sm">
                      Compare approaches and edge cases
                    </p>
                  </div>


                  <div className="space-y-3">
                    <div className="flex gap-3 items-start bg-black/5 rounded-lg px-3 py-2">
                      <div className="h-6 w-6 rounded-full bg-black/20" />
                      <p className=" leading-snug">
                        Sliding window works best when you track last seen indices.
                      </p>
                    </div>

                    <div className="flex gap-3 items-start bg-black/5 rounded-lg px-3 py-2">
                      <div className="h-6 w-6 rounded-full bg-black/20" />
                      <p className=" leading-snug">
                        HashMap gives O(n), brute force times out.
                      </p>
                    </div>
                  </div>



                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-black/50">
                      Reflect before moving on
                    </span>

                    <button className="px-3 py-1.5 rounded-md border border-black/20 text-xs font-medium hover:bg-black/5 transition">
                      View all
                    </button>
                  </div>
                </div>
              </div>

            </div>


          </div>

        </div>
      </section>



      <section className="relative bg-black text-white py-32">
        <div className=" mx-30 px-8 text-center">

          <h2 className="text-4xl md:text-6xl font-geist tracking-tight">
            Daily practice in <span className="text-white/40">3 steps</span>
          </h2>

          <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto leading-relaxed font-geist">
            A focused daily loop that turns clear thinking and repetition into <br />lasting interview readiness.
          </p>


          <div className="relative mt-20">

            <div className="grid md:grid-cols-3 gap-28 items-start">

              <div className="group relative">
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] h-60" />
                <h3 className="mt-6 text-left font-medium text-4xl font-geist">
                  <span className="text-white/40 mr-2">01</span>
                  Configure Zero
                </h3>
                <p className="text-white/60 mt-2 text-left text-sm leading-relaxed font-geist">
                  Select your topics, difficulty, and goals. Zero curates one focused
                  problem just for you.
                </p>
              </div>


              <div className="group relative">
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] h-60" />
                <h3 className="mt-6 text-left font-medium text-4xl font-geist">
                  <span className="text-white/40 mr-2">02</span>
                  Think clearly
                </h3>
                <p className="text-white/60 mt-2 text-left text-sm leading-relaxed font-geist">
                  Write your approach first. Zero helps you slow down and build
                  structured problem solving habits.
                </p>
              </div>


              <div className="group relative">
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] h-60" />
                <h3 className="mt-6 text-left font-medium text-4xl font-geist">
                  <span className="text-white/40 mr-2">03</span>
                  Build confidence
                </h3>
                <p className="text-white/60 mt-2 text-left text-sm leading-relaxed font-geist">
                  Compare solutions, reflect on edge cases, and lock in concepts that
                  actually show up in interviews.
                </p>
              </div>
            </div>


          </div>

        </div>
      </section>

      <section className="relative bg-black text-white py-28">
        <div className="relative flex items-center justify-center gap-2 mb-4">
          <img
            src={zeroLogo}
            alt="Zero logo"
            className="h-24 w-24"
          />
          <h1 className="font-geist text-6xl">
            Regrets.
          </h1>
        </div>

        <h1 className="font-geist text-6xl text-center mb-20">
          Build yourself with consistency.
        </h1>
      </section>

      <section className="h-120 rounded-2xl  border border-white/15 bg-white/10 backdrop-blur-sm shadow-lg overflow-hidden transition font-geist mx-20">

      </section>

      <section id="faqs" className="relative bg-black text-white py-28">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-geist  mb-16">
            Frequently asked questions
          </h2>

          <div className="space-y-4 cursor-pointer">
            {faqs.map((item, i) => {
              const isOpen = openIndex === i;

              return (
                <div
                  key={i}
                  className="rounded-2xl  border border-white/15 bg-white/10 backdrop-blur-sm shadow-lg overflow-hidden transition font-geist "
                >
                  <button
                    onClick={() =>
                      setOpenIndex(isOpen ? null : i)
                    }
                    className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
                  >
                    <span className="text-lg font-medium text-white">
                      {item.q}
                    </span>

                    <span
                      className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                      }`}
                  >
                    <div className="overflow-hidden px-6 pb-5">
                      <p className="text-white/60 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 py-32 grid md:grid-cols-2 items-center gap-16 font-geist">

          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
              Platform that helps you <br /> build consistency, not streaks.
            </h2>

            <p className=" text-lg max-w-md">
              Try Zero on your next practice session and build confidence in real time.
            </p>


          </div>

          <div className="relative h-[300px] hidden md:block overflow-hidden">


            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black via-transparent to-transparent z-10" />

            <div className="absolute top-10 right-24 flex items-center justify-center text-3xl animate-floatSlow opacity-80">
              <img
                src="/icons/java.png"
                alt="Java"
                className="w-40 h-40"
              />
            </div>

            <div className="absolute top-32 right-75 flex items-center justify-center text-3xl animate-floatMid opacity-60">
              <img
                src="/icons/javascript.png"
                alt="JavaScript"
                className="w-40 h-40"
              />
            </div>

            <div className="absolute top-36 right-0 flex items-center justify-center text-3xl animate-floatFast opacity-60">
              <img
                src="/icons/c++.png"
                alt="C++"
                className="w-40 h-40"
              />
            </div>

          </div>

        </div>

        <div className="border-t border-black/10" />

        <div className="max-w-7xl mx-auto px-10 py-20 grid md:grid-cols-4 gap-12 text-sm text-white font-geist">

          <div className="font-medium text-lg font-geist">
            Zero
          </div>

          <div className="space-y-3">
            <div className="font-medium text-white/80">
              Resources
            </div>

            {["Mobile", "Manifesto", "Press", "Bug Bounty"].map(item => (
              <div
                key={item}
                className="
        cursor-pointer
        text-white/50
        transition-all duration-200
        hover:text-white
        hover:translate-x-1
        hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]
      "
              >
                {item}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="font-medium text-white/80">
              Support
            </div>

            {["Help Center", "Contact Us"].map(item => (
              <div
                key={item}
                className="
        cursor-pointer
        text-white/50
        transition-all duration-200
        hover:text-white
        hover:translate-x-1
        hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]
      "
              >
                {item}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="font-medium text-white/80">
              Legal
            </div>

            {["Privacy Policy", "Terms of Service", "Data Processing Agreement", "Subprocessors"].map(item => (
              <div
                key={item}
                className="
        cursor-pointer
        text-white/50
        transition-all duration-200
        hover:text-white
        hover:translate-x-1
        hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]
      "
              >
                {item}
              </div>
            ))}
          </div>

        </div>
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
