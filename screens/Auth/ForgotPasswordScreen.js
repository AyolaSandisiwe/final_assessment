
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Password Reset', 'Check your email for reset instructions.');
      navigation.replace('SignIn');
    } catch (error) {
      Alert.alert('Reset Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Reset Password'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.link}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, color: '#2c3e50' },
  input: { width: '100%', borderWidth: 2, borderColor: '#e9ecef', borderRadius: 12, padding: 18, marginBottom: 20, backgroundColor: '#fff', fontSize: 16 },
  button: { backgroundColor: '#e74c3c', padding: 18, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 15, elevation: 3 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: { color: '#3498db', marginTop: 15, fontSize: 16, fontWeight: '500' },
});
