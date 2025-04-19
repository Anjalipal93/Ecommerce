// Sample product data
const products = [
    {
        id: 1,
        name: "Organic Cotton T-Shirt",
        price: 29.99,
        image: "images/products/tshirt.jpg",
        description: "Made from 100% organic cotton, sustainably sourced and produced.",
        ecoRating: 5
    },
    {
        id: 2,
        name: "Bamboo Toothbrush",
        price: 4.99,
        image: "images/products/toothbrush.jpg",
        description: "Biodegradable bamboo handle with compostable bristles.",
        ecoRating: 5
    },
    {
        id: 3,
        name: "Reusable Shopping Bag",
        price: 12.99,
        image: "images/products/bag.jpg",
        description: "Durable, washable, and made from recycled materials.",
        ecoRating: 4
    },
    {
        id: 4,
        name: "Stainless Steel Water Bottle",
        price: 24.99,
        image: "images/products/bottle.jpg",
        description: "BPA-free, keeps drinks hot or cold for hours.",
        ecoRating: 5
    }
];

// Shopping cart functionality
let cart = [];

// DOM Elements
const productGrid = document.querySelector('.product-grid');
const cartCount = document.querySelector('.cart-count');

// Display products
function displayProducts() {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="eco-rating">
                ${'🌱'.repeat(product.ecoRating)}
            </div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button onclick="addToCart(${product.id})" class="add-to-cart">Add to Cart</button>
        </div>
    `).join('');
}

// Add to cart function
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartCount();
        showNotification(`${product.name} added to cart!`);
    }
}

// Update cart count
function updateCartCount() {
    cartCount.textContent = cart.length;
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    updateCartCount();
});

// Add styles for notifications
const style = document.createElement('style');
style.textContent = `
    .product-card {
        background: white;
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }

    .product-card:hover {
        transform: translateY(-5px);
    }

    .product-card img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 5px;
        margin-bottom: 1rem;
    }

    .product-card h3 {
        margin-bottom: 0.5rem;
        color: var(--primary-color);
    }

    .product-price {
        font-size: 1.2rem;
        font-weight: bold;
        margin: 1rem 0;
        color: var(--secondary-color);
    }

    .add-to-cart {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        width: 100%;
        transition: background-color 0.3s ease;
    }

    .add-to-cart:hover {
        background-color: var(--secondary-color);
    }

    .eco-rating {
        color: var(--primary-color);
        margin: 0.5rem 0;
    }

    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style); 