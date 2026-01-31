import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorHandlingService } from '../services/errorHandlingService';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onRetry?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    ticketId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, ticketId: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, ticketId: null };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        errorHandlingService.logError({
            errorCode: 'REACT_ErrorBoundary',
            errorMessage: error.message,
            stack: info.componentStack,
            severity: 'high',
            context: {
                action: 'render',
                affectedModule: 'ErrorBoundary'
            }
        }).then(res => {
            if (res && res.ticketId) {
                this.setState({ ticketId: res.ticketId });
            }
        });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onRetry) {
            this.props.onRetry();
        } else {
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center bg-gray-50 p-6 rounded-xl border border-red-100">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Something Went Wrong</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Use were unable to display this content. Our engineering team has been notified.
                        </p>

                        {this.state.ticketId && (
                            <div className="mb-6 p-2 bg-indigo-50 text-indigo-700 text-xs rounded font-mono">
                                Ticket ID: {this.state.ticketId}
                            </div>
                        )}

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                                Try Again
                            </button>
                            <a
                                href={this.state.ticketId ? `/support/tickets?id=${this.state.ticketId}` : '/support/tickets'}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                            >
                                Contact Support
                            </a>
                        </div>

                        {process.env.NODE_ENV !== 'production' && this.state.error && (
                            <details className="mt-4 text-left text-xs text-gray-400 overflow-auto max-h-32 border-t pt-2">
                                <summary>Error Details</summary>
                                <pre>{this.state.error.toString()}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
