import { AbstractView } from "/JS/pages/abstract-view.js";
import { cartInstance } from "/JS/components/dependencies.js";

class Config {
  static get load() {
    return {
      VIEW_ID: "viewCart",
    };
  }
}

export class CartView extends AbstractView {
  constructor(params) {
    super(params);
    this.params = params;

    this.setTitle("Cart | Adidas");

    this.config = Config.load;
  }

  getHtml() {
    return `
    <section id="${this.config.VIEW_ID}" class="page-view active">
        <div id="containerCart" class="container-cart">
          <div class="when-not-available">
            <h2>YOUR BAG IS EMPTY</h2>
            <p>
              Once you add something in your bag - it will appear here. Ready to
              get started?
            </p>
            <a href="#" class="btn-offer black">
              <div class="style">Continue Shopping</div>
            </a>
          </div>
          <div class="when-available">
            <div class="title-header-cart">
              <h2>YOUR BAG</h2>
              <div class="available-count">
                (<span class="count">0</span> Unreserved Items)
              </div>
            </div>
            <div class="row">
              <div class="left-cart">
                <div class="container-view-carts" id="viewCarts"></div>
              </div>
              <div class="right-cart" id="containerSummary">
                <div class="container-calculations-product">
                  <div class="row-one">
                    <h2 class="title">ORDER SUMMARY</h2>
                    <div class="all-current-products">
                      (<span class="items-count">0</span> items)
                    </div>
                  </div>
                  <div class="row-two">
                    <div class="subtotal-container price-the-product">
                      <div class="price-name">Subtotal</div>
                      <div class="price-value">EGP 0,00</div>
                    </div>
                    <div class="delivery-container price-the-product">
                      <div class="price-name">Delivery</div>
                      <div class="price-value">free</div>
                    </div>
                    <p class="msg">You unlocked Free Shipping!</p>

                    <div class="total-price-container">
                      <div class="price-name">TOTAL</div>
                      <div class="price-value">EGP 0,00</div>
                    </div>
                  </div>
                </div>
                <div class="container-btns">
                  <button class="btn-offer black" id="checkoutBtn">
                    <div class="style">
                      <i class="fa-solid fa-lock"></i>checkout
                    </div>
                  </button>
                </div>

                <div class="foot">
                  <div class="container-promo-code">
                    <div class="title-promo">
                      <img src="/images/icons/promo.svg" alt="promo_code" />
                      <h2>ENTER PROMO CODE</h2>
                    </div>
                    <form class="form-promo" id="formPromoCode">
                      <input type="text" name="promoCode" />
                      <div class="container-promo-user"></div>
                      <button
                        class="submit-promo btn-offer black"
                        id="submitPromoCode"
                        type="submit"
                      >
                        Submit
                      </button>
                    </form>
                  </div>
                  <p>Accepted payment methods</p>
                  <div class="payment-methods">
                    <img src="/images/icon-adidas-Visa.webp" alt="icon_visa" />
                    <img
                      src="/images/icon-adidas-Mastercard.webp"
                      alt="icon_mastercard"
                    />
                    <img
                      src="/images/icon-adidas-paypal-2.webp"
                      alt="icon_paypal"
                    />
                    <img
                      src="/images/value-payment-icon.webp"
                      alt="icon_value"
                    />
                    <img
                      src="/images/icon-adidas-cash-on-delivery.webp"
                      alt="icon_cash_on_delivery"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  mount() {
    cartInstance.run(true);
  }

  unmount() {
    window.removeEventListener(
      "clickPromoUser",
      cartInstance.boundResetPromoCode,
    );

    if (cartInstance.wishlistChannelListener) {
      cartInstance.wishlistChannelListener.close();
      cartInstance.wishlistChannelListener = null;
    }

    if (cartInstance.sync) {
      cartInstance.sync.close();
      cartInstance.sync = null;
    }

    if (cartInstance.ui && typeof cartInstance.ui.destroy === "function") {
      cartInstance.ui.destroy();
    }
  }
}
