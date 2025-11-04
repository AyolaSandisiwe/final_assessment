

import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import axios from 'axios';


export default function HotelDetailsScreen({ route, navigation }) {
  const { hotel } = route.params;
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'reviews'),
      where('hotelId', '==', hotel.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(fetched);
      if (user) {
        setHasReviewed(fetched.some(r => r.userId === user.uid));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [hotel.id, user]);

  useEffect(() => {
    const city = hotel.location || 'Cape Town';
    setWeatherLoading(true);
    setWeatherError(null);
    const apiKey = '7b47dafa31e43b2a859b12ff73c163e4'; 
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
      .then(res => {
        setWeather(res.data);
        setWeatherError(null);
      })
      .catch(() => {
        setWeatherError('Weather unavailable');
      })
      .finally(() => setWeatherLoading(false));
  }, [hotel.location]);

  const handleAddReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert('Please enter review text.');
      return;
    }
    try {
      await addDoc(collection(db, 'reviews'), {
        hotelId: hotel.id,
        userId: user ? user.uid : '',
        user: user ? user.email : 'Anonymous',
        rating: reviewRating,
        text: reviewText,
        createdAt: new Date(),
      });
      setHasReviewed(true);
      setShowModal(false);
      setReviewText('');
      setReviewRating(5);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to book.');
      return;
    }
    navigation.navigate('Booking', { hotel });
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={hotel.image} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.location}>{hotel.location}</Text>
        <Text style={styles.rating}>⭐ {hotel.rating}</Text>
        <Text style={styles.price}>R{hotel.price} / night</Text>
        <View style={styles.weatherBox}>
          <Text style={styles.weatherTitle}>Current Weather</Text>
          {weatherLoading ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : weatherError ? (
            <Text style={{ color: 'red' }}>{weatherError}</Text>
          ) : weather ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.weatherTemp}>{Math.round(weather.main.temp)}°C</Text>
              <Text style={styles.weatherDesc}>  {weather.weather[0].main}</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleBookNow}>
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsTitle}>Reviews</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
        ) : reviews.length === 0 ? (
          <Text style={styles.noReviews}>No reviews yet.</Text>
        ) : (
          reviews.map(r => (
            <View key={r.id} style={styles.reviewCard}>
              <Text style={styles.reviewUser}>{r.user}</Text>
              <Text style={styles.reviewRating}>⭐ {r.rating}</Text>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>
          ))
        )}
        {!hasReviewed && user && (
          <TouchableOpacity style={styles.addReviewBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.addReviewText}>Add Review</Text>
          </TouchableOpacity>
        )}
        {hasReviewed && <Text style={styles.thankYou}>Thanks for your review!</Text>}
      </View>
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Review</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Write your review..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
            />
            <Text style={{ marginTop: 10 }}>Rating:</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {[1,2,3,4,5].map(num => (
                <TouchableOpacity key={num} onPress={() => setReviewRating(num)}>
                  <Text style={{ fontSize: 28, color: reviewRating >= num ? '#f1c40f' : '#ccc' }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleAddReview}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={{ color: '#007bff', marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  weatherBox: { backgroundColor: '#e8f4fd', borderRadius: 12, padding: 15, marginBottom: 15, marginTop: 15, borderLeftWidth: 4, borderLeftColor: '#3498db' },
  weatherTitle: { fontWeight: 'bold', marginBottom: 8, fontSize: 16, color: '#2c3e50' },
  weatherTemp: { fontSize: 20, fontWeight: 'bold', color: '#3498db' },
  weatherDesc: { fontSize: 16, color: '#7f8c8d', textTransform: 'capitalize' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  image: { width: '100%', height: 280, resizeMode: 'cover' },
  info: { padding: 20, backgroundColor: '#fff', marginTop: -20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  name: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#2c3e50' },
  location: { fontSize: 16, color: '#7f8c8d', marginBottom: 8, fontWeight: '500' },
  rating: { fontSize: 16, color: '#f39c12', marginBottom: 8, fontWeight: 'bold' },
  price: { fontSize: 24, color: '#27ae60', fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#3498db', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 15, elevation: 3 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  reviewsSection: { padding: 20, backgroundColor: '#fff', marginTop: 10 },
  reviewsTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50' },
  noReviews: { color: '#95a5a6', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  reviewCard: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 15, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#3498db' },
  reviewUser: { fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  reviewRating: { color: '#f39c12', marginBottom: 6 },
  reviewText: { color: '#7f8c8d', lineHeight: 20 },
  addReviewBtn: { backgroundColor: '#27ae60', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15, elevation: 2 },
  addReviewText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  thankYou: { color: '#27ae60', marginTop: 15, fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 15, width: '90%', elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50', textAlign: 'center' },
  modalInput: { borderWidth: 2, borderColor: '#e9ecef', borderRadius: 10, padding: 15, minHeight: 80, marginBottom: 15, fontSize: 16 },
});
