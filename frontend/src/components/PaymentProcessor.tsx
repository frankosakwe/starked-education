'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { PaymentDetails, TransactionResult, WalletInfo, Course } from '@/types/enrollment';
import { stellarService } from '@/lib/stellar';

interface PaymentProcessorProps {
  course: Course;
  walletInfo: WalletInfo;
  onPaymentComplete: (result: TransactionResult) => void;
  onPaymentError: (error: string) => void;
  className?: string;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  course,
  walletInfo,
  onPaymentComplete,
  onPaymentError,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'preparing' | 'signing' | 'processing' | 'completed' | 'error'>('idle');
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const PLATFORM_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || 'GDQD23O6DZGMZCB76DGN4Q5PQIYXKQDN7B2JIV5KJEB2VZQKUCVXIH23';

  const preparePaymentDetails = (): PaymentDetails => {
    return {
      amount: course.price,
      currency: course.currency,
      recipientAddress: PLATFORM_WALLET_ADDRESS,
      memo: `Course enrollment: ${course.id}`,
      network: walletInfo.network
    };
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    setPaymentStep('preparing');

    try {
      // Validate wallet connection
      if (!walletInfo.isConnected || !walletInfo.publicKey) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      // Check if user has sufficient balance
      const balance = await stellarService.getAccountBalance(walletInfo.publicKey);
      if (balance < course.price) {
        throw new Error(`Insufficient balance. You have ${stellarService.formatAmount(balance)} XLM but need ${stellarService.formatAmount(course.price)} XLM.`);
      }

      setPaymentStep('signing');

      // Prepare payment details
      const paymentDetails = preparePaymentDetails();

      // Send payment through Stellar
      setPaymentStep('processing');
      const result = await stellarService.sendPayment(paymentDetails);

      if (result.success) {
        setTransactionResult(result);
        setPaymentStep('completed');
        onPaymentComplete(result);
      } else {
        throw new Error(result.error || 'Payment failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      setPaymentStep('error');
      onPaymentError(errorMessage);
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setPaymentStep('idle');
    setTransactionResult(null);
    setError(null);
  };

  const getStepIcon = () => {
    switch (paymentStep) {
      case 'preparing':
        return <Loader2 className="animate-spin h-5 w-5" />;
      case 'signing':
        return <Wallet className="h-5 w-5" />;
      case 'processing':
        return <Loader2 className="animate-spin h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getStepText = () => {
    switch (paymentStep) {
      case 'preparing':
        return 'Preparing transaction...';
      case 'signing':
        return 'Waiting for wallet signature...';
      case 'processing':
        return 'Processing payment...';
      case 'completed':
        return 'Payment completed!';
      case 'error':
        return 'Payment failed';
      default:
        return 'Ready to pay';
    }
  };

  if (paymentStep === 'completed' && transactionResult) {
    return (
      <div className={`payment-processor ${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              You have successfully enrolled in {course.title}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-medium">
                    {stellarService.formatAmount(course.price)} {course.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction:</span>
                  <span className="font-mono text-xs">
                    {stellarService.formatAddress(transactionResult.transactionHash || '')}
                  </span>
                </div>
              </div>
            </div>

            {transactionResult.transactionHash && (
              <a
                href={`https://${
                  walletInfo.network === 'mainnet' ? 'steexp.com' : 'steexp.com/tx'
                }/${transactionResult.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm"
              >
                View on Stellar Explorer
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`payment-processor ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Details
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Course:</span>
              <span className="text-sm text-gray-900">{course.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Price:</span>
              <span className="text-lg font-bold text-gray-900">
                {stellarService.formatAmount(course.price)} {course.currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Your Balance:</span>
              <span className="text-sm text-gray-900">
                {stellarService.formatAmount(walletInfo.balance || 0)} {course.currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Network:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                walletInfo.network === 'mainnet' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {walletInfo.network.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              {getStepIcon()}
              <span className="text-sm text-blue-700 ml-2">{getStepText()}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handlePayment}
            disabled={isProcessing || !walletInfo.isConnected}
            className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                {getStepText()}
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay {stellarService.formatAmount(course.price)} {course.currency}
              </>
            )}
          </button>

          {paymentStep !== 'idle' && (
            <button
              onClick={resetPayment}
              disabled={isProcessing}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>• Payment will be processed on the {walletInfo.network} network</p>
          <p>• You will need to sign the transaction with your wallet</p>
          <p>• Transaction may take a few seconds to confirm</p>
        </div>
      </div>
    </div>
  );
};
