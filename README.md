# HotelBook App - My React Native Project

## Test Account
Email: ayolamabhongo@gmail.com  
Password: Sandisiwe@8000

## What I Built

I created a hotel booking mobile app using React Native and Expo. The app allows users to browse hotels, make bookings, and leave reviews.

### Main Features

**User Interface:**
- Onboarding screens that show when you first sign up
- Login and registration with proper validation
- Hotel search with filtering by location and sorting
- Booking system with date selection and room options
- Review system where users can rate hotels
- User profile with booking history

**Backend Integration:**
- Firebase for user authentication and data storage
- Real-time database updates for reviews and bookings
- Weather API integration to show current weather
- Third-party APIs for additional content

## How to Run My App

1. First install the packages:
   ```
   npm install
   ```

2. I already set up Firebase, but if you want to use your own:
   - Make a new Firebase project
   - Turn on email/password login
   - Enable Firestore database
   - Replace the config in firebaseConfig.js

3. The weather API key is already in the code

4. Start the app:
   ```
   npx expo start
   ```
   Then scan the QR code or run on simulator

## How I Organized My Code

- `App.js` - Main app file that handles login state
- `firebaseConfig.js` - My Firebase setup
- `navigation/` - Navigation between screens
- `screens/Auth/` - Login and signup screens
- `screens/Onboarding/` - Welcome screens for new users
- `screens/ExploreScreen.js` - Browse hotels page
- `screens/HotelDetailsScreen.js` - Individual hotel info
- `screens/BookingScreen.js` - Make a reservation
- `screens/ProfileScreen.js` - User account page
- `screens/DealsScreen.js` - Special offers

## What I Learned

Building this app taught me:
- How to use Firebase for authentication and database
- Working with React Navigation for screen transitions
- Integrating external APIs for weather data
- Managing app state with React hooks
- Creating responsive mobile interfaces
- Handling user input validation
- Real-time data updates

## Tech Stack

- React Native with Expo
- Firebase Authentication & Firestore
- React Navigation
- AsyncStorage for local data
- Axios for API calls
- DateTimePicker component
- OpenWeatherMap API
