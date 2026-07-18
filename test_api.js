async function runTest() {
    console.log("Starting API integration test...");
    try {
        // 1. Signup
        console.log("1. Signing up user...");
        const signupRes = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'password123'
            })
        });
        const signupData = await signupRes.json();
        
        if (!signupRes.ok) throw new Error(signupData.error || "Signup failed");
        
        const token = signupData.token;
        console.log("Signup success, token received.");

        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        // 2. Create Business Profile
        console.log("2. Creating business profile...");
        const bizRes = await fetch('http://localhost:5000/api/business', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Acme Test Corp',
                industry: 'SaaS',
                description: 'A test company for API verification.',
                goal: 'Increase ARR'
            })
        });
        if (!bizRes.ok) throw new Error("Business creation failed");
        console.log("Business profile created.");

        // 3. Add Finance Data
        console.log("3. Adding finance data...");
        const finRes = await fetch('http://localhost:5000/api/finance', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                monthly_revenue: 15000,
                monthly_expenses: 8000,
                cash_on_hand: 50000
            })
        });
        if (!finRes.ok) throw new Error("Finance addition failed");
        console.log("Finance data added.");

        // 4. Trigger AI Analysis
        console.log("4. Triggering OpenAI analysis... (This might take a few seconds)");
        const aiRes = await fetch('http://localhost:5000/api/ai/analyze', {
            method: 'POST',
            headers
        });
        const aiData = await aiRes.json();
        
        if (!aiRes.ok) throw new Error(aiData.error || "AI Analysis failed");

        console.log("AI Analysis response:", JSON.stringify(aiData, null, 2));

        if (aiData.report && aiData.report.growth_suggestion) {
            console.log("SUCCESS! All tests passed.");
        } else {
            console.log("WARNING: Unexpected AI response format.");
        }

    } catch (err) {
        console.error("Test failed:", err.message);
    }
}

runTest();
