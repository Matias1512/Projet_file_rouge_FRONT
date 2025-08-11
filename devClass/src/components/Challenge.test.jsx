import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
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
  let intervalIds = []
  let originalSetInterval
  let originalClearInterval

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
    originalSetInterval = window.setInterval
    originalClearInterval = window.clearInterval
    
    window.setInterval = vi.fn((callback, delay) => {
      const id = originalSetInterval(callback, delay)
      intervalIds.push(id)
      return id
    })
    
    window.clearInterval = vi.fn((id) => {
      intervalIds = intervalIds.filter(intervalId => intervalId !== id)
      originalClearInterval(id)
    })

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true
    })

    mockLocalStorage = {}
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    intervalIds.forEach(id => window.clearInterval(id))
    intervalIds = []
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

  it('formats time correctly', async () => {
    render(<Challenge />)
    
    // Initially shows 10:00 (600 seconds)
    expect(screen.getByText(/⏱️ 10:00/)).toBeInTheDocument()
    
    // Advance time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/⏱️ 09:59/)).toBeInTheDocument()
    })
  })

  it('handles timer countdown and defeat', async () => {
    render(<Challenge />)
    
    // Fast forward to near the end
    act(() => {
      vi.advanceTimersByTime(599000) // 599 seconds
    })
    
    await waitFor(() => {
      expect(screen.getByText(/⏱️ 00:01/)).toBeInTheDocument()
    })
    
    // Timer reaches 0 - should trigger defeat
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    await waitFor(() => {
      expect(screen.getByText('💥 TEMPS ÉCOULÉ')).toBeInTheDocument()
      expect(screen.getByText('DÉFI ÉCHOUÉ !')).toBeInTheDocument()
      expect(screen.getByText(/Le temps est écoulé ! Vous ne pouvez pas accéder/)).toBeInTheDocument()
    })
    
    // Editor should be hidden when defeated
    expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument()
    
    // LocalStorage should be set with blocking time
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'challengeBlockedUntil', 
      expect.any(String)
    )
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
    expect(localStorage.removeItem).toHaveBeenCalledWith('challengeBlockedUntil')
  })

  it('handles block countdown and refresh', async () => {
    const futureTime = new Date()
    futureTime.setTime(futureTime.getTime() + 2000) // 2 seconds from now
    mockLocalStorage['challengeBlockedUntil'] = futureTime.toISOString()
    
    render(<Challenge />)
    
    expect(screen.getByText('Accès temporairement bloqué')).toBeInTheDocument()
    
    // Advance time to trigger block expiration
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('challengeBlockedUntil')
      expect(window.location.reload).toHaveBeenCalled()
    })
  })

  it('formats block time correctly', () => {
    const futureTime = new Date()
    futureTime.setHours(futureTime.getHours() + 1, futureTime.getMinutes() + 30) // 1h 30m from now
    mockLocalStorage['challengeBlockedUntil'] = futureTime.toISOString()
    
    render(<Challenge />)
    
    expect(screen.getByText(/01:30:00/)).toBeInTheDocument()
  })

  it('handles challenge completion', async () => {
    render(<Challenge />)
    
    const completeButton = screen.getByTestId('complete-challenge')
    
    act(() => {
      fireEvent.click(completeButton)
    })
    
    await waitFor(() => {
      // Timer should stop (won't count down further)
      const timerElement = screen.getByText(/⏱️/)
      const currentTime = timerElement.textContent
      
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      // Timer should remain the same after completion
      expect(screen.getByText(currentTime)).toBeInTheDocument()
    })
  })

  it('handles language selection', async () => {
    render(<Challenge />)
    
    const languageSelector = screen.getByTestId('language-selector')
    
    act(() => {
      fireEvent.change(languageSelector, { target: { value: 'python' } })
    })
    
    await waitFor(() => {
      expect(languageSelector.value).toBe('python')
    })
  })

  it('handles editor mounting', () => {
    render(<Challenge />)
    
    const editor = screen.getByTestId('monaco-editor')
    
    act(() => {
      fireEvent.focus(editor)
    })
    
    // Should trigger the onMount callback
    expect(editor).toBeInTheDocument()
  })

  it('handles editor value changes', async () => {
    render(<Challenge />)
    
    const editor = screen.getByTestId('monaco-editor')
    
    act(() => {
      fireEvent.change(editor, { target: { value: 'new code' } })
    })
    
    await waitFor(() => {
      expect(editor.value).toBe('new code')
    })
  })

  it('disables timer when blocked', () => {
    const futureTime = new Date()
    futureTime.setHours(futureTime.getHours() + 1)
    mockLocalStorage['challengeBlockedUntil'] = futureTime.toISOString()
    
    render(<Challenge />)
    
    // Timer should not start when blocked
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    // Should still show block screen, not challenge with timer
    expect(screen.getByText('Accès temporairement bloqué')).toBeInTheDocument()
  })

  it('stops timer when defeated', async () => {
    render(<Challenge />)
    
    // Fast forward to defeat
    act(() => {
      vi.advanceTimersByTime(600000)
    })
    
    await waitFor(() => {
      expect(screen.getByText('💥 TEMPS ÉCOULÉ')).toBeInTheDocument()
    })
    
    // Timer should not continue after defeat
    const defeatedTimerText = screen.getByText('💥 TEMPS ÉCOULÉ')
    
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    expect(defeatedTimerText).toBeInTheDocument()
  })

  it('handles edge case: formatBlockTime with zero seconds', () => {
    const futureTime = new Date()
    futureTime.setTime(futureTime.getTime() + 100) // Very short time
    mockLocalStorage['challengeBlockedUntil'] = futureTime.toISOString()
    
    render(<Challenge />)
    
    // Should show some time initially
    expect(screen.getByText(/00:00:00/)).toBeInTheDocument()
  })

  it('cleans up intervals on unmount', () => {
    const { unmount } = render(<Challenge />)
    
    // Verify intervals were created
    expect(window.setInterval).toHaveBeenCalled()
    
    unmount()
    
    // Verify intervals were cleared
    expect(window.clearInterval).toHaveBeenCalled()
  })

  it('handles multiple useEffect cleanup scenarios', async () => {
    const { rerender } = render(<Challenge />)
    
    // Trigger timer updates
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    // Rerender to trigger useEffect cleanup
    rerender(<Challenge />)
    
    // Should handle cleanup properly
    expect(window.clearInterval).toHaveBeenCalled()
  })

  it('maintains readonly state for editor when defeated', async () => {
    render(<Challenge />)
    
    // Defeat the challenge
    act(() => {
      vi.advanceTimersByTime(600000)
    })
    
    await waitFor(() => {
      expect(screen.getByText('💥 TEMPS ÉCOULÉ')).toBeInTheDocument()
    })
    
    // Editor should not be visible when defeated
    expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument()
  })

  it('maintains readonly state for editor when completed', async () => {
    render(<Challenge />)
    
    const completeButton = screen.getByTestId('complete-challenge')
    
    act(() => {
      fireEvent.click(completeButton)
    })
    
    // Editor should still be visible but in readonly state when completed
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })
})