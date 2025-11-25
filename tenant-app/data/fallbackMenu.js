// Fallback data for the Menu page when backend is unavailable
const categories = [
  { id: 'all', name: 'All' },
  { id: 1, name: 'Burgers', description: 'Juicy grilled burgers' },
  { id: 2, name: 'Drinks', description: 'Refreshing beverages' },
  { id: 3, name: 'Desserts', description: 'Sweet treats' },
];

const items = [
  {
    id: 101,
    category_id: 1,
    name: 'Classic Beef Burger',
    description: 'Grilled beef patty with lettuce, tomato and our special sauce.',
    price: 120.0,
    image_url: 'https://via.placeholder.com/160x160?text=Burger',
    is_available: 1,
  },
  {
    id: 102,
    category_id: 1,
    name: 'Cheese Deluxe',
    description: 'Double cheese, caramelized onions, pickles.',
    price: 150.5,
    image_url: 'https://via.placeholder.com/160x160?text=Cheese',
    is_available: 1,
  },
  {
    id: 201,
    category_id: 2,
    name: 'Fresh Orange Juice',
    description: 'Cold-pressed orange juice.',
    price: 40.0,
    image_url: 'https://via.placeholder.com/160x160?text=OJ',
    is_available: 1,
  },
  {
    id: 301,
    category_id: 3,
    name: 'Chocolate Brownie',
    description: 'Warm fudge brownie with vanilla ice cream.',
    price: 80.0,
    image_url: 'https://via.placeholder.com/160x160?text=Brownie',
    is_available: 0,
  },
];

export default { categories, items };
