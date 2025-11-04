import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

import ExploreScreen from '../screens/ExploreScreen';
import HotelDetailsScreen from '../screens/HotelDetailsScreen';
import BookingScreen from '../screens/BookingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DealsScreen from '../screens/DealsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 8,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏨</Text>,
        }}
      />
      <Tab.Screen 
        name="Deals" 
        component={DealsScreen}
        options={{
          tabBarLabel: 'Deals',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💰</Text>,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ isSignedIn, showOnboarding, setShowOnboarding }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isSignedIn ? (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : showOnboarding ? (
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} setShowOnboarding={setShowOnboarding} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
