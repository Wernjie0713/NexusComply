import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  Alert,
  Image,
  Dimensions,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ApiClient from '../../../utils/apiClient';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const PRIMARY_GREEN = '#4CAF50';
const windowWidth = Dimensions.get('window').width;
const API_BASE_URL = 'http://192.168.131.143:8000'; // Replace with your actual API base URL

// Function to check if file is an image
const isImageFile = (fileName) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
  const extension = fileName.split('.').pop().toLowerCase();
  return imageExtensions.includes(extension);
};

// File Preview Component
const FilePreview = ({ filePath, fileName }) => {
  if (!filePath) return null;

  const isImage = isImageFile(fileName);
  const fileUrl = `${API_BASE_URL}/api/mobile/audits/files/${filePath.split('/').pop()}`;

  if (isImage) {
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ 
            uri: fileUrl,
            headers: {
              'Accept': '*/*'
            }
          }}
          style={styles.imagePreview}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.filePreviewContainer}
      onPress={() => Linking.openURL(fileUrl)}
    >
      <Ionicons name="document-outline" size={24} color={PRIMARY_GREEN} />
      <Text style={styles.fileNameText}>{fileName}</Text>
      <Text style={styles.openFileText}>Tap to open</Text>
    </TouchableOpacity>
  );
};

// Function to handle file upload
const uploadFile = async (fileUri, fileName, fieldId) => {
  try {
    console.log('Starting file upload. URI:', fileUri, 'Filename:', fileName, 'Field ID:', fieldId);
    
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log('File converted to base64');

    // Upload to Laravel endpoint - Fixed endpoint path
    const endpoint = '/api/mobile/audits/upload-file';
    console.log('Sending to API:', endpoint);
    const response = await ApiClient.post(endpoint, {
      file: base64,
      fileName: fileName,
      fieldId: fieldId
    });
    console.log('API Response:', response);

    if (response && response.path) {
      console.log('Upload successful, path:', response.path);
      return response.path;
    } else {
      console.log('Invalid response:', response);
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Form Field Component
const FormField = ({ field, value, onChange }) => {
  const [selectedFile, setSelectedFile] = useState(() => {
    // Initialize with existing file data if value exists and is a string
    if (value && typeof value === 'string') {
      return {
        name: value.split('/').pop(), // Get filename from path
        uri: value
      };
    }
    return null;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow any file type
        copyToCacheDirectory: true
      });
      console.log('Document picked:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);
        
        setUploading(true);
        try {
          // Generate a unique filename using field ID
          const fileExtension = file.name.split('.').pop();
          const newFileName = `${field.id}.${fileExtension}`;
          console.log('Generated filename:', newFileName);
          
          // Upload the file and get the path
          const filePath = await uploadFile(file.uri, newFileName, field.id);
          console.log('File uploaded, path received:', filePath);
          
          const newFile = {
            name: file.name,
            uri: filePath
          };
          setSelectedFile(newFile);
          // Store the file path in form values
          onChange(filePath);
        } catch (error) {
          console.error('Upload failed:', error);
          Alert.alert(
            'Upload Error',
            'Failed to upload file. Please try again.',
            [{ text: 'OK' }]
          );
        } finally {
          setUploading(false);
        }
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert(
        'Error',
        'Failed to pick document. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const downloadAndOpenFile = async (fileUri, fileName) => {
    try {
      setDownloading(true);
      console.log('Starting download process for:', fileName);
      console.log('File URI:', fileUri);

      const fileUrl = `${API_BASE_URL}/api/mobile/audits/files/${fileUri.split('/').pop()}`;

      if (isImageFile(fileName)) {
        // For images, open directly
        await Linking.openURL(fileUrl);
        Alert.alert(
          'Success',
          'File opened successfully',
          [{ text: 'OK' }]
        );
      } else {
        // For other files, download first
        const downloadResult = await FileSystem.downloadAsync(
          fileUrl,
          `${FileSystem.cacheDirectory}${fileName}`,
          {
            headers: {
              'Accept': '*/*'
            }
          }
        );

        if (downloadResult.status === 200) {
          await Linking.openURL(downloadResult.uri);
          Alert.alert(
            'Success',
            'File opened successfully',
            [{ text: 'OK' }]
          );
        } else {
          throw new Error(`Download failed with status ${downloadResult.status}`);
        }
      }
    } catch (error) {
      console.error('Error handling file:', error);
      Alert.alert(
        'Error',
        'Could not open the file. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloading(false);
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
          {selectedFile ? (
            <View style={styles.fileInfoContainer}>
              <View style={styles.fileNameContainer}>
                <Ionicons name="document" size={20} color={PRIMARY_GREEN} />
                <Text style={styles.fileName}>{selectedFile.name}</Text>
              </View>
              
              <FilePreview filePath={selectedFile.uri} fileName={selectedFile.name} />
              
              <View style={styles.fileActionsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.fileActionButton,
                    downloading && styles.fileActionButtonDisabled
                  ]}
                  onPress={() => downloadAndOpenFile(selectedFile.uri, selectedFile.name)}
                  disabled={downloading}
                >
                  <Ionicons 
                    name={downloading ? "cloud-download-outline" : "eye-outline"} 
                    size={20} 
                    color={downloading ? '#999' : PRIMARY_GREEN} 
                  />
                  <Text style={[
                    styles.fileActionText,
                    downloading && styles.fileActionTextDisabled
                  ]}>
                    {downloading ? 'Downloading...' : 'View'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.fileActionButton, styles.editButton]}
                  onPress={handleFilePick}
                  disabled={downloading}
                >
                  <Ionicons name="pencil-outline" size={20} color={PRIMARY_GREEN} />
                  <Text style={styles.fileActionText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={[
                styles.fileUploadButton,
                uploading && styles.fileUploadButtonDisabled
              ]}
              onPress={handleFilePick}
              disabled={uploading}
            >
              <Ionicons name="cloud-upload" size={24} color="#fff" />
              <Text style={styles.fileUploadButtonText}>
                {uploading ? 'Uploading...' : 'Choose File'}
              </Text>
            </TouchableOpacity>
          )}
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
  const [formValues, setFormValues] = useState(() => {
    // If the form is completed (is_created is true), try to parse and use the values from params
    if (params.isCreated === 'true' && params.value) {
      try {
        return JSON.parse(params.value);
      } catch (e) {
        console.error('Error parsing form values:', e);
        return {};
      }
    }
    return {};
  });

  const handleFieldChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    const missingRequiredFields = formFields
      .filter(field => field.required && !formValues[field.id])
      .map(field => field.label);

    if (missingRequiredFields.length > 0) {
      Alert.alert(
        'Required Fields Missing',
        `Please fill in the following required fields:\n${missingRequiredFields.join('\n')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Single confirmation
    Alert.alert(
      'Submit Form',
      'Are you sure you want to submit this form?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              await ApiClient.post('/api/mobile/audits/submit-form', {
                audit_id: params.auditId,
                form_id: params.formId,
                name: params.formName,
                value: formValues
              });

              // If we reach here, it means the API call was successful
              Alert.alert(
                'Success',
                'Form submitted successfully',
                [{ 
                  text: 'OK',
                  onPress: () => {
                    // Replace current route with audit-details to refresh the page with all necessary params
                    router.replace({
                      pathname: '/(app)/audits/audit-details',
                      params: {
                        formId: params.auditId,
                        outletId: params.outletId,
                        headerTitle: params.originalTitle, // Use the original audit title
                        dueDate: params.dueDate,
                        outletName: params.outletName
                      }
                    });
                  }
                }]
              );
            } catch (error) {
              console.error('Error submitting form:', error);
              Alert.alert(
                'Error',
                'Failed to submit form. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
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
  fileUploadButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  fileInfoContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  fileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  fileActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  fileActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  fileActionText: {
    marginLeft: 4,
    color: PRIMARY_GREEN,
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  previewContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  imagePreview: {
    width: windowWidth - 32, // Full width minus padding
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  filePreviewContainer: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  fileNameText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
  },
  openFileText: {
    fontSize: 12,
    color: PRIMARY_GREEN,
    marginLeft: 8,
  },
  fileActionButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  fileActionTextDisabled: {
    color: '#999',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666666',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF0000',
    padding: 20,
  },
}); 