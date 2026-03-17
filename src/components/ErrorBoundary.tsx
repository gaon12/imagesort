import { Component, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info)
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '2rem',
            gap: '1rem',
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ fontSize: '1rem', margin: 0 }}>오류가 발생했습니다.</p>
          <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.7 }}>
            {this.state.error?.message}
          </p>
          <button
            type="button"
            className="control-btn control-btn-secondary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
