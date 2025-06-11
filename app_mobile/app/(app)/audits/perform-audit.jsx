import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

// Reusable Components
const FormSectionHeader = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

// Text Input Field Component
const TextInputField = ({ label, value, onChangeText, multiline = false, placeholder = '', notes = '' }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    {notes ? <Text style={styles.inputNotes}>{notes}</Text> : null}
    <TextInput
      style={[
        styles.textInput, 
        multiline && styles.multilineInput
      ]}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      placeholder={placeholder}
      placeholderTextColor="#999999"
    />
  </View>
);

// Yes/No/NA Component
const ChoiceField = ({ label, value, onChange }) => {
  const options = ["Yes", "No", "N/A"];
  
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.choiceContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.choiceButton,
              value === option && styles.choiceButtonSelected
            ]}
            onPress={() => onChange(option)}
          >
            <Text 
              style={[
                styles.choiceButtonText,
                value === option && styles.choiceButtonTextSelected
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Media Upload Component
const MediaUploadField = ({ label, mediaType, onPress, items = [], onRemove }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    
    <View style={styles.mediaContainer}>
      {/* Display existing media items */}
      {items.map((item, index) => (
        <View key={index} style={styles.mediaItem}>
          {mediaType === 'photo' ? (
            <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
          ) : (
            <View style={styles.documentPreview}>
              <Ionicons name="document-text" size={24} color="#777777" />
              <Text style={styles.documentName} numberOfLines={1}>{item.name}</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => onRemove(index)}
          >
            <Ionicons name="close-circle" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      ))}
      
      {/* Upload button */}
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={onPress}
      >
        <Ionicons 
          name={mediaType === 'photo' ? "camera" : "document-attach"} 
          size={24} 
          color="#777777" 
        />
        <Text style={styles.uploadButtonText}>
          {mediaType === 'photo' ? "Upload Photo" : "Attach Document"}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Flag Issue Component
const FlagIssueField = ({ label, value, onChange }) => (
  <View style={styles.inputContainer}>
    <View style={styles.flagContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Switch
        trackColor={{ false: "#D1D5DB", true: `${PRIMARY_GREEN}50` }}
        thumbColor={value ? PRIMARY_GREEN : "#F9FAFB"}
        ios_backgroundColor="#D1D5DB"
        onValueChange={onChange}
        value={value}
      />
    </View>
    {value && (
      <View style={styles.flaggedIssueContainer}>
        <Ionicons name="alert-circle" size={20} color="#F44336" />
        <Text style={styles.flaggedIssueText}>This item has been flagged for attention</Text>
      </View>
    )}
  </View>
);

// Checklist Item Component that combines all field types
const ChecklistItem = ({ 
  item, 
  index,
  updateItem,
  mode
}) => {
  const isReadOnly = mode === 'view';
  
  // Handle updating any field in the item
  const handleUpdate = (field, value) => {
    const updatedItem = { ...item, [field]: value };
    updateItem(index, updatedItem);
  };
  
  // Handle removing a media item
  const handleRemoveMedia = (mediaType, mediaIndex) => {
    const updatedMedia = [...item[mediaType]];
    updatedMedia.splice(mediaIndex, 1);
    handleUpdate(mediaType, updatedMedia);
  };
  
  // Mock photo upload
  const handlePhotoUpload = () => {
    if (isReadOnly) return;
    
    // For demo, add a placeholder image
    const newPhoto = {
      uri: 'https://via.placeholder.com/100',
      name: `photo_${Date.now()}.jpg`
    };
    
    handleUpdate('photos', [...item.photos, newPhoto]);
  };
  
  // Mock document upload
  const handleDocumentUpload = () => {
    if (isReadOnly) return;
    
    // For demo, add a placeholder document
    Alert.alert(
      "File Picker would open",
      "Select a document to attach",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Add Demo File",
          onPress: () => {
            const newDoc = {
              uri: 'https://example.com/document',
              name: `Compliance_Doc_${Date.now()}.pdf`,
              type: 'application/pdf',
              size: '2.4 MB'
            };
            handleUpdate('documents', [...item.documents, newDoc]);
          }
        }
      ]
    );
  };
  
  return (
    <View style={styles.checklistItem}>
      <Text style={styles.checklistItemNumber}>{index + 1}</Text>
      
      <View style={styles.checklistItemContent}>
        <Text style={styles.checklistItemTitle}>{item.title}</Text>
        
        {/* Choose appropriate input type based on item.type */}
        {item.type === 'yesno' && (
          <ChoiceField
            label="Response"
            value={item.response}
            onChange={(value) => handleUpdate('response', value)}
          />
        )}
        
        {item.type === 'text' && (
          <TextInputField
            label="Response"
            value={item.response}
            onChangeText={(value) => handleUpdate('response', value)}
            multiline={item.multiline}
            placeholder="Enter your response..."
          />
        )}
        
        {/* Notes field (common for all types) */}
        <TextInputField
          label="Notes"
          value={item.notes}
          onChangeText={(value) => handleUpdate('notes', value)}
          multiline={true}
          placeholder="Add any additional notes here..."
        />
        
        {/* Photo upload section */}
        <MediaUploadField
          label="Photos"
          mediaType="photo"
          items={item.photos}
          onPress={handlePhotoUpload}
          onRemove={(index) => handleRemoveMedia('photos', index)}
        />
        
        {/* Document upload section */}
        <MediaUploadField
          label="Documents"
          mediaType="document"
          items={item.documents}
          onPress={handleDocumentUpload}
          onRemove={(index) => handleRemoveMedia('documents', index)}
        />
        
        {/* Flag issue toggle */}
        <FlagIssueField
          label="Flag this item for attention"
          value={item.flagged}
          onChange={(value) => handleUpdate('flagged', value)}
        />
        
        {/* For followup mode, show the original issue */}
        {mode === 'followup' && item.originalIssue && (
          <View style={styles.originalIssueContainer}>
            <Text style={styles.originalIssueTitle}>Original Issue:</Text>
            <Text style={styles.originalIssueText}>{item.originalIssue}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function PerformAuditScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  
  // Get form details from params
  const formName = params.formName || 'Compliance Form';
  const formId = params.formId || 'new';
  const mode = params.mode || 'new'; // 'new', 'edit', 'followup', 'view'
  
  // Set up header title based on mode
  useEffect(() => {
    let title;
    switch (mode) {
      case 'followup':
        title = 'Follow-Up Audit';
        break;
      case 'edit':
        title = 'Edit Draft';
        break;
      case 'view':
        title = 'View Submission';
        break;
      default:
        title = 'New Audit';
    }
    
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, mode]);
  
  // Mock checklist items
  const [checklistItems, setChecklistItems] = useState([
    {
      id: '1',
      title: 'Are all food preparation surfaces clean and sanitized?',
      type: 'yesno',
      response: 'Yes',
      notes: '',
      photos: [],
      documents: [],
      flagged: false,
      originalIssue: mode === 'followup' ? 'Food preparation area found with residue from previous shift.' : null
    },
    {
      id: '2',
      title: 'Are all staff wearing appropriate PPE?',
      type: 'yesno',
      response: '',
      notes: '',
      photos: [],
      documents: [],
      flagged: false,
      originalIssue: mode === 'followup' ? 'Two staff members were not wearing hair nets as required.' : null
    },
    {
      id: '3',
      title: 'Is the temperature log maintained and up to date?',
      type: 'yesno',
      response: '',
      notes: '',
      photos: [],
      documents: [],
      flagged: false
    },
    {
      id: '4',
      title: 'Describe any maintenance issues observed during inspection:',
      type: 'text',
      multiline: true,
      response: '',
      notes: '',
      photos: [],
      documents: [],
      flagged: false
    },
    {
      id: '5',
      title: 'Record the refrigerator temperature readings:',
      type: 'text',
      multiline: false,
      response: '',
      notes: 'Format: Main Kitchen: 00°F, Storage: 00°F',
      photos: [],
      documents: [],
      flagged: false
    }
  ]);
  
  // Update checklist item
  const updateChecklistItem = (index, updatedItem) => {
    const newItems = [...checklistItems];
    newItems[index] = updatedItem;
    setChecklistItems(newItems);
  };
  
  // Handle save draft
  const handleSaveDraft = () => {
    Alert.alert(
      "Save Draft",
      "Your audit has been saved as a draft.",
      [
        { text: "OK", onPress: () => router.back() }
      ]
    );
  };
  
  // Handle submit for review
  const handleSubmitForReview = () => {
    Alert.alert(
      "Submit for Review",
      "Are you sure you want to submit this audit for review? You will not be able to make further changes.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Submit",
          onPress: () => {
            Alert.alert(
              "Form Submitted for Review!",
              "Your audit has been successfully submitted for review.",
              [
                { text: "OK", onPress: () => router.push('/(app)/audits') }
              ]
            );
          }
        }
      ]
    );
  };
  
  // Handle view print preview
  const handlePrintPreview = () => {
    router.push({
      pathname: '/(app)/audits/print-preview',
      params: { 
        formName,
        formId
      }
    });
  };
  
  // Handle follow-up submission
  const handleSubmitFollowUp = () => {
    Alert.alert(
      "Submit Follow-Up",
      "Are you sure you want to submit this follow-up?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Submit",
          onPress: () => {
            Alert.alert(
              "Follow-Up Submitted!",
              "Your follow-up has been successfully submitted.",
              [
                { text: "OK", onPress: () => router.push('/(app)/audits') }
              ]
            );
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.scrollView}>
          {/* Form Header */}
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>{formName}</Text>
            <Text style={styles.formSubtitle}>
              {mode === 'followup' 
                ? 'Provide updates and corrective actions for flagged items.' 
                : 'Complete all applicable fields in this compliance form.'}
            </Text>
          </View>
          
          {/* Form Introduction */}
          <View style={styles.formIntro}>
            <Text style={styles.formIntroText}>
              {mode === 'followup' 
                ? 'This is a follow-up audit in response to issues identified in a previous submission. Please address all flagged items.'
                : 'Please respond to all questions and provide supporting evidence where required.'}
            </Text>
          </View>
          
          {/* Audit Information Section */}
          <View style={styles.formSection}>
            <FormSectionHeader title="Audit Information" />
            
            <TextInputField
              label="Outlet Name"
              value="Downtown Branch"
              onChangeText={() => {}}
              placeholder="Enter outlet name"
            />
            
            <TextInputField
              label="Audit Date"
              value={new Date().toLocaleDateString()}
              onChangeText={() => {}}
            />
            
            <TextInputField
              label="Conducted By"
              value="Sarah Johnson"
              onChangeText={() => {}}
            />
          </View>
          
          {/* Checklist Section */}
          <View style={styles.formSection}>
            <FormSectionHeader title="Compliance Checklist" />
            
            {checklistItems.map((item, index) => (
              <ChecklistItem
                key={item.id}
                item={item}
                index={index}
                updateItem={updateChecklistItem}
                mode={mode}
              />
            ))}
          </View>
          
          {/* General Notes Section */}
          <View style={styles.formSection}>
            <FormSectionHeader title="General Notes" />
            
            <TextInputField
              label="Additional Comments"
              value=""
              onChangeText={() => {}}
              multiline={true}
              placeholder="Enter any additional comments or observations..."
            />
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {mode === 'view' ? (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.printButton]}
                  onPress={handlePrintPreview}
                >
                  <Ionicons name="print-outline" size={20} color="#333333" />
                  <Text style={styles.printButtonText}>Print / Export PDF</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.closeButton]}
                  onPress={() => router.back()}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : mode === 'followup' ? (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.draftButton]}
                  onPress={handleSaveDraft}
                >
                  <Text style={styles.draftButtonText}>Save Draft</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.submitButton]}
                  onPress={handleSubmitFollowUp}
                >
                  <Text style={styles.submitButtonText}>Submit Follow-Up</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.draftButton]}
                  onPress={handleSaveDraft}
                >
                  <Text style={styles.draftButtonText}>Save Draft</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.printButton]}
                  onPress={handlePrintPreview}
                >
                  <Ionicons name="print-outline" size={20} color="#333333" />
                  <Text style={styles.printButtonText}>Print Preview</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.submitButton]}
                  onPress={handleSubmitForReview}
                >
                  <Text style={styles.submitButtonText}>Submit for Review</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  formHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  formIntro: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  formIntroText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  formSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  inputNotes: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  choiceContainer: {
    flexDirection: 'row',
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  choiceButtonSelected: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  choiceButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  choiceButtonTextSelected: {
    color: '#FFFFFF',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  mediaItem: {
    width: 100,
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  documentPreview: {
    width: 100,
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  documentName: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  flagContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flaggedIssueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  flaggedIssueText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    overflow: 'hidden',
  },
  checklistItemNumber: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 16,
  },
  checklistItemContent: {
    flex: 1,
    padding: 16,
  },
  checklistItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  originalIssueContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF4E5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  originalIssueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  originalIssueText: {
    fontSize: 14,
    color: '#666666',
  },
  actionButtonsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  draftButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  printButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  printButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: PRIMARY_GREEN,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
}); 