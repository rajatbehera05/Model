/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Primary modern smart blue
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        subtle: '#F1F5F9',
        border: '#E2E8F0', // Very light gray-blue
        borderHover: '#CBD5E1',
        text: {
          primary: '#0F172A', // Dark navy / charcoal
          secondary: '#64748B', // Muted blue-gray
          muted: '#94A3B8',
        },
        slot: {
          available: '#10B981',
          availableBg: '#ECFDF5',
          availableBorder: '#86EFAC',
          occupied: '#EF4444',
          occupiedBg: '#FEF2F2',
          occupiedBorder: '#FCA5A5',
          reserved: '#F59E0B',
          reservedBg: '#FFFBEB',
          reservedBorder: '#FCD34D',
        }
      },
      borderRadius: {
        'card': '16px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(15, 23, 42, 0.05), 0 4px 12px rgba(15, 23, 42, 0.03)',
        'card': '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'cardHover': '0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'modal': '0 20px 40px -10px rgba(15, 23, 42, 0.15)',
      }
    },
  },
  plugins: [],
}
