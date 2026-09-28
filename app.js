// CodeCraftHub - Personal Learning Goal Tracker API

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Enable CORS so the frontend running on Live Server
// can communicate with this backend.
app.use(cors());

// Parse incoming JSON request bodies.
app.use(express.json());

// JSON file used as simple persistent storage.
const DATA_FILE = path.join(__dirname, "courses.json");

// Allowed course status values.
const ALLOWED_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed",
];

// Create courses.json automatically if it does not exist.
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
    console.log("Created courses.json");
  }
}

// Read all courses from courses.json.
function readCoursesFromFile() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    throw new Error("Unable to read courses data");
  }
}

// Save all courses to courses.json.
function writeCoursesToFile(courses) {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(courses, null, 2),
      "utf8"
    );
  } catch (error) {
    throw new Error("Unable to save courses data");
  }
}

// Validate YYYY-MM-DD date format.
function isValidDateYYYYMMDD(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = new Date(`${dateString}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === dateString;
}

// Generate the next course ID.
function getNextId(courses) {
  if (courses.length === 0) {
    return 1;
  }

  return Math.max(...courses.map((course) => course.id)) + 1;
}

// ----------------------------------------------------
// CREATE COURSE
// POST /api/courses
// ----------------------------------------------------
app.post("/api/courses", (req, res) => {
  try {
    const {
      name,
      description,
      target_date,
      status,
    } = req.body;

    // Validate required fields.
    if (!name || !description || !target_date || !status) {
      return res.status(400).json({
        message:
          "Missing required fields: name, description, target_date, status",
      });
    }

    // Validate status.
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Allowed values: Not Started, In Progress, Completed",
      });
    }

    // Validate date.
    if (!isValidDateYYYYMMDD(target_date)) {
      return res.status(400).json({
        message: "Invalid target_date. Use YYYY-MM-DD format",
      });
    }

    const courses = readCoursesFromFile();

    const newCourse = {
      id: getNextId(courses),
      name,
      description,
      target_date,
      status,
      created_at: new Date().toISOString(),
    };

    courses.push(newCourse);

    writeCoursesToFile(courses);

    return res.status(201).json(newCourse);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// ----------------------------------------------------
// GET ALL COURSES
// GET /api/courses
// ----------------------------------------------------
app.get("/api/courses", (req, res) => {
  try {
    const courses = readCoursesFromFile();

    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// ----------------------------------------------------
// GET ONE COURSE
// GET /api/courses/:id
// ----------------------------------------------------
app.get("/api/courses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const courses = readCoursesFromFile();

    const course = courses.find(
      (course) => course.id === id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// ----------------------------------------------------
// UPDATE COURSE
// PUT /api/courses/:id
// ----------------------------------------------------
app.put("/api/courses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const {
      name,
      description,
      target_date,
      status,
    } = req.body;

    // All fields are required for the update.
    if (!name || !description || !target_date || !status) {
      return res.status(400).json({
        message:
          "Missing required fields: name, description, target_date, status",
      });
    }

    // Validate status.
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Allowed values: Not Started, In Progress, Completed",
      });
    }

    // Validate date.
    if (!isValidDateYYYYMMDD(target_date)) {
      return res.status(400).json({
        message: "Invalid target_date. Use YYYY-MM-DD format",
      });
    }

    const courses = readCoursesFromFile();

    const courseIndex = courses.findIndex(
      (course) => course.id === id
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Preserve the original created_at timestamp.
    const updatedCourse = {
      id,
      name,
      description,
      target_date,
      status,
      created_at: courses[courseIndex].created_at,
    };

    courses[courseIndex] = updatedCourse;

    writeCoursesToFile(courses);

    return res.status(200).json(updatedCourse);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// ----------------------------------------------------
// DELETE COURSE
// DELETE /api/courses/:id
// ----------------------------------------------------
app.delete("/api/courses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const courses = readCoursesFromFile();

    const courseIndex = courses.findIndex(
      (course) => course.id === id
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const removed = courses.splice(courseIndex, 1)[0];

    writeCoursesToFile(courses);

    return res.status(200).json({
      message: "Course deleted",
      removed,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// Make sure courses.json exists before starting server.
try {
  ensureDataFile();

  app.listen(PORT, () => {
    console.log(
      `CodeCraftHub API running on http://localhost:${PORT}`
    );
  });
} catch (error) {
  console.error("Failed to start server:", error.message);
}