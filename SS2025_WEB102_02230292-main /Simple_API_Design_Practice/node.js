
// Part 1: Get all the students

// Import the built-in HTTP module to create a server
const http = require("http");

// A sample array to store a student data
// Consider this as a database for now
const students = [
    { id: 1, name: "Karma", age: 22 },
    { id: 2, name: "Sonam", age: 26 }  
];

// Create an HTTP server
const server = http.createServer((req, res) => {
    // Set response header to JSON format
    res.setHeader("Content-Type", "application/json");

    // Check if the request is a GET request to the homepage "/"
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200); // Set status code to 200
        res.end(JSON.stringify(students)); // Convert students array to JSON and send it
    }

    // If the request doesn't match any of the above routes, return 404 Not Found
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Route not found"}));
    }
});

// Start the server and listen on port 3000
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});




