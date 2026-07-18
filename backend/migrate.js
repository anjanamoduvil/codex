const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }

    db.serialize(() => {
        // Add income_amount
        db.run(`ALTER TABLE finances ADD COLUMN income_amount REAL`, (err) => {
            if (err) console.log('income_amount might already exist:', err.message);
            else console.log('Added income_amount column.');
        });

        // Add income_frequency
        db.run(`ALTER TABLE finances ADD COLUMN income_frequency TEXT`, (err) => {
            if (err) console.log('income_frequency might already exist:', err.message);
            else console.log('Added income_frequency column.');
        });
    });
});

setTimeout(() => {
    console.log("Migration finished.");
    process.exit(0);
}, 2000);
