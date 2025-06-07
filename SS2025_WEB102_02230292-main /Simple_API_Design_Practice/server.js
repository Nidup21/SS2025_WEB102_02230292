// Part 2: Get a Single Student by ID

// Step 1: Import the required modules
const express = require('express'); // Import Express framework
const app = express(); // Create an Express application
const PORT = 3000; // Define the port number for the server

// Step 2: Create a mock database (array of student objects)
const students = [
    { id: 1, name: "takchey", age: 24, course: "Software Engineering" },
    { id: 2, name: "kchoeying", age: 22, course: "Computer Science" },
    { id: 3, name: "motay", age: 21, course: "Information Technology" },
    { id: 4, name: "menlam", age: 20, course: "Water Engineering" },
    { id: 5, name: "cbaby", age: 19, course: "Civil Engineering" },
    { id: 6, name: "buddha", age: 18, course: "Business Intelligence" }
];

// Step 3: Create routes

// Handle GET request for the root URL "/"
app.get('/', (req, res) => {
    res.send("Get a Single Student by ID"); // Send a welcome message
});

// Handle GET request to retrieve all students
app.get('/students', (req, res) => {
    res.json(students); // Return the list of students in JSON format
});

// Handle GET request to retrieve a specific student by ID
app.get('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id); // Extract and convert ID from URL parameter
    const student = students.find(s => s.id === studentId); // Find student by ID

    if (student) {
        res.json(student); // Return the student data if found
    } else {
        res.status(404).json({ message: "Student not found" }); // Send 404 error if student doesn't exist
    }
});

// Step 4: Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`); // Display a message when the server starts
});
