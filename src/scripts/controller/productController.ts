import { Product } from "../model/interfaces";
import { ProductView } from "../view/productView";
import { ApiServices } from "./apiServices";
import { StorageService } from "../controller/localStorageService";

export class ProductControler {
    private apiServices: ApiServices;
    private allProducts: Product[] = [];
    private isLoading: boolean = true;
    private view!: ProductView;

    private addProductButton: HTMLButtonElement;
    private addFormContainer: HTMLElement;
    private closeFormButton: HTMLButtonElement;
    private addProductForm: HTMLFormElement;
    private editProductId: number | null = null;

    constructor() {
        this.apiServices = new ApiServices();   
        this.view = new ProductView();
        this.initalize();

        this.addProductButton = document.getElementById("add-button") as HTMLButtonElement;
        this.addFormContainer = document.getElementById("product-form-container") as HTMLElement;
        this.closeFormButton = document.getElementById("close-form-btn") as HTMLButtonElement;
        this.addProductForm = document.getElementById("product-form") as HTMLFormElement;
    }
    
    private async initalize(): Promise<void> {
        this.view.loading();
        await this.fetchData();
        this.eventHandler();
    }
    
    async fetchData(): Promise<void> {
        try {
            const localProducts = StorageService.getProducts();
            const apiProducts = await this.apiServices.fetchProducts();
            
            this.allProducts = [...localProducts, ...apiProducts]; // Merge both sources
            this.view.renderProducts(this.allProducts);
            this.eventHandler();
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            this.isLoading = false;
        }
    }

    async searchData(query: string): Promise<void> {
        try {
            const localFiltered = StorageService.getProducts().filter((product) =>
                product.title.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase()) ||
                product.brand.toLowerCase().includes(query.toLowerCase())
            );

            const apiProducts = await this.apiServices.searchProducts(query);
            this.allProducts = [...localFiltered, ...apiProducts];
            this.view.renderProducts(this.allProducts);
        } catch (err) {
            console.error("Search error:", err);
        }
    }

    initFormEvents(): void {
        this.addProductButton.addEventListener("click", () => {
            this.editProductId = null; // Reset edit mode
            this.addProductForm.reset();
            this.addFormContainer.classList.remove("hidden");
        });

        this.closeFormButton.addEventListener("click", () => {
            this.addFormContainer.classList.add("hidden");
        });

        this.addProductForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (this.editProductId !== null) {
                await this.updateProduct();
            } else {
                await this.addProduct();
            }
        });
    }

    loadProductIntoForm(product: Product) {
        const setValue = (selector: string, value: any) => {
            (this.addProductForm.querySelector(selector) as HTMLInputElement).value = value;
        };

        const submitBtn = this.addProductForm.querySelector("#submit-btn") as HTMLButtonElement | null;
        if (submitBtn) {
            submitBtn.textContent = "Update";
        }

      
        setValue("#title", product.title);
        setValue("#description", product.description);
        setValue("#category", product.category);
        setValue("#price", product.price);
        setValue("#stock", product.stock);
        setValue("#imageUrl", product.thumbnail);
    }

    initEditButtons(products: Product[]) {
        document.querySelectorAll(".edit-details-btn").forEach((btn, index) => {
            btn.addEventListener("click", () => {
                this.editProductId = products[index].id;
                this.loadProductIntoForm(products[index]);
                this.addFormContainer.classList.remove("hidden");
            });
        });
    }

    initDeleteButtons(): void {
        document.querySelectorAll(".delete-details-btn").forEach((btn) => {
            btn.addEventListener("click", async (event) => {
                const productId = parseInt((event.target as HTMLButtonElement).id);
                if (confirm("Are you sure you want to delete this product?")) {
                    StorageService.deleteProduct(productId);
                    await this.fetchData(); // Refresh UI after deletion
                    alert("Product deleted successfully!");
                }
            });
        });
    }

    async addProduct() {
        const getValue = (selector: string) =>
            (this.addProductForm.querySelector(selector) as HTMLInputElement)?.value.trim() || "";

        const title = getValue("#title");
        const description = getValue("#description");
        const category = getValue("#category");
        const price = Number(getValue("#price"));
        const stock = Number(getValue("#stock"));
        const imageUrl = getValue("#imageUrl");

        if (!title || !description || !category || isNaN(price) || price <= 0 || isNaN(stock) || stock <= 0 || !imageUrl) {
            alert("Please fill out all required fields with valid data.");
            return;
        }

        const id = Math.floor(Math.random() * 100000);
        const newProduct: Product = {
            id: id,
            title: title,
            description: description,
            category: category,
            price: price,
            stock: stock,
            thumbnail: imageUrl,
            discountPercentage: 7.17, 
            rating: 4.94, 
            tags: ["beauty", "mascara"], 
            brand: "Essence", 
            sku: "RCH45Q1A", 
            weight: 2, 
            dimensions: { 
                width: 23.17, 
                height: 14.43, 
                depth: 28.01 
            },
            warrantyInformation: "1 month warranty", 
            shippingInformation: "Ships in 1 month", 
            availabilityStatus: "Low Stock", 
            reviews: [
                {
                    rating: 2,
                    comment: "Very unhappy with my purchase!",
                    date: "2024-05-23T08:56:21.618Z",
                    reviewerName: "John Doe",
                    reviewerEmail: "john.doe@x.dummyjson.com"
                },
                {
                    rating: 2,
                    comment: "Not as described!",
                    date: "2024-05-23T08:56:21.618Z",
                    reviewerName: "Nolan Gonzalez",
                    reviewerEmail: "nolan.gonzalez@x.dummyjson.com"
                },
                {
                    rating: 5,
                    comment: "Very satisfied!",
                    date: "2024-05-23T08:56:21.618Z",
                    reviewerName: "Scarlett Wright",
                    reviewerEmail: "scarlett.wright@x.dummyjson.com"
                }
            ],
            returnPolicy: "30 days return policy", // Added from sample
            minimumOrderQuantity: 24, // Added from sample
            meta: { 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString(), 
                barcode: "9164035109868", // Added from sample
                qrCode: "https://assets.dummyjson.com/public/qr-code.png" // Added from sample
            },
            images: [ // Added from sample
                "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png"
            ]
        };

        StorageService.addProduct(newProduct);
        alert("Product added successfully!");
        this.addProductForm.reset();
        this.addFormContainer.classList.add("hidden");
        await this.fetchData(); // Refresh UI with API data
    }

    async updateProduct() {
        if (this.editProductId === null) return;

        const getValue = (selector: string) =>
            (this.addProductForm.querySelector(selector) as HTMLInputElement)?.value.trim() || "";

        const updatedProduct: Product = {
            id: this.editProductId,
            title: getValue("#title"),
            description: getValue("#description"),
            category: getValue("#category"),
            price: Number(getValue("#price")),
            stock: Number(getValue("#stock")),
            thumbnail: getValue("#imageUrl"),
            discountPercentage: 7.17, 
            rating: 4.94, 
            tags: ["beauty", "mascara"], 
            brand: "Essence", 
            sku: "RCH45Q1A", 
            weight: 2, 
            dimensions: { 
                width: 23.17, 
                height: 14.43, 
                depth: 28.01 
            },
            warrantyInformation: "1 month warranty", 
            shippingInformation: "Ships in 1 month", 
            availabilityStatus: "Low Stock", 
            reviews: [
                {
                    rating: 2,
                    comment: "Very unhappy with my purchase!",
                    date: "2024-05-23T08:56:21.618Z",
                    reviewerName: "John Doe",
                    reviewerEmail: "john.doe@x.dummyjson.com"
                },
                {
                    rating: 2,
                    comment: "Not as described!",
                    date: "2024-05-23T08:56:21.618Z",
                    reviewerName: "Nolan Gonzalez",
                    reviewerEmail: "nolan.gonzalez@x.dummyjson.com"
                },
                {
                    rating: 5,
                    comment: "Very satisfied!",
                    date: "2024-05-23T08:56:21.618Z",
                    reviewerName: "Scarlett Wright",
                    reviewerEmail: "scarlett.wright@x.dummyjson.com"
                }
            ],
            returnPolicy: "30 days return policy", // Added from sample
            minimumOrderQuantity: 24, // Added from sample
            meta: { 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString(), 
                barcode: "9164035109868", // Added from sample
                qrCode: "https://assets.dummyjson.com/public/qr-code.png" // Added from sample
            },
            images: [ // Added from sample
                "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png"
            ]
        };

        StorageService.updateProduct(updatedProduct);
        alert("Product updated successfully!");
        this.addProductForm.reset();
        this.addFormContainer.classList.add("hidden");
        await this.fetchData(); // Refresh UI with API data
    }

    private eventHandler(): void {
        try {
            this.view.search(async (query: string) => {
                await this.searchData(query);
            });

            this.view.viewDetaisButton(this.allProducts);
            this.initFormEvents();
            this.initEditButtons(this.allProducts);
            this.initDeleteButtons();
        } catch (err) {
            console.error("Event Handler Error:", err);
        }
    }
}