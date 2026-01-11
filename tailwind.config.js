/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SafeRoute Brand Colors
        brand: {
          primary: '#0A2540',
          secondary: '#1F4F7A',
          accent: '#00A6FF',
        },
        neutral: {
          light: '#F9F9F9',
          dark: '#212121',
        },
        success: '#28A745',
        warning: '#FFC107',
        danger: '#DC3545',
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        secondary: ['Roboto', 'sans-serif'],
      },
      fontSize: {
        h1: ['48px', { lineHeight: '1.2' }],
        h2: ['36px', { lineHeight: '1.3' }],
        h3: ['28px', { lineHeight: '1.4' }],
        h4: ['22px', { lineHeight: '1.4' }],
        body: ['16px', { lineHeight: '1.6' }],
        small: ['14px', { lineHeight: '1.6' }],
        caption: ['12px', { lineHeight: '1.6' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        button: '8px',
        card: '12px',
        input: '8px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.05)',
      },
      transitionDuration: {
        fast: '150ms',
        medium: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

