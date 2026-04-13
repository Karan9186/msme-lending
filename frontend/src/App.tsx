import { useState } from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import LoanApplicationForm from './components/LoanApplicationForm';
import DecisionResult from './components/DecisionResult';
import { evaluateDecision, ApiException } from './services/api';
import { LoanApplicationForm as FormData, DecisionResult as DecisionData } from './types';

type ViewState = 'form' | 'result' | 'error';

function App() {
  const [view, setView] = useState<ViewState>('form');
  const [decision, setDecision] = useState<DecisionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await evaluateDecision(data);
      setDecision(result);
      setView('result');
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setView('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setView('form');
    setDecision(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MSME Lending System</h1>
              <p className="text-sm text-gray-500">Apply for business loans online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Progress */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-gray-500">
            <span className={view === 'form' ? 'text-primary-600 font-medium' : ''}>
              Application
            </span>
            <ArrowRight className="w-4 h-4 mx-2" />
            <span className={view === 'result' ? 'text-primary-600 font-medium' : ''}>
              Decision
            </span>
          </nav>
        </div>

        {/* Error Message */}
        {view === 'error' && error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-danger-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-danger-800">
                    Application Error
                  </h3>
                  <p className="text-sm text-danger-700 mt-1">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-3 text-sm font-medium text-danger-700 hover:text-danger-800"
                  >
                    Try Again →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {view === 'form' && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Business Loan Application
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get instant credit decisions for your MSME business. Fill in your business 
                and loan details to receive an automated decision within seconds.
              </p>
            </div>

            <LoanApplicationForm onSubmit={handleSubmit} isLoading={isLoading} />
          </>
        )}

        {view === 'result' && decision && (
          <DecisionResult result={decision} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} MSME Lending System. All rights reserved.
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            This is a demonstration application. No real loans are processed.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
