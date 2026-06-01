import { LoginStorage } from "/JS/components/login.js";
import {
  WishlistStore,
  WishlistStorage,
  WishListUI,
  WishlistSync,
  WishlistService,
} from "/JS/store/wishlist/wishlist-components.js";

//*============== { WishList Page } ==============
/* Planing :
 * [DONE] WishlistStorage
 * [DONE] WishlistStore
 * [DONE] WishlistSevice
 * [DONE] WishlistUI
 * [DONE] WishlistSync
 */

/* Notes :
 * [DONE] LoginStorage
 * renderItems مع كل تعريف متغير هل هيحصل تسريب ذاكرة عندك في ميثود Loop هل عند ال
 */

class Wishlist {
  /**
   * @class Wishlist { Root }
   * @returns {void}
   */

  constructor() {
    this.#init();
  }

  /**
   * @method init
   * @returns {void}
   */
  #init() {
    this.storage = new WishlistStorage("wishlist");
    this.store = new WishlistStore(this.storage.load);
    this.loginStorage = new LoginStorage("user");
    this.service = new WishlistService();

    this.channel = new WishlistSync(
      "wishlist_channel",
      this.onCallChannel.bind(this),
    );

    this.render();
  }

  render() {
    this.ui = new WishListUI(
      this.eventsMethods(),
      this.loginStorage.user,
      this.store.items,
    );

    this.ui.initRender(
      "containerWishlist",
      "cartWishlistTemplate",
      "loginTemplate",
    );
  }

  //*========================
  //*==== Helpers Methods
  //*========================
  onCallChannel({ value }) {
    this.store.setItems(value);

    if (this.ui) this.ui.renderWishlistCounts(this.store.items.length);

    const btnWishlist = document.getElementById("addToWishListBtn");
    if (btnWishlist && this.detailsThis) {
      const icon = btnWishlist.querySelector("i");
      const curr = this.detailsThis.data;

      if (curr) {
        const sku = `${curr.id}-${curr.variants[this.detailsThis.indexActive].color_id}`;

        icon.className = this.store.has(sku)
          ? "fa-solid fa-heart"
          : "fa-regular fa-heart";
      }
    }

    this.render();
  }

  /**
   * @method eventsMethods
   * @returns {object}
   */
  eventsMethods() {
    const onclickHeart = (e) => {
      const target = e.target.closest(".cart-wishlist");
      if (!target || !this.store) return;

      // 1. مسح من الداتا
      this.store.delete(target.productSku);
      this.storage.save(this.store.items);

      this.channel.broadcast({
        type: "CHANGE_CURRENT_ITEM",
        value: this.store.items,
      });

      target.remove();
      this.ui.renderWishlistCounts(this.store.items.length);

      if (this.store.items.length === 0) {
        this.render();
      }
    };

    const onclickLogin = () => {
      if (!this.loginStorage) return;
      this.loginStorage.saveLogin("", true);
      this.render();
    };

    return { onclickLogin, onclickHeart };
  }

  toggleItem(curr, sku, indexClr, isActive) {
    if (!isActive) this.store.delete(sku);
    else this.store.add(this.service.loadAdded(curr, sku, false, indexClr));

    this.storage.save(this.store.items);
    if (this.ui) this.ui.renderWishlistCounts(this.store.items.length);

    this.channel.broadcast({
      type: "CHANGE_CURRENT_ITEM",
      value: this.store.items,
    });
  }

  toggleFromCart(currItem, isActive) {
    //* Init
    const sku = this.service.skuFormate(currItem.sku);

    //* Update
    if (!isActive) this.store.add(this.service.loadAdded(currItem, sku));
    else this.store.delete(sku);

    //* Save & Render Update
    this.storage.save(this.store.items);
    if (this.ui) this.ui.renderWishlistCounts(this.store.items.length);

    //* Sharing Updated
    this.channel.broadcast({
      type: "CHANGE_CURRENT_ITEM",
      value: this.store.items,
    });
  }
}

export const wishlistInstance = new Wishlist();
//*============== { WishList Page } ==============
