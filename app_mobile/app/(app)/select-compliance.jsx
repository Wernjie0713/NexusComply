import React, { useState } from 'react';
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

// Reuse the same primary green color for consistency
const PRIMARY_GREEN = '#4CAF50';

// Compliance Form Item Component
const ComplianceFormItem = ({ item, onPress }) => (
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
  
  // Mock data for compliance forms
  const complianceForms = [
    {
      id: 1,
      title: 'Monthly Hygiene Check',
      description: 'Standard hygiene compliance check required monthly.',
      icon: 'medical-outline',
    },
    {
      id: 2,
      title: 'Fire Safety Inspection',
      description: 'Quarterly fire safety compliance audit.',
      icon: 'flame-outline',
    },
    {
      id: 3,
      title: 'Staff Training Log',
      description: 'Record of staff training completion and certification.',
      icon: 'people-outline',
    },
    {
      id: 4,
      title: 'Equipment Maintenance',
      description: 'Scheduled equipment inspections and maintenance record.',
      icon: 'construct-outline',
    },
    {
      id: 5,
      title: 'Food Temperature Log',
      description: 'Daily food storage temperature monitoring form.',
      icon: 'thermometer-outline',
    },
    {
      id: 6,
      title: 'Incident Report',
      description: 'Report for any safety incidents or near misses.',
      icon: 'warning-outline',
    },
  ];

  // Filter forms based on search text
  const filteredForms = searchText 
    ? complianceForms.filter(form => 
        form.title.toLowerCase().includes(searchText.toLowerCase()) ||
        form.description.toLowerCase().includes(searchText.toLowerCase())
      )
    : complianceForms;

  const handleFormSelection = (form) => {
    // This would navigate to the form filling screen in a real implementation
    Alert.alert(
      'Form Selected', 
      `You selected the "${form.title}" form. This would start a new audit in a complete implementation.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
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
        <Text style={styles.headerTitle}>Select Compliance Form</Text>
        <View style={styles.placeholderView} />
      </View>
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search forms..."
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
      
      {/* Form List */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.formListContainer}>
          {filteredForms.length > 0 ? (
            filteredForms.map(form => (
              <ComplianceFormItem 
                key={form.id} 
                item={form} 
                onPress={handleFormSelection}
              />
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search" size={48} color="#CCCCCC" />
              <Text style={styles.noResultsText}>No forms match your search</Text>
            </View>
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