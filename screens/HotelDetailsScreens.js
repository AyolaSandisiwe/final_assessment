import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';


export default function HotelDetailsScreen({ route, navigation }) {
  const { hotel } = route.params;
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const user = auth().currentUser;

  useEffect(() => {
    fetchWeather();
    const unsubscribe = firestore()
      .collection('hotels')
      .doc(hotel.id)
      .collection('reviews')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(data);
        setLoadingReviews(false);
        if (user) {
          setHasReviewed(data.some(r => r.userId === user.uid));
        }
      });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, [hotel.id, user]);

  const fetchWeather = async () => {
    try {
      const location = hotel.location.split(',')[0];
      const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your OpenWeatherMap API key
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
    } catch (error) {
      setWeather(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  const addReview = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to add a review');
      return;
    }
    if (!newReview.trim()) {
      Alert.alert('Error', 'Please enter a review');
      return;
    }
    if (hasReviewed) {
      Alert.alert('Error', 'You have already reviewed this hotel');
      return;
    }
    setSubmitting(true);
    try {
      await firestore()
        .collection('hotels')
        .doc(hotel.id)
        .collection('reviews')
        .add({
          userId: user.uid,
          user: user.displayName || user.email,
          rating,
          text: newReview,
          createdAt: new Date().toISOString(),
        });
      setNewReview('');
      setRating(5);
      setHasReviewed(true);
      Alert.alert('Success', 'Review added!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSubmitting(false);
  };


  return (
    <ScrollView style={styles.container}>
      <Image source={hotel.image} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.location}>{hotel.location}</Text>
        <Text style={styles.rating}>⭐ {hotel.rating}</Text>
        <Text style={styles.price}>${hotel.price} per night</Text>
        <Text style={styles.description}>{hotel.description}</Text>

        {/* Weather Section */}
        {loadingWeather ? (
          <ActivityIndicator size="small" color="#007AFF" style={{ marginBottom: 16 }} />
        ) : weather ? (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherTitle}>Current Weather</Text>
            <Text style={styles.weatherText}>
              {weather.weather[0].description} • {Math.round(weather.main.temp)}°C
            </Text>
            <Text style={styles.weatherDetail}>
              Feels like {Math.round(weather.main.feels_like)}°C
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => {
            if (!user) {
              Alert.alert('Error', 'Please sign in to book');
              return;
            }
            navigation.navigate('Booking', { hotel });
          }}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
        {loadingReviews ? (
          <ActivityIndicator size="small" color="#007AFF" style={{ marginBottom: 16 }} />
        ) : reviews.length === 0 ? (
          <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <Text style={styles.reviewUser}>{review.user}</Text>
              <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))
        )}

        {!hasReviewed && user && (
          <>
            <Text style={styles.sectionTitle}>Add Your Review</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Write your review..."
              value={newReview}
              onChangeText={setNewReview}
              multiline
            />
            <TouchableOpacity style={styles.addReviewBtn} onPress={addReview} disabled={submitting}>
              <Text style={styles.addReviewBtnText}>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
            </TouchableOpacity>
          </>
        )}
        {hasReviewed && user && (
          <Text style={{ color: '#34C759', marginTop: 12, fontWeight: 'bold' }}>Thanks for your review!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 300 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  location: { fontSize: 16, color: '#666', marginBottom: 8 },
  rating: { fontSize: 16, marginBottom: 8 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 16 },
  description: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
  bookBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 32 },
  bookBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 16 },
  noReviews: { color: '#999', fontStyle: 'italic', marginBottom: 20 },
  reviewCard: { backgroundColor: '#F5F5F5', padding: 16, borderRadius: 8, marginBottom: 12 },
  reviewUser: { fontWeight: 'bold', marginBottom: 4 },
  reviewRating: { color: '#FF9800', marginBottom: 8 },
  reviewText: { color: '#333' },
  ratingSelector: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  star: { fontSize: 32 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 16, minHeight: 80 },
  addReviewBtn: { backgroundColor: '#34C759', padding: 12, borderRadius: 8, alignItems: 'center' },
  addReviewBtnText: { color: '#fff', fontWeight: 'bold' }
  weatherCard: {
  backgroundColor: '#E3F2FD',
  padding: 16,
  borderRadius: 12,
  marginBottom: 20,
    },
  weatherTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 8,
  color: '#333',
   },
weatherText: {
  fontSize: 18,
  color: '#007AFF',
  textTransform: 'capitalize',
},
 weatherDetail: {
  fontSize: 14,
  color: '#666',
  marginTop: 4,
},
});

