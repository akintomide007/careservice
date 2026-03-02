'use client';

interface IndividualResponseSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function IndividualResponseSection({ formData, setFormData }: IndividualResponseSectionProps) {
  const updateResponse = (field: string, value: string) => {
    setFormData({
      ...formData,
      individualResponse: {
        ...formData.individualResponse,
        [field]: value
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 bg-gray-200 p-3 -m-6 mb-4">
        4. Individual Response
      </h2>

      <div className="space-y-4">
        {/* Engagement/Compliance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Engagement/Compliance
          </label>
          <select
            value={formData.individualResponse?.engagement || ''}
            onChange={(e) => updateResponse('engagement', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select --</option>
            <option value="Fully engaged, followed instructions">Fully engaged, followed instructions</option>
            <option value="Mostly engaged, occasional redirection needed">Mostly engaged, occasional redirection needed</option>
            <option value="Partially engaged">Partially engaged</option>
            <option value="Required frequent prompting">Required frequent prompting</option>
            <option value="Cooperative">Cooperative</option>
            <option value="Focused, followed task steps">Focused, followed task steps</option>
          </select>
        </div>

        {/* Affect/Mood */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Affect/Mood
          </label>
          <select
            value={formData.individualResponse?.mood || ''}
            onChange={(e) => updateResponse('mood', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select --</option>
            <option value="Calm and motivated">Calm and motivated</option>
            <option value="Happy and proud">Happy and proud</option>
            <option value="Calm, happy, motivated">Calm, happy, motivated</option>
            <option value="Calm, focused, cooperative">Calm, focused, cooperative</option>
            <option value="Confident, motivated">Confident, motivated</option>
            <option value="Positive and engaged">Positive and engaged</option>
            <option value="Neutral">Neutral</option>
            <option value="Frustrated">Frustrated</option>
            <option value="Anxious">Anxious</option>
          </select>
        </div>

        {/* Communication */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Communication
          </label>
          <select
            value={formData.individualResponse?.communication || ''}
            onChange={(e) => updateResponse('communication', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select --</option>
            <option value="Used verbal language and gestures appropriately">Used verbal language and gestures appropriately</option>
            <option value="Used verbal requests">Used verbal requests</option>
            <option value="Verbal communication clear">Verbal communication clear</option>
            <option value="Non-verbal cues used effectively">Non-verbal cues used effectively</option>
            <option value="Gestural communication">Gestural communication</option>
            <option value="Minimal communication">Minimal communication</option>
          </select>
        </div>

        {/* Observed Examples */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observed Examples
          </label>
          <textarea
            value={formData.individualResponse?.examples || ''}
            onChange={(e) => updateResponse('examples', e.target.value)}
            placeholder="e.g., Independently greeted staff, requested snack, made choice with minimal prompts"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
