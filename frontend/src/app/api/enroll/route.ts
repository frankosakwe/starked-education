import { NextRequest, NextResponse } from 'next/server';
import { EnrollmentData, PaymentReceipt, EnrollmentResponse, ApiError } from '@/types/enrollment';

// Mock database - in a real application, this would be a proper database
const enrollments: EnrollmentData[] = [];
const receipts: PaymentReceipt[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      courseId,
      personalInfo,
      paymentInfo,
      amount,
      currency
    } = body;

    // Validate required fields
    if (!courseId || !personalInfo || !paymentInfo || !amount || !currency) {
      const error: ApiError = {
        code: 'MISSING_FIELDS',
        message: 'Missing required fields for enrollment'
      };
      return NextResponse.json(
        { success: false, error } as EnrollmentResponse,
        { status: 400 }
      );
    }

    // Validate personal information
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
      const error: ApiError = {
        code: 'INVALID_PERSONAL_INFO',
        message: 'Personal information is incomplete'
      };
      return NextResponse.json(
        { success: false, error } as EnrollmentResponse,
        { status: 400 }
      );
    }

    // Validate payment information
    if (!paymentInfo.walletAddress || !paymentInfo.transactionHash) {
      const error: ApiError = {
        code: 'INVALID_PAYMENT_INFO',
        message: 'Payment information is incomplete'
      };
      return NextResponse.json(
        { success: false, error } as EnrollmentResponse,
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) {
      const error: ApiError = {
        code: 'INVALID_EMAIL',
        message: 'Invalid email address format'
      };
      return NextResponse.json(
        { success: false, error } as EnrollmentResponse,
        { status: 400 }
      );
    }

    // Check if user is already enrolled in this course
    const existingEnrollment = enrollments.find(
      enrollment => 
        enrollment.courseId === courseId && 
        enrollment.userId === personalInfo.email
    );

    if (existingEnrollment) {
      const error: ApiError = {
        code: 'ALREADY_ENROLLED',
        message: 'You are already enrolled in this course'
      };
      return NextResponse.json(
        { success: false, error } as EnrollmentResponse,
        { status: 409 }
      );
    }

    // Create enrollment record
    const enrollment: EnrollmentData = {
      courseId,
      userId: personalInfo.email,
      walletAddress: paymentInfo.walletAddress,
      paymentMethod: paymentInfo.method || 'stellar',
      paymentStatus: 'completed',
      enrollmentDate: new Date(),
      amount: parseFloat(amount),
      currency,
      transactionHash: paymentInfo.transactionHash
    };

    // Generate unique receipt ID
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment receipt
    const receipt: PaymentReceipt = {
      id: receiptId,
      enrollmentId: enrollment.userId,
      courseId,
      amount: parseFloat(amount),
      currency,
      transactionHash: paymentInfo.transactionHash,
      timestamp: new Date(),
      status: 'completed',
      walletAddress: paymentInfo.walletAddress
    };

    // In a real application, you would:
    // 1. Verify the transaction on the Stellar network
    // 2. Save to a proper database
    // 3. Send confirmation emails
    // 4. Update course enrollment counts
    // 5. Grant access to course materials

    // For demo purposes, we'll simulate these operations
    enrollments.push(enrollment);
    receipts.push(receipt);

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response: EnrollmentResponse = {
      success: true,
      data: enrollment,
      receipt
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Enrollment error:', error);
    
    const apiError: ApiError = {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred during enrollment',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    const response: EnrollmentResponse = {
      success: false,
      error: apiError
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    let filteredEnrollments = enrollments;

    if (userId) {
      filteredEnrollments = filteredEnrollments.filter(
        enrollment => enrollment.userId === userId
      );
    }

    if (courseId) {
      filteredEnrollments = filteredEnrollments.filter(
        enrollment => enrollment.courseId === courseId
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredEnrollments
    });

  } catch (error) {
    console.error('Error fetching enrollments:', error);
    
    const apiError: ApiError = {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch enrollments'
    };

    return NextResponse.json(
      { success: false, error: apiError },
      { status: 500 }
    );
  }
}

// Helper function to verify Stellar transaction (placeholder)
async function verifyStellarTransaction(transactionHash: string, expectedAmount: number, recipientAddress: string): Promise<boolean> {
  try {
    // In a real implementation, you would:
    // 1. Use Stellar SDK to fetch transaction details
    // 2. Verify the transaction exists and is successful
    // 3. Verify the amount matches the expected amount
    // 4. Verify the recipient address matches your platform wallet
    // 5. Verify the transaction memo contains the correct course ID
    
    // For demo purposes, we'll simulate verification
    console.log(`Verifying transaction ${transactionHash} for amount ${expectedAmount} to ${recipientAddress}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, return the actual verification result
    return true;
    
  } catch (error) {
    console.error('Transaction verification failed:', error);
    return false;
  }
}

// Helper function to send confirmation email (placeholder)
async function sendConfirmationEmail(email: string, courseName: string, receipt: PaymentReceipt): Promise<void> {
  try {
    // In a real implementation, you would:
    // 1. Use an email service like SendGrid, AWS SES, or Resend
    // 2. Send a professional HTML email with enrollment details
    // 3. Include receipt information and course access instructions
    
    console.log(`Sending confirmation email to ${email} for course ${courseName}`);
    console.log(`Receipt ID: ${receipt.id}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // Don't fail the enrollment if email fails
  }
}
