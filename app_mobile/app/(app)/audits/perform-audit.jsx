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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiClient from '../../../utils/apiClient';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

// Reusable Components
const FormSectionHeader = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

// Text Display Component
const TextDisplay = ({ label, value }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.textDisplayContainer}>
      <Text style={styles.textDisplayValue}>{value}</Text>
    </View>
  </View>
);

// Compliance Form Item Component
const ComplianceFormItem = ({ item }) => (
  <View style={styles.formItem}>
    <Text style={styles.formItemTitle}>{item.name}</Text>
    <Text style={styles.formItemDescription}>{item.description}</Text>
  </View>
);

export default function PerformAuditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  
  // Get data from params
  const complianceId = params.complianceId;
  const auditTitle = params.auditTitle;
  const auditDescription = params.auditDescription;
  
  // State for form templates
  const [loading, setLoading] = useState(true);
  const [formTemplates, setFormTemplates] = useState([]);
  const [error, setError] = useState(null);

  // Function to fetch form templates
  const fetchFormTemplates = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get(`/api/mobile/compliance-requirements/${complianceId}/form-templates`);
      setFormTemplates(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching form templates:', err);
      setError('Failed to load form templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch form templates when component mounts
  useEffect(() => {
    if (complianceId) {
      fetchFormTemplates();
    }
  }, [complianceId]);

  // Handle adding audit
  const handleAddAudit = async () => {
    Alert.alert(
      "Add Audit",
      "Are you sure you want to add this audit to your list?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Add",
          onPress: async () => {
            try {
              const response = await ApiClient.post('/api/mobile/audits', {
                compliance_id: complianceId,
                outlet_id: 1, // TODO: Get this from user's context or selection
              });

              Alert.alert(
                "Success!",
                "Audit has been added to your list.",
                [
                  { text: "OK", onPress: () => router.push('/(app)/audits') }
                ]
              );
            } catch (error) {
              console.error('Error creating audit:', error);
              Alert.alert(
                "Error",
                "Failed to create audit. Please try again.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Audit Preview",
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.scrollView}>
          {/* Audit Details Section */}
          <View style={styles.section}>
            <FormSectionHeader title="Audit Details" />
            
            <TextDisplay
              label="Title"
              value={auditTitle}
            />
            
            <TextDisplay
              label="Description"
              value={auditDescription}
            />
          </View>
          
          {/* Compliance Forms Section */}
          <View style={styles.section}>
            <FormSectionHeader title="Compliance Checklist" />
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRIMARY_GREEN} />
                <Text style={styles.loadingText}>Loading form templates...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => {
                    setError(null);
                    fetchFormTemplates();
                  }}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : formTemplates.length === 0 ? (
              <Text style={styles.noFormsText}>No form templates available for this compliance requirement.</Text>
            ) : (
              formTemplates.map((form) => (
                <ComplianceFormItem key={form.id} item={form} />
              ))
            )}
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.addButton]}
              onPress={handleAddAudit}
            >
              <Text style={styles.addButtonText}>Add Audit</Text>
            </TouchableOpacity>
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
  section: {
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
  textDisplayContainer: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    padding: 12,
  },
  textDisplayValue: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  formItem: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  formItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  formItemDescription: {
    fontSize: 14,
    color: '#666666',
  },
  actionButtonsContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  addButton: {
    backgroundColor: PRIMARY_GREEN,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  noFormsText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
    padding: 20,
  },
}); 