import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import CartScreen from './screens/CartScreen';

const Stack = createNativeStackNavigator();

function RootNavigator(){
  const { user, loadingAuth } = useContext(AuthContext);
  if (loadingAuth) return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Loading" component={() => null} options={{ title: 'Starting...' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
  if (user) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Products" component={ProductListScreen} options={{ title: 'ShopEZ Products' }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailsScreen} options={{ title: 'Product Details' }} />
          <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // unauthenticated navigator - explicitly start at Register
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Register">
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Welcome back' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import { CartProvider } from './contexts/CartContext';
export default function App(){
  return (

    <AuthProvider>
      <CartProvider>
        <RootNavigator />
      </CartProvider>
    </AuthProvider>
  );
}

