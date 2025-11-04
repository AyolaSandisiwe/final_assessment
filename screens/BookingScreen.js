
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView, Modal, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const roomTypes = [
  { id: 'standard', name: 'Standard Room', multiplier: 1, description: 'Basic amenities, comfortable stay' },
  { id: 'deluxe', name: 'Deluxe Room', multiplier: 1.3, description: 'Enhanced comfort with premium amenities' },
  { id: 'suite', name: 'Suite', multiplier: 1.8, description: 'Spacious suite with living area' },
  { id: 'presidential', name: 'Presidential Suite', multiplier: 2.5, description: 'Ultimate luxury experience' }
];

const addOns = [
  { id: 'breakfast', name: 'Breakfast', price: 150, description: 'Continental breakfast for 2' },
  { id: 'spa', name: 'Spa Package', price: 500, description: 'Relaxing spa treatment' },
  { id: 'airport', name: 'Airport Transfer', price: 200, description: 'Round trip airport shuttle' },
  { id: 'wifi', name: 'Premium WiFi', price: 50, description: 'High-speed internet access' }
];

const availableHotels = [
  {
    id: '1',
    name: 'Sunset Resort',
    location: 'Cape Town',
    rating: 4.5,
    price: 1200,
    image: { uri: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400' },
    amenities: ['Pool', 'Spa', 'WiFi', 'Restaurant'],
    description: 'Luxury beachfront resort with stunning ocean views'
  },
  {
    id: '2',
    name: 'Mountain Lodge',
    location: 'Drakensberg',
    rating: 4.8,
    price: 950,
    image: { uri: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' },
    amenities: ['Hiking', 'Fireplace', 'WiFi', 'Restaurant'],
    description: 'Cozy mountain retreat perfect for nature lovers'
  },
  {
    id: '3',
    name: 'City Inn',
    location: 'Johannesburg',
    rating: 4.2,
    price: 800,
    image: { uri: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
    amenities: ['Business Center', 'Gym', 'WiFi', 'Bar'],
    description: 'Modern city hotel in the heart of Johannesburg'
  },
  {
    id: '4',
    name: 'Safari Lodge',
    location: 'Kruger Park',
    rating: 4.9,
    price: 2200,
    image: { uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' },
    amenities: ['Game Drives', 'Spa', 'Pool', 'Restaurant'],
    description: 'Exclusive safari experience with luxury accommodations'
  },
  {
    id: '5',
    name: 'Beach Villa',
    location: 'Durban',
    rating: 4.6,
    price: 1500,
    image: { uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
    amenities: ['Private Beach', 'Pool', 'WiFi', 'Kitchen'],
    description: 'Private beachfront villa with exclusive access'
  }
];

export default function BookingScreen({ route, navigation }) {
  const initialHotel = route?.params?.hotel || availableHotels[0];
  const [selectedHotel, setSelectedHotel] = useState(initialHotel);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  
  console.log('BookingScreen rendered with dates:', {
    checkIn: checkIn.toLocaleDateString(),
    checkOut: checkOut.toLocaleDateString(),
    showCheckIn,
    showCheckOut
  });
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [selectedRoomType, setSelectedRoomType] = useState(roomTypes[0]);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const getNights = () => {
    const diff = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diff));
  };

  const getRoomPrice = () => {
    return selectedHotel.price * selectedRoomType.multiplier;
  };

  const getAddOnsTotal = () => {
    return selectedAddOns.reduce((total, addOn) => total + addOn.price, 0);
  };

  const getTotalPrice = () => {
    const nights = getNights();
    const roomTotal = getRoomPrice() * rooms * nights;
    const addOnsTotal = getAddOnsTotal() * nights;
    return roomTotal + addOnsTotal;
  };

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(item => item.id === addOn.id);
      if (exists) {
        return prev.filter(item => item.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const validateBooking = () => {
    if (checkOut <= checkIn) {
      Alert.alert('Invalid Dates', 'Check-out date must be after check-in date.');
      return false;
    }
    if (rooms < 1 || rooms > 10) {
      Alert.alert('Invalid Rooms', 'Please select between 1-10 rooms.');
      return false;
    }
    if (guests < 1 || guests > rooms * 4) {
      Alert.alert('Invalid Guests', `Maximum ${rooms * 4} guests allowed for ${rooms} room(s).`);
      return false;
    }
    if (!guestName.trim()) {
      Alert.alert('Missing Information', 'Please enter guest name.');
      return false;
    }
    if (!guestPhone.trim() || guestPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return false;
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateBooking()) return;
    
    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be signed in to book.');
      
      const bookingData = {
        userId: user.uid,
        hotelId: selectedHotel.id,
        hotelName: selectedHotel.name,
        hotelLocation: selectedHotel.location,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        nights: getNights(),
        rooms,
        guests,
        roomType: selectedRoomType,
        addOns: selectedAddOns,
        guestName,
        guestPhone,
        specialRequests,
        roomPrice: getRoomPrice(),
        addOnsTotal: getAddOnsTotal(),
        total: getTotalPrice(),
        status: 'confirmed',
        createdAt: new Date(),
      };
      
      await addDoc(collection(db, 'bookings'), bookingData);
      
      setShowConfirmation(false);
      Alert.alert(
        'Booking Confirmed! 🎉', 
        `Your reservation at ${selectedHotel.name} has been confirmed.\n\nBooking ID: ${Date.now()}\nTotal: R${getTotalPrice()}\n\nYou will receive a confirmation email shortly.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
      );
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Booking Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏨 Choose Your Hotel</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hotelScroll}>
          {availableHotels.map(hotel => (
            <TouchableOpacity
              key={hotel.id}
              style={[styles.hotelCard, selectedHotel.id === hotel.id && styles.selectedHotelCard]}
              onPress={() => setSelectedHotel(hotel)}
            >
              <Image source={hotel.image} style={styles.hotelCardImage} />
              <View style={styles.hotelCardInfo}>
                <Text style={styles.hotelCardName}>{hotel.name}</Text>
                <Text style={styles.hotelCardLocation}>📍 {hotel.location}</Text>
                <Text style={styles.hotelCardRating}>⭐ {hotel.rating}/5</Text>
                <Text style={styles.hotelCardPrice}>R{hotel.price}/night</Text>
                <Text style={styles.hotelCardDesc} numberOfLines={2}>{hotel.description}</Text>
                <View style={styles.amenitiesContainer}>
                  {hotel.amenities.slice(0, 2).map((amenity, index) => (
                    <Text key={index} style={styles.amenityTag}>{amenity}</Text>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.header}>
        <Image source={selectedHotel.image} style={styles.hotelImage} />
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{selectedHotel.name}</Text>
          <Text style={styles.hotelLocation}>📍 {selectedHotel.location}</Text>
          <Text style={styles.hotelRating}>⭐ {selectedHotel.rating}/5</Text>
          <Text style={styles.hotelPrice}>R{selectedHotel.price}/night</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Select Dates</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => {
              console.log('Check-in button pressed');
              setShowCheckIn(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.dateValue}>{checkIn.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => {
              console.log('Check-out button pressed');
              setShowCheckOut(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.dateValue}>{checkOut.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.nightsText}>{getNights()} night(s)</Text>
      </View>

      {/* Room & Guests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏨 Rooms & Guests</Text>
        <View style={styles.counterRow}>
          <View style={styles.counter}>
            <Text style={styles.counterLabel}>Rooms</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setRooms(Math.max(1, rooms - 1))}>
                <Text style={styles.counterBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{rooms}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setRooms(Math.min(10, rooms + 1))}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.counter}>
            <Text style={styles.counterLabel}>Guests</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setGuests(Math.max(1, guests - 1))}>
                <Text style={styles.counterBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{guests}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setGuests(Math.min(rooms * 4, guests + 1))}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Room Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛏️ Room Type</Text>
        {roomTypes.map(room => (
          <TouchableOpacity
            key={room.id}
            style={[styles.roomOption, selectedRoomType.id === room.id && styles.selectedRoom]}
            onPress={() => setSelectedRoomType(room)}
          >
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomDesc}>{room.description}</Text>
            </View>
            <Text style={styles.roomPrice}>R{Math.round(selectedHotel.price * room.multiplier)}/night</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add-ons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Add-ons</Text>
        {addOns.map(addOn => (
          <TouchableOpacity
            key={addOn.id}
            style={[styles.addOnOption, selectedAddOns.find(item => item.id === addOn.id) && styles.selectedAddOn]}
            onPress={() => toggleAddOn(addOn)}
          >
            <View style={styles.addOnInfo}>
              <Text style={styles.addOnName}>{addOn.name}</Text>
              <Text style={styles.addOnDesc}>{addOn.description}</Text>
            </View>
            <Text style={styles.addOnPrice}>+R{addOn.price}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Guest Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Guest Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          value={guestName}
          onChangeText={setGuestName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number *"
          value={guestPhone}
          onChangeText={setGuestPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Special Requests (Optional)"
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Price Summary */}
      <View style={styles.priceSection}>
        <Text style={styles.sectionTitle}>💰 Price Summary</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{selectedRoomType.name} x {rooms} x {getNights()} nights</Text>
          <Text style={styles.priceValue}>R{Math.round(getRoomPrice() * rooms * getNights())}</Text>
        </View>
        {selectedAddOns.map(addOn => (
          <View key={addOn.id} style={styles.priceRow}>
            <Text style={styles.priceLabel}>{addOn.name} x {getNights()} nights</Text>
            <Text style={styles.priceValue}>R{addOn.price * getNights()}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>R{getTotalPrice()}</Text>
        </View>
      </View>

      {/* Book Button */}
      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Text style={styles.bookButtonText}>Book Now - R{getTotalPrice()}</Text>
      </TouchableOpacity>

      {/* Date Pickers */}
      {showCheckIn && (
        <DateTimePicker
          value={checkIn}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            console.log('Check-in date changed:', selectedDate);
            setShowCheckIn(false);
            if (selectedDate && event.type !== 'dismissed') {
              setCheckIn(selectedDate);
              // Auto-adjust checkout if needed
              if (selectedDate >= checkOut) {
                const nextDay = new Date(selectedDate.getTime() + 86400000);
                setCheckOut(nextDay);
                console.log('Auto-adjusted checkout to:', nextDay);
              }
            }
          }}
        />
      )}
      {showCheckOut && (
        <DateTimePicker
          value={checkOut}
          mode="date"
          display="default"
          minimumDate={new Date(checkIn.getTime() + 86400000)}
          onChange={(event, selectedDate) => {
            console.log('Check-out date changed:', selectedDate);
            setShowCheckOut(false);
            if (selectedDate && event.type !== 'dismissed') {
              setCheckOut(selectedDate);
            }
          }}
        />
      )}

      {/* Confirmation Modal */}
      <Modal visible={showConfirmation} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Your Booking</Text>
            <Text style={styles.modalText}>{selectedHotel.name}</Text>
            <Text style={styles.modalText}>{checkIn.toLocaleDateString()} - {checkOut.toLocaleDateString()}</Text>
            <Text style={styles.modalText}>{rooms} room(s), {guests} guest(s)</Text>
            <Text style={styles.modalText}>{selectedRoomType.name}</Text>
            <Text style={styles.modalTotal}>Total: R{getTotalPrice()}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfirmation(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmBooking} disabled={loading}>
                <Text style={styles.confirmButtonText}>{loading ? 'Booking...' : 'Confirm'}</Text>
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
  header: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, marginBottom: 8, elevation: 2 },
  hotelImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  hotelInfo: { flex: 1, justifyContent: 'center' },
  hotelName: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  hotelLocation: { fontSize: 14, color: '#7f8c8d', marginBottom: 2 },
  hotelRating: { fontSize: 14, color: '#f39c12', fontWeight: 'bold' },
  hotelPrice: { fontSize: 16, color: '#27ae60', fontWeight: 'bold', marginTop: 4 },
  
  hotelScroll: { marginTop: 8 },
  hotelCard: { width: 280, backgroundColor: '#fff', borderRadius: 12, marginRight: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  selectedHotelCard: { borderWidth: 3, borderColor: '#3498db' },
  hotelCardImage: { width: '100%', height: 140, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  hotelCardInfo: { padding: 12 },
  hotelCardName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  hotelCardLocation: { fontSize: 12, color: '#7f8c8d', marginBottom: 2 },
  hotelCardRating: { fontSize: 12, color: '#f39c12', fontWeight: 'bold', marginBottom: 4 },
  hotelCardPrice: { fontSize: 14, color: '#27ae60', fontWeight: 'bold', marginBottom: 6 },
  hotelCardDesc: { fontSize: 11, color: '#7f8c8d', marginBottom: 8, lineHeight: 14 },
  amenitiesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  amenityTag: { fontSize: 10, backgroundColor: '#ecf0f1', color: '#7f8c8d', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginRight: 4, marginBottom: 2 },
  
  section: { backgroundColor: '#fff', marginBottom: 8, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 },
  
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateButton: { flex: 1, backgroundColor: '#3498db', padding: 16, borderRadius: 12, marginHorizontal: 6, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  dateLabel: { fontSize: 12, color: '#ecf0f1', marginBottom: 4, fontWeight: '500' },
  dateValue: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  nightsText: { textAlign: 'center', marginTop: 8, color: '#7f8c8d', fontStyle: 'italic' },
  
  counterRow: { flexDirection: 'row', justifyContent: 'space-around' },
  counter: { alignItems: 'center' },
  counterLabel: { fontSize: 14, color: '#7f8c8d', marginBottom: 8 },
  counterControls: { flexDirection: 'row', alignItems: 'center' },
  counterBtn: { width: 36, height: 36, backgroundColor: '#3498db', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  counterBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  counterValue: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16, minWidth: 30, textAlign: 'center' },
  
  roomOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#ecf0f1' },
  selectedRoom: { backgroundColor: '#e8f4fd', borderWidth: 2, borderColor: '#3498db' },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  roomDesc: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  roomPrice: { fontSize: 14, fontWeight: 'bold', color: '#27ae60' },
  
  addOnOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#ecf0f1' },
  selectedAddOn: { backgroundColor: '#e8f8f5', borderWidth: 2, borderColor: '#27ae60' },
  addOnInfo: { flex: 1 },
  addOnName: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  addOnDesc: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  addOnPrice: { fontSize: 12, fontWeight: 'bold', color: '#27ae60' },
  
  input: { borderWidth: 1, borderColor: '#e9ecef', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#fff', fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  
  priceSection: { backgroundColor: '#fff', marginBottom: 8, padding: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#7f8c8d', flex: 1 },
  priceValue: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e9ecef', marginTop: 8 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
  
  bookButton: { backgroundColor: '#27ae60', margin: 16, padding: 18, borderRadius: 12, alignItems: 'center', elevation: 3 },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '90%', elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginBottom: 16 },
  modalText: { fontSize: 14, color: '#7f8c8d', textAlign: 'center', marginBottom: 8 },
  modalTotal: { fontSize: 18, fontWeight: 'bold', color: '#27ae60', textAlign: 'center', marginVertical: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { flex: 1, backgroundColor: '#e74c3c', padding: 12, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  confirmButton: { flex: 1, backgroundColor: '#27ae60', padding: 12, borderRadius: 8, marginLeft: 8, alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontWeight: 'bold' },
});
