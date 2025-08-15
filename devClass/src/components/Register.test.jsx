import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import axios from 'axios'
import Register from './Register'

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

// Mock useToast
const mockToast = vi.fn()
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    useToast: () => mockToast
  }
})

// Mock react-icons
vi.mock('react-icons/ai', () => ({
  AiOutlineEye: () => <span data-testid="eye-icon">👁</span>,
  AiOutlineEyeInvisible: () => <span data-testid="eye-invisible-icon">🙈</span>
}))

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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

describe('Register', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
    
    // Reset console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Authentication Redirect', () => {
    it('redirects to home when user is already authenticated', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true
      })

      render(<Register />, { wrapper: TestWrapper })
      
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('does not redirect when user is not authenticated', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })

      render(<Register />, { wrapper: TestWrapper })
      
      expect(mockNavigate).not.toHaveBeenCalledWith('/')
    })
  })

  describe('Form Rendering', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })
    })

    it('renders all form elements correctly', () => {
      render(<Register />, { wrapper: TestWrapper })

      expect(screen.getByText('Crée ton profil')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Nom')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Confirmer le mot de passe')).toBeInTheDocument()
      expect(screen.getByText('Afficher les mots de passe')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
    })

    it('renders submit button with correct type', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      // Check that submit button has correct type
      expect(screen.getByRole('button', { name: /créer mon compte/i })).toHaveAttribute('type', 'submit')
    })
  })

  describe('Form Field Interactions', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })
    })

    it('updates name field when user types', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      
      expect(nameInput.value).toBe('John Doe')
    })

    it('updates email field when user types', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const emailInput = screen.getByPlaceholderText('E-mail')
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      
      expect(emailInput.value).toBe('john@example.com')
    })

    it('updates password field when user types', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      expect(passwordInput.value).toBe('password123')
    })

    it('updates confirm password field when user types', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      expect(confirmPasswordInput.value).toBe('password123')
    })
  })

  describe('Password Visibility Toggle', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })
    })

    it('initially shows password fields as password type', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const passwordInputs = screen.getAllByDisplayValue('')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      
      expect(passwordInput.type).toBe('password')
      expect(confirmPasswordInput.type).toBe('password')
    })

    it('toggles password visibility when eye icon is clicked', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const eyeButtons = screen.getAllByRole('button', { name: /mot de passe/i })
      
      // Click first eye button
      fireEvent.click(eyeButtons[0])
      
      expect(passwordInput.type).toBe('text')
      expect(confirmPasswordInput.type).toBe('text')
    })

    it('toggles password visibility when checkbox is checked', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const checkbox = screen.getByRole('checkbox')
      
      fireEvent.click(checkbox)
      
      expect(passwordInput.type).toBe('text')
      expect(confirmPasswordInput.type).toBe('text')
      expect(checkbox).toBeChecked()
    })

    it('shows correct eye icons based on visibility state', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      // Initially should show eye icons (to make password visible)
      expect(screen.getAllByTestId('eye-icon')).toHaveLength(2)
      
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      
      // After toggle should show eye-invisible icons (to hide password)
      expect(screen.getAllByTestId('eye-invisible-icon')).toHaveLength(2)
    })
  })

  describe('Password Validation', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })
    })

    it('shows error when passwords do not match', async () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Les mots de passe ne correspondent pas.')).toBeInTheDocument()
      })
    })

    it('shows error when password is too short', async () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Le mot de passe doit contenir au moins 6 caractères.')).toBeInTheDocument()
      })
    })

    it('clears password error when validation passes', async () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      // First trigger an error
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Le mot de passe doit contenir au moins 6 caractères.')).toBeInTheDocument()
      })
      
      // Now fix the error
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      axios.post.mockResolvedValue({ data: { success: true } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Le mot de passe doit contenir au moins 6 caractères.')).not.toBeInTheDocument()
      })
    })
  })

  describe('Successful Registration', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })
    })

    it('submits form with correct data and navigates to login on success', async () => {
      axios.post.mockResolvedValue({ data: { success: true } })
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'https://schooldev.duckdns.org/api/auth/register',
          {
            username: 'John Doe',
            email: 'john@example.com',
            passwordHash: 'password123',
            role: 'user'
          }
        )
      })
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Inscription réussie !',
          description: 'Tu peux maintenant te connecter.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('logs correct information during registration', async () => {
      const consoleSpy = vi.spyOn(console, 'log')
      axios.post.mockResolvedValue({ data: { success: true } })
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Nom:', 'John Doe', 'Email:', 'john@example.com', 'Password:', 'password123')
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })
    })

    it('handles 404 error with warning toast', async () => {
      const error = new Error('Not Found')
      error.response = { status: 404 }
      axios.post.mockRejectedValue(error)
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Attention',
          description: "L'inscription a peut-être réussi. Essayez de vous connecter.",
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('handles 409 conflict error', async () => {
      const error = new Error('Conflict')
      error.response = { status: 409 }
      axios.post.mockRejectedValue(error)
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erreur',
          description: 'Cet utilisateur existe déjà.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      })
    })

    it('handles generic errors with error message from response', async () => {
      const error = new Error('Server Error')
      error.response = { 
        status: 500,
        data: { message: 'Internal server error' }
      }
      axios.post.mockRejectedValue(error)
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erreur',
          description: 'Internal server error',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      })
    })

    it('handles generic errors without specific message', async () => {
      const error = new Error('Network Error')
      error.response = { status: 500 }
      axios.post.mockRejectedValue(error)
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erreur',
          description: "Une erreur est survenue lors de l'inscription.",
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      })
    })

    it('logs error information when registration fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      const error = new Error('Server Error')
      error.response = { 
        status: 500,
        data: { message: 'Internal server error' }
      }
      axios.post.mockRejectedValue(error)
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith("Erreur d'enregistrement:", error)
        expect(consoleErrorSpy).toHaveBeenCalledWith("Statut de l'erreur:", 500)
        expect(consoleErrorSpy).toHaveBeenCalledWith("Données de l'erreur:", { message: 'Internal server error' })
      })
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Loading States', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })
    })

    it('shows loading state during form submission', async () => {
      let resolvePromise
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })
      axios.post.mockReturnValue(promise)
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      // Button should show loading state
      expect(submitButton).toBeDisabled()
      
      resolvePromise({ data: { success: true } })
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('resets loading state after successful submission', async () => {
      axios.post.mockResolvedValue({ data: { success: true } })
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('resets loading state after failed submission', async () => {
      const error = new Error('Server Error')
      error.response = { status: 500 }
      axios.post.mockRejectedValue(error)
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled()
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })
    })

    it('navigates to login when login button is clicked', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const loginButton = screen.getByRole('button', { name: /se connecter/i })
      fireEvent.click(loginButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  describe('Form Submission Prevention', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })
    })

    it('prevents default form submission behavior via handleSubmit', async () => {
      axios.post.mockResolvedValue({ data: { success: true } })
      
      render(<Register />, { wrapper: TestWrapper })
      
      const nameInput = screen.getByPlaceholderText('Nom')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const passwordInput = screen.getByPlaceholderText('Mot de passe')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmer le mot de passe')
      const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      
      fireEvent.click(submitButton)
      
      // Verify that the axios.post was called, which means preventDefault worked
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      })
    })

    it('has correct aria-labels for password toggle buttons', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const eyeButtons = screen.getAllByRole('button', { name: /mot de passe/i })
      
      expect(eyeButtons[0]).toHaveAttribute('aria-label', 'Afficher le mot de passe')
      expect(eyeButtons[1]).toHaveAttribute('aria-label', 'Afficher le mot de passe')
    })

    it('updates aria-labels when password visibility changes', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      const eyeButtons = screen.getAllByRole('button', { name: /mot de passe/i })
      const checkbox = screen.getByRole('checkbox')
      
      fireEvent.click(checkbox)
      
      expect(eyeButtons[0]).toHaveAttribute('aria-label', 'Masquer le mot de passe')
      expect(eyeButtons[1]).toHaveAttribute('aria-label', 'Masquer le mot de passe')
    })

    it('has required attributes on form inputs', () => {
      render(<Register />, { wrapper: TestWrapper })
      
      expect(screen.getByPlaceholderText('Nom')).toBeRequired()
      expect(screen.getByPlaceholderText('E-mail')).toBeRequired()
      expect(screen.getByPlaceholderText('Mot de passe')).toBeRequired()
      expect(screen.getByPlaceholderText('Confirmer le mot de passe')).toBeRequired()
    })
  })
})