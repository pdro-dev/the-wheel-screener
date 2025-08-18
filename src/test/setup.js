import '@testing-library/jest-dom'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock fetch
global.fetch = vi.fn()

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  root = null
  rootMargin = ''
  thresholds = []
}
window.IntersectionObserver = IntersectionObserverMock

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scrollTo
window.scrollTo = vi.fn()

// Mock HTMLElement.getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
}))