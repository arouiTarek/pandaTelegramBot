const { Pool } = require('pg');

// إعداد الاتصال بقاعدة بيانات Supabase
const pool = new Pool({
    user: 'postgres.uxgxhcwetydbsyyyhber', // استخدم بيانات الاتصال الخاصة بك من Supabase
    host: 'aws-0-eu-central-1.pooler.supabase.com', // مثلا: 'db.supabase.co'
    database: 'postgres', // اسم قاعدة البيانات الخاصة بك
    password: 'Ej6ZWw$9@N87BZx', // كلمة المرور الخاصة بك
    port: 6543, // المنفذ الافتراضي لـ PostgreSQL
});

module.exports = {
    getUser: (userId) =>
        new Promise((resolve, reject) => {
            pool.query('SELECT * FROM users WHERE user_id = $1', [userId], (err, res) => {
                if (err) reject(err);
                else resolve(res.rows[0]);
            });
        }),

    insertUser: (userId, firstName, lastName, username, languageCode) =>
        new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO users (user_id, first_name, last_name, username, language_code, is_subscribe, invites_count)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT(user_id) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                username = EXCLUDED.username;
            `;
            pool.query(sql, [userId, firstName, lastName, username, languageCode, 0, 0], (err, res) => {
                if (err) reject(err);
                else resolve();
            });
        }),

    updateInviter: (inviteCode) =>
        new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET invites_count = invites_count + 1 WHERE user_id = $1';
            pool.query(sql, [inviteCode], (err, res) => {
                if (err) reject(err);
                else resolve();
            });
        }),

    updateSubscription: (userId) =>
        new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET is_subscribe = true WHERE user_id = $1';
            pool.query(sql, [userId], (err, res) => {
                if (err) reject(err);
                else resolve();
            });
        }),
};


// const sqlite3 = require('sqlite3').verbose();

// // إنشاء قاعدة البيانات
// const db = new sqlite3.Database('telegram_bot.db', (err) => {
//     if (err) {
//         console.error('❌ Error in creating database:', err.message);
//     }
// });

// module.exports = {
//     getUser: (userId) =>
//         new Promise((resolve, reject) => {
//             db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
//                 if (err) reject(err);
//                 else resolve(row);
//             });
//         }),

//     insertUser: (userId, firstName, lastName, username, languageCode) =>
//         new Promise((resolve, reject) => {
//             const sql = `
//                 INSERT INTO users (user_id, first_name, last_name, username, language_code, is_subscribe, invites_count)
//                 VALUES (?, ?, ?, ?, ?, ?, ?)
//                 ON CONFLICT(user_id) DO UPDATE SET
//                 first_name = excluded.first_name,
//                 last_name = excluded.last_name,
//                 username = excluded.username;
//             `;
//             db.run(sql, [userId, firstName, lastName, username, languageCode, 0, 0], (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         }),

//     updateInviter: (inviteCode) =>
//         new Promise((resolve, reject) => {
//             const sql = 'UPDATE users SET invites_count = invites_count + 1 WHERE user_id = ?';
//             db.run(sql, [inviteCode], (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         }),

//     updateSubscription: (userId) =>
//         new Promise((resolve, reject) => {
//             const sql = 'UPDATE users SET is_subscribe = 1 WHERE user_id = ?';
//             db.run(sql, [userId], (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         }),
// };