const Yup = require("yup");

// Schema for validating the request to check if a user is an admin
const createAssignment = Yup.object().shape({
  description: Yup.string().required().min(3),
  assigned_to: Yup.array().required(),
  published_at: Yup.string().required().length(13),
  ending_at: Yup.string().required().length(13),
});

const updateAssignment = Yup.object().shape({
  assignment_id: Yup.number().required(),
  description: Yup.string().optional().min(3),
  assigned_to: Yup.array().required(),
  published_at: Yup.string().optional().length(13),
  ending_at: Yup.string().optional().length(13),
});

const deleteAssignment = Yup.object().shape({
  assignment_id: Yup.number().required(),
});

const getAssignmentDetails = Yup.object().shape({
  assignment_id: Yup.number().required(),
});

const addSubmission = Yup.object().shape({
  assignment_id: Yup.number().required(),
  remark: Yup.string().required().min(5),
});

const getAssignmentFeedDetails = Yup.object().shape({
  published_at: Yup.string().optional(),
  status: Yup.number().optional(),
});

// Export the Yup schema for use in other parts of the application
module.exports = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentDetails,
  addSubmission,
  getAssignmentFeedDetails,
};
