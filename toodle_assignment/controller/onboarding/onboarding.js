// Import necessary dependencies and libraries
const login_validator = require("../../validators/onboarding_validator");
const formatResponse = require("../../response_handler/response_handler");
const pool = require("../../dbConfig/db");
const bcrypt = require("bcrypt");
const logger = require("../../utils/logger");
const jwt = require("jsonwebtoken");

// Define and export your function to check if an user belongs to an DB.
exports.login = async (req, res) => {
  //logger
  logger.info("API to check wether user exits or not in DB");

  const client = await pool.connect(); // Establish a connection to the database using a connection pool.
  try {
    const { username, password } = req.body;

    try {
      // Validate the input data against a predefined schema.
      await login_validator.login.validate({
        username,
        password,
      });
    } catch (validationError) {
      // Handle validation errors and send a response.
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }

    //logger

    logger.info("Check user using username", {
      customVars: {
        username: username,
      },
    });

    await client.query("BEGIN"); // Start a transaction in the database.

    // SQL query to check if the user belongs  and is not marked as deleted.
    const check_user = `SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND status = 1`;

    //logger
    logger.info("Query to check user exist of not and is non deleted");

    const check_user_result = await client.query(check_user, [username]);

    if (check_user_result?.rowCount) {
      const hashedPassword = check_user_result.rows[0].password;

      const passwordMatch = await bcrypt.compare(password, hashedPassword);

      if (passwordMatch) {
        delete check_user_result.rows[0].password;
        // creating JWT Token
        const token = jwt.sign(
          check_user_result.rows[0],
          process.env.jwt_secret_key,
          { expiresIn: process.env.expirationTime }
        );
        check_user_result.rows[0].token = token;

        const response = formatResponse(
          200,
          "User Found Successfully",
          check_user_result.rows[0]
        );
        res.status(200).json(response);
      } else {
        // Passwords do not match
        const response = formatResponse(400, "Passwords do not match", []);
        res.status(400).json(response);
      }
    } else {
      await client.query("ROLLBACK"); // Rollback the transaction if the admin is not found.
      const response = formatResponse(400, "User not found", []);
      res.status(400).json(response);
    }
  } catch (error) {
    // Handle any other errors that might occur during execution.
    const response = formatResponse(400, String(error), []);
    res.status(400).json(response);
  } finally {
    client.release();
  }
};
