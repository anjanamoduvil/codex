const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/authMiddleware');
const OpenAI = require('openai');

const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/analyze
router.post('/analyze', verifyToken, (req, res) => {
    const userId = req.userId;

    // Fetch business and latest finance data
    db.get(`SELECT * FROM businesses WHERE user_id = ?`, [userId], (err, business) => {
        if (err || !business) return res.status(404).json({ error: 'Business not found' });

        db.get(`SELECT * FROM finances WHERE business_id = ? ORDER BY id DESC LIMIT 1`, [business.id], async (err, finance) => {
            if (err || !finance) return res.status(404).json({ error: 'Finance data not found. Please enter financial data first.' });

            try {
                // Construct prompt
                const systemPrompt = "Return ONLY valid JSON with keys growth_suggestion, marketing_suggestion, finance_insight, runway_months (number). No preamble, no markdown. Your output must start with { and end with }.";
                const userPrompt = `
Business Profile:
Name: ${business.name}
Industry: ${business.industry}
Description: ${business.description}
Goal: ${business.goal}

Financials:
Monthly Revenue: $${finance.monthly_revenue}
Monthly Expenses: $${finance.monthly_expenses}
Cash on Hand: $${finance.cash_on_hand}

Analyze this business and provide a growth suggestion, a marketing suggestion, a finance insight in plain English, and an estimated runway in months (number).
`;

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini", // Using gpt-4o-mini for fast/cheap hackathon tier
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    response_format: { type: "json_object" } // Enforce JSON
                });

                const rawJson = completion.choices[0].message.content;
                let parsed;
                try {
                    parsed = JSON.parse(rawJson);
                } catch (parseErr) {
                    console.error("Failed to parse OpenAI JSON response:", rawJson);
                    return res.status(500).json({ error: 'AI returned invalid JSON' });
                }

                // Save report
                db.run(
                    `INSERT INTO ai_reports (business_id, growth_suggestion, marketing_suggestion, finance_insight, runway_months) VALUES (?, ?, ?, ?, ?)`,
                    [business.id, parsed.growth_suggestion, parsed.marketing_suggestion, parsed.finance_insight, parsed.runway_months],
                    function(err) {
                        if (err) return res.status(500).json({ error: 'Failed to save AI report' });
                        res.json({ message: 'Analysis complete', report: parsed });
                    }
                );

            } catch (apiErr) {
                console.error("OpenAI API Error:", apiErr);
                res.status(500).json({ error: 'Failed to generate AI analysis' });
            }
        });
    });
});

module.exports = router;
