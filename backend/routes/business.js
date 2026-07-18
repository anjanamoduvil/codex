const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/business
router.post('/', verifyToken, (req, res) => {
    const { name, industry, description, goal, status, currency } = req.body;
    const userId = req.userId;

    if (!name || !industry) {
        return res.status(400).json({ error: 'Name and industry are required' });
    }

    // Check if business already exists for user
    db.get(`SELECT id FROM businesses WHERE user_id = ?`, [userId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (row) {
            // Update existing
            db.run(
                `UPDATE businesses SET name = ?, industry = ?, description = ?, goal = ?, status = ?, currency = ? WHERE user_id = ?`,
                [name, industry, description, goal, status || 'started', currency || 'USD', userId],
                function(err) {
                    if (err) return res.status(500).json({ error: 'Database error on update' });
                    res.json({ message: 'Business updated successfully', business_id: row.id });
                }
            );
        } else {
            // Create new
            db.run(
                `INSERT INTO businesses (user_id, name, industry, description, goal, status, currency) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, name, industry, description, goal, status || 'started', currency || 'USD'],
                function(err) {
                    if (err) return res.status(500).json({ error: 'Database error on insert' });
                    res.json({ message: 'Business created successfully', business_id: this.lastID });
                }
            );
        }
    });
});

module.exports = router;
