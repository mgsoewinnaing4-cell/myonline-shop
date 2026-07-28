let cart = [];
let total = 0;

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('products-list')) {
        fetch('/api/products')
            .then(res => res.json())
            .then(products => {
                const list = document.getElementById('products-list');
                list.innerHTML = '';
                products.forEach(p => {
                    list.innerHTML += `
                        <div class="card">
                            <h3>${p.name}</h3>
                            <p>${p.price.toLocaleString()} ကျပ်</p>
                            <button onclick="addToCart('${p.name}', ${p.price})">ဝယ်ယူမည်</button>
                        </div>`;
                });
            });
    }
    setInterval(loadChat, 2000); // Live Chat အား အလိုအလျောက် စာပြန်ဆွဲရန်
});

function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    updateUI();
}

function updateUI() {
    const cartList = document.getElementById('cart-items');
    cartList.innerHTML = '';
    cart.forEach(item => {
        cartList.innerHTML += `<li>${item.name} - ${item.price.toLocaleString()} ကျပ်</li>`;
    });
    document.getElementById('total-price').textContent = total.toLocaleString();
}

function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) return alert("ဈေးဝယ်တောင်း အလွတ်ဖြစ်နေပါသည်။");

    const customer = {
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        address: document.getElementById('cust-address').value,
        tranId: document.getElementById('cust-tran').value
    };

    fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, total, customer })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        cart = []; total = 0; updateUI();
        document.getElementById('order-form').reset();
    });
}

// === ADMIN FUNCTIONS ===
function loadAdminOrders() {
    fetch('/api/admin/orders')
        .then(res => res.json())
        .then(orders => {
            const list = document.getElementById('admin-orders-list');
            if (!list) return;
            list.innerHTML = '';
            orders.forEach(o => {
                list.innerHTML += `
                    <tr>
                        <td>${o.id}</td>
                        <td>${o.customer.name}</td>
                        <td>${o.customer.phone}</td>
                        <td><strong>${o.customer.tranId}</strong></td>
                        <td>${o.total.toLocaleString()} ကျပ်</td>
                        <td><b style="color:${o.status==='Approved'?'green':o.status==='Rejected'?'red':'orange'}">${o.status}</b></td>
                        <td>
                            <button class="btn-approve" onclick="updateOrderStatus('${o.id}', 'Approved')">Approve</button>
                            <button class="btn-reject" onclick="updateOrderStatus('${o.id}', 'Rejected')">Reject</button>
                        </td>
                    </tr>`;
            });
        });
}

function updateOrderStatus(orderId, status) {
    fetch('/api/admin/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
    }).then(() => loadAdminOrders());
}

function loadAdminUsers() {
    fetch('/api/admin/users')
        .then(res => res.json())
        .then(users => {
            const list = document.getElementById('admin-users-list');
            if (!list) return;
            list.innerHTML = '';
            users.forEach(u => {
                list.innerHTML += `
                    <tr>
                        <td>${u.id}</td>
                        <td>${u.name}</td>
                        <td>${u.phone}</td>
                        <td><b>${u.status}</b></td>
                        <td>
                            <button class="btn-block" onclick="updateUserStatus(${u.id}, '${u.status==='Active'?'Blocked':'Active'}')">
                                ${u.status==='Active'?'Block':'Unblock'}
                            </button>
                        </td>
                    </tr>`;
            });
        });
}

function updateUserStatus(userId, status) {
    fetch('/api/admin/user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status })
    }).then(() => loadAdminUsers());
}

// === LIVE CHAT FUNCTIONS ===
function sendChat(sender) {
    const input = document.getElementById('chat-msg');
    if (!input.value) return;
    fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, message: input.value })
    }).then(() => { input.value = ''; loadChat(); });
}

function sendAdminChat() {
    const input = document.getElementById('admin-chat-msg');
    if (!input.value) return;
    fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'Admin', message: input.value })
    }).then(() => { input.value = ''; loadChat(); });
}

function loadChat() {
    fetch('/api/chat')
        .then(res => res.json())
        .then(msgs => {
            const box = document.getElementById('chat-box');
            const adminBox = document.getElementById('admin-chat-box');
            let html = '';
            msgs.forEach(m => {
                html += `<div><strong>${m.sender}:</strong> ${m.message} <small>(${m.time})</small></div>`;
            });
            if (box) box.innerHTML = html;
            if (adminBox) adminBox.innerHTML = html;
        });
}