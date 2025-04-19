import api from './api.js';

class Search {
    constructor() {
        this.searchForm = document.getElementById('search-form');
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.productsContainer = document.getElementById('products-container');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        this.searchInput.addEventListener('input', () => {
            this.handleSearch();
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchForm.contains(e.target)) {
                this.searchResults.style.display = 'none';
            }
        });
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (query.length < 2) {
            this.searchResults.style.display = 'none';
            return;
        }

        try {
            const products = await api.searchProducts(query);
            this.displaySearchResults(products);
        } catch (error) {
            console.error('Search error:', error);
            this.searchResults.innerHTML = '<p class="error">Error performing search. Please try again.</p>';
            this.searchResults.style.display = 'block';
        }
    }

    displaySearchResults(products) {
        if (products.length === 0) {
            this.searchResults.innerHTML = '<p class="no-results">No products found matching your search.</p>';
            this.searchResults.style.display = 'block';
            return;
        }

        const resultsHTML = products.map(product => `
            <div class="search-result-item" onclick="window.location.href='/product.html?id=${product._id}'">
                <img src="${product.image}" alt="${product.name}" class="search-result-image">
                <div class="search-result-details">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="eco-rating">Eco Rating: ${product.ecoRating}/5</p>
                </div>
            </div>
        `).join('');

        this.searchResults.innerHTML = resultsHTML;
        this.searchResults.style.display = 'block';
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Search();
}); 