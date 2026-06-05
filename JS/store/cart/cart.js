import { MobileGallery } from "/JS/pages/product-page/product-components.js";
import { UIHelper, Products } from "/JS/components/helpers.js";
import { wishlistInstance } from "/JS/store/wishlist/wishlist.js";
import {
  PromoStorage,
  PromoStore,
  PromoService,
} from "/JS/store/cart/promo.js";

class Config {
  static load() {
    return {
      MIN_DELIVERY_TARGET_PRICE: 1000,
      MIN_STOCK_WARNING: 5,
      DELIVERY_PRICE: 60,
      STORAGE_KEY: "cartItems",
      CHANNEL_NAME: "cart_channel",
    };
  }
}

class CartStore {
  #items = [];

  get items() {
    return structuredClone(this.#items);
  }

  setItem(items) {
    this.#items = items;
  }

  updateItems(id, updater) {
    this.#items = this.#items.map((ite) => {
      return ite.sku === id ? updater(ite) : ite;
    });
  }

  removeItem(id) {
    this.#items = this.#items.filter((ite) => ite.sku !== id);
  }

  clearItems() {
    this.#items = [];
  }
}

class CartService {
  constructor(store, config) {
    this.store = store;
    this.config = config;
  }

  getItem(sku) {
    return this.store.items.find((ite) => ite.sku === sku);
  }

  getCurrItems(sku, sizes) {
    if (!Array.isArray(sizes)) return;

    return sizes.find((ite) => ite.sku === sku);
  }

  getDataObj(product, colorId) {
    const curr = product.variants.find((ite) => ite.color_id === colorId);

    return curr ? curr : "";
  }

  updateQtyProducts() {
    let products = Products.products;

    this.store.items.forEach((cartItem) => {
      // 1. ندور على المنتج الرئيسي
      const productIndex = products.findIndex(
        (pr) => pr.id === cartItem.productId,
      );

      if (productIndex !== -1) {
        // 2. ندور على اللون
        const variantIndex = products[productIndex].variants.findIndex(
          (v) => v.color_id === cartItem.colorId,
        );

        if (variantIndex !== -1) {
          // 3. ندور على المقاس ونعدل الستوك بتاعه
          const sizeIndex = products[productIndex].variants[
            variantIndex
          ].sizes.findIndex((s) => s.size === cartItem.size);

          if (sizeIndex !== -1) {
            products[productIndex].variants[variantIndex].sizes[
              sizeIndex
            ].stock = cartItem.virtualStock;
          }
        }
      }
    });

    Products.setProducts(products);
  }

  updateQuantity(id, qty) {
    if (qty <= 0) {
      this.store.removeItem(id);
      return;
    }

    this.store.updateItems(id, (item) => {
      return {
        ...item,
        quantity: qty,
        virtualStock: item.maxStock - qty,
        currentItemTotal: qty * item.currentPrice,
        regularItemTotal: qty * item.regularPrice,
      };
    });
  }

  calculateSummary() {
    const items = this.store.items;
    const total = items.reduce((s, i) => s + i.currentItemTotal, 0);
    const currency = items[0]?.currency || "EGP";
    const priceDelivery =
      total < this.config.MIN_DELIVERY_TARGET_PRICE
        ? this.config.DELIVERY_PRICE
        : 0;
    return {
      subTotal: total,
      delivery: priceDelivery,
      total: total + priceDelivery,
      currency,
    };
  }

  initItems(items) {
    if (!items) return [];

    return items.map((item) => {
      return {
        ...item,
        currentItemTotal: item.quantity * item.currentPrice,
        regularItemTotal: item.quantity * item.regularPrice,
      };
    });
  }

  onToggleWishList(isActive, sku) {
    return this.store.items.map((ite) => {
      if (ite.sku === sku) {
        return { ...ite, is_wishlist: isActive };
      }
      return ite;
    });
  }

  getCount() {
    return this.store.items.reduce((acc, curr) => acc + +curr.quantity, 0);
  }

  isStockAvailable(sku, items) {
    return items.some((ite) => {
      if (ite.sku !== sku) return;
      return ite.stock > 0;
    });
  }

  sizeInTheCart(sku) {
    return this.store.items.some((ite) => sku === ite.sku);
  }

  getSizeItem(sku, items) {
    if (!Array.isArray(items)) return;
    return items.find((ite) => ite.sku === sku);
  }
}

class CartUI {
  constructor({
    onQtyChange,
    onRemove,
    onToggleWishList,
    onApplyPromoCode,
    onCheckout,
    onClickBtnEdit,
    onclickPromoUser,
    getActivePromoCode,
    applyValidPromoState,
  }) {
    this.onQtyChange = onQtyChange;
    this.onRemove = onRemove;
    this.onToggleWishList = onToggleWishList;
    this.onApplyPromoCode = onApplyPromoCode;
    this.onCheckout = onCheckout;
    this.onClickBtnEdit = onClickBtnEdit;
    this.onclickPromoUser = onclickPromoUser;
    this.getActivePromoCode = getActivePromoCode;
    this.applyValidPromoState = applyValidPromoState;

    this.containerCart = document.getElementById("containerCart");
    this.containerItems = document.getElementById("viewCarts");
    this.containerSummary = document.getElementById("containerSummary");

    this.isAllFoundContainers = true;

    if (!this.containerCart || !this.containerItems || !this.containerSummary) {
      this.isAllFoundContainers = false;
    }
  }

  renderItems(items, count) {
    if (!this.isAllFoundContainers) return;

    this.containerItems.innerHTML = ``;

    if (count <= 0) {
      this.containerCart.classList.remove("available");
      return;
    }

    this.containerCart.classList.add("available");

    const itemsHTML = this.handleRenderItems(items); // return DOM Element
    this.containerItems.appendChild(itemsHTML);

    this.bindCartEvents();
  }

  renderSummary(summary, count, discountAmount = 0) {
    if (!this.isAllFoundContainers || count <= 0) return;

    const [itemsCountOne, itemsCountTwo] = document.querySelectorAll(
      ".when-available .count, .all-current-products .items-count",
    );

    const subTotal = document.querySelector(".subtotal-container .price-value");
    const delivePr = document.querySelector(".delivery-container .price-value");
    const totalPrice = document.querySelector(
      ".total-price-container .price-value",
    );

    const formPromo = document.getElementById("formPromoCode");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const promoContainer = document.querySelector(".container-promo-user");
    const promoInput = document.querySelector(`input[name="promoCode"]`);

    itemsCountOne.innerText = count;
    itemsCountTwo.innerText = count;

    if (!subTotal || !delivePr || !totalPrice) return;

    subTotal.textContent = `${summary.currency} ${UIHelper.getLocalPrice(summary.subTotal)}`;
    delivePr.textContent = `${summary.delivery > 0 ? `${summary.currency} ${UIHelper.getLocalPrice(summary.delivery)}` : "Free"}`;
    totalPrice.textContent = `${summary.currency} ${UIHelper.getLocalPrice(summary.total - discountAmount)}`;

    this.initPromoReadUser(promoContainer, promoInput);
    this.setupSummaryEvents(formPromo, checkoutBtn);
  }

  setupSummaryEvents(formPromo, checkoutBtn) {
    formPromo.removeEventListener("submit", this.onApplyPromoCode);
    formPromo.addEventListener("submit", this.onApplyPromoCode, {
      passive: false,
    });

    checkoutBtn.removeEventListener("click", this.onCheckout);
    checkoutBtn.addEventListener("click", this.onCheckout, { passive: true });
  }

  initPromoReadUser(container, input) {
    container.innerHTML = ``;

    const code = this.getActivePromoCode();
    if (!code) return;

    const containerPromoUser = document.createElement("div");
    containerPromoUser.className = `promo-user`;

    const buttonPromoUser = document.createElement("button");
    buttonPromoUser.id = `cancelPromoUser`;
    buttonPromoUser.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

    const codePromoUser = document.createElement("span");
    codePromoUser.id = `promoUserValue`;
    codePromoUser.textContent = code;

    containerPromoUser.onclick = (event) => {
      this.onclickPromoUser(event, input);
    };

    this.applyValidPromoState(input);

    containerPromoUser.append(buttonPromoUser, codePromoUser);
    container.append(containerPromoUser);
  }

  handleRenderItems(items) {
    const fragment = document.createDocumentFragment();

    items.forEach((ite) => {
      const optionsTag = this.getOptionsSelectTag(ite);

      // 1. الحاوية الرئيسية
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.dataset.sku = ite.sku;

      // 2. الجزء الأيسر (الصورة والرابط)
      const leftItem = document.createElement("div");
      leftItem.className = "left-item";

      const linkLeft = document.createElement("a");
      linkLeft.href = ite.url;

      const img = document.createElement("img");
      img.src = ite.image;
      img.alt = "photo_product";

      linkLeft.appendChild(img);
      leftItem.appendChild(linkLeft);

      // 3. الجزء الأيمن (التفاصيل)
      const rightItem = document.createElement("div");
      rightItem.className = "right-item";

      const containerViewDetails = document.createElement("div");
      containerViewDetails.className = "container-view-details";

      // --- التفاصيل الأساسية للمنتج ---
      const basicsInfoProduct = document.createElement("div");
      basicsInfoProduct.className = "basics-info-product";

      const detailsCurrent = document.createElement("div");
      detailsCurrent.className = "details-crrent";

      // Row One (Title & Prices)
      const rowOne = document.createElement("div");
      rowOne.className = "row-one";

      const titleLink = document.createElement("a");
      titleLink.href = ite.url;
      titleLink.className = "title-product";
      titleLink.textContent = ite.name;
      titleLink.title = ite.name;

      const containerPrices = document.createElement("div");
      containerPrices.className = `container-prices ${ite.is_sale ? "" : "active"}`;

      const salePrice = document.createElement("div");
      salePrice.className = "sale-price";
      salePrice.textContent = `${ite.currency} ${UIHelper.getLocalPrice(ite.currentItemTotal)}`;

      const basicPrice = document.createElement("div");
      basicPrice.className = "basic-price";
      basicPrice.textContent = `${ite.currency} ${UIHelper.getLocalPrice(ite.regularItemTotal)}`;

      containerPrices.append(salePrice, basicPrice);

      rowOne.append(titleLink, containerPrices);

      // Row Two (Color, Size, Stock, Edit)
      const rowTwo = document.createElement("div");
      rowTwo.className = "row-two";

      const colorDiv = document.createElement("div");
      colorDiv.className = "color-product";
      colorDiv.textContent = ite.colorName;
      colorDiv.title = ite.colorName;

      const sizeDiv = document.createElement("div");
      sizeDiv.className = "size-product";
      sizeDiv.textContent = "Size: ";
      const sizeSpan = document.createElement("span");
      sizeSpan.className = "size-count";
      sizeSpan.textContent = ite.size;
      sizeDiv.appendChild(sizeSpan);

      const stockDiv = document.createElement("div");
      stockDiv.className = "available-stock-msg";
      stockDiv.innerHTML =
        ite.virtualStock <= Config.load().MIN_STOCK_WARNING
          ? `Only ${ite.virtualStock} left in stock`
          : ``;

      const editBtn = document.createElement("button");
      editBtn.className = "edit-product-btn";
      editBtn.textContent = "Edit";

      rowTwo.append(colorDiv, sizeDiv, stockDiv, editBtn);
      detailsCurrent.append(rowOne, rowTwo);

      // قائمة الكمية (Select)
      const selectTag = document.createElement("select");
      selectTag.name = "stock-count";
      selectTag.className = `stock-${ite.sku}`;
      selectTag.innerHTML = optionsTag;

      basicsInfoProduct.append(detailsCurrent, selectTag);

      // --- أزرار الحذف والمفضلة ---
      const delAndWishlistBtns = document.createElement("div");
      delAndWishlistBtns.className = "del-and-wishlist-btns";

      const deleteBtn = document.createElement("div");
      deleteBtn.className = "delete-product-btn";
      deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';

      const wishlistBtn = document.createElement("div");
      wishlistBtn.className = "add-product-to-wishlist-btn center";
      const wishlistImg = document.createElement("img");

      wishlistImg.src = wishlistInstance.store.has(
        wishlistInstance.service.skuFormate(ite.sku),
      )
        ? "images/wishlist_full.svg"
        : "images/download1.svg";
      wishlistImg.className = ite.is_wishlist ? "active" : "";
      wishlistImg.alt = "add to wisthlist";
      wishlistBtn.appendChild(wishlistImg);

      delAndWishlistBtns.append(deleteBtn, wishlistBtn);

      // تجميع كل العناصر في الحاوية الرئيسية
      containerViewDetails.append(basicsInfoProduct, delAndWishlistBtns);
      rightItem.appendChild(containerViewDetails);

      cartItem.append(leftItem, rightItem);
      fragment.appendChild(cartItem);
    });

    return fragment;
  }

  bindCartEvents() {
    this.containerItems.onclick = (e) => {
      const itemElement = e.target.closest(".cart-item");

      if (!itemElement) return;

      const sku = itemElement.dataset.sku;

      if (e.target.closest(".delete-product-btn")) {
        this.onRemove(sku);
      }

      if (e.target.closest(".add-product-to-wishlist-btn")) {
        const btn = e.target.closest(".add-product-to-wishlist-btn");
        const img = btn.querySelector("img") || e.target;
        this.handleToggleWishlist(sku, img);
      }

      if (e.target.closest(".edit-product-btn")) {
        this.handleEditProduct(e, sku);
      }
    };

    this.containerItems.onchange = (e) => {
      if (e.target.matches(`select[name="stock-count"]`)) {
        const itemElement = e.target.closest(".cart-item");
        this.onQtyChange(itemElement.dataset.sku, e.target.value);
      }
    };
  }

  handleToggleWishlist(sku, imgElement) {
    const isActive = wishlistInstance.store.has(
      wishlistInstance.skuFormate(sku),
    );
    imgElement.classList.toggle("active", isActive);

    this.onToggleWishList(isActive, sku);
  }

  getOptionsSelectTag(ite) {
    let items = ``;

    for (let i = 1; i <= ite.maxStock; i++) {
      if (ite.quantity == i) items += `<option selected>${i}</option>`;
      else items += `<option>${i}</option>`;
    }

    return items;
  }

  handleEditProduct(e, sku) {
    this.onClickBtnEdit(e, sku);
  }
}

class CartStorage {
  constructor(key, myBag) {
    this.key = key;
    this.myBag = myBag;
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch (err) {
      return err;
    }
  }

  save(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
    this.myBag.updateCartItemsReadOnly();
  }

  loadProductByMemory(id) {
    const allProducts = Products.products;
    return allProducts.find((pr) => pr.id === id);
  }
}

class CartSync {
  constructor(channelName, onMessage) {
    this.channel = new BroadcastChannel(channelName);
    this.channel.onmessage = ({ data }) => {
      if (data.type === "CHANGE_CURRENT_ITEM") onMessage(data);
    };
  }

  broadcast(data) {
    this.channel.postMessage(data);
  }

  close() {
    this.channel.close();
  }
}

class EditCartUI {
  constructor({ onClickBtnUpdate, onChangeSize }) {
    this.template = document.getElementById("cartEditTemplate");
    this.containerParent = document.getElementById("popupCartEdit");

    //* Throw Functions
    this.onClickBtnUpdate = onClickBtnUpdate;
    this.onChangeSize = onChangeSize;

    this.data = {};
    this.virStock = 0;
  }

  initRender(data) {
    this.clone = this.template.content.cloneNode(true) || null;
    //* حطيته هنا عشان بيستخدم في اكتر من مكان
    this.btnUpdate = this.clone.querySelector("#updateSizeCartItem");

    if (!data || !this.clone) return;

    this.checkPopupIsFound();

    //*================
    //* Header Model
    //*================
    this.renderHeaderModel(data.dataCartItem);

    //*================
    //* Body Model
    //*================
    this.renderTables(data); //* دي بترسم + بتستدعي دالة الحدث الخاصة بيها
    this.onClickSizeChartBtn(data.dataCartItem);

    //*================
    //* Footer Model
    //*================
    this.renderFooterModel(data.dataCartItem);

    this.containerParent.appendChild(this.clone);

    //* Body Model دي جزء من
    this.renderCarousel(data); //* دي بترسم + بتستدعي دالة الحدث الخاصة بيها

    this.handleShowPopup();
  }

  renderHeaderModel(data) {
    const productName = this.clone.querySelector(".product-name");
    const [containerPrice, salePrice, basicPrice] = this.clone.querySelectorAll(
      ".price-container, .sale-price, .basic-price",
    );
    const saleNum = this.clone.querySelector(".sale-count");

    productName.textContent = data.name;

    if (!data.is_sale) {
      containerPrice.classList.add(`active`);
      saleNum.style.display = "none";
    } else {
      salePrice.textContent = `${data.currency} ${UIHelper.getLocalPrice(data.currentPrice)}`;
      saleNum.textContent = `-${UIHelper.getSalePrice(data.currentPrice, data.regularPrice).toFixed(0)}%`;
    }
    basicPrice.textContent = `${data.currency} ${UIHelper.getLocalPrice(data.currentPrice)}`;
  }

  renderTables(data) {
    const container = this.clone.querySelector(".row-table-sizes");
    if (!container) return;

    this.sizes = data.dataProduct.sizes;

    const fragment = document.createDocumentFragment();

    this.sizes.forEach((s) => {
      const li = document.createElement("li");
      li.className = `size-value center`;
      li.dataset.size = s.size;
      li.dataset.stock = s.stock;
      li.dataset.sku = s.sku;
      li.textContent = s.size;

      if (s.stock < 1) li.classList.add("off");
      if (data.dataCartItem.size == s.size) {
        li.classList.add("on");
        this.virStock = this.onChangeSize(s.sku, this.sizes, data.dataCartItem);
      }

      fragment.appendChild(li);
    });
    container.appendChild(fragment);

    this.btnUpdate.disabled = true;
    this.onClickSizeEvent(container, data.dataCartItem);
  }

  renderCarousel(data) {
    const container = document.querySelector(".model-body .left");
    if (!container) return;

    const mobileGallery = new MobileGallery(container.id);
    mobileGallery.run(data.dataProduct.images.other, true);
  }

  renderFooterModel(data) {
    const msgAvailableStock = this.clone.querySelector(".available-stock-msg");
    const exitBtn = this.clone.querySelector("#exitCartEdit");
    msgAvailableStock.textContent =
      this.virStock < 6 ? `Only ${this.virStock} left in stock` : "";

    this.btnUpdate.onclick = (e) => {
      const activeItem = this.getTableItemActive();
      if (!activeItem) return;

      this.data.sku = activeItem.dataset.sku;
      this.data.oldSku = data.sku;
      this.data.sizes = this.sizes;
      this.onClickBtnUpdate(e, this.data, exitBtn);
    };
  }

  getTableItemActive() {
    const tableItems = document.querySelectorAll(
      `#${this.containerParent.id} .row-table-sizes li.size-value`,
    );

    return Array.from(tableItems).find((ite) => ite.classList.contains("on"));
  }

  checkPopupIsFound() {
    const popup = document.querySelector(".container-cart-edit");
    if (popup) popup.remove();
  }

  onClickSizeChartBtn(data) {
    const btn = this.clone.querySelector(".click-popup-details-page");
    const container = document.querySelector(".popup-sizes");

    if (!btn || !container) return;

    container.innerHTML = "";

    switch (data.category.toLowerCase()) {
      case "shoes":
        this.appendTemplateChart(container, "chartShoes");
        break;
      default:
        this.appendTemplateChart(container, "chartShoes");
    }

    this.initShowPopupChart(container, btn);
    this.eventsPopupChart(container);
  }

  appendTemplateChart(container, templateId) {
    const template = document.getElementById(templateId);
    if (!template) return;

    container.innerHTML = "";
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);

    const containerChild = document.querySelector(".popup-detials-page");
    containerChild.classList.add("popup-custom");
  }

  initShowPopupChart(container, btnIn) {
    const popup = container.querySelector(".popup-detials-page");
    const btnOut = container.querySelector(".btn-out");

    UIHelper.showAndHidPopup(popup, btnIn, btnOut, 2);
  }

  eventsPopupChart(container) {
    const [btnMeasur, measure] = container.querySelectorAll(
      ".ask, .between-text.two",
    );

    const backTop = container.querySelector(".back-top");
    const titleHeader = container.querySelector(".title-header");

    if (!btnMeasur || !measure || !backTop || !titleHeader) return;

    btnMeasur.onclick = () => {
      measure.scrollIntoView({
        behavior: "smooth", // سلاسة الانتقال
        block: "start", // المكان الي هيقف فيه عموديا {Y}
      });
    };

    backTop.onclick = () => {
      titleHeader.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    };
  }

  handleShowPopup() {
    this.container = document.querySelector(".container-cart-edit");
    const exitBtn = this.container.querySelector("#exitCartEdit");

    setTimeout(() => {
      UIHelper.showAndHidPopup(this.container, true, exitBtn, 1);
    }, 0);
  }

  onClickSizeEvent(container, data) {
    const msgAvailableStock = this.clone.querySelector(".available-stock-msg");

    container.addEventListener("click", (e) => {
      const sizeItem = e.target.closest(".size-value");
      if (!sizeItem || sizeItem.classList.contains("off")) return;

      if (!sizeItem.classList.contains("on")) {
        UIHelper.removeActives(Array.from(container.children), "on");

        this.virStock = this.onChangeSize(
          sizeItem.dataset.sku,
          this.sizes,
          data,
        );

        msgAvailableStock.textContent =
          this.virStock < 6 ? `Only ${this.virStock} left in stock` : "";

        if (sizeItem.dataset.size == data.size) this.btnUpdate.disabled = true;
        else this.btnUpdate.disabled = false;
      } else {
        this.btnUpdate.disabled = true;
        msgAvailableStock.textContent = ``;
      }

      sizeItem.classList.toggle("on");
    });
  }
}

class CartUIEventsHandler {
  constructor(cart, myBag) {
    this.cart = cart;
    this.myBag = myBag;

    this.states = {
      submitPromo: true,
    };
  }

  getEvents() {
    return {
      onQtyChange: this.onQtyChange.bind(this),
      onRemove: this.onRemove.bind(this),
      onToggleWishList: this.onToggleWishList.bind(this),
      onApplyPromoCode: this.onApplyPromoCode.bind(this),
      onclickPromoUser: this.onclickPromoUser.bind(this),
      onCheckout: this.onCheckout.bind(this),
      onClickBtnEdit: this.onClickBtnEdit.bind(this),
      getActivePromoCode: this.getActivePromoCode.bind(this),
      applyValidPromoState: this.applyValidPromoState.bind(this),
    };
  }

  getEventsEdit() {
    return {
      onClickBtnUpdate: this.onClickBtnUpdate.bind(this),
      onChangeSize: this.onChangeSize.bind(this),
    };
  }

  //*=========={Global Events}============
  onQtyChange(id, qty) {
    this.cart.serviceCart.updateQuantity(id, qty);
    this.syncPromoCode();

    this.cart.render(true, "Change-Qty");
  }

  onRemove(id) {
    this.cart.serviceCart.updateQuantity(id, 0);
    this.syncPromoCode();

    this.cart.render(true, "on-remove");
  }

  onApplyPromoCode(event) {
    event.preventDefault();

    if (!this.states.submitPromo) return;

    const input = event.target.querySelector(`input[name="promoCode"]`); //* Input Promo
    const totalPrice = this.cart.serviceCart.calculateSummary().total; //* Total Price
    const user = this.cart.storagePromo.loadUser(); //* User Id (Login)
    const value = this.cart.servicePromo.validateCode(
      input.value,
      totalPrice,
      user,
    ); //* Result Promo Value

    this.checkValidValue(input, value);
    this.updatePromoSummary(value, totalPrice);

    input.oninput = () => {
      input.classList.remove("warning");
    };

    this.cart.storePromo.setSummary(this.cart.storagePromo.loadSummary());
    this.cart.render(true, "On Apply PromoCode");
  }

  onCheckout(e) {
    console.log(e.type);
    this.cart.resetPromoCode();
    const input = document.querySelector(`input[name="promoCode"]`);
    const freshestItems = this.cart.storageCart.load();

    this.cart.storeCart.setItem(this.cart.serviceCart.initItems(freshestItems));

    if (input) {
      input.value = "";
      this.resetPromoState(input);
    }

    const finalSummary = this.cart.storagePromo.loadSummary();
    const isValid = this.cart.servicePromo.checkoutValidate(finalSummary);

    this.cart.storagePromo.save(this.cart.storePromo.promos);

    this.cart.storagePromo.saveSummary(isValid ? finalSummary : null);
    this.cart.storePromo.setSummary(this.cart.storagePromo.loadSummary());

    this.cart.serviceCart.updateQtyProducts();

    this.cart.storeCart.clearItems();
    this.cart.storageCart.save(this.cart.storeCart.items);

    this.cart.render(true, "On Checkout");

    //!================== EDIT NOW! =================== ):
    if (!this.myBag) return;
    if (typeof this.myBag.clearMyBagData === "function") {
      this.myBag.clearMyBagData();
    }

    if (!this.myBag.detailsThis) return;

    const freshProducts = JSON.parse(localStorage.getItem("products"));
    this.myBag.detailsThis.data = freshProducts.find(
      (pr) => pr.id === localStorage.getItem("activeNowProduct"),
    );

    this.myBag.detailsThis.selectProduct = null;
    this.myBag.detailsThis.updatePageData();
  }

  onClickBtnEdit(e, sku) {
    const curr = this.cart.serviceCart.getItem(sku);
    const currMemory = this.cart.storageCart.loadProductByMemory(
      curr.productId,
    );
    const objCurr = this.cart.serviceCart.getDataObj(currMemory, curr.colorId);

    this.cart.editCartUI.initRender({
      dataCartItem: curr,
      dataProduct: objCurr,
    });
  }

  onToggleWishList(isActive, sku) {
    const currItem = this.cart.serviceCart.getItem(sku);
    this.cart.wishlistInstance.toggleFromCart(currItem, isActive);

    this.cart.render(false, "on-Add-Wishlist");
  }

  getActivePromoCode() {
    return this.cart.storagePromo.loadSummary()?.code;
  }

  //*=========={Edit Events}============
  onClickBtnUpdate(e, data, exitBtn) {
    const sizeAlreadyInTheCart = this.cart.serviceCart.sizeInTheCart(data.sku);
    const isStockAvailable = this.cart.serviceCart.isStockAvailable(
      data.sku,
      data.sizes,
    );

    if (!isStockAvailable) {
      UIHelper.popupQuickMsg(
        `Oups This Size isn't Available :(`,
        `rgba(240, 3, 74, 0.7)`,
      );
      return;
    }
    if (sizeAlreadyInTheCart) {
      UIHelper.popupQuickMsg(
        `This size has already been selected!`,
        `rgb(255, 189, 197)`,
        "rgb(103, 6, 38)",
      );
      return;
    }

    const realSize = this.cart.serviceCart.getSizeItem(data.sku, data.sizes);

    this.cart.storeCart.updateItems(data.oldSku, (ite) => {
      let newQuantity = ite.quantity;

      if (newQuantity > realSize.stock) {
        newQuantity = realSize.stock;
        UIHelper.popupQuickMsg(
          `Quantity reduced to ${newQuantity} due to limited stock`,
          `rgb(255, 189, 197)`,
          "rgb(103, 6, 38)",
        );
      }

      return {
        ...ite,
        size: realSize.size,
        sku: realSize.sku,
        maxStock: realSize.stock,
        quantity: newQuantity,
        virtualStock: realSize.stock - newQuantity,
      };
    });

    this.cart.storageCart.save(this.cart.storeCart.items);
    this.cart.render(true, "On Click Edit");
    exitBtn.click();
  }

  onChangeSize(sku, sizes, cartItem) {
    if (sku === cartItem.sku) return cartItem.virtualStock;
    const virStock = this.cart.serviceCart.getCurrItems(sku, sizes)?.stock;
    return virStock ? virStock : "";
  }

  //*-=-=-=-=-=-- { Helpers } -=-=-=-=-=--
  checkValidValue(input, value) {
    const { valid: isValid, message } = value;

    input.classList.toggle("warning", !isValid);

    if (isValid) {
      input.value = ``;
      this.applyValidPromoState(input);
      UIHelper.popupQuickMsg("Correct Promo Code", "rgba(46, 139, 86, 0.69)");
    } else {
      input.focus();
      UIHelper.popupQuickMsg(message, "rgba(220, 20, 60, 0.73)");
    }
  }

  applyValidPromoState(input) {
    input.disabled = true;
    this.states.submitPromo = false;
  }

  resetPromoState(input) {
    input.disabled = false;
    this.states.submitPromo = true;
  }

  onclickPromoUser(event, input) {
    const promoUser = event.target.closest(".container-promo-user");
    if (!promoUser) return;

    this.resetPromoState(input);
    input.focus();

    promoUser.innerHTML = ``;
    window.dispatchEvent(new Event("clickPromoUser"));
  }

  syncPromoCode() {
    const summary = this.cart.storePromo.summary;
    if (!summary) return;

    const code = summary.code;
    const totalPrice = this.cart.serviceCart.calculateSummary().total; //* Total Price
    const user = this.cart.storagePromo.loadUser();

    const value = this.cart.servicePromo.validateCode(code, totalPrice, user); //* Result Promo Value

    if (!value.valid) {
      this.cart.resetPromoCode();
      return;
    }

    const discountAmount = this.cart.servicePromo.calculateDiscount(
      value,
      totalPrice,
    ); //* Discount Price

    const newSummary = {
      code,
      discountAmount: discountAmount,
      subTotal: totalPrice,
      total: totalPrice - discountAmount,
      user,
    };

    this.cart.storagePromo.saveSummary(newSummary);
    this.cart.storePromo.setSummary(newSummary);
  }

  updatePromoSummary(value, totalPrice) {
    const discAmount = this.cart.servicePromo.calculateDiscount(
      value,
      totalPrice,
    ); //* Discount Price

    if (value.valid) {
      this.cart.storagePromo.saveSummary({
        subTotal: totalPrice,
        code: value.promo.code,
        discountAmount: discAmount,
        total: totalPrice - discAmount,
        user: this.cart.storagePromo.loadUser(),
      });
    } else {
      this.cart.storagePromo.saveSummary(null);
    }
  }
}

export class Cart {
  constructor(myBagInstance, eventBus) {
    this.eventBus = eventBus;
    this.myBag = myBagInstance;
    this.boundResetPromoCode = this.resetPromoCode.bind(this);
    this.run = this.render;

    this.#init();
  }

  async #init() {
    //*=========================
    //*==== Init Cart
    //*=========================
    this.CONFIG = Config.load();
    this.initComponentsCart();

    //* Init & Save Cart Items
    this.initCartItems();

    //*=========================
    //*==== Init Promo
    //*=========================
    await this.initComponentsPromo();

    this.initEventsCart();
    this.initSyncCart();
    this.initSyncWishlist();
  }

  render(syncEnabled = true, msg = "notFound") {
    //* console.log(msg);
    if (!UIHelper.getPageURL(["cart"])) return;

    const discAmount = this.storePromo.summary?.discountAmount || 0;
    const count = this.serviceCart.getCount();
    const summary = this.serviceCart.calculateSummary();

    this.ui.renderItems(this.storeCart.items, count);
    this.ui.renderSummary(summary, count, discAmount);

    if (syncEnabled) this.postSyncCart();
  }

  initComponentsCart() {
    this.storageCart = new CartStorage(this.CONFIG.STORAGE_KEY, this.myBag); //!
    this.storeCart = new CartStore(); //!
    this.serviceCart = new CartService(this.storeCart, this.CONFIG); //!
    this.eventsHandler = new CartUIEventsHandler(this, this.myBag); //!
    this.ui = new CartUI(this.eventsHandler.getEvents());
    this.editCartUI = new EditCartUI(this.eventsHandler.getEventsEdit());
  }

  async initComponentsPromo() {
    //* INIT
    this.storagePromo = new PromoStorage(
      "promos",
      "cartSummary",
      "user",
      "data/promo-codes.json",
    );
    this.storePromo = new PromoStore();
    this.servicePromo = new PromoService(this.storePromo);
    this.promos = await this.storagePromo.load();

    //* (Save & Set) Promo Codes
    this.storagePromo.save(this.promos);
    this.storePromo.setPromos(this.promos);

    const { total } = this.serviceCart.calculateSummary();
    this.updatePromoSummary(this.storagePromo.loadSummary(), total);

    //* Get Active Promo
    this.storePromo.setSummary(this.storagePromo.loadSummary());
  }

  initCartItems() {
    let items = this.storageCart.load();
    items = this.serviceCart.initItems(items);
    this.storeCart.setItem(items);
  }

  initEventsCart() {
    window.removeEventListener("clickPromoUser", this.boundResetPromoCode);
    window.addEventListener("clickPromoUser", this.boundResetPromoCode);

    window.removeEventListener("aside-cart-checkout", this.ui.onCheckout);
    window.addEventListener("aside-cart-checkout", this.ui.onCheckout, {
      passive: true,
    });
  }

  initSyncWishlist() {
    this.wishlistChannelListener = new BroadcastChannel("wishlist_channel");
    this.wishlistChannelListener.onmessage = ({ data }) => {
      if (data.type === "CHANGE_CURRENT_ITEM") {
        this.render(false, "BroadCast-wishlist");
      }
    };
  }

  initSyncCart() {
    this.sync = new CartSync(this.CONFIG.CHANNEL_NAME, ({ data }) => {
      if (!data.length) return;

      this.storeCart.setItem(this.serviceCart.initItems(data.cart));
      this.storePromo.setPromos(data.promos);
      this.storePromo.setSummary(data.summary || null);
      this.render(false, "BroadCast-Cart");
    });
  }

  postSyncCart() {
    this.storageCart.save(this.storeCart.items);
    this.sync.broadcast({
      type: "CHANGE_CURRENT_ITEM",
      data: {
        cart: this.storeCart.items,
        promos: this.storePromo.promos,
        summary: this.storePromo.summary,
      },
    });
  }

  resetPromoCode(isInit = {}) {
    this.storagePromo.saveSummary(null);
    this.storePromo.setSummary(null);
    if (isInit.type === "clickPromoUser") this.render();
  }

  updatePromoSummary(summary, totalPrice) {
    const user = this.storagePromo.loadUser();

    if (!summary || !user) {
      this.resetPromoCode();
      return;
    }

    const valuePromo = this.servicePromo.validateCode(
      summary.code,
      totalPrice,
      user,
    );

    const discAmount = this.servicePromo.calculateDiscount(
      valuePromo,
      totalPrice,
    ); //* Discount Price

    if (valuePromo.valid) {
      this.storagePromo.saveSummary({
        subTotal: totalPrice,
        code: valuePromo.promo.code,
        discountAmount: discAmount,
        total: totalPrice - discAmount,
        user,
      });
    } else {
      this.storagePromo.saveSummary(null);
    }
  }
}
