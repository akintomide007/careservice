'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import PrintButton from '@/components/print/PrintButton';
import { ArrowLeft, Calendar, Clock, User, FileText } from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressNote();
  }, [params.id]);

  const loadProgressNote = async () => {
    try {
      const data = await api.getProgressNote(params.id as string);
      setNote(data);
    } catch (error) {
      console.error('Error loading progress note:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Report Not Found</h2>
          <button
            onClick={() => router.push('/dashboard/reports')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - No Print */}
      <div className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard/reports')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Reports</span>
            </button>
            <PrintButton text="Print Report" />
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Progress Note Report</h1>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Client: {note.client?.firstName} {note.client?.lastName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Date: {new Date(note.serviceDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Time: {note.startTime} - {note.endTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Service: {note.serviceType}</span>
              </div>
            </div>
          </div>

          {/* Report Body */}
          <div className="px-8 py-6 space-y-6">
            {/* Client Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Client Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{note.client?.firstName} {note.client?.lastName}</span>
                </div>
                <div>
                  <span className="text-gray-600">DDD ID:</span>
                  <span className="ml-2 font-medium">{note.client?.dddId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">DOB:</span>
                  <span className="ml-2 font-medium">
                    {note.client?.dateOfBirth ? new Date(note.client.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Service Details
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Service Type:</span>
                  <span className="font-medium">{note.serviceType}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Location:</span>
                  <span className="font-medium">{note.location || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Duration:</span>
                  <span className="font-medium">{note.startTime} - {note.endTime}</span>
                </div>
              </div>
            </div>

            {/* Activities & Observations */}
            {note.activities && note.activities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Activities & Observations
                </h2>
                <div className="space-y-4">
                  {note.activities.map((activity: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Activity {index + 1}</h3>
                      <div className="space-y-2 text-sm">
                        {activity.title && (
                          <div>
                            <span className="text-gray-600">Title:</span>
                            <span className="ml-2">{activity.title}</span>
                          </div>
                        )}
                        {activity.description && (
                          <div>
                            <span className="text-gray-600">Description:</span>
                            <p className="mt-1 text-gray-700">{activity.description}</p>
                          </div>
                        )}
                        {activity.outcome && (
                          <div>
                            <span className="text-gray-600">Outcome:</span>
                            <p className="mt-1 text-gray-700">{activity.outcome}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Strategies */}
            {note.serviceStrategies && note.serviceStrategies.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Service Strategies Used
                </h2>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {note.serviceStrategies.map((strategy: string, index: number) => (
                    <li key={index}>{strategy}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {note.notes && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Additional Notes
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.notes}</p>
              </div>
            )}

            {/* Staff Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Staff Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Provided By:</span>
                  <span className="ml-2 font-medium">
                    {note.user?.firstName} {note.user?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Date Created:</span>
                  <span className="ml-2 font-medium">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    note.status === 'approved' ? 'bg-green-100 text-green-800' :
                    note.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    note.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {note.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-xs text-gray-500">
            <p>This report was generated on {new Date().toLocaleString()}</p>
            <p className="mt-1">Care Provider Management System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
