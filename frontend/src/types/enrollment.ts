export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  prerequisites?: string[];
  learningObjectives?: string[];
}

export interface EnrollmentData {
  courseId: string;
  userId: string;
  walletAddress: string;
  paymentMethod: 'stellar' | 'card' | 'bank';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  enrollmentDate: Date;
  amount: number;
  currency: string;
  transactionHash?: string;
}

export interface WalletInfo {
  publicKey: string;
  isConnected: boolean;
  network: 'testnet' | 'mainnet' | 'futurenet';
  balance?: number;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  recipientAddress: string;
  memo?: string;
  network: 'testnet' | 'mainnet' | 'futurenet';
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  message?: string;
}

export interface EnrollmentStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface EnrollmentForm {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  paymentInfo: {
    method: 'stellar' | 'card' | 'bank';
    walletAddress?: string;
  };
  termsAccepted: boolean;
}

export interface PaymentReceipt {
  id: string;
  enrollmentId: string;
  courseId: string;
  amount: number;
  currency: string;
  transactionHash: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  walletAddress: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface EnrollmentResponse {
  success: boolean;
  data?: EnrollmentData;
  receipt?: PaymentReceipt;
  error?: ApiError;
}
