# Airbnb Clone

A full-stack web application that replicates the core functionality of Airbnb. Built with Express.js, EJS, Node.js, and Firebase, this project allows users to create, browse, and manage property listings, complete with a review and rating system.

## Key Features

- User authentication
- CRUD operations for listings
- Image uploads with Cloudinary
- Interactive maps with Mapbox
- Reviews and ratings
- Authorization for listing ownership
- Responsive UI with Bootstrap 5
- Firestore-backed listing, review, and user data

## Tech Stack

- Backend: Node.js, Express.js
- Frontend: EJS templates, Bootstrap
- Database: Firebase Firestore
- Authentication: Firebase Authentication
- Image Storage: Cloudinary
- Maps and Geocoding: Mapbox API

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/atharvpatil15/airbnb-clone.git
cd airbnb-clone
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory and add:

```env
PORT=3000
SECRET=your_session_secret
MAP_TOKEN=your_mapbox_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_WEB_API_KEY=your_firebase_web_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
```

### 4. Run the project

```bash
npm start
```

## Project Structure

```text
airbnb-clone/
|-- controllers/     # Route handlers
|-- routes/          # Express routes
|-- services/        # Firebase Auth and Firestore access
|-- utils/           # Utility functions and Firebase config
|-- views/           # EJS templates
|-- public/          # Static assets
|-- app.js           # Main application file
`-- package.json     # Dependencies and scripts
```

## Environment Setup

Before running the project, make sure you have:

- Node.js
- A Firebase project with Firestore and Authentication enabled
- A Cloudinary account
- A Mapbox account

## Acknowledgments

- Inspired by Airbnb
- Made by Atharv Patil
