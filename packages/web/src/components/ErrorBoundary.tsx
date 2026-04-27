import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ActionButton } from '@campaign-manager/ui';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[error-boundary]', error, info.componentStack);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-bg">
          <div className="max-w-md w-full bg-surface border border-border rounded-lg p-6 shadow-soft text-center">
            <h1 className="text-lg font-semibold text-fg mb-2">Something went wrong</h1>
            <p className="text-[13.5px] text-fg-muted mb-5 break-words">
              {this.state.error.message}
            </p>
            <ActionButton onClick={this.reset}>Try again</ActionButton>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
