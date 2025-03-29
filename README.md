# Helix - AI Recruiting Assistant

Helix is an AI-powered recruiting assistant that helps recruiters create personalized outreach sequences for candidates. It leverages modern AI technologies to generate engaging messages that improve response rates.

## Features

- User authentication and profile management
- AI-powered chat interface for crafting recruiting messages
- Automatic generation of recruiting outreach sequences
- Real-time updates using Socket.IO
- Modern, responsive UI with React and TypeScript

## Tech Stack

- **Frontend**: React with TypeScript, styled-components
- **Backend**: Flask (Python)
- **Database**: PostgreSQL (via Neon DB)
- **AI**: OpenAI GPT-4

## Setup and Installation

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- PostgreSQL database (or Neon DB account)
- ngrok account (for exposing local server)

### Database Setup

1. Use your existing PostgreSQL database or create a Neon DB account at https://neon.tech
2. Set up your database credentials in the backend environment variables

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Install dependencies:
```
npm install
```

3. Configure environment variables by creating or updating the `.env` file with:
```
# Database credentials
DATABASE_URL=your_database_connection_string
# Or individual credentials:
NEON_DB_USER=your_db_username
NEON_DB_PASSWORD=your_db_password
NEON_DB_HOST=your_db_host
NEON_DB_NAME=your_db_name

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
SITE_URL=http://localhost:3000
```

4. Set up the database:
```
npm run db:setup
```

5. Start the backend server:
```
npm run dev
```

The server will run on http://localhost:8000 by default.

### Frontend Setup

1. Navigate to the frontend directory:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Create or update a `.env` file with:
```
REACT_APP_API_URL=http://localhost:8000
```

4. Start the frontend development server:
```
npm start
```

The frontend will be available at http://localhost:3000.

## Using ngrok to Expose Your Local Server

To make your application accessible from the internet:

1. Install ngrok: 
   - Download from https://ngrok.com/download or
   - Install via npm: `npm install -g ngrok`

2. Sign up for an ngrok account and get your authtoken

3. Configure ngrok with your authtoken:
```
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

4. Start ngrok to expose your frontend:
```
ngrok http 3000
```

5. You will see output similar to:
```
Forwarding https://xxxx-xxx-xxx-xx.ngrok-free.app -> http://localhost:3000
```

6. Update your backend `.env` file with the ngrok URL:
```
SITE_URL=https://xxxx-xxx-xxx-xx.ngrok-free.app
```

7. Restart your backend server to apply the changes

Now your application should be accessible through the ngrok URL from anywhere on the internet.

## Troubleshooting

- If you encounter CORS issues, ensure your backend is properly configured to accept requests from the frontend's origin
- Check that all environment variables are correctly set
- Verify your database connection is working properly
- If using ngrok, make sure to update the SITE_URL in your backend configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details. 