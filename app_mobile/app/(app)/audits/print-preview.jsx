import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
  Linking
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import ApiClient from '../../../utils/apiClient';
import * as IntentLauncher from 'expo-intent-launcher';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

// Constants for PDF styling
const PDF_STYLES = {
  colors: {
    primary: '#4CAF50',
    lightGreen: '#F0F8F0',
    grey: '#505050',
    lightGrey: '#969696'
  },
  fonts: {
    sizes: {
      title: 18,
      subtitle: 14,
      normal: 10,
      small: 8
    }
  },
  spacing: {
    margin: 14,
    padding: 12
  }
};

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

// Add this helper function before the component
const renderAnswer = (value, type) => {
  if (value === undefined || value === null) {
    return 'Not answered';
  }

  switch (type) {
    case 'checkbox':
      return value ? 'Yes' : 'No';
    case 'checkbox-group':
      return Array.isArray(value) ? value.join(', ') : value;
    case 'file':
      return value ? 'File uploaded' : 'No file';
    case 'date':
      return value || 'No date selected';
    default:
      return String(value);
  }
};

// Helper functions for PDF generation
const definePageLayout = (doc) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const availableWidth = pageWidth - (2 * margin);
  return { pageWidth, pageHeight, margin, availableWidth };
};

const addPageHeader = (doc, text, y = 20, margin = 14) => {
  doc.setFontSize(14);
  doc.setTextColor(...PDF_STYLES.colors.primary);
  doc.text(text, margin, y);
  return y + 15;
};

const addPageFooter = (doc, pageNumber, pageHeight, margin = 14) => {
  doc.setFontSize(8);
  doc.setTextColor(...PDF_STYLES.colors.lightGrey);
  doc.text(`第 ${pageNumber} 页`, margin, pageHeight - 10);
};

const drawSeparatorLine = (doc, y, margin, pageWidth) => {
  doc.setLineWidth(0.5);
  doc.setDrawColor(...PDF_STYLES.colors.primary);
  doc.line(margin, y, pageWidth - margin, y);
};

export default function PrintPreviewScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [outletName, setOutletName] = useState(null);
  const [error, setError] = useState(null);
  
  // Get form details from params
  const formName = params.formName || 'Compliance Form';
  const formId = params.formId || 'new';
  
  // Set dynamic header title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Print Preview',
    });
  }, [navigation]);
  
  useEffect(() => {
    console.log('Initial params:', params);
    if (!params.auditId) {
      setError('No audit ID provided');
      setLoading(false);
      return;
    }
    fetchData();
  }, [params.auditId, params.outletId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch outlet data
      if (params.outletId) {
        try {
          const outletResponse = await ApiClient.get(`/api/mobile/outlets/${params.outletId}`);
          setOutletName(outletResponse.name);
        } catch (e) {
          console.warn('Could not fetch outlet name, will proceed without it.', e);
          setOutletName('Unknown Outlet');
        }
      } else {
        setOutletName('Not specified');
      }
      
      // Fetch audit data
      const response = await ApiClient.get(`/api/mobile/audits/${params.auditId}/forms`);
      console.log('Raw API response:', response);

      if (!response) {
        throw new Error('No response received from API');
      }

      if (!response.forms) {
        throw new Error('No forms data in API response');
      }

      // Process form data
      const processedForms = response.forms.map((form, index) => {
        console.log(`Processing form ${index}:`, form);
        
        if (!form) {
          console.warn(`Form ${index} is null or undefined`);
          return null;
        }

        let structure = [];
        let value = {};
        
        try {
          // Handle structure parsing
          if (form.structure) {
            console.log(`Form ${index} structure type:`, typeof form.structure);
            
            if (Array.isArray(form.structure)) {
              structure = form.structure;
            } else if (typeof form.structure === 'string') {
              structure = JSON.parse(form.structure);
            } else if (typeof form.structure === 'object') {
              structure = [form.structure];
            }
            
            // Validate structure
            if (!Array.isArray(structure)) {
              console.error(`Form ${index} structure is not an array after processing:`, structure);
              structure = [];
            }
            
            console.log(`Form ${index} processed structure:`, structure);
          } else {
            console.warn(`Form ${index} has no structure`);
          }

          // Handle form values parsing
          if (form.value) {
            console.log(`Form ${index} value type:`, typeof form.value);
            
            if (typeof form.value === 'string') {
              value = JSON.parse(form.value);
            } else if (typeof form.value === 'object' && form.value !== null) {
              value = form.value;
            }
            
            console.log(`Form ${index} processed value:`, value);
          } else {
            console.warn(`Form ${index} has no value, using empty object`);
          }

          return {
            ...form,
            structure: structure || [],
            value: value || {}
          };
        } catch (e) {
          console.error(`Error processing form ${index}:`, e);
          return {
            ...form,
            structure: [],
            value: {}
          };
        }
      }).filter(form => form !== null); // Remove any null forms

      console.log('Processed forms:', processedForms);

      const processedData = {
        ...response,
        forms: processedForms
      };
      console.log('Final processed data:', processedData);

      setAuditData(processedData);
    } catch (error) {
      console.error('Error in fetchAuditData:', error);
      setError(error.message || 'Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const generatePdfHtml = () => {
    if (!auditData) return '';

    const formsHtml = auditData.forms.map(form => {
      if (!form || !form.structure) return '';
      
      const itemsHtml = form.structure.map(item => {
        if (!item) return '';
        if (item.type === 'section') {
          return `<h3 class="section-title">${item.label || 'Unnamed Section'}</h3>`;
        }
        if (item.type === 'text-block') {
          return `<p class="text-block">${item.label || ''}</p>`;
        }
        const answer = renderAnswer(form.value?.[item.id], item.type);
        return `
          <div class="question-item">
            <p class="question">${item.label || ''}</p>
            <p class="answer">${answer || 'Not answered'}</p>
          </div>
        `;
      }).join('');

      return `
        <div class="form-container">
          <h2 class="form-title">${form.name || 'Unnamed Form'}</h2>
          ${itemsHtml}
        </div>
      `;
    }).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; margin: 40px; color: #333; }
            h1 { color: ${PRIMARY_GREEN}; text-align: center; border-bottom: 2px solid ${PRIMARY_GREEN}; padding-bottom: 10px; }
            h2.form-title { font-size: 24px; color: #333; margin-top: 40px; border-bottom: 1px solid #ccc; padding-bottom: 5px;}
            h3.section-title { font-size: 18px; color: ${PRIMARY_GREEN}; margin-top: 30px; background-color: #f2f2f2; padding: 8px; }
            .meta-info { margin-bottom: 30px; font-size: 14px; }
            .meta-info p { margin: 5px 0; }
            .question-item { border-bottom: 1px solid #eee; padding: 10px 0; }
            .question { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
            .answer { font-size: 16px; color: #555; padding-left: 15px; }
            .text-block { background-color: #f9f9f9; padding: 10px; border-left: 3px solid #ccc; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <h1>NexusComply Audit Report</h1>
          <div class="meta-info">
            <p><strong>Outlet:</strong> ${outletName || auditData.outlet?.name || 'Not specified'}</p>
            <p><strong>Audit ID:</strong> ${params.auditId || 'N/A'}</p>
            <p><strong>Generated Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          ${formsHtml}
          <div class="footer">
            Generated by NexusComply Mobile
          </div>
        </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    if (!auditData?.forms) {
      Alert.alert('Error', 'No audit data available');
      return;
    }

    try {
      const htmlContent = generatePdfHtml();
      if (!htmlContent) {
        Alert.alert('Error', 'Could not generate PDF content');
        return;
      }
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      console.log('File has been saved to:', uri);
      
      if (Platform.OS === 'android') {
        try {
          const contentUri = await FileSystem.getContentUriAsync(uri);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: 'application/pdf',
          });
        } catch (e) {
          console.error('Error opening PDF with IntentLauncher:', e);
          // Fallback to sharing
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Share or open the report',
            });
          } else {
            Alert.alert("Error", "No app available to open PDF.");
          }
        }
      } else {
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert("Error", "Sharing is not available on this device.");
          return;
        }
  
        // Use the Sharing module to open the share dialog
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share or open the report',
        });
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  // Add debug logging in render
  console.log('Current auditData:', auditData);
  console.log('Current loading state:', loading);
  console.log('Current error state:', error);

  // Helper function to safely render form items
  const renderFormItem = (item, value) => {
    if (!item) return null;
    
    console.log('Rendering form item:', item);
    console.log('Item value:', value);

    try {
      switch (item.type) {
        case 'section':
          return (
            <View key={item.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{item.label || 'Untitled Section'}</Text>
            </View>
          );
        case 'text-block':
          return (
            <View key={item.id} style={styles.textBlock}>
              <Text style={styles.textBlockContent}>{item.label || ''}</Text>
            </View>
          );
        default:
          const displayValue = renderAnswer(value?.[item.id], item.type);
          return (
            <View key={item.id} style={styles.questionContainer}>
              <Text style={styles.questionText}>{item.label}</Text>
              <Text style={styles.answerText}>
                {displayValue}
              </Text>
            </View>
          );
      }
    } catch (error) {
      console.error('Error rendering form item:', error);
      return null;
    }
  };

  // Update the form rendering section
  const renderForm = (form, formIndex) => {
    if (!form || !form.structure) return null;

    console.log(`Rendering form ${formIndex}:`, form.name);
    
    return (
      <View key={formIndex} style={styles.formSection}>
        <Text style={styles.formTitle}>{form.name || 'Unnamed Form'}</Text>
        {form.structure.map((item, itemIndex) => (
          renderFormItem(item, form.value)
        ))}
      </View>
    );
  };

  // Update the main render section
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading audit data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : !auditData?.forms?.length ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No forms available</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView}>
            <View style={styles.pdfHeader}>
              <Text style={styles.pdfTitle}>NexusComply Audit Report</Text>
              <Text style={styles.pdfSubtitle}>{formName}</Text>
            </View>
            
            <View style={styles.section}>
              <SectionHeader title="Audit Information" />
              <FormField 
                label="Outlet:" 
                value={outletName || auditData.outlet?.name || 'Not specified'} 
              />
              <FormField 
                label="Audit Date:" 
                value={new Date().toLocaleDateString()} 
              />
            </View>

            {auditData.forms.map((form, index) => renderForm(form, index))}
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Generated by NexusComply Mobile | {new Date().toLocaleDateString()}
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.generateButton]}
              onPress={generatePDF}
            >
              <Text style={styles.actionButtonText}>Generate PDF</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.backButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.actionButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  generateButton: {
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  backButton: {
    backgroundColor: '#666666',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textBlock: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  textBlockContent: {
    fontSize: 16,
    color: '#666666',
  },
  questionContainer: {
    marginVertical: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
}); 