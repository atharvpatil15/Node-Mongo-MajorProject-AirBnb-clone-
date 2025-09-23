# 🏡 Airbnb Clone ✨

A full-stack web application that replicates the core functionality of Airbnb. Built with the MEEN (MongoDB, Express.js, EJS, Node.js) stack, this project allows users to create, browse, and manage property listings, complete with a powerful review and rating system.

## 🚀 Key Features

- **🔐 User Authentication**: Secure sign-up, login, and logout powered by Passport.js
- **🏠 CRUD Operations**: Users can create, edit, and delete their own property listings
- **🖼️ Image Hosting**: Seamless image uploads for listings using Cloudinary
- **📍 Interactive Maps**: Integrated Mapbox API for location search and dynamic display of listings on a map
- **⭐ Review System**: A dedicated review and rating system for all listings
- **🛡️ Authorization**: Ensures that only the listing owner can modify or delete their property
- **📱 Responsive UI**: A clean and responsive design built with Bootstrap 5

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS Templates, Bootstrap
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: Passport.js
- **Image Storage**: Cloudinary
- **Maps & Geocoding**: Mapbox API

## ⚙️ Project Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/atharvpatil15/airbnb-clone.git
cd airbnb-clone
```

### 2️⃣ Install dependencies

Navigate to the project directory and install all required packages:

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory and add your secret keys and connection strings:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
MAP_TOKEN=your_mapbox_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
SESSION_SECRET=your_secret_key
```

### 4️⃣ Run the project

Start the application server:

```bash
npm start
```

Now, visit 👉 [https://majorproject-airbnb-clone.onrender.com](https://majorproject-airbnb-clone.onrender.com) in your browser!

## 📂 Project Structure

```
airbnb-clone/
├── models/          # Database models (User, Listing, Review)
├── routes/          # Express routes
├── views/           # EJS templates
├── public/          # Static files (CSS, JS, images)
├── middleware/      # Custom middleware functions
├── utils/           # Utility functions
├── .env             # Environment variables
├── app.js           # Main application file
└── package.json     # Dependencies and scripts
```

## 🌟 Getting Started

1. **Sign up** for a new account or **log in** with existing credentials
2. **Browse listings** on the homepage or use the interactive map
3. **Create your own listing** by clicking "Add New Listing"
4. **Upload images** and provide detailed property information
5. **Manage your listings** from your dashboard
6. **Leave reviews** and ratings for properties you've experienced

## 🔧 Environment Setup

Before running the project, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local installation or Atlas cloud database)
- Cloudinary account for image storage
- Mapbox account for maps and geocoding

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. **Clone the project**
   ```bash
   git clone https://github.com/atharvpatil15/airbnb-clone.git
   cd airbnb-clone
   ```

2. **Create your feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes** and test them thoroughly
#
4. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

5. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request** on GitHub
##
## 📝 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Real-time chat between hosts and guests
- [ ] Advanced search filters
- [ ] Email notifications
- [ ] Mobile app version
- [ ] Multi-language support


## 🙏 Acknowledgments

- Inspired by the original Airbnb platform
- Built with love and lots of coffee ☕

---

**Made with ❤️ by Atharv Patil**
