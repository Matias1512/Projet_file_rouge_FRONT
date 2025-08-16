import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { useContext } from 'react'
import axios from 'axios'
import { AuthProvider, AuthContext } from './AuthContext'

// Mock axios
vi.mock('axios', () => {
  const mockAxiosGet = vi.fn()
  const mockRequestInterceptor = vi.fn()
  const mockResponseInterceptor = vi.fn()
  const mockRequestEject = vi.fn()
  const mockResponseEject = vi.fn()

  return {
    default: {
      get: mockAxiosGet,
      interceptors: {
        request: {
          use: mockRequestInterceptor,
          eject: mockRequestEject
        },
        response: {
          use: mockResponseInterceptor,
          eject: mockResponseEject
        }
      }
    }
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

// Mock window.atob for JWT decoding
Object.defineProperty(window, 'atob', {
  value: vi.fn()
})

// Test component to access context
const TestComponent = () => {
  const { token, user, login, logout, isAuthenticated, isLoading } = useContext(AuthContext)
  
  return (
    <div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <button onClick={() => login('test-token')} data-testid="login-btn">Login</button>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  )
}

// Helper function to create valid JWT token
const createMockJWT = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'mock-signature'
  return `${header}.${body}.${signature}`
}

describe('AuthContext', () => {
  let mockAxiosGet, mockRequestInterceptor, mockResponseInterceptor, mockRequestEject, mockResponseEject

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Get mocked axios instance
    const mockedAxios = vi.mocked(axios)
    mockAxiosGet = mockedAxios.get
    mockRequestInterceptor = mockedAxios.interceptors.request.use
    mockResponseInterceptor = mockedAxios.interceptors.response.use
    mockRequestEject = mockedAxios.interceptors.request.eject
    mockResponseEject = mockedAxios.interceptors.response.eject
    
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    
    // Mock successful axios interceptor registration
    mockRequestInterceptor.mockReturnValue(1)
    mockResponseInterceptor.mockReturnValue(2)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('decodeJWT function', () => {
    it('should decode valid JWT token', async () => {
      const payload = { userId: 123, username: 'testuser', exp: Date.now() / 1000 + 3600 }
      const token = createMockJWT(payload)
      
      // Mock atob to return the correct decoded payload
      window.atob.mockImplementation((str) => {
        if (str === btoa(JSON.stringify(payload))) {
          return JSON.stringify(payload)
        }
        return btoa(str) // Default behavior for other calls
      })

      localStorageMock.getItem.mockReturnValue(token)
      mockAxiosGet.mockResolvedValue({ data: 'success' })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(payload))
      })
    })

    it('should handle malformed JWT token', async () => {
      const malformedToken = 'invalid.token.format'
      localStorageMock.getItem.mockReturnValue(malformedToken)
      
      // Mock axios to reject (which will cause token removal)
      mockAxiosGet.mockRejectedValue(new Error('Invalid token'))
      
      // Mock atob to throw error for malformed token
      window.atob.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      expect(screen.getByTestId('token')).toHaveTextContent('null')
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })

    it('should handle token with invalid JSON', async () => {
      const token = 'header.invalid-json.signature'
      localStorageMock.getItem.mockReturnValue(token)
      
      // Mock axios to succeed (to test JWT decoding specifically)
      mockAxiosGet.mockResolvedValue({ data: 'success' })
      
      // Mock atob to return invalid JSON
      window.atob.mockReturnValue('invalid-json')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      expect(console.error).toHaveBeenCalledWith('Error decoding JWT:', expect.any(Error))
      expect(screen.getByTestId('user')).toHaveTextContent('null')
    })
  })

  describe('AuthProvider initialization', () => {
    it('should initialize with no token', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      expect(screen.getByTestId('token')).toHaveTextContent('null')
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')
    })

    it('should validate stored token on startup', async () => {
      const payload = { userId: 123, username: 'testuser' }
      const token = createMockJWT(payload)
      
      localStorageMock.getItem.mockReturnValue(token)
      mockAxiosGet.mockResolvedValue({ data: 'success' })
      
      window.atob.mockImplementation((str) => {
        if (str === btoa(JSON.stringify(payload))) {
          return JSON.stringify(payload)
        }
        return str
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://schooldev.duckdns.org/api/courses',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      expect(screen.getByTestId('token')).toHaveTextContent(token)
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true')
    })

    it('should remove invalid token on startup', async () => {
      const token = 'invalid-token'
      localStorageMock.getItem.mockReturnValue(token)
      mockAxiosGet.mockRejectedValue(new Error('Unauthorized'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(screen.getByTestId('token')).toHaveTextContent('null')
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')
    })
  })

  describe('login function', () => {
    it('should login with valid token', async () => {
      const payload = { userId: 123, username: 'testuser' }
      const token = createMockJWT(payload)
      
      window.atob.mockImplementation((str) => {
        if (str === btoa(JSON.stringify(payload))) {
          return JSON.stringify(payload)
        }
        return str
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      act(() => {
        screen.getByTestId('login-btn').click()
      })

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token')
        expect(screen.getByTestId('token')).toHaveTextContent('test-token')
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true')
      })
    })

    it('should handle login with malformed token', async () => {
      window.atob.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      act(() => {
        screen.getByTestId('login-btn').click()
      })

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token')
        expect(screen.getByTestId('token')).toHaveTextContent('test-token')
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })

      expect(console.error).toHaveBeenCalledWith('Error decoding JWT:', expect.any(Error))
    })
  })

  describe('logout function', () => {
    it('should logout and clear token', async () => {
      const payload = { userId: 123, username: 'testuser' }
      const token = createMockJWT(payload)
      
      localStorageMock.getItem.mockReturnValue(token)
      mockAxiosGet.mockResolvedValue({ data: 'success' })
      
      window.atob.mockImplementation((str) => {
        if (str === btoa(JSON.stringify(payload))) {
          return JSON.stringify(payload)
        }
        return str
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true')
      })

      act(() => {
        screen.getByTestId('logout-btn').click()
      })

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
        expect(screen.getByTestId('token')).toHaveTextContent('null')
        expect(screen.getByTestId('user')).toHaveTextContent('null')
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')
      })
    })
  })

  describe('axios interceptors', () => {
    it('should set up request interceptor to add authorization header', async () => {
      const payload = { userId: 123, username: 'testuser' }
      const token = createMockJWT(payload)
      
      localStorageMock.getItem.mockReturnValue(token)
      mockAxiosGet.mockResolvedValue({ data: 'success' })
      
      window.atob.mockImplementation((str) => {
        if (str === btoa(JSON.stringify(payload))) {
          return JSON.stringify(payload)
        }
        return str
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      expect(mockRequestInterceptor).toHaveBeenCalled()
      
      // Test the request interceptor function
      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0]
      const config = { headers: {} }
      const result = requestInterceptorFn(config)
      
      expect(result.headers.Authorization).toBe(`Bearer ${token}`)
    })

    it('should set up response interceptor to handle 401/403 errors', async () => {
      const payload = { userId: 123, username: 'testuser' }
      const token = createMockJWT(payload)
      
      localStorageMock.getItem.mockReturnValue(token)
      mockAxiosGet.mockResolvedValue({ data: 'success' })
      
      window.atob.mockImplementation((str) => {
        if (str === btoa(JSON.stringify(payload))) {
          return JSON.stringify(payload)
        }
        return str
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      expect(mockResponseInterceptor).toHaveBeenCalled()
      
      // Test the response interceptor error function
      const responseInterceptorErrorFn = mockResponseInterceptor.mock.calls[0][1]
      const error401 = { response: { status: 401 } }
      
      await expect(responseInterceptorErrorFn(error401)).rejects.toEqual(error401)
      
      await waitFor(() => {
        expect(screen.getByTestId('token')).toHaveTextContent('null')
        expect(screen.getByTestId('user')).toHaveTextContent('null')
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')
      })
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })

    it('should handle 403 errors', async () => {
      const payload = { userId: 123, username: 'testuser' }
      const token = createMockJWT(payload)
      
      localStorageMock.getItem.mockReturnValue(token)
      mockAxiosGet.mockResolvedValue({ data: 'success' })
      
      window.atob.mockImplementation((str) => {
        if (str === btoa(JSON.stringify(payload))) {
          return JSON.stringify(payload)
        }
        return str
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      const responseInterceptorErrorFn = mockResponseInterceptor.mock.calls[0][1]
      const error403 = { response: { status: 403 } }
      
      await expect(responseInterceptorErrorFn(error403)).rejects.toEqual(error403)
      
      await waitFor(() => {
        expect(screen.getByTestId('token')).toHaveTextContent('null')
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      })
    })

    it('should not clear token for other error codes', async () => {
      const payload = { userId: 123, username: 'testuser' }
      const token = createMockJWT(payload)
      
      localStorageMock.getItem.mockReturnValue(token)
      mockAxiosGet.mockResolvedValue({ data: 'success' })
      
      window.atob.mockImplementation((str) => {
        if (str === btoa(JSON.stringify(payload))) {
          return JSON.stringify(payload)
        }
        return str
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      const responseInterceptorErrorFn = mockResponseInterceptor.mock.calls[0][1]
      const error500 = { response: { status: 500 } }
      
      await expect(responseInterceptorErrorFn(error500)).rejects.toEqual(error500)
      
      // Token should still be present
      expect(screen.getByTestId('token')).toHaveTextContent(token)
      expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    })

    it('should clean up interceptors on unmount', () => {
      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      unmount()

      expect(mockRequestEject).toHaveBeenCalledWith(1)
      expect(mockResponseEject).toHaveBeenCalledWith(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty token string', async () => {
      localStorageMock.getItem.mockReturnValue('')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      expect(screen.getByTestId('token')).toHaveTextContent('null')
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')
    })

    it('should handle request interceptor without token', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0]
      const config = { headers: {} }
      const result = requestInterceptorFn(config)
      
      expect(result.headers.Authorization).toBeUndefined()
    })

    it('should handle response interceptor with no response object', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
      })

      const responseInterceptorErrorFn = mockResponseInterceptor.mock.calls[0][1]
      const errorWithoutResponse = { message: 'Network Error' }
      
      await expect(responseInterceptorErrorFn(errorWithoutResponse))
        .rejects.toEqual(errorWithoutResponse)
      
      // Should not clear token for network errors
      expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    })
  })
})