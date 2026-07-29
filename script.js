// --- 1. REAL PRODUCT DATA (Indian Market Prices) ---
const products = [
    { 
        id: 1, 
        title: "Smartphone Pro 5G (256GB, Midnight Black)", 
        price: 74999, // ₹74,999
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80" 
    },
    { 
        id: 2, 
        title: "Smart LED TV 4K Ultra HD - 55 Inches", 
        price: 42990, 
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80" 
    },
    { 
        id: 3, 
        title: "Wireless Noise Cancelling Headphones", 
        price: 19999, 
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" 
    },
    { 
        id: 4, 
        title: "Ultra Slim Laptop - 16GB RAM, 1TB SSD", 
        price: 85500, 
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80" 
    },
    { 
        id: 5, 
        title: "Smartwatch Series 8 - Fitness Tracker", 
        price: 15999, 
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80" 
    },
    { 
        id: 6, 
        title: "Tablet Pad Pro 11-inch Display", 
        price: 65000, 
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80" 
    }
];

// Formatting helper for Indian Currency (e.g. ₹74,999)
const formatINR = (amount) => {
    return '₹' + amount.toLocaleString('en-IN');
};

// --- 2. GLOBAL STATE ---
let cart = [];
let userProfile = {};

// --- 3. REGISTRATION / AUTH FLOW ---
function handleRegister(e) {
    e.preventDefault();
    
    // Capture user details from form
    userProfile = {
        name: document.getElementById('reg-name').value,
        phone: document.getElementById('reg-phone').value,
        email: document.getElementById('reg-email').value,
        address: document.getElementById('reg-address').value
    };

    // Transition UI from Auth to Main Store
    document.getElementById('app-auth').style.display = 'none';
    document.getElementById('app-store').style.display = 'block';
    
    // Personalize Store
    document.getElementById('user-greeting').innerText = `Hello, ${userProfile.name.split(' ')[0]}`;
    
    // Populate Shipping Details in Checkout
    document.getElementById('checkout-address').innerHTML = `
        <strong>${userProfile.name}</strong><br>
        Phone: ${userProfile.phone}<br>
        ${userProfile.email ? userProfile.email + '<br>' : ''}
        ${userProfile.address}
    `;

    // Load Store Products
    renderProducts();
}

// --- 4. STOREFRONT RENDER ---
function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-title">${product.title}</div>
            <div class="product-price">${formatINR(product.price)}</div>
            <div class="spacer"></div>
            <button class="primary-btn w-100" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
}

// --- 5. CART LOGIC ---
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });

    updateCartCount();
    showToast();
}

function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) cart.splice(itemIndex, 1);
        renderCartItems();
        updateCartCount();
    }
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = total;
}

// --- 6. CHECKOUT & PAYMENT SIDEBAR ---
function openCart() {
    renderCartItems();
    goToStep('cart');
    document.getElementById('cart-sidebar').classList.add('open');
}

function closeCart() {
    document.getElementById('cart-sidebar').classList.remove('open');
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Your cart is empty.</p>';
        document.getElementById('cart-subtotal').innerText = '₹0';
        document.getElementById('cart-total').innerText = '₹0';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        total += (item.price * item.quantity);
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <div class="cart-item-img"><img src="${item.image}" alt="${item.title}"></div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${formatINR(item.price)}</div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
        container.appendChild(el);
    });

    document.getElementById('cart-subtotal').innerText = formatINR(total);
    document.getElementById('cart-total').innerText = formatINR(total);
}

function goToStep(step) {
    if (step === 'shipping' && cart.length === 0) {
        alert("Please add items to your cart first!");
        return;
    }

    document.querySelectorAll('.checkout-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');

    const titles = {
        'cart': 'Shopping Cart',
        'shipping': 'Delivery Details',
        'payment': 'Payment Method',
        'success': 'Order Confirmed'
    };
    document.getElementById('sidebar-title').innerText = titles[step];
}

function toggleCardInput(show) {
    document.getElementById('card-input-group').style.display = show ? 'block' : 'none';
}

function placeOrder() {
    const btn = document.getElementById('place-order-btn');
    btn.innerText = "Processing Payment...";
    btn.style.opacity = "0.7";
    
    // 1. Capture a copy of items before clearing cart
    const purchasedItems = [...cart];

    // Simulate payment processing delay (e.g., waiting for UPI approval)
    setTimeout(() => {
        const orderId = "OD" + Math.floor(10000000000 + Math.random() * 90000000000);
        document.getElementById('order-id').innerText = orderId;
        
        // 2. Render item photos on the success screen
        renderOrderSuccessPhotos(purchasedItems);

        cart = []; // Empty cart
        updateCartCount();
        goToStep('success');
        
        btn.innerText = "Pay Now & Place Order";
        btn.style.opacity = "1";
    }, 2000);
}

// Helper: Displays photos of ordered products on the confirmation screen
function renderOrderSuccessPhotos(items) {
    let previewContainer = document.getElementById('ordered-items-preview');
    
    // Create element dynamically if it doesn't already exist in HTML
    if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = 'ordered-items-preview';
        previewContainer.style.cssText = 'display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 15px 0;';
        
        const successStep = document.getElementById('step-success');
        const orderIdPara = document.getElementById('order-id')?.parentElement;
        if (orderIdPara && orderIdPara.nextSibling) {
            successStep.insertBefore(previewContainer, orderIdPara.nextSibling);
        } else {
            successStep.appendChild(previewContainer);
        }
    }

    // Render image preview cards for each purchased item
    previewContainer.innerHTML = items.map(item => `
        <div style="text-align: center; border: 1px solid #e0e0e0; padding: 6px; border-radius: 6px; background: #fff; width: 75px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <img src="${item.image}" alt="${item.title}" style="width: 100%; height: 50px; object-fit: contain;">
            <div style="font-size: 11px; font-weight: bold; color: #333; margin-top: 4px;">Qty: ${item.quantity}</div>
        </div>
    `).join('');
}

// --- 7. UTILS ---
function showToast() {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2000);
}
