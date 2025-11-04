import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function DealsScreen() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      // Fake Store API for demo "deals"
      const response = await axios.get('https://fakestoreapi.com/products?limit=5');
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Special Deals</Text>
      <FlatList
        data={deals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.dealTitle}>{item.title}</Text>
            <Text style={styles.price}>${item.price}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, marginBottom: 16 },
  image: { width: '100%', height: 150, borderRadius: 8, marginBottom: 12 },
  dealTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  price: { fontSize: 18, color: '#007AFF', fontWeight: 'bold' }
});
