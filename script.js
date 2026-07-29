// --- 1. Product Database ---
const products = [
    { id: 1, title: "Echo Dot (4th Gen) | Smart speaker with Alexa", price: 49.99, rating: "★★★★☆", icon: "fa-compact-disc" },
    { id: 2, title: "ProVision 4K Ultra HD Smart TV - 55 inch", price: 399.00, rating: "★★★★★", icon: "fa-tv" },
    { id: 3, title: "Wireless Noise Cancelling Headphones", price: 199.50, rating: "★★★★☆", icon: "fa-headphones" },
    { id: 4, title: "Gaming Laptop - 16GB RAM, 1TB SSD, RTX 4060", price: 1249.99, rating: "★★★★★", icon: "fa-laptop" },
    { id: 5, title: "Smart Home Security Camera - 1080p", price: 34.99, rating: "★★★☆☆", icon: "fa-video" },
    { id: 6, title: "Professional DSLR Camera Body", price: 899.00, rating: "★★★★★", icon: "fa-camera" },
    { id: 7, title: "Ergonomic Office Chair with Lumbar Support", price: 159.99, rating: "★★★★☆", icon: "fa-chair" },
    { id: 8, title: "Stainless Steel Smart Watch", price: 249.00, rating: "★★★★☆", icon: "fa-clock" }
];

// --- 2. Global State ---
let cart = JSON.parse(localStorage.getItem('ecommerce_cart')) || [];
let currentPhoneNumber = '';

// --- 3. App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
});

// --- 4. Render Storefront ---
function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const priceParts = product.price.toFixed(2).split('.');
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img"><i class="fas ${product.icon}"></i></div>
            <div class="product-title">${product.title}</div>
            <div class="product-rating">${product.rating} <span>(${Math.floor(Math.random() * 5000) + 100})</span></div>
            <div class="product-price"><sup>$</sup>${priceParts[0]}<sup>${priceParts[1]}</sup></div>
            <div class="spacer"></div>
            <button class="primary-btn w-100" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
}

// --- 5. Cart Actions & LocalStorage Persistence ---
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    showToast("Added to Cart");
}

function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveCart();
        renderCartItems();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
}

function saveCart() {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = totalItems;
}

// --- 6. Checkout Wizard & Rendering ---
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px; color: #565959;">Your shopping cart is empty.</p>';
        document.getElementById('cart-subtotal').innerText = '$0.00';
        document.getElementById('cart-tax').innerText = '$0.00';
        document.getElementById('cart-total').innerText = '$0.00';
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        subtotal += (item.price * item.quantity);
        const cartEl = document.createElement('div');
        cartEl.className = 'cart-item';
        cartEl.innerHTML = `
            <div class="cart-item-img"><i class="fas ${item.icon}"></i></div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <span class="delete-btn" onclick="removeFromCart(${item.id})">Delete</span>
                </div>
            </div>
        `;
        container.appendChild(cartEl);
    });

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').innerText = `$${tax.toFixed(2)}`;
    document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
}

function goToStep(stepName) {
    document.querySelectorAll('.checkout-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${stepName}`).classList.add('active');

    const titles = {
        'cart': 'Shopping Cart',
        'shipping': 'Shipping Address',
        'payment': 'Payment Method',
        'success': 'Order Confirmation'
    };
    document.getElementById('sidebar-title').innerText = titles[stepName];
}

function placeOrder() {
    const btn = document.getElementById('place-order-btn');
    btn.innerText = "Processing...";
    btn.style.opacity = "0.7";
    
    setTimeout(() => {
        const fakeOrderId = "AZ-" + Math.floor(100000000 + Math.random() * 900000000);
        document.getElementById('order-id').innerText = fakeOrderId;
        
        cart = [];
        saveCart();
        
        goToStep('success');
        btn.innerText = "Place Your Order";
        btn.style.opacity = "1";
    }, 1800);
}

// --- 7. Real SMS OTP API Integration ---
async function requestRealOTP() {
    const input = document.getElementById('login-input').value.trim();

    if (!input.startsWith('+') || input.length < 10) {
        alert("Please enter a valid phone number including country code (e.g. +12025550123 or +919876543210).");
        return;
    }

    currentPhoneNumber = input;

    try {
        const response = await fetch('http://localhost:3000/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: currentPhoneNumber })
        });

        const data = await response.json();

        if (data.success) {
            alert("SMS sent successfully!");
            document.getElementById('phoneSection').style.display = 'none';
            document.getElementById('otpSection').style.display = 'block';
        } else {
            alert("Failed to send SMS: " + data.message);
        }
    } catch (err) {
        alert("Could not reach backend server on http://localhost:3000. Running in fallback mode.");
        document.getElementById('phoneSection').style.display = 'none';
        document.getElementById('otpSection').style.display = 'block';
    }
}

async function verifyRealOTP() {
    const enteredOtp = document.getElementById('otpInput').value.trim();

    if (enteredOtp.length !== 6) {
        alert("Please enter the 6-digit code received on your phone.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: currentPhoneNumber, otp: enteredOtp })
        });

        const data = await response.json();

        if (data.success) {
            alert("Login verified successfully!");
            closeModals();
        } else {
            alert("Verification error: " + data.message);
        }
    } catch (err) {
        alert("Verified (Offline Demo Mode).");
        closeModals();
    }
}

function backToPhoneSection() {
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('phoneSection').style.display = 'block';
}

// --- 8. Modals & Notifications ---
function openCart() {
    renderCartItems();
    goToStep('cart');
    document.getElementById('cart-sidebar').classList.add('open');
}

function openLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('phoneSection').style.display = 'block';
    document.getElementById('otpSection').style.display = 'none';
}

function closeModals() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('cart-sidebar').classList.remove('open');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2500);
}
