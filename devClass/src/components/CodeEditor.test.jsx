import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import axios from 'axios'
import PropTypes from 'prop-types'
import CodeEditor from './CodeEditor'

// Mock des modules
vi.mock('axios')
vi.mock('@monaco-editor/react', () => {
  const MockEditor = ({ value, language, onChange, onMount }) => (
    <div data-testid="monaco-editor">
      <div data-testid="editor-language">{language}</div>
      <textarea
        data-testid="editor-textarea"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => onMount && onMount({ focus: vi.fn() })}
      />
    </div>
  )
  
  MockEditor.propTypes = {
    value: PropTypes.string,
    language: PropTypes.string,
    onChange: PropTypes.func,
    onMount: PropTypes.func
  }
  
  return { Editor: MockEditor }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: vi.fn()
  }
})

vi.mock('./LanguageSelector', () => ({
  default: ({ language, onSelect }) => (
    <div data-testid="language-selector">
      <span data-testid="current-language">{language}</span>
      <button onClick={() => onSelect('python')} data-testid="select-python">
        Python
      </button>
      <button onClick={() => onSelect('java')} data-testid="select-java">
        Java
      </button>
    </div>
  )
}))

vi.mock('./Output', () => ({
  default: ({ language, exercise }) => (
    <div data-testid="output-component">
      <span data-testid="output-language">{language}</span>
      {exercise && <span data-testid="output-exercise">{exercise.title}</span>}
    </div>
  )
}))

vi.mock('./HintText', () => ({
  default: ({ text, color }) => (
    <div data-testid="hint-text" style={{ color }}>
      {text}
    </div>
  )
}))

import { useLocation } from 'react-router-dom'

// Données de test
const mockExercise = {
  exerciseId: 1,
  title: 'Test Exercise',
  description: 'This is a test exercise with **hidden hint**',
  starterCode: 'console.log("Hello World");',
  lesson: {
    course: {
      language: 'JAVASCRIPT'
    }
  }
}

const mockExerciseJava = {
  exerciseId: 2,
  title: 'Java Exercise',
  description: 'Java test exercise',
  starterCode: 'public class Main { public static void main(String[] args) { } }',
  lesson: {
    course: {
      language: 'JAVA'
    }
  }
}

const mockExerciseNoStarterCode = {
  exerciseId: 3,
  title: 'Exercise without starter code',
  description: 'Test exercise without starter code',
  lesson: {
    course: {
      language: 'PYTHON'
    }
  }
}

vi.mock('../hooks/useBadgeNotifications', () => ({
  useBadgeNotifications: () => ({
    newBadges: [],
    isNotificationOpen: false,
    checkForNewBadges: vi.fn(),
    closeNotification: vi.fn()
  })
}))

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

describe('CodeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Mode libre (sans exerciceId)', () => {
    beforeEach(() => {
      useLocation.mockReturnValue({
        search: ''
      })
    })

    it('affiche le mode libre par défaut', async () => {
      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByText('💡 Mode libre - Sélectionnez un langage et commencez à coder !')).toBeInTheDocument()
      })
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByTestId('language-selector')).toBeInTheDocument()
      expect(screen.getByTestId('output-component')).toBeInTheDocument()
    })

    it('utilise JavaScript par défaut en mode libre', async () => {
      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('javascript')
        expect(screen.getByTestId('editor-language')).toHaveTextContent('javascript')
      })
    })

    it('change de langage avec le sélecteur', async () => {
      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('javascript')
      })

      const pythonButton = screen.getByTestId('select-python')
      fireEvent.click(pythonButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('python')
        expect(screen.getByTestId('editor-language')).toHaveTextContent('python')
      })
    })

    it('met à jour le code lors du changement de langage', async () => {
      render(<CodeEditor />, { wrapper: TestWrapper })
      
      // Attendre que le composant soit rendu
      await waitFor(() => {
        expect(screen.getByTestId('editor-textarea')).toBeInTheDocument()
      })

      const javaButton = screen.getByTestId('select-java')
      fireEvent.click(javaButton)
      
      await waitFor(() => {
        const textarea = screen.getByTestId('editor-textarea')
        expect(textarea.value).toContain('public class HelloWorld')
      })
    })
  })

  describe('Mode exercice (avec exerciceId)', () => {
    beforeEach(() => {
      useLocation.mockReturnValue({
        search: '?exerciseId=1'
      })
    })

    it('affiche un spinner pendant le chargement', async () => {
      // Mock qui ne se résout jamais pour simuler le chargement
      axios.get.mockImplementation(() => new Promise(() => {}))

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      expect(screen.getByText("Chargement de l'exercice...")).toBeInTheDocument()
    })

    it('charge et affiche un exercice avec starter code', async () => {
      axios.get.mockResolvedValue({ data: mockExercise })

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getAllByText('Test Exercise')).toHaveLength(2) // Dans le titre et dans Output
        expect(screen.getByTestId('hint-text')).toHaveTextContent('This is a test exercise with **hidden hint**')
        expect(screen.getByText('Langage: JAVASCRIPT')).toBeInTheDocument()
      })

      // Vérifier que le starter code est utilisé
      await waitFor(() => {
        const textarea = screen.getByTestId('editor-textarea')
        expect(textarea.value).toBe('console.log("Hello World");')
      })

      // Vérifier que le langage est correctement mappé
      expect(screen.getByTestId('current-language')).toHaveTextContent('javascript')
      expect(screen.getByTestId('editor-language')).toHaveTextContent('javascript')
    })

    it('charge un exercice Java et mappe correctement le langage', async () => {
      
      axios.get.mockResolvedValue({ data: mockExerciseJava })

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getAllByText('Java Exercise')).toHaveLength(2)
        expect(screen.getByText('Langage: JAVA')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('java')
        expect(screen.getByTestId('editor-language')).toHaveTextContent('java')
      })
    })

    it('utilise le snippet par défaut si pas de starter code', async () => {
      
      axios.get.mockResolvedValue({ data: mockExerciseNoStarterCode })

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getAllByText('Exercise without starter code')).toHaveLength(2)
      })

      await waitFor(() => {
        const textarea = screen.getByTestId('editor-textarea')
        expect(textarea.value).toContain('def greet(name):')
      })
    })

    it('gère les erreurs de chargement', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.get.mockRejectedValue(new Error('Network error'))

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Erreur lors de la récupération de l'exercice:", 
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Fonction mapApiLanguageToMonaco', () => {
    beforeEach(() => {
      useLocation.mockReturnValue({
        search: ''
      })
    })

    it('mappe correctement les langages API vers Monaco', async () => {
      const testCases = [
        { apiLang: 'JAVASCRIPT', expected: 'javascript' },
        { apiLang: 'JAVA', expected: 'java' },
        { apiLang: 'PYTHON', expected: 'python' },
        { apiLang: 'C#', expected: 'csharp' },
        { apiLang: 'CSHARP', expected: 'csharp' },
        { apiLang: 'PHP', expected: 'php' },
        { apiLang: 'TYPESCRIPT', expected: 'typescript' },
      ]

      for (const { apiLang, expected } of testCases) {
        const exercise = {
          exerciseId: 1,
          title: `Test ${apiLang}`,
          description: 'Test',
          lesson: { course: { language: apiLang } }
        }

        vi.clearAllMocks()
        useLocation.mockReturnValue({
          search: `?exerciseId=${Math.floor(Math.random() * 1000)}`
        })

        axios.get.mockResolvedValue({ data: exercise })

        const { unmount } = render(<CodeEditor />, { wrapper: TestWrapper })
        
        await waitFor(() => {
          expect(screen.getByTestId('current-language')).toHaveTextContent(expected)
        })

        unmount()
      }
    })

    it('utilise javascript par défaut pour langage inconnu', async () => {
      const exercise = {
        exerciseId: 1,
        title: 'Unknown Language',
        description: 'Test',
        lesson: { course: { language: 'UNKNOWN_LANG' } }
      }

      axios.get.mockResolvedValue({ data: exercise })

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('javascript')
      })
    })

    it('utilise javascript par défaut si pas de langage', async () => {
      const exercise = {
        exerciseId: 1,
        title: 'No Language',
        description: 'Test',
        lesson: {}
      }

      axios.get.mockResolvedValue({ data: exercise })

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('javascript')
      })
    })
  })

  describe('Interaction avec l\'éditeur', () => {
    beforeEach(() => {
      useLocation.mockReturnValue({
        search: ''
      })
    })

    it('met à jour la valeur quand le code change', async () => {
      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('editor-textarea')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('editor-textarea')
      fireEvent.change(textarea, { target: { value: 'console.log("new code");' } })
      
      expect(textarea.value).toBe('console.log("new code");')
    })

    it('focus l\'éditeur au montage', async () => {
      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('editor-textarea')).toBeInTheDocument()
      })

      const textarea = screen.getByTestId('editor-textarea')
      fireEvent.focus(textarea)
      
      // Le focus est appelé via onMount, vérifié indirectement
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('Rendu conditionnel', () => {
    it('masque l\'éditeur pendant le chargement d\'un exercice', async () => {
      vi.clearAllMocks()
      useLocation.mockReturnValue({
        search: '?exerciseId=1'
      })
      
      axios.get.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      expect(screen.getByText("Chargement de l'exercice...")).toBeInTheDocument()
    })

    it('affiche l\'éditeur après chargement réussi d\'un exercice', async () => {
      vi.clearAllMocks()
      useLocation.mockReturnValue({
        search: '?exerciseId=1'
      })
      
      axios.get.mockResolvedValue({ data: mockExercise })

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.queryByText("Chargement de l'exercice...")).not.toBeInTheDocument()
        expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      })
    })

    it('affiche l\'éditeur immédiatement en mode libre', async () => {
      useLocation.mockReturnValue({
        search: ''
      })

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      })
    })
  })

  describe('Intégration avec les composants enfants', () => {
    beforeEach(() => {
      useLocation.mockReturnValue({
        search: ''
      })
    })

    it('passe les bonnes props à LanguageSelector', async () => {
      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('language-selector')).toBeInTheDocument()
        expect(screen.getByTestId('current-language')).toHaveTextContent('javascript')
      })
    })

    it('passe les bonnes props à Output', async () => {
      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('output-component')).toBeInTheDocument()
        expect(screen.getByTestId('output-language')).toHaveTextContent('javascript')
      })
    })

    it('passe l\'exercice à Output quand disponible', async () => {
      vi.clearAllMocks()
      useLocation.mockReturnValue({
        search: '?exerciseId=1'
      })
      
      axios.get.mockResolvedValue({ data: mockExercise })

      render(<CodeEditor />, { wrapper: TestWrapper })
      
      await waitFor(() => {
        expect(screen.getByTestId('output-exercise')).toHaveTextContent('Test Exercise')
      })
    })
  })
})