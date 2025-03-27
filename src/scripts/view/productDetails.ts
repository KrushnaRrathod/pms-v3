import { ApiServices } from "../controller/apiServices";
import { StorageService } from "../controller/localStorageService";
import { templates } from "./template";
import { Product } from "../model/interfaces";

export class ProductDetails {
    private apiServices: ApiServices;
    private urlParams: URLSearchParams;
    private productId: string;
    private productDetailContainer: HTMLElement;

    constructor () {
        this.apiServices = new ApiServices();
        this.urlParams = new URLSearchParams(window.location.search);
        this.productId = this.urlParams.get("id")!;
        this.productDetailContainer = document.getElementById("product-details") as HTMLElement;
        this.searchProductByID();
    }

    async searchProductByID() {
        try {
            const localProducts = StorageService.getProducts();
            let product = localProducts.find(p => p.id.toString() === this.productId);
    
            if (!product) {
                product = await this.apiServices.searchOneProduct(this.productId);
            }
    
            // Render product details
            this.productDetailContainer.innerHTML = templates.productDetails(product);
        } catch (err) {
            console.log("Error fetching product details:", err);
        }
    }
    
}
