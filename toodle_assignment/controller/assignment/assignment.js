const formatResponse = require("../../response_handler/response_handler");
const pool = require("../../dbConfig/db");
const assignment_validator = require("../../validators/assignment_validator");
const logger = require("../../utils/logger");
const constant = require("../../utils/constant");

// Define the asynchronous function for creating a surveyor
exports.createAssignment = async (req, res) => {
  if (req?.user?.role == constant.role.student) {
    const response = formatResponse(
      401,
      "Students are not allowed to create assignments",
      []
    );
    return res.status(401).json(response);
  }

  //logger
  logger.info("API to create assignment");
  const client = await pool.connect();

  try {
    // Destructure data from the request body
    const { description, assigned_to, published_at, ending_at } = req.body;

    try {
      // Validate input data against the schema using farm_app_validator
      await assignment_validator.createAssignment.validate({
        description,
        assigned_to,
        published_at,
        ending_at,
      });
    } catch (validationError) {
      // Handle validation errors and send a 400 Bad Request response
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }

    //Create Assignments and assign to students

    // status 1 for SCHEDULED & 2 for On GOING

    const query = `
    WITH new_assignment AS (
      INSERT INTO assignment (description, published_at, ending_at, status, created_by)
      VALUES ('${description}', ${published_at}, ${ending_at}, CASE WHEN ${published_at}::bigint > EXTRACT(EPOCH FROM NOW())*1000::bigint THEN 1 ELSE 2 END, ${req.user.id})
      RETURNING assignment_id
    )
    INSERT INTO student_assigned_list (assignment_id, assigned_to,assigned_by)
    SELECT assignment_id, unnest($1::int[]) ,$2  FROM new_assignment RETURNING *
  `;

    const assignmentResult = await client.query(query, [
      assigned_to,
      req.user.id,
    ]);

    // Check if the database operation was successful
    if (assignmentResult?.rowCount || assignmentResult.rows) {
      // If successful, send a 200 OK response with the success message
      const response = formatResponse(200, "Request Success", [
        assignmentResult.rows,
      ]);
      res.status(200).json(response);
    } else {
      // If the operation was unsuccessful, send a 400 Bad Request response
      const response = formatResponse(400, "Something went wrong", []);
      res.status(400).json(response);
    }
  } catch (error) {
    // Handle any unexpected errors and send a 400 Bad Request response
    const response = formatResponse(400, String(error), []);
    res.status(400).json(response);
  } finally {
    client.release();
  }
};

exports.updateAssignment = async (req, res) => {
  if (req?.user?.role == constant.role.student) {
    const response = formatResponse(
      401,
      "Students are not allowed to update assignments",
      []
    );
    return res.status(401).json(response);
  }
  const client = await pool.connect();
  try {
    // Destructure data from the request body
    const { assignment_id, description, assigned_to, published_at, ending_at } =
      req.body;

    try {
      // Validate input data against the schema using farm_app_validator
      await assignment_validator.updateAssignment.validate({
        assignment_id,
        description,
        assigned_to,
        published_at,
        ending_at,
      });
    } catch (validationError) {
      // Handle validation errors and send a 400 Bad Request response
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }

    //Create Assignments and assign to students

    // status 1 for SCHEDULED & 2 for On GOING

    const query = `WITH updated_assignment AS (
      UPDATE assignment
      SET description = COALESCE($1,assignment.description), 
          published_at = COALESCE($2,assignment.published_at), 
          ending_at = COALESCE($3,assignment.ending_at) ,
          updated_at = ${Date.now()},
          updated_by = ${req.user.id}
      WHERE assignment_id = $4 
      RETURNING *, created_by AS updated_assigned_by
    ),
    deleted_students AS (
      DELETE FROM student_assigned_list
      WHERE assignment_id = $4 
        AND assigned_to NOT IN (${assigned_to})  
      RETURNING assignment_id, assigned_to, NULL AS updated_data
    ),
    inserted_students AS (
      INSERT INTO student_assigned_list (assignment_id, assigned_to, assigned_by)
      SELECT $4, value, ua.updated_assigned_by  
      FROM UNNEST($5::int[]) AS value 
      CROSS JOIN updated_assignment ua  
            ON CONFLICT (assignment_id, assigned_to) DO NOTHING
      RETURNING assignment_id, assigned_to, NULL AS updated_data
    )
    SELECT * FROM updated_assignment`;

    const assignmentResult = await client.query(query, [
      description,
      published_at,
      ending_at,
      assignment_id,
      assigned_to,
    ]);

    // Check if the database operation was successful
    if (assignmentResult?.rows) {
      // If successful, send a 200 OK response with the success message
      const response = formatResponse(
        200,
        "Assignment Updated Successfully",
        assignmentResult.rows
      );
      res.status(200).json(response);
    } else {
      // If the operation was unsuccessful, send a 400 Bad Request response
      const response = formatResponse(400, "Something went wrong", []);
      res.status(400).json(response);
    }
  } catch (error) {
    // Handle any unexpected errors and send a 400 Bad Request response
    const response = formatResponse(400, String(error), []);
    res.status(400).json(response);
  } finally {
    client.release();
  }
};

exports.deleteAssignment = async (req, res) => {
  if (req?.user?.role == constant.role.student) {
    const response = formatResponse(
      401,
      "Students are not allowed to delete assignments",
      []
    );
    return res.status(401).json(response);
  }
  const client = await pool.connect();
  try {
    // Destructure data from the request body
    const { assignment_id } = req.query;

    try {
      // Validate input data against the schema using farm_app_validator
      await assignment_validator.deleteAssignment.validate({
        assignment_id,
      });
    } catch (validationError) {
      // Handle validation errors and send a 400 Bad Request response
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }

    //Delete Assignment (ON CASCADE IS APPLIED)

    const query = `DELETE FROM assignment WHERE assignment_id = ${assignment_id}`;

    const assignmentResult = await client.query(query);

    // Check if the database operation was successful
    if (assignmentResult?.rowCount) {
      // If successful, send a 200 OK response with the success message
      const response = formatResponse(
        200,
        "Assignment Delete Successfully!",
        []
      );
      res.status(200).json(response);
    } else {
      // If the operation was unsuccessful, send a 400 Bad Request response
      const response = formatResponse(400, "Assignment not found", []);
      res.status(400).json(response);
    }
  } catch (error) {
    // Handle any unexpected errors and send a 400 Bad Request response
    const response = formatResponse(400, String(error), []);
    res.status(400).json(response);
  } finally {
    client.release();
  }
};

exports.getAssignmentDetails = async (req, res) => {
  const client = await pool.connect();
  try {
    // Destructure data from the request body
    const { assignment_id } = req.query;

    try {
      // Validate input data against the schema using farm_app_validator
      await assignment_validator.getAssignmentDetails.validate({
        assignment_id,
      });
    } catch (validationError) {
      // Handle validation errors and send a 400 Bad Request response
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }
    let get_all_submission_result;
    if (req.user.role == constant.role.tutor) {
      const get_all_submission = `SELECT * FROM student_assigned_list WHERE  assignment_id = ${assignment_id} AND status = 1`;
      get_all_submission_result = await client.query(get_all_submission);
    } else {
      const get_all_submission = `SELECT * FROM student_assigned_list WHERE assigned_to = ${req.user.id} AND assignment_id = ${assignment_id} AND status = 1`;
      get_all_submission_result = await client.query(get_all_submission);
    }

    // Check if the database operation was successful
    if (
      get_all_submission_result?.rowCount ||
      get_all_submission_result?.rows
    ) {
      // If successful, send a 200 OK response with the success message
      const response = formatResponse(
        200,
        "Assignment Fetched Successfully!",
        get_all_submission_result.rows
      );
      res.status(200).json(response);
    } else {
      // If the operation was unsuccessful, send a 400 Bad Request response
      const response = formatResponse(
        400,
        "No Assignment Submission Done!",
        []
      );
      res.status(400).json(response);
    }
  } catch (error) {
    // Handle any unexpected errors and send a 400 Bad Request response
    const response = formatResponse(400, String(error), []);
    res.status(400).json(response);
  } finally {
    client.release();
  }
};

exports.addSubmission = async (req, res) => {
  if (req.user.role != constant.role.student) {
    const response = formatResponse(
      401,
      "Only Students can submit the assignment",
      []
    );
    return res.status(401).json(response);
  }
  const client = await pool.connect();
  try {
    // Destructure data from the request body
    const { assignment_id, remark } = req.body;

    try {
      // Validate input data against the schema using farm_app_validator
      await assignment_validator.addSubmission.validate({
        assignment_id,
        remark,
      });
    } catch (validationError) {
      // Handle validation errors and send a 400 Bad Request response
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }

    //Submit Student Assignment if the assignment is ongoing & student hasn't submitted it
    const query = `
    UPDATE student_assigned_list
    SET remark = '${remark}', 
        status = 1,
        updated_at = ${Date.now()}
    WHERE assignment_id = ${assignment_id} 
      AND assigned_to = ${req.user.id} AND status = 0
      AND EXISTS (
        SELECT 1
        FROM assignment
        WHERE assignment_id = ${assignment_id} 
          AND published_at <= ${Date.now()} AND ending_at >= ${Date.now()}
      )
  `;

    const submission__result = await client.query(query);

    // Check if the database operation was successful
    if (submission__result?.rowCount) {
      // If successful, send a 200 OK response with the success message
      const response = formatResponse(
        200,
        "Assignment Submitted Successfully!",
        []
      );
      res.status(200).json(response);
    } else {
      // If the operation was unsuccessful, send a 400 Bad Request response
      const response = formatResponse(
        400,
        "Either ASSIGNMENT IS NOT PUBLISHED YET OR YOU HAVE ALREADY FILLED THE ASSIGNMENT",
        []
      );
      res.status(400).json(response);
    }
  } catch (error) {
    // Handle any unexpected errors and send a 400 Bad Request response
    const response = formatResponse(400, String(error), []);
    res.status(400).json(response);
  } finally {
    client.release();
  }
};

exports.getAssignmentFeedDetails = async (req, res) => {
  const client = await pool.connect();
  try {
    // Destructure data from the request body
    let { assignment_status, submission_status } = req.query;

    assignment_status = assignment_status || null;
    submission_status = submission_status || null;

    try {
      // Validate input data against the schema using farm_app_validator
      await assignment_validator.getAssignmentFeedDetails.validate({
        assignment_status,
        submission_status,
      });
    } catch (validationError) {
      // Handle validation errors and send a 400 Bad Request response
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }

    let assignmentFeedResult;

    // Get User Assignment Feed
    if (req?.user?.role == constant.role.tutor) {
      // If user is Tutor
      const query = `
      SELECT * FROM assignment WHERE created_by = ${req.user.id} 
      AND
    CASE
        WHEN ${assignment_status} = 1 AND published_at >= ${Date.now()} THEN true
        WHEN ${assignment_status} = 2 AND published_at < ${Date.now()} AND ending_at > ${Date.now()} THEN true
        ELSE false
    END

  `;

      assignmentFeedResult = await client.query(query);
    }

    //  if user is student
    else if (req?.user?.id == constant.role.student) {
      const query = `
      SELECT sal.*
      FROM student_assigned_list sal
      JOIN assignment a ON sal.assignment_id = a.assignment_id
      WHERE sal.assigned_to = ${req.user.id}
          AND (
              ${submission_status} IS NULL 
              OR sal.status = ${submission_status}
          )
          AND (
              (
                  ${assignment_status} = 1 AND a.published_at >= ${Date.now()}
              )
              OR (
                  ${assignment_status} = 2 AND a.published_at < ${Date.now()} AND a.ending_at > ${Date.now()}
              )
              OR ${assignment_status} IS NULL 
          )
  `;

      assignmentFeedResult = await client.query(query);
    }

    // Check if the database operation was successful
    if (assignmentFeedResult?.rowCount || assignmentFeedResult.rows) {
      // If successful, send a 200 OK response with the success message
      const response = formatResponse(
        200,
        "Assignment Feed Fetched Successfully!",
        assignmentFeedResult.rows
      );
      res.status(200).json(response);
    } else {
      // If the operation was unsuccessful, send a 400 Bad Request response
      const response = formatResponse(400, "Assignment not found", []);
      res.status(400).json(response);
    }
  } catch (error) {
    // Handle any unexpected errors and send a 400 Bad Request response
    const response = formatResponse(400, String(error), []);
    res.status(400).json(response);
  } finally {
    client.release();
  }
};
