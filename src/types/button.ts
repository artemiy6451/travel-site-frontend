export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  loadingText?: string
  type?: 'button' | 'submit' | 'reset'
  icon?: string
  fullWidth?: boolean
}
