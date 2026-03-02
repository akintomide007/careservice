'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import DynamicForm from '@/components/DynamicForm';
import {
  ArrowLeft,
  FileText,
  ClipboardList,
  Activity,
  User,
  Sparkles,
  ChevronRight,
  XCircle
} from 'lucide-react';

function FormsPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft');
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [draftData, setDraftData] = useState<any>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const [rejectedForms, setRejectedForms] = useState<any[]>([]);
  const [loadingRejected, setLoadingRejected] = useState(true);

  useEffect(() => {
    if (user) {
      loadTemplates();
      loadDrafts();
      loadRejectedFormsData();
      
      // Check if we need to load a draft
      if (draftId) {
        loadDraft(draftId);
      }
    }
  }, [user, draftId]);

  const loadRejectedFormsData = async () => {
    setLoadingRejected(true);
    try {
      const data = await loadRejectedForms();
      setRejectedForms(data);
    } finally {
      setLoadingRejected(false);
    }
  };

  const loadDrafts = async () => {
    setLoadingDrafts(true);
    try {
      const data = await api.getFormResponses('draft');
      // Filter out any forms that are actually rejected (shouldn't happen but just in case)
      const actualDrafts = data.filter((form: any) => form.status === 'draft');
      setDrafts(actualDrafts);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setLoadingDrafts(false);
    }
  };

  const loadDraft = async (id: string) => {
    setLoadingDraft(true);
    try {
      const draft = await api.getFormResponse(id);
      
      // Filter out metadata from response data (like _approval)
      const cleanResponseData = { ...draft.responseData };
      delete cleanResponseData._approval;
      
      // Store the draft data including its ID for updates
      setDraftData({ ...draft, id, responseData: cleanResponseData });
      
      // Automatically load the template for this draft
      const fullTemplate = await api.getFormTemplate(draft.templateId);
      setSelectedTemplate(fullTemplate);
    } catch (error) {
      console.error('Failed to load draft:', error);
      alert('Failed to load draft form');
      // Clear the draft parameter and go back to forms list
      router.replace('/forms');
    } finally {
      setLoadingDraft(false);
    }
  };

  const loadRejectedForms = async () => {
    try {
      const data = await api.getFormResponses('rejected');
      return data;
    } catch (error) {
      console.error('Failed to load rejected forms:', error);
      return [];
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await api.getFormTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSelectTemplate = async (template: any) => {
    try {
      // Fetch full template with sections and fields
      const fullTemplate = await api.getFormTemplate(template.id);
      setSelectedTemplate(fullTemplate);
    } catch (error) {
      console.error('Failed to load template details:', error);
      alert('Failed to load form template');
    }
  };

  const handleSaveForm = async (formData: any, status: 'draft' | 'submitted') => {
    try {
      if (draftData && draftId) {
        // Update existing draft
        await api.updateFormResponse(draftId, {
          responseData: formData,
          status
        });
      } else {
        // Create new form response
        await api.saveFormResponse({
          templateId: selectedTemplate.id,
          responseData: formData,
          status
        });
      }
      
      alert(status === 'draft' ? 'Form saved as draft!' : 'Form submitted successfully!');
      
      // Clear form state
      setSelectedTemplate(null);
      setDraftData(null);
      
      // Navigate back to forms page without draft parameter
      // This clears the URL and prevents duplicate loading
      router.replace('/forms');
      
      // Reload drafts and rejected forms after navigation to reflect changes
      // When submitted, the form will no longer appear in drafts (status is 'submitted')
      await loadDrafts();
      await loadRejectedFormsData();
      
      // If submitted, redirect to dashboard after a short delay
      if (status === 'submitted') {
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save form');
    }
  };

  if (loading || loadingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse" />
          <div className="text-xl font-medium text-gray-700">
            {loadingDraft ? 'Loading draft...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (selectedTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DynamicForm
            template={selectedTemplate}
            initialData={draftData?.responseData}
            onSave={handleSaveForm}
            onCancel={() => {
              setSelectedTemplate(null);
              setDraftData(null);
              // Clear draft parameter from URL
              router.replace('/forms');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Forms</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900 hidden sm:inline">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rejected Forms Section - Needs Attention */}
        {!loadingRejected && rejectedForms.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Forms Needing Revision</h2>
                  <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    {rejectedForms.length}
                  </span>
                </div>
                <p className="text-gray-600">These forms were rejected and need your attention</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rejectedForms.map((form) => {
                const approvalData = form.responseData?._approval || {};
                return (
                  <div
                    key={form.id}
                    onClick={() => loadDraft(form.id)}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-red-300 hover:border-red-500 overflow-hidden transform hover:scale-105"
                  >
                    {/* Rejected Badge */}
                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs font-bold uppercase tracking-wide">
                          Needs Revision
                        </span>
                        <span className="text-white/80 text-xs">
                          {new Date(form.updatedAt || form.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                            {form.template?.name || 'Untitled Form'}
                          </h3>
                          {approvalData.comment && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-2">
                              <p className="text-xs font-semibold text-red-800 mb-1">Manager's Feedback:</p>
                              <p className="text-sm text-red-700">{approvalData.comment}</p>
                            </div>
                          )}
                          {form.template?.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {form.template.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 font-medium">
                            {form.template?.formType?.replace('_', ' ') || 'Form'}
                          </span>
                        </div>
                        <button className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                          <span>Revise & Resubmit</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My Drafts Section */}
        {!loadingDrafts && drafts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900">My Drafts</h2>
                  <span className="ml-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                    {drafts.length}
                  </span>
                </div>
                <p className="text-gray-600">Continue working on your saved draft forms</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => loadDraft(draft.id)}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-orange-200 hover:border-orange-400 overflow-hidden transform hover:scale-105"
                >
                  {/* Draft Badge */}
                  <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-bold uppercase tracking-wide">
                        Draft
                      </span>
                      <span className="text-white/80 text-xs">
                        {new Date(draft.updatedAt || draft.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {draft.template?.name || 'Untitled Form'}
                        </h3>
                        {draft.template?.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {draft.template.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600 font-medium">
                          {draft.template?.formType?.replace('_', ' ') || 'Form'}
                        </span>
                      </div>
                      <button className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                        <span>Continue</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Available Forms</h2>
          </div>
          <p className="text-gray-600">Select a form template to begin filling it out</p>
        </div>

        {/* Forms Grid */}
        {loadingTemplates ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Activity className="w-12 h-12 text-blue-600 animate-pulse" />
            <p className="text-gray-500 font-medium">Loading forms...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 space-y-4">
            <FileText className="w-16 h-16 text-gray-300" />
            <p className="text-gray-500 font-medium">No forms available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden transform hover:scale-105"
              >
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-blue-100 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                          {template.formType.replace('_', ' ')}
                        </span>
                      </div>
                      {template.serviceType && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {template.serviceType}
                        </span>
                      )}
                    </div>
                    <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                      <span>Fill Out</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FormsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse" />
          <div className="text-xl font-medium text-gray-700">Loading...</div>
        </div>
      </div>
    }>
      <FormsPageContent />
    </Suspense>
  );
}
