# Personalized Dashboard

## 📂 GitHub Repository

[https://github.com/your-username/personalized-dashboard](https://github.com/your-username/personalized-dashboard)

A modern, responsive personalized content dashboard built with Next.js, React, TypeScript, Redux Toolkit, and Tailwind CSS. This application provides a curated content feed based on user preferences with features like dark mode, search functionality, favorites management, and infinite scroll.

## 🚀 Features

### Core Features
- **Personalized Content Feed**: Curated content based on user-selected categories
- **Real API Integration**: News API and TMDB for live content (with mock fallback)
- **Dark/Light Mode**: Toggle between themes with persistent preferences
- **Search Functionality**: Real-time search across news and movies with debounced input
- **Favorites Management**: Save and manage favorite content items
- **Infinite Scroll**: Seamless content loading as you scroll
- **Responsive Design**: Mobile-first design that works on all devices

### Advanced Features
- **Category Management**: Add/remove content categories dynamically
- **Settings Page**: Comprehensive user preferences management
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Modern UI/UX**: Clean, intuitive interface with hover effects and loading states
- **TypeScript**: Full type safety throughout the application
- **API Fallback**: Graceful fallback to mock data when APIs are unavailable

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **APIs**: News API, TMDB API
- **Testing**: Jest, React Testing Library, Cypress (configured)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/personalized-dashboard.git
   cd personalized-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up API keys (optional but recommended)**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Setup (Optional)

The app works with mock data by default, but you can enable real content by setting up API keys:

### News API Setup
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key (1000 requests/day free)
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key
   ```

### TMDB API Setup
1. Visit [TMDB](https://www.themoviedb.org/settings/api)
2. Create an account and request API access
3. Get your API key (free tier available)
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
   ```

### What You Get with Real APIs
- **News API**: Real-time news articles from major sources
- **TMDB**: Popular movies with ratings, release dates, and posters
- **Search**: Search across both news and movies
- **Fallback**: App continues working with mock data if APIs fail

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard page
│   ├── favorites/         # Favorites page
│   ├── settings/          # Settings page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── content/           # Content-related components
│   ├── layout/            # Layout components (Sidebar, Topbar)
│   ├── providers/         # Context providers
│   └── debug/             # Debug components (dev only)
├── lib/                   # Utilities and configurations
│   ├── services/          # API services
│   ├── slices/            # Redux Toolkit slices
│   ├── hooks.ts           # Custom Redux hooks
│   └── store.ts           # Redux store configuration
└── env.example            # Environment variables template
```

## 🎨 UI/UX Design

### Design Principles
- **Clean & Modern**: Minimalist design with focus on content
- **Accessible**: WCAG compliant with proper contrast ratios
- **Responsive**: Mobile-first approach with breakpoint optimization
- **Interactive**: Smooth animations and micro-interactions

### Color Scheme
- **Light Mode**: Clean whites and grays with blue accents
- **Dark Mode**: Deep grays with cyan/blue highlights
- **Semantic Colors**: Red for errors, green for success, blue for primary actions

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# API Keys (optional - app works without them)
NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

### Tailwind Configuration
The project uses Tailwind CSS v4 with custom configurations for:
- Dark mode support
- Custom animations
- Responsive breakpoints
- Color palette extensions

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints:
- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (two column layout)
- **Desktop**: > 1024px (multi-column layout)

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run cypress:open

# Test coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: Redux state and API integration
- **E2E Tests**: User journey testing with Cypress

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform

## 🔮 Future Enhancements

### Planned Features
- [ ] User authentication
- [ ] Social sharing functionality
- [ ] Content recommendations
- [ ] Offline support
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Content filtering and sorting
- [ ] YouTube API integration
- [ ] Spotify API integration

### Technical Improvements
- [ ] Performance optimization
- [ ] SEO improvements
- [ ] PWA capabilities
- [ ] Advanced caching strategies
- [ ] Analytics integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Redux Toolkit](https://redux-toolkit.js.org/) for state management
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Heroicons](https://heroicons.com/) for beautiful icons
- [News API](https://newsapi.org/) for real-time news content
- [TMDB](https://www.themoviedb.org/) for movie data and posters

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using modern web technologies and real APIs**
