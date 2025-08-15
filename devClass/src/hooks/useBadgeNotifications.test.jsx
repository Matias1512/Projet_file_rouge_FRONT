import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { useBadgeNotifications } from './useBadgeNotifications'
import { AuthContext } from '../AuthContext'

// Mock axios
vi.mock('axios')

// Mock console methods
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

// Helper function to create a wrapper with AuthContext
const createWrapper = (userValue) => {
  const TestWrapper = ({ children }) => (
    <AuthContext.Provider value={{ user: userValue }}>
      {children}
    </AuthContext.Provider>
  )
  
  TestWrapper.displayName = 'TestWrapper'
  TestWrapper.propTypes = {
    children: PropTypes.node.isRequired
  }
  
  return TestWrapper
}

describe('useBadgeNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Hook Initialization', () => {
    it('initializes with correct default state', () => {
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
      expect(typeof result.current.checkForNewBadges).toBe('function')
      expect(typeof result.current.closeNotification).toBe('function')
    })

    it('returns all expected properties and functions', () => {
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      expect(result.current).toHaveProperty('newBadges')
      expect(result.current).toHaveProperty('isNotificationOpen')
      expect(result.current).toHaveProperty('checkForNewBadges')
      expect(result.current).toHaveProperty('closeNotification')
    })
  })

  describe('checkForNewBadges - Early Returns', () => {
    it('returns early when user is null', async () => {
      const wrapper = createWrapper(null)
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).not.toHaveBeenCalled()
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('returns early when user is undefined', async () => {
      const wrapper = createWrapper(undefined)
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).not.toHaveBeenCalled()
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('returns early when user has no userId', async () => {
      const wrapper = createWrapper({ name: 'John' }) // No userId property
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).not.toHaveBeenCalled()
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('returns early when user.userId is null', async () => {
      const wrapper = createWrapper({ userId: null })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).not.toHaveBeenCalled()
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('returns early when user.userId is undefined', async () => {
      const wrapper = createWrapper({ userId: undefined })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).not.toHaveBeenCalled()
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('returns early when user.userId is 0', async () => {
      const wrapper = createWrapper({ userId: 0 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).not.toHaveBeenCalled()
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('returns early when user.userId is empty string', async () => {
      const wrapper = createWrapper({ userId: '' })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).not.toHaveBeenCalled()
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })
  })

  describe('checkForNewBadges - Successful API Calls', () => {
    it('handles successful API call with new badges', async () => {
      const mockBadges = [
        { id: 1, name: 'First Badge', description: 'First achievement' },
        { id: 2, name: 'Second Badge', description: 'Second achievement' }
      ]
      
      axios.post.mockResolvedValue({ data: mockBadges })
      
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/badges/evaluate/123')
      expect(result.current.newBadges).toEqual(mockBadges)
      expect(result.current.isNotificationOpen).toBe(true)
    })

    it('handles successful API call with single badge', async () => {
      const mockBadges = [
        { id: 1, name: 'Achievement Badge', description: 'You did it!' }
      ]
      
      axios.post.mockResolvedValue({ data: mockBadges })
      
      const wrapper = createWrapper({ userId: 456 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/badges/evaluate/456')
      expect(result.current.newBadges).toEqual(mockBadges)
      expect(result.current.isNotificationOpen).toBe(true)
    })

    it('handles successful API call with no badges (empty array)', async () => {
      axios.post.mockResolvedValue({ data: [] })
      
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/badges/evaluate/123')
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('handles successful API call with null response data', async () => {
      axios.post.mockResolvedValue({ data: null })
      
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/badges/evaluate/123')
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('handles successful API call with undefined response data', async () => {
      axios.post.mockResolvedValue({ data: undefined })
      
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/badges/evaluate/123')
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('works correctly with different userId types', async () => {
      const mockBadges = [{ id: 1, name: 'Badge' }]
      axios.post.mockResolvedValue({ data: mockBadges })
      
      // Test with string userId
      const wrapper1 = createWrapper({ userId: '789' })
      const { result: result1 } = renderHook(() => useBadgeNotifications(), { wrapper: wrapper1 })

      await act(async () => {
        await result1.current.checkForNewBadges()
      })

      expect(axios.post).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/badges/evaluate/789')
      expect(result1.current.newBadges).toEqual(mockBadges)
      expect(result1.current.isNotificationOpen).toBe(true)
    })
  })

  describe('checkForNewBadges - Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      const error = new Error('Network error')
      axios.post.mockRejectedValue(error)
      
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/badges/evaluate/123')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de la vérification des nouveaux badges:', error)
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('handles API errors with different error types', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      const error = { message: 'Server error', status: 500 }
      axios.post.mockRejectedValue(error)
      
      const wrapper = createWrapper({ userId: 456 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de la vérification des nouveaux badges:', error)
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('maintains state correctly after error', async () => {
      const error = new Error('API Error')
      axios.post.mockRejectedValue(error)
      
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      // Verify initial state
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      // State should remain unchanged after error
      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })
  })

  describe('closeNotification', () => {
    it('closes notification and clears badges', async () => {
      const mockBadges = [
        { id: 1, name: 'Test Badge', description: 'Test description' }
      ]
      
      axios.post.mockResolvedValue({ data: mockBadges })
      
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      // First, get some badges
      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(result.current.newBadges).toEqual(mockBadges)
      expect(result.current.isNotificationOpen).toBe(true)

      // Then close the notification
      act(() => {
        result.current.closeNotification()
      })

      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })

    it('can be called multiple times without issues', async () => {
      const mockBadges = [{ id: 1, name: 'Badge' }]
      axios.post.mockResolvedValue({ data: mockBadges })
      
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      // Get badges first
      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(result.current.isNotificationOpen).toBe(true)

      // Close multiple times
      act(() => {
        result.current.closeNotification()
      })

      expect(result.current.isNotificationOpen).toBe(false)

      act(() => {
        result.current.closeNotification()
      })

      expect(result.current.isNotificationOpen).toBe(false)
      expect(result.current.newBadges).toEqual([])
    })

    it('works when called without having badges first', () => {
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      // Close notification without having badges
      act(() => {
        result.current.closeNotification()
      })

      expect(result.current.newBadges).toEqual([])
      expect(result.current.isNotificationOpen).toBe(false)
    })
  })

  describe('AuthContext Integration', () => {
    it('reacts to changes in user context', async () => {
      const mockBadges = [{ id: 1, name: 'Badge' }]
      axios.post.mockResolvedValue({ data: mockBadges })
      
      let user = { userId: 123 }
      const TestComponent = ({ children }) => (
        <AuthContext.Provider value={{ user }}>
          {children}
        </AuthContext.Provider>
      )
      
      TestComponent.displayName = 'TestComponent'
      TestComponent.propTypes = {
        children: PropTypes.node.isRequired
      }
      
      const { result, rerender } = renderHook(() => useBadgeNotifications(), {
        wrapper: TestComponent
      })

      // Check with first user
      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/badges/evaluate/123')

      // Change user and rerender
      user = { userId: 456 }
      rerender()

      await act(async () => {
        await result.current.checkForNewBadges()
      })

      expect(axios.post).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/badges/evaluate/456')
    })

    it('handles missing AuthContext gracefully', () => {
      // Test without AuthContext provider - this should not crash
      expect(() => {
        renderHook(() => useBadgeNotifications())
      }).toThrow() // useContext without provider should throw
    })
  })

  describe('State Management', () => {
    it('maintains state independence between multiple instances', () => {
      const wrapper = createWrapper({ userId: 123 })
      
      const { result: result1 } = renderHook(() => useBadgeNotifications(), { wrapper })
      const { result: result2 } = renderHook(() => useBadgeNotifications(), { wrapper })

      // Both should have independent initial state
      expect(result1.current.newBadges).toEqual([])
      expect(result1.current.isNotificationOpen).toBe(false)
      expect(result2.current.newBadges).toEqual([])
      expect(result2.current.isNotificationOpen).toBe(false)

      // Changes to one should not affect the other
      act(() => {
        result1.current.closeNotification()
      })

      expect(result1.current.isNotificationOpen).toBe(false)
      expect(result2.current.isNotificationOpen).toBe(false)
    })

    it('handles rapid consecutive calls correctly', async () => {
      const mockBadges = [{ id: 1, name: 'Badge' }]
      axios.post.mockResolvedValue({ data: mockBadges })
      
      const wrapper = createWrapper({ userId: 123 })
      const { result } = renderHook(() => useBadgeNotifications(), { wrapper })

      // Make multiple rapid calls
      await act(async () => {
        const promises = [
          result.current.checkForNewBadges(),
          result.current.checkForNewBadges(),
          result.current.checkForNewBadges()
        ]
        await Promise.all(promises)
      })

      expect(axios.post).toHaveBeenCalledTimes(3)
      expect(result.current.newBadges).toEqual(mockBadges)
      expect(result.current.isNotificationOpen).toBe(true)
    })
  })
})