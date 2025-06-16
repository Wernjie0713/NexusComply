import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import ApiClient from '../../utils/apiClient';

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
    pending: { 
      color: '#FFEB3B', 
      text: 'Pending Manager Review',
      icon: 'time' 
    },
    rejected: { 
      color: '#F44336', 
      text: 'Rejected - Action Required',
      icon: 'alert-circle' 
    },
    draft: { 
      color: '#9E9E9E', 
      text: 'Draft',
      icon: 'document' 
    },
    completed: { 
      color: PRIMARY_GREEN, 
      text: 'Completed',
      icon: 'checkmark-circle' 
    }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <View style={[styles.badgeContainer, { backgroundColor: `${config.color}20` }]}>
      <Ionicons name={config.icon} size={14} color={config.color} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, iconName, color, onPress }) => (
  <TouchableOpacity 
    style={styles.summaryCard}
    onPress={onPress}
  >
    <View style={[styles.iconContainer, { backgroundColor: `${color}10` }]}>
      <Ionicons name={iconName} size={24} color={color} />
    </View>
    <View style={styles.summaryTextContainer}>
      <Text style={styles.summaryCount}>{value}</Text>
      <Text style={styles.summaryTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
);

// Activity Item Component
const ActivityItem = ({ item, onPress }) => (
  <TouchableOpacity 
    style={styles.auditItem}
    onPress={onPress}
  >
    <View style={styles.auditItemContent}>
      <Text style={styles.auditName}>{item.title}</Text>
      <Text style={styles.auditDate}>{item.displayTime}</Text>
      <StatusBadge status={item.status} />
    </View>
  </TouchableOpacity>
);

// Task Item Component
const TaskItem = ({ item, onPress }) => (
  <TouchableOpacity 
    style={styles.taskItem}
    onPress={onPress}
  >
    <View style={styles.taskItemContent}>
      <Text style={styles.taskName}>{item.title}</Text>
      <Text style={styles.taskDueTime}>{item.dueTime}</Text>
      <View style={[styles.priorityBadge, { 
        backgroundColor: item.priority === 'high' 
          ? '#FFEBEE' 
          : item.priority === 'medium' 
            ? '#FFF8E1' 
            : '#E8F5E9' 
      }]}>
        <Text style={[styles.priorityText, { 
          color: item.priority === 'high' 
            ? '#D32F2F' 
            : item.priority === 'medium' 
              ? '#F57F17' 
              : '#388E3C' 
        }]}>
          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch dashboard data from the API
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await ApiClient.get('/api/mobile/dashboard');
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleViewTaskDetails = (item) => {
    Alert.alert('View Task', `View details for ${item.title} - To be implemented`);
  };

  const handleStartNewAudit = () => {
    // Navigate to the audits/select-compliance screen
    router.push('/(app)/audits/select-compliance');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_GREEN} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            setError(null);
            fetchDashboardData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with welcome message */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hello, {user?.name || 'User'}!</Text>
        <Text style={styles.subtitleText}>Outlet User</Text>
      </View>
      
      {dashboardData && (
        <ScrollView style={styles.scrollView}>
          {/* Metrics/Summary Cards Section */}
          <View style={styles.summaryContainer}>
            {dashboardData.metrics.map((metric, index) => (
              <SummaryCard
                key={index}
                title={metric.title}
                value={metric.value}
                iconName={metric.icon}
                color={metric.color}
                onPress={() => {}}
              />
            ))}
          </View>
          
          {/* Recent Activity Section */}
          {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
            <View style={styles.submissionsContainer}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              
              {dashboardData.recentActivity.map((activity, index) => (
                <ActivityItem 
                  key={index} 
                  item={activity} 
                  onPress={() => handleViewTaskDetails(activity)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
      
      {/* Action Button */}
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleStartNewAudit}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Start New Audit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    marginTop: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666666',
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  submissionsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    marginTop: 8,
  },
  auditItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  auditItemContent: {
    padding: 16,
  },
  auditName: {
    fontSize: 16,
    fontWeight: '500',
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
  taskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskItemContent: {
    padding: 16,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  taskDueTime: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: PRIMARY_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});