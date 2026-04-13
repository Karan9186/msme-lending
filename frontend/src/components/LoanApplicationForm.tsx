import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, IndianRupee, Calendar, FileText, User, Briefcase } from 'lucide-react';
import { LoanApplicationForm as FormData } from '../types';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const schema = z.object({
  business: z.object({
    ownerName: z.string().min(2, 'Owner name must be at least 2 characters').max(255),
    pan: z.string().regex(PAN_REGEX, 'Invalid PAN format (e.g., ABCDE1234F)'),
    businessType: z.enum(['retail', 'manufacturing', 'services']),
    monthlyRevenue: z.number().positive('Monthly revenue must be greater than 0').max(1000000000),
  }),
  loan: z.object({
    loanAmount: z.number().positive('Loan amount must be greater than 0').max(100000000),
    tenureMonths: z.number().int().min(1).max(360),
    loanPurpose: z.string().min(5, 'Purpose must be at least 5 characters').max(500),
  }),
});

interface Props {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export default function LoanApplicationForm({ onSubmit, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<'business' | 'loan'>('business');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      business: {
        businessType: 'retail',
      },
    },
  });

  const handleContinue = async () => {
    const isValid = await trigger('business');
    if (isValid) {
      setActiveTab('loan');
    }
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              activeTab === 'business'
                ? 'bg-primary-600 text-white'
                : 'bg-success-500 text-white'
            }`}
          >
            1
          </div>
          <div className="w-24 h-1 bg-gray-200 mx-2">
            <div
              className={`h-full transition-all ${
                activeTab === 'loan' ? 'bg-success-500 w-full' : 'bg-gray-200 w-0'
              }`}
            />
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              activeTab === 'loan'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            2
          </div>
        </div>
      </div>

      {/* Tab Labels */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-24">
          <span
            className={`text-sm font-medium ${
              activeTab === 'business' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            Business Details
          </span>
          <span
            className={`text-sm font-medium ${
              activeTab === 'loan' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            Loan Details
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Business Details Tab */}
        {activeTab === 'business' && (
          <div className="card space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
            </div>

            {/* Owner Name */}
            <div>
              <label className="label flex items-center gap-2">
                <User className="w-4 h-4" />
                Owner Name
              </label>
              <input
                type="text"
                {...register('business.ownerName')}
                className={`form-input ${errors.business?.ownerName ? 'form-input-error' : ''}`}
                placeholder="Enter owner's full name"
              />
              {errors.business?.ownerName && (
                <p className="error-message">{errors.business.ownerName.message}</p>
              )}
            </div>

            {/* PAN */}
            <div>
              <label className="label flex items-center gap-2">
                <FileText className="w-4 h-4" />
                PAN Number
              </label>
              <input
                type="text"
                {...register('business.pan', {
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
                className={`form-input ${errors.business?.pan ? 'form-input-error' : ''}`}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              {errors.business?.pan && (
                <p className="error-message">{errors.business.pan.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Format: 5 letters + 4 digits + 1 letter</p>
            </div>

            {/* Business Type */}
            <div>
              <label className="label flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Business Type
              </label>
              <select
                {...register('business.businessType')}
                className="form-input"
              >
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="services">Services</option>
              </select>
            </div>

            {/* Monthly Revenue */}
            <div>
              <label className="label flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Monthly Revenue (₹)
              </label>
              <input
                type="number"
                {...register('business.monthlyRevenue', { valueAsNumber: true })}
                className={`form-input ${errors.business?.monthlyRevenue ? 'form-input-error' : ''}`}
                placeholder="50000"
              />
              {errors.business?.monthlyRevenue && (
                <p className="error-message">{errors.business.monthlyRevenue.message}</p>
              )}
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleContinue}
              className="btn-primary w-full"
            >
              Continue to Loan Details
            </button>
          </div>
        )}

        {/* Loan Details Tab */}
        {activeTab === 'loan' && (
          <div className="card space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <IndianRupee className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Loan Information</h2>
            </div>

            {/* Loan Amount */}
            <div>
              <label className="label flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Loan Amount (₹)
              </label>
              <input
                type="number"
                {...register('loan.loanAmount', { valueAsNumber: true })}
                className={`form-input ${errors.loan?.loanAmount ? 'form-input-error' : ''}`}
                placeholder="100000"
              />
              {errors.loan?.loanAmount && (
                <p className="error-message">{errors.loan.loanAmount.message}</p>
              )}
            </div>

            {/* Tenure */}
            <div>
              <label className="label flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tenure (Months)
              </label>
              <input
                type="number"
                {...register('loan.tenureMonths', { valueAsNumber: true })}
                className={`form-input ${errors.loan?.tenureMonths ? 'form-input-error' : ''}`}
                placeholder="12"
                min="1"
                max="360"
              />
              {errors.loan?.tenureMonths && (
                <p className="error-message">{errors.loan.tenureMonths.message}</p>
              )}
            </div>

            {/* Purpose */}
            <div>
              <label className="label flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Loan Purpose
              </label>
              <textarea
                {...register('loan.loanPurpose')}
                rows={3}
                className={`form-input ${errors.loan?.loanPurpose ? 'form-input-error' : ''}`}
                placeholder="Describe the purpose of this loan..."
              />
              {errors.loan?.loanPurpose && (
                <p className="error-message">{errors.loan.loanPurpose.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('business')}
                className="btn-secondary flex-1"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Evaluating...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
