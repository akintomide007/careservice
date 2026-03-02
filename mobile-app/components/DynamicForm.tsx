import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

interface FormField {
  id: string;
  label: string;
  fieldType: string;
  orderIndex: number;
  isRequired: boolean;
  options?: string;
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
  onCancel: () => void;
}

export default function DynamicForm({
  template,
  initialData,
  onSave,
  onCancel,
}: DynamicFormProps) {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [repeatCounts, setRepeatCounts] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (
    sectionId: string,
    fieldId: string,
    value: any,
    repeatIndex?: number
  ) => {
    const key =
      repeatIndex !== undefined
        ? `${sectionId}_${repeatIndex}_${fieldId}`
        : `${sectionId}_${fieldId}`;

    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const toggleCheckbox = (
    sectionId: string,
    fieldId: string,
    option: string,
    repeatIndex?: number
  ) => {
    const key =
      repeatIndex !== undefined
        ? `${sectionId}_${repeatIndex}_${fieldId}`
        : `${sectionId}_${fieldId}`;

    const currentValues = formData[key] || [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter((v: string) => v !== option)
      : [...currentValues, option];

    handleFieldChange(sectionId, fieldId, newValues, repeatIndex);
  };

  const addRepeatSection = (sectionId: string, maxRepeat?: number) => {
    const currentCount = repeatCounts[sectionId] || 1;
    if (!maxRepeat || currentCount < maxRepeat) {
      setRepeatCounts((prev) => ({
        ...prev,
        [sectionId]: currentCount + 1,
      }));
    }
  };

  const removeRepeatSection = (sectionId: string, index: number) => {
    const newFormData = { ...formData };
    Object.keys(newFormData).forEach((key) => {
      if (key.startsWith(`${sectionId}_${index}_`)) {
        delete newFormData[key];
      }
    });
    setFormData(newFormData);

    setRepeatCounts((prev) => ({
      ...prev,
      [sectionId]: Math.max(1, (prev[sectionId] || 1) - 1),
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    template.sections.forEach((section) => {
      const repeatCount = section.isRepeatable ? repeatCounts[section.id] || 1 : 1;

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
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData, status);
    } catch (error) {
      Alert.alert('Error', 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (
    section: FormSection,
    field: FormField,
    repeatIndex?: number
  ) => {
    const key =
      repeatIndex !== undefined
        ? `${section.id}_${repeatIndex}_${field.id}`
        : `${section.id}_${field.id}`;

    const value = formData[key] || field.defaultValue || '';
    const error = errors[key];

    switch (field.fieldType) {
      case 'text':
      case 'date':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value}
            onChangeText={(text) =>
              handleFieldChange(section.id, field.id, text, repeatIndex)
            }
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <TextInput
            style={[styles.input, styles.textArea, error && styles.inputError]}
            value={value}
            onChangeText={(text) =>
              handleFieldChange(section.id, field.id, text, repeatIndex)
            }
            placeholder={field.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        );

      case 'select':
        const options = field.options ? JSON.parse(field.options) : [];
        return (
          <View>
            <View style={[styles.selectContainer, error && styles.inputError]}>
              <Text style={value ? styles.selectText : styles.selectPlaceholder}>
                {value || '-- Select --'}
              </Text>
            </View>
            <View style={styles.optionsContainer}>
              {options.map((option: string) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    value === option && styles.optionButtonActive,
                  ]}
                  onPress={() =>
                    handleFieldChange(section.id, field.id, option, repeatIndex)
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === option && styles.optionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'radio':
        const radioOptions = field.options ? JSON.parse(field.options) : [];
        return (
          <View style={styles.radioContainer}>
            {radioOptions.map((option: string) => (
              <TouchableOpacity
                key={option}
                style={styles.radioItem}
                onPress={() =>
                  handleFieldChange(section.id, field.id, option, repeatIndex)
                }
              >
                <View style={styles.radioCircle}>
                  {value === option && <View style={styles.radioCircleInner} />}
                </View>
                <Text style={styles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'checkbox':
      case 'multiselect':
        const checkOptions = field.options ? JSON.parse(field.options) : [];
        const selectedValues = value || [];
        return (
          <View style={styles.checkboxContainer}>
            {checkOptions.map((option: string) => (
              <TouchableOpacity
                key={option}
                style={styles.checkboxItem}
                onPress={() => toggleCheckbox(section.id, field.id, option, repeatIndex)}
              >
                <View style={styles.checkbox}>
                  {selectedValues.includes(option) && (
                    <View style={styles.checkboxChecked} />
                  )}
                </View>
                <Text style={styles.checkboxText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return <Text>Unsupported field type: {field.fieldType}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Text style={styles.backText}> Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{template.name}</Text>
        {template.description && (
          <Text style={styles.headerSubtitle}>{template.description}</Text>
        )}
      </View>

      <ScrollView style={styles.content}>
        {template.sections.map((section) => {
          const repeatCount = section.isRepeatable ? repeatCounts[section.id] || 1 : 1;

          return (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {section.title}
                {section.isRequired && <Text style={styles.required}> *</Text>}
              </Text>
              {section.description && (
                <Text style={styles.sectionDescription}>{section.description}</Text>
              )}

              {Array.from({ length: repeatCount }).map((_, repeatIndex) => (
                <View key={repeatIndex} style={styles.repeatInstance}>
                  {section.isRepeatable && repeatCount > 1 && (
                    <View style={styles.repeatHeader}>
                      <Text style={styles.repeatTitle}>
                        {section.title} #{repeatIndex + 1}
                      </Text>
                      {repeatIndex > 0 && (
                        <TouchableOpacity
                          onPress={() => removeRepeatSection(section.id, repeatIndex)}
                        >
                          <Text style={styles.removeButton}>Remove</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {section.fields.map((field) => {
                    const fieldKey = section.isRepeatable
                      ? `${section.id}_${repeatIndex}_${field.id}`
                      : `${section.id}_${field.id}`;

                    return (
                      <View key={field.id} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                          {field.label}
                          {field.isRequired && <Text style={styles.required}> *</Text>}
                        </Text>
                        {renderField(section, field, section.isRepeatable ? repeatIndex : undefined)}
                        {field.helpText && (
                          <Text style={styles.helpText}>{field.helpText}</Text>
                        )}
                        {errors[fieldKey] && (
                          <Text style={styles.errorText}>{errors[fieldKey]}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}

              {section.isRepeatable && (!section.maxRepeat || repeatCount < section.maxRepeat) && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addRepeatSection(section.id, section.maxRepeat)}
                >
                  <Text style={styles.addButtonText}>+ Add Another {section.title}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.draftButton, saving && styles.disabledButton]}
            onPress={() => handleSubmit('draft')}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Saving...' : 'Save as Draft'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, saving && styles.disabledButton]}
            onPress={() => handleSubmit('submitted')}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Submitting...' : 'Submit for Approval'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  required: {
    color: '#dc2626',
  },
  repeatInstance: {
    marginBottom: 16,
  },
  repeatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  repeatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  removeButton: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  selectText: {
    fontSize: 16,
    color: '#111',
  },
  selectPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  radioContainer: {
    marginTop: 4,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563eb',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  radioText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  checkboxContainer: {
    marginTop: 4,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2563eb',
    marginRight: 10,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#2563eb',
  },
  checkboxText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  addButton: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  draftButton: {
    backgroundColor: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
