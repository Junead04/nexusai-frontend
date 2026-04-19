export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne','sans-serif'],
        body: ['Plus Jakarta Sans','sans-serif'],
        mono: ['JetBrains Mono','monospace'],
      },
      colors: {
        purple: {
          deep:  '#0d0820', dark:  '#130d2e', mid:   '#1e1545',
          card:  '#231a52', light: '#2d2060', glow:  'rgba(139,92,246,0.18)',
        },
        accent: { DEFAULT:'#8b5cf6', light:'#a78bfa', dim:'rgba(139,92,246,0.15)' },
        border: { DEFAULT:'rgba(139,92,246,0.2)', strong:'rgba(139,92,246,0.35)' },
        text: { primary:'#f0eeff', secondary:'#b8aee0', muted:'#6b5fa0' },
      },
      animation: {
        'fade-up':    'fadeUp 0.3s ease forwards',
        'pulse-dot':  'pulseDot 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { from:{opacity:0,transform:'translateY(10px)'}, to:{opacity:1,transform:'translateY(0)'} },
        pulseDot:  { '0%,100%':{opacity:1}, '50%':{opacity:0.4} },
        float:     { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-4px)'} },
      },
    },
  },
  plugins: [],
}
