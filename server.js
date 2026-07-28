const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// Memory Data (Database အစား ယာယီသိမ်းဆည်းရန်)
let products = [
    { id: 1, name: "တီရှပ် (T-Shirt)", price: 15000 },
    { id: 2, name: "စနီကာဖိနပ် (Sneakers)", price: 45000 },
    { id: 3, name: "စမတ်နာရီ (Smartwatch)", price: 85000 }
];

let orders = [];
let users = [
    { id: 1, name: "Mg Mg", phone: "09123456789", status: "Active" },
    { id: 2, name: "Aung Aung", phone: "09987654321", status: "Active" }
];
let chatMessages = [];

// === CUSTOMER APIS ===
app.get('/api/products', (req, res) => res.json(products));

app.post('/api/order', (req, res) => {
    const { cart, total, customer } = req.body;
    const newOrder = {
        id: 'ORD-' + Date.now(),
        cart,
        total,
        customer,
        status: 'Pending',
        createdAt: new Date().toLocaleTimeString()
    };
    orders.push(newOrder);

    // အသုံးပြုသူ မရှိသေးပါက သုံးစွဲသူစာရင်းသို့ ထည့်ခြင်း
    if (!users.find(u => u.phone === customer.phone)) {
        users.push({ id: users.length + 1, name: customer.name, phone: customer.phone, status: "Active" });
    }

    res.json({ success: true, message: "အော်ဒါ အောင်မြင်ပါသည်။ ဆိုင်ရှင်မှ ငွေလွှဲစစ်ဆေးပြီး အကြောင်းပြန်ပေးပါမည်။", orderId: newOrder.id });
});

// Live Chat API (Customer & Admin)
app.get('/api/chat', (req, res) => res.json(chatMessages));
app.post('/api/chat', (req, res) => {
    const { sender, message } = req.body;
    const msg = { sender, message, time: new Date().toLocaleTimeString() };
    chatMessages.push(msg);
    res.json({ success: true, msg });
});

// === ADMIN PANEL APIS ===
app.get('/api/admin/orders', (req, res) => res.json(orders));

app.post('/api/admin/order-status', (req, res) => {
    const { orderId, status } = req.body;
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        res.json({ success: true, message: `အော်ဒါ ${orderId} ကို ${status} လုပ်လိုက်ပါပြီ။` });
    } else {
        res.status(404).json({ success: false, message: "အော်ဒါ ရှာမတွေ့ပါ။" });
    }
});

app.get('/api/admin/users', (req, res) => res.json(users));

app.post('/api/admin/user-status', (req, res) => {
    const { userId, status } = req.body;
    const user = users.find(u => u.id === userId);
    if (user) {
        user.status = status;
        res.json({ success: true, message: `အသုံးပြုသူအကောင့်ကို ${status} ပြုလုပ်လိုက်ပါပြီ။` });
    } else {
        res.status(404).json({ success: false, message: "User ရှာမတွေ့ပါ။" });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
