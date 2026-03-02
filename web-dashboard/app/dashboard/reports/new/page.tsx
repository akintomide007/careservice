'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import SurveyFormHeader from '@/components/reports/SurveyFormHeader';
import ActivitySurveyItem from '@/components/reports/ActivitySurveyItem';
import IndividualResponseSection from '@/components/reports/IndividualResponseSection';
import SpeechToTextInput from '@/components/SpeechToTextInput';
import { Plus, Save, Send, ArrowLeft } from 'lucide-react';

export default function NewProgressNotePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [ispOutcomes, setIspOutcomes] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    serviceType: '',
    serviceDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    location: '',
    ispOutcomeId: '',
    reasonForService: '',
    supportsProvided: '',
    individualResponse: {
      engagement: '',
      mood: '',
      communication: '',
      examples: ''
    },
    progressAssessment: '',
    progressNotes: '',
    safetyDignityNotes: '',
    nextSteps: '',
    activities: [] as any[]
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (formData.clientId) {
      loadIspOutcomes(formData.clientId);
    }
  }, [formData.clientId]);

  const loadClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadIspOutcomes = async (clientId: string) => {
    try {
      const data = await api.getIspGoals(clientId);
      setIspOutcomes(data);
    } catch (error) {
      console.error('Error loading ISP outcomes:', error);
    }
  };

  const addActivity = () => {
    const newActivity = {
      activityNumber: formData.activities.length + 1,
      taskGoal: '',
      supportsProvided: '',
      promptLevel: [],
      objectiveObservation: ''
    };
    setFormData({
      ...formData,
      activities: [...formData.activities, newActivity]
    });
  };

  const updateActivity = (index: number, field: string, value: any) => {
    const updatedActivities = [...formData.activities];
    updatedActivities[index] = {
      ...updatedActivities[index],
      [field]: value
    };
    setFormData({
      ...formData,
      activities: updatedActivities
    });
  };

  const removeActivity = (index: number) => {
    const updatedActivities = formData.activities.filter((_, i) => i !== index);
    // Renumber activities
    const renumbered = updatedActivities.map((activity, i) => ({
      ...activity,
      activityNumber: i + 1
    }));
    setFormData({
      ...formData,
      activities: renumbered
    });
  };

  const validateForm = () => {
    if (!formData.clientId) {
      alert('Please select an individual');
      return false;
    }
    if (!formData.serviceType) {
      alert('Please select a service type');
      return false;
    }
    if (!formData.serviceDate) {
      alert('Please select a service date');
      return false;
    }
    if (!formData.startTime || !formData.endTime) {
      alert('Please enter start and end times');
      return false;
    }
    // Validate activities have required fields
    for (let i = 0; i < formData.activities.length; i++) {
      const activity = formData.activities[i];
      if (!activity.taskGoal) {
        alert(`Activity ${i + 1}: Task/Goal is required`);
        return false;
      }
      if (!activity.promptLevel || activity.promptLevel.length === 0) {
        alert(`Activity ${i + 1}: Please select at least one prompt level`);
        return false;
      }
    }
    return true;
  };

  const handleSaveAsDraft = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Add createProgressNote method to API
      const response = await api.request('/api/progress-notes', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          status: 'draft'
        })
      });

      alert('Progress note saved as draft successfully!');
      router.push('/dashboard/reports');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      alert(error.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Create progress note
      const response = await api.request('/api/progress-notes', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      // Submit it
      await api.request(`/api/progress-notes/${response.id}/submit`, {
        method: 'POST'
      });

      alert('Progress note submitted successfully!');
      router.push('/dashboard/reports');
    } catch (error: any) {
      console.error('Error submitting progress note:', error);
      alert(error.message || 'Failed to submit progress note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/reports')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Progress Report</h1>
                <p className="text-sm text-gray-600">Service Documentation</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save as Draft</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          {/* Service Information */}
          <SurveyFormHeader
            formData={formData}
            setFormData={setFormData}
            clients={clients}
            ispOutcomes={ispOutcomes}
          />

          {/* Section 1: Reason for Service */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 bg-gray-200 p-3 -m-6 mb-4">
              1. Reason for Service
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why was this service provided today?
              </label>
              <select
                value={formData.reasonForService}
                onChange={(e) => setFormData({ ...formData, reasonForService: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Reason --</option>
                <option value="Scheduled ISP support">Scheduled ISP support</option>
                <option value="Community integration activity">Community integration activity</option>
                <option value="Skill building / ADL training">Skill building / ADL training</option>
                <option value="Health/medical appointment accompaniment">Health/medical appointment accompaniment</option>
                <option value="Social/recreational activity">Social/recreational activity</option>
                <option value="Family/guardian requested support">Family/guardian requested support</option>
                <option value="Behavioral support / crisis prevention">Behavioral support / crisis prevention</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Section 2: Activities */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4 bg-gray-200 p-3 -m-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                2. Activities / Tasks
              </h2>
              <button
                type="button"
                onClick={addActivity}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </div>

            {formData.activities.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-4">No activities added yet</p>
                <button
                  type="button"
                  onClick={addActivity}
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add First Activity</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.activities.map((activity, index) => (
                  <ActivitySurveyItem
                    key={index}
                    activity={activity}
                    index={index}
                    updateActivity={updateActivity}
                    removeActivity={removeActivity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Supports/Prompting */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 bg-gray-200 p-3 -m-6 mb-4">
              3. Supports / Prompting
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Supports Summary
              </label>
              <SpeechToTextInput
                value={formData.supportsProvided}
                onChange={(val) => setFormData({ ...formData, supportsProvided: val })}
                placeholder="e.g., Visual schedule used; verbal prompts for transitions; physical assistance with coat"
                multiline
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-2">
                Summarize supports that applied throughout the session or across multiple activities
              </p>
            </div>
          </div>

          {/* Section 4: Individual Response */}
          <IndividualResponseSection
            formData={formData}
            setFormData={setFormData}
          />

          {/* Section 5: Progress Assessment */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 bg-gray-200 p-3 -m-6 mb-4">
              5. Progress Assessment
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Toward Goals
              </label>
              <select
                value={formData.progressAssessment}
                onChange={(e) => setFormData({ ...formData, progressAssessment: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="">-- Select Progress Level --</option>
                <option value="Goal met/mastered">Goal met/mastered</option>
                <option value="Significant progress">Significant progress</option>
                <option value="Moderate progress">Moderate progress</option>
                <option value="Minimal progress">Minimal progress</option>
                <option value="No observable progress">No observable progress</option>
                <option value="Regression noted">Regression noted</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Progress Notes
              </label>
              <SpeechToTextInput
                value={formData.progressNotes}
                onChange={(val) => setFormData({ ...formData, progressNotes: val })}
                placeholder="e.g., Individual demonstrated increased independence compared to last week; needs continued work on money handling"
                multiline
                rows={3}
              />
            </div>
          </div>

          {/* Section 6: Safety & Dignity */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 bg-gray-200 p-3 -m-6 mb-4">
              6. Safety & Dignity
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Safety or Dignity Concerns
              </label>
              <select
                value={formData.safetyDignityNotes ? 'yes' : 'no'}
                onChange={(e) => {
                  if (e.target.value === 'no') {
                    setFormData({ ...formData, safetyDignityNotes: '' });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="no">No concerns</option>
                <option value="yes">Yes, document below</option>
              </select>

              {formData.safetyDignityNotes !== '' || formData.safetyDignityNotes === undefined ? (
                <SpeechToTextInput
                  value={formData.safetyDignityNotes || ''}
                  onChange={(val) => setFormData({ ...formData, safetyDignityNotes: val })}
                  placeholder="Document any safety issues, near misses, dignity concerns, or protective interventions"
                  multiline
                  rows={3}
                />
              ) : null}
              <p className="text-xs text-gray-500 mt-2">
                Note: If serious, also file an incident report
              </p>
            </div>
          </div>

          {/* Section 7: Next Steps */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 bg-gray-200 p-3 -m-6 mb-4">
              7. Next Steps / Recommendations
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Actions or Adjustments
              </label>
              <SpeechToTextInput
                value={formData.nextSteps}
                onChange={(val) => setFormData({ ...formData, nextSteps: val })}
                placeholder="e.g., Continue visual supports; try new caf next week; consult with SLP about communication device"
                multiline
                rows={3}
              />
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
            <button
              type="button"
              onClick={() => router.push('/dashboard/reports')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 font-medium"
              >
                <Save className="w-5 h-5" />
                <span>Save as Draft</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
