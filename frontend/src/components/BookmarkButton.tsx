import { useState, useEffect } from "react"
import { Bookmark } from "lucide-react"
import { api } from "../api/client"

type Props = {
    problemId: string
}

export default function BookmarkButton({ problemId }: Props) {
    const [bookmarked, setBookmarked] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/api/bookmarks/${problemId}`)
            .then((res) => setBookmarked(res.data?.bookmarked || false))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [problemId])

    function toggle(e: React.MouseEvent) {
        e.stopPropagation()
        const prev = bookmarked
        setBookmarked(!prev)
        api.post("/api/bookmarks/toggle", { problemId }).catch(() => setBookmarked(prev))
    }

    if (loading) return null

    return (
        <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title={bookmarked ? "Remove bookmark" : "Bookmark this problem"}
        >
            <Bookmark
                className={`w-5 h-5 transition ${bookmarked
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-white/30 hover:text-white/60"
                    }`}
            />
        </button>
    )
}
