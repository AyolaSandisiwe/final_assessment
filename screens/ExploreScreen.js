
import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';

const initialHotels = [
  {
    id: '1',
    name: 'Sunset Resort',
    location: 'Cape Town',
    rating: 4.5,
    price: 1200,
    image: { uri: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400' },
  },
  {
    id: '2',
    name: 'Mountain Lodge',
    location: 'Drakensberg',
    rating: 4.8,
    price: 950,
    image: { uri: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' },
  },
  {
    id: '3',
    name: 'City Inn',
    location: 'Johannesburg',
    rating: 4.2,
    price: 800,
    image: { uri: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
  },
  {
    id: '4',
    name: 'Safari Lodge',
    location: 'Kruger Park',
    rating: 4.9,
    price: 2200,
    image: { uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' },
  },
  {
    id: '5',
    name: 'Beach Villa',
    location: 'Durban',
    rating: 4.6,
    price: 1500,
    image: { uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
  },
  {
    id: '6',
    name: 'Garden Hotel',
    location: 'Cape Town',
    rating: 4.3,
    price: 1100,
    image: { uri: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400' },
  },
  {
    id: '7',
    name: 'Business Center',
    location: 'Johannesburg',
    rating: 4.1,
    price: 900,
    image: { uri: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
  },
  {
    id: '8',
    name: 'Coastal Resort',
    location: 'Durban',
    rating: 4.7,
    price: 1800,
    image: { uri: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400' },
  },
];

export default function ExploreScreen({ navigation }) {
  const [hotels, setHotels] = useState(initialHotels);
  const [filteredHotels, setFilteredHotels] = useState(initialHotels);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');

  const getUniqueLocations = () => {
    const locations = [...new Set(initialHotels.map(hotel => hotel.location))];
    return ['All', ...locations];
  };

  const filterAndSortHotels = (query = searchQuery, location = selectedLocation, sortType = sortBy) => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...initialHotels];
      
      // Filter by search query
      if (query.trim()) {
        filtered = filtered.filter(hotel => 
          hotel.name.toLowerCase().includes(query.toLowerCase()) ||
          hotel.location.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      // Filter by location
      if (location !== 'All') {
        filtered = filtered.filter(hotel => hotel.location === location);
      }
      
      // Sort hotels
      if (sortType === 'price') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortType === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sortType === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      setFilteredHotels(filtered);
      setLoading(false);
    }, 300);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterAndSortHotels(query, selectedLocation, sortBy);
  };

  const handleLocationFilter = (location) => {
    setSelectedLocation(location);
    filterAndSortHotels(searchQuery, location, sortBy);
  };

  const handleSort = (type) => {
    setSortBy(type);
    filterAndSortHotels(searchQuery, selectedLocation, type);
  };

  const renderHotel = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('HotelDetails', { hotel: item })}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>📍 {item.location}</Text>
        <Text style={styles.rating}>⭐ {item.rating} / 5</Text>
        <Text style={styles.price}>R{item.price} / night</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Hotels</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search hotels or locations..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#7f8c8d"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>
      
      {/* Location Filter */}
      <View style={styles.locationContainer}>
        <Text style={styles.filterLabel}>Locations:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={getUniqueLocations()}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.locationChip, selectedLocation === item && styles.activeLocationChip]}
              onPress={() => handleLocationFilter(item)}
            >
              <Text style={[styles.locationText, selectedLocation === item && styles.activeLocationText]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.locationList}
        />
      </View>
      
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.filterLabel}>Sort by:</Text>
        <View style={styles.sortRow}>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'price' && styles.activeSort]} 
            onPress={() => handleSort('price')}
          >
            <Text style={[styles.sortText, sortBy === 'price' && styles.activeSortText]}>💰 Price</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'rating' && styles.activeSort]} 
            onPress={() => handleSort('rating')}
          >
            <Text style={[styles.sortText, sortBy === 'rating' && styles.activeSortText]}>⭐ Rating</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'name' && styles.activeSort]} 
            onPress={() => handleSort('name')}
          >
            <Text style={[styles.sortText, sortBy === 'name' && styles.activeSortText]}>🔤 Name</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 30 }} />
      ) : filteredHotels.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏨</Text>
          <Text style={styles.emptyText}>No hotels found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultsCount}>{filteredHotels.length} hotel(s) found</Text>
          <FlatList
            data={filteredHotels}
            renderItem={renderHotel}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50', textAlign: 'center' },
  
  // Search Styles
  searchContainer: { position: 'relative', marginBottom: 20 },
  searchInput: { backgroundColor: '#fff', borderRadius: 12, padding: 16, paddingRight: 50, fontSize: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  searchIcon: { position: 'absolute', right: 16, top: 16, fontSize: 20 },
  
  // Location Filter Styles
  locationContainer: { marginBottom: 20 },
  filterLabel: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  locationList: { paddingVertical: 5 },
  locationChip: { backgroundColor: '#ecf0f1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  activeLocationChip: { backgroundColor: '#3498db' },
  locationText: { fontSize: 14, color: '#7f8c8d', fontWeight: '500' },
  activeLocationText: { color: '#fff' },
  
  // Sort Styles
  sortContainer: { marginBottom: 20 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sortButton: { flex: 1, backgroundColor: '#ecf0f1', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginHorizontal: 2, alignItems: 'center' },
  activeSort: { backgroundColor: '#27ae60' },
  sortText: { fontSize: 12, fontWeight: '600', color: '#7f8c8d' },
  activeSortText: { color: '#fff' },
  
  // Results Styles
  resultsCount: { fontSize: 14, color: '#7f8c8d', marginBottom: 15, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#7f8c8d', textAlign: 'center' },
  
  // Hotel Card Styles
  card: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  info: { padding: 20 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  location: { fontSize: 16, color: '#7f8c8d', marginBottom: 8, fontWeight: '500' },
  rating: { fontSize: 16, color: '#f39c12', marginBottom: 8, fontWeight: 'bold' },
  price: { fontSize: 20, color: '#27ae60', fontWeight: 'bold' },
});
