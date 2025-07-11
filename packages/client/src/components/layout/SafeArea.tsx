import { ReactNode } from 'react'
import { getSafeAreaPadding } from '../../utils/responsive'

interface SafeAreaProps {
  children: ReactNode
  className?: string
}

export function SafeArea({ children, className = '' }: SafeAreaProps) {
  const safeAreaStyles = getSafeAreaPadding()
  
  return (
    <div 
      className={`min-h-screen ${className}`}
      style={safeAreaStyles}
    >
      {children}
    </div>
  )
}