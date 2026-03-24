'use client';

import React, { useState } from 'react';
import { User, CreditCard, CheckCircle, ArrowRight, ArrowLeft, AlertCircle, BookOpen } from 'lucide-react';
import { EnrollmentForm as EnrollmentFormData, EnrollmentStep, Course, WalletInfo } from '@/types/enrollment';
import { WalletConnector } from './WalletConnector';
import { PaymentProcessor } from './PaymentProcessor';

interface EnrollmentFormProps {
  course: Course;
  onEnrollmentComplete: (data: EnrollmentFormData) => void;
  onEnrollmentError: (error: string) => void;
  className?: string;
}

export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  course,
  onEnrollmentComplete,
  onEnrollmentError,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentFormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    paymentInfo: {
      method: 'stellar'
    },
    termsAccepted: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 3;

  const steps: EnrollmentStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      isCompleted: currentStep > 1,
      isCurrent: currentStep === 1
    },
    {
      id: 'wallet',
      title: 'Wallet Connection',
      description: 'Connect your Stellar wallet',
      isCompleted: currentStep > 2,
      isCurrent: currentStep === 2
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Complete your enrollment',
      isCompleted: currentStep > 3,
      isCurrent: currentStep === 3
    }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!enrollmentData.personalInfo.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!enrollmentData.personalInfo.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!enrollmentData.personalInfo.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enrollmentData.personalInfo.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (step === 2) {
      if (!walletInfo?.isConnected) {
        newErrors.wallet = 'Wallet connection is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleWalletConnect = (info: WalletInfo) => {
    setWalletInfo(info);
    setEnrollmentData(prev => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        walletAddress: info.publicKey
      }
    }));
  };

  const handleWalletDisconnect = () => {
    setWalletInfo(null);
    setEnrollmentData(prev => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        walletAddress: undefined
      }
    }));
  };

  const handlePaymentComplete = (result: any) => {
    setIsSubmitting(false);
    const finalData = {
      ...enrollmentData,
      paymentInfo: {
        ...enrollmentData.paymentInfo,
        transactionHash: result.transactionHash
      }
    };
    onEnrollmentComplete(finalData);
  };

  const handlePaymentError = (error: string) => {
    setIsSubmitting(false);
    onEnrollmentError(error);
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setEnrollmentData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-600">Please provide your details for enrollment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={enrollmentData.personalInfo.firstName}
                  onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={enrollmentData.personalInfo.lastName}
                  onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={enrollmentData.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={enrollmentData.personalInfo.phone || ''}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={enrollmentData.termsAccepted}
                  onChange={(e) => setEnrollmentData(prev => ({
                    ...prev,
                    termsAccepted: e.target.checked
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the terms and conditions and privacy policy
                </span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CreditCard className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Connect Your Wallet</h3>
              <p className="text-sm text-gray-600">Connect your Stellar wallet to proceed with payment</p>
            </div>

            <WalletConnector
              onWalletConnect={handleWalletConnect}
              onWalletDisconnect={handleWalletDisconnect}
            />

            {errors.wallet && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{errors.wallet}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <BookOpen className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Complete Your Enrollment</h3>
              <p className="text-sm text-gray-600">Review your details and complete the payment</p>
            </div>

            {/* Enrollment Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Enrollment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-medium">{course.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student:</span>
                  <span className="font-medium">
                    {enrollmentData.personalInfo.firstName} {enrollmentData.personalInfo.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{enrollmentData.personalInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">Stellar Wallet</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-indigo-600">{course.price} {course.currency}</span>
                  </div>
                </div>
              </div>
            </div>

            {walletInfo && (
              <PaymentProcessor
                course={course}
                walletInfo={walletInfo}
                onPaymentComplete={handlePaymentComplete}
                onPaymentError={handlePaymentError}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`enrollment-form ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step.isCompleted
                      ? 'bg-green-500 text-white'
                      : step.isCurrent
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      step.isCurrent ? 'text-indigo-600' : step.isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    step.isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!enrollmentData.termsAccepted && currentStep === 1}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {currentStep === totalSteps ? 'Complete' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
