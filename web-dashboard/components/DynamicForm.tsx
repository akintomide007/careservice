'use client';

import { useState, useEffect } from 'react';
import SpeechToTextInput from './SpeechToTextInput';

interface FormField {
  id: string;
  label: string;
  fieldType: string;
  orderIndex: number;
  isRequired: boolean;
  options?: string;
  validation?: any;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  isRepeatable: boolean;
  maxRepeat?: number;
  isRequired: boolean;
  fields: FormField[];
}

interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  formType: string;
  sections: FormSection[];
}

interface DynamicFormProps {
  template: FormTemplate;
  initialData?: any;
  onSave: (data: any, status: 'draft' | 'submitted') => Promise<void>;
  onCancel?: () => void;
}

export default function DynamicForm({ template, initialData, onSave, onCancel }: DynamicFormProps) {
  const [formData, setFormData] = useState<any>(initialData || {});
  
  // Initialize repeat counts
  const [repeatCounts, setRepeatCounts] = useState<{ [key: string]: number }>({});
  
  // Update formData and repeatCounts when initialData changes (for editing existing forms)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      
      // Recalculate repeat counts from the new initial data
      const counts: { [key: string]: number } = {};
      template.sections.forEach((section) => {
        if (section.isRepeatable) {
          // Count how many repeats exist in initial data
          let maxIndex = 0;
          Object.keys(initialData).forEach((key) => {
            const match = key.match(new RegExp(`^${section.id}_(\\d+)_`));
            if (match) {
              const index = parseInt(match[1]);
              if (index > maxIndex) maxIndex = index;
            }
          });
          if (maxIndex > 0) {
            counts[section.id] = maxIndex + 1;
          }
        }
      });
      setRepeatCounts(counts);
    }
  }, [initialData, template.sections]);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (sectionId: string, fieldId: string, value: any, repeatIndex?: number) => {
    const key = repeatIndex !== undefined 
      ? `${sectionId}_${repeatIndex}_${fieldId}`
      : `${sectionId}_${fieldId}`;
    
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }));

    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (sectionId: string, fieldId: string, option: string, checked: boolean, repeatIndex?: number) => {
    const key = repeatIndex !== undefined 
      ? `${sectionId}_${repeatIndex}_${fieldId}`
      : `${sectionId}_${fieldId}`;
    
    const currentValues = formData[key] || [];
    const newValues = checked
      ? [...currentValues, option]
      : currentValues.filter((v: string) => v !== option);
    
    handleFieldChange(sectionId, fieldId, newValues, repeatIndex);
  };

  const addRepeatSection = (sectionId: string, maxRepeat?: number) => {
    const currentCount = repeatCounts[sectionId] || 1;
    if (!maxRepeat || currentCount < maxRepeat) {
      setRepeatCounts((prev) => ({
        ...prev,
        [sectionId]: currentCount + 1
      }));
    }
  };

  const removeRepeatSection = (sectionId: string, index: number) => {
    // Remove data for this repeat instance
    const newFormData = { ...formData };
    Object.keys(newFormData).forEach((key) => {
      if (key.startsWith(`${sectionId}_${index}_`)) {
        delete newFormData[key];
      }
    });
    setFormData(newFormData);

    setRepeatCounts((prev) => ({
      ...prev,
      [sectionId]: Math.max(1, (prev[sectionId] || 1) - 1)
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    template.sections.forEach((section) => {
      const repeatCount = section.isRepeatable ? (repeatCounts[section.id] || 1) : 1;

      for (let i = 0; i < repeatCount; i++) {
        section.fields.forEach((field) => {
          if (field.isRequired) {
            const key = section.isRepeatable 
              ? `${section.id}_${i}_${field.id}`
              : `${section.id}_${field.id}`;
            
            const value = formData[key];
            
            if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
              newErrors[key] = `${field.label} is required`;
            }
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (status === 'submitted' && !validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData, status);
    } catch (error) {
      alert('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (section: FormSection, field: FormField, repeatIndex?: number) => {
    const key = repeatIndex !== undefined 
      ? `${section.id}_${repeatIndex}_${field.id}`
      : `${section.id}_${field.id}`;
    
    const value = formData[key] || field.defaultValue || '';
    const error = errors[key];

    const fieldClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-500' : 'border-gray-300'
    }`;

    switch (field.fieldType) {
      case 'text':
        // Only use speech-to-text for longer descriptive fields
        // Check if field label/placeholder suggests it's for notes, descriptions, observations, etc.
        const useSpeechForText = field.label && (
          field.label.toLowerCase().includes('note') ||
          field.label.toLowerCase().includes('description') ||
          field.label.toLowerCase().includes('observation') ||
          field.label.toLowerCase().includes('comment') ||
          field.label.toLowerCase().includes('detail') ||
          field.label.toLowerCase().includes('reason') ||
          field.label.toLowerCase().includes('explain')
        );

        if (useSpeechForText) {
          return (
            <SpeechToTextInput
              value={value}
              onChange={(val) => handleFieldChange(section.id, field.id, val, repeatIndex)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
          );
        }

        // Regular text input for names, IDs, short fields
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(section.id, field.id, e.target.value, repeatIndex)}
            placeholder={field.placeholder}
            className={fieldClasses}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(section.id, field.id, e.target.value, repeatIndex)}
            className={fieldClasses}
          />
        );

      case 'textarea':
        return (
          <SpeechToTextInput
            value={value}
            onChange={(val) => handleFieldChange(section.id, field.id, val, repeatIndex)}
            placeholder={field.placeholder}
            multiline
            rows={4}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'select':
        const options = field.options ? JSON.parse(field.options) : [];
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(section.id, field.id, e.target.value, repeatIndex)}
            className={fieldClasses}
          >
            <option value="">-- Select --</option>
            {options.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        const radioOptions = field.options ? JSON.parse(field.options) : [];
        return (
          <div className="space-y-2">
            {radioOptions.map((option: string) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={key}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(section.id, field.id, e.target.value, repeatIndex)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
      case 'multiselect':
        const checkOptions = field.options ? JSON.parse(field.options) : [];
        const selectedValues = value || [];
        return (
          <div className="space-y-2">
            {checkOptions.map((option: string) => (
              <label key={option} className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => handleCheckboxChange(section.id, field.id, option, e.target.checked, repeatIndex)}
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return <div>Unsupported field type: {field.fieldType}</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h1>
      {template.description && (
        <p className="text-gray-600 mb-6">{template.description}</p>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {template.sections.map((section) => {
          const repeatCount = section.isRepeatable ? (repeatCounts[section.id] || 1) : 1;

          return (
            <div key={section.id} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {section.title}
                {section.isRequired && <span className="text-red-500 ml-1">*</span>}
              </h2>
              {section.description && (
                <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              )}

              {Array.from({ length: repeatCount }).map((_, repeatIndex) => (
                <div key={repeatIndex} className="space-y-6 mb-6">
                  {section.isRepeatable && repeatCount > 1 && (
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                      <h3 className="text-lg font-medium text-gray-700">
                        {section.title} #{repeatIndex + 1}
                      </h3>
                      {repeatIndex > 0 && (
                        <button
                          type="button"
                          onClick={() => removeRepeatSection(section.id, repeatIndex)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}

                  {section.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderField(section, field, section.isRepeatable ? repeatIndex : undefined)}
                      {field.helpText && (
                        <p className="text-xs text-gray-500">{field.helpText}</p>
                      )}
                      {errors[section.isRepeatable ? `${section.id}_${repeatIndex}_${field.id}` : `${section.id}_${field.id}`] && (
                        <p className="text-xs text-red-500">
                          {errors[section.isRepeatable ? `${section.id}_${repeatIndex}_${field.id}` : `${section.id}_${field.id}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {section.isRepeatable && (!section.maxRepeat || repeatCount < section.maxRepeat) && (
                <button
                  type="button"
                  onClick={() => addRepeatSection(section.id, section.maxRepeat)}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <span className="text-xl mr-2">+</span>
                  Add Another {section.title}
                </button>
              )}
            </div>
          );
        })}

        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('submitted')}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Submitting...' : 'Submit for Approval'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
