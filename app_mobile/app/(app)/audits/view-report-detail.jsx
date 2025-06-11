import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

// Section Header Component
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// Action Item Component
const ActionItem = ({ item }) => (
  <View style={styles.actionItem}>
    <View style={styles.actionHeader}>
      <Text style={styles.actionTitle}>{item.title}</Text>
      <View style={[
        styles.actionStatus, 
        { backgroundColor: item.status === 'pending' ? '#FFEB3B20' : '#F4433620' }
      ]}>
        <Text style={[
          styles.actionStatusText, 
          { color: item.status === 'pending' ? '#FF9800' : '#F44336' }
        ]}>
          {item.status === 'pending' ? 'Pending' : 'Overdue'}
        </Text>
      </View>
    </View>
    <Text style={styles.actionDescription}>{item.description}</Text>
    <Text style={styles.actionDue}>Due: {item.dueDate}</Text>
  </View>
);

// Chart Component (Mock)
const ComplianceChart = ({ data }) => (
  <View style={styles.chartContainer}>
    <View style={styles.chartHeader}>
      <Text style={styles.chartTitle}>Compliance Score Trend</Text>
      <Text style={styles.chartSubtitle}>Last 30 days</Text>
    </View>
    
    <View style={styles.chartImageContainer}>
      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartPlaceholderText}>Chart Visualization</Text>
        <Text style={styles.chartPlaceholderSubtext}>
          (In a real implementation, this would display an actual chart)
        </Text>
      </View>
    </View>
    
    <View style={styles.metricsContainer}>
      <View style={styles.metricItem}>
        <Text style={styles.metricValue}>{data.currentScore}%</Text>
        <Text style={styles.metricLabel}>Current Score</Text>
      </View>
      
      <View style={styles.metricDivider} />
      
      <View style={styles.metricItem}>
        <Text style={styles.metricValue}>{data.previousScore}%</Text>
        <Text style={styles.metricLabel}>Previous Month</Text>
      </View>
      
      <View style={styles.metricDivider} />
      
      <View style={styles.metricItem}>
        <Text style={[
          styles.metricTrend,
          { color: data.trend > 0 ? PRIMARY_GREEN : '#F44336' }
        ]}>
          {data.trend > 0 ? '+' : ''}{data.trend}%
        </Text>
        <Text style={styles.metricLabel}>Change</Text>
      </View>
    </View>
  </View>
);

// Audit Summary Component
const AuditSummary = ({ data }) => (
  <View style={styles.summaryContainer}>
    <View style={styles.summaryRow}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{data.totalAudits}</Text>
        <Text style={styles.summaryLabel}>Total Audits</Text>
      </View>
      
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{data.pendingAudits}</Text>
        <Text style={styles.summaryLabel}>Pending</Text>
      </View>
      
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{data.completedAudits}</Text>
        <Text style={styles.summaryLabel}>Completed</Text>
      </View>
    </View>
    
    <View style={styles.summaryRow}>
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: PRIMARY_GREEN }]}>
          {data.passedAudits}
        </Text>
        <Text style={styles.summaryLabel}>Passed</Text>
      </View>
      
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: '#F44336' }]}>
          {data.failedAudits}
        </Text>
        <Text style={styles.summaryLabel}>Failed</Text>
      </View>
      
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: '#FF9800' }]}>
          {data.partialAudits}
        </Text>
        <Text style={styles.summaryLabel}>Partial</Text>
      </View>
    </View>
  </View>
);

// Timeline Item Component
const TimelineItem = ({ item, isLast }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineIconContainer}>
      <View style={[
        styles.timelineIcon,
        { 
          backgroundColor: 
            item.status === 'approved' ? `${PRIMARY_GREEN}20` : 
            item.status === 'rejected' ? '#F4433620' : 
            '#FFEB3B20'
        }
      ]}>
        <Ionicons 
          name={
            item.status === 'approved' ? 'checkmark' : 
            item.status === 'rejected' ? 'close' : 
            'time'
          } 
          size={16} 
          color={
            item.status === 'approved' ? PRIMARY_GREEN : 
            item.status === 'rejected' ? '#F44336' : 
            '#FF9800'
          } 
        />
      </View>
      {!isLast && <View style={styles.timelineLine} />}
    </View>
    
    <View style={styles.timelineContent}>
      <Text style={styles.timelineTitle}>{item.title}</Text>
      <Text style={styles.timelineDate}>{item.date}</Text>
      <Text style={styles.timelineDescription}>{item.description}</Text>
    </View>
  </View>
);

export default function ViewReportDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  
  // Get report details from params
  const reportName = params.reportName || 'Report';
  const reportId = params.reportId || '1';
  const reportType = params.reportType || 'summary';
  
  // Set dynamic header title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: reportName,
    });
  }, [navigation, reportName]);
  
  // Mock data for compliance summary report
  const summaryData = {
    complianceChart: {
      currentScore: 87,
      previousScore: 83,
      trend: 4
    },
    auditSummary: {
      totalAudits: 12,
      pendingAudits: 2,
      completedAudits: 10,
      passedAudits: 8,
      failedAudits: 1,
      partialAudits: 3
    }
  };
  
  // Mock data for action items report
  const actionItemsData = [
    {
      id: '1',
      title: 'Staff PPE Training',
      description: 'Schedule refresher training for all staff on proper PPE usage and requirements.',
      status: 'pending',
      dueDate: 'June 15, 2025'
    },
    {
      id: '2',
      title: 'Freezer Unit #2 Repair',
      description: 'Follow up with maintenance on repair of leaking freezer unit identified in last audit.',
      status: 'overdue',
      dueDate: 'June 10, 2025'
    },
    {
      id: '3',
      title: 'Temperature Log Update',
      description: 'Update temperature logging procedure to include new storage areas.',
      status: 'pending',
      dueDate: 'June 30, 2025'
    }
  ];
  
  // Mock data for submission history report
  const historyData = [
    {
      id: '1',
      title: 'Monthly Hygiene Check - May',
      date: 'May 28, 2025',
      description: 'Submitted by Sarah Johnson. Reviewed and approved by John Manager.',
      status: 'approved'
    },
    {
      id: '2',
      title: 'Fire Safety Quarterly Inspection - Q1',
      date: 'March 28, 2025',
      description: 'Submitted by Sarah Johnson. Reviewed and approved by Sarah Director.',
      status: 'approved'
    },
    {
      id: '3',
      title: 'Staff Training Compliance Review - Q1',
      date: 'March 15, 2025',
      description: 'Submitted by Sarah Johnson. Rejected due to incomplete records.',
      status: 'rejected'
    },
    {
      id: '4',
      title: 'Monthly Hygiene Check - April',
      date: 'April 27, 2025',
      description: 'Submitted by Sarah Johnson. Approved with noted issues requiring follow-up.',
      status: 'pending'
    }
  ];
  
  // Mock data for monthly report
  const monthlyReportData = {
    month: 'May 2025',
    summary: 'Downtown Branch maintained good compliance standards during May 2025, with an overall compliance score of 87%. This represents a 4% improvement from the previous month.',
    highlights: [
      'Completed all scheduled audits on time',
      'Addressed 5 of 6 corrective actions from previous audits',
      'Staff training completion rate improved to 95%'
    ],
    areas_for_improvement: [
      'Temperature logging consistency needs improvement',
      'PPE compliance issues identified in 2 audits',
      'Scheduled maintenance tracking system needs updating'
    ]
  };
  
  // Render report content based on type
  const renderReportContent = () => {
    switch (reportType) {
      case 'summary':
        return (
          <>
            <SectionHeader title="Compliance Overview" />
            <ComplianceChart data={summaryData.complianceChart} />
            
            <SectionHeader title="Audit Summary" />
            <AuditSummary data={summaryData.auditSummary} />
            
            <SectionHeader title="Recent Action Items" />
            {actionItemsData.map((item) => (
              <ActionItem key={item.id} item={item} />
            ))}
          </>
        );
        
      case 'action-items':
        return (
          <>
            <SectionHeader title="Open Action Items" />
            {actionItemsData.length > 0 ? (
              actionItemsData.map((item) => (
                <ActionItem key={item.id} item={item} />
              ))
            ) : (
              <Text style={styles.emptyText}>No open action items found.</Text>
            )}
          </>
        );
        
      case 'history':
        return (
          <>
            <SectionHeader title="Submission Timeline" />
            <View style={styles.timelineContainer}>
              {historyData.map((item, index) => (
                <TimelineItem 
                  key={item.id} 
                  item={item} 
                  isLast={index === historyData.length - 1}
                />
              ))}
            </View>
          </>
        );
        
      case 'monthly':
        return (
          <>
            <SectionHeader title={`Monthly Report: ${monthlyReportData.month}`} />
            
            <View style={styles.monthlyReportSection}>
              <Text style={styles.monthlyReportSummary}>
                {monthlyReportData.summary}
              </Text>
            </View>
            
            <View style={styles.monthlyReportSection}>
              <Text style={styles.monthlyReportSubheader}>Highlights</Text>
              {monthlyReportData.highlights.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.monthlyReportSection}>
              <Text style={styles.monthlyReportSubheader}>Areas for Improvement</Text>
              {monthlyReportData.areas_for_improvement.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </>
        );
        
      default:
        return (
          <Text style={styles.emptyText}>Report content not available.</Text>
        );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.reportContent}>
          {renderReportContent()}
        </View>
      </ScrollView>
      
      {/* Export Button */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => {
            alert('This would export the report to PDF in a real implementation.');
          }}
        >
          <Ionicons name="download-outline" size={20} color="#333333" />
          <Text style={styles.exportButtonText}>Export Report</Text>
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
  reportContent: {
    padding: 16,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  // Chart styles
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  chartImageContainer: {
    height: 200,
    marginBottom: 16,
  },
  chartPlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  metricTrend: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EEEEEE',
  },
  // Summary styles
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
  },
  // Action item styles
  actionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  actionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  actionDue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  // Timeline styles
  timelineContainer: {
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12,
    width: 24,
  },
  timelineIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#EEEEEE',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#333333',
  },
  // Monthly report styles
  monthlyReportSection: {
    marginBottom: 24,
  },
  monthlyReportSummary: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  monthlyReportSubheader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: PRIMARY_GREEN,
    marginRight: 8,
    width: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
  },
  // Empty state
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 32,
  },
  // Action buttons
  actionButtonsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 8,
  },
}); 