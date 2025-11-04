import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const user = auth().currentUser;
  const [name, setName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('bookings')
      .orderBy('checkIn', 'desc')
      .onSnapshot(snapshot => {
        setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
    return () => unsub();
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name required');
      return;
    }
    setSaving(true);
    try {
      await firestore().collection('users').doc(user.uid).update({ name });
      await user.updateProfile({ displayName: name });
      setEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await auth().signOut();
    navigation.replace('SignIn');
  };

  if (!user) return <View style={styles.container}><Text>Not signed in.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{email}</Text>
      <Text style={styles.label}>Name</Text>
      {editing ? (
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      ) : (
        <Text style={styles.value}>{name}</Text>
      )}
      <View style={styles.row}>
        {editing ? (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>My Bookings</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : bookings.length === 0 ? (
        <Text style={styles.noBookings}>No bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <Text style={styles.bookingHotel}>{item.hotelName}</Text>
              <Text style={styles.bookingDates}>
                {new Date(item.checkIn).toLocaleDateString()} - {new Date(item.checkOut).toLocaleDateString()}
              </Text>
              <Text style={styles.bookingRooms}>Rooms: {item.rooms}</Text>
              <Text style={styles.bookingTotal}>Total: ${item.totalCost}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 16, color: '#666', marginTop: 8 },
  value: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  editBtn: { backgroundColor: '#E0E0E0', padding: 12, borderRadius: 8, marginRight: 12 },
  editBtnText: { color: '#333', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#34C759', padding: 12, borderRadius: 8, marginRight: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#FF3B30', padding: 12, borderRadius: 8 },
  logoutBtnText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  noBookings: { color: '#999', fontStyle: 'italic', marginBottom: 20 },
  bookingCard: { backgroundColor: '#F5F5F5', padding: 16, borderRadius: 8, marginBottom: 12 },
  bookingHotel: { fontWeight: 'bold', fontSize: 16 },
  bookingDates: { color: '#666', marginVertical: 4 },
  bookingRooms: { color: '#333' },
  bookingTotal: { color: '#007AFF', fontWeight: 'bold' },
});
