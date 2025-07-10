import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
          <div
            className="text-center max-w-md"
          >
            {/* Error icon */}
            <div className="text-6xl mb-4">⚠️</div>
            
            {/* Error message */}
            <h1 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            
            <p className="text-dark-400 mb-6">
              The game encountered an unexpected error. Please try again.
            </p>
            
            {/* Error details (development only) */}
            {import.meta.env.MODE === 'development' && this.state.error && (
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-semibold text-red-400 mb-2">
                  Error Details:
                </h3>
                <pre className="text-xs text-dark-300 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack && (
                    <>
                      {'\n\nStack trace:\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </div>
            )}
            
            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="btn-touch btn-primary w-full"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="btn-touch btn-secondary w-full"
              >
                Reload Game
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}