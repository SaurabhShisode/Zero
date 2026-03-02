export type BadgeId =
    | "first-solve"
    | "streak-7"
    | "streak-30"
    | "streak-100"
    | "streak-365"
    | "solved-10"
    | "solved-50"
    | "solved-100"
    | "solved-500"
    | "easy-master"
    | "medium-master"
    | "hard-master"
    | "reviewer"
    | "community-voice"
    | "multi-skill"

export interface BadgeInfo {
    id: BadgeId
    label: string
    description: string
    emoji: string
    color: string
    bgColor: string
    borderColor: string
}

export const BADGE_MAP: Record<BadgeId, BadgeInfo> = {
    "first-solve": {
        id: "first-solve",
        label: "First Blood",
        description: "Solve your first problem",
        emoji: "🩸",
        color: "text-red-400",
        bgColor: "bg-red-400/10",
        borderColor: "border-red-400/30",
    },
    "solved-10": {
        id: "solved-10",
        label: "Getting Started",
        description: "Solve 10 problems",
        emoji: "🌱",
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        borderColor: "border-green-400/30",
    },
    "solved-50": {
        id: "solved-50",
        label: "Rising Star",
        description: "Solve 50 problems",
        emoji: "⭐",
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
        borderColor: "border-yellow-400/30",
    },
    "solved-100": {
        id: "solved-100",
        label: "Centurion",
        description: "Solve 100 problems",
        emoji: "💯",
        color: "text-orange-400",
        bgColor: "bg-orange-400/10",
        borderColor: "border-orange-400/30",
    },
    "solved-500": {
        id: "solved-500",
        label: "Legend",
        description: "Solve 500 problems",
        emoji: "🏆",
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        borderColor: "border-amber-400/30",
    },
    "streak-7": {
        id: "streak-7",
        label: "Zero Miss Week",
        description: "7-day streak",
        emoji: "🔥",
        color: "text-orange-400",
        bgColor: "bg-orange-400/10",
        borderColor: "border-orange-400/30",
    },
    "streak-30": {
        id: "streak-30",
        label: "Monthly Machine",
        description: "30-day streak",
        emoji: "🗓️",
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        borderColor: "border-blue-400/30",
    },
    "streak-100": {
        id: "streak-100",
        label: "Unstoppable",
        description: "100-day streak",
        emoji: "⚡",
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        borderColor: "border-purple-400/30",
    },
    "streak-365": {
        id: "streak-365",
        label: "Yearly Champion",
        description: "365-day streak",
        emoji: "👑",
        color: "text-yellow-300",
        bgColor: "bg-yellow-300/10",
        borderColor: "border-yellow-300/30",
    },
    "easy-master": {
        id: "easy-master",
        label: "Easy Sweep",
        description: "Solve all Easy problems",
        emoji: "🧹",
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        borderColor: "border-green-400/30",
    },
    "medium-master": {
        id: "medium-master",
        label: "Medium Crusher",
        description: "Solve all Medium problems",
        emoji: "💪",
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
        borderColor: "border-yellow-400/30",
    },
    "hard-master": {
        id: "hard-master",
        label: "Hard Destroyer",
        description: "Solve all Hard problems",
        emoji: "🔱",
        color: "text-red-400",
        bgColor: "bg-red-400/10",
        borderColor: "border-red-400/30",
    },
    "reviewer": {
        id: "reviewer",
        label: "Revision Pro",
        description: "Complete 10 revisions",
        emoji: "📝",
        color: "text-cyan-400",
        bgColor: "bg-cyan-400/10",
        borderColor: "border-cyan-400/30",
    },
    "community-voice": {
        id: "community-voice",
        label: "Community Voice",
        description: "Create 5 community posts",
        emoji: "📢",
        color: "text-pink-400",
        bgColor: "bg-pink-400/10",
        borderColor: "border-pink-400/30",
    },
    "multi-skill": {
        id: "multi-skill",
        label: "Polyglot",
        description: "Solve across 5+ skills",
        emoji: "🎯",
        color: "text-indigo-400",
        bgColor: "bg-indigo-400/10",
        borderColor: "border-indigo-400/30",
    },
}

export const ALL_BADGES: BadgeInfo[] = Object.values(BADGE_MAP)
