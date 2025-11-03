# ShopEZ - [Question X]

## Summary
Simple shopping app demonstrating: Firebase Auth, Realtime DB cart per-user, product fetch from Fake Store API, offline persistence with AsyncStorage.

## Install & Run
1. Clone repo
2. `npm install`
3. Add Firebase config in `firebaseConfig.js`
4. `npx expo start` then open in browser / Expo Go

## Features
- Register / Login with email/password
- Product list + category filter using FakeStoreAPI
- Product detail + Add to cart
- Cart saved to Firebase Realtime DB under `/carts/{userId}`
- Local cart persistence with AsyncStorage for offline support

## Notes
- Firebase Realtime DB security rules must allow read/write only to the authenticated user's cart.
# Assessment2
