'use client';

import { Trash2, Plus } from 'lucide-react';

interface ActivitySurveyItemProps {
  activity: any;
  index: number;
  updateActivity: (index: number, field: string, value: any) => void;
  removeActivity: (index: number) => void;
}

export default function ActivitySurveyItem({ activity, index, updateActivity, removeActivity }: ActivitySurveyItemProps) {
  const promptLevels = ['Independent', 'Verbal', 'Gestural', 'Model'];

  const togglePromptLevel = (level: string) => {
    const currentLevels = activity.promptLevel || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l: string) => l !== level)
      : [...currentLevels, level];
    updateActivity(index, 'promptLevel', newLevels);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 relative">
      <button
        type="button"
        onClick={() => removeActivity(index)}
        className="absolute top-4 right-4 text-red-600 hover:text-red-800"
        title="Remove Activity"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <h4 className="font-bold text-lg mb-4 text-gray-900">
        Activity {index + 1}
      </h4>

      <div className="space-y-4">
        {/* Task/Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task/Goal *
          </label>
          <input
            type="text"
            value={activity.taskGoal || ''}
            onChange={(e) => updateActivity(index, 'taskGoal', e.target.value)}
            placeholder="e.g., Order snack at caf, Brush teeth, Complete painting"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Supports Provided */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supports Provided
          </label>
          <textarea
            value={activity.supportsProvided || ''}
            onChange={(e) => updateActivity(index, 'supportsProvided', e.target.value)}
            placeholder="e.g., Visual cue card with steps; modeled ordering once; 5-second wait before prompting"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        {/* Prompt Level Used - Checkboxes for minimal typing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Prompt Level Used *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {promptLevels.map(level => (
              <label
                key={level}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  (activity.promptLevel || []).includes(level)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={(activity.promptLevel || []).includes(level)}
                  onChange={() => togglePromptLevel(level)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-900">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Objective Observation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objective Observation
          </label>
          <textarea
            value={activity.objectiveObservation || ''}
            onChange={(e) => updateActivity(index, 'objectiveObservation', e.target.value)}
            placeholder="e.g., Individual approached counter, said 'I would like a muffin,' and handed money after one verbal prompt"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
