const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const User = require('./models/user.js');
const Grade = require('./models/Grade.js');
dotenv.config();
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('./helpers/auth.js');

const app = express();
const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to MongoDB'));

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({extended: false}))








app.use('/',require('./routes/authRoute.js'));

app.get('/api/grades', async(req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;
      const grades = await Grade.find({ email });
        res.json(grades);
     
  } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
  }
});



app.get('/api/user', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await User.findOne({ email }); // Use findOne to get a single user
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json( user ); // Return only the user's name
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

app.post('/api/grades', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;
      const { moduleName, grade, term } = req.body;

      if (!moduleName || !grade|| !term) {
          return res.status(400).json({ message: 'Module name and grade are required' });
      }

      const newGrade = new Grade({ email, moduleName, grade, term });
      await newGrade.save();
      res.status(201).json(newGrade);
  } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
  }
});

//delete endpoint

app.delete('/api/grades/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;

      const grade = await Grade.findOneAndDelete({ _id: req.params.id, email });
      if (!grade) {
          return res.status(404).json({ message: 'Grade not found or not authorized' });
      }

      res.status(200).json({ message: 'Grade deleted successfully' });
  } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
  }
});
 //modify endpoint
 app.put('/api/grades/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;
      const { moduleName, grade ,term} = req.body;

      if (!moduleName || !grade|| !term) {
          return res.status(400).json({ message: 'Module name and grade are required' });
      }

      const updatedGrade = await Grade.findOneAndUpdate(
          { _id: req.params.id, email },
          { moduleName, grade,term },
          { new: true }
      );

      if (!updatedGrade) {
          return res.status(404).json({ message: 'Grade not found or not authorized' });
      }

      res.json(updatedGrade);
  } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.delete('/api/user', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }
  
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;
  
      // Delete all grades associated with the user
      await Grade.deleteMany({ email });
  
      // Delete the user
      const user = await User.findOneAndDelete({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found or not authorized' });
      }
  
      res.status(200).json({ message: 'User and all associated grades deleted successfully' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  });

// Edit account details

app.put('/api/user', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }
  
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;
  
      const { name, newEmail, currentPassword, newPassword } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (currentPassword && newPassword) {
        const isPasswordCorrect = await comparePassword(currentPassword, user.password);
        if (!isPasswordCorrect) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }
        user.password = await hashPassword(newPassword);
      }
  
      if (name) {
        user.name = name;
      }
  
      if (newEmail) {
        user.email = newEmail;
      }
  
      await user.save();
      res.status(200).json({ message: 'Account updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  });
/*
// showing Rank
app.get('/api/ranks', async (req, res) => {
  try {
    // Aggregate grades by user
    const userGrades = await Grade.aggregate([
      {
        $group: {
          _id: '$email',
          totalGrade: { $sum: '$grade' }, // Change to $avg for average grade
        },
      },
      {
        $sort: { totalGrade: -1 }, // Sort by totalGrade in descending order
      },
    ]);

    // Map ranks
    const ranks = userGrades.map((userGrade, index) => ({
      email: userGrade._id,
      totalGrade: userGrade.totalGrade,
      rank: index + 1,
    }));

    res.json(ranks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
*/
app.get('/api/ranks', async (req, res) => {
  try {
    const term = parseInt(req.query.term, 10);

    // Validate term
    if (!term || term < 1 || term > 6) {
      return res.status(400).json({ message: 'Invalid term' });
    }

    const users = await User.aggregate([
      {
        $match: { role: { $ne: 'admin' } } // Exclude admin users
      },
      {
        $lookup: {
          from: 'grades',
          localField: 'email',
          foreignField: 'email',
          as: 'grades'
        }
      },
      {
        $addFields: {
          grades: {
            $filter: {
              input: '$grades',
              as: 'grade',
              cond: { $eq: ['$$grade.term', term] }
            }
          }
        }
      },
      {
        $addFields: {
          totalGrade: { $sum: '$grades.grade' }
        }
      },
      {
        $sort: { totalGrade: -1 }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          totalGrade: 1
        }
      }
    ]);

    const ranks = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      totalGrade: user.totalGrade
    }));

    res.json(ranks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/grades/exist', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;
      const { moduleName, term } = req.query;

      // Check if the moduleName and term are provided
      if (!moduleName || !term) {
          return res.status(400).json({ message: 'Module name and term are required' });
      }

      // Find grades for the specific module and term
      const existingGrades = await Grade.findOne({ email, moduleName, term });
      
      // Return whether grades exist
      if (existingGrades) {
          return res.json({ exists: true });
      } else {
          return res.json({ exists: false });
      }
  } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.get('api/work', (req, res) => {
  res.send('Hello, World! The server is running.');
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});