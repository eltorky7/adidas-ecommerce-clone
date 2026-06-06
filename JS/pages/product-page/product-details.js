import {
  ProductGallery,
  Accordion,
  MobileGallery,
  ViewGallery,
} from "/JS/pages/product-page/product-components.js";

import { UIHelper } from "/JS/components/helpers.js";
import { Carousel } from "/JS/pages/home-page/home-components.js";
import { myBagInstance } from "/JS/components/dependencies.js";
import { wishlistInstance } from "/JS/store/wishlist/wishlist.js";
import { navigateTo } from "/JS/router.js";

export class Details {
  constructor(viewId, leftSecId, rightSecId, eventsBus) {
    this.viewId = document.getElementById(viewId);
    this.leftSection = document.getElementById(leftSecId);
    this.rightSection = document.getElementById(rightSecId);

    if (!this.viewId || !this.leftSection || !this.rightSection) return;

    this.gallery = new ProductGallery(
      "productPhoto",
      "container-gallery",
      "btn-gallery",
    );

    this.accordion = new Accordion("accordion");
    this.mobileGallery = new MobileGallery("mobileGallery");

    this.eventsBus = eventsBus;
    this.myBag = myBagInstance;

    this.wishlist = wishlistInstance;

    this.handleUpdatePageData = this.updatePageData.bind(this);

    if (this.wishlist) {
      this.wishlist.detailsThis = this;
    }

    if (!this.gallery) return;

    this.data = null;
    this.allProducts = null;
    this.targetText = "?color=";
    this.run = this.getData;
    this.focus = document.querySelector(".focus-two");
    this.viewGallery = new ViewGallery("viewPhotosStyleTwo");
  }

  async getData(jsonFile = "data/products.json", productId) {
    this.productId = productId;

    try {
      let allProductsData = [];
      if (localStorage.getItem("products")) {
        allProductsData = JSON.parse(localStorage.getItem("products"));
      } else {
        const res = await fetch(jsonFile);
        allProductsData = await res.json();
        localStorage.setItem("products", JSON.stringify(allProductsData));
      }

      this.data = allProductsData.find((d) => d.id === this.productId);

      //* اختبار 1: هل المنتج موجود أصلاً؟
      if (!this.data) {
        return navigateTo("/404"); //* لو مفيش منتج، روح لـ 404 واخرج من الدالة
      }

      //* اختبار 2: التحقق من اللون (لو موجود في الرابط)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("color")) {
        const requestedColor = urlParams.get("color");

        //* هل اللون اللي اليوزر كاتبه موجود جوه قائمة ألوان المنتج ده؟
        const isValidColor = this.data.variants.some(
          (v) => v.color_id === requestedColor,
        );

        if (!isValidColor) {
          return navigateTo("/404"); // لون مش موجود؟ روح لـ 404 فوراً واخرج!
        }

        //* لو اللون سليم، احفظه
        this.colorId = requestedColor;
      } else {
        //* لو اليوزر مكتبش لون خالص في الرابط، استخدم الافتراضي
        this.colorId = this.data.default_color_id;
      }

      this.allProducts = allProductsData;

      this.init();
    } catch (err) {
      console.log(err);
    }
  }

  init() {
    const imagesView = this.getImagesColor();

    this.gallery.start(imagesView);
    this.viewGallery.run(imagesView);
    this.mobileGallery.run(imagesView, true);

    this.leftSection.onclick = (e) => {
      const photoItem = e.target.closest(".product-photo-container");
      if (photoItem && photoItem.querySelector("img")) {
        const index = photoItem.getAttribute("data-index");
        if (index !== null) {
          this.viewGallery.open(index);
        }
      }
    };

    this.accordion.run(this.data, this.productId);
    this.createCarousels();
    this.renderRightSection();
    this.updateRecentProducts();

    this.channel = new BroadcastChannel("cart_channel");
    this.channel.onmessage = this.handleUpdatePageData;

    this.eventsBus.removeEvent("update-product", this.handleUpdatePageData);
    this.eventsBus.on("update-product", this.handleUpdatePageData);
  }

  updateRecentProducts() {
    const resents = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const set = new Set(resents);

    set.add(this.productId);
    localStorage.setItem("recentlyViewed", JSON.stringify(Array.from(set)));
  }

  getImagesColor() {
    const targetVariant = this.data.variants.find(
      (v) => v.color_id === this.colorId,
    );

    return targetVariant.images.other;
  }

  createCarousels() {
    const allCarou = this.leftSection.querySelectorAll(
      ".recommendation-carousles",
    );
    allCarou.forEach((c) => {
      c.innerHTML = ``;
    });

    // 1. حساب Complete the look
    const completeTheLookData = this.allProducts.filter((ite) => {
      return (
        ite.gender == this.data.gender &&
        ite.category != this.data.category &&
        ite.sport == this.data.sport &&
        ite.brand == this.data.brand
      );
    });

    // 2. حساب You might also like
    const mightLikeData = this.allProducts.filter((ite) => {
      return (
        ite.gender == this.data.gender &&
        ite.category == this.data.category &&
        ite.sport == this.data.sport &&
        ite.brand == this.data.brand &&
        ite.franchise == this.data.franchise &&
        ite.id != this.data.id
      );
    });

    // 3. حساب Others also bought
    let tests = [];
    const othersBoughtData = this.allProducts.filter((ite) => {
      const test1 = ite.gender == this.data.gender;
      let test2 = ite.category != this.data.category;
      const test3 = ite.sport == this.data.sport;
      const test4 = ite.brand == this.data.brand;
      const test5 = ite.id != this.data.id;

      if (test2) {
        let found = tests.find((t) => t === ite.category);
        if (!found) {
          tests.push(ite.category);
          test2 = true;
        } else {
          test2 = false;
        }
      }

      return test1 && test2 && test3 && test4 && test5;
    });

    // 4. حساب Recently Viewed
    const recently = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const getActiveNow = this.productId || this.data.id;

    const recentlyViewedData = recently.reduce((acc, id) => {
      const curr = this.allProducts.find((product) => product.id === id);
      if (curr && id !== getActiveNow) acc.unshift(curr);
      return acc;
    }, []);

    // إعدادات إنشاء الكاروسيل المشتركة
    const carouselParams = { cardTemplate: "card", slideTemplate: "slide" };

    // إنشاء و ضخ الداتا لكل كاروسيل في الحاوية بتاعته مباشرة
    setTimeout(() => {
      const c1 = new Carousel(
        "carousel",
        "completeTheLook",
        "1",
        "2",
        carouselParams,
        3,
      );
      c1.renderCustomData(completeTheLookData, "Complete The Look", "");
    }, 0);
    setTimeout(() => {
      const c2 = new Carousel(
        "carousel",
        "youMightAlsoLike",
        "1",
        "2",
        carouselParams,
        3,
      );
      c2.renderCustomData(mightLikeData, "You Might Also Like", "");
    }, 200);
    setTimeout(() => {
      const c3 = new Carousel(
        "carousel",
        "othersAlsoBought",
        "1",
        "2",
        carouselParams,
        3,
      );
      c3.renderCustomData(othersBoughtData, "Others Also Bought", "");
    }, 400);
    setTimeout(() => {
      const c4 = new Carousel(
        "carousel",
        "recentlyViewd",
        "1",
        "2",
        carouselParams,
        3,
      );
      c4.renderCustomData(recentlyViewedData, "Recently Viewed", "");
    }, 600);
  }

  renderRightSection() {
    // ورسمه Breadcrumbs تشغيل ال
    this.renderBreadcrumbs();

    this.renderSummaryRating();

    this.renderDetailsProduct();

    this.renderColorsProduct();

    this.renderProductSizes();

    this.initAddToBag();

    this.initAddToWishlist();
  }

  renderBreadcrumbs() {
    // 1. هات المكان اللي هترسم فيه
    const breadcrumbDiv = this.rightSection.querySelector(
      ".product-breadcrumbs",
    );
    if (!breadcrumbDiv) return;

    // 2. استخراج الأقسام من داتا المنتج اللي إنت واقف عليه
    const path = [];

    // شروط عشان لو الداتا ناقصة متضربش error
    if (this.data.gender) path.push(this.data.gender);
    if (this.data.sport) path.push(this.data.sport);
    if (this.data.category) path.push(this.data.category);

    // 3. بناء الـ HTML
    let breadcrumbHTML = "";

    path.forEach((item, i) => {
      if (i === path.length - 1) {
        breadcrumbHTML += `<span class="current-page path-breadcrumbs">${item}</span>`;
      } else {
        breadcrumbHTML += `<a href="/shop/${item.toLowerCase()}" data-link class="path-breadcrumbs">${item}</a> <span class="separator">/</span> `;
      }
    });

    // 4. طباعة النتيجة في الشاشة
    breadcrumbDiv.innerHTML = breadcrumbHTML;
  }

  renderSummaryRating() {
    const ratingSummary = this.rightSection.querySelector(
      ".rating-pricing-section .rating_summary",
    );

    if (!ratingSummary) return;

    const saleDiv = this.rightSection.querySelector(
      ".rating-pricing-section .sale-badge",
    );
    const ratingStars = this.rightSection.querySelectorAll(
      ".rating-pricing-section .rating_summary .stars li .result",
    );

    const ratingCounts = this.rightSection.querySelectorAll(
      ".average-rating, .reviews-count",
    );

    this.popub = this.rightSection.querySelector(".popub-rating__summary");

    const resultLinesPopub = this.popub.querySelectorAll(
      ".item-container .result",
    );
    const ratingPopub = this.popub.querySelectorAll(
      ".item-container .reviews-count-star",
    );

    const btnPopub = this.popub.querySelector(".go-reviews-position");

    function getResult(arr, rating) {
      let n = rating;
      for (let i = 0; i < arr.length; i++) {
        const result = Math.min(100, Math.max(n * 100, 0));
        n--;
        arr[i].style.width = `${result}%`;
      }
    }

    if (this.data.is_sale) {
      const sale = 100 - (this.data.sale_price / this.data.old_price) * 100;
      saleDiv.innerHTML = `<div class="percentageoff center">${-sale.toFixed(0)}%</div>`;
    } else saleDiv.style.display = "none";

    const rating = +this.getAverageRating().toFixed(1);

    getResult(ratingStars, rating);

    ratingCounts[0].innerText = rating;
    ratingCounts[1].innerText = `(${this.data.allRating.allReviews})`;

    const ratingsArray = [
      "fiveStar",
      "fourStar",
      "threeStar",
      "twoStar",
      "oneStar",
    ];

    ratingPopub.forEach((ite, index) => {
      const eq =
        (this.data.allRating[ratingsArray[index]] /
          Math.max(this.data.allRating.allReviews, 1)) *
        100;

      resultLinesPopub[index].style.width = eq + "%";
      ite.innerText = this.data.allRating[ratingsArray[index]];
    });

    btnPopub.innerHTML = `Read ${this.data.allRating.allReviews} <br/> Reviews`;

    this.t = null;

    ratingSummary.addEventListener(
      "mouseenter",
      this.onMoveSummary.bind(this),
      {
        passive: true,
      },
    );

    ratingSummary.addEventListener(
      "mouseleave",
      this.onLeaveSummary.bind(this),
      {
        passive: true,
      },
    );

    ratingSummary.addEventListener(
      "click",
      this.onClickRatingSummary.bind(this),
      {
        passive: true,
      },
    );
  }

  renderDetailsProduct() {
    const targets = this.rightSection.querySelectorAll(
      ".title-head, .basic-price, .hasSale, .message-info",
    );

    targets[0].innerText = this.data.name;

    if (this.data.is_sale) {
      targets[1].textContent = `${this.data.currency} ${UIHelper.getLocalPrice(this.data.sale_price)}`;
      targets[1].classList.add("active-sale");
      targets[2].innerHTML = `<h4 class="sale_price"><span class="special-text">Original Price: </span><span class="price-after-sale">${this.data.currency} ${UIHelper.getLocalPrice(this.data.old_price)}</span></h4>`;
    } else {
      targets[1].classList.remove("active-sale");
      targets[1].innerText = `${this.data.currency} ${UIHelper.getLocalPrice(this.data.price)}`;
      targets[2].innerHTML = ``;
    }

    if (this.data.is_evo_sl) {
      targets[3].innerHTML = `<h3>This product is excluded from all promotional discounts/offers.</h3>`;
    } else targets[3].innerHTML = ``;
  }

  renderColorsProduct() {
    const variants = this.data.variants;
    const container = this.rightSection.querySelector(".colors-available");
    this.isColorsAvaialble = true;
    this.indexActive = 0;

    if (!variants || variants.length <= 1) {
      this.isColorsAvaialble = false;
      container.innerHTML = ``;
      return;
    }

    let items = ``;

    variants.forEach((ite, index) => {
      const isActive = this.colorId === ite.color_id;
      if (isActive) this.indexActive = index;

      items += `<li class="item ${isActive ? "active" : ""}" id="${this.data.id}-${ite.color_id}" data-id="${ite.color_id}" data-index="${index}">
                  <img src="${ite.images.basic}" alt="color ${index + 1}"/>
                  <span class="is-not-found"></span>
                </li>`;
    });

    const containerHTML = `
    <div class="container-colors">
      <h2 class="title-head-colors">${variants.length} colors available</h2>
      <ul class="container-items">${items}</ul>
      <h2 class="title-color"></h2>
    </div>
    `;

    container.innerHTML = containerHTML;
    this.colorsProduct = container.querySelectorAll("li.item");
    const titleColor = container.querySelector(".title-color");
    this.activeColorNow = this.colorsProduct[this.indexActive];

    this.onMouseEventsColor(variants, titleColor);
  }

  onMouseEventsColor(variants, titleColor) {
    const replaceColorActive = () => {
      titleColor.innerText =
        variants[this.activeColorNow.dataset.index].color_name;
    };

    replaceColorActive();

    this.colorsProduct.forEach((clr) => {
      clr.addEventListener(
        "mouseenter",
        (e) => {
          titleColor.innerText =
            variants[e.currentTarget.dataset.index].color_name;
        },
        { passive: true },
      );

      clr.addEventListener("mouseout", replaceColorActive, { passive: true });

      clr.addEventListener(
        "click",
        (e) => {
          if (this.activeColorNow === e.currentTarget) return;

          this.activeColorNow.classList.remove("active");
          e.currentTarget.classList.add("active");
          this.activeColorNow = e.currentTarget;

          // الأندكس بيتحدث ببساطة
          this.indexActive = +this.activeColorNow.dataset.index;

          replaceColorActive();

          let selectedVariantId = this.activeColorNow.dataset.id;
          const pathname = location.pathname;

          // تركيب اللينك الجديد
          const newURL =
            selectedVariantId === this.data.default_color_id
              ? pathname
              : `${pathname}?color=${selectedVariantId}`;

          const images = variants[this.indexActive].images.other;
          const scrollPosition = scrollY;

          this.gallery.start(images);
          this.viewGallery.run(images);

          window.scrollTo({ top: scrollPosition });

          window.history.replaceState(null, "", newURL);

          this.mobileGallery.init(images, true);
          this.accordion.description("", true);
          this.isAvaialabeSize(false);

          this.sizesTags = this.rightSection.querySelectorAll(
            ".row-table-sizes li",
          );
          this.updatePageData();
        },
        { passive: true },
      );
    });
  }

  updatePageData() {
    this.createSizesValues();
    this.initAddToBag();
    this.initAddToWishlist();
  }

  renderProductSizes() {
    this.initPopupSizes();

    this.createSizesValues();

    this.onClickDeliveryBtn();
  }

  hiddenScroll(run) {
    document.body.classList.toggle("no-scroll", run);
    return;
  }

  popapAnimation(pop, btnExit) {
    const focus = document.createElement("div");
    const sec = document.getElementById("view-details");
    focus.className = "focus-delivery";
    focus.id = "focusDelivery";
    if (!pop || !btnExit || !sec) return;

    document.body.prepend(focus);

    focus.classList.add("active");
    pop.classList.add("active");

    UIHelper.toggleScroll(true);

    const cleanActive = () => {
      const anim = pop.animate(
        [
          { opacity: "1", top: "calc(15%)" },
          { opacity: "0", top: "calc(15% - 20px)" },
        ],
        {
          duration: 300,
        },
      );

      focus.animate([{ opacity: "0.5" }, { opacity: "0" }], {
        duration: 300,
      });

      anim.onfinish = () => {
        focus.remove();
        pop.classList.remove("active");
        UIHelper.toggleScroll(false);
      };
    };

    btnExit.onclick = cleanActive;

    focus.onclick = cleanActive;
  }

  onClickDeliveryBtn() {
    const btn = document.querySelector(".right-sec-footer .style-action .text");
    const popap = document.getElementById("deliveryPopap");
    const btnClosePopap = popap.querySelector(".close");

    btn.onclick = () => {
      this.popapAnimation(popap, btnClosePopap);
    };
  }

  initPopupSizes() {
    const btnOpenPopup = document.querySelector(".click-popup-details-page");

    if (!btnOpenPopup) return;

    btnOpenPopup.onclick = () => {
      this.openPopup();
    };
  }

  openPopup() {
    this.containerPopupSize = document.querySelector(".popup-sizes");

    if (!this.containerPopupSize) return;

    this.matchesWithCategory();

    this.popupSize = this.containerPopupSize.querySelector(
      ".popup-detials-page",
    );

    UIHelper.toggleScroll(true);
    this.focus.classList.add("active");

    const anim = this.focus.animate([{ opacity: "0" }, { opacity: "0.5" }], {
      duration: 200,
      fill: "both",
      easing: "linear",
    });

    anim.addEventListener("finish", () => {
      this.popupSize.style.display = "block";
      this.popupSize.style.animation = `anim-sizes-open .2s`;

      this.eventsPopupSize();
    });
  }

  eventsPopupSize() {
    const btnOut = this.containerPopupSize.querySelector(".btn-out");
    const scrollAskToMeasure = this.containerPopupSize.querySelectorAll(
      ".ask, .between-text.two",
    );
    const btnBackTop = this.containerPopupSize.querySelector(".back-top");

    if (!btnOut) return;

    scrollAskToMeasure[0].onclick = () => {
      scrollAskToMeasure[1].scrollIntoView({
        behavior: "smooth", // سلاسة الانتقال
        block: "start", // المكان الي هيقف فيه عموديا {Y}
      });
    };

    btnBackTop.onclick = () => this.popupSize.scrollTo(0, 0);

    this.focus.onclick = this.animteRemove.bind(this);

    btnOut.onclick = this.animteRemove.bind(this);
  }

  animateFinish() {
    this.popupSize.style.display = "";
    document.body.style.overflow = "";
    this.popupSize = ``;
    this.containerPopupSize.innerHTML = ``;
    this.focus.classList.remove("active");
    UIHelper.toggleScroll(false);
  }

  animteRemove() {
    if (!this.popupSize) return;

    const anim = this.popupSize.animate(
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

    anim.addEventListener("finish", this.animateFinish.bind(this));
  }

  matchesWithCategory() {
    const category = this.data.category.toLowerCase();
    if (!category) return;

    switch (category) {
      case "shoes":
        this.appendTemplateChart(this.containerPopupSize, "chartShoes");
        break;
      default:
        this.appendTemplateChart(this.containerPopupSize, "chartShoes");
    }
  }

  appendTemplateChart(container, templateId) {
    const template = document.getElementById(templateId);
    if (!template) return;

    container.innerHTML = "";
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);
  }

  createSizesValues() {
    this.theSize = this.rightSection.querySelector(".the-size");
    const allProducts = JSON.parse(localStorage.getItem("products"));
    this.data = allProducts.find((pr) => pr.id === this.productId);

    this.indexActive = this.indexActive || 0;

    this.sizesData = [...this.data.variants[this.indexActive].sizes];

    const container = this.theSize.querySelector(".row-table-sizes");
    const adviceMsg = this.theSize.querySelector(".advice-size .advice-msg");

    if (!this.sizesData || !this.theSize || !container) return;

    let sizes = ``;
    let target = null;
    this.selectProduct = null;

    this.cartItems = this.getDataItems("cartItems") || null;

    this.sizesData.forEach((v) => {
      if (this.cartItems) {
        target = this.cartItems.find((c) => v.sku === c.sku);
        sizes += `<li class="size-value center ${target ? (target.virtualStock === 0 ? "off" : "") : v.stock === 0 ? "off" : ""}" data-size="${v.size}" data-stock="${v.stock}" data-sku="${v.sku}">${v.size}</li>`;
      } else {
        sizes += `<li class="size-value center ${v.stock === 0 ? "off" : ""}" data-size="${v.size}" data-stock="${v.stock}" data-sku="${v.sku}">${v.size}</li>`;
      }
    });

    container.innerHTML = sizes;

    if (adviceMsg) {
      adviceMsg.innerHTML = `<span>Size Advice.</span> ${this.data.size_advice}`;
    }

    this.eventsSizesValues(container);
  }

  getDataItems(nameStr) {
    const str = localStorage.getItem(nameStr);
    return str ? JSON.parse(str) : null;
  }

  eventsSizesValues(container) {
    const hasAvailable = this.theSize.querySelector(".available-stock-msg");
    const sizeText = this.rightSection.querySelector(
      ".the-sizes-container .row-titles h3.title",
    );
    const tableSize = this.rightSection.querySelector(
      ".the-sizes-container .row-table-sizes",
    );
    this.sizesTags = container.querySelectorAll("li");

    hasAvailable.innerHTML = ``;
    this.isAvaialabeSize(false);

    container.onclick = (e) => {
      // 1. نتأكد إن اليوزر داس على زرار مقاس مش حتة فاضية
      if (!e.target.classList.contains("size-value")) return;

      // 2. الفلتر الأمني: هل المقاس ده متاح فعلاً في الداتا؟
      let selectSize = null;
      let cartItem = null;

      const checkSize = this.data.variants[this.indexActive].sizes.find((f) => {
        if (f.size === e.target.dataset.size) {
          if (this.cartItems) {
            const target = this.cartItems.find((c) => {
              return e.target.dataset.sku === c.sku;
            });
            cartItem = target;
            selectSize = f;

            return target ? target.virtualStock > 0 : f.stock > 0;
          }
          selectSize = f;
          return f.stock > 0;
        }
      });
      // لو اليوزر هكر ولعب في الـ Inspect وداس على مقاس مش متاح -> اخرج متعملش حاجة
      if (!checkSize) return;

      this.onAndOffPurchasing(false, sizeText, tableSize);
      this.selectProduct = selectSize;

      // 3. اللوجيك الطبيعي: هل هو أصلاً مختاره قبل كده (on)؟
      const isAlreadySelected = e.target.classList.contains("on");

      if (isAlreadySelected) {
        // لو داس عليه وهو مختاره -> نلغي الاختيار
        e.target.classList.remove("on");
        this.isAvaialabeSize(false);
        hasAvailable.innerHTML = ``;
        this.selectProduct = null;
      } else {
        // لو داس على مقاس جديد متاح -> نختاره
        this.removeActives(this.sizesTags, "on"); // نمسح أي اختيار قديم
        e.target.classList.add("on"); // نختار الجديد
        this.isAvaialabeSize(true, e.target.dataset.size);

        // رسالة المخزون
        if (
          (cartItem && cartItem.virtualStock <= 5) ||
          this.selectProduct.stock <= 5
        ) {
          hasAvailable.innerHTML = `Only ${cartItem ? cartItem.virtualStock : this.selectProduct.stock} left in stock`;
        } else {
          hasAvailable.innerHTML = ``;
        }
      }
    };
  }

  isAvaialabeSize(isSelectSize, size) {
    const items = this.rightSection.querySelectorAll(
      ".container-colors .container-items li.item",
    );

    function sizeIsFound(arr, target) {
      return arr.find((ite) => ite.size === target);
    }

    const loopItems = (items, isSelected, size) => {
      const text = this.rightSection.querySelector(".available-size");

      if (isSelected) {
        if (this.isColorsAvaialble) {
          text.innerHTML = `<p class="text-hasSale">Colours available in size : <span>${size}</span></p>`;
        } else text.innerHTML = ``;

        items.forEach((ite) => {
          const variantIndex = +ite.dataset.index;
          const isFound = sizeIsFound(
            this.data.variants[variantIndex].sizes,
            size,
          );

          isFound
            ? ite.classList.remove("not-found")
            : ite.classList.add("not-found");
        });
      } else {
        text.innerText = ``;
        this.removeActives(items, "not-found");
      }
    };

    loopItems(items, isSelectSize, size);
  }

  removeActives(arr, ...removeClass) {
    arr.forEach((ite) => ite.classList.remove(removeClass));
  }

  transformNum(n) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  initAddToBag() {
    this.btnBag = document.getElementById("addToBag");
    this.msgContainerDetails =
      this.rightSection.querySelector(".msgActionDetails");

    //* ومخترش مقاس add-to-bag المتغيرات دي بستدعيها للشكل فقط عند الضفط على زر
    const sizeText = this.rightSection.querySelector(
      ".the-sizes-container .row-titles h3.title",
    );
    const tableSize = this.rightSection.querySelector(
      ".the-sizes-container .row-table-sizes",
    );

    if (!this.msgContainerDetails || !sizeText || !tableSize || !this.btnBag) {
      return;
    }

    //* الاول بنرجع العناصر زي ما كانت
    this.onAndOffPurchasing(false, sizeText, tableSize);
    this.onclickToBag(sizeText, tableSize);
  }

  initAddToWishlist() {
    const curr = this.data;
    const sku = `${curr.id}-${curr.variants[this.indexActive].color_id}`;
    const btnWishlist = document.getElementById("addToWishListBtn");

    if (!btnWishlist) return;

    const icon = btnWishlist.querySelector("i");

    let isActive = this.wishlist.store.has(sku);
    icon.className = isActive ? "fa-solid fa-heart" : "fa-regular fa-heart";

    btnWishlist.onclick = () => {
      isActive = !this.wishlist.store.has(sku);
      icon.className = isActive ? "fa-solid fa-heart" : "fa-regular fa-heart";

      this.wishlist.toggleItem(curr, sku, this.indexActive, isActive);
    };
  }

  onclickToBag(text, table) {
    let positionScroll = document.querySelector(".advice-size");

    if (!positionScroll) positionScroll = table;

    this.btnBag.onclick = () => {
      if (this.selectProduct) {
        this.myBag.clickAdd(
          this.selectProduct,
          this.data,
          this.indexActive,
          this,
        );
      } else {
        positionScroll.scrollIntoView({
          block: "center",
        });
        this.onAndOffPurchasing(true, text, table);
      }
    };
  }

  onAndOffPurchasing(isOn, text, table) {
    const animFn = (target) => {
      const anim = target.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(20px)" },
          { transform: "translateX(0)" },
          { transform: "translateX(20px)" },
          { transform: "translateX(0)" },
        ],
        {
          duration: 300,
          fill: "both",
        },
      );

      anim.onfinish = () => {
        this.btnBag.disabled = false;
      };
    };

    if (isOn) {
      this.msgContainerDetails.innerHTML = `<h4 class="msg-select-size">Please select a size</h4>`;
      text.style.color = "#e32b2b";

      animFn(text);
      animFn(this.msgContainerDetails);
      animFn(table);
    } else {
      this.msgContainerDetails.innerHTML = ``;
      text.style.color = "";
    }
  }

  onMoveSummary() {
    clearTimeout(this.t);
    this.t = setTimeout(() => {
      this.popub.style.display = "block";
    }, 200);
  }

  onLeaveSummary() {
    clearTimeout(this.t);
    this.t = setTimeout(() => {
      this.popub.style.display = "";
    }, 300);
  }

  onClickRatingSummary(e) {
    if (e.target.className === this.popub.className) return;
    const target = this.leftSection.querySelector(
      ".accordion-item.details-reviews",
    );

    if (target) {
      target.classList.add("show");
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  getAverageRating() {
    if (this.data.allRating.allReviews === 0) return 0;
    const keys = Object.keys(this.data.allRating);
    let result = keys.reduce((acc, curr) => {
      if (curr === "fiveStar") acc += this.data.allRating[curr] * 5;
      if (curr === "fourStar") acc += this.data.allRating[curr] * 4;
      if (curr === "threeStar") acc += this.data.allRating[curr] * 3;
      if (curr === "twoStar") acc += this.data.allRating[curr] * 2;
      if (curr === "oneStar") acc += this.data.allRating[curr] * 1;
      return acc;
    }, 0);

    return result / this.data.allRating.allReviews;
  }
}
