'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Course, EnrollmentForm as EnrollmentFormData, EnrollmentResponse } from '@/types/enrollment';
import { EnrollmentForm } from '@/components/EnrollmentForm';

export default function EnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentComplete, setEnrollmentComplete] = useState(false);
  const [enrollmentResponse, setEnrollmentResponse] = useState<EnrollmentResponse | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real application, this would be an API call
      // For demo purposes, we'll use mock data
      const mockCourse: Course = {
        id: courseId,
        title: 'Introduction to Stellar Blockchain Development',
        description: 'Learn the fundamentals of building decentralized applications on the Stellar network. This comprehensive course covers everything from basic concepts to advanced smart contract development.',
        price: 50.00,
        currency: 'XLM',
        instructor: 'Dr. Sarah Johnson',
        duration: '6 weeks',
        level: 'beginner',
        thumbnail: '/course-thumbnail.jpg',
        prerequisites: ['Basic programming knowledge', 'Understanding of blockchain concepts'],
        learningObjectives: [
          'Master Stellar SDK and tools',
          'Build and deploy smart contracts',
          'Create tokenized assets',
          'Implement secure payment systems',
          'Develop real-world dApps'
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCourse(mockCourse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch course details';
      setError(errorMessage);
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentComplete = async (enrollmentData: EnrollmentFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare the enrollment data for API
      const payload = {
        courseId: course?.id,
        personalInfo: enrollmentData.personalInfo,
        paymentInfo: {
          method: enrollmentData.paymentInfo.method,
          walletAddress: enrollmentData.paymentInfo.walletAddress,
          transactionHash: enrollmentData.paymentInfo.transactionHash
        },
        amount: course?.price,
        currency: course?.currency
      };

      // Call enrollment API
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: EnrollmentResponse = await response.json();

      if (result.success && result.data) {
        setEnrollmentResponse(result);
        setEnrollmentComplete(true);
      } else {
        throw new Error(result.error?.message || 'Enrollment failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Enrollment failed';
      setError(errorMessage);
      console.error('Enrollment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleViewReceipt = () => {
    if (enrollmentResponse?.receipt) {
      router.push(`/receipt/${enrollmentResponse.receipt.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Course Details</h2>
          <p className="text-gray-600">Please wait while we fetch the course information...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/courses"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (enrollmentComplete && enrollmentResponse) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Enrollment Successful!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Congratulations! You have successfully enrolled in {course?.title}
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student Name:</span>
                    <span className="font-medium">
                      {enrollmentResponse.data?.userId || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course:</span>
                    <span className="font-medium">{course?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrollment Date:</span>
                    <span className="font-medium">
                      {enrollmentResponse.data?.enrollmentDate 
                        ? new Date(enrollmentResponse.data.enrollmentDate).toLocaleDateString()
                        : new Date().toLocaleDateString()
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium">
                      {course?.price} {course?.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm">
                      {enrollmentResponse.data?.transactionHash || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGoToDashboard}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                {enrollmentResponse.receipt && (
                  <button
                    onClick={handleViewReceipt}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View Receipt
                  </button>
                )}
                <Link
                  href={`/courses/${courseId}`}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center"
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>

          {course && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 md:w-48 md:h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 md:w-48 md:h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {course.title}
                      </h1>
                      <p className="text-gray-600 mb-4">{course.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-indigo-600">
                        {course.price} {course.currency}
                      </div>
                      <div className="text-sm text-gray-500">One-time payment</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Instructor</div>
                      <div className="font-medium">{course.instructor}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-medium">{course.duration}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Level</div>
                      <div className="font-medium capitalize">{course.level}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Certificate</div>
                      <div className="font-medium">Yes</div>
                    </div>
                  </div>

                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Prerequisites:</h3>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {course.prerequisites.map((prereq, index) => (
                          <li key={index}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.learningObjectives && course.learningObjectives.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">What you'll learn:</h3>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {course.learningObjectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enrollment Form */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {course && (
          <EnrollmentForm
            course={course}
            onEnrollmentComplete={handleEnrollmentComplete}
            onEnrollmentError={handleEnrollmentError}
          />
        )}
      </div>
    </div>
  );
}
