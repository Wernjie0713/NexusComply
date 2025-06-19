import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ApiClient from '../../../utils/apiClient';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';
const WARNING_RED = '#DC2626';

// Status Badge Component
const StatusBadge = ({ status }) => {
  // Define status configurations
  const statusConfig = {
    'approved': { 
      color: PRIMARY_GREEN, 
      text: 'Approved',
      icon: 'checkmark-circle' 
    },
    'pending': { 
      color: '#FFEB3B', 
      text: 'Pending Manager Review',
      icon: 'time' 
    },
    'draft': { 
      color: '#9E9E9E', 
      text: 'Draft',
      icon: 'document' 
    },
    'overdue': { 
      color: '#2196F3', 
      text: 'Overdue',
      icon: 'warning' 
    },
    'rejected': {
      color: '#FF9800',
      text: 'Rejected',
      icon: 'repeat'
    }
  };

  const config = statusConfig[status] || statusConfig['draft'];

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
        {item.isDraft ? `Due: ${item.dueDate}` : `Due Date: ${item.dueDate}`}
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

// Reminder Section Component
const ReminderSection = ({ audits }) => {
  const pendingAudits = audits.filter(audit => 
    audit.status === 'draft' || audit.status === 'rejected' || audit.status === 'overdue'
  );

  if (pendingAudits.length === 0) return null;

  return (
    <View style={styles.reminderContainer}>
      <View style={styles.reminderHeader}>
        <Ionicons name="alert-circle" size={20} color={WARNING_RED} />
        <Text style={styles.reminderTitle}>Pending Actions Required</Text>
      </View>
      {pendingAudits.map((audit, index) => (
        <View key={index} style={styles.reminderItem}>
          <Ionicons 
            name={audit.status === 'rejected' ? 'close-circle' : 'time'} 
            size={16} 
            color={audit.status === 'rejected' ? WARNING_RED : '#FFEB3B'} 
          />
          <Text style={styles.reminderText}>
            {audit.status === 'rejected' 
              ? `"${audit.title}" was rejected - requires revision`
              : audit.status === 'overdue'
              ? `"${audit.title}" is overdue - due date: ${audit.dueDate}`
              : `"${audit.title}" needs to be completed - due date: ${audit.dueDate}`
            }
          </Text>
        </View>
      ))}
    </View>
  );
};

export default function AuditsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for audit data
  const [auditData, setAuditData] = useState([
    { title: 'Active Audits', data: [] },
    { title: 'Recent Audits', data: [] }
  ]);

  // Fetch active audits from backend
  const fetchActiveAudits = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get('/api/mobile/audits');
      
      // Separate audits into active and recent based on status
      const activeAudits = response.filter(audit => audit.status !== 'approved');
      const recentAudits = response.filter(audit => audit.status === 'approved');

      setAuditData([
        { title: 'Active Audits', data: activeAudits },
        { title: 'Recent Audits', data: recentAudits }
      ]);
      setError(null);
    } catch (err) {
      console.error('Error fetching audits:', err);
      setError('Failed to load audits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchActiveAudits();
    }, [])
  );

  // Handle audit item press
  const handleAuditPress = (item) => {
    if (item.status === 'In Progress' || item.status === 'Overdue') {
      // If it's a draft or overdue, navigate to the perform audit screen
      router.push({
        pathname: '/(app)/audits/compliance-details',
        params: { 
          formName: item.title,
          formId: item.id,
          mode: 'edit'
        }
      });
    } else if (item.status === 'Rejected' || item.status === 'Follow-up Required') {
      // If it's rejected or needs follow-up, navigate to follow-up audit
      router.push({
        pathname: '/(app)/audits/compliance-details',
        params: { 
          formName: item.title,
          formId: item.id,
          mode: 'followup'
        }
      });
    } else {
      // Otherwise view the submission details
      router.push({
        pathname: '/(app)/audits/audit-details',
        params: { 
          formName: item.title,
          formId: item.id,
          headerTitle: item.title,
          outletId: item.outlet_id,
          dueDate: item.dueDate,
          status: item.status
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

  // Get all active audits for reminder
  const allActiveAudits = auditData.find(section => section.title === 'Active Audits')?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={auditData}
        renderItem={renderSection}
        keyExtractor={(item) => item.title}
        style={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.reminderSection}>
              <Text style={styles.reminderSectionTitle}>Reminders</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={PRIMARY_GREEN} />
                  <Text style={styles.loadingText}>Loading reminders...</Text>
                </View>
              ) : (
                <ReminderSection audits={allActiveAudits} />
              )}
            </View>
          </>
        }
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
  reminderSection: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  reminderSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  reminderContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: WARNING_RED,
    marginLeft: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
}); 