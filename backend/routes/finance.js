const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/finance
router.post('/', verifyToken, (req, res) => {
    const { monthly_revenue, monthly_expenses, cash_on_hand, month } = req.body;
    const userId = req.userId;

    // Validation relaxed to allow 0 or only cash_on_hand for planning businesses
    if (cash_on_hand === undefined) {
        return res.status(400).json({ error: 'Cash / Initial Capital is required' });
    }

    // Get business id for user
    db.get(`SELECT id FROM businesses WHERE user_id = ?`, [userId], (err, business) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!business) return res.status(404).json({ error: 'Business profile not found. Please create it first.' });

        // Save finance record
        db.run(
            `INSERT INTO finances (business_id, monthly_revenue, monthly_expenses, cash_on_hand, month) VALUES (?, ?, ?, ?, ?)`,
            [business.id, monthly_revenue, monthly_expenses, cash_on_hand, month || new Date().toISOString().slice(0, 7)],
            function(err) {
                if (err) return res.status(500).json({ error: 'Database error on insert' });
                res.json({ message: 'Finance data saved successfully', finance_id: this.lastID });
            }
        );
    });
});

module.exports = router;
