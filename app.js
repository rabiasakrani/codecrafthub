// app.js
// CodeCraftHub - Simple Course Tracking REST API
// Course data is stored in courses.json (no database).

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Configuration
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "courses.json");

const ALLOWED_STATUS = [
  "Not Started",
  "In Progress",
  "Completed"
];

// Create courses.json automatically if it does not exist
function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify([], null, 2),
        "utf-8"
      );

      console.log("Created courses.json");
    }
  } catch (err) {
    console.error("Failed to create courses.json:", err);
    process.exit(1);
  }
}

// Read all courses from courses.json
function readCoursesFromFile() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");

    if (!raw.trim()) {
      return [];
    }

    const courses = JSON.parse(raw);

    if (!Array.isArray(courses)) {
      return [];
    }

    return courses;
  } catch (err) {
    throw new Error(`File read error: ${err.message}`);
  }
}

// Write courses to courses.json
function writeCoursesToFile(courses) {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(courses, null, 2),
      "utf-8"
    );
  } catch (err) {
    throw new Error(`File write error: ${err.message}`);
  }
}

// Validate target_date format
function isValidDateYYYYMMDD(value) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(value)) {
    return false;
  }

  const date = new Date(value + "T00:00:00");

  return !Number.isNaN(date.getTime());
}

// Generate the next course ID
function getNextId(courses) {
  if (courses.length === 0) {
    return 1;
  }

  const maxId = courses.reduce((max, course) => {
    return course.id > max ? course.id : max;
  }, 0);

  return maxId + 1;
}

// Ensure data file exists before starting the API
ensureDataFile();

/*
 * POST /api/courses
 * Add a new course
 */
app.post("/api/courses", (req, res) => {
  try {
    const {
      name,
      description,
      target_date,
      status
    } = req.body;

    // Check required fields
    if (!name || !description || !target_date || !status) {
      return res.status(400).json({
        message:
          "Missing required fields: name, description, target_date, status"
      });
    }

    // Check status
    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({
        message:
          `Invalid status. Allowed values: ${ALLOWED_STATUS.join(", ")}`
      });
    }

    // Check target date
    if (!isValidDateYYYYMMDD(target_date)) {
      return res.status(400).json({
        message:
          "Invalid target_date format. Expected YYYY-MM-DD"
      });
    }

    const courses = readCoursesFromFile();

    const newCourse = {
      id: getNextId(courses),
      name,
      description,
      target_date,
      status,
      created_at: new Date().toISOString()
    };

    courses.push(newCourse);

    writeCoursesToFile(courses);

    return res.status(201).json(newCourse);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message
    });
  }
});

/*
 * GET /api/courses
 * Get all courses
 */
app.get("/api/courses", (req, res) => {
  try {
    const courses = readCoursesFromFile();

    return res.json(courses);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message
    });
  }
});

/*
 * GET /api/courses/:id
 * Get one course
 */
app.get("/api/courses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid course id"
      });
    }

    const courses = readCoursesFromFile();

    const course = courses.find(
      (course) => course.id === id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    return res.json(course);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message
    });
  }
});

/*
 * PUT /api/courses/:id
 * Update an existing course
 */
app.put("/api/courses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid course id"
      });
    }

    const {
      name,
      description,
      target_date,
      status
    } = req.body;

    // Check required fields
    if (!name || !description || !target_date || !status) {
      return res.status(400).json({
        message:
          "Missing required fields: name, description, target_date, status"
      });
    }

    // Check status
    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({
        message:
          `Invalid status. Allowed values: ${ALLOWED_STATUS.join(", ")}`
      });
    }

    // Check target date
    if (!isValidDateYYYYMMDD(target_date)) {
      return res.status(400).json({
        message:
          "Invalid target_date format. Expected YYYY-MM-DD"
      });
    }

    const courses = readCoursesFromFile();

    const index = courses.findIndex(
      (course) => course.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    // Keep the original created_at timestamp
    const updatedCourse = {
      ...courses[index],
      name,
      description,
      target_date,
      status
    };

    courses[index] = updatedCourse;

    writeCoursesToFile(courses);

    return res.json(updatedCourse);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message
    });
  }
});

/*
 * DELETE /api/courses/:id
 * Delete a course
 */
app.delete("/api/courses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid course id"
      });
    }

    const courses = readCoursesFromFile();

    const index = courses.findIndex(
      (course) => course.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    const removed = courses.splice(index, 1)[0];

    writeCoursesToFile(courses);

    return res.json({
      message: "Course deleted",
      removed
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message
    });
  }
});

// Start the server on port 5000
app.listen(PORT, () => {
  console.log(
    `CodeCraftHub API running on http://localhost:${PORT}`
  );
});