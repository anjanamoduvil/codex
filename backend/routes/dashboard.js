const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/dashboard
router.get('/', verifyToken, (req, res) => {
    const userId = req.userId;

    // Fetch business
    db.get(`SELECT * FROM businesses WHERE user_id = ?`, [userId], (err, business) => {
        if (err) return res.status(500).json({ error: 'Database error fetching business' });
        
        let dashboardData = { business: business || null, finance: null, ai_report: null };

        if (!business) {
            return res.json(dashboardData);
        }

        // Fetch latest finance
        db.get(`SELECT * FROM finances WHERE business_id = ? ORDER BY id DESC LIMIT 1`, [business.id], (err, finance) => {
            if (err) return res.status(500).json({ error: 'Database error fetching finance' });
            dashboardData.finance = finance || null;

            // Fetch latest AI report
            db.get(`SELECT * FROM ai_reports WHERE business_id = ? ORDER BY id DESC LIMIT 1`, [business.id], (err, report) => {
                if (err) return res.status(500).json({ error: 'Database error fetching ai report' });
                if (report) {
                    try {
                        if (report.actionable_steps) report.actionable_steps = JSON.parse(report.actionable_steps);
                        if (report.market_trends) report.market_trends = JSON.parse(report.market_trends);
                    } catch(e) {}
                }
                res.json({
                    business,
                    finance,
                    ai_report: report
                });
            });
        });
    });
});

module.exports = router;
