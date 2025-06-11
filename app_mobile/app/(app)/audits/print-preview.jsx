import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

// Reusable Components
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// Form Field Component for displaying answers
const FormField = ({ label, value, notes }) => (
  <View style={styles.formField}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || 'Not provided'}</Text>
    {notes ? <Text style={styles.fieldNotes}>{notes}</Text> : null}
  </View>
);

// Media Item Component
const MediaItem = ({ type, name }) => (
  <View style={styles.mediaItem}>
    <Ionicons 
      name={type === 'photo' ? 'image-outline' : 'document-text-outline'} 
      size={16} 
      color="#666666" 
    />
    <Text style={styles.mediaName}>{name}</Text>
  </View>
);

// Checklist Item Component
const ChecklistItem = ({ item, index }) => (
  <View style={styles.checklistItem}>
    <View style={styles.checklistItemHeader}>
      <Text style={styles.checklistItemNumber}>{index + 1}.</Text>
      <Text style={styles.checklistItemTitle}>{item.title}</Text>
    </View>
    
    <View style={styles.checklistItemContent}>
      <FormField 
        label="Response:" 
        value={item.response} 
      />
      
      {item.notes ? (
        <FormField 
          label="Notes:" 
          value={item.notes} 
        />
      ) : null}
      
      {item.photos && item.photos.length > 0 ? (
        <View style={styles.mediaList}>
          <Text style={styles.mediaListTitle}>Photos:</Text>
          {item.photos.map((photo, photoIndex) => (
            <MediaItem 
              key={photoIndex} 
              type="photo" 
              name={photo.name} 
            />
          ))}
        </View>
      ) : null}
      
      {item.documents && item.documents.length > 0 ? (
        <View style={styles.mediaList}>
          <Text style={styles.mediaListTitle}>Documents:</Text>
          {item.documents.map((doc, docIndex) => (
            <MediaItem 
              key={docIndex} 
              type="document" 
              name={doc.name} 
            />
          ))}
        </View>
      ) : null}
      
      {item.flagged && (
        <View style={styles.flaggedItem}>
          <Ionicons name="flag" size={16} color="#F44336" />
          <Text style={styles.flaggedText}>This item was flagged for attention</Text>
        </View>
      )}
    </View>
  </View>
);

export default function PrintPreviewScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  
  // Get form details from params
  const formName = params.formName || 'Compliance Form';
  const formId = params.formId || 'new';
  
  // Set dynamic header title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Print Preview: ${formName}`,
    });
  }, [navigation, formName]);
  
  // Mock data for the audit
  const auditData = {
    formName: formName,
    outletName: 'Downtown Branch',
    auditDate: new Date().toLocaleDateString(),
    conductedBy: 'Sarah Johnson',
    generalNotes: 'Overall, the outlet is maintaining good compliance standards with a few minor issues noted.',
    checklistItems: [
      {
        id: '1',
        title: 'Are all food preparation surfaces clean and sanitized?',
        type: 'yesno',
        response: 'Yes',
        notes: 'All surfaces were properly cleaned and sanitized at time of inspection.',
        photos: [
          { name: 'kitchen_area_1.jpg', uri: 'https://example.com/photo1' }
        ],
        documents: [],
        flagged: false
      },
      {
        id: '2',
        title: 'Are all staff wearing appropriate PPE?',
        type: 'yesno',
        response: 'No',
        notes: 'Two staff members were not wearing required hair nets.',
        photos: [
          { name: 'staff_ppe_issue.jpg', uri: 'https://example.com/photo2' }
        ],
        documents: [],
        flagged: true
      },
      {
        id: '3',
        title: 'Is the temperature log maintained and up to date?',
        type: 'yesno',
        response: 'Yes',
        notes: 'Temperature logs were reviewed and found to be up to date.',
        photos: [],
        documents: [
          { name: 'temp_log_june.pdf', uri: 'https://example.com/doc1' }
        ],
        flagged: false
      },
      {
        id: '4',
        title: 'Describe any maintenance issues observed during inspection:',
        type: 'text',
        multiline: true,
        response: 'Minor leakage observed from freezer unit #2. Maintenance request submitted on 6/10/25.',
        notes: 'Follow-up needed to ensure repair is completed.',
        photos: [
          { name: 'freezer_leak.jpg', uri: 'https://example.com/photo3' }
        ],
        documents: [
          { name: 'maintenance_request.pdf', uri: 'https://example.com/doc2' }
        ],
        flagged: true
      },
      {
        id: '5',
        title: 'Record the refrigerator temperature readings:',
        type: 'text',
        multiline: false,
        response: 'Main Kitchen: 38°F, Storage: 36°F',
        notes: 'All temperatures within acceptable range.',
        photos: [],
        documents: [],
        flagged: false
      }
    ]
  };
  
  const handleExportPDF = () => {
    Alert.alert(
      "Export PDF",
      "In a real implementation, this would generate and download a PDF of the audit.",
      [{ text: "OK" }]
    );
  };
  
  const handlePrint = () => {
    Alert.alert(
      "Print Document",
      "In a real implementation, this would send the document to a printer.",
      [{ text: "OK" }]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView}>
        {/* PDF Header */}
        <View style={styles.pdfHeader}>
          <Text style={styles.pdfTitle}>NexusComply Audit Report</Text>
          <Text style={styles.pdfSubtitle}>{auditData.formName}</Text>
        </View>
        
        {/* Audit Information */}
        <View style={styles.section}>
          <SectionHeader title="Audit Information" />
          
          <FormField 
            label="Outlet:" 
            value={auditData.outletName} 
          />
          
          <FormField 
            label="Date Conducted:" 
            value={auditData.auditDate} 
          />
          
          <FormField 
            label="Conducted By:" 
            value={auditData.conductedBy} 
          />
        </View>
        
        {/* Checklist Items */}
        <View style={styles.section}>
          <SectionHeader title="Compliance Checklist" />
          
          {auditData.checklistItems.map((item, index) => (
            <ChecklistItem 
              key={item.id}
              item={item}
              index={index}
            />
          ))}
        </View>
        
        {/* General Notes */}
        <View style={styles.section}>
          <SectionHeader title="General Notes" />
          
          <Text style={styles.generalNotes}>
            {auditData.generalNotes}
          </Text>
        </View>
        
        {/* Summary */}
        <View style={styles.section}>
          <SectionHeader title="Summary" />
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Items:</Text>
              <Text style={styles.summaryValue}>{auditData.checklistItems.length}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Items Flagged:</Text>
              <Text style={styles.summaryValue}>
                {auditData.checklistItems.filter(item => item.flagged).length}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Compliance Score:</Text>
              <Text style={styles.summaryValue}>
                {Math.round((auditData.checklistItems.filter(item => 
                  item.response === 'Yes' || !item.flagged
                ).length / auditData.checklistItems.length) * 100)}%
              </Text>
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by NexusComply Mobile | {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.printButton]}
          onPress={handlePrint}
        >
          <Ionicons name="print-outline" size={20} color="#333333" />
          <Text style={styles.actionButtonText}>Print</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.exportButton]}
          onPress={handleExportPDF}
        >
          <Ionicons name="download-outline" size={20} color="#333333" />
          <Text style={styles.actionButtonText}>Export PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.closeButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.actionButtonText}>Close Preview</Text>
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
  pdfHeader: {
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  pdfTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  pdfSubtitle: {
    fontSize: 18,
    color: '#666666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionHeader: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_GREEN,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333333',
  },
  fieldNotes: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  checklistItem: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    overflow: 'hidden',
  },
  checklistItemHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  checklistItemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_GREEN,
    marginRight: 8,
  },
  checklistItemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  checklistItemContent: {
    padding: 12,
  },
  mediaList: {
    marginTop: 8,
    marginBottom: 16,
  },
  mediaListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  mediaName: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  flaggedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  flaggedText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 8,
  },
  generalNotes: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  summaryContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_GREEN,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
  },
  actionButtonsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  printButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  exportButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 8,
  },
}); 