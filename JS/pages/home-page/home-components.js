export class Slides {
  constructor(containerId) {
    this.template = document.getElementById("temp1"); // القالب
    this.container = document.getElementById(containerId);
    this.data = null;
    this.start = this.getData;

    if (!this.container) return;
  }

  async getData(link) {
    try {
      if (!link.includes(".json")) {
        let data = JSON.parse(localStorage.getItem(link));
        this.data = data;
        this.init();
      } else {
        let res = await fetch(link);
        let data = await res.json();
        this.data = data;
        this.init();
      }
    } catch (err) {
      console.log(err);
    }
  }

  render(items) {
    items.forEach((item, index) => {
      const clone = this.template.content.cloneNode(true);

      const bgSection = clone.querySelector(".background");
      const title = clone.querySelector(".titleHeading");
      const text = clone.querySelector(".contentText");
      const contentDiv = clone.querySelector(".content");
      const experienceComponent = clone.querySelector(".experience-component");
      const img = document.createElement("img");
      const imgReal = new Image();

      function createSource(isDesk, srcsetArr) {
        const source = document.createElement("source");

        source.media = isDesk ? `(min-width: 768px)` : "(max-width: 767px)";
        source.srcset = srcsetArr
          .map((ite) => `${ite[0]} ${ite[1]}`)
          .join(", ");

        return source;
      }

      function onLoad() {
        experienceComponent.classList.remove("skeleton", "skeleton-img");
      }

      const sourceDesktop = createSource(true, item.desktop.srcset);
      const sourceMobile = createSource(false, item.mobile.srcset);

      imgReal.onload = onLoad;

      if (index === 0) {
        img.src = item.desktop.src;
        img.decoding = "async";
        img.alt = "New collection";
        img.fetchPriority = "high";
        img.loading = "eager";
      } else {
        imgReal.src = item.desktop.src;
        imgReal.decoding = "async";
        imgReal.alt = "New collection";
        imgReal.fetchPriority = "auto";
        experienceComponent.classList.add("skeleton", "skeleton-img");
      }

      bgSection.append(sourceDesktop, sourceMobile, index < 1 ? img : imgReal);

      experienceComponent.id = `experienceComponent-${index}`;

      title.textContent = item.titleHead;
      text.textContent = item.content;
      contentDiv.classList.add(item.color, item.style);

      this.container.append(clone);
    });
  }

  init() {
    const experience = this.container.querySelectorAll(".experience-component");

    if (experience) experience.forEach((ex) => ex.remove());

    this.data.forEach((curr) => {
      if (curr.name === "experience-component") {
        this.render(curr.items);
      }
    });
  }
}

export class SlidesCategory {
  constructor(sliderTemp, containerId) {
    this.sliderTemp = document.getElementById(sliderTemp);
    this.container = document.getElementById(containerId);
    if (!sliderTemp || !containerId) return;

    this.start = this.getData;
    this.data = null;
  }

  async getData(link) {
    try {
      if (!link.includes(".json")) {
        let data = JSON.parse(localStorage.getItem("custom-page"));
        this.data = data.find((item) => item.name === "slider-category");
        this.init();
      } else {
        const res = await fetch(link);
        const data = await res.json();

        this.data = data.find((item) => item.name === "slider-category");
        this.init();
      }
    } catch (err) {
      console.log(err);
    }
  }

  init() {
    const existingSlider = this.container.querySelector(".slider-category");
    if (existingSlider) {
      existingSlider.remove();
    }

    const clone = this.sliderTemp.content.cloneNode(true);
    const title = clone.querySelector(".title-category");
    const container = clone.querySelector(".container-category");
    const items = this.data.items;

    title.textContent = this.data.title;

    const columns =
      items.length > 3 ? Math.ceil(items.length / 2) : items.length;
    container.style.setProperty("--cols-count", columns);

    items.forEach((item, i) => {
      const card = document.createElement("div");
      const btn = document.createElement("button");
      const spanTitle = document.createElement("span");
      const icons = [
        document.createElement("img"),
        document.createElement("img"),
      ];
      const loadingInContainer =
        this.container.querySelectorAll(".item-loading");

      const imgMyBackground = new Image();

      imgMyBackground.onload = () => {
        card.style.backgroundImage = `url(${item.background})`;
        spanTitle.textContent = item.titleBtn;

        icons[0].src = "images/Home/long-arrow-right-black.svg";
        icons[0].alt = "arrow-black";

        icons[1].src = "images/Home/long-arrow-right-white.svg";
        icons[1].alt = "arrow-white";

        card.append(btn);
        card.style.animationDelay = `${i * 50}ms`;
        card.classList.add("card-enter-active");
        btn.append(spanTitle, icons[0], icons[1]);

        loadingInContainer.forEach((l) => l.remove());
        this.container.classList.remove("category-loading");
      };

      imgMyBackground.onerror = () => {
        if (!navigator.onLine) {
          const reDownImg = () => {
            imgMyBackground.src = item.background;
          };
          window.addEventListener("online", reDownImg);
        }
      };

      card.classList.add("card");

      btn.classList.add("btn-category", item.color);

      spanTitle.classList.add("title-btn-category");

      icons[0].classList.add("light");
      icons[1].classList.add("dark");

      btn.addEventListener("click", () => {
        window.location.href = item.link || "/";
      });

      imgMyBackground.src = item.background;
      container.append(card);
    });
    this.container.append(clone);
  }
}

export class Carousel {
  constructor(containerId, viewId, styleBtn, styleCard, slideAndCardId, style) {
    // هنا استعداد ادوات النسخ
    this.temp = document.getElementById(containerId);
    this.view = document.getElementById(viewId);
    this.card = document.getElementById(slideAndCardId.cardTemplate);
    this.slide = document.getElementById(slideAndCardId.slideTemplate);
    this.style = style || "1";

    // هنا اي شروط
    this.isProduct = false;
    this.isSimple = styleCard || "2";
    this.styleBtn = styleBtn;
    // هنا البيانات
    this.data = null;
    this.dataS1 = null;
    this.dataProducts = null;
    this.cloneDataProd = null;
    this.gender = null;
    // RUN
    this.start = this.getData;
  }

  async getData(gender, ...jsonFile) {
    if (jsonFile.length < 1) return;

    try {
      const res = await fetch(jsonFile.find((f) => f.includes("carousel")));
      let data = null;
      const getData = await res.json();

      if (jsonFile.find((f) => f.includes("products"))) {
        const res2 = await fetch(jsonFile.find((f) => f.includes("product")));

        if (this.style == 1) this.isProduct = true;

        const selectRoute = getData.filter((f) => f.style == this.style);

        data = { carou: selectRoute[0], produ: await res2.json() };
      } else if (jsonFile.find((f) => f.includes("carousel"))) {
        const selectRoute = getData.filter((f) => f.style == "2");
        data = { carou: selectRoute[0] };
      } else throw new Error("Err");

      this.data = data;
      this.gender = gender;
      this.dataS1 = data.carou;
      this.dataProducts = data.produ;
      this.init();
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    this.data.carou.items.forEach((_, i) => {
      const clone = this.temp.content.cloneNode(true);

      this.view.append(clone);

      const carousel = this.view.lastElementChild;
      carousel.classList.add(`style-${this.data.carou.style}`, `n-${i}`);
      carousel.id = `carousel-S${this.data.carou.style}-${i}`;
    });
  }

  initElements() {
    this.dataS1.items.forEach((pr, i) => {
      const carousel = document.getElementById(
        `carousel-S${this.dataS1.style}-${i}`,
      );

      if (!carousel) return;

      const title = carousel.querySelector(`.carousel__title`);
      const desc = carousel.querySelector(`.carousel__desc`);

      title.textContent = pr.title;
      desc.textContent = pr.desc;

      if (this.isProduct) {
        const chooseFilter = carousel.querySelector(`.chooses-filter`);
        this.createFilters(chooseFilter);
        this.checkFilters(chooseFilter, carousel);
      } else if (this.style <= 2) {
        this.createSlides(pr.slides.slice(0, 6), carousel);
        this.initEvents();
      }
    });
  }

  renderCustomData(dataArray, titleText, descText) {
    if (!dataArray || dataArray.length === 0 || !this.view) return;

    const clone = this.temp.content.cloneNode(true);
    // تنظيف المكان أولاً عشان ميكررش
    this.view.innerHTML = "";
    this.view.append(clone);

    const carousel = this.view.querySelector(".carousel");
    if (carousel) {
      carousel.id = `carousel-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      carousel.classList.add(`style-${this.style}`);

      const title = carousel.querySelector(`.carousel__title`);
      const desc = carousel.querySelector(`.carousel__desc`);
      const chooseFilter = carousel.querySelector(`.chooses-filter`);

      // إخفاء الفلاتر في صفحة التفاصيل
      if (chooseFilter) chooseFilter.style.display = "none";

      if (title) title.textContent = titleText;
      if (desc) desc.textContent = descText;
      this.createCardsCustomStyle(dataArray, carousel);
      this.setupCarouselPhysics(carousel, null, false);
    }
  }

  initObserver(dataArray) {
    const observer = new IntersectionObserver(
      (entries, ob) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          const curr = entry.target;
          if (this.styleBtn != "3") {
            dataArray.forEach((ite, i) => {
              ite.classList.add("card-enter-active");
              ite.style.animationDelay = `${i * 50}ms`;
            });
          }
          ob.unobserve(curr);
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "250px 600px 250px 600px",
      },
    );

    dataArray.forEach((ite) => {
      observer.observe(ite);
    });
  }

  createFilters(containerFilter) {
    this.dataS1[this.gender].forEach((ch, i) => {
      const btn = document.createElement("button");
      btn.classList.add("btn-filter-deals", this.gender);
      btn.setAttribute("type", ch.type);
      btn.setAttribute("gender", ch.gender);
      btn.id = i;
      btn.textContent = ch.content.toUpperCase();
      if (i === 0) btn.classList.add("active");

      containerFilter.append(btn);
    });
  }

  checkFilters(chooseFilter, carousel) {
    const btns = chooseFilter.querySelectorAll(".btn-filter-deals");

    const applyFilter = (activeBtn) => {
      btns.forEach((btn) => btn.removeAttribute("disabled"));
      activeBtn.setAttribute("disabled", "true");

      const type = activeBtn.getAttribute("type");
      const gender = activeBtn.getAttribute("gender").toLowerCase();
      const targetValue = activeBtn.textContent.toLowerCase();
      const dots = carousel.querySelector(".carousel__dots");
      const btnsBackNext = carousel.querySelectorAll(".carousel__btn");

      btnsBackNext.forEach((btn) => (btn.style.display = "none"));
      dots.style.display = "none";

      let filteredData;

      if (type == "brand") {
        filteredData = this.dataProducts.filter((p) => {
          const isBrandMatch = p.brand.toLowerCase() === targetValue;
          const isGender =
            gender === "home" || p.gender.toLowerCase() === gender;
          return isBrandMatch && isGender;
        });
      } else {
        filteredData = this.dataProducts.filter((p) => {
          const isType = p[type];
          const isGender =
            gender === "home" || p.gender.toLowerCase() === gender;
          return isType && isGender;
        });
      }

      btnsBackNext.forEach((btn) => (btn.style.display = ""));
      dots.style.display = "";

      this.createCards(filteredData, carousel);

      if (carousel.refreshState) {
        carousel.refreshState();
      }
    };

    chooseFilter.onclick = (e) => {
      if (!e.target.classList.contains("btn-filter-deals")) return;

      btns.forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");
      applyFilter(e.target);
    };

    const defaultActive = chooseFilter.querySelector(
      ".btn-filter-deals.active",
    );
    if (defaultActive) applyFilter(defaultActive);
  }

  createCards(cloneDataProd, carousel) {
    this.createCardsCustomStyle(cloneDataProd, carousel);
    this.setupCarouselPhysics(carousel, null, false); // تشغيل الحركة
  }

  createSlides(slides, carousel) {
    const track = carousel.querySelector(".carousel__track");

    track.innerHTML = "";

    slides.forEach((s) => {
      const slideClone = this.slide.content.cloneNode(true);
      const linkPhoto = slideClone.querySelector(".photo-box");
      const img = slideClone.querySelector(".photo-box img");
      const title = slideClone.querySelector(".head");
      const desc = slideClone.querySelector(".des");
      const linkBtn = slideClone.querySelector(".btn-card");

      linkPhoto.href = s.link;
      img.src = s.img;
      img.alt = s.titleSlide;
      img.setAttribute("loading", "lazy");
      title.textContent = s.titleSlide;
      desc.textContent = s.descSlide;
      linkBtn.href = s.link;
      track.append(slideClone);
    });

    const slidesTag = track.querySelectorAll(".carousel__slide");

    this.initObserver(slidesTag, carousel);
  }

  createCardsCustomStyle(cloneDataProd, carousel) {
    const track = carousel.querySelector(".carousel__track");
    const cardsData = cloneDataProd.slice(0, 12);

    track.innerHTML = ``;

    cardsData.forEach((data) => {
      const cloneCard = this.card.content.cloneNode(true);
      const parentCard = cloneCard.querySelector(".parent-card");
      const links = cloneCard.querySelectorAll("a");
      const photosContainer = cloneCard.querySelector(".photo");
      const productName = cloneCard.querySelector(".product-name");
      const [curr, price] = cloneCard.querySelector(".basic-price").children;
      const [currSale, pSale] = cloneCard.querySelector(".sale-price").children;
      const classification = cloneCard.querySelector(".classification");
      const badgesText = cloneCard.querySelector(".product-badges-text");
      const defaultVariant =
        data.variants?.find((v) => v.color_id === data.default_color_id) ||
        data.variants[0];
      const basicImgSrc = defaultVariant ? defaultVariant.images.basic : "";
      const hoverImgSrc = defaultVariant ? defaultVariant.images.hover : "";

      if (this.isSimple == "2") {
        parentCard.classList.add("parent-card", "very-simple", "simple");
      } else if (this.isSimple == "1") {
        parentCard.classList.add("parent-card", "simple");
      } else parentCard.classList.add("parent-card");

      links.forEach((link) => {
        link.href = `/product/${data.id}`;
        link.setAttribute("data-link", "");
      });

      const [imgOne, imgTwo] = [new Image(), document.createElement("img")];

      const imgLoading = document.createElement("div");
      imgLoading.className = `skeleton skeleton-img`;

      imgOne.classList.add("basic");
      imgOne.alt = "basic-photo";
      imgOne.setAttribute("draggable", "false");

      imgTwo.src = hoverImgSrc;
      imgTwo.classList.add("hover");
      imgTwo.alt = "hover-photo";
      imgTwo.setAttribute("draggable", "false");

      const numSale = document.createElement("span");
      numSale.classList.add("sale-card");

      if (data.is_sale) {
        numSale.textContent = `-${Math.round(100 - (data.sale_price / data.old_price) * 100)}%`;
        parentCard.classList.add("sale");

        const salePrice = data.sale_price || 0;

        price.textContent = salePrice.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        currSale.textContent = data.currency || 0;
        pSale.textContent =
          data.old_price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || 0;
      } else {
        price.textContent = data.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }

      imgOne.onload = () => {
        imgLoading.remove();
        photosContainer.append(imgOne, imgTwo, numSale);
      };

      imgOne.onerror = () => {
        if (!navigator.onLine) {
          function retryLoading() {
            imgOne.src = basicImgSrc;
          }

          window.addEventListener("online", retryLoading, { once: true });
        }
      };

      imgOne.src = basicImgSrc;
      curr.textContent = data.currency;
      photosContainer.append(imgLoading);
      productName.textContent = data.name;
      productName.title = data.name;
      classification.textContent = data.brand;

      if (data.is_new) {
        badgesText.textContent = data.title_new;
      }

      track.append(cloneCard);
    });
    const cards = track.querySelectorAll(".parent-card");
    this.initObserver(cards, carousel);
  }

  initEvents() {
    if (this.dataS1 && this.dataS1.items) {
      this.dataS1.items.forEach((c, i) => {
        const carousel = document.getElementById(
          `carousel-S${this.dataS1.style}-${i}`,
        );
        if (carousel) {
          this.setupCarouselPhysics(carousel, Math.max(c.n || 1, 1), c.special);
        }
      });
    }
  }

  /**
   * @param {number} step
   * @param {boolean} isSpecial
   * @param {number} slidesCount
   * @param {number} maxTranslate
   * @returns {number}
   */
  getMaxIndex(step, isSpecial, slidesCount, maxTranslate) {
    if (step < 1) return 0;

    if (isSpecial && slidesCount && slidesCount === 1) {
      return Math.ceil(maxTranslate / step);
    }

    return Math.round(maxTranslate / step);
  }

  setupCarouselPhysics(carousel, slidesCount, isSpecial) {
    let index = 0;
    let maxIndex = 0;
    let startTranslate = 0;
    let maxTranslate = 0;
    let step = 0;

    const track = carousel.querySelector(".carousel__track");
    const viewport = carousel.querySelector(".carousel__viewport");
    const prevBtn = carousel.querySelector(".carousel__btn--prev");
    const nextBtn = carousel.querySelector(".carousel__btn--next");
    const carouselDots = carousel.querySelector(".carousel__dots");
    let dots = null;

    if (!viewport || !track || !prevBtn || !nextBtn) return;

    if (this.styleBtn == "1") {
      const btns = carousel.querySelectorAll(".carousel__btn");
      btns.forEach((btn) => btn.classList.add("style-1"));
    }

    const measure = () => {
      const currentFirstSlide =
        carousel.querySelector(".carousel__slide") ||
        carousel.querySelector(".parent-card");
      if (!currentFirstSlide) {
        step = 0;
        maxTranslate = 0;
        maxIndex = 0;
        return;
      }

      const slideWidth = currentFirstSlide.offsetWidth;
      const singleSlideFullWidth = slideWidth;

      if (isSpecial) {
        step = singleSlideFullWidth * slidesCount;
      } else {
        const visibleItems = Math.round(
          viewport.clientWidth / singleSlideFullWidth,
        );
        step = singleSlideFullWidth * Math.max(1, visibleItems);
      }

      maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);

      maxIndex = this.getMaxIndex(step, isSpecial, slidesCount, maxTranslate);
      index = Math.max(0, Math.min(index, maxIndex));

      if (!carouselDots) return;

      carouselDots.innerHTML = "";

      if (maxIndex < 1) {
        dots = null;
        return;
      }

      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot2");
        dot.onclick = () => {
          index = i;
          apply();
        };
        carouselDots.append(dot);
      }
      dots = carouselDots.querySelectorAll(".dot2");
      checkDots();
    };

    const checkDots = () => {
      if (!dots) return;
      dots.forEach((dot) => dot.classList.remove("active"));
      if (dots[index]) dots[index].classList.add("active");
    };

    const checkButtons = (translate) => {
      const EPS = 0.5;
      if (translate <= EPS) prevBtn.classList.remove("active");
      else prevBtn.classList.add("active");

      if (translate >= maxTranslate - EPS) nextBtn.classList.remove("active");
      else nextBtn.classList.add("active");
    };

    const getTranslate = () => Math.min(index * step, maxTranslate);

    const apply = () => {
      const translate = getTranslate();
      track.style.transform = `translateX(${-translate}px)`;
      checkButtons(translate);
      checkDots();
    };

    carousel.refreshState = () => {
      track.style.transition = `none`;
      index = 0;

      measure();

      track.style.transition = ``;

      apply();
    };

    let t = null;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        measure();
        apply();
      }, 100);
    });

    setTimeout(() => {
      measure();
      apply();
    }, 1000);

    prevBtn.onclick = () => {
      index = Math.max(index - 1, 0);
      apply();
    };
    nextBtn.onclick = () => {
      index = Math.min(index + 1, maxIndex);
      apply();
    };

    let isDragging = false;
    let lockAxis = null;
    let startX = 0,
      lastX = 0,
      startY = 0,
      startTime = 0;
    let isLinkBlocked = false;

    const onDragStart = (e) => {
      if (e.type === "mousedown" && e.button !== 0) return;
      if (e.type === "touchstart" && e.touches.length !== 1) return;

      isDragging = true;
      isLinkBlocked = false;
      lockAxis = null;
      startX = getEventX(e);
      startY = getEventY(e);
      lastX = startX;

      startTime = performance.now();
      startTranslate = getTranslate();
      track.style.transition = "none";
    };

    const onDragMove = (e) => {
      if (!isDragging || (e.type === "touchmove" && e.touches.length !== 1))
        return;
      if (e.type.includes("mouse")) e.preventDefault();

      const x = getEventX(e);
      const y = getEventY(e);

      if (Math.abs(x - startX) > 5) isLinkBlocked = true;

      const dx = x - startX;
      const dy = y - startY;

      if (!lockAxis) lockAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (lockAxis === "y") return;
      if (e.cancelable) e.preventDefault();

      lastX = x;
      const raw = startTranslate - dx;
      const next = Math.max(0, Math.min(raw, maxTranslate));
      setTranslate(next);
    };

    const onDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = "";

      const endTime = performance.now();
      const dt = Math.max(1, endTime - startTime);
      const dxTotal = lastX - startX;
      const velocity = dxTotal / dt;

      const distanceThreshold = Math.max(40, step * 0.25);
      const velocityThreshold = 0.5;

      if (lockAxis === "y") {
        apply();
        return;
      }

      if (dxTotal <= -distanceThreshold || velocity <= -velocityThreshold) {
        index = Math.min(index + 1, maxIndex);
      } else if (
        dxTotal >= distanceThreshold ||
        velocity >= velocityThreshold
      ) {
        index = Math.max(index - 1, 0);
      }
      apply();
    };

    const getEventX = (e) =>
      e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const getEventY = (e) =>
      e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    const setTranslate = (px) => {
      track.style.transform = `translateX(${-px}px)`;
    };

    viewport.addEventListener("touchstart", onDragStart, { passive: true });
    viewport.addEventListener("touchmove", onDragMove, { passive: false });
    viewport.addEventListener("touchend", onDragEnd, { passive: true });
    viewport.addEventListener("touchcancel", onDragEnd, { passive: true });
    viewport.addEventListener("mousedown", onDragStart);
    viewport.addEventListener("mousemove", onDragMove);
    viewport.addEventListener("mouseup", onDragEnd);
    viewport.addEventListener("mouseleave", onDragEnd);

    track.querySelectorAll("img, a").forEach((el) => {
      el.addEventListener("dragstart", (e) => e.preventDefault());
    });

    viewport.addEventListener(
      "click",
      (e) => {
        if (isLinkBlocked) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      { capture: true },
    );
  }

  init() {
    if (this.style <= 2) {
      const carousels = document.querySelectorAll(
        `.carousel.style-${this.data.carou.style}`,
      );
      if (carousels) carousels.forEach((el) => el.remove());

      this.render();
      this.initElements();
    }
  }

  renderSkeleton(carousel, data, isCardStyle = true) {
    const track = carousel.querySelector(".carousel__track");
    const cardsLoading = [];
    const skeletonCount = data.length;

    if (!track) return;

    track.innerHTML = "";
    track.style.transition = `none`;
    track.style.transform = "translateX(0)";

    setTimeout(() => {
      track.style.transition = ``;
    }, 0);

    for (let i = 0; i < skeletonCount; i++) {
      const li = document.createElement("li");
      li.classList.add("skeleton-card");
      li.id = "id_" + (Math.random() * 10000).toFixed(0);
      li.innerHTML = `
      <div class="skeleton skeleton-img" style="${!isCardStyle ? "aspect-ratio: auto 3/4;" : ""}"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
      <div class="skeleton skeleton-price"></div>
      `;

      cardsLoading.push(li);
      track.append(li);
    }
    return cardsLoading;
  }
}
