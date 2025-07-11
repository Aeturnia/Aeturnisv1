import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from 'react'

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: string
  onClear?: () => void
}

interface MobileTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  maxLength?: number
}

// Mobile-optimized input with proper keyboard handling
export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ label, error, icon, onClear, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const hasValue = props.value !== '' && props.value !== undefined

    return (
      <div className="mobile-input-wrapper">
        {label && (
          <label 
            className={`
              block text-sm font-medium mb-1 transition-colors
              ${isFocused ? 'text-primary-400' : 'text-dark-400'}
              ${error ? 'text-red-500' : ''}
            `}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            {...props}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={`
              w-full px-4 py-3 
              bg-dark-800 border rounded-lg
              text-white placeholder-dark-400
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${hasValue && onClear ? 'pr-10' : ''}
              ${isFocused ? 'border-primary-500 ring-1 ring-primary-500' : 'border-dark-600'}
              ${error ? 'border-red-500' : ''}
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              focus:outline-none
              ${className}
            `}
            style={{
              fontSize: '16px', // Prevent zoom on iOS
              WebkitAppearance: 'none', // Remove iOS styling
              ...props.style
            }}
          />
          
          {hasValue && onClear && !props.disabled && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
              aria-label="Clear input"
            >
              ✕
            </button>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

MobileInput.displayName = 'MobileInput'

// Mobile-optimized textarea with character count
export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ label, error, maxLength, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [charCount, setCharCount] = useState(
      props.value ? String(props.value).length : 0
    )

    return (
      <div className="mobile-textarea-wrapper">
        {label && (
          <label 
            className={`
              block text-sm font-medium mb-1 transition-colors
              ${isFocused ? 'text-primary-400' : 'text-dark-400'}
              ${error ? 'text-red-500' : ''}
            `}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={ref}
            {...props}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            onChange={(e) => {
              setCharCount(e.target.value.length)
              props.onChange?.(e)
            }}
            className={`
              w-full px-4 py-3 
              bg-dark-800 border rounded-lg
              text-white placeholder-dark-400
              transition-all duration-200
              ${isFocused ? 'border-primary-500 ring-1 ring-primary-500' : 'border-dark-600'}
              ${error ? 'border-red-500' : ''}
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              focus:outline-none
              resize-none
              ${className}
            `}
            style={{
              fontSize: '16px', // Prevent zoom on iOS
              WebkitAppearance: 'none', // Remove iOS styling
              ...props.style
            }}
          />
          
          {maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-dark-400 pointer-events-none">
              {charCount}/{maxLength}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

MobileTextarea.displayName = 'MobileTextarea'

// Mobile-optimized select dropdown
interface MobileSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export function MobileSelect({ 
  label, 
  error, 
  options, 
  className = '', 
  ...props 
}: MobileSelectProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="mobile-select-wrapper">
      {label && (
        <label 
          className={`
            block text-sm font-medium mb-1 transition-colors
            ${isFocused ? 'text-primary-400' : 'text-dark-400'}
            ${error ? 'text-red-500' : ''}
          `}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 pr-10
            bg-dark-800 border rounded-lg
            text-white
            transition-all duration-200
            ${isFocused ? 'border-primary-500 ring-1 ring-primary-500' : 'border-dark-600'}
            ${error ? 'border-red-500' : ''}
            ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            focus:outline-none
            appearance-none
            ${className}
          `}
          style={{
            fontSize: '16px', // Prevent zoom on iOS
            WebkitAppearance: 'none', // Remove iOS styling
            backgroundImage: 'none', // Remove default arrow
            ...props.style
          }}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-dark-400">
          ▼
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

// Example form using mobile inputs
export function MobileFormExample() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    message: '',
    server: 'us-east'
  })

  return (
    <form className="space-y-4 p-4">
      <MobileInput
        label="Username"
        placeholder="Enter your username"
        icon="👤"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        onClear={() => setFormData({ ...formData, username: '' })}
      />

      <MobileInput
        label="Email"
        type="email"
        placeholder="your@email.com"
        icon="✉️"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        onClear={() => setFormData({ ...formData, email: '' })}
        error={formData.email && !formData.email.includes('@') ? 'Invalid email' : ''}
      />

      <MobileTextarea
        label="Message"
        placeholder="Type your message..."
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        maxLength={200}
        rows={4}
      />

      <MobileSelect
        label="Server"
        value={formData.server}
        onChange={(e) => setFormData({ ...formData, server: e.target.value })}
        options={[
          { value: 'us-east', label: 'US East' },
          { value: 'us-west', label: 'US West' },
          { value: 'eu', label: 'Europe' },
          { value: 'asia', label: 'Asia' }
        ]}
      />

      <button
        type="submit"
        className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
      >
        Submit
      </button>
    </form>
  )
}