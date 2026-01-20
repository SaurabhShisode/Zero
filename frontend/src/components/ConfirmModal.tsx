import { motion, AnimatePresence } from "framer-motion"

type Props = {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title = "Confirm action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-2xl border border-white/15 bg-black/80 p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>

            <p className="text-sm text-white/60">
              {description}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:text-white transition cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-400 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? "Deleting..." : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
