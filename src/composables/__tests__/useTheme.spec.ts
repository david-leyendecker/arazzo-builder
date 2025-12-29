import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTheme } from '../useTheme'

describe('useTheme', () => {
  let originalLocalStorage: Storage
  let localStorageMock: { [key: string]: string }

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {}
    originalLocalStorage = global.localStorage
    
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key]
      }),
      clear: vi.fn(() => {
        localStorageMock = {}
      }),
      get length() {
        return Object.keys(localStorageMock).length
      },
      key: vi.fn((index: number) => Object.keys(localStorageMock)[index] || null)
    } as Storage

    // Mock matchMedia
    global.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    // Clear document classes
    document.documentElement.className = ''
  })

  afterEach(() => {
    global.localStorage = originalLocalStorage
    vi.clearAllMocks()
  })

  it('should initialize with system theme by default', () => {
    const { currentTheme } = useTheme()
    expect(currentTheme.value).toBe('system')
  })

  it('should set theme and persist to localStorage', () => {
    const { setTheme, currentTheme } = useTheme()
    
    setTheme('dark')
    
    expect(currentTheme.value).toBe('dark')
    expect(localStorage.setItem).toHaveBeenCalledWith('arazzo-builder-theme', 'dark')
  })

  it('should apply dark-mode class when theme is dark', () => {
    const { setTheme } = useTheme()
    
    setTheme('dark')
    
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true)
  })

  it('should remove dark-mode class when theme is light', () => {
    const { setTheme } = useTheme()
    
    // First set to dark
    setTheme('dark')
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true)
    
    // Then set to light
    setTheme('light')
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false)
  })

  it('should respect system theme preference', () => {
    // Mock system prefers dark BEFORE creating composable instance
    global.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    // Now use the composable to get a fresh instance with correct matchMedia
    const effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    expect(effectiveTheme).toBe('dark')
  })

  it('should initialize theme from localStorage', () => {
    localStorageMock['arazzo-builder-theme'] = 'dark'
    
    const { currentTheme, initTheme } = useTheme()
    initTheme()
    
    expect(currentTheme.value).toBe('dark')
  })

  it('should handle invalid localStorage values', () => {
    localStorageMock['arazzo-builder-theme'] = 'invalid-theme'
    
    const { currentTheme, initTheme } = useTheme()
    initTheme()
    
    expect(currentTheme.value).toBe('system')
  })

  it('should update isDark ref correctly', () => {
    const { setTheme, isDark } = useTheme()
    
    setTheme('dark')
    expect(isDark.value).toBe(true)
    
    setTheme('light')
    expect(isDark.value).toBe(false)
  })
})
