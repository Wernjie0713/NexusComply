import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ApiClient from '../../../utils/apiClient';

// Info Row Component
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// Operating Hours Row Component
const OperatingHoursRow = ({ day, hours }) => (
  <View style={styles.operatingHoursRow}>
    <Text style={styles.dayLabel}>{day}</Text>
    <Text style={styles.hoursValue}>
      {hours.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Closed'}
    </Text>
  </View>
);

export default function OutletDetailsScreen() {
  const [loading, setLoading] = useState(true);
  const [outletData, setOutletData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOutletDetails = async () => {
      try {
        setLoading(true);
        const response = await ApiClient.get('/api/mobile/outlet');
        setOutletData(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching outlet details:', err);
        setError('Failed to load outlet details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOutletDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading outlet details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <InfoRow label="Name" value={outletData?.name} />
          <InfoRow label="Phone Number" value={outletData?.phone_number} />
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <InfoRow label="Street" value={outletData?.address} />
          <InfoRow label="City" value={outletData?.city} />
          <InfoRow label="State" value={outletData?.state} />
          <InfoRow label="Postal Code" value={outletData?.postal_code} />
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          {outletData?.operating_hours_info.map((hours) => (
            <OperatingHoursRow
              key={hours.day}
              day={hours.day}
              hours={hours}
            />
          ))}
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
  scrollView: {
    flex: 1,
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
    color: '#F44336',
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333333',
    flex: 2,
    textAlign: 'right',
  },
  operatingHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayLabel: {
    fontSize: 16,
    color: '#666666',
    flex: 1,
  },
  hoursValue: {
    fontSize: 16,
    color: '#333333',
    flex: 2,
    textAlign: 'right',
  },
}); 