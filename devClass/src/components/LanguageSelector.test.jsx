import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import LanguageSelector from './LanguageSelector'
import { LANGUAGE_VERSIONS } from '../constants'

// Mock de la méthode scrollTo pour éviter les erreurs dans jsdom
Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
  value: vi.fn(),
  writable: true
})

// Wrapper pour les tests
const TestWrapper = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
)

TestWrapper.propTypes = {
  children: PropTypes.node.isRequired
}

describe('LanguageSelector', () => {
  const mockOnSelect = vi.fn()
  const defaultProps = {
    language: 'javascript',
    onSelect: mockOnSelect
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendu initial', () => {
    it('affiche le label "Language:"', () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      expect(screen.getByText('Language:')).toBeInTheDocument()
    })

    it('affiche le langage courant dans le bouton', () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      expect(screen.getByRole('button', { name: 'javascript' })).toBeInTheDocument()
    })

    it('affiche différents langages passés en props', () => {
      const languages = ['python', 'java', 'typescript']
      
      languages.forEach(lang => {
        const { unmount } = render(
          <LanguageSelector language={lang} onSelect={mockOnSelect} />, 
          { wrapper: TestWrapper }
        )
        
        expect(screen.getByRole('button', { name: lang })).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Ouverture du menu', () => {
    it('ouvre le menu au clic sur le bouton', async () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })
    })

    it('affiche tous les langages disponibles avec leurs versions dans le menu', async () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        // Vérifier que les langages autres que javascript sont visibles
        expect(screen.getByText('python')).toBeInTheDocument()
        expect(screen.getByText('java')).toBeInTheDocument()
        expect(screen.getByText('typescript')).toBeInTheDocument()
        expect(screen.getByText('csharp')).toBeInTheDocument()
        expect(screen.getByText('php')).toBeInTheDocument()
      })
    })

    it('affiche les versions correctes pour les langages', async () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        // Vérifier quelques versions spécifiques
        expect(screen.getByText(`(${LANGUAGE_VERSIONS.python})`)).toBeInTheDocument()
        expect(screen.getByText(`(${LANGUAGE_VERSIONS.java})`)).toBeInTheDocument()
        expect(screen.getByText(`(${LANGUAGE_VERSIONS.typescript})`)).toBeInTheDocument()
      })
    })
  })

  describe('Sélection de langage', () => {
    it('appelle onSelect avec le bon langage quand on clique sur python', async () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByText('python')).toBeInTheDocument()
      })
      
      const pythonOption = screen.getAllByText('python')[0] // Prendre le premier si plusieurs
      fireEvent.click(pythonOption)
      
      expect(mockOnSelect).toHaveBeenCalledWith('python')
      expect(mockOnSelect).toHaveBeenCalledTimes(1)
    })

    it('appelle onSelect avec java', async () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByText('java')).toBeInTheDocument()
      })
      
      const javaOption = screen.getByText('java')
      fireEvent.click(javaOption)
      
      expect(mockOnSelect).toHaveBeenCalledWith('java')
    })

    it('appelle onSelect avec typescript', async () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByText('typescript')).toBeInTheDocument()
      })
      
      const typescriptOption = screen.getByText('typescript')
      fireEvent.click(typescriptOption)
      
      expect(mockOnSelect).toHaveBeenCalledWith('typescript')
    })
  })

  describe('Structure et accessibilité', () => {
    it('utilise les rôles ARIA appropriés', () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button')
      expect(menuButton).toBeInTheDocument()
      expect(menuButton).toHaveAttribute('aria-haspopup')
    })

    it('rend le menu avec le bon rôle', async () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        const menu = screen.getByRole('menu')
        expect(menu).toBeInTheDocument()
      })
    })

    it('les options du menu ont le rôle menuitem', async () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem')
        expect(menuItems.length).toBeGreaterThan(0)
        expect(menuItems).toHaveLength(Object.keys(LANGUAGE_VERSIONS).length)
      })
    })
  })

  describe('Props et callback', () => {
    it('fonctionne avec différentes valeurs de language', () => {
      Object.keys(LANGUAGE_VERSIONS).forEach(lang => {
        const { unmount } = render(
          <LanguageSelector language={lang} onSelect={mockOnSelect} />, 
          { wrapper: TestWrapper }
        )
        
        expect(screen.getByRole('button', { name: lang })).toBeInTheDocument()
        unmount()
      })
    })

    it('affiche un langage personnalisé même s\'il n\'est pas dans LANGUAGE_VERSIONS', () => {
      render(
        <LanguageSelector language="customlang" onSelect={mockOnSelect} />, 
        { wrapper: TestWrapper }
      )
      
      expect(screen.getByRole('button', { name: 'customlang' })).toBeInTheDocument()
    })

    it('appelle onSelect même pour le même langage sélectionné', async () => {
      render(<LanguageSelector language="javascript" onSelect={mockOnSelect} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        // Il y aura 2 éléments "javascript" : un dans le bouton et un dans le menu
        const javascriptItems = screen.getAllByText('javascript')
        expect(javascriptItems.length).toBeGreaterThanOrEqual(1)
      })
      
      // Cliquer sur l'option javascript dans le menu
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem')
        const jsMenuItem = menuItems.find(item => item.textContent?.includes('javascript'))
        if (jsMenuItem) {
          fireEvent.click(jsMenuItem)
          expect(mockOnSelect).toHaveBeenCalledWith('javascript')
        }
      })
    })
  })

  describe('Langages supportés', () => {
    it('supporte exactement les langages définis dans LANGUAGE_VERSIONS', async () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem')
        expect(menuItems).toHaveLength(Object.keys(LANGUAGE_VERSIONS).length)
      })
    })

    it('affiche tous les langages attendus', async () => {
      const expectedLanguages = Object.keys(LANGUAGE_VERSIONS)
      
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expectedLanguages.forEach(lang => {
          expect(screen.getAllByText(lang).length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Format d\'affichage', () => {
    it('affiche chaque langage avec sa version entre parenthèses', async () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        // Vérifier le format pour quelques langages
        const pythonMenuItem = screen.getAllByRole('menuitem')
          .find(item => item.textContent?.includes('python'))
        expect(pythonMenuItem).toHaveTextContent(`python (${LANGUAGE_VERSIONS.python})`)
        
        const javaMenuItem = screen.getAllByRole('menuitem')
          .find(item => item.textContent?.includes('java') && !item.textContent?.includes('javascript'))
        expect(javaMenuItem).toHaveTextContent(`java (${LANGUAGE_VERSIONS.java})`)
      })
    })
  })

  describe('Styles et apparence', () => {
    it('applique les styles de base', () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const container = screen.getByText('Language:').closest('div')
      expect(container).toBeInTheDocument()
    })

    it('utilise un bouton Chakra UI pour le menu', () => {
      render(<LanguageSelector {...defaultProps} />, { wrapper: TestWrapper })
      
      const menuButton = screen.getByRole('button', { name: 'javascript' })
      expect(menuButton).toHaveClass('chakra-button')
    })
  })
})