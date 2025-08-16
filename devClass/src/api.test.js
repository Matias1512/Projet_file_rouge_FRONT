import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { executeCode, createUserExercise, getUserExercises, updateUserExercise, getUserById } from './api'

// Mock axios
vi.mock('axios', () => {
  const mockApiPost = vi.fn()
  return {
    default: {
      create: vi.fn(() => ({
        post: mockApiPost
      })),
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn()
    }
  }
})

// Mock constants
vi.mock('./constants', () => ({
  LANGUAGE_VERSIONS: {
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.0.2",
    csharp: "6.12.0",
    php: "8.2.3"
  }
}))

describe('API Functions', () => {
  let mockApiPost

  beforeEach(() => {
    vi.clearAllMocks()
    // Get the mock from the mocked axios instance
    const mockedAxios = vi.mocked(axios)
    const mockInstance = mockedAxios.create()
    mockApiPost = mockInstance.post
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('executeCode', () => {

    it('should execute JavaScript code successfully', async () => {
      const mockResponse = {
        data: {
          run: {
            output: "Hello, World!\n",
            code: 0
          }
        }
      }
      mockApiPost.mockResolvedValue(mockResponse)

      const result = await executeCode('javascript', 'console.log("Hello, World!");')

      expect(mockApiPost).toHaveBeenCalledWith('/execute', {
        language: 'javascript',
        version: '18.15.0',
        files: [{
          content: 'console.log("Hello, World!");'
        }]
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should execute Python code successfully', async () => {
      const mockResponse = {
        data: {
          run: {
            output: "Hello Python\n",
            code: 0
          }
        }
      }
      mockApiPost.mockResolvedValue(mockResponse)

      const result = await executeCode('python', 'print("Hello Python")')

      expect(mockApiPost).toHaveBeenCalledWith('/execute', {
        language: 'python',
        version: '3.10.0',
        files: [{
          content: 'print("Hello Python")'
        }]
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should execute Java code with UTF-8 encoding options', async () => {
      const mockResponse = {
        data: {
          run: {
            output: "Hello Java\n",
            code: 0
          }
        }
      }
      mockApiPost.mockResolvedValue(mockResponse)

      const javaCode = 'public class Main { public static void main(String[] args) { System.out.println("Hello Java"); } }'
      const result = await executeCode('java', javaCode)

      expect(mockApiPost).toHaveBeenCalledWith('/execute', {
        language: 'java',
        version: '15.0.2',
        files: [{
          content: javaCode
        }],
        compile_options: ["-encoding", "UTF-8"],
        run_options: ["-Dfile.encoding=UTF-8"]
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle all supported languages', async () => {
      const mockResponse = { data: { run: { output: "test", code: 0 } } }
      mockApiPost.mockResolvedValue(mockResponse)

      const testCases = [
        { language: 'typescript', version: '5.0.3' },
        { language: 'csharp', version: '6.12.0' },
        { language: 'php', version: '8.2.3' }
      ]

      for (const { language, version } of testCases) {
        mockApiPost.mockClear()
        await executeCode(language, 'test code')
        
        expect(mockApiPost).toHaveBeenCalledWith('/execute', {
          language,
          version,
          files: [{
            content: 'test code'
          }]
        })
      }
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Network Error'
      mockApiPost.mockRejectedValue(new Error(errorMessage))

      await expect(executeCode('javascript', 'console.log("test");'))
        .rejects.toThrow(errorMessage)
    })

    it('should handle empty source code', async () => {
      const mockResponse = { data: { run: { output: "", code: 0 } } }
      mockApiPost.mockResolvedValue(mockResponse)

      const result = await executeCode('javascript', '')

      expect(mockApiPost).toHaveBeenCalledWith('/execute', {
        language: 'javascript',
        version: '18.15.0',
        files: [{
          content: ''
        }]
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('createUserExercise', () => {
    it('should create user exercise successfully', async () => {
      const mockResponse = { data: { id: 1, userId: 123, exerciseId: 456, success: false } }
      axios.post.mockResolvedValue(mockResponse)

      const result = await createUserExercise(123, 456, false)

      expect(axios.post).toHaveBeenCalledWith(
        'https://schooldev.duckdns.org/api/user-exercises/create?userId=123&exerciseId=456&success=false',
        {}
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should create user exercise with success=true', async () => {
      const mockResponse = { data: { id: 1, userId: 123, exerciseId: 456, success: true } }
      axios.post.mockResolvedValue(mockResponse)

      const result = await createUserExercise(123, 456, true)

      expect(axios.post).toHaveBeenCalledWith(
        'https://schooldev.duckdns.org/api/user-exercises/create?userId=123&exerciseId=456&success=true',
        {}
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should use default success=false when not provided', async () => {
      const mockResponse = { data: { id: 1, userId: 123, exerciseId: 456, success: false } }
      axios.post.mockResolvedValue(mockResponse)

      await createUserExercise(123, 456)

      expect(axios.post).toHaveBeenCalledWith(
        'https://schooldev.duckdns.org/api/user-exercises/create?userId=123&exerciseId=456&success=false',
        {}
      )
    })

    it('should handle API errors', async () => {
      const errorMessage = 'API Error'
      axios.post.mockRejectedValue(new Error(errorMessage))

      await expect(createUserExercise(123, 456))
        .rejects.toThrow(errorMessage)
    })
  })

  describe('getUserExercises', () => {
    it('should get user exercises successfully', async () => {
      const mockExercises = [
        { id: 1, userId: 123, exerciseId: 456, success: true },
        { id: 2, userId: 123, exerciseId: 789, success: false }
      ]
      const mockResponse = { data: mockExercises }
      axios.get.mockResolvedValue(mockResponse)

      const result = await getUserExercises(123)

      expect(axios.get).toHaveBeenCalledWith(
        'https://schooldev.duckdns.org/api/user-exercises/user/123'
      )
      expect(result).toEqual(mockExercises)
    })

    it('should handle empty exercise list', async () => {
      const mockResponse = { data: [] }
      axios.get.mockResolvedValue(mockResponse)

      const result = await getUserExercises(123)

      expect(result).toEqual([])
    })

    it('should handle API errors', async () => {
      const errorMessage = 'User not found'
      axios.get.mockRejectedValue(new Error(errorMessage))

      await expect(getUserExercises(123))
        .rejects.toThrow(errorMessage)
    })
  })

  describe('updateUserExercise', () => {
    it('should update user exercise success status to true', async () => {
      const mockResponse = { data: { id: 1, success: true } }
      axios.put.mockResolvedValue(mockResponse)

      const result = await updateUserExercise(1, true)

      expect(axios.put).toHaveBeenCalledWith(
        'https://schooldev.duckdns.org/api/user-exercises/1/success?success=true',
        {}
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should update user exercise success status to false', async () => {
      const mockResponse = { data: { id: 1, success: false } }
      axios.put.mockResolvedValue(mockResponse)

      const result = await updateUserExercise(1, false)

      expect(axios.put).toHaveBeenCalledWith(
        'https://schooldev.duckdns.org/api/user-exercises/1/success?success=false',
        {}
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Exercise not found'
      axios.put.mockRejectedValue(new Error(errorMessage))

      await expect(updateUserExercise(999, true))
        .rejects.toThrow(errorMessage)
    })
  })

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      const mockUser = {
        id: 123,
        username: 'testuser',
        email: 'test@example.com'
      }
      const mockResponse = { data: mockUser }
      axios.get.mockResolvedValue(mockResponse)

      const result = await getUserById(123)

      expect(axios.get).toHaveBeenCalledWith(
        'https://schooldev.duckdns.org/api/users/123'
      )
      expect(result).toEqual(mockUser)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'User not found'
      axios.get.mockRejectedValue(new Error(errorMessage))

      await expect(getUserById(999))
        .rejects.toThrow(errorMessage)
    })
  })

  describe('Error handling and edge cases', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded')
      timeoutError.code = 'ECONNABORTED'
      axios.get.mockRejectedValue(timeoutError)

      await expect(getUserById(123))
        .rejects.toThrow('timeout of 5000ms exceeded')
    })

    it('should handle HTTP error responses', async () => {
      const httpError = new Error('Request failed with status code 404')
      httpError.response = {
        status: 404,
        data: { message: 'Not Found' }
      }
      axios.get.mockRejectedValue(httpError)

      await expect(getUserExercises(123))
        .rejects.toThrow('Request failed with status code 404')
    })

    it('should handle malformed API responses', async () => {
      axios.get.mockResolvedValue({ data: null })

      const result = await getUserById(123)
      expect(result).toBeNull()
    })
  })
})