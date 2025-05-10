
# Time Capsule API

A backend service to store time-locked messages ('time capsules') with authentication and expiration features.

## Features

- User authentication with JWT
- Create time capsules with unlock dates
- Retrieve capsules only after unlock time with correct code
- List, update, and delete capsules
- Automatic expiration of capsules 30 days after unlock time
- Pagination for capsule listings

## Technologies

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Jest (for testing)

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Running Tests `npm test`
5. Start the server: `npm run dev`

## Running Tests

```bash
npm test
