import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiClient from '../../../utils/apiClient';
import { useFocusEffect } from '@react-navigation/native';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

// Status Badge Component
const StatusBadge = ({ status }) => {
  // Define status configurations
  const statusConfig = {
    submitted: { 
      color: PRIMARY_GREEN, 
      text: 'Submitted',
      icon: 'checkmark-circle' 
    },
    draft: { 
      color: '#6B7280', 
      text: 'Draft',
      icon: 'document' 
    },
    rejected: { 
      color: '#F44336', 
      text: 'Rejected',
      icon: 'alert-circle' 
    }
  };

  const config = statusConfig[status.name] || statusConfig['draft'];

  return (
    <View style={[styles.badgeContainer, { backgroundColor: `${config.color}20` }]}>
      <Ionicons name={config.icon} size={16} color={config.color} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

// Form Item Component
const FormItem = ({ item, auditId, outletId, dueDate, outletName, headerTitle, auditStatus }) => {
  const router = useRouter();

  const handleFormPress = () => {
    router.push({
      pathname: '/(app)/audits/audit-form-details',
      params: { 
        formId: item.id, 
        formName: item.name,
        auditId: auditId,
        auditFormId: item.audit_form_id,
        structure: JSON.stringify(item.structure), 
        isCreated: item.audit_form_id ? true : false,
        value: item.value ? JSON.stringify(item.value) : null,
        outletId: outletId,
        dueDate: dueDate,
        outletName: outletName,
        originalTitle: headerTitle,
        status: auditStatus || 'draft'
      }
    });
  };

  return (
    <TouchableOpacity style={styles.formItem} onPress={handleFormPress}>
      <View style={styles.formItemContent}>
        <Text style={styles.formName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.formDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <StatusBadge status={item.status} />
    </TouchableOpacity>
  );
};

// Version History Item Component
const VersionHistoryItem = ({ version, currentAuditId, outletName }) => {
  const router = useRouter();

  if (version.audit_id === currentAuditId) {
    return null; // Don't show the current version in the history list
  }
  
  const handlePress = () => {
    router.push({
      pathname: '/(app)/audits/audit-details',
      params: { 
        formId: version.audit_id,
        headerTitle: version.title,
        outletId: version.outlet_id,
        dueDate: version.dueDate,
        outletName: outletName,
      }
    });
  };

  return (
    <TouchableOpacity style={styles.versionItem} onPress={handlePress}>
      <View>
        <Text style={styles.versionTitle}>{`Version ${version.version}`}</Text>
        <Text style={styles.versionDate}>{`Status: ${version.status}`}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999999" />
    </TouchableOpacity>
  );
};

export default function ViewSubmissionScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const [outletName, setOutletName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  
  // Determine if the current audit is the latest version
  const isLatestVersion = !versionHistory.length || (versionHistory.length > 0 && parseInt(params.formId, 10) === versionHistory[0].audit_id);

  // Set dynamic header title from params
  useEffect(() => {
    navigation.setOptions({
      headerTitle: params.headerTitle || 'Audit Details',
    });
  }, [navigation, params.headerTitle]);

  // Fetch outlet name and audit forms when component mounts
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch outlet data
      if (params.outletId) {
        const outletResponse = await ApiClient.get(`/api/mobile/outlets/${params.outletId}`);
        setOutletName(outletResponse.name);
      } else {
        setOutletName('Unknown Outlet');
      }

      // Fetch audit forms
      if (params.formId) {
        const formsResponse = await ApiClient.get(`/api/mobile/audits/${params.formId}/forms`);
        setAuditData({
          status: formsResponse.audit.status,
          forms: formsResponse.forms
        });
        if (formsResponse.version_history) {
          setVersionHistory(formsResponse.version_history);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load audit information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [params.outletId, params.formId])
  );

  const handleSubmit = async () => {
    // Check if all forms are completed
    const allFormsCompleted = auditData?.forms?.every(form => form.is_created) ?? false;
    
    if (!allFormsCompleted) {
      Alert.alert(
        "Incomplete Audit",
        "Please complete all forms before submitting the audit.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      // Submit the audit
      const response = await ApiClient.put(`/api/mobile/audits/${params.formId}/submit`);
      
      if (response.success) {
        Alert.alert(
          "Success",
          "Audit submitted successfully",
          [
            {
              text: "OK",
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (err) {
      console.error('Error submitting audit:', err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to submit audit. Please try again."
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Audit",
      "Are you sure you want to delete this audit?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await ApiClient.delete(`/api/mobile/audits/${params.formId}`);
              Alert.alert('Success', 'Audit deleted successfully', [
                { 
                  text: 'OK',
                  onPress: () => router.back()
                }
              ]);
            } catch (err) {
              console.error('Error deleting audit:', err);
              Alert.alert(
                'Error',
                err.response?.data?.message || 'Failed to delete audit. Please try again.'
              );
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_GREEN} />
          <Text style={styles.loadingText}>Loading audit details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchData();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView}>
        {/* Outlet Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outlet</Text>
          <Text style={styles.outletName}>{outletName}</Text>
        </View>
        
        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Date</Text>
          <Text style={styles.dueDate}>{params.dueDate || 'Not specified'}</Text>
        </View>
        
        {/* Version History */}
        {versionHistory && versionHistory.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Version History</Text>
            {versionHistory.map((version) => (
              <VersionHistoryItem
                key={version.version}
                version={version}
                currentAuditId={parseInt(params.formId, 10)}
                outletName={outletName}
              />
            ))}
          </View>
        )}
        
        {/* Forms List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forms</Text>
          {auditData?.forms?.map((form) => (
            <FormItem 
              key={form.id} 
              item={form} 
              auditId={params.formId}
              outletId={params.outletId}
              dueDate={params.dueDate}
              outletName={outletName}
              headerTitle={params.headerTitle}
              auditStatus={auditData?.status}
            />
          ))}
          {(!auditData?.forms || auditData.forms.length === 0) && (
            <Text style={styles.noFormsText}>No forms available</Text>
          )}
          
          {/* Delete Button - Only show for latest draft status */}
          {isLatestVersion && auditData?.status === 'draft' && (
            <TouchableOpacity 
              style={[
                styles.deleteButton,
                isDeleting && styles.disabledButton
              ]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color="#DC2626" size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Audit</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Print Preview Button - Only show for approved status */}
          {auditData?.status === 'approved' && (
            <TouchableOpacity 
              style={styles.printPreviewButton}
              onPress={() => router.push({
                pathname: '/(app)/audits/print-preview',
                params: { 
                  auditId: params.formId,
                  outletId: params.outletId
                }
              })}
            >
              <Text style={styles.printPreviewButtonText}>Print Preview</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button - Only show for latest version and when not approved or pending */}
          {isLatestVersion && auditData?.status !== 'approved' && auditData?.status !== 'pending' && (
            <TouchableOpacity 
              style={[
                styles.submitButton,
                isDeleting && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={isDeleting}
            >
              <Text style={styles.submitButtonText}>Submit Audit</Text>
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  outletName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  dueDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
  },
  formItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  formItemContent: {
    flex: 1,
    marginRight: 12,
  },
  formName: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: '#666666',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  submitButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  noFormsText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingVertical: 24,
  },
  disabledButton: {
    opacity: 0.5
  },
  printPreviewButton: {
    backgroundColor: '#1E40AF', // Deep blue color
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  printPreviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  versionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  versionTitle: {
    fontSize: 16,
    color: '#333333',
  },
  versionDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
}); 