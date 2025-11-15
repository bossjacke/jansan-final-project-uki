# TODO: Implement Google OAuth Login

- [x] Update backend/src/models/user.model.js to add googleId field
- [x] Install google-auth-library in backend
- [x] Create backend/src/controllers/googleAuth.controller.js with googleLogin function
- [x] Update backend/src/routes/user.routes.js to add POST /google-login route
- [x] Modify frontend/src/components/auth/Login.jsx to include GoogleLogin component
- [x] Update frontend/src/components/auth/Login.css for Google login styling
- [ ] Test both login methods end-to-end
- [ ] Set up Google OAuth credentials (GOOGLE_CLIENT_ID in .env)
