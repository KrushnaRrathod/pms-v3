import { StorageService } from "../controller/localStorageService";
import { Product } from "../model/interfaces";
import { templates } from "./template";

export class ProductView {
    private productContainer: HTMLElement;
    private searchInput: HTMLInputElement;
    private addProductButton: HTMLButtonElement;
    private addProductFormContainer: HTMLElement;
    private closeFormButton: HTMLButtonElement;
    private productForm: HTMLFormElement;
    private editProductId: number | null = null;

    constructor() {
        this.productContainer = document.getElementById("product-container") as HTMLElement;
        this.searchInput = document.getElementById("search-bar") as HTMLInputElement;
        this.addProductButton = document.getElementById("add-button") as HTMLButtonElement;
        this.addProductFormContainer = document.getElementById("product-form-container") as HTMLElement;
        this.closeFormButton = document.getElementById("close-form-btn") as HTMLButtonElement;
        this.productForm = document.getElementById("product-form") as HTMLFormElement;
    }

    renderProducts(products: Product[]): void {
        if (!products || products.length == 0) {
            this.showEmpty();
        }
        this.productContainer.innerHTML = products.map(templates.productCard).join("");
    }

    private showEmpty(): void {
        this.productContainer.innerHTML = `<p>No products found</p>`;
    }

    loading() {
        this.productContainer.innerHTML = `<p>Loading...</p>`;
    }
    
    debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
        let timeoutId: ReturnType<typeof setTimeout>;

        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    }

    search(cb: (query: string) => void): void {
        this.searchInput.addEventListener(
            "input",
            this.debounce((e: Event) => {
                cb((e.target as HTMLInputElement).value);
            }, 500)
        );
    }

    viewDetaisButton(product: Product[]) {
        document.querySelectorAll(".view-details-btn").forEach((btn, index: number) => {
            btn.addEventListener("click", () => {
                const productId: number = product[index].id;
                window.location.href = `product.html?id=${productId}`;
            });
        });
    }
}
