import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { syncViaFetch, fetchCloudGraphData } from '../cloudSync'
import type { CloudSyncPayload } from '../cloudSync'

// Mock the supabase module
vi.mock('../supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            upsert: vi.fn().mockResolvedValue({ error: null }),
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
                }))
            }))
        })),
        auth: {
            refreshSession: vi.fn().mockResolvedValue({
                data: { session: { access_token: 'refreshed_token' } }
            })
        }
    }
}))

vi.mock('../logger', () => ({
    default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() }
}))

const MOCK_URL = 'https://test.supabase.co'
const MOCK_KEY = 'test-anon-key'

vi.stubEnv('VITE_SUPABASE_URL', MOCK_URL)
vi.stubEnv('VITE_SUPABASE_ANON_KEY', MOCK_KEY)

describe('cloudSync', () => {
    const originalFetch = globalThis.fetch

    beforeEach(() => {
        vi.restoreAllMocks()
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
    })

    describe('syncViaFetch', () => {
        const payload: CloudSyncPayload = {
            id: 'user-123',
            positions: { 'n1': { x: 10, y: 20 } },
        }

        it('sends POST to the correct URL with merge-duplicates', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })

            await syncViaFetch(payload, 'my-token')

            expect(globalThis.fetch).toHaveBeenCalledWith(
                `${MOCK_URL}/rest/v1/user_graph_data`,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer my-token',
                        'Prefer': 'resolution=merge-duplicates',
                    }),
                    body: JSON.stringify(payload)
                })
            )
        })

        it('returns true on success', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
            const result = await syncViaFetch(payload, 'token')
            expect(result).toBe(true)
        })

        it('throws on non-ok response that is not 401', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                text: async () => 'Server Error'
            })

            await expect(syncViaFetch(payload, 'token'))
                .rejects.toThrow('Direct Fetch Error (500): Server Error')
        })

        it('uses anon key as fallback when token is empty', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
            await syncViaFetch(payload, '')

            const call = vi.mocked(globalThis.fetch).mock.calls[0]
            const headers = (call[1] as Record<string, unknown>).headers as Record<string, string>
            expect(headers['Authorization']).toBe(`Bearer ${MOCK_KEY}`)
        })
    })

    describe('fetchCloudGraphData', () => {
        it('returns null when no data exists', async () => {
            // The supabase mock returns { data: null, error: null }, then REST fallback
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => []
            })

            const result = await fetchCloudGraphData('user-123', 'access_token')
            expect(result).toBeNull()
        })

        it('returns data from REST fallback when client returns null', async () => {
            const mockCloudData = {
                id: 'user-123',
                positions: { n1: { x: 1, y: 2 } },
                custom_colors: null,
                filters: null,
                hidden_dbs: null,
                hide_isolated: false,
                notion_token: 'secret'
            }

            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => [mockCloudData]
            })

            const result = await fetchCloudGraphData('user-123', 'access_token')
            expect(result).toEqual(mockCloudData)
        })
    })
})
