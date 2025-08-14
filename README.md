# Chatbot Analytics Dashboard

A modern Next.js application for analyzing chatbot conversations with a beautiful dark-themed UI, connected to MongoDB for data persistence.

## Features

- ✅ **Dark Theme UI** - Modern, professional dark interface
- ✅ **Conversation Analytics** - Track conversation data with detailed metrics
- ✅ **Real-time Data** - Live updates and status management
- ✅ **Search Functionality** - Filter conversations by location/region
- ✅ **CRUD Operations** - Create, Read, Update, Delete conversations
- ✅ **Status Management** - Play/Pause conversation status
- ✅ **Export Capability** - Download conversation data
- ✅ **MongoDB Integration** - Robust data storage with Mongoose
- ✅ **TypeScript Support** - Full type safety
- ✅ **Responsive Design** - Works on all device sizes

## Screenshots

The application features:

- **Header**: Chatbot Analytics logo with overlapping chat bubbles, date range selector, and user profile
- **Data Table**: Comprehensive conversation data with columns for ID, Conversation ID, Duration, Region, Timezone, Actions, and Export
- **Search**: Filter conversations by location
- **Actions**: View, Play/Pause, Delete, and Export functionality for each conversation

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB locally on your machine
2. Start MongoDB service
3. Create a database named `chatbot-app`

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/chatbot-app
```

For MongoDB Atlas, use your connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot-app
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Seed Sample Data (Optional)

```bash
npm run seed
```

This will populate the database with sample conversation data matching the design.

## API Endpoints

- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations/[id]` - Get a specific conversation
- `PUT /api/conversations/[id]` - Update a conversation
- `DELETE /api/conversations/[id]` - Delete a conversation

## Conversation Model

The application uses a Conversation model with the following fields:

- `conversationId` (required, unique) - Unique conversation identifier
- `totalConversation` (required) - Total conversation duration
- `duration` (required) - Conversation duration in readable format
- `region` (required) - Geographic region (e.g., US-East, EU-West)
- `timezone` (required) - Time zone abbreviation (e.g., EST, CET)
- `status` (optional) - Conversation status (active/paused)
- `createdAt` - Timestamp when conversation was created
- `updatedAt` - Timestamp when conversation was last updated

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── conversations/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── Header.tsx
│   └── ConversationTable.tsx
├── lib/
│   └── mongodb.ts
└── models/
    └── Conversation.ts
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework for styling
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **React Hooks** - State management and side effects

## Key Features

### Header Component

- **Logo**: Overlapping chat bubble icons with "Chatbot Analytics" title
- **Date Selector**: Dropdown for selecting time periods (Last 7 Days, Last 30 Days, etc.)
- **Action Icons**: Document, Settings, and User Profile icons

### Conversation Table

- **Search**: Filter conversations by region/location
- **Columns**: ID, Conversation ID, Total Conversation, Duration, Region, Timezone, Actions, Export
- **Actions**: View, Play/Pause, Delete, and Export buttons for each row
- **Status Management**: Toggle conversation status between active and paused
- **Responsive**: Works on all screen sizes

### Data Management

- **Real-time Updates**: Data refreshes automatically after operations
- **Error Handling**: Comprehensive error messages and loading states
- **Validation**: Server-side validation for all data operations

## Development

The application is set up with:

- ESLint for code linting
- TypeScript for type safety
- Tailwind CSS for styling
- Hot reloading for development

## Deployment

This application can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- Any platform that supports Node.js

Make sure to set the `MONGODB_URI` environment variable in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## License

MIT License - feel free to use this project for your own purposes.
