import { AbstractView } from "/JS/pages/abstract-view.js";
import { wishlistInstance } from "/JS/components/dependencies.js";

class Config {
  static get load() {
    return {
      VIEW_ID: `viewWishlist`,
    };
  }
}

export class WishlistView extends AbstractView {
  constructor(params) {
    super(params);
    this.params = params;
    this.setTitle("Wishlist | Adidas");
    this.config = Config.load;
  }

  getHtml() {
    return `
    <section id="${this.config.VIEW_ID}" class="page-view active">
        <div class="container-wishlist-empty">
          <div class="title">YOUR WISHLIST IS EMPTY</div>
          <div class="description">
            Once you add something in your Wishlist - it will appear here. Your
            lists are only available on this device and will expire at the end
            of this session. Ready to get started?
          </div>
          <a href="/shop" data-link class="btn-offer black shop-wishlist">
            <div class="style">continue shopping</div>
          </a>
        </div>
        <div class="container-wishlist" id="containerWishlist">
          <div class="wishlist-header">
            <h2 class="title-head">wishlist</h2>
            <div class="available-count">(<span class="count">1</span>)</div>
          </div>

          <div class="wishlist-body">
            <div class="items-count">
              <span id="wishlistItemsCount">0</span> items
            </div>
            <div class="container-items"></div>
          </div>
        </div>
      </section>`;
  }

  mount() {
    wishlistInstance.render();
  }
}
