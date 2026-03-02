import { useEffect, useState, useCallback } from "react"

type UseKeyboardNavOptions = {
    itemCount: number
    onOpen: (index: number) => void
    onToggle: (index: number) => void
    enabled?: boolean
}

export function useKeyboardNav({
    itemCount,
    onOpen,
    onToggle,
    enabled = true
}: UseKeyboardNavOptions) {
    const [activeIndex, setActiveIndex] = useState(-1)
    const [showHelp, setShowHelp] = useState(false)

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!enabled || itemCount === 0) return

            const tag = (e.target as HTMLElement)?.tagName
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

            switch (e.key) {
                case "j":
                    e.preventDefault()
                    setActiveIndex((prev) => Math.min(prev + 1, itemCount - 1))
                    break
                case "k":
                    e.preventDefault()
                    setActiveIndex((prev) => Math.max(prev - 1, 0))
                    break
                case "Enter":
                    if (activeIndex >= 0 && activeIndex < itemCount) {
                        e.preventDefault()
                        onOpen(activeIndex)
                    }
                    break
                case "s":
                    if (activeIndex >= 0 && activeIndex < itemCount) {
                        e.preventDefault()
                        onToggle(activeIndex)
                    }
                    break
                case "?":
                    e.preventDefault()
                    setShowHelp((prev) => !prev)
                    break
            }
        },
        [enabled, itemCount, activeIndex, onOpen, onToggle]
    )

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleKeyDown])

    useEffect(() => {
        setActiveIndex(-1)
    }, [itemCount])

    useEffect(() => {
        if (activeIndex >= 0) {
            const el = document.querySelector(`[data-kb-index="${activeIndex}"]`)
            el?.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
    }, [activeIndex])

    return { activeIndex, showHelp, setShowHelp }
}
