import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Something went wrong</h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            An unexpected error occurred. Please try reloading the page.
          </p>
          {this.state.error && (
            <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-secondary p-4 text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
          <Button
            onClick={() => window.location.reload()}
            className="mt-8 gap-2 gradient-orange border-0 text-primary-foreground hover:opacity-90"
          >
            Reload Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
