import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OpLabAPIService, OpLabAPIError, API_CONFIG } from '../opLabAPI'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('OpLabAPIService error handling', () => {
  let service

  beforeEach(() => {
    API_CONFIG.baseURL = '/api'
    service = new OpLabAPIService('token')
    mockFetch.mockReset()
  })

  it('throws OpLabAPIError on network failure', async () => {
    const error = OpLabAPIError.networkError('fail')
    mockFetch.mockRejectedValueOnce(error)
    await expect(
      service.executeRequest({ endpoint: '/test', options: { method: 'GET' } })
    ).rejects.toBe(error)
  })

  it('throws error on invalid JSON format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Bad JSON'))
    })
    await expect(
      service.executeRequest({ endpoint: '/test', options: { method: 'GET' } })
    ).rejects.toBeInstanceOf(Error)
  })
})
