# CodeCraftHub

## Project Overview

**CodeCraftHub** is a simple personalized learning goal tracker REST API for developers.

It allows users to create and manage learning courses using **Node.js and Express**. Course information is stored in a local JSON file called `courses.json`, so no database or authentication system is required.

## Features

- Full CRUD REST API for courses
- Create, read, update, and delete courses
- Auto-generated course ID starting from 1
- Auto-generated `created_at` timestamp
- Course data stored in `courses.json`
- Automatically creates `courses.json` if it does not exist
- Validation for required fields
- Validation for course status
- Validation for `target_date` format
- Error handling for missing courses and file operations

### Allowed Course Status Values

- `Not Started`
- `In Progress`
- `Completed`

## Installation Instructions

Make sure Node.js and npm are installed.

Install the required dependencies:

```bash
npm install
```

## How to Run the Application

Start the server using:

```bash
npm start
```

Alternatively:

```bash
node app.js
```

The API server runs on:

```text
http://localhost:5000
```

The application automatically creates `courses.json` on the first run if the file does not already exist.

## API Endpoints

Base URL:

```text
http://localhost:5000/api/courses
```

### 1. Create a Course

**POST `/api/courses`**

Example request:

```bash
curl -X POST http://localhost:5000/api/courses -H "Content-Type: application/json" -d '{"name":"JavaScript Basics","description":"Learn JavaScript fundamentals","target_date":"2026-10-31","status":"Not Started"}'
```

Example course data:

```json
{
  "name": "JavaScript Basics",
  "description": "Learn JavaScript fundamentals",
  "target_date": "2026-10-31",
  "status": "Not Started"
}
```

A successful request returns HTTP status `201 Created`.

### 2. Get All Courses

**GET `/api/courses`**

```bash
curl http://localhost:5000/api/courses
```

Returns all stored courses.

### 3. Get a Course by ID

**GET `/api/courses/:id`**

Example:

```bash
curl http://localhost:5000/api/courses/1
```

Returns the course with the specified ID.

If the course does not exist, the API returns `404 Not Found`.

### 4. Update a Course

**PUT `/api/courses/:id`**

Example:

```bash
curl -X PUT http://localhost:5000/api/courses/1 -H "Content-Type: application/json" -d '{"name":"JavaScript Basics","description":"Learning JavaScript fundamentals and REST APIs","target_date":"2026-10-31","status":"In Progress"}'
```

All required fields must be included in the request.

### 5. Delete a Course

**DELETE `/api/courses/:id`**

Example:

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

The API returns a confirmation message when the course is successfully deleted.

## Course Structure

Each course contains:

```json
{
  "id": 1,
  "name": "JavaScript Basics",
  "description": "Learn JavaScript fundamentals",
  "target_date": "2026-10-31",
  "status": "Not Started",
  "created_at": "Automatically generated timestamp"
}
```

## Troubleshooting

### courses.json is not created

Make sure the application has permission to write files in the project directory. Restart the server and check the terminal for errors.

### Course not found

Use:

```bash
curl http://localhost:5000/api/courses
```

to check the IDs of existing courses.

### Invalid status

The `status` value must be exactly one of:

```text
Not Started
In Progress
Completed
```

### Invalid target date

The `target_date` must use the following format:

```text
YYYY-MM-DD
```

Example:

```text
2026-10-31
```

### Missing required fields

Every course must include:

- `name`
- `description`
- `target_date`
- `status`

### Server does not start

Install the dependencies:

```bash
npm install
```

Then start the application:

```bash
npm start
```

The server uses port `5000`.

## Technologies Used

- JavaScript
- Node.js
- Express
- JSON file storage
- REST API
- curl