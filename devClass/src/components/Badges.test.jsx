import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import axios from 'axios'
import AchievementsPage, { AchievementCard, AchievementLocked } from './Badges'
import { AuthContext } from '../AuthContext'
import { getIcon } from '../utils/iconUtils'

// Mock axios
vi.mock('axios')

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaFire: () => <span data-testid="FaFire">🔥</span>,
  FaFlask: () => <span data-testid="FaFlask">⚗️</span>,
  FaFileAlt: () => <span data-testid="FaFileAlt">📄</span>,
  FaShieldAlt: () => <span data-testid="FaShieldAlt">🛡️</span>,
  FaBullseye: () => <span data-testid="FaBullseye">🎯</span>,
  FaTrophy: () => <span data-testid="FaTrophy">🏆</span>,
  FaStar: () => <span data-testid="FaStar">⭐</span>,
  FaBolt: () => <span data-testid="FaBolt">⚡</span>,
  FaLock: () => <span data-testid="FaLock">🔒</span>,
  FaPlay: () => <span data-testid="FaPlay">▶️</span>,
  FaLeaf: () => <span data-testid="FaLeaf">🍃</span>,
  FaHeart: () => <span data-testid="FaHeart">❤️</span>,
  FaCheckCircle: () => <span data-testid="FaCheckCircle">✅</span>,
  FaCompass: () => <span data-testid="FaCompass">🧭</span>
}))

// Mock useToast
const mockToast = vi.fn()
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    useToast: () => mockToast,
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

// Helper function to create wrapper with AuthContext
const createWrapper = (userValue) => {
  const TestWrapper = ({ children }) => (
    <ChakraProvider>
      <AuthContext.Provider value={{ user: userValue }}>
        {children}
      </AuthContext.Provider>
    </ChakraProvider>
  )
  
  TestWrapper.displayName = 'TestWrapper'
  TestWrapper.propTypes = {
    children: PropTypes.node.isRequired
  }
  
  return TestWrapper
}

// Mock data
const mockUserBadges = [
  {
    badge: {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first exercise',
      icon: 'FaStar',
      level: 1,
      color: 'blue.500',
      total: 1
    },
    current: 1,
    unlocked: true
  },
  {
    badge: {
      id: 2,
      title: 'Code Master',
      description: 'Complete 10 exercises',
      icon: 'FaTrophy',
      level: 2,
      color: 'gold.500',
      total: 10,
      unlockRequirement: 'complete_exercise:10'
    },
    current: 5,
    unlocked: false
  }
]

describe('Badges Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getIcon Function - Integration Tests', () => {
    const TestIconComponent = ({ iconName, size }) => (
      <div data-testid="icon-container">
        {getIcon(iconName, size)}
      </div>
    )

    TestIconComponent.propTypes = {
      iconName: PropTypes.string.isRequired,
      size: PropTypes.number
    }

    it('renders FaFire icon correctly', () => {
      render(<TestIconComponent iconName="FaFire" />)
      expect(screen.getByTestId('FaFire')).toBeInTheDocument()
    })

    it('renders FaFlask icon correctly', () => {
      render(<TestIconComponent iconName="FaFlask" />)
      expect(screen.getByTestId('FaFlask')).toBeInTheDocument()
    })

    it('renders FaFileAlt icon correctly', () => {
      render(<TestIconComponent iconName="FaFileAlt" />)
      expect(screen.getByTestId('FaFileAlt')).toBeInTheDocument()
    })

    it('renders FaShieldAlt icon correctly', () => {
      render(<TestIconComponent iconName="FaShieldAlt" />)
      expect(screen.getByTestId('FaShieldAlt')).toBeInTheDocument()
    })

    it('renders FaBullseye icon correctly', () => {
      render(<TestIconComponent iconName="FaBullseye" />)
      expect(screen.getByTestId('FaBullseye')).toBeInTheDocument()
    })

    it('renders FaTrophy icon correctly', () => {
      render(<TestIconComponent iconName="FaTrophy" />)
      expect(screen.getByTestId('FaTrophy')).toBeInTheDocument()
    })

    it('renders FaStar icon correctly', () => {
      render(<TestIconComponent iconName="FaStar" />)
      expect(screen.getByTestId('FaStar')).toBeInTheDocument()
    })

    it('renders FaBolt icon correctly', () => {
      render(<TestIconComponent iconName="FaBolt" />)
      expect(screen.getByTestId('FaBolt')).toBeInTheDocument()
    })

    it('renders FaPlay icon correctly', () => {
      render(<TestIconComponent iconName="FaPlay" />)
      expect(screen.getByTestId('FaPlay')).toBeInTheDocument()
    })

    it('renders FaLeaf icon correctly', () => {
      render(<TestIconComponent iconName="FaLeaf" />)
      expect(screen.getByTestId('FaLeaf')).toBeInTheDocument()
    })

    it('renders FaHeart icon correctly', () => {
      render(<TestIconComponent iconName="FaHeart" />)
      expect(screen.getByTestId('FaHeart')).toBeInTheDocument()
    })

    it('renders FaCheckCircle icon correctly', () => {
      render(<TestIconComponent iconName="FaCheckCircle" />)
      expect(screen.getByTestId('FaCheckCircle')).toBeInTheDocument()
    })

    it('renders FaTarget correctly (mapped to FaBullseye)', () => {
      render(<TestIconComponent iconName="FaTarget" />)
      expect(screen.getByTestId('FaBullseye')).toBeInTheDocument()
    })

    it('renders FaCompass icon correctly', () => {
      render(<TestIconComponent iconName="FaCompass" />)
      expect(screen.getByTestId('FaCompass')).toBeInTheDocument()
    })

    it('renders default FaStar icon for unknown icon name', () => {
      render(<TestIconComponent iconName="UnknownIcon" />)
      expect(screen.getByTestId('FaStar')).toBeInTheDocument()
    })
  })

  describe('AchievementCard Component', () => {
    const mockAchievement = {
      badge: {
        title: 'Test Badge',
        description: 'Test Description',
        icon: 'FaStar',
        level: 1,
        color: 'blue.500',
        total: 10
      },
      current: 7,
      unlocked: true
    }

    it('renders achievement title correctly', () => {
      render(
        <ChakraProvider>
          <AchievementCard achievement={mockAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('renders achievement description correctly', () => {
      render(
        <ChakraProvider>
          <AchievementCard achievement={mockAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('displays correct progress numbers', () => {
      render(
        <ChakraProvider>
          <AchievementCard achievement={mockAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByText('7/10')).toBeInTheDocument()
    })

    it('displays correct level badge', () => {
      render(
        <ChakraProvider>
          <AchievementCard achievement={mockAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('renders correct icon', () => {
      render(
        <ChakraProvider>
          <AchievementCard achievement={mockAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByTestId('FaStar')).toBeInTheDocument()
    })

    it('calculates progress percentage correctly', () => {
      const achievement = {
        ...mockAchievement,
        current: 3,
        badge: { ...mockAchievement.badge, total: 10 }
      }
      
      render(
        <ChakraProvider>
          <AchievementCard achievement={achievement} />
        </ChakraProvider>
      )
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '30')
    })

    it('handles zero progress correctly', () => {
      const achievement = {
        ...mockAchievement,
        current: 0
      }
      
      render(
        <ChakraProvider>
          <AchievementCard achievement={achievement} />
        </ChakraProvider>
      )
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '0')
    })

    it('handles complete progress correctly', () => {
      const achievement = {
        ...mockAchievement,
        current: 10,
        badge: { ...mockAchievement.badge, total: 10 }
      }
      
      render(
        <ChakraProvider>
          <AchievementCard achievement={achievement} />
        </ChakraProvider>
      )
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '100')
    })
  })

  describe('AchievementLocked Component', () => {
    const mockLockedAchievement = {
      badge: {
        title: 'Locked Badge',
        description: 'Locked Description',
        icon: 'FaTrophy',
        level: 2,
        unlockRequirement: 'complete_exercise:5',
        total: 5
      },
      current: 2,
      unlocked: false
    }

    it('renders locked achievement title correctly', () => {
      render(
        <ChakraProvider>
          <AchievementLocked achievement={mockLockedAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByText('Locked Badge')).toBeInTheDocument()
    })

    it('renders locked achievement description correctly', () => {
      render(
        <ChakraProvider>
          <AchievementLocked achievement={mockLockedAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByText('Locked Description')).toBeInTheDocument()
    })

    it('displays lock icon', () => {
      render(
        <ChakraProvider>
          <AchievementLocked achievement={mockLockedAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByTestId('FaLock')).toBeInTheDocument()
    })

    it('displays unlock requirement when present', () => {
      render(
        <ChakraProvider>
          <AchievementLocked achievement={mockLockedAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByText('Condition: complete exercise - 5')).toBeInTheDocument()
    })

    it('does not display unlock requirement when not present', () => {
      const achievementWithoutRequirement = {
        ...mockLockedAchievement,
        badge: {
          ...mockLockedAchievement.badge,
          unlockRequirement: undefined
        }
      }
      
      render(
        <ChakraProvider>
          <AchievementLocked achievement={achievementWithoutRequirement} />
        </ChakraProvider>
      )
      
      expect(screen.queryByText(/Condition:/)).not.toBeInTheDocument()
    })

    it('displays correct progress numbers for locked achievement', () => {
      render(
        <ChakraProvider>
          <AchievementLocked achievement={mockLockedAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByText('2/5')).toBeInTheDocument()
    })

    it('displays correct level badge for locked achievement', () => {
      render(
        <ChakraProvider>
          <AchievementLocked achievement={mockLockedAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders correct icon for locked achievement', () => {
      render(
        <ChakraProvider>
          <AchievementLocked achievement={mockLockedAchievement} />
        </ChakraProvider>
      )
      
      expect(screen.getByTestId('FaTrophy')).toBeInTheDocument()
    })

    it('formats unlock requirement text correctly', () => {
      const achievementWithComplexRequirement = {
        ...mockLockedAchievement,
        badge: {
          ...mockLockedAchievement.badge,
          unlockRequirement: 'complete_daily_challenge:streak_7'
        }
      }
      
      render(
        <ChakraProvider>
          <AchievementLocked achievement={achievementWithComplexRequirement} />
        </ChakraProvider>
      )
      
      expect(screen.getByText('Condition: complete daily challenge - streak 7')).toBeInTheDocument()
    })

    it('calculates progress correctly for locked achievements', () => {
      render(
        <ChakraProvider>
          <AchievementLocked achievement={mockLockedAchievement} />
        </ChakraProvider>
      )
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '40')
    })
  })

  describe('AchievementsPage - Loading State', () => {
    it('displays loading spinner and text when loading', () => {
      const wrapper = createWrapper({ userId: 123 })
      
      // Mock axios to never resolve to keep loading state
      const promise = new Promise(() => {})
      axios.get.mockReturnValue(promise)
      
      render(<AchievementsPage />, { wrapper })
      
      expect(screen.getByText('Chargement de vos badges...')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument() // Spinner text
    })
  })

  describe('AchievementsPage - Authentication Requirements', () => {
    it('does not fetch badges when user is null', () => {
      const wrapper = createWrapper(null)
      
      render(<AchievementsPage />, { wrapper })
      
      expect(axios.get).not.toHaveBeenCalled()
    })

    it('does not fetch badges when user has no userId', () => {
      const wrapper = createWrapper({ name: 'John' })
      
      render(<AchievementsPage />, { wrapper })
      
      expect(axios.get).not.toHaveBeenCalled()
    })

    it('fetches badges when user is authenticated with userId', async () => {
      axios.get.mockResolvedValue({ data: [] })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/userbadges/user/123')
      })
    })
  })

  describe('AchievementsPage - Error State', () => {
    it('displays error message when API call fails', async () => {
      const error = new Error('Network error')
      axios.get.mockRejectedValue(error)
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('Impossible de charger les badges. Veuillez réessayer.')).toBeInTheDocument()
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Erreur",
        description: "Impossible de charger les badges",
        status: "error",
        duration: 3000,
        isClosable: true
      })
    })

    it('logs error when API call fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      const error = new Error('Network error')
      axios.get.mockRejectedValue(error)
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de la récupération des badges:', error)
      })
    })

    it('allows retry after error', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'))
      axios.get.mockResolvedValueOnce({ data: mockUserBadges })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('Réessayer')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Réessayer'))
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('AchievementsPage - Empty State', () => {
    it('displays empty state message when no badges', async () => {
      axios.get.mockResolvedValue({ data: [] })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('Aucun badge disponible pour le moment.')).toBeInTheDocument()
      })
    })
  })

  describe('AchievementsPage - Successful Data Loading', () => {
    it('renders page title correctly', async () => {
      axios.get.mockResolvedValue({ data: mockUserBadges })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('Mes succès')).toBeInTheDocument()
      })
    })

    it('displays unlocked badges section with correct count', async () => {
      axios.get.mockResolvedValue({ data: mockUserBadges })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('Succès débloqués (1)')).toBeInTheDocument()
      })
    })

    it('displays locked badges section with correct count', async () => {
      axios.get.mockResolvedValue({ data: mockUserBadges })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('Succès à débloquer (1)')).toBeInTheDocument()
      })
    })

    it('renders unlocked achievement cards', async () => {
      axios.get.mockResolvedValue({ data: mockUserBadges })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('First Steps')).toBeInTheDocument()
        expect(screen.getByText('Complete your first exercise')).toBeInTheDocument()
        expect(screen.getByText('1/1')).toBeInTheDocument()
      })
    })

    it('renders locked achievement cards', async () => {
      axios.get.mockResolvedValue({ data: mockUserBadges })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('Code Master')).toBeInTheDocument()
        expect(screen.getByText('Complete 10 exercises')).toBeInTheDocument()
        expect(screen.getByText('5/10')).toBeInTheDocument()
        expect(screen.getByText('Condition: complete exercise - 10')).toBeInTheDocument()
      })
    })

    it('displays correct icons for achievements', async () => {
      axios.get.mockResolvedValue({ data: mockUserBadges })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('FaStar')).toBeInTheDocument()
        expect(screen.getByTestId('FaTrophy')).toBeInTheDocument()
      })
    })

    it('displays lock icon for locked achievements', async () => {
      axios.get.mockResolvedValue({ data: mockUserBadges })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('FaLock')).toBeInTheDocument()
      })
    })
  })

  describe('AchievementsPage - Badge Filtering', () => {
    it('correctly separates unlocked and locked badges', async () => {
      const mixedBadges = [
        ...mockUserBadges,
        {
          badge: {
            id: 3,
            title: 'Another Unlocked',
            description: 'Another unlocked badge',
            icon: 'FaFire',
            level: 1,
            color: 'red.500',
            total: 1
          },
          current: 1,
          unlocked: true
        }
      ]
      
      axios.get.mockResolvedValue({ data: mixedBadges })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('Succès débloqués (2)')).toBeInTheDocument()
        expect(screen.getByText('Succès à débloquer (1)')).toBeInTheDocument()
      })
    })

    it('shows only unlocked section when no locked badges', async () => {
      const unlockedOnly = [mockUserBadges[0]]
      axios.get.mockResolvedValue({ data: unlockedOnly })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('Succès débloqués (1)')).toBeInTheDocument()
        expect(screen.queryByText('Succès à débloquer')).not.toBeInTheDocument()
      })
    })

    it('shows only locked section when no unlocked badges', async () => {
      const lockedOnly = [mockUserBadges[1]]
      axios.get.mockResolvedValue({ data: lockedOnly })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.queryByText('Succès débloqués')).not.toBeInTheDocument()
        expect(screen.getByText('Succès à débloquer (1)')).toBeInTheDocument()
      })
    })
  })

  describe('AchievementsPage - useEffect Dependencies', () => {
    it('refetches data when user changes', async () => {
      axios.get.mockResolvedValue({ data: [] })
      
      const { unmount } = render(<AchievementsPage />, { 
        wrapper: createWrapper({ userId: 123 }) 
      })
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/userbadges/user/123')
      })

      unmount()
      
      render(<AchievementsPage />, { 
        wrapper: createWrapper({ userId: 456 }) 
      })
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/userbadges/user/456')
      })
    })
  })

  describe('AchievementsPage - Progress Calculation', () => {
    it('calculates and displays correct progress percentage', async () => {
      const badgeWithProgress = [{
        badge: {
          id: 1,
          title: 'Progress Test',
          description: 'Testing progress',
          icon: 'FaStar',
          level: 1,
          color: 'blue.500',
          total: 10
        },
        current: 3,
        unlocked: false
      }]
      
      axios.get.mockResolvedValue({ data: badgeWithProgress })
      const wrapper = createWrapper({ userId: 123 })
      
      render(<AchievementsPage />, { wrapper })
      
      await waitFor(() => {
        expect(screen.getByText('3/10')).toBeInTheDocument()
      })
    })
  })
})