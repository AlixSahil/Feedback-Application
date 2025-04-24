const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

// Oracle Database Configuration
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING,
  privilege: oracledb.SYSDBA
};

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create tables if they don't exist
async function initializeDatabase() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    // Check if table exists first
    const tableExists = await connection.execute(
      `SELECT table_name FROM user_tables WHERE table_name = 'FEEDBACKS'`
    );
    
    if (tableExists.rows.length > 0) {
      console.log('Feedbacks table already exists');
      return;
    }
    
    // Create feedbacks table
    await connection.execute(`
      CREATE TABLE feedbacks (
        id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id VARCHAR2(100),
        name VARCHAR2(100),
        email VARCHAR2(100),
        department VARCHAR2(50),
        ratings CLOB,
        final_comment CLOB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (err) {
    if (err.errorNum === 955) { // Table already exists
      console.log('Feedbacks table already exists');
    } else {
      console.error('Error initializing database:', err);
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// API Endpoints

// Get all feedbacks
app.get('/api/feedbacks', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log('Database connection established');
    
    const result = await connection.execute(
      'SELECT id, user_id, name, email, department, ratings, final_comment, created_at FROM feedbacks ORDER BY created_at DESC'
    );
    console.log('Query executed successfully');
    console.log('Number of rows fetched:', result.rows.length);
    
    // Convert Oracle results to plain objects
    const feedbacks = await Promise.all(result.rows.map(async (row) => {
      let ratings = {};
      let finalComment = '';
      
      try {
        // Read CLOB data for ratings
        if (row[5]) {
          const ratingsContent = await row[5].getData();
          ratings = JSON.parse(ratingsContent);
        }
      } catch (err) {
        console.error('Error parsing ratings:', err);
      }
      
      try {
        // Read CLOB data for final comment
        if (row[6]) {
          finalComment = await row[6].getData();
        }
      } catch (err) {
        console.error('Error reading final comment:', err);
      }

      const feedback = {
        id: row[0],
        user_id: row[1],
        name: row[2],
        email: row[3],
        department: row[4],
        ratings: ratings,
        final_comment: finalComment,
        created_at: row[7]
      };
      console.log('Processed feedback:', feedback);
      return feedback;
    }));
    
    console.log('Sending response with feedbacks:', feedbacks);
    res.json(feedbacks);
  } catch (err) {
    console.error('Error in /api/feedbacks:', err);
    res.status(500).json({ 
      error: 'Error fetching feedbacks',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

// Add new feedback
app.post('/api/feedbacks', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const { name, email, department, ratings, finalComment } = req.body;
    
    const result = await connection.execute(
      `INSERT INTO feedbacks (user_id, name, email, department, ratings, final_comment)
       VALUES (:userId, :name, :email, :department, :ratings, :finalComment)`,
      {
        userId: req.user.uid,
        name,
        email,
        department,
        ratings: JSON.stringify(ratings),
        finalComment
      },
      { autoCommit: true }
    );
    
    res.status(201).json({ 
      message: 'Feedback added successfully' 
    });
  } catch (err) {
    console.error('Error adding feedback:', err);
    res.status(500).json({ error: 'Error adding feedback' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

// Delete feedback
app.delete('/api/feedbacks/:id', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      'DELETE FROM feedbacks WHERE id = :id',
      [req.params.id]
    );
    
    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ error: 'Error deleting feedback' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute('SELECT 1 FROM DUAL');
    res.json({ success: true, message: 'Database connection successful' });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: err.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}); 