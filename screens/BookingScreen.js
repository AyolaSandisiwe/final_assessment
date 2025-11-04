
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function BookingScreen({ route, navigation }) {
  const { hotel } = route.params;
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [loading, setLoading] = useState(false);

  const getNights = () => {
    const diff = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diff));
  };
  const totalCost = getNights() * hotel.price * rooms;

  const handleBooking = async () => {
    if (checkOut <= checkIn) {
      Alert.alert('Error', 'Check-out must be after check-in');
      return;
    }
    if (rooms < 1) {
      Alert.alert('Error', 'At least one room required');
      return;
    }
    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not signed in');
      const booking = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        rooms,
        totalCost,
        createdAt: new Date().toISOString(),
      };
      await firestore().collection('users').doc(user.uid).collection('bookings').add(booking);
      setLoading(false);
      Alert.alert('Success', 'Booking confirmed!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      setLoading(false);
      Alert.alert('Booking Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book {hotel.name}</Text>
      <Text style={styles.label}>Check-in Date</Text>
      <TouchableOpacity onPress={() => setShowCheckIn(true)} style={styles.dateBtn}>
        <Text>{checkIn.toDateString()}</Text>
      </TouchableOpacity>
      {showCheckIn && (
        <DateTimePicker
          value={checkIn}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowCheckIn(false);
            if (date) setCheckIn(date);
          }}
        />
      )}
      <Text style={styles.label}>Check-out Date</Text>
      <TouchableOpacity onPress={() => setShowCheckOut(true)} style={styles.dateBtn}>
        <Text>{checkOut.toDateString()}</Text>
      </TouchableOpacity>
      {showCheckOut && (
        <DateTimePicker
          value={checkOut}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowCheckOut(false);
            if (date) setCheckOut(date);
          }}
        />
      )}
      <Text style={styles.label}>Number of Rooms</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setRooms(Math.max(1, rooms - 1))} style={styles.roomBtn}><Text>-</Text></TouchableOpacity>
        <Text style={styles.roomCount}>{rooms}</Text>
        <TouchableOpacity onPress={() => setRooms(rooms + 1)} style={styles.roomBtn}><Text>+</Text></TouchableOpacity>
      </View>
      <Text style={styles.label}>Total Cost</Text>
      <Text style={styles.total}>${totalCost}</Text>
      <TouchableOpacity style={styles.bookBtn} onPress={handleBooking} disabled={loading}>
        <Text style={styles.bookBtnText}>{loading ? 'Booking...' : 'Confirm Booking'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 16, marginTop: 16, marginBottom: 8 },
  dateBtn: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  roomBtn: { backgroundColor: '#E0E0E0', padding: 12, borderRadius: 8, marginHorizontal: 16 },
  roomCount: { fontSize: 18, fontWeight: 'bold' },
  total: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 24 },
  bookBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  bookBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

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
});
