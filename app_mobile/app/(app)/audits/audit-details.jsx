import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiClient from '../../../utils/apiClient';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

// Status Badge Component
const StatusBadge = ({ status }) => {
  // Define status configurations
  const statusConfig = {
    completed: { 
      color: PRIMARY_GREEN, 
      text: 'Completed',
      icon: 'checkmark-circle' 
    },
    'in-progress': { 
      color: '#F59E0B', 
      text: 'In Progress',
      icon: 'time' 
    },
    'not-started': { 
      color: '#6B7280', 
      text: 'Not Started',
      icon: 'document' 
    }
  };

  const config = statusConfig[status] || statusConfig['not-started'];

  return (
    <View style={[styles.badgeContainer, { backgroundColor: `${config.color}20` }]}>
      <Ionicons name={config.icon} size={16} color={config.color} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

// Form Item Component
const FormItem = ({ item }) => {
  const router = useRouter();

  const handleFormPress = () => {
    router.push({
      pathname: '/(app)/audits/audit-form-details',
      params: { 
        formId: item.id, 
        formName: item.name,
        auditFormId: item.audit_form_id,
        structure: JSON.stringify(item.structure), 
        isCreated: item.is_created
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
      <StatusBadge status={item.is_created ? 'completed' : 'not-started'} />
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
  
  // Set dynamic header title from params
  useEffect(() => {
    navigation.setOptions({
      headerTitle: params.headerTitle || 'Audit Details',
    });
  }, [navigation, params.headerTitle]);

  // Fetch outlet name and audit forms when component mounts
  useEffect(() => {
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
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load audit information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.outletId, params.formId]);

  const handleSubmit = () => {
    // Handle submission logic here
    console.log('Submitting audit...');
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
        
        {/* Forms List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forms</Text>
          {auditData?.forms?.map((form) => (
            <FormItem key={form.id} item={form} />
          ))}
          {(!auditData?.forms || auditData.forms.length === 0) && (
            <Text style={styles.noFormsText}>No forms available</Text>
          )}
        </View>
      </ScrollView>
      
      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Audit</Text>
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
  },
  submitButtonText: {
    color: '#FFFFFF',
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
  }
}); 