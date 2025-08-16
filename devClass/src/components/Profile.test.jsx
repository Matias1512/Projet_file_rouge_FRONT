import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import Profile, { ProfileInfoItem } from './Profile'

// Mock useAuth hook
const mockNavigate = vi.fn()
vi.mock('../hooks/useAuth')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock API functions
vi.mock('../api', () => ({
  getUserById: vi.fn(),
  getUserExercises: vi.fn()
}))

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaUser: () => <span data-testid="FaUser">👤</span>,
  FaEnvelope: () => <span data-testid="FaEnvelope">✉️</span>,
  FaCalendarAlt: () => <span data-testid="FaCalendarAlt">📅</span>,
  FaShieldAlt: () => <span data-testid="FaShieldAlt">🛡️</span>,
  FaEdit: () => <span data-testid="FaEdit">✏️</span>
}))

// Mock useColorModeValue
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    useColorModeValue: vi.fn().mockImplementation((light) => light)
  }
})

// Mock console methods
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

import { useAuth } from '../hooks/useAuth'
import { getUserById, getUserExercises } from '../api'

// Helper function to create wrapper with ChakraProvider
const TestWrapper = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
)

TestWrapper.propTypes = {
  children: PropTypes.node.isRequired
}

// Mock data
const mockUserData = {
  userId: 123,
  username: 'testuser',
  email: 'test@example.com',
  role: 'student',
  signupDate: '2023-01-15T10:00:00Z',
  updatedAt: '2023-06-15T14:30:00Z'
}

const mockUserExercises = [
  { id: 1, success: true, name: 'Exercise 1' },
  { id: 2, success: false, name: 'Exercise 2' },
  { id: 3, success: true, name: 'Exercise 3' },
  { id: 4, success: true, name: 'Exercise 4' }
]

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ProfileInfoItem Component', () => {
    // Mock icon component for testing
    const MockIcon = () => <span data-testid="mock-icon">Icon</span>
    
    it('renders with all required props', () => {
      render(
        <ChakraProvider>
          <ProfileInfoItem
            icon={MockIcon}
            label="Test Label"
            value="Test Value"
            color="blue.500"
          />
        </ChakraProvider>
      )

      expect(screen.getByText('Test Label')).toBeInTheDocument()
      expect(screen.getByText('Test Value')).toBeInTheDocument()
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    })

    it('renders without optional color prop', () => {
      render(
        <ChakraProvider>
          <ProfileInfoItem
            icon={MockIcon}
            label="No Color Label"
            value="No Color Value"
          />
        </ChakraProvider>
      )

      expect(screen.getByText('No Color Label')).toBeInTheDocument()
      expect(screen.getByText('No Color Value')).toBeInTheDocument()
    })

    it('renders with number value', () => {
      render(
        <ChakraProvider>
          <ProfileInfoItem
            icon={MockIcon}
            label="Number Label"
            value={42}
            color="red.500"
          />
        </ChakraProvider>
      )

      expect(screen.getByText('Number Label')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders with string value', () => {
      render(
        <ChakraProvider>
          <ProfileInfoItem
            icon={MockIcon}
            label="String Label"
            value="String Value"
          />
        </ChakraProvider>
      )

      expect(screen.getByText('String Label')).toBeInTheDocument()
      expect(screen.getByText('String Value')).toBeInTheDocument()
    })
  })

  describe('Authentication Flow', () => {
    it('redirects to login when not authenticated and not loading', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })

      render(<Profile />, { wrapper: TestWrapper })

      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('does not redirect when authentication is loading', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true
      })

      render(<Profile />, { wrapper: TestWrapper })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('does not redirect when user is authenticated', () => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(mockUserData)
      getUserExercises.mockResolvedValue(mockUserExercises)

      render(<Profile />, { wrapper: TestWrapper })

      expect(mockNavigate).not.toHaveBeenCalledWith('/login')
    })
  })

  describe('Loading States', () => {
    it('displays loading spinner when auth is loading', () => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: true
      })

      render(<Profile />, { wrapper: TestWrapper })

      expect(screen.getByText('Chargement des informations du profil...')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument() // Spinner text
    })

    it('displays loading spinner when data is being fetched', () => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      // Mock API calls to never resolve to keep loading state
      getUserById.mockReturnValue(new Promise(() => {}))
      getUserExercises.mockReturnValue(new Promise(() => {}))

      render(<Profile />, { wrapper: TestWrapper })

      expect(screen.getByText('Chargement des informations du profil...')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('displays error message when API calls fail', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      const error = new Error('API Error')
      
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockRejectedValue(error)
      getUserExercises.mockRejectedValue(error)

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
        expect(screen.getByText('API Error')).toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de la récupération des données utilisateur:', error)
    })

    it('displays generic error message when error has no message', async () => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockRejectedValue(new Error())

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Erreur lors du chargement des données utilisateur')).toBeInTheDocument()
      })
    })
  })

  describe('No User Data', () => {
    it('displays no user data message when userData is null', async () => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(null)
      getUserExercises.mockResolvedValue([])

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Aucune information utilisateur disponible')).toBeInTheDocument()
      })
    })
  })

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(mockUserData)
      getUserExercises.mockResolvedValue(mockUserExercises)
    })

    it('renders user profile information correctly', async () => {
      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getAllByText('testuser')).toHaveLength(2) // Header and info section
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        expect(screen.getAllByText('student')).toHaveLength(2) // Badge and info item
      })
    })

    it('displays all profile information items', async () => {
      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText("Nom d'utilisateur")).toBeInTheDocument()
        expect(screen.getByText('Adresse e-mail')).toBeInTheDocument()
        expect(screen.getByText('Rôle')).toBeInTheDocument()
        expect(screen.getByText("Date d'inscription")).toBeInTheDocument()
        expect(screen.getByText('Dernière mise à jour')).toBeInTheDocument()
      })
    })

    it('displays exercise statistics correctly', async () => {
      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument() // Completed exercises
        expect(screen.getByText('4')).toBeInTheDocument() // Total exercises
        expect(screen.getByText('75%')).toBeInTheDocument() // Success rate
      })

      expect(screen.getByText('Exercices réussis')).toBeInTheDocument()
      expect(screen.getByText('Exercices tentés')).toBeInTheDocument()
      expect(screen.getByText('Taux de réussite')).toBeInTheDocument()
    })

    it('displays correct icons', async () => {
      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getAllByTestId('FaUser')).toHaveLength(2) // Header and info item
        expect(screen.getByTestId('FaEnvelope')).toBeInTheDocument()
        expect(screen.getByTestId('FaShieldAlt')).toBeInTheDocument()
        expect(screen.getByTestId('FaCalendarAlt')).toBeInTheDocument()
        expect(screen.getByTestId('FaEdit')).toBeInTheDocument()
      })
    })

    it('formats dates correctly', async () => {
      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('15 janvier 2023')).toBeInTheDocument() // Signup date
        expect(screen.getByText('15 juin 2023')).toBeInTheDocument() // Updated date
      })
    })

    it('calculates years on platform correctly', async () => {
      const currentYear = new Date().getFullYear()
      const signupYear = 2023
      const expectedYears = currentYear - signupYear || '< 1'

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText(expectedYears.toString())).toBeInTheDocument()
      })
    })
  })

  describe('Role Badge Colors', () => {
    it('displays admin role with red badge', async () => {
      const adminUser = { ...mockUserData, role: 'admin' }
      
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(adminUser)
      getUserExercises.mockResolvedValue([])

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getAllByText('admin')).toHaveLength(2) // Badge and info item
      })
    })

    it('displays teacher role with blue badge', async () => {
      const teacherUser = { ...mockUserData, role: 'teacher' }
      
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(teacherUser)
      getUserExercises.mockResolvedValue([])

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getAllByText('teacher')).toHaveLength(2) // Badge and info item
      })
    })

    it('displays student role with green badge', async () => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(mockUserData)
      getUserExercises.mockResolvedValue([])

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getAllByText('student')).toHaveLength(2) // Badge and info item
      })
    })

    it('displays default role when no role provided', async () => {
      const userWithoutRole = { ...mockUserData, role: null }
      
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(userWithoutRole)
      getUserExercises.mockResolvedValue([])

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getAllByText('Utilisateur')).toHaveLength(2) // Role badge and info item
      })
    })

    it('displays unknown role with gray badge', async () => {
      const userWithUnknownRole = { ...mockUserData, role: 'unknown' }
      
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(userWithUnknownRole)
      getUserExercises.mockResolvedValue([])

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getAllByText('unknown')).toHaveLength(2) // Badge and info item
      })
    })
  })

  describe('Conditional Rendering', () => {
    it('shows updated date when different from signup date', async () => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(mockUserData)
      getUserExercises.mockResolvedValue([])

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Dernière mise à jour')).toBeInTheDocument()
        expect(screen.getByText('15 juin 2023')).toBeInTheDocument()
      })
    })

    it('does not show updated date when same as signup date', async () => {
      const userSameDate = { 
        ...mockUserData, 
        updatedAt: mockUserData.signupDate 
      }
      
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(userSameDate)
      getUserExercises.mockResolvedValue([])

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.queryByText('Dernière mise à jour')).not.toBeInTheDocument()
      })
    })

    it('does not show updated date when updatedAt is null', async () => {
      const userNoUpdateDate = { 
        ...mockUserData, 
        updatedAt: null 
      }
      
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(userNoUpdateDate)
      getUserExercises.mockResolvedValue([])

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.queryByText('Dernière mise à jour')).not.toBeInTheDocument()
      })
    })
  })

  describe('Exercise Statistics Edge Cases', () => {
    it('handles zero exercises correctly', async () => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(mockUserData)
      getUserExercises.mockResolvedValue([])

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getAllByText('0')).toHaveLength(2) // Completed and total exercises
        expect(screen.getByText('0%')).toBeInTheDocument() // Success rate
      })
    })

    it('handles null exercises response', async () => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(mockUserData)
      getUserExercises.mockResolvedValue(null)

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getAllByText('0')).toHaveLength(2) // Completed and total exercises
        expect(screen.getByText('0%')).toBeInTheDocument() // Success rate
      })
    })

    it('calculates statistics correctly with all failed exercises', async () => {
      const failedExercises = [
        { id: 1, success: false },
        { id: 2, success: false }
      ]

      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(mockUserData)
      getUserExercises.mockResolvedValue(failedExercises)

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument() // Completed exercises
        expect(screen.getAllByText('2')).toHaveLength(2) // Total exercises and years on platform
        expect(screen.getByText('0%')).toBeInTheDocument() // Success rate
      })
    })
  })

  describe('API Call Behavior', () => {
    it('does not fetch data when user has no userId', () => {
      useAuth.mockReturnValue({
        user: {},
        isAuthenticated: true,
        isLoading: false
      })

      render(<Profile />, { wrapper: TestWrapper })

      expect(getUserById).not.toHaveBeenCalled()
      expect(getUserExercises).not.toHaveBeenCalled()
    })

    it('makes parallel API calls when user has userId', async () => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(mockUserData)
      getUserExercises.mockResolvedValue(mockUserExercises)

      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(getUserById).toHaveBeenCalledWith(123)
        expect(getUserExercises).toHaveBeenCalledWith(123)
      })
    })
  })

  describe('Profile Header', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: { userId: 123 },
        isAuthenticated: true,
        isLoading: false
      })

      getUserById.mockResolvedValue(mockUserData)
      getUserExercises.mockResolvedValue(mockUserExercises)
    })

    it('displays avatar with user initial', async () => {
      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        // Avatar should be rendered with the username appearing twice
        expect(screen.getAllByText('testuser')).toHaveLength(2) // Header and info section
      })
    })

    it('displays user information sections', async () => {
      render(<Profile />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Informations personnelles')).toBeInTheDocument()
        expect(screen.getByText('Statistiques')).toBeInTheDocument()
      })
    })
  })
})