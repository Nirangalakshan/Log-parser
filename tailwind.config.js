/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2dd4bf', // Teal
        secondary: '#4f46e5', // Indigo
        accent: '#fb7185', // Coral
        neutral: '#f4f4f5', // Light gray
        'dark-bg': '#1f2937', // Dark navy
        'dark-card': '#374151', // Dark gray
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        neumorphic: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
        'dark-neumorphic': '8px 8px 16px #1f2937, -8px -8px 16px #4b5563',
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(135deg, #ffffff, #f3f4f6)',
        'dark-gradient-card': 'linear-gradient(135deg, #374151, #1f2937)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};