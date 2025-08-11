import { render, screen } from '@testing-library/react'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import Challenge from './Challenge'

// Mock dependencies
import PropTypes from 'prop-types'

vi.mock('@monaco-editor/react', () => {
  const Editor = ({ onMount, onChange, value }) => {
    const handleChange = (e) => {
      onChange && onChange(e.target.value)
    }
    const handleMount = () => {
      const mockEditor = { focus: vi.fn() }
      onMount && onMount(mockEditor)
    }
    return (
      <textarea
        data-testid="monaco-editor"
        defaultValue={value}
        onChange={handleChange}
        onFocus={handleMount}
      />
    )
  }
  Editor.propTypes = {
    onMount: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.string
  }
  return { Editor }
})

vi.mock('./LanguageSelector', () => ({
  default: ({ language, onSelect }) => (
    <select
      data-testid="language-selector"
      value={language}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
    </select>
  )
}))

vi.mock('./Output', () => ({
  default: ({ onChallengeCompleted }) => (
    <div data-testid="output-component">
      <button
        data-testid="complete-challenge"
        onClick={onChallengeCompleted}
      >
        Complete Challenge
      </button>
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

vi.mock('../constants', () => ({
  CODE_SNIPPETS: {
    javascript: 'console.log("Hello JavaScript");',
    python: 'print("Hello Python")'
  }
}))

describe('Challenge Component', () => {
  let mockLocalStorage = {}

  beforeEach(() => {
    // Mock localStorage
    window.localStorage = {
      getItem: vi.fn((key) => mockLocalStorage[key]),
      setItem: vi.fn((key, value) => {
        mockLocalStorage[key] = value
      }),
      removeItem: vi.fn((key) => {
        delete mockLocalStorage[key]
      })
    }

    // Mock timers
    vi.useFakeTimers()

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true
    })

    mockLocalStorage = {}
  })

  it('renders initial challenge state correctly', () => {
    render(<Challenge />)
    
    expect(screen.getByText('🏆 DÉFI: Série de Fibonacci')).toBeInTheDocument()
    expect(screen.getByText(/Implémentez une fonction qui calcule/)).toBeInTheDocument()
    expect(screen.getByText('Langage: JAVASCRIPT')).toBeInTheDocument()
    expect(screen.getByText(/⏱️ 10:00/)).toBeInTheDocument()
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    expect(screen.getByTestId('language-selector')).toBeInTheDocument()
  })

  it('shows blocked state when user is blocked', () => {
    // Set blocked until 2 hours from now
    const futureTime = new Date()
    futureTime.setHours(futureTime.getHours() + 2)
    mockLocalStorage['challengeBlockedUntil'] = futureTime.toISOString()
    
    render(<Challenge />)
    
    expect(screen.getByText('⏰')).toBeInTheDocument()
    expect(screen.getByText('Accès temporairement bloqué')).toBeInTheDocument()
    expect(screen.getByText(/Vous avez échoué au défi précédent/)).toBeInTheDocument()
    expect(screen.getByText(/02:00:00/)).toBeInTheDocument()
    expect(screen.getByText('Utilisez ce temps pour réviser et vous préparer !')).toBeInTheDocument()
    
    // Main challenge content should not be visible
    expect(screen.queryByText('🏆 DÉFI: Série de Fibonacci')).not.toBeInTheDocument()
  })

  it('handles expired blocking time', () => {
    // Set blocked until past time
    const pastTime = new Date()
    pastTime.setHours(pastTime.getHours() - 1)
    mockLocalStorage['challengeBlockedUntil'] = pastTime.toISOString()
    
    render(<Challenge />)
    
    // Should show normal challenge (not blocked)
    expect(screen.getByText('🏆 DÉFI: Série de Fibonacci')).toBeInTheDocument()
    expect(screen.queryByText('Accès temporairement bloqué')).not.toBeInTheDocument()
    
    // Should remove expired block from localStorage
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('challengeBlockedUntil')
  })

  it('formats block time correctly', () => {
    const futureTime = new Date()
    futureTime.setHours(futureTime.getHours() + 1, futureTime.getMinutes() + 30) // 1h 30m from now
    mockLocalStorage['challengeBlockedUntil'] = futureTime.toISOString()
    
    render(<Challenge />)
    
    expect(screen.getByText(/01:30:00/)).toBeInTheDocument()
  })
})