import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Define our primary green color for consistent use
const PRIMARY_GREEN = '#4CAF50';
const INACTIVE_COLOR = '#777777';

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#333333',
        tabBarActiveTintColor: PRIMARY_GREEN,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#eeeeee',
          borderTopWidth: 1,
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          // Determine icon based on route name and focused state
          if (route.name === 'dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'audits') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBar: ({ state, descriptors, navigation }) => {
          return (
            <View style={[styles.tabBarContainer, { height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
              {state.routes.map((route, index) => {
                // Only render tabs for our three main routes
                if (!['dashboard', 'audits', 'profile'].includes(route.name)) {
                  return null;
                }
                
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel || options.title || route.name;
                const isFocused = state.index === index;
                
                const onPress = () => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };
                
                let iconName;
                if (route.name === 'dashboard') {
                  iconName = isFocused ? 'home' : 'home-outline';
                } else if (route.name === 'audits') {
                  iconName = isFocused ? 'list' : 'list-outline';
                } else if (route.name === 'profile') {
                  iconName = isFocused ? 'person' : 'person-outline';
                }
                
                const color = isFocused ? PRIMARY_GREEN : INACTIVE_COLOR;
                
                return (
                  <View key={route.key} style={styles.tabItem}>
                    <View 
                      style={styles.tabButton}
                      onTouchEnd={onPress}
                    >
                      <Ionicons name={iconName} size={24} color={color} />
                      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        },
      })}
    >
      <Tabs.Screen 
        name="audits" 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Audits',
        }} 
      />
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Dashboard',
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Profile',
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopColor: '#eeeeee',
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  }
});