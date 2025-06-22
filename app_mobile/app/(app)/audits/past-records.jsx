import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiClient from '../../../utils/apiClient';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

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
    },
    'revising': {
      color: '#FF9800',
      text: 'Need Modify',
      icon: 'repeat'
    }
  };

  const config = statusConfig[status] || statusConfig.approved;

  return (
    <View style={[styles.badgeContainer, { backgroundColor: `${config.color}20` }]}>
      <Ionicons name={config.icon} size={14} color={config.color} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

// Past Audit Record Item Component
const AuditRecordItem = ({ item, onPress, onSubmit }) => (
  <TouchableOpacity 
    style={styles.recordItem}
    onPress={() => onPress(item)}
  >
    <View style={styles.recordContent}>
      <Text style={styles.recordTitle}>{item.title}</Text>
      <View style={styles.recordDetails}>
        <Text style={styles.recordManager}>Reviewed by: {item.manager_name}</Text>
        <StatusBadge status={item.status} />
      </View>
      {item.is_latest && !['approved', 'pending'].includes(item.status) && (
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={() => onSubmit(item)}
        >
          <Text style={styles.submitButtonText}>Submit Audit</Text>
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

export default function PastRecordsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditRecords, setAuditRecords] = useState([]);
  
  // Fetch audit records from backend
  const fetchAuditRecords = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get('/api/mobile/audits');
      
      // Sort records by updated_at in descending order
      const sortedRecords = response.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      
      setAuditRecords(sortedRecords);
      setError(null);
    } catch (err) {
      console.error('Error fetching audit records:', err);
      setError('Failed to load audit records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch records when component mounts
  useEffect(() => {
    fetchAuditRecords();
  }, []);

  // Filter records based on search text
  const filteredRecords = searchText 
    ? auditRecords.filter(record => 
        record.title.toLowerCase().includes(searchText.toLowerCase())
      )
    : auditRecords;

  // Handle record item press
  const handleRecordPress = (item) => {
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
  };
  
  const handleSubmitPress = (item) => {
    router.push({
      pathname: '/(app)/audits/audit-form-details',
      params: { 
        formId: item.id,
        headerTitle: item.title,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search audit records..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999999"
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#999999" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_GREEN} />
          <Text style={styles.loadingText}>Loading audit records...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchAuditRecords}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={({ item }) => (
            <AuditRecordItem 
              item={item}
              onPress={handleRecordPress}
              onSubmit={handleSubmitPress}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>
                {searchText 
                  ? "No audit records match your search" 
                  : "No past audit records found"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333333',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  recordItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordManager: {
    fontSize: 14,
    color: '#666666',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
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
    padding: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    marginBottom: 12,
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
  submitButton: {
    marginTop: 12,
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 