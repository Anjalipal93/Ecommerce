import api from './api.js';

class Main {
    constructor() {
        this.productGrid = document.getElementById('product-grid');
        this.initialize();
    }

    async initialize() {
        try {
            const products = await api.getProducts();
            this.displayProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.productGrid.innerHTML = '<p class="error">Error loading products. Please try again later.</p>';
        }
    }

    displayProducts(products) {
        if (!products || products.length === 0) {
            this.productGrid.innerHTML = '<p class="no-products">No products available at the moment.</p>';
            return;
        }

        const productsHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="eco-rating">Eco Rating: ${product.ecoRating}/5</p>
                    <button class="add-to-cart" onclick="window.location.href='/product.html?id=${product._id}'">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');

        this.productGrid.innerHTML = productsHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Main();
}); 