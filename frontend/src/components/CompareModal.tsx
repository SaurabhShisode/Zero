import { motion, AnimatePresence } from "framer-motion"
import { X, BarChart2 } from "lucide-react"

type CompareUser = {
    name: string
    profileSlug: string
    streak: {
        current: number
        max: number
    }
    solvedTotal?: number
}

type Props = {
    visible: boolean
    onClose: () => void
    you: CompareUser | null
    friend: CompareUser | null
}

function StatBar({ label, youVal, friendVal, color }: {
    label: string
    youVal: number
    friendVal: number
    color: string
}) {
    const max = Math.max(youVal, friendVal, 1)

    return (
        <div className="space-y-2">
            <p className="text-xs text-white/50">{label}</p>
            <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-white/60 w-12 text-right">{youVal}</span>
                    <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(youVal / max) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${color}`}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-white/60 w-12 text-right">{friendVal}</span>
                    <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(friendVal / max) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                            className="h-full rounded-full bg-white/30"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CompareModal({ visible, onClose, you, friend }: Props) {
    if (!you || !friend) return null

    return (
        <AnimatePresence>
            {visible && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0a0a0a] backdrop-blur-xl p-6 space-y-6 shadow-2xl">

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-white/60" />
                                    <h3 className="text-lg font-semibold">Comparison</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                                >
                                    <X className="w-5 h-5 text-white/60" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                                    <img
                                        src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${you.profileSlug}`}
                                        className="w-12 h-12 rounded-lg mx-auto mb-2"
                                    />
                                    <p className="text-sm font-medium text-white/90 truncate">{you.name}</p>
                                    <p className="text-xs text-blue-400">You</p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                                    <img
                                        src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${friend.profileSlug}`}
                                        className="w-12 h-12 rounded-lg mx-auto mb-2"
                                    />
                                    <p className="text-sm font-medium text-white/90 truncate">{friend.name}</p>
                                    <p className="text-xs text-white/40">@{friend.profileSlug}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <StatBar
                                    label="Current Streak"
                                    youVal={you.streak.current}
                                    friendVal={friend.streak.current}
                                    color="bg-orange-500"
                                />
                                <StatBar
                                    label="Max Streak"
                                    youVal={you.streak.max}
                                    friendVal={friend.streak.max}
                                    color="bg-purple-500"
                                />
                                {you.solvedTotal !== undefined && friend.solvedTotal !== undefined && (
                                    <StatBar
                                        label="Total Solved"
                                        youVal={you.solvedTotal}
                                        friendVal={friend.solvedTotal}
                                        color="bg-green-500"
                                    />
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-2.5 rounded-lg bg-white/10 text-sm text-white/70 hover:bg-white/15 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
