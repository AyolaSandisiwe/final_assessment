
import React, { useEffect, useState } from 'react';
import AppNavigator from './navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

export default function App() {
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		console.log('Setting up auth listener');
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			console.log('Auth state changed:', user ? user.uid : 'No user');
			setIsSignedIn(!!user);
			
			if (user) {
				// Check if user has seen onboarding
				const hasOnboarded = await AsyncStorage.getItem(`onboarded_${user.uid}`);
				console.log('Has onboarded:', hasOnboarded);
				setShowOnboarding(hasOnboarded !== 'true');
			} else {
				setShowOnboarding(false);
			}
			
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	if (loading) return null;

	return <AppNavigator isSignedIn={isSignedIn} showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding} />;
}
