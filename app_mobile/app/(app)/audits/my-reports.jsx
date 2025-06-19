import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

// Report Item Component
const ReportItem = ({ item, onPress }) => (
  <TouchableOpacity 
    style={styles.reportItem}
    onPress={() => onPress(item)}
  >
    <View style={styles.reportIcon}>
      <Ionicons name={item.icon} size={24} color={PRIMARY_GREEN} />
    </View>
    <View style={styles.reportContent}>
      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportDescription}>{item.description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#999999" />
  </TouchableOpacity>
);

// Section Header Component
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export default function MyReportsScreen() {
  const router = useRouter();
  
  // Mock data for available reports
  const availableReports = [
    {
      id: '1',
      title: 'Compliance Summary',
      description: 'Overview of your outlet\'s compliance status for the last 30 days',
      icon: 'pie-chart',
      type: 'summary'
    }
  ];
  
  // Mock data for downloadable reports
  const downloadableReports = [
    {
      id: '4',
      title: 'Monthly Compliance Report',
      description: 'Detailed report of all compliance activities for May 2025',
      icon: 'document-text',
      type: 'monthly'
    },
    {
      id: '5',
      title: 'Evidence Collection',
      description: 'All photos and documents submitted in the last 30 days',
      icon: 'images',
      type: 'evidence'
    }
  ];
  
  // Handle report press
  const handleReportPress = (item) => {
    if (item.type === 'evidence') {
      // For evidence collection, show download alert instead of navigating
      Alert.alert(
        "Preparing Download",
        "Your evidence collection is being prepared for download. This would download all photos and documents in a real implementation.",
        [{ text: "OK" }]
      );
    } else {
      // For other reports, navigate to the report detail view
      router.push({
        pathname: '/(app)/audits/view-report-detail',
        params: { 
          reportName: item.title,
          reportId: item.id,
          reportType: item.type
        }
      });
    }
  };
  
  // Render section with header and items
  const renderSection = ({ item }) => (
    <View style={styles.section}>
      <SectionHeader title={item.title} />
      {item.data.map((reportItem) => (
        <ReportItem 
          key={reportItem.id}
          item={reportItem}
          onPress={handleReportPress}
        />
      ))}
    </View>
  );
  
  // Prepare sections data
  const sections = [
    { title: 'Available Reports', data: availableReports },
    { title: 'Downloadable Reports', data: downloadableReports }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.title}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Access and download reports related to your outlet's compliance activities.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${PRIMARY_GREEN}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666666',
  },
}); 