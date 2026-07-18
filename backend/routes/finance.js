const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/finance
router.post('/', verifyToken, (req, res) => {
    const { monthly_revenue, monthly_expenses, cash_on_hand, month, income_amount, income_frequency } = req.body;
    const userId = req.userId;

    // Validation relaxed to allow 0 or only cash_on_hand for planning businesses
    if (cash_on_hand === undefined) {
        return res.status(400).json({ error: 'Cash / Initial Capital is required' });
    }

    // Get business id for user
    db.get(`SELECT id FROM businesses WHERE user_id = ?`, [userId], (err, business) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!business) return res.status(404).json({ error: 'Business profile not found. Please create it first.' });

        db.get(`SELECT id FROM finances WHERE business_id = ?`, [business.id], (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error checking finances' });

            if (row) {
                const updateQuery = `
                    UPDATE finances SET 
                        monthly_revenue = ?, 
                        monthly_expenses = ?, 
                        cash_on_hand = ?, 
                        income_amount = ?, 
                        income_frequency = ?
                    WHERE business_id = ?
                `;
                db.run(updateQuery, [monthly_revenue, monthly_expenses, cash_on_hand, income_amount || 0, income_frequency || 'monthly', business.id], function(err) {
                    if (err) return res.status(500).json({ error: 'Database error on update' });
                    res.json({ message: 'Finance data updated successfully', finance_id: row.id });
                });
            } else {
                const insertQuery = `
                    INSERT INTO finances (business_id, monthly_revenue, monthly_expenses, cash_on_hand, income_amount, income_frequency)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                db.run(insertQuery, [business.id, monthly_revenue, monthly_expenses, cash_on_hand, income_amount || 0, income_frequency || 'monthly'], function(err) {
                    if (err) return res.status(500).json({ error: 'Database error on insert' });
                    res.json({ message: 'Finance data saved successfully', finance_id: this.lastID });
                });
            }
        });
    });
});

module.exports = router;
