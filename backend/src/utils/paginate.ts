export type PaginationMeta = {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export function parsePagination(
    query: Record<string, unknown>,
    defaults = { page: 1, limit: 20 }
) {
    const page = Math.max(Number(query.page) || defaults.page, 1)
    const limit = Math.min(Math.max(Number(query.limit) || defaults.limit, 1), 100)
    return { page, limit, skip: (page - 1) * limit }
}

export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit)
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    }
}
