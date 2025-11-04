

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, TextInput, ScrollView, Modal, Image } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || 'Guest User');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [stats, setStats] = useState({ totalBookings: 0, totalSpent: 0, favoriteLocation: 'N/A' });

  
  useEffect(() => {
    if (!user) {
      // Mock data for demo when no user is signed in
      const mockBookings = [
        {
          id: '1',
          hotelName: 'Sunset Resort',
          hotelLocation: 'Cape Town',
          checkIn: '2024-01-15',
          checkOut: '2024-01-18',
          rooms: 1,
          guests: 2,
          total: 3600,
          status: 'completed',
          roomType: { name: 'Deluxe Room' }
        },
        {
          id: '2',
          hotelName: 'Mountain Lodge',
          hotelLocation: 'Drakensberg',
          checkIn: '2024-02-10',
          checkOut: '2024-02-12',
          rooms: 1,
          guests: 2,
          total: 1900,
          status: 'upcoming',
          roomType: { name: 'Standard Room' }
        }
      ];
      setBookings(mockBookings);
      calculateStats(mockBookings);
      setBookingsLoading(false);
      return;
    }
    
    setBookingsLoading(true);
    const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(fetched);
      calculateStats(fetched);
      setBookingsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const calculateStats = (bookingsList) => {
    const totalBookings = bookingsList.length;
    const totalSpent = bookingsList.reduce((sum, booking) => sum + (booking.total || 0), 0);
    const locations = bookingsList.map(b => b.hotelLocation).filter(Boolean);
    const favoriteLocation = locations.length > 0 ? 
      locations.reduce((a, b, i, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      ) : 'N/A';
    
    setStats({ totalBookings, totalSpent, favoriteLocation });
  };

  
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    getDoc(userRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.name && !name) setName(data.name);
      }
    });
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) {
                await signOut(auth);
              }
              Alert.alert('Success', 'Logged out successfully');
            } catch (e) {
              Alert.alert('Logout failed', e.message);
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setLoading(true);
    try {
      if (user) {
        await updateProfile(user, { displayName: name });
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { name, email: user.email }, { merge: true });
      }
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      Alert.alert('Update failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'upcoming': return '#3498db';
      case 'cancelled': return '#e74c3c';
      default: return '#f39c12';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'upcoming': return 'Upcoming';
      case 'cancelled': return 'Cancelled';
      default: return 'Confirmed';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>{(name || 'G').charAt(0).toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.editImageBtn}>
            <Text style={styles.editImageText}>📷</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{name || 'Guest User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'guest@hotelbook.com'}</Text>
          <View style={styles.membershipBadge}>
            <Text style={styles.membershipText}>🏆 Gold Member</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalBookings}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>R{stats.totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.favoriteLocation}</Text>
          <Text style={styles.statLabel}>Favorite City</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setEditing(true)}>
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🎁</Text>
          <Text style={styles.actionText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.actionIcon}>🚪</Text>
          <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings Section */}
      <View style={styles.bookingsSection}>
        <Text style={styles.sectionTitle}>My Bookings</Text>
        {bookingsLoading ? (
          <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
        ) : bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏨</Text>
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>Start exploring amazing hotels!</Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingMainInfo}>
                    <Text style={styles.bookingHotel}>{item.hotelName}</Text>
                    <Text style={styles.bookingLocation}>📍 {item.hotelLocation}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                  </View>
                </View>
                
                <View style={styles.bookingDetails}>
                  <View style={styles.bookingRow}>
                    <Text style={styles.bookingLabel}>📅 Check-in:</Text>
                    <Text style={styles.bookingValue}>{new Date(item.checkIn).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.bookingRow}>
                    <Text style={styles.bookingLabel}>📅 Check-out:</Text>
                    <Text style={styles.bookingValue}>{new Date(item.checkOut).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.bookingRow}>
                    <Text style={styles.bookingLabel}>🏠 Room:</Text>
                    <Text style={styles.bookingValue}>{item.roomType?.name || 'Standard Room'}</Text>
                  </View>
                  <View style={styles.bookingRow}>
                    <Text style={styles.bookingLabel}>👥 Guests:</Text>
                    <Text style={styles.bookingValue}>{item.guests || item.rooms * 2}</Text>
                  </View>
                </View>
                
                <View style={styles.bookingFooter}>
                  <Text style={styles.bookingTotal}>Total: R{item.total?.toLocaleString()}</Text>
                  <TouchableOpacity style={styles.viewDetailsBtn}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={editing} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="#7f8c8d"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleEditProfile} 
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
  // Header Styles
  header: { backgroundColor: '#fff', padding: 24, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  profileImageContainer: { position: 'relative', marginRight: 20 },
  profileImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  profileInitial: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  editImageBtn: { position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center' },
  editImageText: { fontSize: 12 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#7f8c8d', marginBottom: 8 },
  membershipBadge: { backgroundColor: '#f39c12', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  membershipText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  
  // Stats Styles
  statsContainer: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, marginHorizontal: 4, alignItems: 'center', elevation: 2 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#7f8c8d', textAlign: 'center' },
  
  // Actions Styles
  actionsContainer: { padding: 16 },
  actionButton: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8, elevation: 1 },
  logoutButton: { backgroundColor: '#fdf2f2' },
  actionIcon: { fontSize: 20, marginRight: 12, width: 24 },
  actionText: { fontSize: 16, color: '#2c3e50', fontWeight: '500' },
  logoutText: { color: '#e74c3c' },
  
  // Bookings Styles
  bookingsSection: { padding: 16 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 16 },
  loader: { marginTop: 40 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#7f8c8d' },
  
  bookingCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  bookingMainInfo: { flex: 1 },
  bookingHotel: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  bookingLocation: { fontSize: 14, color: '#7f8c8d' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  
  bookingDetails: { marginBottom: 12 },
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  bookingLabel: { fontSize: 14, color: '#7f8c8d', flex: 1 },
  bookingValue: { fontSize: 14, color: '#2c3e50', fontWeight: '500', flex: 1, textAlign: 'right' },
  
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#ecf0f1' },
  bookingTotal: { fontSize: 16, fontWeight: 'bold', color: '#27ae60' },
  viewDetailsBtn: { backgroundColor: '#3498db', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  viewDetailsText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '90%', elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 2, borderColor: '#e9ecef', borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 16, backgroundColor: '#f8f9fa' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  cancelButton: { backgroundColor: '#ecf0f1' },
  saveButton: { backgroundColor: '#3498db' },
  cancelButtonText: { color: '#7f8c8d', fontWeight: 'bold' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
});
