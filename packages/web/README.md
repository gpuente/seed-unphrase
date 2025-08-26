# @seed-unphrase/web

🌱 Beautiful React web application for securely concealing and revealing cryptocurrency seed phrases with advanced salt-enhanced protection.

## ✨ Features

### 🎨 Beautiful UI/UX
- **Modern React** with TypeScript and Vite
- **Stunning animations** powered by Framer Motion
- **Glass morphism design** with dynamic gradients
- **Interactive background** with parallax particle effects
- **Responsive layout** optimized for all devices
- **Dark theme** with purple/cyan gradient aesthetics

### 🔐 Security Features
- **Salt-enhanced protection** prevents brute force attacks
- **Real-time validation** with BIP39 wordlist checking
- **Security level indicators** (Basic/Enhanced)
- **Input sanitization** and error handling
- **Educational warnings** about proper key management

### 🚀 Modern Architecture
- **TypeScript** for type safety
- **Component-based** modular architecture
- **Tailwind CSS** for utility-first styling
- **Sonner toasts** for elegant notifications
- **Form validation** with comprehensive error states

## 🌐 Live Demo

Visit the web application at: [Your deployment URL]

## 🛠 Development

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Setup

```bash
# Clone the monorepo
git clone <repository-url>
cd seed-unphrase

# Install dependencies
pnpm install

# Build the library dependency
pnpm build:lib

# Start development server
pnpm dev:web
```

The development server will start at `http://localhost:5173`

### Build for Production

```bash
# Build the web app
pnpm build:web

# Preview the production build
cd packages/web && npm run preview
```

## 🏗 Project Structure

```
packages/web/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Background.tsx   # Animated background with parallax
│   │   ├── ModeToggle.tsx   # Conceal/Reveal mode switcher
│   │   ├── ConcealForm.tsx  # Seed phrase concealment form
│   │   ├── RevealForm.tsx   # Seed phrase reveal form
│   │   └── SecurityIndicator.tsx # Security level display
│   ├── styles/
│   │   └── globals.css      # Global styles and utilities
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── dist/                    # Built static files
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```

## 🎯 Usage

### Conceal Mode

1. **Enter Seed Phrase**: Input your seed phrase (1-24 words)
2. **Set Cipher Key**: Enter a positive integer as your cipher key
3. **Optional Salt**: Toggle enhanced security and add a salt
4. **Generate**: Click "Conceal Seed Phrase" to generate the concealed value
5. **Copy Results**: Copy the quotient:remainder format for storage

### Reveal Mode

1. **Enter Concealed Value**: Input the quotient:remainder format
2. **Enter Cipher Key**: Same key used for concealment
3. **Enter Salt** (if used): Same salt used for concealment
4. **Reveal**: Click "Reveal Seed Phrase" to recover your words

### Security Indicators

- **Basic Security**: Standard concealment without salt
- **Enhanced Security**: Salt-protected concealment with brute force resistance

## 🎨 UI Components

### Background Component
- **Animated gradients** that shift colors over time
- **Mouse-following effects** with spring physics
- **Parallax particles** that respond to cursor movement
- **Grid pattern overlay** for subtle texture
- **Floating shapes** with rotation and scaling animations

### Forms
- **Real-time validation** with error highlighting
- **Interactive toggles** for salt enhancement
- **Copy-to-clipboard** functionality for results
- **Loading states** during processing
- **Success/error feedback** with toast notifications

### Mode Toggle
- **Smooth animations** between Conceal/Reveal modes
- **Visual icons** with hover effects
- **Disabled states** during processing
- **Accessibility support** with proper ARIA labels

## 🔧 Configuration

### Tailwind CSS

The project uses Tailwind CSS v3 with custom utilities:

```css
/* Custom glass morphism effect */
.glass {
  @apply bg-white/5 backdrop-blur-sm border border-white/10;
}

/* Gradient text effect */
.gradient-text {
  @apply bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent;
}

/* Floating animation */
.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

### Vite Configuration

Optimized build configuration with:
- **TypeScript support** with strict checking
- **Fast refresh** for instant development feedback
- **Asset optimization** for production builds
- **Code splitting** for optimal loading performance

## 🧪 Testing

Currently includes basic component testing. To extend:

```bash
# Add testing dependencies
pnpm add -D @testing-library/react @testing-library/jest-dom vitest jsdom

# Run tests
pnpm test:web
```

## 🎭 Animation Details

### Background Animations
- **Mesh gradients** with 20-second cycles
- **Particle system** with 50 animated dots
- **Parallax effects** with subtle mouse tracking
- **Spring physics** for smooth, natural movement
- **Performance optimized** with GPU acceleration

### UI Transitions
- **Page entrance** with scale and fade effects
- **Form switching** with slide animations
- **Button interactions** with hover and active states
- **Loading spinners** for processing feedback
- **Toast notifications** with smooth slide-in effects

## 🔒 Security Best Practices

### Client-Side Security
- **No server communication** - all processing happens locally
- **Memory safety** - sensitive data not stored in global state
- **Input validation** - comprehensive checking before processing
- **Error boundaries** - graceful handling of unexpected errors

### User Education
- **Warning messages** about key management
- **Educational tooltips** explaining security levels
- **Best practice guides** in the interface
- **Clear instructions** for proper usage

## 📱 Responsive Design

### Desktop (1024px+)
- **Full-width layout** with optimal spacing
- **Large form fields** for easy interaction
- **Detailed animations** and effects
- **Mouse interactions** and hover states

### Tablet (768px - 1023px)
- **Adjusted spacing** for touch interfaces
- **Readable font sizes** and button targets
- **Simplified animations** for performance
- **Touch-friendly interactions**

### Mobile (< 768px)
- **Stacked layout** for narrow screens
- **Large touch targets** (44px minimum)
- **Simplified background** effects
- **Optimized performance** for mobile devices

## 🚀 Deployment

### Static Hosting
Build outputs to `dist/` directory for easy deployment to:
- **Vercel** - Automatic deployments from Git
- **Netlify** - Drag-and-drop or Git integration
- **GitHub Pages** - Free hosting for open source
- **AWS S3 + CloudFront** - Scalable static hosting

### Build Optimization
- **Asset bundling** with Vite
- **Code splitting** for optimal loading
- **CSS purging** with Tailwind
- **Image optimization** for faster loading
- **Gzip compression** enabled by default

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Make changes in `packages/web/`
3. Test with `pnpm dev:web`
4. Build with `pnpm build:web`
5. Submit pull request

### Code Style
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Component patterns** following React best practices
- **Accessibility** with proper ARIA labels

### Adding Features
1. Create new components in `src/components/`
2. Add TypeScript interfaces for props
3. Include loading and error states
4. Test across different screen sizes
5. Update documentation

## 📦 Dependencies

### Core
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### UI/UX
- **Framer Motion** - Animations and interactions
- **Tailwind CSS** - Utility-first styling
- **Sonner** - Toast notifications

### Functionality
- **@seed-unphrase/lib** - Core cryptographic functions

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📄 License

ISC License

## 🔗 Related

- [@seed-unphrase/lib](../lib) - Core cryptographic library
- [@seed-unphrase/cli](../cli) - Command-line interface
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)

---

⚠️ **Security Notice**: This web application processes sensitive cryptographic data entirely in your browser. No data is transmitted to external servers. Always verify you're using the official version and keep your cipher keys secure.