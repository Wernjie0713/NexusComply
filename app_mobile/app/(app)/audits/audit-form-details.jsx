import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIMARY_GREEN = '#4CAF50';

// Form Field Component
const FormField = ({ field, value, onChange }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (result.type === 'success') {
        setSelectedFile(result);
        onChange(result.name);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  switch (field.type) {
    case 'section':
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{field.label}</Text>
        </View>
      );
    
    case 'text-block':
      return (
        <View style={styles.textBlock}>
          <Text style={styles.textBlockText}>{field.label}</Text>
        </View>
      );
    
    case 'text':
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={onChange}
            placeholder={field.placeholder || ''}
          />
        </View>
      );
    
    case 'textarea':
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={value}
            onChangeText={onChange}
            placeholder={field.placeholder || ''}
            multiline
            numberOfLines={4}
          />
        </View>
      );
    
    case 'checkbox':
      return (
        <View style={styles.fieldContainer}>
          <View style={styles.checkboxContainer}>
            <Switch
              value={value || false}
              onValueChange={onChange}
              trackColor={{ false: '#767577', true: PRIMARY_GREEN }}
              thumbColor={value ? '#fff' : '#f4f3f4'}
            />
            <Text style={styles.checkboxLabel}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          </View>
        </View>
      );
    
    case 'checkbox-group':
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          {field.options.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.optionContainer}
              onPress={() => {
                const newValue = [...(value || [])];
                const optionIndex = newValue.indexOf(option);
                if (optionIndex > -1) {
                  newValue.splice(optionIndex, 1);
                } else {
                  newValue.push(option);
                }
                onChange(newValue);
              }}
            >
              <View style={styles.optionIcon}>
                <Ionicons 
                  name={(value || []).includes(option) ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={PRIMARY_GREEN}
                />
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    
    case 'radio':
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          {field.options.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.optionContainer}
              onPress={() => onChange(option)}
            >
              <View style={styles.optionIcon}>
                <Ionicons 
                  name={value === option ? "radio-button-on" : "radio-button-off"} 
                  size={24} 
                  color={PRIMARY_GREEN}
                />
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    
    case 'select':
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          {field.options.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.selectOption,
                value === option && styles.selectOptionSelected
              ]}
              onPress={() => onChange(option)}
            >
              <Text style={[
                styles.selectOptionText,
                value === option && styles.selectOptionTextSelected
              ]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    
    case 'date':
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              {value ? new Date(value).toLocaleDateString() : 'Select date'}
            </Text>
            <Ionicons name="calendar" size={24} color={PRIMARY_GREEN} />
          </TouchableOpacity>
          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  onChange(selectedDate.toISOString().split('T')[0]);
                }
              }}
            />
          )}
          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.iosDatePickerContainer}>
              <View style={styles.iosDatePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.iosDatePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setShowDatePicker(false);
                    if (value) {
                      onChange(new Date(value).toISOString().split('T')[0]);
                    }
                  }}
                >
                  <Text style={styles.iosDatePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    onChange(selectedDate.toISOString().split('T')[0]);
                  }
                }}
                style={styles.iosDatePicker}
              />
            </View>
          )}
        </View>
      );
    
    case 'file':
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          <TouchableOpacity 
            style={styles.fileUploadButton}
            onPress={handleFilePick}
          >
            <Ionicons name="cloud-upload" size={24} color="#fff" />
            <Text style={styles.fileUploadButtonText}>
              {selectedFile ? selectedFile.name : 'Choose File'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    
    default:
      return null;
  }
};

export default function AuditFormDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  console.log('Raw params:', params);
  console.log('Structure type:', typeof params.structure);
  console.log('Is array?', Array.isArray(params.structure));
  
  // Form fields from URL params - handle both string and direct object cases
  let formFields = [];
  if (params.structure) {
    if (Array.isArray(params.structure)) {
      formFields = params.structure;
    } else if (typeof params.structure === 'object') {
      // If it's an object but not an array, wrap it in an array
      formFields = [params.structure];
    } else if (typeof params.structure === 'string') {
      try {
        // Try to parse if it's a JSON string
        formFields = JSON.parse(params.structure);
      } catch (e) {
        console.error('Parse error:', e);
        // If it's a comma-separated string of objects, try to split and parse
        try {
          formFields = params.structure.split('],[').map(str => {
            // Clean up the string and try to evaluate it as an object
            const cleaned = str
              .replace(/^\[/, '')
              .replace(/\]$/, '')
              .replace(/\[object Object\]/g, '{}');
            return cleaned ? JSON.parse(cleaned) : {};
          });
        } catch (e2) {
          console.error('Secondary parse error:', e2);
          formFields = [];
        }
      }
    }
  }

  console.log('Processed formFields:', formFields);

  // Sort fields by order
  const sortedFields = [...formFields].sort((a, b) => a.order - b.order);
  
  // State for form values
  const [formValues, setFormValues] = useState({});

  const handleFieldChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSave = () => {
    // Validate required fields
    const missingRequiredFields = formFields
      .filter(field => field.required && !formValues[field.id])
      .map(field => field.label);

    if (missingRequiredFields.length > 0) {
      console.log('Missing required fields:', missingRequiredFields);
      return;
    }

    console.log('Form Values:', formValues);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.formName}>{params.formName || 'Audit Form'}</Text>
        </View>

        <View style={styles.formContainer}>
          {sortedFields.map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={formValues[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Submit Form</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  formName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  formContainer: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_GREEN,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  textBlock: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  textBlockText: {
    fontSize: 16,
    color: '#666666',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#FF0000',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  optionIcon: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
  },
  selectOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginVertical: 4,
  },
  selectOptionSelected: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  selectOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  selectOptionTextSelected: {
    color: '#FFFFFF',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 8,
    padding: 12,
  },
  fileUploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  saveButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iosDatePickerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  iosDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iosDatePickerCancel: {
    fontSize: 16,
    color: '#333333',
  },
  iosDatePickerDone: {
    fontSize: 16,
    color: PRIMARY_GREEN,
  },
  iosDatePicker: {
    width: '100%',
    height: 200,
  },
}); 