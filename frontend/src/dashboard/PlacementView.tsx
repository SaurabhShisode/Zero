import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Layers, PlayCircle } from "lucide-react"
import {Briefcase } from "lucide-react"
import toast from "react-hot-toast"

export default function PlacementView() {
  const [company, setCompany] = useState("any")
  const [difficulty, setDifficulty] = useState("mixed")
  const [time, setTime] = useState(60)
  const [count, setCount] = useState(10)

  function startSimulation() {
    toast.success("Placement simulation starting")
  }

  return (
    <section className="font-geist px-8 pt-8 pb-20 space-y-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-semibold tracking-tight">
          Placement Arena
        </h1>
        <p className="text-white/40">
          Simulate real company assessments with timed, mixed-skill challenges.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-6">
          <div className="flex items-center gap-2 text-white/60">
            <Briefcase className="w-4 h-4" />
            <p className="text-sm tracking-wide">Simulation Setup</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/50 mb-1">
                Company Type
              </p>
              <select
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="faang">FAANG</option>
                <option value="service">Service-based</option>
                <option value="startup">Startup</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div>
              <p className="text-sm text-white/50 mb-1">
                Difficulty Mix
              </p>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="easy">Mostly Easy</option>
                <option value="mixed">Mixed</option>
                <option value="hard">Mostly Hard</option>
              </select>
            </div>

            <div>
              <p className="text-sm text-white/50 mb-1">
                Time Limit (minutes)
              </p>
              <input
                type="number"
                value={time}
                min={15}
                max={180}
                onChange={e => setTime(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <p className="text-sm text-white/50 mb-1">
                Number of Questions
              </p>
              <input
                type="number"
                value={count}
                min={5}
                max={30}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <button
            onClick={startSimulation}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition cursor-pointer"
          >
            <PlayCircle className="w-5 h-5" />
            Start Simulation
          </button>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-6">
          <div className="flex items-center gap-2 text-white/60">
            <Layers className="w-4 h-4" />
            <p className="text-sm tracking-wide">What You’ll Get</p>
          </div>

          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              Real-time countdown and autosave
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              Mixed skill and difficulty problems
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              End-session performance report
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              Streak and placement readiness score
            </li>
          </ul>
        </div>
      </motion.div>
    </section>
  )
}
