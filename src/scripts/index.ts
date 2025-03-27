import { ProductControler } from "./controller/productController"
import { ProductDetails } from "./view/productDetails";

document.addEventListener("DOMContentLoaded", () => {
    new ProductControler();
    new ProductDetails
})