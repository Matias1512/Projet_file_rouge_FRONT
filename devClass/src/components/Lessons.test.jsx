import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import axios from 'axios'
import Lessons from './Lessons'

// Mock des modules
vi.mock('axios')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn()
  }
})
vi.mock('../hooks/useAuth')
vi.mock('../api', () => ({
  createUserExercise: vi.fn(),
  getUserExercises: vi.fn()
}))

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createUserExercise, getUserExercises } from '../api'

// Données de test
const mockLessons = [
  {
    lessonId: 1,
    title: 'Introduction à Java',
    orderInCourse: 1,
    course: { language: 'JAVA' }
  },
  {
    lessonId: 2,
    title: 'Variables et types',
    orderInCourse: 2,
    course: { language: 'JAVA' }
  }
]

const mockExercises = {
  1: [
    {
      exerciseId: 1,
      title: 'Hello World',
      type: 'exercise'
    }
  ],
  2: [
    {
      exerciseId: 3,
      title: 'Quiz sur les types',
      type: 'qcm'
    }
  ]
}

const mockUserExercises = [
  {
    exercise: { exerciseId: 1 },
    success: true
  }
]

const mockUser = {
  userId: 123,
  username: 'testuser'
}

// Wrapper pour les tests
const TestWrapper = ({ children }) => (
  <ChakraProvider>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </ChakraProvider>
)

TestWrapper.propTypes = {
  children: PropTypes.node.isRequired
}

describe('Lessons Component', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
    axios.get.mockClear()
    createUserExercise.mockClear()
    getUserExercises.mockClear()
  })

  describe('Authentification', () => {
    it('redirige vers login si non authentifié', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        logout: vi.fn(),
        user: null
      })

      render(<Lessons />, { wrapper: TestWrapper })
      
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('ne fait rien pendant le chargement', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: true,
        logout: vi.fn(),
        user: mockUser
      })

      render(<Lessons />, { wrapper: TestWrapper })
      
      expect(axios.get).not.toHaveBeenCalled()
    })
  })

  describe('Chargement des données', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        user: mockUser
      })
    })

    it('charge et affiche les leçons avec succès', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/lessons')) {
          return Promise.resolve({ data: mockLessons })
        }
        if (url.includes('/exercises/lesson/')) {
          const lessonId = url.split('/').pop()
          return Promise.resolve({ data: mockExercises[lessonId] || [] })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })
      
      getUserExercises.mockResolvedValue(mockUserExercises)

      render(<Lessons />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Introduction à Java')).toBeInTheDocument()
      })
    })

    it('affiche un message de chargement initial', () => {
      axios.get.mockImplementation(() => new Promise(() => {}))
      
      render(<Lessons />, { wrapper: TestWrapper })

      expect(screen.getByText('Chargement des leçons...')).toBeInTheDocument()
    })

    it('gère les erreurs de chargement', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.get.mockRejectedValue(new Error('Network error'))

      render(<Lessons />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Erreur lors de la récupération des leçons:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Navigation et interactions', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        user: mockUser
      })
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/lessons')) {
          return Promise.resolve({ data: [mockLessons[0]] })
        }
        if (url.includes('/exercises/lesson/1')) {
          return Promise.resolve({ data: mockExercises[1] })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })
      
      getUserExercises.mockResolvedValue([])
      createUserExercise.mockResolvedValue({})
    })

    it('navigue vers l\'éditeur pour un exercice normal', async () => {
      render(<Lessons />, { wrapper: TestWrapper })

      await waitFor(() => {
        const exerciseButton = screen.getByText('Hello World').closest('div').querySelector('button')
        fireEvent.click(exerciseButton)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/editor?exerciseId=1')
    })

    it('navigue vers QCM pour un exercice de type qcm', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/lessons')) {
          return Promise.resolve({ data: [mockLessons[1]] })
        }
        if (url.includes('/exercises/lesson/2')) {
          return Promise.resolve({ data: mockExercises[2] })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })

      render(<Lessons />, { wrapper: TestWrapper })

      await waitFor(() => {
        const qcmButton = screen.getByText('Quiz sur les types').closest('div').querySelector('button')
        fireEvent.click(qcmButton)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/exercise/3/qcm')
    })
  })

  describe('Logique de progression', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        user: mockUser
      })
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/lessons')) {
          return Promise.resolve({ data: [mockLessons[0]] })
        }
        if (url.includes('/exercises/lesson/1')) {
          return Promise.resolve({ data: mockExercises[1] })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })
    })

    it('déverrouille le premier exercice', async () => {
      getUserExercises.mockResolvedValue([])

      render(<Lessons />, { wrapper: TestWrapper })

      await waitFor(() => {
        const firstExerciseButton = screen.getByText('Hello World').closest('div').querySelector('button')
        expect(firstExerciseButton).not.toBeDisabled()
      })
    })

    it('affiche une coche pour les exercices complétés', async () => {
      getUserExercises.mockResolvedValue(mockUserExercises)

      render(<Lessons />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Hello World ✓')).toBeInTheDocument()
      })
    })
  })

  describe('Gestion des UserExercises', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        user: mockUser
      })
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/lessons')) {
          return Promise.resolve({ data: [mockLessons[0]] })
        }
        if (url.includes('/exercises/lesson/1')) {
          return Promise.resolve({ data: mockExercises[1] })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })
      
      getUserExercises.mockResolvedValue([])
    })

    it('crée un UserExercise si nécessaire', async () => {
      render(<Lessons />, { wrapper: TestWrapper })

      await waitFor(() => {
        const exerciseButton = screen.getByText('Hello World').closest('div').querySelector('button')
        fireEvent.click(exerciseButton)
      })

      expect(createUserExercise).toHaveBeenCalledWith(mockUser.userId, 1, false)
    })

    it('continue même en cas d\'erreur de création', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      createUserExercise.mockRejectedValue(new Error('API Error'))

      render(<Lessons />, { wrapper: TestWrapper })

      await waitFor(() => {
        const exerciseButton = screen.getByText('Hello World').closest('div').querySelector('button')
        fireEvent.click(exerciseButton)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/editor?exerciseId=1')
      consoleWarnSpy.mockRestore()
    })
  })

  describe('Rendu des leçons', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        user: mockUser
      })
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/lessons')) {
          return Promise.resolve({ data: mockLessons })
        }
        if (url.includes('/exercises/lesson/')) {
          const lessonId = url.split('/').pop()
          return Promise.resolve({ data: mockExercises[lessonId] || [] })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })
      
      getUserExercises.mockResolvedValue([])
    })

    it('affiche les leçons dans l\'ordre', async () => {
      render(<Lessons />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Lesson 1')).toBeInTheDocument()
        expect(screen.getByText('Lesson 2')).toBeInTheDocument()
      })
    })

    it('affiche les titres des leçons', async () => {
      render(<Lessons />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Introduction à Java')).toBeInTheDocument()
        expect(screen.getByText('Variables et types')).toBeInTheDocument()
      })
    })
  })
})