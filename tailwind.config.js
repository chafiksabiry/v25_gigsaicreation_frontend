module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        'harx': {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffc2c2',
          300: '#ff9494',
          400: '#ff6b6b',
          500: '#ff4d4d', // Primary HARX red-orange
          600: '#ff3333',
          700: '#ff1a1a',
          800: '#ff0000',
          900: '#cc0000',
          950: '#990000',
        },
        'harx-alt': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899', // Secondary HARX pink
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
      },
      backgroundImage: {
        'gradient-harx': 'linear-gradient(to right, #ff4d4d, #ec4899)',
        'premium-gradient': 'radial-gradient(circle at top left, #fff5f5 0%, #ffffff 100%)',
      },
      animation: {
        'float': 'float 6s infinite ease-in-out',
        'float-rotate': 'float-rotate 8s infinite ease-in-out',
        'pulse-premium': 'pulse-premium 4s infinite ease-in-out',
        'premium-glow': 'premium-glow 4s infinite ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-rotate': {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-25px) rotate(2deg)' },
        },
        'pulse-premium': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        'premium-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 20px rgba(255, 77, 77, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 40px rgba(236, 72, 153, 0.6))' },
        }
      },
    },
  },
  plugins: [],
};
