const express = require("express");

const app = express();

const cors = require("cors");

const mysql = require("mysql2");

app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 5000;

const pool = mysql.createPool({

  host: "sql.freedb.tech",

  user: "u_X2HJNI",

  password: "GWK9xIp8XiDv",

  database: "freedb_ub4NlB8a",

  connectionLimit: 10,

  waitForConnections: true,

  queueLimit: 0,

});

//HEALTH

app.get("/", (req, res) => {

  pool.query("SELECT 1", (err) => {

    if (err) return res.status(503).json({ msg: "Database is unreachable" });

    res.json({ status: "ok" });

  });

});

//REPORT

app.get("/api/students", (req, res) => {

  pool.query(

    "SELECT id, student_id, full_name, course, year_level, email, contact_number FROM students ORDER BY id DESC",

    (err, rows, fields) => {

      if (err) return res.status(500).json({ msg: err.sqlMessage || err.message });

      res.json(rows);

    },

  );

});

//CREATE

app.post("/api/students", (req, res) => {

  const id = req.body.id;
  const studentId = req.body.student_id;

  const fullName = req.body.full_name;

  const course = req.body.course;

  const yearLevel = req.body.year_level;

  const email = req.body.email;

  const contact = req.body.contact_number;

  if ( !studentId || !fullName || !course || !yearLevel || !email || !contact) {

    return res.status(400).json({ msg: "All fields are required" });

  }

  pool.query(

    "INSERT INTO students (student_id, full_name, course, year_level, email, contact_number) VALUES (?, ?, ?, ?, ?, ?)",

    [studentId, fullName, course, yearLevel, email, contact],

    (err, rows, fields) => {

      if (err) {

        if (err.code === "ER_DUP_ENTRY") {

          return res.status(409).json({ msg: "That student id already exists" });

        }

        return res.status(500).json({ msg: err.sqlMessage || err.message });

      }

      res.json({ msg: `Successfully inserted!`, id: rows.insertId });

    },

  );

});

//SEARCH

app.get("/api/students/:id", (req, res) => {

  const id = req.params.id;

  pool.query(

    "SELECT id, student_id, full_name, course, year_level, email,  contact_number FROM students WHERE id = ?",

    [id],

    (err, rows, fields) => {

      if (err) return res.status(500).json({ msg: err.sqlMessage || err.message });

      if (rows.length > 0) {

        res.json(rows);

      } else {

        res.status(404).json({ msg: `${id} id not found!` });

      }

    },

  );

});

//UPDATE

app.put("/api/students", (req, res) => {

  const id = req.body.id;

  const studentId = req.body.student_id;

  const fullName = req.body.full_name;

  const course = req.body.course;

  const yearLevel = req.body.year_level;

  const email = req.body.email;

  const contact = req.body.contact_number;

  if (!id) return res.status(400).json({ msg: "id is required" });

  if (!studentId || !fullName || !course || !yearLevel || !email  || !contact) {

    return res.status(400).json({ msg: "All fields are required" });

  }

  pool.query(

    "UPDATE students SET student_id = ?, full_name = ?, course = ?, year_level = ?, email = ?, contact_number = ? WHERE id = ?",

    [studentId, fullName, course, yearLevel, email, contact, id],

    (err, rows, fields) => {

      if (err) {

        if (err.code === "ER_DUP_ENTRY") {

          return res.status(409).json({ msg: "That student id already exists" });

        }

        return res.status(500).json({ msg: err.sqlMessage || err.message });

      }

      if (rows.affectedRows === 0) {

        return res.status(404).json({ msg: `${id} id not found!` });

      }

      res.json({ msg: `Successfully updated` });

    },

  );

});

//DELETE

app.delete("/api/students", (req, res) => {

  const id = req.body.id;

  if (!id) return res.status(400).json({ msg: "id is required" });

  pool.query("DELETE FROM students WHERE id = ?", [id], (err, rows, fields) => {

    if (err) return res.status(500).json({ msg: err.sqlMessage || err.message });

    if (rows.affectedRows === 0) {

      return res.status(404).json({ msg: `${id} id not found!` });

    }

    res.json({ msg: `Successfully deleted` });

  });

});



app.listen(PORT, () => {

  console.log(`Server is running in port ${PORT}`);

});



module.exports = app;
