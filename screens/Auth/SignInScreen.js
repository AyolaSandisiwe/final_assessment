
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('SignIn screen mounted');
    console.log('Auth object:', auth);
    console.log('Current user:', auth.currentUser);
  }, []);

  const handleSignIn = async () => {
    console.log('Sign in button pressed');
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    console.log('Attempting to sign in with:', email);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', result.user.uid);
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to HotelBook</Text>
      <Text style={styles.subtitle}>Find and book your perfect stay</Text>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={() => {
          console.log('Button touched');
          handleSignIn();
        }} 
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 20 },
  welcome: { fontSize: 32, fontWeight: 'bold', color: '#3498db', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginBottom: 40, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#2c3e50' },
  input: { width: '100%', borderWidth: 2, borderColor: '#e9ecef', borderRadius: 12, padding: 18, marginBottom: 20, backgroundColor: '#fff', fontSize: 16 },
  button: { backgroundColor: '#3498db', padding: 18, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 15, elevation: 3 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: { color: '#3498db', marginTop: 15, fontSize: 16, fontWeight: '500' },
});
