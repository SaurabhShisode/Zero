import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bell, CheckCheck } from "lucide-react"
import { api } from "../api/client"

type NotificationItem = {
    _id: string
    type: "badge" | "streak" | "friend" | "revision"
    title: string
    body: string
    read: boolean
    createdAt: string
}

const TYPE_EMOJI: Record<string, string> = {
    badge: "🏅",
    streak: "🔥",
    friend: "👤",
    revision: "📝",
}

export default function NotificationsView() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        api
            .get("/api/notifications")
            .then((res) => setNotifications(res.data?.notifications || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    function markAllRead() {
        api.post("/api/notifications/mark-read").then(() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        })
    }

    function timeAgo(dateStr: string) {
        const now = new Date()
        const then = new Date(dateStr)
        const diffMs = now.getTime() - then.getTime()
        const diffMin = Math.floor(diffMs / 60000)
        const diffHr = Math.floor(diffMin / 60)
        const diffDay = Math.floor(diffHr / 24)

        if (diffMin < 1) return "Just now"
        if (diffMin < 60) return `${diffMin}m ago`
        if (diffHr < 24) return `${diffHr}h ago`
        if (diffDay < 7) return `${diffDay}d ago`
        return then.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    }

    const unreadCount = notifications.filter((n) => !n.read).length

    if (loading) {
        return (
            <section className="space-y-6 sm:space-y-8 font-geist mx-4 sm:mx-6 md:mx-10 mt-6 sm:mt-8 md:mt-10 mb-6 sm:mb-8 md:mb-10 text-white">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2 animate-pulse"
                >
                    <div className="h-5 sm:h-6 w-36 sm:w-48 bg-white/20 rounded" />
                    <div className="h-4 w-72 bg-white/10 rounded" />
                </motion.div>

                <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-4 sm:p-5 animate-pulse">
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 bg-white/15 rounded mt-0.5" />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="h-4 w-48 bg-white/20 rounded" />
                                            <div className="h-3 w-12 bg-white/10 rounded" />
                                        </div>
                                        <div className="h-3 w-32 bg-white/10 rounded" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section className="space-y-6 font-geist mx-4 sm:mx-6 md:mx-10 mt-6 sm:mt-8 md:mt-10 mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">

                    <h1 className="text-xl font-semibold">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            {unreadCount} new
                        </span>
                    )}
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition cursor-pointer px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
                    >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 && (
                <div className="py-16 text-center">
                    <Bell className="w-10 h-10 text-white/15 mx-auto mb-4" />
                    <p className="text-white/40 text-sm">No notifications yet</p>
                    <p className="text-white/25 text-xs mt-1">
                        You'll see badge unlocks, streak milestones, and friend updates here
                    </p>
                </div>
            )}

            <div className="space-y-2">
                {notifications.map((n, i) => (
                    <motion.div
                        key={n._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.3 }}
                        className={`rounded-xl border p-4 transition ${n.read
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-white/20 bg-white/[0.08]"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-lg mt-0.5">
                                {TYPE_EMOJI[n.type] || "📬"}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p
                                        className={`text-sm font-medium truncate ${n.read ? "text-white/60" : "text-white/90"
                                            }`}
                                    >
                                        {n.title}
                                    </p>
                                    <span className="text-[10px] text-white/30 flex-shrink-0">
                                        {timeAgo(n.createdAt)}
                                    </span>
                                </div>
                                {n.body && (
                                    <p className="text-xs text-white/40 mt-0.5">{n.body}</p>
                                )}
                            </div>
                            {!n.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
