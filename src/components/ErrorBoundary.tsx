import { Component, type ReactNode } from 'react'

interface Props {
  fallback: (reset: () => void, error: Error) => ReactNode
  onError?: (e: Error) => void
  children: ReactNode
}

export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error) { console.error('[ErrorBoundary]', error); this.props.onError?.(error) }
  reset = () => this.setState({ error: null })
  render() {
    return this.state.error ? this.props.fallback(this.reset, this.state.error) : this.props.children
  }
}
