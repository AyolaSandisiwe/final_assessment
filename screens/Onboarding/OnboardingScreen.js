import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
const onboardingData = [
  {
    key: '1',
    title: 'Browse Hotels',
    description: 'Find the best hotels at your destination.',
    image: { uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
  },
  {
    key: '2',
    title: 'Book Your Room',
    description: 'Easy booking with secure payment.',
    image: { uri: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400' },
  },
  {
    key: '3',
    title: 'Enjoy Your Stay',
    description: 'Experience comfort and luxury.',
    image: { uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' },
  },
];

export default function OnboardingScreen({ navigation, setShowOnboarding }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGetStarted = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      await AsyncStorage.setItem(`onboarded_${user.uid}`, 'true');
    }
    setShowOnboarding(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
          setCurrentIndex(index);
        }}
        keyExtractor={item => item.key}
      />
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, idx) => (
          <View key={idx} style={[styles.dot, currentIndex === idx && styles.activeDot]} />
        ))}
      </View>
      {currentIndex === onboardingData.length - 1 && (
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' },
  slide: { width: Dimensions.get('window').width, alignItems: 'center', padding: 30, justifyContent: 'center' },
  image: { width: 280, height: 200, marginBottom: 40, borderRadius: 15 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50', textAlign: 'center' },
  description: { fontSize: 18, color: '#7f8c8d', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20, lineHeight: 24 },
  dotsContainer: { flexDirection: 'row', marginBottom: 40, position: 'absolute', bottom: 120 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#bdc3c7', margin: 6 },
  activeDot: { backgroundColor: '#3498db', width: 30 },
  button: { backgroundColor: '#3498db', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 25, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, position: 'absolute', bottom: 50 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
