import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import Output from './Output'
import { BrowserRouter } from 'react-router-dom'

// Mock dependencies
const mockNavigate = vi.fn()
const mockToast = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    useToast: () => mockToast
  }
})

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { userId: 1 }
  })
}))

vi.mock('../api', () => ({
  executeCode: vi.fn(),
  getUserExercises: vi.fn(),
  updateUserExercise: vi.fn()
}))

vi.mock('../constants', () => ({
  CODE_SNIPPETS: {
    javascript: 'console.log("Hello JavaScript");',
    python: 'print("Hello Python")'
  }
}))

import { executeCode, getUserExercises, updateUserExercise } from '../api'

// Test component wrapper
import PropTypes from 'prop-types'

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

TestWrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('Output Component', () => {
  const mockEditorRef = {
    current: {
      getValue: vi.fn(() => 'test code'),
      setValue: vi.fn()
    }
  }

  const defaultProps = {
    editorRef: mockEditorRef,
    language: 'javascript',
    exercise: null,
    onChallengeCompleted: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockToast.mockClear()
    mockNavigate.mockClear()
  })

  it('renders initial state correctly', () => {
    render(
      <TestWrapper>
        <Output {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getByText('Output')).toBeInTheDocument()
    expect(screen.getByText('Run Code')).toBeInTheDocument()
    expect(screen.getByText('Click "Run Code" to see the output here')).toBeInTheDocument()
  })

  it('handles successful code execution', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Hello World\n',
        stderr: ''
      }
    })

    render(
      <TestWrapper>
        <Output {...defaultProps} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    expect(executeCode).toHaveBeenCalledWith('javascript', 'test code')
  })

  it('handles code execution with stderr', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Error occurred',
        stderr: 'Some error'
      }
    })

    render(
      <TestWrapper>
        <Output {...defaultProps} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })
  })

  it('handles empty source code', async () => {
    const emptyEditorRef = {
      current: {
        getValue: vi.fn(() => ''),
        setValue: vi.fn()
      }
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} editorRef={emptyEditorRef} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    expect(executeCode).not.toHaveBeenCalled()
  })

  it('handles API error during code execution', async () => {
    executeCode.mockRejectedValue(new Error('API Error'))

    render(
      <TestWrapper>
        <Output {...defaultProps} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "An error occurred.",
        description: "API Error",
        status: "error",
        duration: 6000,
      })
    })
  })

  it('handles exercise with test cases - exercise 7', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Hello\nWorld',
        stderr: ''
      }
    })

    // Mock getUserExercises to return empty array to avoid API calls
    getUserExercises.mockResolvedValue([])

    const exercise7 = {
      exerciseId: 7,
      testCases: 'Hello\nWorld'
    }

    const mockEditorWithSystemOut = {
      current: {
        getValue: vi.fn(() => 'System.out.println("Hello");\nSystem.out.println("World");'),
        setValue: vi.fn()
      }
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exercise7} editorRef={mockEditorWithSystemOut} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Résultats des Tests')).toBeInTheDocument()
      expect(screen.getByText('Test 1: Sortie attendue')).toBeInTheDocument()
      expect(screen.getByText('Test 2: Nombre d\'instructions d\'affichage')).toBeInTheDocument()
    })
  })

  it('handles exercise 8 - variable declaration', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: '25',
        stderr: ''
      }
    })

    // Mock getUserExercises to return empty array to avoid API calls
    getUserExercises.mockResolvedValue([])

    const exercise8 = {
      exerciseId: 8,
      testCases: '25'
    }

    const mockEditorWithAge = {
      current: {
        getValue: vi.fn(() => 'int age = 25;\nSystem.out.println(age);'),
        setValue: vi.fn()
      }
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exercise8} editorRef={mockEditorWithAge} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Test 2: Déclaration de la variable age')).toBeInTheDocument()
      expect(screen.getByText('Test 3: Affichage de la variable age')).toBeInTheDocument()
    })
  })

  it('handles exercise 9 - string variable', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'John',
        stderr: ''
      }
    })

    // Mock getUserExercises to return empty array to avoid API calls
    getUserExercises.mockResolvedValue([])

    const exercise9 = {
      exerciseId: 9,
      testCases: 'John'
    }

    const mockEditorWithPrenom = {
      current: {
        getValue: vi.fn(() => 'String prenom = "John";\nSystem.out.println(prenom);'),
        setValue: vi.fn()
      }
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exercise9} editorRef={mockEditorWithPrenom} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Test 2: Déclaration de la variable prenom')).toBeInTheDocument()
      expect(screen.getByText('Test 3: Affichage de la variable prenom')).toBeInTheDocument()
    })
  })

  it('handles exercise 11 - double variable', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: '23.5',
        stderr: ''
      }
    })

    // Mock getUserExercises to return empty array to avoid API calls
    getUserExercises.mockResolvedValue([])

    const exercise11 = {
      exerciseId: 11,
      testCases: '23.5'
    }

    const mockEditorWithTemperature = {
      current: {
        getValue: vi.fn(() => 'double temperature = 23.5;\nSystem.out.println(temperature);'),
        setValue: vi.fn()
      }
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exercise11} editorRef={mockEditorWithTemperature} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Test 2: Déclaration de la variable temperature')).toBeInTheDocument()
      expect(screen.getByText('Test 3: Affichage de la variable temperature')).toBeInTheDocument()
    })
  })

  it('handles default test case validation', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Expected Output',
        stderr: ''
      }
    })

    // Mock getUserExercises to return empty array to avoid API calls
    getUserExercises.mockResolvedValue([])

    const exerciseDefault = {
      exerciseId: 1,
      testCases: 'Expected Output'
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exerciseDefault} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument()
    })
  })

  it('handles challenge completion', async () => {
    const mockOnChallengeCompleted = vi.fn()
    executeCode.mockResolvedValue({
      run: {
        output: 'Expected Output',
        stderr: ''
      }
    })

    const challengeExercise = {
      exerciseId: 1,
      testCases: 'Expected Output',
      type: 'challenge'
    }

    render(
      <TestWrapper>
        <Output 
          {...defaultProps} 
          exercise={challengeExercise} 
          onChallengeCompleted={mockOnChallengeCompleted}
        />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(mockOnChallengeCompleted).toHaveBeenCalled()
      expect(mockToast).toHaveBeenCalledWith({
        title: "🏆 DÉFI RÉUSSI !",
        description: "Félicitations ! Vous avez relevé le défi avec succès !",
        status: "success",
        duration: 8000,
      })
    })
  })

  it('handles challenge partial completion', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Wrong Output',
        stderr: ''
      }
    })

    const challengeExercise = {
      exerciseId: 1,
      testCases: 'Expected Output',
      type: 'challenge'
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={challengeExercise} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Continuez !",
        description: "0/1 tests réussis - Vous pouvez y arriver !",
        status: "info",
        duration: 4000,
      })
    })
  })

  it('handles successful exercise completion with API update', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Expected Output',
        stderr: ''
      }
    })

    getUserExercises.mockResolvedValue([
      { id: 1, exercise: { exerciseId: 1 }, success: false }
    ])
    updateUserExercise.mockResolvedValue({})

    const exercise = {
      exerciseId: 1,
      testCases: 'Expected Output'
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exercise} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(updateUserExercise).toHaveBeenCalledWith(1, true)
      expect(mockToast).toHaveBeenCalledWith({
        title: "🎉 Exercice réussi !",
        description: "Tous les tests sont passés. L'exercice a été marqué comme réussi.",
        status: "success",
        duration: 6000,
      })
    })
  })

  it('handles already completed exercise', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Expected Output',
        stderr: ''
      }
    })

    getUserExercises.mockResolvedValue([
      { id: 1, exercise: { exerciseId: 1 }, success: true }
    ])

    const exercise = {
      exerciseId: 1,
      testCases: 'Expected Output'
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exercise} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Tous les tests réussis!",
        description: "L'exercice était déjà marqué comme réussi.",
        status: "success",
        duration: 4000,
      })
    })
  })

  it('handles API error during exercise update', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Expected Output',
        stderr: ''
      }
    })

    getUserExercises.mockRejectedValue(new Error('API Error'))

    const exercise = {
      exerciseId: 1,
      testCases: 'Expected Output'
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exercise} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Tous les tests réussis!",
        description: "Impossible de sauvegarder le progrès, mais tous les tests sont passés.",
        status: "warning",
        duration: 4000,
      })
    })
  })

  it('handles failed tests without user/exercise context', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Wrong Output',
        stderr: ''
      }
    })

    const exercise = {
      exerciseId: 1,
      testCases: 'Expected Output'
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exercise} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Certains tests ont échoué",
        description: "0/1 tests réussis",
        status: "warning",
        duration: 4000,
      })
    })
  })

  it('handles restart functionality', async () => {
    // First complete the exercise to show restart button
    executeCode.mockResolvedValue({
      run: {
        output: 'Expected Output',
        stderr: ''
      }
    })

    getUserExercises.mockResolvedValue([
      { id: 1, exercise: { exerciseId: 1 }, success: false }
    ])
    updateUserExercise.mockResolvedValue({})

    const exerciseWithTestCases = {
      exerciseId: 1,
      testCases: 'Expected Output',
      starterCode: 'starter code'
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exerciseWithTestCases} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Recommencer')).toBeInTheDocument()
    })

    const restartButton = screen.getByText('Recommencer')
    
    await act(async () => {
      fireEvent.click(restartButton)
    })

    expect(mockEditorRef.current.setValue).toHaveBeenCalledWith('starter code')
    expect(mockToast).toHaveBeenCalledWith({
      title: "Exercice réinitialisé",
      description: "Vous pouvez recommencer l'exercice",
      status: "info",
      duration: 2000,
    })
  })

  it('handles restart with default code snippet', async () => {
    // Simulate completion state by calling handleRestart indirectly
    executeCode.mockResolvedValue({
      run: {
        output: 'Expected Output',
        stderr: ''
      }
    })

    getUserExercises.mockResolvedValue([
      { id: 1, exercise: { exerciseId: 1 }, success: false }
    ])
    updateUserExercise.mockResolvedValue({})

    const exerciseWithTestCases = {
      exerciseId: 1,
      testCases: 'Expected Output'
      // No starterCode, so should use default snippet
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exerciseWithTestCases} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Recommencer')).toBeInTheDocument()
    })

    const restartButton = screen.getByText('Recommencer')
    
    await act(async () => {
      fireEvent.click(restartButton)
    })

    expect(mockEditorRef.current.setValue).toHaveBeenCalledWith('console.log("Hello JavaScript");')
  })

  it('handles return to lessons', async () => {
    // Complete exercise first to show the button
    executeCode.mockResolvedValue({
      run: {
        output: 'Expected Output',
        stderr: ''
      }
    })

    getUserExercises.mockResolvedValue([
      { id: 1, exercise: { exerciseId: 1 }, success: false }
    ])
    updateUserExercise.mockResolvedValue({})

    const exerciseWithTestCases = {
      exerciseId: 1,
      testCases: 'Expected Output'
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exerciseWithTestCases} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Retour aux leçons')).toBeInTheDocument()
    })

    const returnButton = screen.getByText('Retour aux leçons')
    
    await act(async () => {
      fireEvent.click(returnButton)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/lessons')
  })

  it('displays completed challenge alert', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Expected Output',
        stderr: ''
      }
    })

    const challengeExercise = {
      exerciseId: 1,
      testCases: 'Expected Output',
      type: 'challenge'
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={challengeExercise} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('🏆 DÉFI RELEVÉ ! Bravo Champion !')).toBeInTheDocument()
      expect(screen.getByText(/Félicitations ! Vous avez brillamment réussi/)).toBeInTheDocument()
    })
  })

  it('displays completed exercise alert with buttons', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'Expected Output',
        stderr: ''
      }
    })

    getUserExercises.mockResolvedValue([
      { id: 1, exercise: { exerciseId: 1 }, success: false }
    ])
    updateUserExercise.mockResolvedValue({})

    const exercise = {
      exerciseId: 1,
      testCases: 'Expected Output'
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exercise} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('🎉 Bravo ! Exercice réussi !')).toBeInTheDocument()
      expect(screen.getByText(/Félicitations ! Vous avez réussi cet exercice/)).toBeInTheDocument()
      expect(screen.getByText('Recommencer')).toBeInTheDocument()
      expect(screen.getByText('Retour aux leçons')).toBeInTheDocument()
    })
  })

  it('shows loading state during code execution', async () => {
    let resolveExecuteCode
    const executeCodePromise = new Promise(resolve => {
      resolveExecuteCode = resolve
    })
    executeCode.mockReturnValue(executeCodePromise)

    render(
      <TestWrapper>
        <Output {...defaultProps} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    // Button should show loading state
    expect(runButton).toBeDisabled()

    // Resolve the promise
    await act(async () => {
      resolveExecuteCode({
        run: {
          output: 'Hello World',
          stderr: ''
        }
      })
    })

    await waitFor(() => {
      expect(runButton).not.toBeDisabled()
    })
  })

  it('handles exercise 9 with empty prenom match', async () => {
    executeCode.mockResolvedValue({
      run: {
        output: 'John',
        stderr: ''
      }
    })

    // Mock getUserExercises to return empty array to avoid API calls
    getUserExercises.mockResolvedValue([])

    const exercise9 = {
      exerciseId: 9,
      testCases: 'John'
    }

    const mockEditorWithoutPrenom = {
      current: {
        getValue: vi.fn(() => 'System.out.println("John");'), // No prenom variable
        setValue: vi.fn()
      }
    }

    render(
      <TestWrapper>
        <Output {...defaultProps} exercise={exercise9} editorRef={mockEditorWithoutPrenom} />
      </TestWrapper>
    )

    const runButton = screen.getByText('Run Code')
    
    await act(async () => {
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Test 1: Sortie attendue (valeur de prenom)')).toBeInTheDocument()
      // The text should show the actual implementation behavior - empty expectedPrenom results in "Une valeur de prénom"
      expect(screen.getByText(/Attendu:.*Une valeur de prénom/)).toBeInTheDocument()
    })
  })
})