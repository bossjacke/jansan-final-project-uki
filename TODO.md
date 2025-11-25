# Task: Fix and Improve Frontend and Backend Project

## Backend
- [ ] Implement Stripe webhook handler to update orders on payment success
- [ ] Add raw body parsing middleware specifically for Stripe webhook route in app.js
- [ ] Replace console.log calls with structured logger throughout backend controllers and middleware
- [ ] Parallelize stock update in cancelOrder controller using Promise.all
- [ ] Introduce configurable delivery date duration instead of hardcoded 3 days
- [ ] Minor improvements for consistent logs, error handling, and environment variable use

## Frontend
- [ ] Remove or conditionally disable console.log debugging in api.js for production
- [ ] Standardize API function naming style (camelCase preferred)
- [ ] Validate environment variables usage and fallback defaults in API calls

## Testing & Validation
- [ ] Test all payment flows including Stripe payments and webhook updates
- [ ] Test order creation, cancellation, and status updates
- [ ] Test frontend forms and API responses for errors and validations

---

I will start with the backend webhook and related backend fixes first.
