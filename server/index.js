const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/dishes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM dishes');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});