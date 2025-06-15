import React from 'react';
import { Stack } from 'expo-router';

export default function AuditsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#333333',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="select-compliance" 
        options={{ 
          headerTitle: 'Select Compliance Form',
          headerShown: false, // Custom header in the screen
        }} 
      />
      <Stack.Screen 
        name="compliance-details" 
        options={{ 
          headerTitle: 'Perform Audit',
          // Dynamic title will be set in the component
        }} 
      />
      <Stack.Screen 
        name="print-preview" 
        options={{ 
          headerTitle: 'Print Preview',
          // Dynamic title will be set in the component
        }} 
      />
      <Stack.Screen 
        name="past-records" 
        options={{ 
          headerTitle: 'Past Audit Records',
        }} 
      />
      <Stack.Screen 
        name="audit-details" 
        options={{ 
          headerTitle: 'Audit Details',
          // Dynamic title will be set in the component
        }} 
      />
      <Stack.Screen 
        name="my-reports" 
        options={{ 
          headerTitle: 'My Outlet Reports',
        }} 
      />
      <Stack.Screen 
        name="view-report-detail" 
        options={{ 
          headerTitle: 'Report Details',
          // Dynamic title will be set in the component
        }} 
      />
    </Stack>
  );
} 