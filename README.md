# Calorie Tracker

A personal web application for tracking daily calorie intake and nutritional information.

## Features

- Track daily food consumption via text descriptions or food images
- Monitor calorie intake and macronutrients
- Analyze nutritional information using Google's Gemini AI
- Store meal history with date-based navigation
- Single-user application optimized for personal use

## Technologies

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (version 14.x or higher)
- npm or yarn
- Supabase account (free tier)
- Google AI Studio account for Gemini API key

### Setup Supabase

1. Create a new project on [Supabase](https://supabase.com/)
2. Once your project is created, go to the SQL Editor
3. Copy the contents of `supabase/schema.sql` and run it in the SQL Editor
4. Go to Project Settings > API to get your project URL and anon key

### Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Add your Gemini API key from Google AI Studio
3. Add your Supabase URL and anon key

```
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd calorie-tracker
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Create a new project on [Vercel](https://vercel.com/)
3. Connect your GitHub repository
4. Add the environment variables (GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
5. Deploy

## Usage

### Adding Food via Text Description

1. Enter a detailed description of your meal
2. Click "Add Food"
3. The AI will analyze the description and estimate nutritional content

### Adding Food via Image

1. Click the "Food Image" tab
2. Upload an image of your food
3. Optionally add a text description for better accuracy
4. Click "Analyze Food Image"

### Viewing Past Meals

Use the date selector at the top of the page to navigate between different days.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
