const jwt = require("jsonwebtoken");

const formatResponse = require("../../response_handler/response_handler");

// Define the authentication middleware function
const authenticate = async function (req, res, next) {
  // token from the request body

  let token = req.headers["authorization"];

  // If a token is provided, attempt to verify it using Firebase Admin SDK
  if (token) {
    // Verify the JWT token
    jwt.verify(
      token.replace("Bearer ", ""),
      process.env.jwt_secret_key,
      (err, decoded) => {
        if (err) {
          console.error("JWT Verification Error:", err.message);
          const response = formatResponse(401, "Invalid token", []);
          res.status(401).json(response);
        } else {
          // Token is valid, and decoded contains the payload data
          req.user = decoded; // Attach the decoded payload to the request object
          next(); // Continue to the next middleware or route handler
        }
      }
    );
  }

  // If no valid credentials or token are provided, send an error response
  else {
    const response = formatResponse(401, "Invalid Auth", []);
    res.status(401).json(response);
  }
};

// Export the authenticate middleware to be used in other parts of the application
module.exports = authenticate;
