// Import the required modules
const express = require("express");
const router = express.Router();

// Import the user onboarding controller
const user_onboarding = require("../controller/onboarding/onboarding");

/* Define routes for admin onboarding */

// Check if a admin exists based on certain criteria
router.post("/login", user_onboarding.login);

// Export the router to be used in the application
module.exports = router;
