const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'inventoryApp'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Koneksi database berhasil');
});

// Fungsi OTP generator
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// Konfigurasi Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anlstudioteam@gmail.com',
        pass: 'hygq hutn xkyc qcmk'
    }
});

// Registrasi user
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err) => {
        if (err) {
            console.error('Gagal registrasi:', err);
            return res.send('Gagal registrasi');
        }
        res.send('Registrasi berhasil');
    });
});

// Login user
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';

    db.query(query, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.send('Email tidak ditemukan');
        }

        const user = results[0];
        if (bcrypt.compareSync(password, user.password)) {
            const otp = generateOTP();
            const expiresAt = new Date(Date.now() + 5 * 60000);

            const otpQuery = 'INSERT INTO otp_codes (email, otp_code, expires_at) VALUES (?, ?, ?)';
            db.query(otpQuery, [email, otp, expiresAt], (err) => {
                if (err) {
                    console.error('Gagal menyimpan OTP:', err);
                    return res.send('Gagal mengirim OTP');
                }

                const mailOptions = {
                    from: 'anlstudioteam@gmail.com',
                    to: email,
                    subject: 'Kode OTP untuk Verifikasi Login Anda - ANL Studio',
                    html: `
                        <html>
                            <head>
                                <style>
                                    body {
                                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                        background-color: #f6f9fc;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .container {
                                        background-color: #ffffff;
                                        border-radius: 12px;
                                        padding: 40px;
                                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                        width: 100%;
                                        max-width: 600px;
                                        margin: 20px auto;
                                    }
                                    .header {
                                        text-align: center;
                                        margin-bottom: 30px;
                                    }
                                    .logo {
                                        font-size: 28px;
                                        font-weight: bold;
                                        color: #2d3748;
                                        margin-bottom: 10px;
                                    }
                                    h1 {
                                        color: #1a365d;
                                        font-size: 24px;
                                        margin-bottom: 20px;
                                        text-align: center;
                                    }
                                    p {
                                        font-size: 16px;
                                        color: #4a5568;
                                        line-height: 1.6;
                                        margin-bottom: 15px;
                                    }
                                    .otp-container {
                                        text-align: center;
                                        margin: 30px 0;
                                        padding: 20px;
                                        background-color: #f8fafc;
                                        border-radius: 8px;
                                    }
                                    .otp {
                                        font-family: 'Courier New', monospace;
                                        font-size: 36px;
                                        font-weight: bold;
                                        color: #2b6cb0;
                                        letter-spacing: 8px;
                                        padding: 10px 20px;
                                        background-color: #ebf8ff;
                                        border-radius: 8px;
                                        border: 2px dashed #4299e1;
                                    }
                                    .warning {
                                        background-color: #fff5f5;
                                        border-left: 4px solid #fc8181;
                                        padding: 15px;
                                        margin: 20px 0;
                                        border-radius: 4px;
                                    }
                                    .footer {
                                        margin-top: 40px;
                                        padding-top: 20px;
                                        border-top: 1px solid #e2e8f0;
                                        text-align: center;
                                        font-size: 14px;
                                        color: #718096;
                                    }
                                    .help-text {
                                        font-size: 14px;
                                        color: #718096;
                                        text-align: center;
                                        margin-top: 15px;
                                    }
                                    .social-links {
                                        margin-top: 20px;
                                        text-align: center;
                                    }
                                    .social-links a {
                                        color: #4a5568;
                                        text-decoration: none;
                                        margin: 0 10px;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="header">
                                        <div class="logo">ANL Studio</div>
                                    </div>
                                    
                                    <h1>Verifikasi Login Anda</h1>
                                    
                                    <p>Hai,</p>
                                    
                                    <p>Kami menerima permintaan untuk login ke akun ANL Studio Anda. Untuk memastikan keamanan akun Anda, silakan gunakan kode OTP berikut:</p>
                                    
                                    <div class="otp-container">
                                        <div class="otp">${otp}</div>
                                        <p class="help-text">Kode ini akan kadaluarsa dalam 5 menit</p>
                                    </div>
                                    
                                    <div class="warning">
                                        <p style="margin: 0;"><strong>Penting:</strong> Jangan pernah membagikan kode OTP ini kepada siapapun, termasuk pihak yang mengaku sebagai staff ANL Studio. Tim kami tidak akan pernah meminta kode OTP Anda.</p>
                                    </div>
                                    
                                    <p>Jika Anda tidak merasa melakukan permintaan login ini, abaikan email ini dan segera hubungi tim support kami untuk keamanan akun Anda.</p>
                                    
                                    <div class="footer">
                                        <p>Terima kasih telah menggunakan layanan ANL Studio</p>
                                        <div class="social-links">
                                            <a href="#">Facebook</a> |
                                            <a href="#">Twitter</a> |
                                            <a href="#">Instagram</a>
                                        </div>
                                        <p>&copy; ${new Date().getFullYear()} ANL Studio. Hak Cipta Dilindungi.</p>
                                        <p>Jika Anda membutuhkan bantuan, silakan hubungi support@anlstudio.com</p>
                                    </div>
                                </div>
                            </body>
                        </html>
                    `
                };

                transporter.sendMail(mailOptions, (error) => {
                    if (error) {
                        console.error('Gagal mengirim email:', error);
                        return res.send('Gagal mengirim email');
                    }
                    res.redirect('/otp.html');
                });
            });
        } else {
            res.send('Password salah');
        }
    });
});

// Verifikasi OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const query = 'SELECT * FROM otp_codes WHERE email = ? AND otp_code = ? AND expires_at > NOW()';

    db.query(query, [email, otp], (err, results) => {
        if (err || results.length === 0) {
            return res.send('OTP tidak valid atau sudah kadaluwarsa');
        }
        res.redirect('/inventory.html');
    });
});

// CRUD inventaris
app.get('/inventory', (req, res) => {
    const query = 'SELECT * FROM inventory';
    db.query(query, (err, results) => {
        if (err) {
            return res.send('Gagal mengambil data inventaris');
        }
        res.json(results);
    });
});

// Endpoint untuk menambahkan item baru
app.post('/add-item', (req, res) => {
    const { name, category, quantity, price } = req.body;

    // Validasi data
    if (!name || !category || !quantity || !price) {
        return res.status(400).send('Semua field harus diisi');
    }

    const query = 'INSERT INTO inventory (name, category, quantity, price) VALUES (?, ?, ?, ?)';
    db.query(query, [name, category, quantity, price], (err) => {
        if (err) {
            console.error('Gagal menambahkan item:', err);
            return res.status(500).send('Gagal menambahkan item');
        }
        res.send('Item berhasil ditambahkan');
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
