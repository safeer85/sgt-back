const mongoose = require('mongoose');
const User = require('./user.js'); // Adjust the path according to your project structure

const gradeSchema = new mongoose.Schema({
    email: { type: String, required: true, ref: 'User' },
    moduleName: { type: String, required: true },
    grade: { type: Number, required: true },
    term: { type: Number, required: true }
});

// Subjects for each science field
const biologicalScienceSubjects = ['Biology', 'Physics', 'Chemistry'];
const physicalScienceSubjects = ['Mathematics', 'Physics', 'Chemistry'];

// Pre-save middleware for validation
gradeSchema.pre('save', async function(next) {
    try {
        const user = await User.findOne({ email: this.email });
        if (!user) {
            throw new Error('User not found');
        }
        
        const validSubjects = user.scienceField === 'Biological Science' 
            ? biologicalScienceSubjects 
            : physicalScienceSubjects;

        if (!validSubjects.includes(this.moduleName)) {
            throw new Error(`Invalid subject for ${user.scienceField}: ${this.moduleName}`);
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Grade', gradeSchema);
