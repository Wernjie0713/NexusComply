import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the landing page
  return <Redirect href="/(auth)/landing" />;
} 