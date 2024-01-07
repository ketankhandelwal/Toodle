// Import the required modules
const express = require("express");
const router = express.Router();

// Import the user onboarding controller
const assignment = require("../controller/assignment/assignment");
const authenticateUser = require("../public/middleware/authMiddleware");

/* Define routes for admin onboarding */

// Check if a admin exists based on certain criteria
router.post("/createAssignment", authenticateUser, assignment.createAssignment);
router.delete(
  "/deleteAssignment",
  authenticateUser,
  assignment.deleteAssignment
);
router.post("/updateAssignment", authenticateUser, assignment.updateAssignment);
router.get(
  "/getAssignmentDetails",
  authenticateUser,
  assignment.getAssignmentDetails
);
router.patch("/addSubmission", authenticateUser, assignment.addSubmission);
router.get(
  "/getAssignmentFeed",
  authenticateUser,
  assignment.getAssignmentFeedDetails
);

// Export the router to be used in the application
module.exports = router;
