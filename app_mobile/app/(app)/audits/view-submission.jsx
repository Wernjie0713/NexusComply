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
      <Ionicons name={config.icon} size={16} color={config.color} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

// Section Header Component
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// Info Field Component
const InfoField = ({ label, value }) => (
  <View style={styles.infoField}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// Comment Component
const Comment = ({ comment }) => (
  <View style={styles.commentContainer}>
    <View style={styles.commentHeader}>
      <Text style={styles.commentAuthor}>{comment.author}</Text>
      <Text style={styles.commentDate}>{comment.date}</Text>
    </View>
    <Text style={styles.commentText}>{comment.text}</Text>
  </View>
);

// Checklist Item Component
const ChecklistItem = ({ item }) => (
  <View style={styles.checklistItem}>
    <Text style={styles.checklistQuestion}>{item.question}</Text>
    
    <View style={styles.checklistResponse}>
      <Text style={styles.responseLabel}>Response:</Text>
      <Text style={styles.responseValue}>{item.response}</Text>
    </View>
    
    {item.notes && (
      <View style={styles.checklistNotes}>
        <Text style={styles.notesLabel}>Notes:</Text>
        <Text style={styles.notesValue}>{item.notes}</Text>
      </View>
    )}
    
    {item.flagged && (
      <View style={styles.flaggedItem}>
        <Ionicons name="flag" size={16} color="#F44336" />
        <Text style={styles.flaggedText}>This item was flagged for attention</Text>
      </View>
    )}
    
    {item.reviewerNotes && (
      <View style={styles.reviewerNotesContainer}>
        <Text style={styles.reviewerNotesLabel}>Reviewer Notes:</Text>
        <Text style={styles.reviewerNotesText}>{item.reviewerNotes}</Text>
      </View>
    )}
  </View>
);

export default function ViewSubmissionScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  
  // Get form details from params
  const formName = params.formName || 'Audit Submission';
  const formId = params.formId || '1';
  
  // Set dynamic header title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: formName,
    });
  }, [navigation, formName]);
  
  // Mock submission data
  const submissionData = {
    id: formId,
    title: formName,
    status: 'approved',
    submittedDate: 'May 28, 2025',
    reviewedDate: 'May 30, 2025',
    submittedBy: 'Sarah Johnson',
    reviewedBy: 'John Manager',
    outlet: 'Downtown Branch',
    overallNotes: 'Overall, this audit meets compliance requirements with a few minor notes for improvement.',
    items: [
      {
        id: '1',
        question: 'Are all food preparation surfaces clean and sanitized?',
        response: 'Yes',
        notes: 'All surfaces were properly cleaned and sanitized at time of inspection.',
        flagged: false,
        reviewerNotes: 'Good job maintaining cleanliness standards.'
      },
      {
        id: '2',
        question: 'Are all staff wearing appropriate PPE?',
        response: 'No',
        notes: 'Two staff members were not wearing required hair nets.',
        flagged: true,
        reviewerNotes: 'This is a critical issue. Please ensure all staff are properly trained on PPE requirements.'
      },
      {
        id: '3',
        question: 'Is the temperature log maintained and up to date?',
        response: 'Yes',
        notes: 'Temperature logs were reviewed and found to be up to date.',
        flagged: false
      },
      {
        id: '4',
        question: 'Describe any maintenance issues observed during inspection:',
        response: 'Minor leakage observed from freezer unit #2. Maintenance request submitted on 6/10/25.',
        notes: 'Follow-up needed to ensure repair is completed.',
        flagged: true,
        reviewerNotes: 'Please submit a follow-up when this is resolved.'
      },
      {
        id: '5',
        question: 'Record the refrigerator temperature readings:',
        response: 'Main Kitchen: 38°F, Storage: 36°F',
        notes: 'All temperatures within acceptable range.',
        flagged: false,
        reviewerNotes: 'Temperatures are within acceptable range.'
      }
    ],
    comments: [
      {
        id: '1',
        author: 'John Manager',
        date: 'May 30, 2025',
        text: 'Overall good compliance. Please address the flagged issues and submit a follow-up report within 7 days.'
      },
      {
        id: '2',
        author: 'Sarah Johnson',
        date: 'May 30, 2025',
        text: 'Follow-up action has been scheduled for the PPE issue. Staff training refresher scheduled for tomorrow.'
      }
    ]
  };
  
  // Handle follow-up submission for rejected or issues
  const handleSubmitFollowUp = () => {
    router.push({
      pathname: '/(app)/audits/perform-audit',
      params: { 
        formName: submissionData.title,
        formId: submissionData.id,
        mode: 'followup'
      }
    });
  };
  
  // Handle view print preview
  const handlePrintPreview = () => {
    router.push({
      pathname: '/(app)/audits/print-preview',
      params: { 
        formName: submissionData.title,
        formId: submissionData.id
      }
    });
  };
  
  // Determine if follow-up is needed based on status
  const needsFollowUp = submissionData.status === 'rejected' || submissionData.status === 'with-issues';
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView}>
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <StatusBadge status={submissionData.status} />
        </View>
        
        {/* Submission Info */}
        <View style={styles.section}>
          <SectionHeader title="Submission Details" />
          
          <InfoField 
            label="Outlet" 
            value={submissionData.outlet} 
          />
          
          <InfoField 
            label="Submitted By" 
            value={submissionData.submittedBy} 
          />
          
          <InfoField 
            label="Submitted Date" 
            value={submissionData.submittedDate} 
          />
          
          <InfoField 
            label="Reviewed By" 
            value={submissionData.reviewedBy} 
          />
          
          <InfoField 
            label="Review Date" 
            value={submissionData.reviewedDate} 
          />
        </View>
        
        {/* Overall Notes */}
        {submissionData.overallNotes && (
          <View style={styles.section}>
            <SectionHeader title="Reviewer's Overall Notes" />
            <Text style={styles.overallNotes}>{submissionData.overallNotes}</Text>
          </View>
        )}
        
        {/* Checklist Items */}
        <View style={styles.section}>
          <SectionHeader title="Audit Responses" />
          
          {submissionData.items.map((item) => (
            <ChecklistItem 
              key={item.id}
              item={item}
            />
          ))}
        </View>
        
        {/* Comments Section */}
        {submissionData.comments && submissionData.comments.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Comments" />
            
            {submissionData.comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.printButton]}
          onPress={handlePrintPreview}
        >
          <Ionicons name="print-outline" size={20} color="#333333" />
          <Text style={styles.actionButtonText}>Print / Export</Text>
        </TouchableOpacity>
        
        {needsFollowUp && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.followUpButton]}
            onPress={handleSubmitFollowUp}
          >
            <Ionicons name="git-pull-request" size={20} color="#FFFFFF" />
            <Text style={styles.followUpButtonText}>Submit Follow-Up</Text>
          </TouchableOpacity>
        )}
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
  statusHeader: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeIcon: {
    marginRight: 8,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  infoField: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333333',
  },
  overallNotes: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  checklistItem: {
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
  },
  checklistQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  checklistResponse: {
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 2,
  },
  responseValue: {
    fontSize: 16,
    color: '#333333',
  },
  checklistNotes: {
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 2,
  },
  notesValue: {
    fontSize: 15,
    color: '#333333',
    fontStyle: 'italic',
  },
  flaggedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  flaggedText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 8,
  },
  reviewerNotesContainer: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY_GREEN,
  },
  reviewerNotesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  reviewerNotesText: {
    fontSize: 15,
    color: '#333333',
  },
  commentContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#64B5F6',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  commentDate: {
    fontSize: 12,
    color: '#666666',
  },
  commentText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  actionButtonsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
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
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 8,
  },
  followUpButton: {
    backgroundColor: PRIMARY_GREEN,
  },
  followUpButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
}); 