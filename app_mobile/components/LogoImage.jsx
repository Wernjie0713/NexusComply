import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function LogoImage({ size = 120, style }) {
  // Calculate dimensions based on the size prop
  const dimensions = {
    width: size,
    height: size,
  };

  return (
    <Image
      source={require('../assets/images/Logo.png')} 
      style={[styles.logo, dimensions, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
}); 