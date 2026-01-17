import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { api } from "../api/client"
import { Copy, Flame, Award, UserPlus, BarChart2 } from "lucide-react"
import { useAuthStore } from "../store/authStore"

type HeatmapDay = {
  date: string
  count: number
}

type PublicUser = {
  _id: string
  name: string
  profileSlug: string
  streak: {
    current: number
    max: number
    freezeAvailable: number
  }
}


export default function ProfileView() {
  const user = useAuthStore((s) => s.user)

  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([])
  const [badges] = useState<string[]>(user?.badges || [])
  const [loading, setLoading] = useState(true)

  const [friendSlug, setFriendSlug] = useState("")
  const [compareData, setCompareData] = useState<{
    you: { streak: any }
    friend: { streak: any }
  } | null>(null)

  const [friends, setFriends] = useState<
    { _id: string; name: string; profileSlug: string }[]
  >([])
  const [showFriends, setShowFriends] = useState(false)

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api
      .get("/api/profile/heatmap")
      .then((res) => {
        const counts = res.data.counts || {}
        const days: HeatmapDay[] = []

        const today = new Date()
        for (let i = 97; i >= 0; i--) {
          const d = new Date()
          d.setDate(today.getDate() - i)
          const key = d.toISOString().slice(0, 10)

          days.push({
            date: key,
            count: counts[key] || 0
          })
        }

        setHeatmap(days)
      })
      .finally(() => setLoading(false))

    api.get("/api/profile/friends").then((res) => {
      setFriends(res.data.friends || [])
    })
  }, [])




  const copyProfileLink = () => {
    if (!user?.profileSlug) return
    const url = `${window.location.origin}/u/${user.profileSlug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const addFriend = async () => {
    if (!friendSlug.trim()) return

    try {
      await api.post("/api/profile/friends", {
        friendSlug: friendSlug.trim()
      })

      alert("Friend added successfully")
      setFriendSlug("")
    } catch {
      alert("Could not add friend")
    }
  }

  const compareFriend = async () => {
    if (!friendSlug.trim()) return

    try {
      const res = await api.get(
        `/api/profile/public/${friendSlug.trim()}`
      )

      const friendId = res.data.user._id

      const compareRes = await api.get(
        `/api/profile/compare/${friendId}`
      )

      setCompareData(compareRes.data)
    } catch {
      alert("Could not compare with friend")
    }
  }

  if (loading || !user) {
    return <p className="text-white/40 p-10">Loading profile...</p>
  }

  return (
    <section className="font-geist mx-10 mt-10 mb-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center"
      >
        <img
          src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${user.name}`}
          className="w-24 h-24 rounded-2xl shadow-xl"
        />

        <div className="space-y-1 flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.name}
          </h1>

          <p className="text-sm text-white/40">
            {user.email}
          </p>

          <div className="flex items-center gap-4 text-sm text-white/60">
            <span>
              Slug:
              <span className="ml-1 text-white/80">
                {user.profileSlug}
              </span>
            </span>

           

          </div>
        </div>

        <button
          onClick={copyProfileLink}
          className="self-start md:self-center px-4 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:text-white transition flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copied" : "Copy link"}
        </button>
      </motion.div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-2"
        >
          <div className="flex items-center gap-2 text-white/60">
            <Flame className="w-4 h-4" />
            <span className="text-sm">Current streak</span>
          </div>
          <p className="text-3xl font-semibold">
            {user.streak?.current || 0} days
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-2"
        >
          <div className="flex items-center gap-2 text-white/60">
            <Flame className="w-4 h-4" />
            <span className="text-sm">Longest streak</span>
          </div>
          <p className="text-3xl font-semibold">
            {user.streak?.max || 0} days
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-2"
        >
          <div className="flex items-center gap-2 text-white/60">
            <Flame className="w-4 h-4" />
            <span className="text-sm">Freezes left</span>
          </div>
          <p className="text-3xl font-semibold">
            {user.streak?.freezeAvailable || 0}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4"
      >
        <p className="text-sm tracking-wide text-white/40">
          Consistency heatmap
        </p>

        <div className="grid grid-cols-14 gap-1">
          {heatmap.map((day) => {
            const intensity =
              day.count === 0
                ? "bg-white/5"
                : day.count === 1
                  ? "bg-green-400/20"
                  : day.count === 2
                    ? "bg-green-400/40"
                    : "bg-green-400/70"

            return (
              <div
                key={day.date}
                title={`${day.date} · ${day.count} solves`}
                className={`h-4 w-4 rounded ${intensity}`}
              />
            )
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 text-white/60">
          <Award className="w-4 h-4" />
          <p className="text-sm tracking-wide">Badges</p>
        </div>

        {badges.length === 0 && (
          <p className="text-sm text-white/40">
            No badges yet. Stay consistent to unlock milestones.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b}
              className="text-xs px-2 py-1 rounded border border-white/20 text-white/70"
            >
              {b}
            </span>
          ))}
        </div>
      </motion.div>

       <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4"
>
  <div className="flex items-center gap-2">
    <p className="text-sm tracking-wide text-white/40">
      Friends
    </p>

    <span className="text-sm text-white/50">
      ({friends.length})
    </span>
  </div>

  {friends.length === 0 && (
    <p className="text-sm text-white/40">
      You have not added any friends yet.
    </p>
  )}

  <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide cursor-pointer">
    {friends.map((f) => (
      <div
        key={f._id}
        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${f.profileSlug}`}
            className="w-8 h-8 rounded-md"
          />

          <div className="min-w-0">
            <p className="text-sm text-white/80 font-medium truncate">
              {f.name}
            </p>
            <p className="text-xs text-white/40 truncate">
              {f.profileSlug}
            </p>
          </div>
        </div>

        <a
          href={`/u/${f.profileSlug}`}
          className="text-xs text-white/50 hover:text-white transition"
        >
          View
        </a>
      </div>
    ))}
  </div>
</motion.div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 text-white/60">
          <UserPlus className="w-4 h-4" />
          <p className="text-sm tracking-wide">Add friend</p>
        </div>

        <div className="flex gap-2">
          <input
            value={friendSlug}
            onChange={(e) => setFriendSlug(e.target.value)}
            placeholder="Enter profile slug"
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none"
          />

          <button
            onClick={addFriend}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium cursor-pointer"
          >
            Add
          </button>

          <button
            onClick={compareFriend}
            className="px-4 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:text-white transition flex items-center gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            Compare
          </button>
        </div>

        {compareData && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-white/40">You</p>
              <p className="text-lg font-semibold">
                {compareData.you.streak.current} day streak
              </p>
            </div>

            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-sm text-white/40">Friend</p>
              <p className="text-lg font-semibold">
                {compareData.friend.streak.current} day streak
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  )
}
