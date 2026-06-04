import { UIHelper } from "/JS/components/helpers.js";

export class MyBag {
  constructor() {
    this.clickAdd = this.addProduct; //* في حالة الضغط على شراء منتج
    this.time = null;
    this.init();
  }

  init() {
    this.cartItemsData = this.dataItmes("cartItems");
    this.virtualStock = this.dataItmes("virtualStock");
    this.bagIconBtn = document.getElementById("addToBagIcon");
    this.iconBag = this.bagIconBtn.querySelector("img");
    this.bagResultNum = document.getElementById("resultToBag");
    this.btnBag = document.getElementById("addToBag");
    this.parentPopYOrN = document.getElementById("popapYesOrNoParent");
    this.pages = ["home", "details", "cart"];
    this.focus = null;
    this.currency = "";

    this.channelCart = new BroadcastChannel("cart_channel");

    this.bagIconBtn.onclick = this.onclickBtnBagIcon.bind(this);

    this.updateCartItemsReadOnly();

    this.onStorageChange();

    const onPopstate = () => {
      if (
        this.itemAsideCart &&
        this.itemAsideCart.classList.contains("active")
      ) {
        this.updateAsideCartUi();
      }
    };

    window.onpopstate = onPopstate;
  }

  clearMyBagData() {
    this.cartItemsData = [];
    this.updateCartItemsReadOnly();
    this.updateCarts();
  }

  initBroadcastChannel() {
    this.channel = new BroadcastChannel("app");

    this.channel.onmessage = ({ data }) => {
      switch (data.type) {
        case "UPDATE_CART":
          this.updateUI();
          break;
      }
    };
  }

  onStorageChange() {
    window.onstorage = (e) => {
      if (e.key === "cartItems") {
        const newCartData = JSON.parse(e.newValue);
        this.cartItemsData = newCartData;
        this.updateUI();
      }
    };
  }

  updateUI() {
    this.updateCartItemsReadOnly(false);
    this.updateDataCheckout();
    this.updateCarts();
    this.reRenderAllItems();
  }

  updateCarts() {
    if (!this.asideCart) this.asideCart = document.getElementById("asideCart");

    const container = this.asideCart.querySelector(".row-two-itemsCart");

    if (!container) return;

    let totalSubtotal = 0;

    if (!this.cartItemsData) this.updateCartItemsReadOnly(this.cartItemsData);

    this.currency = this.currency ? this.currency : "EGP";

    this.clickDelItemCart.clear();

    this.renderCarts(container, totalSubtotal);
  }

  onclickBtnBagIcon() {
    if (this.cartItemsData.length !== 0) {
      this.focus = this.addFocus(document.body, 10000000, 1);
      const posPage = location.pathname.includes("cart");

      if (posPage) return;

      this.showAsideCart();

      setTimeout(() => {
        this.focusAsideCart(false);
        this.focus.onclick = this.updateAsideCartUi.bind(this);
      }, 0);
    } else location.assign(`/cart`);
  }

  dataItmes(nameStr) {
    const itemsStr = localStorage.getItem(nameStr) || "[]";
    return JSON.parse(itemsStr);
  }

  transformNum(n) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  addProduct(selectProduct, productTarget, indexActive, detailsThis) {
    this.detailsThis = detailsThis;
    this.selectProduct = selectProduct;
    this.data = productTarget;
    this.indexActive = indexActive;

    this.onClickBtnBag();
  }

  onClickBtnBag() {
    const item = this.cartItemsData.find(
      (ite) => ite.sku === this.selectProduct.sku,
    );

    this.mathematicalOperationsCart(item);
    this.updateAllUi(); //* دي بتعمل تحديث للمحتاج تحديث بيانات عند الضغط
    this.showAsideCart();
  }

  writeEditCart(ite, item) {
    if (ite.sku === item.sku) {
      if (this.cartItemsData) {
        const target = this.cartItemsData.find((c) => c.sku === ite.sku);
        if (target.virtualStock > 0) {
          item.quantity++;
          item.virtualStock = item.maxStock - item.quantity;
          this.cartItemsData.map((c) => {
            return c.sku === item.sku ? item : c;
          });
        }
      }
      return item;
    }
    return ite;
  }

  mathematicalOperationsCart(item) {
    if (item) {
      this.cartItemsData = this.cartItemsData.map((ite) => {
        return this.writeEditCart(ite, item);
      });
    } else {
      const cartItem = {
        // 1. ثوابت المنتج الأساسي
        productId: this.data.id,
        name: this.data.name,
        regularPrice: this.data.old_price,
        salePrice: this.data.is_sale ? this.data.sale_price : null,
        currentPrice: this.data.is_sale
          ? this.data.sale_price
          : this.data.old_price,
        is_sale: this.data.is_sale,
        currency: this.data.currency,
        url: location.href,
        category: this.data.category,
        type: this.data.type,

        // 2. بيانات اللون اللي اختاره
        colorId: this.data.variants[this.indexActive].color_id,
        colorName: this.data.variants[this.indexActive].color_name,
        image: this.data.variants[this.indexActive].images.basic, // صورة واحدة بس صغيرة للكارت

        // 3. بيانات المقاس اللي اختاره (من this.selectProduct)
        size: this.selectProduct.size,
        sku: this.selectProduct.sku,
        maxStock: this.selectProduct.stock, // عشان نمنعه يزود في الكارت عن المتاح
        virtualStock: this.selectProduct.stock - 1,
        // 4. بيانات خاصة بالكارت نفسه
        quantity: 1,
      };
      this.cartItemsData.push(cartItem);
    }

    localStorage.setItem("cartItems", JSON.stringify(this.cartItemsData));
    this.channelCart.postMessage({
      type: "CHANGE_CURRENT_ITEM",
      data: this.cartItemsData,
    });
  }

  updateAllUi(newDataCartItems) {
    this.updateCartItems(newDataCartItems);
    this.updateCartItemsReadOnly();
    this.updateDataCheckout();
    window.dispatchEvent(new CustomEvent("myBagUpdated"));
  }

  updateDataCheckout() {
    if (!this.asideCart || !this.cartItemsData) return;
    const allItems = Array.from(document.querySelectorAll(`.item-cart`));
    const subtotalPrice = this.asideCart.querySelector(".subtotal-price");
    const deliveryPrice = this.asideCart.querySelector(".delivery-price");
    const totalPrice = this.asideCart.querySelector(".total-price");

    this.itemAsideCart = this.asideCart.querySelector(".asideCart-item");

    const [allPrice, quantities] = this.getTotalPrice();

    if (this.cartItemsData.length < 1) {
      this.updateAsideCartUi();
    } else {
      allItems.length = this.cartItemsData.length;

      allItems.forEach((ite, i) => this.updataRenderCarts(ite, i, quantities));
    }

    if (this.itemAsideCart) {
      subtotalPrice.innerHTML = `${this.currency} ${this.transformNum(allPrice)}`;
      deliveryPrice.innerHTML = `${allPrice < 1000 ? this.currency + " " + this.transformNum(60) : "Free"}`;
      totalPrice.innerHTML = `${this.currency} ${this.transformNum(allPrice + (allPrice < 1000 ? 60 : 0))}`;
    }
  }

  updataRenderCarts(ite, i, quantities) {
    const current = this.cartItemsData[i];
    const selectTag = ite.querySelector(`[name="stock-count"]`);
    const msgLeftOnlyStock = ite.querySelector(".only-stock-msg");
    const [salePriceMarkup, regularPriceMarkup] = ite.querySelectorAll(
      ".sale-price, .basic-price-cart",
    );

    selectTag.value = quantities[current.sku];
    salePriceMarkup.innerText = `${current.currency} ${this.transformNum(selectTag.value * current.currentPrice)}`;

    if (regularPriceMarkup) {
      regularPriceMarkup.innerText = `${current.currency} ${this.transformNum(selectTag.value * current.regularPrice)}`;
    }

    current.quantity = selectTag.value;
    current.virtualStock = current.maxStock - selectTag.value;

    msgLeftOnlyStock.innerHTML = `${current.virtualStock <= 5 ? `Only ${current.virtualStock} left in stock` : ""}`;
  }

  getCartItems() {
    const cartItemsStr = localStorage.getItem("cartItems");
    return cartItemsStr ? JSON.parse(cartItemsStr) : [];
  }

  getQty(data) {
    if (!Array.isArray(data)) return 0;

    return data.reduce((acc, curr) => acc + +curr.quantity, 0);
  }

  updateCartItemsReadOnly(data) {
    if (!data) {
      this.cartItemsData = this.getCartItems();
    }
    const qty = this.getQty(this.cartItemsData);

    this.bagResultNum.textContent = qty;

    this.iconBag.src =
      qty > 0 ? "/images/bagfull.svg" : "../../images/bag empty.svg";

    this.animateCart(qty > 0);
  }

  start() {
    this.stop();
    this.time = setInterval(() => {
      this.bagIconBtn.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(10px)" },
          { transform: "translateX(0)" },
          { transform: "translateX(10px)" },
          { transform: "translateX(0)" },
        ],
        {
          duration: 300,
          fill: "both",
        },
      );
    }, 10000);
  }

  stop() {
    if (this.time) {
      clearInterval(this.time);
      this.time = null;
    }
  }

  animateCart(isRun) {
    if (isRun) {
      this.start();
    } else {
      this.stop();
    }
  }

  updateProductsData(target) {
    this.data.variants[this.indexActive].sizes = this.data.variants[
      this.indexActive
    ].sizes.map((s) => {
      if (s.sku === target.sku) {
        s.stock = target.virtualStock;
        return s;
      } else return s;
    });

    localStorage.setItem("products", JSON.stringify(this.allProducts));
  }

  getHashURL(arr) {
    const arrURL = location.hash.match(/(((?<=#)\w+)|((?<=\/)[\w-]+))/gi);

    if (!arrURL) return;

    return arrURL.findLast((f) => arr.includes(f));
  }

  showAsideCart() {
    this.asideCart = document.getElementById("asideCart");

    if (!this.asideCart) return;

    if (this.clickDelItemCart) this.clickDelItemCart.clear();

    this.clickDelItemCart = new Map();

    const asideCartStr = this.initAsideCart();

    UIHelper.toggleScroll(true);

    this.appendItemAsideCart(asideCartStr);

    setTimeout(() => {
      let position = this.itemAsideCart.querySelector(".actions-checkout");
      this.itemAsideCart.classList.add("active");
      this.focus = this.addFocus(document.body, 10000000, 1);

      this.itemsNum = document.querySelector(".asideCart-item .items-num");
      this.focus.onclick = this.updateAsideCartUi.bind(this);

      this.focusAsideCart(false);

      this.eventsAsideCart();
      position.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    }, 0);
  }

  appendItemAsideCart(asideCartStr) {
    this.asideCart.innerHTML = asideCartStr;
    this.itemAsideCart = document.getElementById("asideCartItem");
  }

  renderCarts(container) {
    let items = ``;

    this.cartItemsData.forEach((ite) => {
      let stockTags = ``;
      let btnIdRandom = "itemCart-" + Math.random() * 100;

      const btnDel = document.createElement("button");
      btnDel.id = `id_${Math.random() * 100}`;
      btnDel.className = "btn-cart-popap-bag";
      btnDel.dataset.mycart = btnIdRandom;
      btnDel.dataset.sku = ite.sku;
      btnDel.dataset.name = ite.name;
      btnDel.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

      this.clickDelItemCart.set(btnDel.dataset.sku, this.delItemCart);

      const priceTemplate = ite.is_sale
        ? `<h3 class="sale-price">${ite.currency} ${this.transformNum(ite.currentPrice * ite.quantity)}</h3>
           <h3 class="basic-price-cart old">${ite.currency} ${this.transformNum(ite.regularPrice * ite.quantity)}</h3>`
        : `<h3 class="basic-price-cart">${ite.currency} ${this.transformNum(ite.currentPrice * ite.quantity)}</h3>`;

      if (ite.maxStock === 0) stockTags = `<option>0</option>`;
      else {
        for (let i = 1; i <= ite.maxStock; i++) {
          stockTags += `<option ${+ite.quantity === i ? "selected" : ""}>${i}</option>`;
        }
      }

      items += `
      <div class="item-cart" id="${btnIdRandom}" data-sku="${ite.sku}">
        <div class="left-item">
          <a href="${ite.url}" data-link><img src="${ite.image}" alt="${ite.name}"/></a>
        </div>
        <div class="right-item">${btnDel.outerHTML}<a href="${ite.url}" data-link class="title-product">${ite.name}</a>
          <div class="price-cart-container">${priceTemplate}</div>
          <div class="size-n">size: ${ite.size}</div>
          <select name="stock-count" id="stock-${ite.sku}">${stockTags}</select>
          <div class="only-stock-msg">${ite.virtualStock <= 5 ? `Only ${ite.virtualStock} left in stock` : ""}</div>
        </div>
      </div>
      `;
    });

    container.innerHTML = items;
  }

  renderInitCarts(ite) {
    let items = ``;
    let stockTags = ``;
    let btnIdRandom = "itemCart-" + Math.random() * 100;
    const subTotal = ite.currentPrice * ite.quantity;

    const btnDel = document.createElement("button");
    btnDel.id = `id_${Math.random() * 100}`;
    btnDel.className = "btn-cart-popap-bag";
    btnDel.dataset.mycart = btnIdRandom;
    btnDel.dataset.sku = ite.sku;
    btnDel.dataset.name = ite.name;
    btnDel.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

    this.clickDelItemCart.set(ite.sku, this.delItemCart);

    const priceTemplate = ite.is_sale
      ? `<h3 class="sale-price">${ite.currency} ${this.transformNum(ite.currentPrice * ite.quantity)}</h3>
         <h3 class="basic-price-cart old">${ite.currency} ${this.transformNum(ite.regularPrice * ite.quantity)}</h3>`
      : `<h3 class="basic-price-cart">${ite.currency} ${this.transformNum(ite.currentPrice * ite.quantity)}</h3>`;

    if (ite.maxStock === 0) stockTags = `<option>0</option>`;
    else {
      for (let i = 1; i <= ite.maxStock; i++) {
        stockTags += `<option ${+ite.quantity === i ? "selected" : ""}>${i}</option>`;
      }
    }

    items += `
      <div class="item-cart" id="${btnIdRandom}" data-sku="${ite.sku}">
        <div class="left-item">
          <a href="${ite.url}" data-link><img src="${ite.image}" alt="${ite.name}"/></a>
        </div>
        <div class="right-item">${btnDel.outerHTML}<a href="${ite.url}" data-link class="title-product">${ite.name}</a>
          <div class="price-cart-container">${priceTemplate}</div>
          <div class="size-n">size: ${ite.size}</div>
          <select name="stock-count" id="stock-${ite.sku}">${stockTags}</select>
          <div class="only-stock-msg">${ite.virtualStock <= 5 ? `Only ${ite.virtualStock} left in stock` : ""}</div>
        </div>
      </div>
      `;

    return [items, subTotal];
  }

  initAsideCart() {
    let [items, totalSubtotal] = [``, 0];

    if (!this.cartItemsData) this.updateCartItemsReadOnly(this.cartItemsData);

    this.currency = this.cartItemsData[0].currency;

    this.cartItemsData.forEach((ite) => {
      items += this.renderInitCarts(ite)[0];
      totalSubtotal += this.renderInitCarts(ite)[1];
    });

    const tagHTML = this.getCartTagStr(items, totalSubtotal);

    return tagHTML;
  }

  getCartTagStr(items, totalSubtotal) {
    return `
    <div class="asideCart-item" id="asideCartItem">
      <div class="container-asideCart">
        <div class="read-carts">
          <button id="asideCartExitBtn">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="row-one-titles">
            <h3 class="title-head">Product added to Bag</h3>
            <div class="items-num">(${this.cartItemsData.length} items)</div>
          </div>
          <div class="row-two-itemsCart">${items}</div>
        </div>
        <div class="container-checkout">
          <div class="data-checkout">
            <div class="subtotal-container">
              <h2 class="subtotal-title">Subtotal</h2>
              <div class="subtotal-price">${this.currency} ${this.transformNum(totalSubtotal)}</div>
            </div>
            <div class="delivery-container">
              <h2 class="delivery-title">Delivery</h2>
              <div class="delivery-price">${totalSubtotal <= 1000 ? this.currency + " " + this.transformNum(60) : "Free"}</div>
            </div>
            <p class="msg-checkout">You unlocked Free Shipping!</p>
          </div>
          <div class="actions-checkout">
            <div class="total-checkout">
              <h2 class="total-title">TOTAL</h2>
              <div class="total-price">${this.currency} ${totalSubtotal <= 1000 ? this.transformNum(totalSubtotal + 60) : this.transformNum(totalSubtotal)}</div>
            </div>
            <div class="btns-checkout">
              <a href="/cart" data-link class="btn-offer black btn-view-bag"><div class="style">View Bag</div></a>
              <button class="btn-offer black btn-checkout" id="asideCheckoutBtn"><div class="style"><i class="fa-solid fa-lock"></i> Checkout</div></button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  delItemCart(e, del) {
    if (!del) this.popapYesOrNo(e);
    else this.deleteItemCartMemeory(e.target);
  }

  popapYesOrNo(e) {
    //* initPop
    const btnExit = document.createElement("button");
    const btnYes = document.createElement("button");
    const btnCancel = document.createElement("button");

    btnExit.id = `popapYesOrNoExit`;
    btnExit.className = `center`;
    btnExit.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

    btnYes.id = `yesRemoveThisCart`;
    btnYes.className = `btn-offer black`;
    btnYes.innerHTML = `<div class="style">Yes</div>`;

    btnCancel.id = `noRemoveThisCart`;
    btnCancel.innerHTML = `Cancel`;

    let tagHTML = `
    <div id="popapYesOrNo">
          ${btnExit.outerHTML}
          <div class="read-text-popYesOrN">
            <h2 class="title-popYOrN">REMOVE PRODUCT</h2>
            <p class="des-popYOrN">
              Are you sure you want to remove the following product from the
              cart?
            </p>
            <h3 class="nameProductCart">${e.target.dataset.name}</h3>
          </div>
          <div class="actions-popYOrN">${btnYes.outerHTML}${btnCancel.outerHTML}</div>
        </div>`;

    this.parentPopYOrN.innerHTML = tagHTML;

    const pop = document.getElementById("popapYesOrNo");

    this.focus = this.addFocus(document.body, 100000001, 2);
    this.focusYesOrNoPopap(false, pop);

    const btnExitClick = document.getElementById("popapYesOrNoExit");
    const btnNoClick = document.getElementById("noRemoveThisCart");
    const btnYesClick = document.getElementById("yesRemoveThisCart");

    this.focus.onclick = () => {
      this.animatePopas(pop, this.focus, false);
    };

    btnExitClick.onclick = () => {
      this.animatePopas(pop, this.focus, false);
    };

    btnNoClick.onclick = () => {
      this.animatePopas(pop, this.focus, false);
    };

    btnYesClick.onclick = () => {
      this.delItemCart(e, true);
      this.animatePopas(pop, this.focus, false);
    };
  }

  deleteItemCartMemeory(btn) {
    const cartsStr = localStorage.getItem("cartItems");
    let cartsData = JSON.parse(cartsStr);

    if (!cartsData) return;

    this.onDelItemCart(cartsData, btn);
  }

  onDelItemCart(cartsData, btn) {
    const cart = document.getElementById(btn.dataset.mycart);

    cartsData = cartsData.filter((c) => {
      if (c.sku === btn.dataset.sku) {
        this.clickDelItemCart.delete(c.sku);
        return false;
      } else return true;
    });

    this.cartItemsData = cartsData;

    localStorage.setItem("cartItems", JSON.stringify(cartsData));
    this.channelCart.postMessage({
      type: "CHANGE_CURRENT_ITEM",
      data: cartsData,
    });

    this.itemsNum.innerText = `(${this.cartItemsData.length} items)`;

    cart.remove();

    const checkPosition = UIHelper.getPageURL(["product"]);
    this.updateAllUi(null, !checkPosition);

    if (this.cartItemsData.length === 0) this.updateAsideCartUi();
  }

  addFocus(position, zIndex, secretKey) {
    const checkFound = document.getElementById(`focusPrivate-${secretKey}`);

    if (checkFound) checkFound.remove();

    const div = document.createElement("div");
    div.className = `focus-private`;
    div.id = `focusPrivate-${secretKey}`;
    div.style = `
  min-width: 100vw;
  min-height: 100vh;
  background-color: black;
  opacity: 0;
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${zIndex};
  cursor: pointer;`;
    position.append(div);
    return div;
  }

  animatePopas(pop, focus, isShow) {
    if (isShow) {
      focus.style.display = "block";
      const animFocus = focus.animate([{ opacity: "0" }, { opacity: "0.5" }], {
        duration: 200,
        fill: "both",
        easing: "linear",
      });

      if (!pop) return;

      animFocus.onfinish = () => {
        pop.style.display = "flex";
        pop.animate(
          [
            { opacity: "0", top: "calc(50% - 50px)" },
            { opacity: ".25", top: "calc(50% - 25px)" },
            { opacity: "1", top: "50%" },
          ],
          {
            duration: 200,
            fill: "both",
            easing: "linear",
          },
        );
      };
    } else {
      const animFocus = focus.animate([{ opacity: "0.5" }, { opacity: "0" }], {
        duration: 500,
        fill: "both",
        easing: "linear",
      });

      animFocus.onfinish = () => {
        focus.style.display = "none";
      };

      if (!pop) return;

      const anim = pop.animate(
        [
          { opacity: "1", top: "50%" },
          { opacity: ".25", top: "calc(50% - 25px)" },
          { opacity: "0", top: "calc(50% - 50px)" },
        ],
        {
          duration: 200,
          fill: "both",
          easing: "linear",
        },
      );
      anim.onfinish = () => {
        pop.style.display = "";
      };
    }
  }

  reRenderAllItems() {
    const allItems = document.querySelectorAll(`.item-cart`);
    allItems.forEach((ite, i) => {
      const target = this.cartItemsData[i];
      this.onClickLinksCartItem(ite);
      this.onChangeSelectCartItem(ite, target);
      this.onclickBtnExitCartItem(ite);
    });
  }

  eventsAsideCart() {
    const btnExitAsideCart = document.getElementById(`asideCartExitBtn`);

    const asideCheckoutBtn = document.getElementById(`asideCheckoutBtn`); // حط الـ ID الصح بتاع الزرار عندك

    if (asideCheckoutBtn) {
      asideCheckoutBtn.onclick = () => {
        // نتأكد إن الميزة دي اتعملت من كلاس الـ Cart
        if (typeof this.triggerGlobalCheckout === "function") {
          this.triggerGlobalCheckout();

          // ممكن تقفل الـ Aside Cart هنا لو حابب
          this.updateAsideCartUi();
        }
      };
    }
    btnExitAsideCart.onclick = this.updateAsideCartUi.bind(this);

    this.reRenderAllItems();
  }

  onClickLinksCartItem(ite) {
    const links = ite.querySelectorAll("a");
    links.forEach((l) => {
      l.onclick = () => {
        this.updateAsideCartUi();
        scrollTo({
          top: 0,
          behavior: "smooth",
        });
      };
    });
  }

  onChangeSelectCartItem(ite, target) {
    const selectTag = ite.querySelector(`[name="stock-count"]`);
    const msgLeftOnlyStock = ite.querySelector(".only-stock-msg");
    const [salePriceMarkup, regularPriceMarkup] = ite.querySelectorAll(
      ".sale-price, .basic-price-cart",
    );

    selectTag.onchange = (e) => {
      salePriceMarkup.innerText = `${target.currency} ${this.transformNum(selectTag.value * target.currentPrice)}`;

      if (regularPriceMarkup) {
        regularPriceMarkup.innerText = `${target.currency} ${this.transformNum(e.target.value * target.regularPrice)}`;
      }

      target.quantity = e.target.value;
      target.virtualStock = target.maxStock - e.target.value;

      msgLeftOnlyStock.innerHTML = `${target.virtualStock <= 5 ? `Only ${target.virtualStock} left in stock` : ""}`;

      const checkPosition = location.pathname.includes("product");

      this.updateAllUi(target, checkPosition !== "details");
      this.updateUI();
    };
  }

  getTotalPrice() {
    let result = 0;
    let quantity = {};
    this.cartItemsData.forEach((c) => {
      result += c.currentPrice * c.quantity;
      quantity[c.sku] = c.quantity;
    });
    return [result, quantity];
  }

  onclickBtnExitCartItem(ite) {
    const btn = ite.querySelector("button.btn-cart-popap-bag");

    if (this.clickDelItemCart.has(btn.dataset.sku)) {
      btn.onclick = this.clickDelItemCart.get(btn.dataset.sku).bind(this);
    }
  }

  updateCartItems(newCartData) {
    if (!newCartData || !this.cartItemsData) return;

    this.cartItemsData = this.cartItemsData.map((c) => {
      return newCartData.sku === c.sku ? newCartData : c;
    });

    localStorage.setItem("cartItems", JSON.stringify(this.cartItemsData));

    this.channelCart.postMessage({
      type: "CHANGE_CURRENT_ITEM",
      data: this.cartItemsData,
    });
  }

  focusAsideCart(isDel) {
    this.focus = document.getElementById("focusPrivate-1");
    if (this.focus) {
      if (isDel) this.animatePopas(null, this.focus, false);
      else this.animatePopas(null, this.focus, true);
    }
  }

  focusYesOrNoPopap(isDel, pop) {
    this.focus = document.getElementById("focusPrivate-2");
    if (this.focus) {
      if (isDel) this.animatePopas(pop, this.focus, false);
      else this.animatePopas(pop, this.focus, true);
    }
  }

  updateAsideCartUi() {
    if (this.itemAsideCart) {
      this.focusYesOrNoPopap(true);
      this.focusAsideCart(true);
      this.itemAsideCart.classList.remove("active");
      setTimeout(() => {
        UIHelper.toggleScroll(false);
      }, 0);
    }
  }
}

export const myBagInstance = new MyBag();
