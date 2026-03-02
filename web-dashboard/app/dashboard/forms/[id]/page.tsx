'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import PrintButton from '@/components/print/PrintButton';
import { ArrowLeft } from 'lucide-react';

export default function FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForm();
  }, [params.id]);

  const loadForm = async () => {
    try {
      const data = await api.getFormResponse(params.id as string);
      setForm(data);
    } catch (error) {
      console.error('Error loading form:', error);
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

  if (!form) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Form Not Found</h2>
          <button
            onClick={() => router.push('/dashboard/forms')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  const responseData = form.responseData || {};
  const sections = form.template?.sections || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.75in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-no-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Header - Screen Only */}
      <div className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard/forms')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Forms</span>
            </button>
            <PrintButton text="Print Form" />
          </div>
        </div>
      </div>

      {/* Professional Document View - Always Visible */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11pt', lineHeight: '1.4' }}>
          {/* Professional Document Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="text-xs text-gray-600 mb-1">Care Provider System - Form Document</div>
                <h1 className="text-lg font-bold uppercase border-b-2 border-black pb-1">
                  {form.template?.name}
                </h1>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold">Document ID</div>
                <div className="text-gray-600">{form.id?.substring(0, 8)}</div>
              </div>
            </div>
          </div>

          {/* Form Information Table */}
          <div className="border border-black mb-6">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="border-r border-b border-black p-2 font-semibold bg-gray-100" style={{ width: '25%' }}>Form Type:</td>
                  <td className="border-r border-b border-black p-2" style={{ width: '25%' }}>{form.template?.formType?.replace('_', ' ')}</td>
                  <td className="border-r border-b border-black p-2 font-semibold bg-gray-100" style={{ width: '25%' }}>Status:</td>
                  <td className="border-b border-black p-2" style={{ width: '25%' }}>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      form.status === 'approved' ? 'bg-green-100 text-green-800' :
                      form.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {form.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-b border-black p-2 font-semibold bg-gray-100">Submitted By:</td>
                  <td className="border-r border-b border-black p-2">{form.user?.firstName} {form.user?.lastName}</td>
                  <td className="border-r border-b border-black p-2 font-semibold bg-gray-100">Submission Date:</td>
                  <td className="border-b border-black p-2">{new Date(form.submittedAt || form.createdAt).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-semibold bg-gray-100">Submission Time:</td>
                  <td className="border-r border-black p-2">{new Date(form.submittedAt || form.createdAt).toLocaleTimeString()}</td>
                  <td className="border-r border-black p-2 font-semibold bg-gray-100">Form ID:</td>
                  <td className="border-black p-2">{form.id.substring(0, 13)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Form Sections */}
          {sections.map((section: any, sectionIndex: number) => (
            <div key={section.id} className="mb-5 print-no-break">
              <div className="bg-gray-100 border border-black p-2">
                <h2 className="text-sm font-bold">SECTION {sectionIndex + 1}: {section.title.toUpperCase()}</h2>
                {section.description && (
                  <p className="text-xs text-gray-600 mt-1 italic">{section.description}</p>
                )}
              </div>
              
              <div className="border border-t-0 border-black p-3">
                <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    {section.fields?.map((field: any, fieldIndex: number) => {
                      const possibleKeys = [
                        `${section.id}_${field.id}`,
                        `${section.id}_0_${field.id}`,
                        field.label,
                        field.id
                      ];
                      
                      let fieldValue = null;
                      for (const key of possibleKeys) {
                        if (responseData[key] !== undefined && responseData[key] !== null && responseData[key] !== '') {
                          fieldValue = responseData[key];
                          break;
                        }
                      }
                      
                      if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
                        if (fieldValue !== 0 && fieldValue !== false) {
                          return null;
                        }
                      }

                      return (
                        <tr key={field.id} className="border-b border-gray-300 last:border-b-0">
                          <td className="border-r border-gray-300 p-2 font-semibold bg-gray-50 align-top" style={{ width: '30%' }}>
                            {field.label}
                            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </td>
                          <td className="p-2 align-top">
                            {field.fieldType === 'checkbox' || field.fieldType === 'multiselect' ? (
                              Array.isArray(fieldValue) ? (
                                <ul className="list-disc list-inside space-y-0.5">
                                  {fieldValue.map((item: string, idx: number) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>{fieldValue}</span>
                              )
                            ) : field.fieldType === 'textarea' ? (
                              <span className="whitespace-pre-wrap">{fieldValue}</span>
                            ) : field.fieldType === 'date' ? (
                              <span>{fieldValue ? new Date(fieldValue).toLocaleDateString() : 'N/A'}</span>
                            ) : typeof fieldValue === 'boolean' ? (
                              <span>{fieldValue ? 'Yes' : 'No'}</span>
                            ) : (
                              <span>{fieldValue}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Approval Information */}
          {(form.status === 'approved' || form.status === 'rejected') && responseData._approval && (
            <div className="mb-5">
              <div className="bg-gray-100 border border-black p-2">
                <h2 className="text-sm font-bold">APPROVAL INFORMATION</h2>
              </div>
              <div className="border border-t-0 border-black p-3">
                <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="border-r border-gray-300 p-2 font-semibold bg-gray-50" style={{ width: '30%' }}>Decision:</td>
                      <td className="p-2">{responseData._approval.action?.toUpperCase()}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="border-r border-gray-300 p-2 font-semibold bg-gray-50">Reviewed By:</td>
                      <td className="p-2">{responseData._approval.approverName || 'Manager'}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="border-r border-gray-300 p-2 font-semibold bg-gray-50">Review Date:</td>
                      <td className="p-2">{new Date(responseData._approval.approvedAt).toLocaleString()}</td>
                    </tr>
                    {responseData._approval.comment && (
                      <tr>
                        <td className="border-r border-gray-300 p-2 font-semibold bg-gray-50 align-top">Comments:</td>
                        <td className="p-2 whitespace-pre-wrap">{responseData._approval.comment}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="mt-8 pt-4 border-t-2 border-black">
            <div className="text-xs font-bold mb-3">STAFF CERTIFICATION & SIGNATURE</div>
            <div className="grid grid-cols-2 gap-8 text-xs mb-4">
              <div>
                <div className="mb-1 text-gray-700">Submitted By (Print):</div>
                <div className="border-b-2 border-black pb-1 min-h-[30px] flex items-end">
                  {form.user?.firstName} {form.user?.lastName}
                </div>
              </div>
              <div>
                <div className="mb-1 text-gray-700">Role/Title:</div>
                <div className="border-b-2 border-black pb-1 min-h-[30px] flex items-end">
                  {form.user?.role || 'DSP'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-xs">
              <div>
                <div className="mb-1 text-gray-700">Signature:</div>
                <div className="border-b-2 border-black pb-1 min-h-[40px]"></div>
              </div>
              <div>
                <div className="mb-1 text-gray-700">Date Signed:</div>
                <div className="border-b-2 border-black pb-1 min-h-[40px] flex items-end">
                  {new Date(form.submittedAt || form.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs italic text-gray-700">
              I certify that the information provided in this form is accurate and complete to the best of my knowledge.
            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-8 pt-4 border-t border-gray-400 text-xs text-center text-gray-600">
            <div className="font-semibold mb-1">CONFIDENTIAL DOCUMENT</div>
            <div className="mb-1">
              This document contains protected health information (PHI) under HIPAA regulations.
              Unauthorized disclosure is prohibited by law.
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Document Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} | Page 1 of 1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
