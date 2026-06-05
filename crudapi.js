const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

const queryDatabase = (query, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (err, results) => {
      if (err) 
        reject(err);
      else 
        resolve(results);
    });
  });
};

/**
 * @swagger
 * /crudapi/posting:
 *   post:
 *     summary: Insert a new record
 *     tags:
 *       - CRUD
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data inserted successfully
 */
router.post("/posting", async (req, res) => {
  const { name, age, city } = req.body;
  try {
    await queryDatabase("INSERT INTO viewtable (name, age, city) VALUES (?, ?, ?)",[name, age, city])
    res.json({ message: "Data inserted successfully" });
  }
  catch (err) {
    res.status(500).json({ message: "Error inserting data", error: err.message });
  }
});

/**
 * @swagger
 * /crudapi/viewing:
 *   get:
 *     summary: Get all records
 *     tags:
 *       - CRUD
 *     responses:
 *       200:
 *         description: List of records
 */
router.get("/viewing", async (req, res) => {
  try {
    const results = await queryDatabase("SELECT * FROM viewtable");
    res.json(results);
  }
  catch (err) {
    res.status(500).json({ message: "Error retrieving data", error: err.message });
  }
});

/**
 * @swagger
 * /crudapi/updating/{id}:
 *   put:
 *     summary: Update a record
 *     tags:
 *       - CRUD
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data updated successfully
 */
router.put("/updating/:id", async (req, res) => {
  const { name, age, city } = req.body;
  try {
    await queryDatabase("UPDATE viewtable SET name=?, age=?, city=? WHERE id=?",[name, age, city, req.params.id]);
    res.json({ message: "Data updated successfully" });
  }
  catch (err) {
    res.status(500).json({ message: "Error updating data", error: err.message });
  }
});

/**
 * @swagger
 * /crudapi/deleting/{id}:
 *   delete:
 *     summary: Delete a record
 *     tags:
 *       - CRUD
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data deleted successfully
 */
router.delete("/deleting/:id", async (req, res) => {
  try {
    const deleteQuery = "DELETE FROM viewtable WHERE id = ?";
    await queryDatabase(deleteQuery, [req.params.id]);
    res.json({ message: "Data deleted successfully" });
  }
  catch (err) {
    res.status(500).json({message: "Error deleting data",error: err.message,});
  }
});

/**
 * @swagger
 * /crudapi/testdb:
 *   get:
 *     summary: Test database connection
 *     tags:
 *       - Database
 *     responses:
 *       200:
 *         description: Database connected successfully
 */
router.get("/testdb", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      res.status(500)
      res.json({ message: "Database connection failed", error: err.message });
    }
    else {
      res.status(200).json({ message: "Database connected successfully!" });
      connection.release();
    }
  });
});

module.exports = router;