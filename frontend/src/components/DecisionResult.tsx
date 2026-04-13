import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Calendar, IndianRupee, Shield } from 'lucide-react';
import { DecisionResult as Result, ReasonCode } from '../types';

interface Props {
  result: Result;
  onReset: () => void;
}

const reasonCodeLabels: Record<ReasonCode, { label: string; icon: React.ReactNode; color: string }> = {
  APPROVED: { 
    label: 'Application meets all criteria', 
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-success-700 bg-success-50'
  },
  LOW_REVENUE: { 
    label: 'Monthly revenue is below recommended threshold', 
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-danger-700 bg-danger-50'
  },
  HIGH_LOAN_RATIO: { 
    label: 'Loan amount exceeds 10x monthly revenue', 
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-danger-700 bg-danger-50'
  },
  HIGH_EMI: { 
    label: 'EMI exceeds 50% of monthly revenue', 
    icon: <IndianRupee className="w-5 h-5" />,
    color: 'text-danger-700 bg-danger-50'
  },
  RISKY_TENURE: { 
    label: 'Loan tenure is outside recommended range (6-60 months)', 
    icon: <Calendar className="w-5 h-5" />,
    color: 'text-warning-700 bg-warning-50'
  },
  FRAUD_SUSPECTED: { 
    label: 'Unusual loan-to-revenue ratio detected', 
    icon: <Shield className="w-5 h-5" />,
    color: 'text-danger-700 bg-danger-50'
  },
  INVALID_DATA: { 
    label: 'Invalid data provided', 
    icon: <XCircle className="w-5 h-5" />,
    color: 'text-danger-700 bg-danger-50'
  },
};

export default function DecisionResult({ result, onReset }: Props) {
  const isApproved = result.decision === 'APPROVED';
  const score = result.creditScore;

  // Determine score color
  const getScoreColor = () => {
    if (score >= 80) return 'bg-success-100 text-success-700 border-success-500';
    if (score >= 60) return 'bg-warning-100 text-warning-700 border-warning-500';
    return 'bg-danger-100 text-danger-700 border-danger-500';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Main Result Card */}
      <div className="card">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
              isApproved
                ? 'bg-success-100 text-success-700'
                : 'bg-danger-100 text-danger-700'
            }`}
          >
            {isApproved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                APPROVED
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                REJECTED
              </>
            )}
          </div>

          {/* Credit Score */}
          <div className="flex justify-center mb-4">
            <div className={`score-circle ${getScoreColor()}`}>
              {score}
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Credit Score</p>
          <p className="text-lg font-semibold text-gray-900">
            {score >= 60 ? 'Congratulations! Your loan is approved.' : 'Unfortunately, your loan cannot be approved at this time.'}
          </p>
        </div>

        {/* Decision Details */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Decision Analysis</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">EMI Amount</p>
              <p className="text-lg font-semibold text-gray-900">
                ₹{result.details.emiAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">EMI/Revenue Ratio</p>
              <p className="text-lg font-semibold text-gray-900">
                {(result.details.emiToRevenueRatio * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Loan/Revenue Ratio</p>
              <p className="text-lg font-semibold text-gray-900">
                {result.details.loanToRevenueRatio.toFixed(1)}x
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Fraud Check</p>
              <p className={`text-lg font-semibold ${
                result.details.fraudCheck === 'PASS' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {result.details.fraudCheck === 'PASS' ? 'Passed' : 'Failed'}
              </p>
            </div>
          </div>
        </div>

        {/* Reason Codes */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isApproved ? 'Approval Factors' : 'Rejection Reasons'}
          </h3>
          <div className="space-y-3">
            {result.reasons.map((reason) => (
              <div
                key={reason}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  reasonCodeLabels[reason]?.color || 'bg-gray-50'
                }`}
              >
                {reasonCodeLabels[reason]?.icon}
                <span className="text-sm font-medium">
                  {reasonCodeLabels[reason]?.label || reason}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onReset}
          className="btn-primary w-full"
        >
          Submit New Application
        </button>
      </div>

      {/* Educational Note */}
      <div className="mt-6 bg-primary-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary-800 mb-2">
          Understanding Your Credit Score
        </h4>
        <p className="text-sm text-primary-700">
          Your credit score is calculated based on various factors including your business revenue, 
          loan amount requested, EMI-to-revenue ratio, and tenure. A score of 60 or above is 
          required for approval. To improve your score, consider reducing the loan amount, 
          extending the tenure, or demonstrating higher revenue.
        </p>
      </div>
    </div>
  );
}
