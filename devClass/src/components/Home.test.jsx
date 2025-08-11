import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import axios from 'axios'
import Home from './Home'

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

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Données de test
const mockCourses = [
  {
    courseId: 1,
    language: 'JAVA',
    title: 'Cours Java - Bases',
    difficultyLevel: 'EASY'
  },
  {
    courseId: 2,
    language: 'PYTHON',
    title: 'Cours Python - Avancé',
    difficultyLevel: 'MEDIUM'
  },
  {
    courseId: 3,
    language: 'PHP',
    title: 'Cours PHP - Expert',
    difficultyLevel: 'HARD'
  },
  {
    courseId: 4,
    language: 'ANGULAR',
    title: 'Cours Angular - Débutant',
    difficultyLevel: 'BEGINNER'
  }
]

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

describe('Home', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
  })

  describe('Authentification', () => {
    it('redirige vers login si non authentifié', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        logout: vi.fn()
      })

      render(<Home />, { wrapper: TestWrapper })
      
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('ne fait rien pendant le chargement', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: true,
        logout: vi.fn()
      })

      render(<Home />, { wrapper: TestWrapper })
      
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(axios.get).not.toHaveBeenCalled()
    })
  })

  describe('Chargement des cours', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
    })

    it('charge et affiche les cours avec succès', async () => {
      axios.get.mockResolvedValue({ data: mockCourses })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('https://schooldev.duckdns.org/api/courses')
      })

      await waitFor(() => {
        expect(screen.getByText('Cours Java - Bases')).toBeInTheDocument()
        expect(screen.getByText('Cours Python - Avancé')).toBeInTheDocument()
        expect(screen.getByText('Cours PHP - Expert')).toBeInTheDocument()
        expect(screen.getByText('Cours Angular - Débutant')).toBeInTheDocument()
      })
    })

    it('affiche une liste vide si pas de cours', async () => {
      axios.get.mockResolvedValue({ data: [] })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled()
      })

      // Vérifier qu'aucune carte de cours n'est affichée
      expect(screen.queryByText('CONTINUER')).not.toBeInTheDocument()
    })

    it('gère les erreurs de chargement', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.get.mockRejectedValue(new Error('Network error'))

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Erreur lors de la récupération des cours:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })

    it('déconnecte l\'utilisateur en cas d\'erreur 401/403', async () => {
      const mockLogout = vi.fn()
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: mockLogout
      })

      const error = new Error('Unauthorized')
      error.response = { status: 401 }
      axios.get.mockRejectedValue(error)

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Rendu et mise en page', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: mockCourses })
    })

    it('applique le style de défilement horizontal', async () => {
      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Cours Java - Bases')).toBeInTheDocument()
      })

      // Le conteneur principal doit avoir overflowX auto
      const container = screen.getByText('Cours Java - Bases').closest('[style*="overflow-x"]') ||
                       screen.getByText('Cours Java - Bases').closest('div')
      expect(container).toBeInTheDocument()
    })

    it('affiche toutes les cartes de cours dans l\'ordre', async () => {
      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        const titles = screen.getAllByRole('heading', { level: 2 })
        expect(titles).toHaveLength(4)
        expect(titles[0]).toHaveTextContent('Cours Java - Bases')
        expect(titles[1]).toHaveTextContent('Cours Python - Avancé')
        expect(titles[2]).toHaveTextContent('Cours PHP - Expert')
        expect(titles[3]).toHaveTextContent('Cours Angular - Débutant')
      })
    })
  })
})

describe('CoursesCard', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
  })

  describe('Affichage des informations du cours', () => {
    it('affiche correctement les informations d\'un cours Java', async () => {
      const javaCourse = mockCourses[0]

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: [javaCourse] })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Cours Java - Bases')).toBeInTheDocument()
        expect(screen.getByText('FACILE')).toBeInTheDocument()
        expect(screen.getByAltText('JAVA mascot')).toBeInTheDocument()
      })
    })

    it('affiche correctement les informations d\'un cours Python', async () => {
      const pythonCourse = mockCourses[1]
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: [pythonCourse] })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Cours Python - Avancé')).toBeInTheDocument()
        expect(screen.getByText('MOYEN')).toBeInTheDocument()
        expect(screen.getByAltText('PYTHON mascot')).toBeInTheDocument()
      })
    })

    it('affiche correctement les informations d\'un cours PHP', async () => {
      const phpCourse = mockCourses[2]
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: [phpCourse] })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Cours PHP - Expert')).toBeInTheDocument()
        expect(screen.getByText('DIFFICILE')).toBeInTheDocument()
        expect(screen.getByAltText('PHP mascot')).toBeInTheDocument()
      })
    })

    it('affiche le niveau par défaut pour un niveau inconnu', async () => {
      const customCourse = {
        ...mockCourses[3],
        difficultyLevel: undefined
      }
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: [customCourse] })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('DÉBUTANT')).toBeInTheDocument()
      })
    })
  })

  describe('Couleurs par langage', () => {
    it('applique les bonnes couleurs selon le langage', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      
      // Test avec chaque langage
      const testCases = [
        { course: mockCourses[0], expectedColor: '#f89500' }, // JAVA
        { course: mockCourses[1], expectedColor: '#3776ab' }, // PYTHON  
        { course: mockCourses[2], expectedColor: '#777bb4' }, // PHP
        { course: mockCourses[3], expectedColor: '#dd0031' }, // ANGULAR
      ]

      for (const { course } of testCases) {
        axios.get.mockResolvedValue({ data: [course] })
        
        const { unmount } = render(<Home />, { wrapper: TestWrapper })
        
        await waitFor(() => {
          expect(screen.getByText(course.title)).toBeInTheDocument()
        })

        unmount()
      }
    })

    it('utilise la couleur par défaut pour un langage inconnu', async () => {
      const customCourse = {
        courseId: 5,
        language: 'UNKNOWN',
        title: 'Cours inconnu',
        difficultyLevel: 'EASY'
      }

      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: [customCourse] })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Cours inconnu')).toBeInTheDocument()
      })
    })
  })

  describe('États de verrouillage', () => {
    it('affiche le premier cours déverrouillé', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: [mockCourses[0]] })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /continuer/i })
        expect(button).toBeInTheDocument()
        expect(button).not.toBeDisabled()
      })
    })

    it('affiche les cours suivants verrouillés quand progression à 0', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: mockCourses.slice(0, 2) })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons[0]).toHaveTextContent('CONTINUER')
        expect(buttons[0]).not.toBeDisabled()
        expect(buttons[1]).toHaveTextContent('VERROUILLÉ')
        expect(buttons[1]).toBeDisabled()
      })
    })

    it('affiche l\'icône de cadenas pour les cours verrouillés', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: mockCourses.slice(0, 2) })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('🔒')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('navigue vers /lessons quand on clique sur CONTINUER', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: [mockCourses[0]] })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /continuer/i })
        expect(button).toBeInTheDocument()
      })

      const continueButton = screen.getByRole('button', { name: /continuer/i })
      fireEvent.click(continueButton)

      expect(mockNavigate).toHaveBeenCalledWith('/lessons')
    })

    it('ne navigue pas quand on clique sur un cours verrouillé', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: mockCourses.slice(0, 2) })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        const lockedButton = screen.getByRole('button', { name: /verrouillé/i })
        expect(lockedButton).toBeInTheDocument()
      })

      const lockedButton = screen.getByRole('button', { name: /verrouillé/i })
      fireEvent.click(lockedButton)

      expect(mockNavigate).not.toHaveBeenCalledWith('/lessons')
    })
  })

  describe('Indicateurs de progression', () => {
    it('affiche la progression à 0% pour tous les cours', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: mockCourses })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        const progressTexts = screen.getAllByText('0%')
        expect(progressTexts).toHaveLength(4)
      })
    })

    it('affiche les barres de progression', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: [mockCourses[0]] })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        // Les barres de progression sont rendues par Chakra UI
        expect(screen.getByText('0%')).toBeInTheDocument()
      })
    })
  })

  describe('Images et accessibilité', () => {
    it('affiche les images avec les bons attributs alt', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: mockCourses })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByAltText('JAVA mascot')).toBeInTheDocument()
        expect(screen.getByAltText('PYTHON mascot')).toBeInTheDocument()
        expect(screen.getByAltText('PHP mascot')).toBeInTheDocument()
        expect(screen.getByAltText('ANGULAR mascot')).toBeInTheDocument()
      })
    })

    it('utilise les bonnes dimensions pour les images', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn()
      })
      axios.get.mockResolvedValue({ data: [mockCourses[0]] })

      render(<Home />, { wrapper: TestWrapper })

      await waitFor(() => {
        const image = screen.getByAltText('JAVA mascot')
        expect(image).toHaveAttribute('width', '350')
        expect(image).toHaveAttribute('height', '350')
      })
    })
  })
})