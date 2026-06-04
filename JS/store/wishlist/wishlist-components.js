import { UIHelper } from "/JS/components/helpers.js";

export class WishlistStore {
  /**
   * @class WishlistStore { Data Store }
   * @description Manager The Wishlist items
   */

  #items;
  #itemsId;

  constructor(dataItems = []) {
    if (!Array.isArray(dataItems)) return;
    this.#items = dataItems;
    this.initItemsId();
  }

  /**
   * @method has
   * @param {string} id
   * @returns {boolean}
   */
  has(id = "") {
    return this.#itemsId.has(id);
  }

  /**
   * @method items
   * @returns {Array}
   */
  get items() {
    return [...this.#items];
  }

  /**
   * @method itemsId
   * @returns {Array}
   */
  get itemsId() {
    return [...this.#itemsId];
  }

  /**
   * @method add
   * @param {object} item
   * @returns {void}
   */
  add(item = {}) {
    this.#items.push(item);
    this.#itemsId.add(item.sku);
  }

  /**
   * @method delete
   * @param {object} item
   * @returns {void}
   */
  delete(sku = "") {
    this.#items = this.#items.filter((ite) => ite.sku !== sku);
    this.#itemsId.delete(sku);
  }

  /**
   * @method clear
   * @returns {void}
   */
  clear() {
    this.#items = [];
    this.#itemsId.clear();
  }

  setItems(items) {
    this.#items = items;
    this.initItemsId();
  }

  initItemsId() {
    this.#itemsId = new Set(this.#items.map((ite) => ite.sku));
  }

  /**
   * @method initItmsId
   * @param {Array} data
   * @returns {void}
   */
}

export class WishlistStorage {
  /**
   * @class WishlistStorage { Memory }
   * @description Wishlist Memeory
   * @param {string} key
   */

  constructor(key) {
    this.key = key;
  }

  /**
   * @method load
   * @returns {Array}
   */
  get load() {
    return JSON.parse(localStorage.getItem(this.key)) || [];
  }

  /**
   * @method save
   * @param {string} data
   * @returns {void}
   */
  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }
}

export class WishListUI {
  /**
   * @class WishListUI { UI Page }
   * @param {object} param0
   * @param {object} param1
   * @returns {void}
   */

  constructor({ onclickLogin, onclickHeart }, isLoggedIn, items) {
    this.onclickHeart = onclickHeart;
    this.onclickLogin = onclickLogin;
    this.isLoggedIn = isLoggedIn ? true : false;
    this.items = items || [];

    if (!this.onclickHeart || !this.onclickLogin) return;
  }

  /**
   * rendering Wishlist Page
   * @returns {void}
   */
  initRender(containerId, templateCartId, templateLoginId) {
    const templateCart = document.getElementById(templateCartId);
    const templateLogin = document.getElementById(templateLoginId);
    this.container = document.getElementById(containerId);

    this.renderWishlistCounts(this.items.length);

    if (!this.container || !templateCart) return;

    if (this.items.length > 0) this.renderItems(templateCart, templateLogin);
  }

  /**
   * @method renderWishlistCounts
   * @returns {void}
   */
  renderWishlistCounts(n) {
    const countHeartNav = document.getElementById("resultToWishlist");
    if (countHeartNav) {
      countHeartNav.textContent = n;
      if (n < 1) countHeartNav.classList.add("hid");
      else countHeartNav.classList.remove("hid");
    }

    if (!this.container) return;

    const [countHeaderOne, countHeaderTwo] = this.container.querySelectorAll(
      ".wishlist-header .count, #wishlistItemsCount",
    );

    if (countHeaderOne) countHeaderOne.textContent = n;
    if (countHeaderTwo) countHeaderTwo.textContent = n;

    if (n < 1) {
      this.container.classList.remove("active");
    } else {
      this.container.classList.add("active");
    }
  }

  renderItems(templateCart, templateLogin) {
    const fragment = document.createDocumentFragment();
    const loginClone = templateLogin?.content?.cloneNode(true);
    const container = this.container.querySelector(".container-items");

    if (!container) return;

    if (!this.isLoggedIn) {
      fragment.appendChild(loginClone);
    }

    this.items.forEach((ite) => {
      const cloneCart = templateCart.content.cloneNode(true);

      const img = cloneCart.querySelector(".product-photo");
      const iconHeart = cloneCart.querySelector(".icon-heart img");
      const productName = cloneCart.querySelector(".product-name");
      const productBadgesText = cloneCart.querySelector(".product-badges-text");
      const containerPrice = cloneCart.querySelector(".container-price");
      const [salePrice, basicPrice] = cloneCart.querySelectorAll(
        ".sale-price, .basic-price",
      );
      const [linkOne, linkTwo] = cloneCart.querySelectorAll("a");

      img.src = ite.img;
      iconHeart.src = ite.icon;
      productName.textContent = ite.name;
      productBadgesText.textContent = ite.badgesText;
      basicPrice.textContent = `${ite.currency} ${UIHelper.getLocalPrice(ite.currentPrice)}`;
      salePrice.textContent = ite.is_sale
        ? `${ite.currency} ${UIHelper.getLocalPrice(ite.currentPrice)}`
        : ``;
      linkOne.href = ite.href;
      linkTwo.href = ite.href;

      containerPrice.classList.toggle("active", !ite.is_sale);

      fragment.appendChild(cloneCart);
    });

    container.innerHTML = "";
    container.appendChild(fragment);

    container.querySelectorAll(".cart-wishlist").forEach((ite, index) => {
      ite.productSku = this.items[index].sku;
    });

    this.eventsUI(container);
  }

  eventsUI(container) {
    container.onclick = (e) => {
      if (e.target.classList.contains("icon-heart")) this.onclickHeart(e);
      if (e.target.id === "loginOrRegisterBtn") this.onclickLogin();
    };
  }
}

export class WishlistSync {
  /**
   * @class WishlistSync { Synchronously }
   * @param {string} channelName
   * @param {function} onMessage
   */
  constructor(channelName, onMessage) {
    this.channel = new BroadcastChannel(channelName);
    this.channel.onmessage = ({ data }) => {
      if (data.type === "CHANGE_CURRENT_ITEM") onMessage(data);
    };
  }

  broadcast(data) {
    this.channel.postMessage(data);
  }
}

export class WishlistService {
  /**
   * @param {object} currItem
   * @param {string} sku
   * @returns {object}
   */
  loadAdded(currItem, sku, isCartItem, indexActive) {
    if (isCartItem) {
      return {
        ...currItem,
        sku,
        icon: "./images/wishlist_full.svg",
        badgesText: "",
      };
    } else {
      return {
        id: currItem.id,
        sku,
        name: currItem.name,
        regularPrice: currItem.old_price,
        salePrice: currItem.is_sale ? currItem.sale_price : null,
        currentPrice: currItem.is_sale
          ? currItem.sale_price
          : currItem.old_price,
        currency: currItem.currency,
        is_sale: currItem.is_sale,
        img: currItem.variants[indexActive].images.basic,
        icon: "./images/wishlist_full.svg",
        badgesText: currItem.title_new,
        href: location.href,
      };
    }
  }

  /**
   * @param {string} sku
   * @returns {string}
   */
  skuFormate(sku) {
    if (!sku) return;
    return sku.split("-").slice(0, 2).join("-");
  }
}
