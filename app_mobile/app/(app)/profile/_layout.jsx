import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
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
        name="outlet-details"
        options={{ 
          headerTitle: 'Outlet Details',
        }}
      />
    </Stack>
  );
} 