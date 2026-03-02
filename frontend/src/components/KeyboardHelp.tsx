import { motion, AnimatePresence } from "framer-motion"
import { Keyboard } from "lucide-react"

const SHORTCUTS = [
    { key: "j", desc: "Next problem" },
    { key: "k", desc: "Previous problem" },
    { key: "Enter", desc: "Open problem" },
    { key: "s", desc: "Toggle solved" },
    { key: "?", desc: "Toggle this help" }
]

export default function KeyboardHelp({
    visible,
    onClose
}: {
    visible: boolean
    onClose: () => void
}) {
    return (
        <div className="hidden lg:block">
            <button
                onClick={onClose}
                className="fixed bottom-8 right-8 z-50 p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white/60 hover:text-white hover:bg-white/15 transition cursor-pointer"
                title="Keyboard shortcuts (?)"
            >
                <Keyboard className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-22 right-8 z-50 w-56 rounded-xl border border-white/15 bg-black/90 backdrop-blur-xl p-4 space-y-2 shadow-2xl"
                    >
                        <p className="text-xs text-white/50 tracking-wide mb-2">
                            KEYBOARD SHORTCUTS
                        </p>
                        {SHORTCUTS.map((s) => (
                            <div
                                key={s.key}
                                className="flex items-center justify-between text-sm"
                            >
                                <span className="text-white/60">{s.desc}</span>
                                <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white/80 text-xs font-mono">
                                    {s.key}
                                </kbd>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
