import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-center max-w-md space-y-6"
            >
                <div className="relative inline-block">
                    <span className="text-[10rem] sm:text-[12rem] font-geist font-bold leading-none bg-gradient-to-b from-white/90 to-white/10 bg-clip-text text-transparent select-none">
                        404
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent blur-3xl rounded-full -z-10" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-geist font-semibold tracking-tight">
                        Page not found
                    </h1>
                    <p className="text-sm sm:text-base text-white/50 font-geist leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-sm font-geist text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>

                    <Link
                        to="/"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-geist font-medium hover:bg-white/90 transition"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
