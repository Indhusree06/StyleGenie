# StyleGenie AI - Smart Wardrobe Management

StyleGenie is an AI-powered wardrobe management application that helps you organize your clothes, get outfit recommendations, and manage wardrobes for your entire family.

## 🌟 Features

### Core Features
- **Smart Wardrobe Management**: Add, organize, and categorize your clothing items
- **AI-Powered Chat**: Get personalized outfit recommendations and styling advice
- **Weather Integration**: Receive weather-appropriate clothing suggestions
- **Family Profiles**: Separate wardrobes for each family member
- **Premium Features**: Advanced AI recommendations and unlimited storage

### User Management
- **Secure Authentication**: Powered by Supabase Auth
- **User Profiles**: Personalized experience for each user
- **Premium Subscriptions**: Tiered access to advanced features

### AI Integration
- **OpenAI Integration**: Advanced AI for outfit recommendations
- **Smart Suggestions**: Context-aware clothing recommendations
- **Style Analysis**: AI-powered style insights

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <your-repo-url>
cd stylegenie-ai
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
Create a `.env.local` file:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
\`\`\`

4. **Set up the database**
\`\`\`bash
# Run database setup
npm run db:setup

# Run wardrobe profile migration (for family member support)
npm run migrate:wardrobe-profiles
\`\`\`

5. **Start the development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your application.

## 📁 Project Structure

\`\`\`
stylegenie-ai/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── wardrobe/          # Wardrobe management
│   ├── wardrobes/         # Family wardrobe profiles
│   ├── chat/              # AI chat interface
│   └── ...
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── scripts/              # Database scripts
├── public/               # Static assets
└── styles/               # Global styles
\`\`\`

## 🗄️ Database Schema

### Core Tables
- `profiles`: User profile information
- `wardrobe_profiles`: Family member profiles
- `wardrobe_items`: Clothing items with profile association
- `premium_subscriptions`: Premium user management

### Key Relationships
- Users can have multiple wardrobe profiles (family members)
- Each wardrobe item belongs to a user and optionally a specific profile
- Premium features are controlled via subscription status

## 🔧 Available Scripts

\`\`\`bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database Management
npm run db:setup        # Complete database setup
npm run db:check        # Check database status
npm run db:seed         # Seed sample data
npm run migrate:wardrobe-profiles  # Enable family wardrobes
\`\`\`

## 🏗️ Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern UI components
- **Framer Motion**: Smooth animations

### Backend
- **Supabase**: Database, authentication, and real-time features
- **OpenAI API**: AI-powered recommendations
- **Next.js API Routes**: Server-side logic

### Key Features Implementation
- **Authentication**: Supabase Auth with custom hooks
- **Database**: PostgreSQL with Row Level Security
- **File Storage**: Supabase Storage for clothing images
- **AI Chat**: OpenAI integration with streaming responses
- **Real-time Updates**: Supabase real-time subscriptions

## 🔐 Security

- **Row Level Security (RLS)**: Database-level access control
- **Authentication Required**: Protected routes and API endpoints
- **Input Validation**: Zod schemas for data validation
- **Environment Variables**: Secure credential management

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
\`\`\`bash
npm run build
npm run start
\`\`\`

## 📱 Pages Overview

- `/` - Landing page with features overview
- `/auth` - Authentication (login/signup)
- `/home` - Main dashboard
- `/wardrobe` - Personal wardrobe management
- `/wardrobes` - Family member wardrobe profiles
- `/add-clothes` - Add new clothing items
- `/chat` - AI styling assistant
- `/weather-essentials` - Weather-based recommendations
- `/profile` - User profile management
- `/pricing` - Premium subscription plans

## 🤖 AI Features

### Chat Assistant
- Personalized outfit recommendations
- Style advice and tips
- Weather-appropriate suggestions
- Wardrobe organization help

### Smart Recommendations
- Context-aware suggestions
- Seasonal recommendations
- Event-appropriate outfits
- Color coordination advice

## 👥 Family Features

### Wardrobe Profiles
- Create profiles for family members
- Separate wardrobes for each person
- Age-appropriate recommendations
- Individual style preferences

### Profile Management
- Add/edit family member details
- Set age, gender, and style preferences
- Manage individual wardrobes
- Privacy controls

## 💎 Premium Features

- Unlimited wardrobe items
- Advanced AI recommendations
- Priority customer support
- Early access to new features
- Enhanced customization options

## 🛠️ Development

### Adding New Features
1. Create feature branch
2. Implement changes
3. Add tests if applicable
4. Update documentation
5. Submit pull request

### Database Changes
1. Create migration script in `scripts/`
2. Test migration locally
3. Update schema documentation
4. Add to deployment process

## 📞 Support

For support and questions:
- Check the troubleshooting section in migration docs
- Review error logs in Supabase dashboard
- Contact support through the application

## 📄 License

This project is private and proprietary.

---

**StyleGenie AI** - Making fashion personal and intelligent! ✨👗🤖
