import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the logger so it doesn't pollute test output
vi.mock('../logger', () => ({
    default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() }
}))

describe('fetchNotionData', () => {
    const originalFetch = globalThis.fetch

    beforeEach(() => {
        vi.restoreAllMocks()
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
    })

    it('calls the Edge Function URL with POST and correct headers/body', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({
                databases: [{ id: 'db-1', title: 'Test DB', properties: [] }],
                relations: []
            })
        }
        globalThis.fetch = vi.fn().mockResolvedValue(mockResponse)

        // Dynamic import to capture the module's SUPABASE_URL
        const { fetchNotionData } = await import('../notion')
        await fetchNotionData('notion_token_123', 'sb_access_token_456')

        expect(globalThis.fetch).toHaveBeenCalledTimes(1)
        const [url, options] = vi.mocked(globalThis.fetch).mock.calls[0]
        const opts = options as Record<string, unknown>
        const headers = opts.headers as Record<string, string>

        // Verify it hits the notion-sync endpoint
        expect(url).toContain('/functions/v1/notion-sync')
        expect(opts.method).toBe('POST')
        expect(headers['Authorization']).toBe('Bearer sb_access_token_456')
        expect(headers['Content-Type']).toBe('application/json')
        expect(JSON.parse(opts.body as string)).toEqual({ notion_token: 'notion_token_123' })
    })

    it('returns databases and relations on success', async () => {
        const mockData = {
            databases: [{ id: 'db-1', title: 'Tasks', properties: [] }],
            relations: [{ source: 'db-1', target: 'db-2' }]
        }
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData
        })

        const { fetchNotionData } = await import('../notion')
        const result = await fetchNotionData('token', 'access_token')
        expect(result.databases).toEqual(mockData.databases)
        expect(result.relations).toEqual(mockData.relations)
    })

    it('returns empty arrays when response has null fields', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ databases: null, relations: null })
        })

        const { fetchNotionData } = await import('../notion')
        const result = await fetchNotionData('token', 'access_token')
        expect(result.databases).toEqual([])
        expect(result.relations).toEqual([])
    })

    it('throws specific error on 401 response', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: async () => ({ error: 'Invalid token' })
        })

        const { fetchNotionData } = await import('../notion')
        await expect(fetchNotionData('bad_token', 'access'))
            .rejects.toThrow('Invalid token')
    })

    it('throws generic error on non-401 failure', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: async () => ({ error: 'Server crashed' })
        })

        const { fetchNotionData } = await import('../notion')
        await expect(fetchNotionData('token', 'access'))
            .rejects.toThrow('Error de sincronización (500): Server crashed')
    })

    it('throws on network error', async () => {
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

        const { fetchNotionData } = await import('../notion')
        await expect(fetchNotionData('token', 'access'))
            .rejects.toThrow('Network error')
    })
})
