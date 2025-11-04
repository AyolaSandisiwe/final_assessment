export const hotels = [
  {
    id: '1',
    name: 'Grand Plaza Hotel',
    location: 'New York, USA',
    rating: 4.8,
    price: 250,
    image: require('../assets/hotel1.png'),
    description: 'Luxury hotel in Manhattan with stunning city views.',
    reviews: [
      { id: '1', user: 'John Doe', rating: 5, text: 'Amazing stay!' }
    ]
  },
  {
    id: '2',
    name: 'Seaside Resort',
    location: 'Miami Beach, USA',
    rating: 4.6,
    price: 180,
    image: require('../assets/hotel2.png'),
    description: 'Beautiful beachfront resort.',
    reviews: []
  },
  {
    id: '3',
    name: 'Mountain Lodge',
    location: 'Aspen, USA',
    rating: 4.9,
    price: 320,
    image: require('../assets/hotel3.png'),
    description: 'Cozy lodge with mountain views.',
    reviews: []
  }
];
