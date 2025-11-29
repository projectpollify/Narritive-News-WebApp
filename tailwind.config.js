/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'narrative-blue': '#1e40af', // Keeping for backward compatibility
        'narrative-red': '#dc2626',  // Keeping for backward compatibility
        
        // New Premium Palette
        navy: {
          900: '#0F172A', // Oxford Navy (Primary)
          800: '#1E293B',
          700: '#334155',
        },
        gold: {
          500: '#D4AF37', // Antique Gold (Accent)
          600: '#B5952F',
          100: '#F9F5E6',
        },
        paper: '#F9FAFB', // Paper White (Background)
        ink: '#111827',   // Ink Black (Text)
        
        // Political Colors (Muted/Premium)
        democrat: {
          DEFAULT: '#2563EB',
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
        republican: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#991B1B',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Source Sans 3"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -1px rgba(15, 23, 42, 0.03)',
        'card': '0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(15, 23, 42, 0.025)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
