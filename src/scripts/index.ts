import { ProductControler } from "./controller/productController";
import { ProductDetails } from "./view/productDetails";

document.addEventListener("DOMContentLoaded", () => {
    // Check if we're on a product details page
    const isProductDetailPage = window.location.pathname.includes('product.html');
    
    if (isProductDetailPage) {
        // Initialize product details view if URL has an ID parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('id')) {
            new ProductDetails();
        } else {
            // Redirect to home if no ID provided
            window.location.href = '/';
        }
    } else {
        // Initialize main product controller for all other pages
        new ProductControler();
    }
});