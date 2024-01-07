const Yup = require("yup");

// Schema for validating the request to check if a user is an admin
const login = Yup.object().shape({
  username: Yup.string().required(),
  password: Yup.string().required(),
});

// Export the Yup schema for use in other parts of the application
module.exports = {
  login,
};
