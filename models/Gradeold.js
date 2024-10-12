const mongoose = require('mongoose');

// Define schema for Grade entity
const gradeSchema = new mongoose.Schema({
    email: { type: String,required: true, ref: 'User' }, // Reference to the User model
    moduleName: { type: String, required: true },
    grade: { type: Number, required: true },
    term: { type: Number, required: true }
    // Add more fields as needed (e.g., semester, year, etc.)
});

// Create a model based on schema
const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
