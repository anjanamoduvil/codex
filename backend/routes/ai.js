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
                const systemPrompt = "Return ONLY valid JSON with keys: growth_suggestion (string), marketing_suggestion (string), finance_insight (string), runway_months (number), actionable_steps (array of 5 string items), market_trends (array of 2 string items). No preamble, no markdown. Your output must start with { and end with }.";
                const userPrompt = `
Business Profile:
Name: ${business.name}
Industry: ${business.industry}
Description: ${business.description}
Goal: ${business.goal}
Status: ${business.status === 'planning' ? 'Going to start (Planning Phase)' : 'Already Started (Active)'}
Currency: ${business.currency || 'USD'}

Financials:
Monthly Revenue: ${business.currency || 'USD'} ${finance.monthly_revenue || 0}
Monthly Expenses: ${business.currency || 'USD'} ${finance.monthly_expenses || 0}
Cash on Hand / Initial Capital: ${business.currency || 'USD'} ${finance.cash_on_hand || 0}

Analyze this business. If it's in the planning phase, provide a launch growth strategy, a pre-launch marketing suggestion, a startup finance insight in plain English, and an estimated runway in months (number). If already started, provide standard growth, marketing, and finance insights.
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
                    const report = JSON.parse(rawJson);

                    // Save report
                    db.run(
                        `INSERT INTO ai_reports (business_id, growth_suggestion, marketing_suggestion, finance_insight, runway_months, actionable_steps, market_trends) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            business.id, 
                            report.growth_suggestion, 
                            report.marketing_suggestion, 
                            report.finance_insight, 
                            report.runway_months,
                            JSON.stringify(report.actionable_steps || []),
                            JSON.stringify(report.market_trends || [])
                        ],
                        function(err) {
                            if (err) return res.status(500).json({ error: 'Failed to save report' });
                            res.json({ message: 'Analysis complete', report_id: this.lastID });
                        }
                    );
                } catch (parseErr) {
                    res.status(500).json({ error: 'Failed to parse AI response' });
                }
            } catch (apiErr) {
                console.error("OpenAI Error:", apiErr);
                res.status(500).json({ error: 'Failed to generate insights' });
            }
        });
    });
});

// POST /api/ai/chat
router.post('/chat', verifyToken, (req, res) => {
    const { topic, message, history = [] } = req.body;
    const userId = req.userId;

    db.get(`SELECT * FROM businesses WHERE user_id = ?`, [userId], async (err, business) => {
        if (err || !business) return res.status(404).json({ error: 'Business not found' });

        try {
            const systemPrompt = `You are an expert AI advisor for a business named "${business.name}" in the ${business.industry} industry. 
The user is asking a question specifically about: ${topic}. 
Their business goal is: ${business.goal}. 
Status: ${business.status === 'planning' ? 'Planning phase' : 'Active'}.
Provide a concise, helpful, and strategic answer. Format your response in plain text.`;

            const messages = [
                { role: "system", content: systemPrompt },
                ...history.map(m => ({ role: m.role, content: m.content })),
                { role: "user", content: message }
            ];

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messages,
            });

            res.json({ response: completion.choices[0].message.content });
        } catch (apiErr) {
            console.error("OpenAI Chat Error:", apiErr);
            res.status(500).json({ error: 'Failed to generate chat response' });
        }
    });
});

module.exports = router;
