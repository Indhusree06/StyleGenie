# Weather Smart AI - Smart Wardrobe Management

Weather Smart AI is an intelligent wardrobe management system that helps you organize your clothing, get personalized outfit recommendations, and manage wardrobes for your entire family.

## 🌟 Features

### 👔 Smart Wardrobe Management
- **Digital Wardrobe**: Catalog all your clothing items with photos, details, and tags
- **Family Wardrobes**: Separate wardrobes for each family member with age-appropriate features
- **Advanced Search & Filtering**: Find items by category, color, season, occasion, and more
- **Wear Tracking**: Track how often you wear items and when you last wore them

### 🤖 AI-Powered Recommendations
- **Outfit Suggestions**: Get personalized outfit recommendations based on weather, occasion, and preferences
- **Weather Integration**: Automatic weather-based clothing suggestions
- **Style Chat**: Interactive AI assistant for fashion advice and wardrobe questions
- **Similar Item Discovery**: Find similar items online when you need replacements

### 👨‍👩‍👧‍👦 Family-Friendly Features
- **Age-Appropriate Categories**: Different clothing categories for babies, children, teens, and adults
- **School Uniform Tracking**: Special features for school-age children
- **Growth Tracking**: Mark items with room for growth
- **Safety Features**: Track safety features for children's clothing

### 🌤️ Weather Essentials
- **Weather Wardrobe**: Track weather-specific items like raincoats, winter jackets, etc.
- **Seasonal Organization**: Organize items by season and weather suitability
- **Location-Based Suggestions**: Get recommendations based on your location's weather

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **AI**: OpenAI GPT-4 for outfit recommendations and chat
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**:
   \`\`\`bash
   git clone <your-repo-url>
   cd weathersmart-ai
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   OPENAI_API_KEY=your_openai_api_key
   \`\`\`

4. **Set up the database**:
   \`\`\`bash
   # Run the main database setup
   npm run db:setup
   
   # Run the wardrobe profiles migration
   npm run migrate:wardrobe-profiles

   # (Optional) Add sample data for testing
   npm run db:seed
   \`\`\`

5. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser** and navigate to `http://localhost:3003`

## 🗄️ Database Setup

### Initial Setup
The app uses Supabase as the backend. Run these commands to set up your database:

\`\`\`bash
# Set up main tables and relationships
npm run db:setup

# Enable separate wardrobes for family members
npm run migrate:wardrobe-profiles

# (Optional) Add sample data for testing
npm run db:seed
\`\`\`

### Database Schema
The app uses these main tables:
- `profiles` - User profiles
- `wardrobe_profiles` - Family member profiles
- `wardrobe_items` - Clothing items
- `categories` - Clothing categories
- `tags` - Item tags
- `outfits` - Saved outfits
- `outfit_recommendations` - AI-generated recommendations

## Project Structure

\`\`\`
weathersmart-ai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── wardrobe/          # Wardrobe management
│   ├── wardrobes/         # Family wardrobes
│   ├── add-clothes/       # Add clothing items
│   ├── chat/              # AI style chat
│   └── weather-essentials/ # Weather-based recommendations
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and services
├── scripts/              # Database migration scripts
├── public/               # Static assets
└── styles/               # Global styles
\`\`\`

## Key Features Explained

### Family Wardrobes
- Create separate wardrobes for each family member
- Age-appropriate clothing suggestions
- Track school uniforms and dress codes
- Weather essentials for each family member

### AI Style Chat
- Chat with AI about fashion and styling questions
- Get personalized outfit recommendations
- Ask about color combinations, styling tips, and more

### Weather Integration
- Automatic weather-based outfit suggestions
- Location-based weather data
- Seasonal clothing recommendations

### Advanced Filtering
- Filter by category, season, occasion, color
- Sort by newest, most worn, favorites
- Search across all clothing attributes

## Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database scripts
npm run db:setup     # Set up database tables
npm run db:seed      # Add sample data
npm run db:check     # Check database connection
npm run migrate:wardrobe-profiles  # Enable family wardrobes
\`\`\`

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review the database migration guide
- Open an issue on GitHub
- Check Supabase dashboard for database issues

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI styling recommendations
- [ ] Social features (share outfits)
- [ ] Shopping integration
- [ ] Wardrobe analytics and insights
- [ ] Outfit planning calendar
- [ ] Style challenges and goals

---

**Made with ❤️ for better wardrobe management**
