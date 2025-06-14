import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ApiClient from '../../../utils/apiClient';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

// Status Badge Component
const StatusBadge = ({ status }) => {
  // Define status configurations
  const statusConfig = {
    'Approved': { 
      color: PRIMARY_GREEN, 
      text: 'Approved',
      icon: 'checkmark-circle' 
    },
    'Pending Review': { 
      color: '#FFEB3B', 
      text: 'Pending Manager Review',
      icon: 'time' 
    },
    'Rejected': { 
      color: '#F44336', 
      text: 'Rejected - Action Required',
      icon: 'alert-circle' 
    },
    'In Progress': { 
      color: '#9E9E9E', 
      text: 'Draft',
      icon: 'document' 
    },
    'Overdue': { 
      color: '#2196F3', 
      text: 'Overdue',
      icon: 'warning' 
    },
    'Follow-up Required': {
      color: '#FF9800',
      text: 'Follow-up Required',
      icon: 'repeat'
    }
  };

  const config = statusConfig[status] || statusConfig['In Progress'];

  return (
    <View style={[styles.badgeContainer, { backgroundColor: `${config.color}20` }]}>
      <Ionicons name={config.icon} size={14} color={config.color} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

// Audit List Item Component
const AuditListItem = ({ item, onPress }) => (
  <TouchableOpacity 
    style={styles.auditItem}
    onPress={() => onPress(item)}
  >
    <View style={styles.auditContent}>
      <Text style={styles.auditTitle}>{item.title}</Text>
      <Text style={styles.auditDate}>
        {item.isDraft ? `Due: ${item.dueDate}` : `Submitted: ${item.submittedDate}`}
      </Text>
      <StatusBadge status={item.status} />
    </View>
    <Ionicons name="chevron-forward" size={20} color="#999999" />
  </TouchableOpacity>
);

// Section Header Component
const SectionHeader = ({ title, count }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {count > 0 && <Text style={styles.sectionCount}>{count}</Text>}
  </View>
);

export default function AuditsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for audit data
  const [auditData, setAuditData] = useState([
    { title: 'Active Audits', data: [] },
    { 
      title: 'Recent Audits', 
      data: [
        {
          id: '6',
          title: 'Monthly Hygiene Check - May',
          dueDate: 'May 31, 2025',
          submittedDate: 'May 28, 2025',
          isDraft: false,
          status: 'Approved',
          type: 'recent'
        },
        {
          id: '7',
          title: 'Quarterly Food Safety Audit - Q1',
          dueDate: 'March 31, 2025',
          submittedDate: 'March 28, 2025',
          isDraft: false,
          status: 'Approved',
          type: 'recent'
        }
      ] 
    }
  ]);

  // Fetch active audits from backend
  const fetchActiveAudits = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get('/api/mobile/audits');
      setAuditData(prevData => [
        { title: 'Active Audits', data: response },
        prevData[1] // Keep the existing recent audits data
      ]);
      setError(null);
    } catch (err) {
      console.error('Error fetching audits:', err);
      setError('Failed to load audits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch audits when component mounts
  useEffect(() => {
    fetchActiveAudits();
  }, []);

  // Handle audit item press
  const handleAuditPress = (item) => {
    if (item.status === 'In Progress' || item.status === 'Overdue') {
      // If it's a draft or overdue, navigate to the perform audit screen
      router.push({
        pathname: '/(app)/audits/perform-audit',
        params: { 
          formName: item.title,
          formId: item.id,
          mode: 'edit'
        }
      });
    } else if (item.status === 'Rejected' || item.status === 'Follow-up Required') {
      // If it's rejected or needs follow-up, navigate to follow-up audit
      router.push({
        pathname: '/(app)/audits/perform-audit',
        params: { 
          formName: item.title,
          formId: item.id,
          mode: 'followup'
        }
      });
    } else {
      // Otherwise view the submission details
      router.push({
        pathname: '/(app)/audits/view-submission',
        params: { 
          formName: item.title,
          formId: item.id
        }
      });
    }
  };

  // Handle starting new audit
  const handleStartNewAudit = () => {
    router.push('/(app)/audits/select-compliance');
  };

  // Handle viewing past records
  const handleViewPastRecords = () => {
    router.push('/(app)/audits/past-records');
  };

  // Handle viewing reports
  const handleViewReports = () => {
    router.push('/(app)/audits/my-reports');
  };

  // Render each section
  const renderSection = ({ item }) => (
    <View style={styles.section}>
      <SectionHeader title={item.title} count={item.data.length} />
      {loading && item.title === 'Active Audits' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={PRIMARY_GREEN} />
          <Text style={styles.loadingText}>Loading audits...</Text>
        </View>
      ) : error && item.title === 'Active Audits' ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchActiveAudits}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        item.data.map((audit) => (
          <AuditListItem 
            key={audit.id}
            item={audit}
            onPress={handleAuditPress}
          />
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={auditData}
        renderItem={renderSection}
        keyExtractor={(item) => item.title}
        style={styles.list}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleViewPastRecords}
              >
                <Ionicons name="time-outline" size={20} color="#333333" />
                <Text style={styles.actionButtonText}>Past Records</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleViewReports}
              >
                <Ionicons name="bar-chart-outline" size={20} color="#333333" />
                <Text style={styles.actionButtonText}>My Reports</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleStartNewAudit}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  section: {
    marginBottom: 14,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionCount: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: PRIMARY_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  auditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  auditContent: {
    flex: 1,
  },
  auditTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  auditDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
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
    marginBottom: 8,
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
}); 