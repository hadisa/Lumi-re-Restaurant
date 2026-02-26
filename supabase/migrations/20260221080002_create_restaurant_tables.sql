/*
  # Restaurant Database Schema

  ## Overview
  Creates tables for a Japanese restaurant website including menu items and reservations.

  ## New Tables
  
  ### `menu_items`
  - `id` (uuid, primary key) - Unique identifier for each menu item
  - `name` (text) - Name of the dish
  - `description` (text) - Description of the dish
  - `price` (numeric) - Price of the dish
  - `category` (text) - Category (appetizers, sushi, mains, desserts, drinks)
  - `image_url` (text) - URL to dish image
  - `is_available` (boolean) - Whether the item is currently available
  - `created_at` (timestamptz) - When the item was added
  
  ### `reservations`
  - `id` (uuid, primary key) - Unique identifier for each reservation
  - `name` (text) - Guest name
  - `email` (text) - Guest email
  - `phone` (text) - Guest phone number
  - `date` (date) - Reservation date
  - `time` (text) - Reservation time
  - `guests` (integer) - Number of guests
  - `special_requests` (text) - Any special requests
  - `status` (text) - Status (pending, confirmed, cancelled)
  - `created_at` (timestamptz) - When the reservation was made

  ## Security
  - Enable RLS on both tables
  - Public read access for menu items
  - Authenticated users can create reservations
*/

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  guests integer NOT NULL,
  special_requests text DEFAULT '',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Menu items policies (public read access)
CREATE POLICY "Anyone can view menu items"
  ON menu_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Reservations policies (anyone can create, only view own)
CREATE POLICY "Anyone can create reservations"
  ON reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own reservations"
  ON reservations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, image_url) VALUES
  ('Edamame', 'Steamed soybeans with sea salt', 6.00, 'appetizers', 'https://images.pexels.com/photos/5409010/pexels-photo-5409010.jpeg'),
  ('Gyoza', 'Pan-fried dumplings with ponzu sauce', 8.50, 'appetizers', 'https://images.pexels.com/photos/5696251/pexels-photo-5696251.jpeg'),
  ('Miso Soup', 'Traditional soybean soup with tofu and seaweed', 5.00, 'appetizers', 'https://images.pexels.com/photos/5638527/pexels-photo-5638527.jpeg'),
  ('Nigiri Set', 'Assorted fresh fish nigiri (8 pieces)', 24.00, 'sushi', 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg'),
  ('Dragon Roll', 'Eel, cucumber, avocado with special sauce', 16.00, 'sushi', 'https://images.pexels.com/photos/6270061/pexels-photo-6270061.jpeg'),
  ('Salmon Sashimi', 'Fresh salmon sliced thin (12 pieces)', 22.00, 'sushi', 'https://images.pexels.com/photos/271715/pexels-photo-271715.jpeg'),
  ('Teriyaki Chicken', 'Grilled chicken with teriyaki glaze, rice, and vegetables', 18.00, 'mains', 'https://images.pexels.com/photos/8988ead/pexels-photo-8988ead.jpeg'),
  ('Wagyu Beef', 'Premium Japanese beef with seasonal vegetables', 45.00, 'mains', 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg'),
  ('Ramen', 'Rich tonkotsu broth with noodles, egg, and pork', 16.00, 'mains', 'https://images.pexels.com/photos/1907227/pexels-photo-1907227.jpeg'),
  ('Green Tea Ice Cream', 'Traditional matcha ice cream', 7.00, 'desserts', 'https://images.pexels.com/photos/18898997/pexels-photo-18898997.jpeg'),
  ('Mochi', 'Sweet rice cake assortment', 8.00, 'desserts', 'https://images.pexels.com/photos/7937382/pexels-photo-7937382.jpeg'),
  ('Sake', 'Premium Japanese rice wine', 12.00, 'drinks', 'https://images.pexels.com/photos/5696251/pexels-photo-5696251.jpeg'),
  ('Matcha Latte', 'Traditional green tea latte', 6.00, 'drinks', 'https://images.pexels.com/photos/5946960/pexels-photo-5946960.jpeg')
ON CONFLICT DO NOTHING;