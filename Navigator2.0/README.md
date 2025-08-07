# Navigator React Dashboard

A comprehensive hotel revenue management dashboard built with Next.js, React, and TypeScript. This professional-grade application provides hotel revenue managers with powerful tools for rate parity monitoring, competitive analysis, and revenue optimization.



## 🌟 Features

### 🏨 Core Dashboard
- **Real-time KPI Monitoring**: Track key performance indicators with interactive cards
- **Rate Trends Analysis**: Comprehensive charts and graphs for rate monitoring
- **Market Demand Forecasting**: Advanced demand prediction and analysis
- **Competitive Intelligence**: Monitor competitor rates and market positioning
- **Revenue Loss Tracking**: Identify and quantify revenue opportunities

### 🎨 Enhanced User Experience
- **Professional Dark Theme**: WCAG AAA compliant dark mode with enhanced contrast
- **Responsive Design**: Mobile-first approach with seamless cross-device experience
- **Fixed Header Navigation**: Consistent navigation with Navigator branding
- **Sticky Filter Controls**: Enhanced filter sidebar with fixed action buttons
- **Smooth Animations**: Professional transitions and micro-interactions

### 📚 Knowledge Center
- **Comprehensive Help System**: Built-in knowledge base with searchable articles
- **Video Tutorials**: Interactive learning resources for new users
- **FAQ Section**: Hotel-specific frequently asked questions
- **Support Ticket System**: File upload capabilities and priority management
- **Coach Mark System**: Guided tours for first-time users

### 🎯 Advanced Features
- **Theme Toggle**: System-aware theme switching (Light/Dark/System)
- **Filter Management**: Advanced filtering with persistent state
- **Data Visualization**: Interactive charts using Recharts
- **Component Library**: Built with shadcn/ui for consistency
- **Accessibility**: Full keyboard navigation and screen reader support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/glalcua1/Navigator_React.git
   cd Navigator_React
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Custom Port
To run on a specific port (e.g., 3002):
```bash
npm run dev -- -p 3002
```

## 🏗️ Project Structure

```
Navigator_React/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles and dark theme
│   ├── layout.tsx               # Root layout with ThemeProvider
│   ├── page.tsx                 # Main dashboard page
│   ├── help/                    # Knowledge center
│   ├── demand/                  # Demand forecasting
│   └── rate-trend/              # Rate trend analysis
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── navigator/               # Dashboard-specific components
│   ├── theme-toggle.tsx         # Enhanced theme switcher
│   ├── theme-provider.tsx       # Theme context provider
│   ├── navigation-drawer.tsx    # Main navigation
│   ├── filter-sidebar.tsx       # Advanced filtering
│   └── layout-content.tsx       # Layout wrapper
├── styles/                      # Additional stylesheets
├── lib/                         # Utility functions
└── public/                      # Static assets
```

## 🎨 Theme System

### Dark Theme Features
- **Enhanced Contrast**: WCAG AAA compliance (7:1+ contrast ratio)
- **Professional Color Palette**: Sophisticated slate-based design
- **Component-Specific Variables**: Dedicated CSS variables for each component
- **System Integration**: Automatic system theme detection
- **Smooth Transitions**: Seamless theme switching without flash

### Theme Toggle
- **Three Modes**: Light, Dark, and System preference
- **Visual Feedback**: Icons and descriptions for each mode
- **Persistent State**: Theme preference saved across sessions
- **Accessibility**: Full keyboard and screen reader support

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Enhanced layouts for tablet screens
- **Desktop Experience**: Full-featured desktop interface
- **Touch-Friendly**: Optimized touch targets and interactions

## ♿ Accessibility

- **WCAG AAA Compliance**: Highest accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast Mode**: System high contrast support
- **Reduced Motion**: Respects user motion preferences

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS Variables
- **Components**: shadcn/ui component library
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Theme**: next-themes for theme management
- **Animations**: Tailwind CSS animations

## 📊 Dashboard Components

### KPI Cards
- Real-time metrics display
- Trend indicators with color coding
- Interactive hover states
- Responsive grid layouts

### Charts & Visualizations
- Rate trend analysis
- Demand forecasting
- Market comparison
- Revenue loss tracking

### Navigation
- Fixed header with branding
- Collapsible sidebar navigation
- Breadcrumb navigation
- Mobile-optimized menu

### Filtering
- Advanced filter sidebar
- Sticky action buttons
- Persistent filter state
- Quick filter options

## 🎓 Knowledge Center

### Help System
- Searchable knowledge base
- Category-based organization
- Difficulty level indicators
- Related article suggestions

### Support Features
- Ticket creation system
- File upload capabilities
- Priority level selection
- Status tracking

### User Guidance
- Interactive coach marks
- Step-by-step tutorials
- Progress tracking
- Skip and replay options

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component documentation with JSDoc

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings (auto-detected)
3. Deploy with automatic CI/CD

### Other Platforms
- **Netlify**: Full Next.js support
- **AWS Amplify**: Serverless deployment
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the excellent component library
- **Tailwind CSS** for the utility-first CSS framework
- **Next.js** for the powerful React framework
- **Lucide** for the beautiful icon set
- **Recharts** for the data visualization library

## 📞 Support

For support and questions:
- Create an issue in this repository
- Use the built-in support ticket system
- Check the knowledge center for common questions

---

**Navigator React Dashboard** - Professional hotel revenue management made simple.

Built with ❤️ for hotel revenue managers worldwide.
