# HotelBook - React Native (Expo) app
## Setup
1. Install dependencies: `npm install`
2. Create Firebase project and enable Email/Password auth and Firestore.
3. Add your firebase config to `src/lib/firebase.js` or load via environment variables.
4. Add OpenWeatherMap API key to environment; edit `HotelDetails` to use it.
5. Put images into `/assets/images/`:
   - onboard1.png, onboard2.png, onboard3.png
   - hotel1.jpg, hotel2.jpg, hotel3.jpg
   - profile-placeholder.png
6. Run: `npx expo start` then choose device/emulator.

## Notes
- Authentication state is handled with `onAuthStateChanged` in App.js.
- Bookings are stored under `users/{uid}/bookings`.
- Reviews can be stored under `hotels/{hotelId}/reviews` (see code comments).
