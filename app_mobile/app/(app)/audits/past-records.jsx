import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

// Status Badge Component
const StatusBadge = ({ status }) => {
  // Define status configurations
  const statusConfig = {
    approved: { 
      color: PRIMARY_GREEN, 
      text: 'Approved',
      icon: 'checkmark-circle' 
    },
    rejected: { 
      color: '#F44336', 
      text: 'Rejected',
      icon: 'close-circle' 
    },
    'with-issues': { 
      color: '#FF9800', 
      text: 'Approved with Issues',
      icon: 'alert-circle' 
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
const AuditRecordItem = ({ item, onPress }) => (
  <TouchableOpacity 
    style={styles.recordItem}
    onPress={() => onPress(item)}
  >
    <View style={styles.recordContent}>
      <Text style={styles.recordTitle}>{item.title}</Text>
      <Text style={styles.recordDate}>Submitted: {item.submittedDate}</Text>
      
      <View style={styles.recordDetails}>
        <Text style={styles.recordManager}>Reviewed by: {item.reviewedBy}</Text>
        <StatusBadge status={item.status} />
      </View>
    </View>
  </TouchableOpacity>
);

export default function PastRecordsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = React.useState('');
  
  // Mock data for past audit records
  const pastRecords = [
    {
      id: '1',
      title: 'Monthly Hygiene Check - May 2025',
      submittedDate: 'May 28, 2025',
      reviewedDate: 'May 30, 2025',
      reviewedBy: 'John Manager',
      status: 'approved',
    },
    {
      id: '2',
      title: 'Fire Safety Quarterly Inspection - Q1 2025',
      submittedDate: 'March 28, 2025',
      reviewedDate: 'April 2, 2025',
      reviewedBy: 'Sarah Director',
      status: 'approved',
    },
    {
      id: '3',
      title: 'Staff Training Compliance Review - Q1 2025',
      submittedDate: 'March 15, 2025',
      reviewedDate: 'March 18, 2025',
      reviewedBy: 'John Manager',
      status: 'rejected',
    },
    {
      id: '4',
      title: 'Monthly Hygiene Check - April 2025',
      submittedDate: 'April 27, 2025',
      reviewedDate: 'April 29, 2025',
      reviewedBy: 'John Manager',
      status: 'with-issues',
    },
    {
      id: '5',
      title: 'Equipment Maintenance Audit - Q1 2025',
      submittedDate: 'March 20, 2025',
      reviewedDate: 'March 25, 2025',
      reviewedBy: 'Sarah Director',
      status: 'approved',
    },
    {
      id: '6',
      title: 'Monthly Hygiene Check - March 2025',
      submittedDate: 'March 29, 2025',
      reviewedDate: 'April 1, 2025',
      reviewedBy: 'John Manager',
      status: 'approved',
    },
    {
      id: '7',
      title: 'Food Safety Assessment - February 2025',
      submittedDate: 'February 25, 2025',
      reviewedDate: 'February 28, 2025',
      reviewedBy: 'Sarah Director',
      status: 'approved',
    },
    {
      id: '8',
      title: 'Monthly Hygiene Check - February 2025',
      submittedDate: 'February 27, 2025',
      reviewedDate: 'March 1, 2025',
      reviewedBy: 'John Manager',
      status: 'with-issues',
    }
  ];

  // Filter records based on search text
  const filteredRecords = searchText 
    ? pastRecords.filter(record => 
        record.title.toLowerCase().includes(searchText.toLowerCase()) ||
        record.reviewedBy.toLowerCase().includes(searchText.toLowerCase())
      )
    : pastRecords;

  // Handle record item press
  const handleRecordPress = (item) => {
    router.push({
      pathname: '/(app)/audits/view-submission',
      params: { 
        formName: item.title,
        formId: item.id
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
      
      <FlatList
        data={filteredRecords}
        renderItem={({ item }) => (
          <AuditRecordItem 
            item={item}
            onPress={handleRecordPress}
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
}); 