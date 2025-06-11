import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LogoImage from '../../components/LogoImage';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';

export default function LandingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {/* Logo and Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoContainer}>
            <LogoImage size={120} />
          </View>
          <Text style={styles.appName}>NexusComply</Text>
          <Text style={styles.tagline}>Streamline Your Compliance Management</Text>
        </View>
        
        {/* Graphics or illustration could go here */}
        <View style={styles.illustrationContainer}>
          <View style={styles.graphicElement}>
            <Ionicons name="checkmark-circle" size={40} color={PRIMARY_GREEN} style={styles.iconElement} />
            <Ionicons name="document-text" size={50} color={PRIMARY_GREEN} style={styles.iconElement} />
            <Ionicons name="analytics" size={40} color={PRIMARY_GREEN} style={styles.iconElement} />
          </View>
        </View>
        
        {/* Bottom area with CTA button */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    maxWidth: '80%',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  graphicElement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 20,
    width: '100%',
    height: 120,
  },
  iconElement: {
    marginHorizontal: 12,
  },
  ctaContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  getStartedButton: {
    backgroundColor: PRIMARY_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  versionText: {
    color: '#999999',
    fontSize: 14,
  },
}); 