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
                const incomeContext = finance.income_amount ? `INCOME: Earns ${finance.income_amount} per ${finance.income_frequency}. IMPORTANT: You MUST explicitly adapt the Growth and Marketing strategies based on this specific income frequency (${finance.income_frequency}). If daily, focus on daily foot traffic and rapid conversions. If yearly, focus on long-term relationship building and enterprise sales.` : '';

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
${incomeContext}

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
router.post('/chat', verifyToken, async (req, res) => {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        const systemPrompt = `You are Trio AI, an expert business advisor for small businesses. Keep your answers extremely concise, friendly, and actionable. Max 2-3 short paragraphs. Use emojis where appropriate. Context about user: ${context || 'None'}`;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            max_tokens: 200
        });

        res.json({ response: completion.choices[0].message.content });
    } catch (err) {
        console.error("AI Chat Error:", err);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

module.exports = router;
