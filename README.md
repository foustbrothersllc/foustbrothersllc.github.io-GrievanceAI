# Grievance AI

Contract Analysis and Grievance Filing System for UPS union workers.

## Features
- User authentication with Firebase
- Contract upload and analysis
- Grievance document generation
- Secure cloud storage

## Tech Stack
- Next.js 14
- React 18
- Firebase
- Tailwind CSS
- Vercel (hosting)

## Getting Started

### Local Development (Optional)
```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### Deployment to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

4. Deploy!

## Firebase Setup
- Project ID: `contract-analyzer-d52f6`
- Enable Email/Password authentication
- Create test users in Firebase Console

## Project Structure
```
GrievanceAI/
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   ├── dashboard/      # User dashboard
│   ├── layout.jsx      # Root layout
│   ├── page.jsx        # Home page
│   └── globals.css     # Global styles
├── lib/
│   └── firebase.js     # Firebase config
├── public/             # Static assets
├── package.json
├── next.config.js
├── jsconfig.json       # Path aliases
├── tailwind.config.js
└── postcss.config.js
```

## Users
- Admin: Jacob Foust
- Union Workers: ~10 users (to be added)

## Notes
- Firebase credentials are hardcoded in `lib/firebase.js`
- All styling uses UPS brand colors
- Responsive design for mobile and desktop
