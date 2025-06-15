import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ApiClient from '../../../utils/apiClient';

// Reuse the same primary green color for consistency
const PRIMARY_GREEN = '#4CAF50';

// Compliance Requirement Item Component
const ComplianceRequirementItem = ({ item, onPress }) => (
  <TouchableOpacity 
    style={styles.formItem}
    onPress={() => onPress(item)}
  >
    <View style={styles.formIconContainer}>
      <Ionicons name={item.icon} size={24} color={PRIMARY_GREEN} />
    </View>
    <View style={styles.formTextContainer}>
      <Text style={styles.formTitle}>{item.title}</Text>
      <Text style={styles.formDescription}>{item.description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#999999" />
  </TouchableOpacity>
);

export default function SelectComplianceScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  
  // State for compliance requirements
  const [complianceRequirements, setComplianceRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch compliance requirements from Laravel backend
  useEffect(() => {
    const fetchComplianceRequirements = async () => {
      try {
        const response = await ApiClient.get('/api/mobile/compliance-forms');
        setComplianceRequirements(response);
      } catch (error) {
        console.error('Error fetching compliance requirements:', error);
        Alert.alert('Error', 'Failed to load compliance requirements. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceRequirements();
  }, []);

  // Filter compliance requirements based on search text
  const filteredRequirements = searchText 
    ? complianceRequirements.filter(requirement => 
        requirement.title.toLowerCase().includes(searchText.toLowerCase()) ||
        requirement.description.toLowerCase().includes(searchText.toLowerCase())
      )
    : complianceRequirements;

  const handleComplianceSelection = (requirement) => {
    // Navigate to perform audit screen with the selected compliance requirement
    router.push({
      pathname: '/(app)/audits/compliance-details',
      params: { 
        complianceId: requirement.id,
        auditTitle: requirement.title,
        auditDescription: requirement.description,
        submissionType: requirement.submission_type,
        category: requirement.category
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Compliance Requirement</Text>
        <View style={styles.placeholderView} />
      </View>
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search compliance requirements..."
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
      
      {/* Loading or List */}
      {loading ? (
        <View style={styles.noResultsContainer}>
          <Text>Loading compliance requirements...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.formListContainer}>
            {filteredRequirements.length > 0 ? (
              filteredRequirements.map(requirement => (
                <ComplianceRequirementItem 
                  key={requirement.id} 
                  item={requirement} 
                  onPress={handleComplianceSelection}
                />
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color="#CCCCCC" />
                <Text style={styles.noResultsText}>No compliance requirements match your search</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholderView: {
    width: 32, // To balance the back button and center the title
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
  scrollView: {
    flex: 1,
  },
  formListContainer: {
    padding: 16,
  },
  formItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  formIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${PRIMARY_GREEN}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formTextContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: '#666666',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
}); 