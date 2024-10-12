const express = require('express')
const router = express.Router()
const cors= require('cors')
const {test, registerUser, loginUser} = require('../controllers/authController.js')
const User = require('../models/user.js')
const Grade = require('../models/Grade.js');
const { verifyToken, isAdmin } = require('./authmiddleware.js'); 

//middleware for router
router.use(cors());




router.get('/', test);

router.post('/register', registerUser)
router.post('/login', loginUser)
// Fetch users excluding the admin
router.get('/api/users', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }, 'name email scienceField'); // Exclude admin users
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

 // Import the Grade model if not already imported

// Delete a user and their grades
router.delete('/api/users/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Delete the user's grades
        await Grade.deleteMany({ userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User and their grades deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
 

module.exports= router;