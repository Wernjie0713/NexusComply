import React, { useEffect } from 'react';
import { Text, View, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function AuditsTabScreen() {
  const router = useRouter();
  
  // Redirect to the main audits screen in the (app) group
  useEffect(() => {
    // Use a small timeout to ensure navigation works properly
    const redirect = setTimeout(() => {
      router.replace('/(app)/audits');
    }, 100);
    
    return () => clearTimeout(redirect);
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Redirecting...
        </Text>
        <Text style={styles.subtitle}>
          Please wait while we take you to the audits screen.
        </Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#EFF6FF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#3B82F6',
    textAlign: 'center',
  },
}); 