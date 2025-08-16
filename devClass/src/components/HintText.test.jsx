import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import HintText from './HintText'

// Mock Chakra UI components
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    useColorModeValue: vi.fn().mockImplementation((light) => light)
  }
})

// Helper function to create wrapper with ChakraProvider
const TestWrapper = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
)

TestWrapper.propTypes = {
  children: PropTypes.node.isRequired
}

describe('HintText Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders simple text without hints', () => {
      render(
        <TestWrapper>
          <HintText text="This is simple text without any hints" />
        </TestWrapper>
      )

      expect(screen.getByText('This is simple text without any hints')).toBeInTheDocument()
    })

    it('renders with custom color prop', () => {
      render(
        <TestWrapper>
          <HintText text="Colored text" color="red.500" />
        </TestWrapper>
      )

      expect(screen.getByText('Colored text')).toBeInTheDocument()
    })

    it('renders without color prop (uses default)', () => {
      render(
        <TestWrapper>
          <HintText text="Default color text" />
        </TestWrapper>
      )

      expect(screen.getByText('Default color text')).toBeInTheDocument()
    })
  })

  describe('Hint Functionality', () => {
    it('renders hint button for text with single hint', () => {
      render(
        <TestWrapper>
          <HintText text="This text has **hidden hint** inside" />
        </TestWrapper>
      )

      expect(screen.getByText('This text has')).toBeInTheDocument()
      expect(screen.getByText('inside')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'indice' })).toBeInTheDocument()
    })

    it('reveals hint when button is clicked', () => {
      render(
        <TestWrapper>
          <HintText text="Click to reveal **secret message** here" />
        </TestWrapper>
      )

      const hintButton = screen.getByRole('button', { name: 'indice' })
      
      // Initially, hint text should not be visible
      expect(screen.queryByText('secret message')).not.toBeInTheDocument()
      
      // Click the hint button
      fireEvent.click(hintButton)
      
      // After clicking, hint text should be visible and button should be gone
      expect(screen.getByText('secret message')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'indice' })).not.toBeInTheDocument()
    })

    it('handles multiple hints independently', () => {
      render(
        <TestWrapper>
          <HintText text="First **hint one** and second **hint two** test" />
        </TestWrapper>
      )

      const hintButtons = screen.getAllByRole('button', { name: 'indice' })
      expect(hintButtons).toHaveLength(2)

      // Click first hint button
      fireEvent.click(hintButtons[0])
      
      // First hint should be revealed, second should still be hidden
      expect(screen.getByText('hint one')).toBeInTheDocument()
      expect(screen.queryByText('hint two')).not.toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: 'indice' })).toHaveLength(1)

      // Click second hint button
      const remainingButton = screen.getByRole('button', { name: 'indice' })
      fireEvent.click(remainingButton)

      // Both hints should be revealed
      expect(screen.getByText('hint one')).toBeInTheDocument()
      expect(screen.getByText('hint two')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'indice' })).not.toBeInTheDocument()
    })

    it('handles text with multiple hints revealed in different order', () => {
      render(
        <TestWrapper>
          <HintText text="**first** **second** **third**" />
        </TestWrapper>
      )

      const hintButtons = screen.getAllByRole('button', { name: 'indice' })
      expect(hintButtons).toHaveLength(3)

      // Click second hint (index 1)
      fireEvent.click(hintButtons[1])
      expect(screen.getByText('second')).toBeInTheDocument()
      expect(screen.queryByText('first')).not.toBeInTheDocument()
      expect(screen.queryByText('third')).not.toBeInTheDocument()

      // Click third hint (now index 1 since one was removed)
      const remainingButtons = screen.getAllByRole('button', { name: 'indice' })
      fireEvent.click(remainingButtons[1])
      expect(screen.getByText('third')).toBeInTheDocument()

      // Click first hint
      const lastButton = screen.getByRole('button', { name: 'indice' })
      fireEvent.click(lastButton)
      expect(screen.getByText('first')).toBeInTheDocument()
    })
  })

  describe('Text with Newlines', () => {
    it('handles text with single newline', () => {
      render(
        <TestWrapper>
          <HintText text="Line one\nLine two" />
        </TestWrapper>
      )

      // Text with newlines may be rendered as a single text node
      expect(screen.getByText(/Line one.*Line two/s)).toBeInTheDocument()
    })

    it('handles text with multiple newlines', () => {
      render(
        <TestWrapper>
          <HintText text="First line\nSecond line\nThird line" />
        </TestWrapper>
      )

      // Text with newlines may be rendered as a single text node
      expect(screen.getByText(/First line.*Second line.*Third line/s)).toBeInTheDocument()
    })

    it('handles newlines combined with hints', () => {
      render(
        <TestWrapper>
          <HintText text="Line one\n**hidden hint**\nLine three" />
        </TestWrapper>
      )

      expect(screen.getByText(/Line one/)).toBeInTheDocument()
      expect(screen.getByText(/Line three/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'indice' })).toBeInTheDocument()

      // Reveal the hint
      fireEvent.click(screen.getByRole('button', { name: 'indice' }))
      expect(screen.getByText('hidden hint')).toBeInTheDocument()
    })

    it('handles empty lines from consecutive newlines', () => {
      render(
        <TestWrapper>
          <HintText text="Line one\n\nLine three" />
        </TestWrapper>
      )

      expect(screen.getByText(/Line one.*Line three/s)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty text', () => {
      const { container } = render(
        <TestWrapper>
          <HintText text="" />
        </TestWrapper>
      )
      
      // Should render without crashing, container should exist
      expect(container.querySelector('p')).toBeInTheDocument()
    })

    it('handles text with only hints', () => {
      render(
        <TestWrapper>
          <HintText text="**only hint**" />
        </TestWrapper>
      )

      expect(screen.getByRole('button', { name: 'indice' })).toBeInTheDocument()
      expect(screen.queryByText('only hint')).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'indice' }))
      expect(screen.getByText('only hint')).toBeInTheDocument()
    })

    it('handles text with malformed hint markers', () => {
      render(
        <TestWrapper>
          <HintText text="This has **incomplete hint and **another incomplete" />
        </TestWrapper>
      )

      // The regex pattern actually matches **incomplete hint and as a valid hint
      // So it will create a button for the first malformed hint
      expect(screen.getByText(/This has/)).toBeInTheDocument()
      expect(screen.getByText(/another incomplete/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'indice' })).toBeInTheDocument()
    })

    it('handles text with single asterisks', () => {
      render(
        <TestWrapper>
          <HintText text="This has *single* asterisks" />
        </TestWrapper>
      )

      expect(screen.getByText('This has *single* asterisks')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'indice' })).not.toBeInTheDocument()
    })

    it('handles text with nested asterisks', () => {
      render(
        <TestWrapper>
          <HintText text="This has **nested *asterisks* inside** hint" />
        </TestWrapper>
      )

      expect(screen.getByRole('button', { name: 'indice' })).toBeInTheDocument()
      
      fireEvent.click(screen.getByRole('button', { name: 'indice' }))
      expect(screen.getByText('nested *asterisks* inside')).toBeInTheDocument()
    })

    it('handles empty hint content', () => {
      render(
        <TestWrapper>
          <HintText text="Empty hint: **** test" />
        </TestWrapper>
      )

      expect(screen.getByRole('button', { name: 'indice' })).toBeInTheDocument()
      
      fireEvent.click(screen.getByRole('button', { name: 'indice' }))
      // Empty hint content creates an empty span element
      const hintSpan = screen.getByText('Empty hint:').parentElement.querySelector('span[class*="chakra-text"]')
      expect(hintSpan).toBeInTheDocument()
    })

    it('handles text with only newlines', () => {
      const { container } = render(
        <TestWrapper>
          <HintText text="\n\n\n" />
        </TestWrapper>
      )

      // Should render without crashing
      expect(container.querySelector('p')).toBeInTheDocument()
    })

    it('handles text with newlines to test br tag logic', () => {
      render(
        <TestWrapper>
          <HintText text="line one\nline two\nline three" />
        </TestWrapper>
      )

      // Test that text with newlines renders properly
      // This should trigger the br tag conditional logic
      expect(screen.getByText(/line one.*line two.*line three/s)).toBeInTheDocument()
    })
  })

  describe('PropTypes Validation', () => {
    it('renders with required text prop', () => {
      render(
        <TestWrapper>
          <HintText text="Required text prop" />
        </TestWrapper>
      )

      expect(screen.getByText('Required text prop')).toBeInTheDocument()
    })

    it('renders with both text and color props', () => {
      render(
        <TestWrapper>
          <HintText text="Both props provided" color="blue.400" />
        </TestWrapper>
      )

      expect(screen.getByText('Both props provided')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('maintains independent state between multiple instances', () => {
      render(
        <TestWrapper>
          <div>
            <HintText text="First **hint one** instance" />
            <HintText text="Second **hint two** instance" />
          </div>
        </TestWrapper>
      )

      const hintButtons = screen.getAllByRole('button', { name: 'indice' })
      expect(hintButtons).toHaveLength(2)

      // Click first instance hint
      fireEvent.click(hintButtons[0])
      
      // First instance hint should be revealed, second should remain hidden
      expect(screen.getByText('hint one')).toBeInTheDocument()
      expect(screen.queryByText('hint two')).not.toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: 'indice' })).toHaveLength(1)
    })

    it('maintains revealed hints during re-render with same props', () => {
      const { rerender } = render(
        <TestWrapper>
          <HintText text="Test **first hint** content" />
        </TestWrapper>
      )

      // Reveal the hint
      fireEvent.click(screen.getByRole('button', { name: 'indice' }))
      expect(screen.getByText('first hint')).toBeInTheDocument()

      // Re-render with same props - state should persist
      rerender(
        <TestWrapper>
          <HintText text="Test **first hint** content" />
        </TestWrapper>
      )

      // React maintains component state on re-render with same props
      expect(screen.getByText('first hint')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'indice' })).not.toBeInTheDocument()
    })
  })

  describe('Complex Text Patterns', () => {
    it('handles mixed content with text, hints, and newlines', () => {
      render(
        <TestWrapper>
          <HintText text="Start text\n**first hint** middle\nMore text **second hint**\nEnd text" />
        </TestWrapper>
      )

      // Use regex to match text that may be split across elements
      expect(screen.getByText(/Start text/)).toBeInTheDocument()
      expect(screen.getByText(/middle/)).toBeInTheDocument()
      expect(screen.getByText(/More text/)).toBeInTheDocument()
      expect(screen.getByText(/End text/)).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: 'indice' })).toHaveLength(2)

      // Reveal hints one by one
      const buttons = screen.getAllByRole('button', { name: 'indice' })
      fireEvent.click(buttons[0])
      expect(screen.getByText('first hint')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'indice' }))
      expect(screen.getByText('second hint')).toBeInTheDocument()
    })

    it('handles adjacent hints', () => {
      render(
        <TestWrapper>
          <HintText text="**first****second** text" />
        </TestWrapper>
      )

      expect(screen.getAllByRole('button', { name: 'indice' })).toHaveLength(2)
      
      const buttons = screen.getAllByRole('button', { name: 'indice' })
      fireEvent.click(buttons[0])
      expect(screen.getByText('first')).toBeInTheDocument()
      
      fireEvent.click(screen.getByRole('button', { name: 'indice' }))
      expect(screen.getByText('second')).toBeInTheDocument()
    })
  })
})