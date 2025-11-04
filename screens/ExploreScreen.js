import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { hotels } from './data';

export default function ExploreScreen({ navigation }) {
  const [sortedHotels, setSortedHotels] = useState(hotels);

  const sortByPrice = () => {
    setSortedHotels([...hotels].sort((a, b) => a.price - b.price));
  };

  const sortByRating = () => {
    setSortedHotels([...hotels].sort((a, b) => b.rating - a.rating));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Hotels</Text>
      
      <View style={styles.filterRow}>
        <TouchableOpacity onPress={sortByRating} style={styles.filterBtn}>
          <Text>Sort by Rating</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={sortByPrice} style={styles.filterBtn}>
          <Text>Sort by Price</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedHotels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('HotelDetails', { hotel: item })}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.hotelName}>{item.name}</Text>
            <Text style={styles.location}>{item.location}</Text>
            <View style={styles.row}>
              <Text>⭐ {item.rating}</Text>
              <Text style={styles.price}>${item.price}/night</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterBtn: { padding: 10, backgroundColor: '#E0E0E0', borderRadius: 8 },
  card: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, marginBottom: 16 },
  image: { width: '100%', height: 180, borderRadius: 8, marginBottom: 12 },
  hotelName: { fontSize: 18, fontWeight: 'bold' },
  location: { color: '#666', marginVertical: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  price: { fontWeight: 'bold', color: '#007AFF' }
});
