# Email Configuration for Password Reset

## Development Mode (Current Setup)
The application is currently running in development mode. When email is not configured:
- Password reset requests will still work
- The reset link will be displayed in the backend console
- Users will see "If that email exists, a reset link was sent." message
- Copy the reset URL from the console to test the password reset flow

## Production Email Setup

### Gmail Configuration (Recommended for Development)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Update your `.env` file:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=your-actual-gmail@gmail.com
```

### Other Email Services
You can also use other email services by updating the configuration:

```env
EMAIL_SERVICE=hotmail  # or yahoo, outlook, etc.
EMAIL_USER=your-email@hotmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@hotmail.com
```

## Testing the Password Reset Flow

### Without Email Configuration (Development)
1. Start the backend server
2. Go to the frontend login page
3. Click "Forgot Password?"
4. Enter any email (even non-existent ones)
5. Check the backend console for the reset URL
6. Copy the URL and paste it in your browser
7. Enter a new password to reset

### With Email Configuration (Production)
1. Configure email settings in `.env`
2. Follow the same steps as above
3. Check your email for the reset link
4. Click the link to reset your password

## Troubleshooting

### Common Issues
1. **500 Internal Server Error**: Usually caused by missing/incorrect email configuration
2. **Invalid token**: Token has expired (1 hour) or is malformed
3. **User not found**: Email doesn't exist in the database

### Debug Mode
The backend will log detailed information about:
- Email sending attempts
- Reset URLs (in development mode)
- Token generation and validation
- User lookup operations
