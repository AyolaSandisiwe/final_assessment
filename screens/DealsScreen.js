import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import axios from 'axios';

export default function DealsScreen() {
  const [featuredDeals, setFeaturedDeals] = useState([]);
  const [travelTips, setTravelTips] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    try {
      setError(null);
      
      const dealsResponse = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=6');
      const transformedDeals = dealsResponse.data.map((post, index) => ({
        id: post.id,
        title: `${['Luxury Resort', 'Beach Hotel', 'Mountain Lodge', 'City Center Inn', 'Safari Lodge', 'Spa Resort'][index]} - ${post.title.split(' ').slice(0, 3).join(' ')}`,
        description: post.body.substring(0, 100) + '...',
        price: Math.floor(Math.random() * 2000) + 500,
        discount: Math.floor(Math.random() * 50) + 10,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        location: ['Cape Town', 'Durban', 'Johannesburg', 'Port Elizabeth', 'Kruger Park', 'Hermanus'][index],
        image: `https://picsum.photos/400/300?random=${post.id}`,
        originalPrice: Math.floor(Math.random() * 2000) + 1000
      }));
      setFeaturedDeals(transformedDeals);
      
      const tipsResponse = await axios.get('https://jsonplaceholder.typicode.com/comments?_limit=4');
      const transformedTips = tipsResponse.data.map((comment, index) => ({
        id: comment.id,
        title: ['Best Time to Visit', 'Packing Tips', 'Local Cuisine Guide', 'Safety Tips'][index],
        content: comment.body.substring(0, 80) + '...',
        author: comment.name,
        icon: ['🌅', '🎒', '🍽️', '🛡️'][index]
      }));
      setTravelTips(transformedTips);
      const cities = ['Cape Town', 'Johannesburg', 'Durban'];
      const weatherPromises = cities.map(city => 
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=7b47dafa31e43b2a859b12ff73c163e4&units=metric`)
          .catch(() => null)
      );
      const weatherResponses = await Promise.all(weatherPromises);
      const weatherInfo = weatherResponses
        .filter(response => response !== null)
        .map(response => ({
          city: response.data.name,
          temp: Math.round(response.data.main.temp),
          description: response.data.weather[0].main,
          icon: response.data.weather[0].icon
        }));
      setWeatherData(weatherInfo);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load deals. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading amazing deals...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😞</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAllData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3498db']} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exclusive Deals 🎆</Text>
        <Text style={styles.headerSubtitle}>Discover amazing hotel offers</Text>
      </View>

      {weatherData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌤️ Weather Updates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {weatherData.map((weather, index) => (
              <View key={index} style={styles.weatherCard}>
                <Text style={styles.weatherCity}>{weather.city}</Text>
                <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                <Text style={styles.weatherDesc}>{weather.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎆 Featured Deals</Text>
        <FlatList
          data={featuredDeals}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.dealCard}>
              <Image source={{ uri: item.image }} style={styles.dealImage} />
              <View style={styles.dealBadge}>
                <Text style={styles.dealBadgeText}>{item.discount}% OFF</Text>
              </View>
              <View style={styles.dealInfo}>
                <Text style={styles.dealTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.dealLocation}>📍 {item.location}</Text>
                <Text style={styles.dealRating}>⭐ {item.rating}/5</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>R{item.originalPrice}</Text>
                  <Text style={styles.dealPrice}>R{item.price}</Text>
                </View>
                <Text style={styles.dealDescription} numberOfLines={2}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Travel Tips</Text>
        <FlatList
          data={travelTips}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.tipCard}>
              <Text style={styles.tipIcon}>{item.icon}</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{item.title}</Text>
                <Text style={styles.tipText}>{item.content}</Text>
                <Text style={styles.tipAuthor}>By {item.author}</Text>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🎁</Text>
            <Text style={styles.actionText}>Loyalty Program</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={styles.actionText}>Mobile App</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
  // Loading & Error States
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#7f8c8d' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 16, color: '#e74c3c', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#3498db', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  
  // Header
  header: { backgroundColor: '#3498db', padding: 24, paddingTop: 40 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: '#ecf0f1' },
  
  // Sections
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 16, paddingHorizontal: 16 },
  
  // Weather Cards
  weatherCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginRight: 12, marginLeft: 16, alignItems: 'center', minWidth: 100, elevation: 2 },
  weatherCity: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  weatherTemp: { fontSize: 20, fontWeight: 'bold', color: '#3498db', marginBottom: 2 },
  weatherDesc: { fontSize: 12, color: '#7f8c8d', textAlign: 'center' },
  
  // Deal Cards
  dealCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, marginHorizontal: 16, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  dealImage: { width: '100%', height: 200, resizeMode: 'cover' },
  dealBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#e74c3c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  dealBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  dealInfo: { padding: 16 },
  dealTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  dealLocation: { fontSize: 14, color: '#7f8c8d', marginBottom: 4 },
  dealRating: { fontSize: 14, color: '#f39c12', marginBottom: 8, fontWeight: 'bold' },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  originalPrice: { fontSize: 14, color: '#95a5a6', textDecorationLine: 'line-through', marginRight: 8 },
  dealPrice: { fontSize: 20, fontWeight: 'bold', color: '#27ae60' },
  dealDescription: { fontSize: 14, color: '#7f8c8d', lineHeight: 20 },
  
  // Tip Cards
  tipCard: { backgroundColor: '#fff', flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 12, marginHorizontal: 16, elevation: 2 },
  tipIcon: { fontSize: 24, marginRight: 16, width: 32 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  tipText: { fontSize: 14, color: '#7f8c8d', marginBottom: 4, lineHeight: 18 },
  tipAuthor: { fontSize: 12, color: '#95a5a6', fontStyle: 'italic' },
  
  // Action Grid
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  actionCard: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, marginRight: '2%', alignItems: 'center', elevation: 2 },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionText: { fontSize: 12, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
});
