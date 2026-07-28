const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Static Files Serving
app.use(express.static(__dirname));
if (require('fs').existsSync(path.join(__dirname, 'public'))) {
    app.use(express.static(path.join(__dirname, 'public')));
}

// Default Homepage Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ================= DATABASE (In-Memory) =================

// ၁။ Admin အကောင့် သီးသန့် (ဖုန်း + စကားဝှက်)
const ADMIN_ACCOUNT = {
    phone: "09123456789",
    password: "adminpassword123"
};

// ၂။ Invite Codes များ
let inviteCodes = [
    { code: "TIKTOK2026", status: "Active" },
    { code: "VIPSHOP88", status: "Active" }
];

// ၃။ Users စာရင်း
let users = [];

// ၄။ Products စာရင်း
let products = [
    { id: 1, name: "Premium Oversized T-Shirt", price: 18000, category: "Clothing", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" },
    { id: 2, name: "Trendy Korean Hoodie", price: 35000, category: "Clothing", img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500" },
    { id: 3, name: "Streetwear Sneakers", price: 55000, category: "Shoes", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" },
    { id: 4, name: "Luxury Shoulder Bag", price: 42000, category: "Accessories", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500" }
];

let orders = [];

// ================= API ROUTES =================

// A. LOGIN API (User & Admin)
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;

    // Admin စစ်ဆေးခြင်း
    if (phone === ADMIN_ACCOUNT.phone && password === ADMIN_ACCOUNT.password) {
        return res.json({ success: true, role: 'admin', message: 'Admin Login Success' });
    }

    // User စစ်ဆေးခြင်း
    const user = users.find(u => u.phone === phone && u.password === password);
    if (user) {
        if (user.status === 'Blocked') {
            return res.status(403).json({ success: false, message: 'သင့်အကောင့် ပိတ်ခံထားရပါသည်။' });
        }
        return res.json({ success: true, role: 'user', user: user });
    }

    return res.status(400).json({ success: false, message: 'ဖုန်းနံပါတ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။' });
});

// B. REGISTER API (Invite Code ပါမှ ရမည်)
app.post('/api/register', (req, res) => {
    const { name, phone, password, inviteCode } = req.body;

    if (users.find(u => u.phone === phone)) {
        return res.status(400).json({ success: false, message: 'ဒီဖုန်းနံပါတ်ဖြင့် အကောင့်ပွင့်ပြီးသား ဖြစ်ပါသည်။' });
    }

    const validCode = inviteCodes.find(c => c.code === inviteCode && c.status === 'Active');
    if (!validCode) {
        return res.status(400).json({ success: false, message: 'ဖိတ်ခေါ်ကုဒ် (Invite Code) မမှန်ကန်ပါ သို့မဟုတ် သုံးပြီးသားဖြစ်ပါသည်။' });
    }

    const newUser = { id: Date.now(), name, phone, password, status: 'Active', usedCode: inviteCode };
    users.push(newUser);

    return res.json({ success: true, message: 'အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ အကောင့်ဝင်နိုင်ပါပြီ။' });
});

// C. ADMIN APIS
app.get('/api/admin/invite-codes', (req, res) => {
    res.json(inviteCodes);
});

app.post('/api/admin/generate-code', (req, res) => {
    const newCode = "TK-" + Math.floor(100000 + Math.random() * 900000);
    inviteCodes.push({ code: newCode, status: 'Active' });
    res.json({ success: true, code: newCode });
});

app.get('/api/admin/users', (req, res) => {
    res.json(users);
});

app.post('/api/admin/block-user', (req, res) => {
    const { userId } = req.body;
    const user = users.find(u => u.id === userId);
    if (user) {
        user.status = user.status === 'Active' ? 'Blocked' : 'Active';
        res.json({ success: true, status: user.status });
    } else {
        res.status(404).json({ success: false, message: 'User မတွေ့ပါ' });
    }
});

// D. PRODUCTS APIS
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/admin/add-product', (req, res) => {
    const { name, price, category, img } = req.body;
    const newProduct = { id: Date.now(), name, price: Number(price), category, img };
    products.push(newProduct);
    res.json({ success: true, product: newProduct });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
