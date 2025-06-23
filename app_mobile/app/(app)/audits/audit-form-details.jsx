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
  Linking,
  Share
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import ApiClient from '../../../utils/apiClient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as IntentLauncher from 'expo-intent-launcher';

const PRIMARY_GREEN = '#4CAF50';
const windowWidth = Dimensions.get('window').width;
const API_BASE_URL = 'http://192.168.31.41:8080'; // Replace with your actual API base URL

// Function to check if file is an image
const isImageFile = (fileName) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
  const extension = fileName.split('.').pop().toLowerCase();
  return imageExtensions.includes(extension);
};

// Function to get MIME type based on file extension
const getMimeType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    color: '#333333',
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: '#FFFFFF',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    color: '#333333',
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    top: Platform.OS === 'ios' ? 12 : 15,
    right: 12,
  },
  placeholder: {
    color: '#9EA0A4',
  },
});

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

    if (response && (response.url || response.path)) {
      console.log('Upload successful:', response);
      return response;
    } else {
      console.log('Invalid response:', response);
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Function to handle file download and opening
const downloadAndOpenFile = async (fileUri, fileName) => {
  try {
    console.log('Starting download process for:', fileName);
    console.log('File URI:', fileUri);

    if (!fileUri) {
      throw new Error('File URI is missing');
    }

    // For images, we can still open directly since they're loaded with headers
    if (isImageFile(fileName)) {
      await Linking.openURL(fileUri);
      return;
    }

    // Create a unique local file path in the documents directory
    const localFilePath = `${FileSystem.documentDirectory}${Date.now()}-${fileName}`;
    console.log('Downloading to:', localFilePath);
    
    // Download the file
    const downloadResult = await FileSystem.downloadAsync(
      fileUri,
      localFilePath,
      {
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'no-cache'
        },
        cache: false
      }
    );

    console.log('Download result:', downloadResult);

    if (downloadResult.status === 200) {
      if (Platform.OS === 'android') {
        try {
          // Get proper MIME type
          const mimeType = getMimeType(fileName);
          console.log('MIME type:', mimeType);

          // Ensure the file exists and is readable
          const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
          console.log('File info:', fileInfo);

          if (!fileInfo.exists) {
            throw new Error('Downloaded file not found');
          }

          // Get content URI for the file
          const contentUri = await FileSystem.getContentUriAsync(downloadResult.uri);
          console.log('Content URI:', contentUri);

          // Launch the file with Intent
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: mimeType
          });
        } catch (error) {
          console.error('Error in file handling:', error);
          throw error;
        }
      } else {
        // iOS handling
        await Linking.openURL(downloadResult.uri);
      }
    } else {
      throw new Error(`Download failed with status ${downloadResult.status}`);
    }

    // Clean up the temporary file after a delay
    setTimeout(async () => {
      try {
        await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });
        console.log('Temporary file cleaned up');
      } catch (error) {
        console.error('Error cleaning up file:', error);
      }
    }, 5000); // 5 second delay to ensure file is opened before cleanup
  } catch (error) {
    console.error('Error handling file:', error);
    Alert.alert(
      'Error',
      `Could not open the file. Error: ${error.message}`,
      [{ text: 'OK' }]
    );
  }
};

// Consolidated function for opening files
const openFile = async (fileUri, fileName, isExisting) => {
  try {
    console.log('Opening file:', { fileUri, fileName, isExisting });
    
    if (isExisting) {
      // For existing files from backend, use the download function
      await downloadAndOpenFile(fileUri, fileName);
    } else {
      // For local files, use content URI
      const contentUri = await FileSystem.getContentUriAsync(fileUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: getMimeType(fileName)
      });
    }
  } catch (error) {
    console.error('Error opening file:', error);
    Alert.alert(
      'Error',
      'Could not open the file. Please make sure you have an app installed that can open this type of file.',
      [{ text: 'OK' }]
    );
  }
};

// File Preview Component
const FilePreview = ({ filePath, fileName, isExisting }) => {
  if (!filePath) return null;

  const isImage = isImageFile(fileName);
  console.log('File URL in preview:', filePath, 'isExisting:', isExisting);

  if (isImage) {
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ 
            uri: filePath,
            headers: isExisting ? {
              'Accept': '*/*',
              'Cache-Control': 'no-cache'
            } : undefined
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
      onPress={() => openFile(filePath, fileName, isExisting)}
    >
      <Ionicons name="document-outline" size={24} color={PRIMARY_GREEN} />
      <Text style={styles.fileNameText}>{fileName}</Text>
      <Text style={styles.openFileText}>Tap to open</Text>
    </TouchableOpacity>
  );
};

// Form Field Component
const FormField = ({ field, value, onChange, isReadOnly }) => {
  const [selectedFile, setSelectedFile] = useState(() => {
    // Initialize with existing file data if value exists and is a string
    if (value && typeof value === 'string') {
      return {
        name: value.split('/').pop(), // Get filename from path
        uri: value,
        isExisting: true // Flag to indicate this is an existing file from backend
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
        
        // Ensure the file is copied to app's cache directory for reliable access
        const fileUri = file.uri;
        const fileName = file.name;
        
        // For Android, we need to copy the file to our app's cache directory
        // to ensure we can access it later
        let finalUri = fileUri;
        if (Platform.OS === 'android') {
          const cacheFilePath = `${FileSystem.cacheDirectory}${Date.now()}-${fileName}`;
          await FileSystem.copyAsync({
            from: fileUri,
            to: cacheFilePath
          });
          finalUri = cacheFilePath;
        }
        
        // Store the file locally without uploading
        const newFile = {
          name: fileName,
          uri: finalUri,
          isExisting: false, // Flag to indicate this is a new local file
          fieldId: field.id
        };
        setSelectedFile(newFile);
        // Store the local file info in form values
        onChange({
          localUri: finalUri,
          fileName: fileName,
          fieldId: field.id
        });
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

  const handleFilePreview = async (fileUri, fileName, isExisting) => {
    await openFile(fileUri, fileName, isExisting);
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
            style={[styles.textInput, isReadOnly && styles.readOnlyInput]}
            value={value}
            onChangeText={onChange}
            placeholder={field.placeholder || ''}
            editable={!isReadOnly}
          />
        </View>
      );
    
    case 'textarea':
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          <TextInput
            style={[styles.textInput, styles.textArea, isReadOnly && styles.readOnlyInput]}
            value={value}
            onChangeText={onChange}
            placeholder={field.placeholder || ''}
            multiline
            numberOfLines={4}
            editable={!isReadOnly}
          />
        </View>
      );
    
    case 'checkbox':
      return (
        <View style={styles.fieldContainer}>
          <View style={styles.checkboxContainer}>
            <Switch
              value={value || false}
              onValueChange={isReadOnly ? null : onChange}
              trackColor={{ false: '#767577', true: PRIMARY_GREEN }}
              thumbColor={value ? '#fff' : '#f4f3f4'}
              disabled={isReadOnly}
            />
            <Text style={[styles.checkboxLabel, isReadOnly && styles.readOnlyText]}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          </View>
        </View>
      );
    
    case 'checkbox-group':
      return (
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, isReadOnly && styles.readOnlyText]}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          {field.options.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.optionContainer, isReadOnly && styles.readOnlyOption]}
              onPress={isReadOnly ? null : () => {
                const newValue = [...(value || [])];
                const optionIndex = newValue.indexOf(option);
                if (optionIndex > -1) {
                  newValue.splice(optionIndex, 1);
                } else {
                  newValue.push(option);
                }
                onChange(newValue);
              }}
              disabled={isReadOnly}
            >
              <View style={styles.optionIcon}>
                <Ionicons 
                  name={(value || []).includes(option) ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={isReadOnly ? '#999' : PRIMARY_GREEN}
                />
              </View>
              <Text style={[styles.optionText, isReadOnly && styles.readOnlyText]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    
    case 'radio':
      return (
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, isReadOnly && styles.readOnlyText]}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          {field.options.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.selectOption,
                value === option && styles.selectOptionSelected,
                isReadOnly && styles.readOnlyOption,
                isReadOnly && value === option && styles.readOnlySelectedOption
              ]}
              onPress={isReadOnly ? null : () => onChange(option)}
              disabled={isReadOnly}
            >
              <Text style={[
                styles.selectOptionText,
                value === option && styles.selectOptionTextSelected,
                isReadOnly && styles.readOnlyText,
                isReadOnly && value === option && styles.readOnlySelectedText
              ]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    
    case 'select':
      return (
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, isReadOnly && styles.readOnlyText]}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          <RNPickerSelect
              onValueChange={(itemValue) => onChange(itemValue)}
              items={field.options.map(option => ({ label: option, value: option }))}
              value={value}
              style={{
                  ...pickerSelectStyles,
                  inputIOS: [
                      pickerSelectStyles.inputIOS,
                      isReadOnly && styles.readOnlyInput,
                  ],
                  inputAndroid: [
                      pickerSelectStyles.inputAndroid,
                      isReadOnly && styles.readOnlyInput,
                  ],
                  iconContainer: {
                      ...pickerSelectStyles.iconContainer,
                      display: isReadOnly ? 'none' : 'flex',
                  },
              }}
              disabled={isReadOnly}
              useNativeAndroidPickerStyle={false}
              placeholder={{ label: field.placeholder || 'Select an option...', value: null }}
              Icon={() => {
                  return <Ionicons name="chevron-down" size={24} color="#999" />;
              }}
          />
        </View>
      );
    
    case 'date':
      return (
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, isReadOnly && styles.readOnlyText]}>{field.label}{field.required && <Text style={styles.required}> *</Text>}</Text>
          <TouchableOpacity 
            style={[styles.datePickerButton, isReadOnly && styles.readOnlyOption]}
            onPress={isReadOnly ? null : () => setShowDatePicker(true)}
            disabled={isReadOnly}
          >
            <Text style={[styles.datePickerButtonText, isReadOnly && styles.readOnlyText]}>
              {value ? new Date(value).toLocaleDateString() : 'Select date'}
            </Text>
            <Ionicons name="calendar" size={24} color={isReadOnly ? '#999' : PRIMARY_GREEN} />
          </TouchableOpacity>
          {showDatePicker && Platform.OS === 'android' && !isReadOnly && (
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
          {showDatePicker && Platform.OS === 'ios' && !isReadOnly && (
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
              
              <FilePreview 
                filePath={selectedFile.uri} 
                fileName={selectedFile.name} 
                isExisting={selectedFile.isExisting}
              />
              
              <View style={styles.fileActionsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.fileActionButton,
                    downloading && styles.fileActionButtonDisabled
                  ]}
                  onPress={() => handleFilePreview(selectedFile.uri, selectedFile.name, selectedFile.isExisting)}
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
                    {downloading ? 'Opening...' : 'View'}
                  </Text>
                </TouchableOpacity>
                {!isReadOnly && (
                  <>
                    <TouchableOpacity 
                      style={[styles.fileActionButton, styles.editButton]}
                      onPress={handleFilePick}
                      disabled={downloading}
                    >
                      <Ionicons name="pencil-outline" size={20} color={PRIMARY_GREEN} />
                      <Text style={styles.fileActionText}>Change</Text>
                    </TouchableOpacity>
                        <TouchableOpacity 
        style={[styles.fileActionButton, styles.deleteButton]}
        onPress={() => {
          setSelectedFile(null);
          onChange(null);
        }}
        disabled={downloading}
      >
        <Ionicons name="trash-outline" size={20} color="#FF4444" />
        <Text style={[styles.fileActionText, styles.deleteButtonText]}>Delete</Text>
      </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ) : (
            !isReadOnly && (
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
            )
          )}
        </View>
      );
    
    default:
      return null;
  }
};

// Issue Alert Component
const IssueAlert = ({ issue, correctiveAction, onCorrectiveActionChange, isReadOnly }) => {
  if (!issue) return null;

  // Updated severity colors
  const severityColors = {
    'Critical': '#E53935', // Softer red
    'High': '#FB8C00',     // Orange
    'Medium': '#FDD835',   // Yellow
    'Low': '#43A047',      // Green (not used but for future)
  };

  // Icon colors for contrast
  const iconColors = {
    'Critical': '#E53935',
    'High': '#FB8C00',
    'Medium': '#FDD835',
    'Low': '#43A047',
  };

  // Backgrounds are now lighter for less harshness
  const backgroundColor = `${severityColors[issue.severity] || '#E0E0E0'}20`;
  const borderColor = severityColors[issue.severity] || '#BDBDBD';
  const iconColor = iconColors[issue.severity] || '#757575';

  return (
    <View style={[styles.issueContainer, { backgroundColor, borderColor }]}> 
      <View style={styles.issueHeaderRow}>
        <Ionicons name="alert-circle" size={20} color={iconColor} style={{ marginRight: 8 }} />
        <Text style={[styles.issueSeverity, { color: iconColor }]}>{issue.severity}</Text>
        <Text style={styles.issueDescription} numberOfLines={2} ellipsizeMode="tail">{issue.description}</Text>
        {issue.due_date && (
          <Text style={styles.issueDueDate}>Due: {new Date(issue.due_date).toLocaleDateString()}</Text>
        )}
      </View>
      {!isReadOnly && (
        <View style={styles.correctiveActionContainerCompact}>
          <TextInput
            style={styles.correctiveActionInputLarge}
            placeholder="Corrective Action..."
            value={correctiveAction}
            onChangeText={onCorrectiveActionChange}
            multiline
            numberOfLines={4}
            maxLength={400}
          />
        </View>
      )}
    </View>
  );
};

export default function AuditFormDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [issues, setIssues] = useState([]);
  const [correctiveActions, setCorrectiveActions] = useState({});
  
  console.log('Raw params:', params);
  console.log('Structure type:', typeof params.structure);
  console.log('Is array?', Array.isArray(params.structure));
  
  // Check if form should be read-only based on status - moved after getting params
  const isReadOnly = params.status && !['draft', 'rejected', 'revising'].includes(params.status.toLowerCase());
  
  // Fetch issue data if status is revising
  useEffect(() => {
    const fetchIssues = async () => {
      if (params.status?.toLowerCase() === 'revising' && params.auditFormId) {
        try {
          const response = await ApiClient.get(`/api/mobile/audit-forms/${params.auditFormId}/issue`);
          if (response.issues) {
            setIssues(response.issues);
            const initialActions = {};
            response.issues.forEach(issue => {
              if (issue.corrective_action) {
                initialActions[issue.id] = issue.corrective_action;
              }
            });
            setCorrectiveActions(initialActions);
          }
        } catch (error) {
          console.error('Error fetching issue:', error);
          Alert.alert(
            'Error',
            'Failed to fetch issue details. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    fetchIssues();
  }, [params.status, params.auditFormId]);

  // Set dynamic header title to the form name
  useEffect(() => {
    if (params.formName) {
      navigation.setOptions({
        headerTitle: params.formName,
      });
    }
  }, [navigation, params.formName]);

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

  const handleCorrectiveActionChange = (issueId, value) => {
    setCorrectiveActions(prev => ({
      ...prev,
      [issueId]: value
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

    if (issues.length > 0) {
      const issuesWithoutAction = issues.filter(issue => !correctiveActions[issue.id]);
      if (issuesWithoutAction.length > 0) {
        Alert.alert(
          'Corrective Action Required',
          'Please describe the corrective action taken for all issues.',
          [{ text: 'OK' }]
        );
        return;
      }
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
              // Process form values and upload files
              const processedFormValues = { ...formValues };
              
              // Find all file fields that need to be uploaded
              const fileUploads = Object.entries(formValues).filter(([_, value]) => 
                value && typeof value === 'object' && value.localUri
              );

              if (fileUploads.length > 0) {
                // Show upload progress
                Alert.alert(
                  'Uploading Files',
                  'Please wait while we upload your files...',
                  [{ text: 'OK' }]
                );

                // Upload each file
                for (const [fieldId, fileInfo] of fileUploads) {
                  try {
                    const fileExtension = fileInfo.fileName.split('.').pop();
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const newFileName = `${fileInfo.fieldId}_${timestamp}.${fileExtension}`;
                    
                    // Upload the file
                    const response = await uploadFile(fileInfo.localUri, newFileName, fileInfo.fieldId);
                    
                    // Replace the local file info with the uploaded file URL
                    const fileUrl = response.downloadUrl || response.url || response.path;
                    if (!fileUrl) {
                      throw new Error('No file URL in response');
                    }
                    processedFormValues[fieldId] = fileUrl;
                  } catch (error) {
                    console.error('Error uploading file:', error);
                    throw new Error(`Failed to upload file: ${fileInfo.fileName}`);
                  }
                }
              }

              const corrective_actions = issues.map(issue => ({
                issue_id: issue.id,
                action: correctiveActions[issue.id]
              }));

              // Add debug logging
              console.log('Submitting form with processed data:', {
                audit_id: params.auditId,
                form_id: params.formId,
                name: params.formName,
                processedFormValues,
                corrective_actions,
              });

              // Submit the form with processed values
              await ApiClient.post('/api/mobile/audits/submit-form', {
                audit_id: params.auditId,
                form_id: params.formId,
                name: params.formName,
                value: processedFormValues,
                corrective_actions: corrective_actions
              });

              // If we reach here, it means the API call was successful
              Alert.alert(
                'Success',
                'Form submitted successfully',
                [{ 
                  text: 'OK',
                  onPress: () => {
                    // Replace current route with audit-details to refresh the page
                    router.back();
                  }
                }]
              );
            } catch (error) {
              console.error('Error submitting form:', error);
              Alert.alert(
                'Error',
                error.message || 'Failed to submit form. Please try again.',
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
      <StatusBar style="auto" />
      
      <ScrollView style={styles.scrollView}>
        {/* Display issue alert if status is revising */}
        {params.status?.toLowerCase() === 'revising' && issues.length > 0 && (
          issues.map(issue => (
            <IssueAlert
              key={issue.id}
              issue={issue}
              correctiveAction={correctiveActions[issue.id] || ''}
              onCorrectiveActionChange={(text) => handleCorrectiveActionChange(issue.id, text)}
              isReadOnly={isReadOnly}
            />
          ))
        )}
        
        <View style={styles.formContainer}>
          {sortedFields.map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={formValues[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              isReadOnly={isReadOnly}
            />
          ))}

          {/* Save button */}
          {!isReadOnly && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Submit Form</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  issueContainer: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 0,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'column',
    minHeight: 0,
  },
  issueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  issueSeverity: {
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
  },
  issueDescription: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    marginRight: 8,
  },
  issueDueDate: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  correctiveActionContainerCompact: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 6,
  },
  correctiveActionInputLarge: {
    backgroundColor: '#FAFAFA',
    borderRadius: 4,
    padding: 12,
    color: '#333',
    fontSize: 15,
    minHeight: 80,
    maxHeight: 140,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 2,
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
    marginTop: 24,
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
  readOnlyInput: {
    backgroundColor: '#F5F5F5',
    color: '#666666',
  },
  readOnlyText: {
    color: '#999999',
  },
  readOnlyOption: {
    backgroundColor: '#F5F5F5',
    borderColor: '#DDDDDD',
    opacity: 0.8,
  },
  readOnlySelectedOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#DDDDDD',
    opacity: 0.8,
  },
  readOnlySelectedText: {
    color: '#666666',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#FF4444',
  },
}); 