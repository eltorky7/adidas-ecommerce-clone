import { UIHelper } from "/JS/components/helpers.js";

class Zoom {
  constructor(element, isSpecial) {
    this.isSpecial = isSpecial;
    this.container = element;
    this.img = this.container.querySelector("img");
    this.icon = this.container.querySelector(".zoom-icon");
    this.basicsPhotos =
      document.querySelectorAll(
        ".left-section .gallery .container-gallery > .product-photo-container",
      ) || "";

    if (!this.img) return;

    this.mouseX = 0;
    this.mouseY = 0;
    this.isActive = false;

    // متغير عشان نعرف نوع الإدخال الحالي (لمس ولا ماوس)
    this.isTouch = false;
    this.lastTouchTime = 0;

    this.handleEnter = this.handleEnter.bind(this);
    this.handleLeave = this.handleLeave.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.update = this.update.bind(this);

    this.init();
  }

  // دالة مساعدة تجيب الإحداثيات سواء ماوس أو تاتش
  getAxis(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  update() {
    if (!this.isActive) return;
    const rect = this.container.getBoundingClientRect();
    let x = this.mouseX - rect.left;
    let y = this.mouseY - rect.top;

    if (x < -2 || x > rect.width + 2 || y < -2 || y > rect.height + 2) {
      this.handleLeave();
      return;
    }

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    if (this.img.dataset.type === "special") {
      this.img.style.transformOrigin = `${x - this.img.clientWidth / 2}px ${y}px`;
    } else {
      this.img.style.transformOrigin = `${x}px ${y}px`;
    }

    // بنخفي الأيقونة لو احنا شغالين تاتش
    if (this.icon && !this.isTouch) {
      if (this.isSpecial) {
        this.icon.style.left = `${this.mouseX}px`;
        this.icon.style.top = `${this.mouseY}px`;
      } else {
        this.icon.style.left = `${x}px`;
        this.icon.style.top = `${y}px`;
      }
    }
  }

  handleEnter(e) {
    if (e.type.includes("touch")) {
      this.lastTouchTime = Date.now();
      this.isTouch = true;
    } else {
      if (Date.now() - this.lastTouchTime < 500) return;

      this.isTouch = false;
    }

    this.isActive = true;
    if (this.isSpecial || this.basicsPhotos.length < 2) {
      this.img.style.transform = "scale(2)";
    } else this.img.style.transform = "scale(4)";

    this.img.style.animation = "";

    // الأيقونة تظهر بس لو هو ماوس حقيقي
    if (this.icon && !this.isTouch) this.icon.style.opacity = "1";

    // باقي الكود زي ما هو ...
    const axis = this.getAxis(e);
    this.mouseX = axis.x;
    this.mouseY = axis.y;

    window.addEventListener("scroll", this.update, { passive: true });
    window.addEventListener("mousemove", this.handleMove, { passive: true });

    window.addEventListener("touchmove", this.handleMove, { passive: false });
    window.addEventListener("touchend", () => {
      this.handleLeave(false, true);
    });

    this.update();
  }

  handleMove(e) {
    const axis = this.getAxis(e);

    if (e.cancelable && e.type.includes("touch")) {
      e.preventDefault();
    }

    // تحديث المخزن
    this.mouseX = axis.x;
    this.mouseY = axis.y;

    this.update();
  }

  handleLeave(isSpecial, hasZoom) {
    this.isActive = false;
    this.isTouch = false;
    if (isSpecial) {
      window.removeEventListener("mousemove", this.onHoverProdut);
    } else {
      window.removeEventListener("mousemove", this.handleMove);
    }

    if (this.icon && !isSpecial) this.icon.style.opacity = "0";

    window.removeEventListener("scroll", this.update);
    window.removeEventListener("touchmove", this.handleMove);
    window.removeEventListener("touchend", this.handleLeave);

    if (hasZoom) {
      this.img.style.transformOrigin = `${this.mouseX} ${this.mouseY}`;
      this.img.style.animation = "zoom 0.2s";
      this.img.style.transform = "scale(1)";
    }
  }

  zoomByClick() {
    this.iconCursor = this.icon.children[0];

    this.container.addEventListener(
      "click",
      (e) => {
        if (e.pointerType === "touch") return;

        this.isActive = !this.isActive;
        if (this.isActive) {
          this.iconCursor.className = `fa-solid fa-minus`;
          this.handleEnter(e);
        } else {
          this.iconCursor.className = `fa-solid fa-plus`;
          this.handleLeave(true, true);
        }
      },
      { passive: true },
    );
  }

  onHoverProdut(e) {
    const axis = this.getAxis(e);
    this.mouseX = axis.x;
    this.mouseY = axis.y;

    if (this.icon && !this.isTouch) this.icon.style.opacity = "1";

    const rect = this.container.getBoundingClientRect();
    let x = this.mouseX - rect.left;
    let y = this.mouseY - rect.top;
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));
    if (this.icon && !this.isTouch) {
      if (this.isSpecial) {
        // لو شاشة كبيرة، الأيقونة بتاخد إحداثيات الماوس الصافية على الشاشة
        this.icon.style.left = `${this.mouseX}px`;
        this.icon.style.top = `${this.mouseY}px`;
      } else {
        // لو شاشة صغيرة، الأيقونة بتاخد الإحداثيات بالنسبة للصورة
        this.icon.style.left = `${x}px`;
        this.icon.style.top = `${y}px`;
      }
    }
  }

  init() {
    this.isActive = false;

    if (this.isSpecial) {
      this.icon =
        this.container.querySelector(".zoom-icon-two") ||
        document.querySelector(".zoom-icon-two");

      this.container.addEventListener(
        "mousemove",
        this.onHoverProdut.bind(this),
      );

      this.container.addEventListener("mouseleave", () => {
        this.iconCursor.className = `fa-solid fa-plus`;

        if (this.isActive) {
          this.handleLeave(false, true);
        } else this.handleLeave(false, false);
      });

      this.zoomByClick();
      return;
    }

    // Mouse Events
    this.container.addEventListener("mouseenter", this.handleEnter);
    this.container.addEventListener("mouseleave", () => {
      this.handleLeave(false, true);
    });

    // Touch Events
    this.container.addEventListener("touchstart", this.handleEnter, {
      passive: false,
    });
  }
}

export class ProductGallery {
  constructor(containerId, containerGalleryId, btnId) {
    this.allImages = null;
    this.gallery = document.getElementById(containerGalleryId);
    this.containerTemp = document.getElementById(containerId);
    this.btn = document.getElementById(btnId);
    this.matchMedia = window.matchMedia(`(max-width: 1024px)`);
    this.limit = 4;

    if (!this.containerTemp || !this.btn || !this.gallery) return;

    this.start = this.init;
  }

  init(images) {
    const viewSize = document.documentElement.clientWidth;
    if (viewSize <= 1024) this.limit = 2;

    this.matchMedia.addEventListener("change", (e) => {
      if (e.matches) this.limit = 2;
      else this.limit = 4;
      this.isExpanded = false;
      this.updateView();
    });

    this.isExpanded = false;
    this.allImages = images;
    if (!this.allImages) return;

    this.gallery.innerHTML = "";

    if (this.allImages.length <= this.limit) {
      this.btn.style.display = "none";
      this.render(this.allImages);
      return;
    }

    this.updateView();

    this.btn.onclick = () => {
      this.toggle();
    };
  }

  updateView() {
    const imagesToShow = this.isExpanded
      ? this.allImages.slice(this.limit)
      : this.allImages.slice(0, this.limit);

    this.render(imagesToShow, !this.isExpanded);

    if (this.isExpanded) {
      window.scrollTo({
        left: 0,
        top: this.scroll,
        behavior: "instant",
      });
    } else {
      window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    }
    const img = document.createElement("img");
    img.src = "/images/icons/arrow_top25.svg";

    this.btn.innerHTML = this.isExpanded
      ? "<span>Show Less</span>"
      : "<span>Show More</span>";
    this.btn.append(img);
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
    this.btn.classList.toggle("active");
    this.scroll = scrollY;
    this.updateView();
  }

  render(images, isMore) {
    if (isMore) this.gallery.innerHTML = "";
    images.forEach(
      (imgUrl, index) => {
        index = isMore ? index : index + this.limit;
        const container = this.containerTemp.content.cloneNode(true);
        const item = container.querySelector(".product-photo-container");

        item.setAttribute("data-index", index);
        const type = imgUrl.includes("webm") || imgUrl.includes("mp4");
        const video = container.querySelector("video");
        const img = container.querySelector("img.photo");

        if (type) {
          img.remove();
          video.src = imgUrl;
          video.addEventListener("click", (e) => {
            if (!e.currentTarget.paused) {
              e.currentTarget.pause();
            } else {
              e.currentTarget.play();
            }
          });
        } else {
          video.remove();
          img.src = imgUrl;
        }

        this.gallery.appendChild(container);
      },
      { passive: true },
    );
    const container = document.querySelector(
      ".left-section .gallery .container-gallery",
    );

    if (!container) return;

    if (images.length < 2) container.style.gridTemplateColumns = "1fr";
    else container.style.gridTemplateColumns = "";

    this.addZoom();
  }

  addZoom() {
    const photoContainers = document.querySelectorAll(
      ".product-photo-container",
    );

    const images = document.querySelectorAll(".product-photo-container .photo");
    images.forEach((img) => {
      img.addEventListener("dragstart", (e) => e.preventDefault());
    });
    // 2. لف عليهم وشغل الزوم لكل واحد
    photoContainers.forEach((container) => {
      new Zoom(container);
    });
  }
}

export class Accordion {
  constructor(accordionId) {
    this.accordion = document.getElementById(accordionId);

    this.form = document.querySelector("form.my-review");
    this.allForms = document.querySelectorAll(`.sec-form`);
    this.focus = document.querySelector(".focus");
    this.focusTwo = document.querySelector(".focus-two");

    this.itemDesc = this.accordion.querySelector("#ac-desc");
    this.itemDetails = this.accordion.querySelector("#ac-details");
    this.itemReviews = this.accordion.querySelector("#ac-reviews");
    this.state = false;
    this.targetText = "?color=";
    this.imagesView = null;
    this.colorId = null;
    this.SORT_TYPES = {
      RELEVANT: 0,
      HIGH_TO_LOW: 1,
      LOW_TO_HIGH: 2,
      MOST_RECENT: 3,
    };
    if (!this.accordion) return;

    this.data = null;
    this.activeStars = 0; // متغير لتخزين تقييم النجوم الحالي

    this.run = this.init;
  }

  async init(data, productId) {
    this.productId = productId;
    this.data = data;

    if (!this.data) return;

    this.onChangeColor();

    this.download();
    this.showAccordion();
  }

  onChangeColor() {
    this.imagesView = this.getImagesColor();
  }

  showAccordion() {
    const headers = this.accordion.querySelectorAll(".accordion-header");
    const accordions = this.accordion.querySelectorAll(".accordion-item");

    this.removeActives(accordions, "show");

    headers.forEach((head) => {
      head.onclick = () => {
        head.parentElement.classList.toggle("show");
      };
    });
  }

  description(accordionTest, isRun) {
    this.onChangeColor();

    if (accordionTest.includes("description") || isRun) {
      this.itemDesc.style.display = "";
      const productName = this.itemDesc.querySelector(".product-name");
      const productSub = this.itemDesc.querySelector(".sub");
      const productDesc = this.itemDesc.querySelector(".description");
      const productPhoto = this.itemDesc.querySelector(".photo img");

      productName.textContent = this.data.name;
      productDesc.textContent = this.data.des;
      productSub.textContent = this.data.sub;

      productPhoto.src = this.imagesView.hover;
    } else this.itemDesc.style.display = "none";
  }

  getImagesColor() {
    let targetColorId = this.data.default_color_id;

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("color")) {
      targetColorId = urlParams.get("color");
    }

    const target = this.data.variants?.find(
      (v) => v.color_id === targetColorId,
    );

    // لو لقاه هيرجع صوره، لو ملقاهوش هيدور على الافتراضي ويرجعه
    if (target && target.images && target.images.other) {
      this.colorId = target.color_id;
      return target.images;
    } else {
      const defaultTarget = this.data.variants?.find(
        (v) => v.color_id === this.data.default_color_id,
      );
      this.colorId = defaultTarget.color_id;
      return defaultTarget.images;
    }
  }

  details(accordionTest) {
    if (accordionTest.includes("details")) {
      this.itemDetails.style.display = "";
      const detailsContainer = this.itemDetails.querySelector(
        ".details-point-container",
      );
      detailsContainer.innerHTML = "";
      this.data.details_point.forEach((point, i, arr) => {
        const li = document.createElement("li");
        li.textContent = point;
        if (i === arr.length - 1) {
          li.textContent += this.data.id;
        }
        detailsContainer.appendChild(li);
      });
    } else this.itemDetails.style.display = "none";
  }

  updateUI() {
    const keys = Object.keys(this.data.allRating).filter(
      (k) => !["allReviews", "rating"].includes(k),
    );

    // تحديث البارات والأرقام الجانبية
    keys.forEach((key) => {
      const count = this.itemReviews.querySelector(`.${key} .rating-count`);
      const colResult = this.itemReviews.querySelector(`.${key} .col-result`);

      const reviewsCount = this.data.allRating[key];
      const allReviews = this.data.allRating.allReviews;

      count.textContent = reviewsCount;
      // حماية من القسمة على صفر
      colResult.style.width =
        allReviews > 0 ? (reviewsCount / allReviews) * 100 + "%" : "0%";
    });

    // حساب المتوسط
    let getRating = () => {
      if (this.data.allRating.allReviews === 0) return 0;
      let result = keys.reduce((acc, curr) => {
        if (curr === "fiveStar") acc += this.data.allRating[curr] * 5;
        if (curr === "fourStar") acc += this.data.allRating[curr] * 4;
        if (curr === "threeStar") acc += this.data.allRating[curr] * 3;
        if (curr === "twoStar") acc += this.data.allRating[curr] * 2;
        if (curr === "oneStar") acc += this.data.allRating[curr] * 1;
        return acc;
      }, 0);

      return result / this.data.allRating.allReviews;
    };

    const ratingNum = getRating();

    const ratingNumContainer = this.itemReviews.querySelector(".rating-num");
    const allReviewsText = this.itemReviews.querySelector(".all-reviews");
    const stars = this.itemReviews.querySelectorAll(".stars .star .result");

    // ترتيب النجوم
    const starsBySorting = Array.from(stars).sort((a, b) => {
      return a.getAttribute("index") - b.getAttribute("index");
    });

    ratingNumContainer.textContent = ratingNum.toFixed(1);
    allReviewsText.textContent = `${this.data.allRating.allReviews} Reviews`;

    // رسم النجوم الصفراء
    starsBySorting.forEach((star, i) => {
      const check = ratingNum - i;
      star.style.width =
        check > 1 ? `100%` : check > 0 ? `${check * 100}%` : `0%`;
    });
  }

  reviews(accordionTest) {
    if (accordionTest.includes("reviews")) {
      this.itemReviews.style.display = "";

      this.updateUI();

      const allStars = this.itemReviews.querySelectorAll(
        ".container-review-product .parent-star",
      );

      this.removeActives(allStars, "active");

      this.refreshStarsActives();

      allStars.forEach((star, i) => {
        if (this.activeStars) {
          if (i < this.activeStars) star.classList.add("active");
        }

        star.addEventListener("mousemove", () => {
          allStars.forEach((s) => s.classList.remove("active"));
          for (let i = 0; i < star.getAttribute("index"); i++) {
            allStars[i].classList.add("active");
          }
        });

        star.parentElement.addEventListener("mouseleave", () => {
          allStars.forEach((s, i) => {
            if (this.activeStars) {
              if (i < this.activeStars) s.classList.add("active");
              else s.classList.remove("active");
            } else s.classList.remove("active");
          });
        });

        star.onclick = this.formReview.bind(this);
      });

      //? ---------------AI Sum-----------------
      this.initSummary();

      //? --------------Customer-Rating------------
      this.initCustomerRating();

      //? -------------Show-Reviews----------------
      this.initShowCommentsRating();

      //? -------------Show-Galary-----------------
      this.viewPhotos();

      //? ---------------Filter-----------------
      this.initFilteringComments();

      this.initSortingReviews();
    } else this.itemReviews.style.display = "none";
  }

  refreshStarsActives() {
    let dataLocal = this.getCurrentRouteReview();
    let starsLocal = "";
    if (!dataLocal.hasNew) {
      if (Object.keys(dataLocal).length > 0) {
        starsLocal = dataLocal.formsData[0]
          ? dataLocal.formsData[0].activeStars
          : "";
      } else starsLocal = "";
    }
    this.activeStars = starsLocal || "0";
  }

  initSummary() {
    const showMoreOrLess = this.accordion.querySelector(".summary .show");
    const summaryContent = this.accordion.querySelector(
      ".summary .summary-content",
    );
    const text = `The shoes have a classic and stylish design that is comfortable and versatile. Reviewers praise the good arch support and soft suede uppers, though some note the shoes run slightly large and recommend sizing down. Overall, customers are satisfied with the quality and comfort of the shoes.`;

    const words = text.split(" ");
    const maxWords = 33;

    const like = this.accordion.querySelector(
      ".summary .fa-regular.fa-thumbs-up",
    );
    const disLike = this.accordion.querySelector(
      ".summary .fa-regular.fa-thumbs-down",
    );

    like.onclick = (e) => {
      disLike.classList.replace("fa-solid", "fa-regular");
      if (e.currentTarget.classList.contains("fa-solid")) {
        e.currentTarget.classList.replace("fa-solid", "fa-regular");
      } else {
        e.currentTarget.classList.replace("fa-regular", "fa-solid");
      }
    };

    disLike.onclick = (e) => {
      like.classList.replace("fa-solid", "fa-regular");
      if (e.currentTarget.classList.contains("fa-solid")) {
        e.currentTarget.classList.replace("fa-solid", "fa-regular");
      } else {
        e.currentTarget.classList.replace("fa-regular", "fa-solid");
      }
    };

    summaryContent.textContent = words.slice(0, maxWords).join(" ") + "...";
    showMoreOrLess.textContent = "Show more";

    let isMore = false;
    showMoreOrLess.onclick = () => {
      isMore = !isMore;
      if (isMore) {
        summaryContent.textContent = words.join(" ");
        showMoreOrLess.textContent = "Show less";
      } else {
        summaryContent.textContent = words.slice(0, maxWords).join(" ") + "...";
        showMoreOrLess.textContent = "Show more";
      }
    };
  }

  initCustomerRating() {
    const customerRatings = this.accordion.querySelector(".customer-ratings");
    const qualityPr = this.accordion.querySelector(".quality-result .result");
    const valuePr = this.accordion.querySelector(".value-product .result");
    const qualityN = this.accordion.querySelector(".quality-result .rating-n");
    const valueN = this.accordion.querySelector(".value-product .rating-n");

    if (!this.data.quality_of_product || !this.data.value_of_product) {
      customerRatings.style.display = "none";
      return;
    }
    customerRatings.style.display = "";
    qualityPr.style.width = `${(this.data.quality_of_product / 5) * 100}%`;
    valuePr.style.width = `${(this.data.value_of_product / 5) * 100}%`;

    qualityN.textContent = this.data.quality_of_product;
    valueN.textContent = this.data.value_of_product;
  }

  formReview(e) {
    const btnsNext = this.form.querySelectorAll(".btn-next");
    const btnsEdit = this.form.querySelectorAll(".agent-btn-edit");
    const focus = document.querySelector(".focus");

    focus.classList.add("show");
    focus.animate([{ opacity: "0" }, { opacity: "0.5" }], {
      duration: 400,
      fill: "both",
    });

    if (!this.form) return;

    UIHelper.toggleScroll(true);
    this.form.style.display = "block";
    this.form.animate(
      [
        {
          opacity: 0,
          position: "fixed",
          left: "50%",
          top: "52.5%",
          transform: "translate(-50%, -50%)",
        },
        {
          opacity: 1,
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        },
      ],
      {
        duration: 300,
      },
    );

    const loader = this.form.querySelector(".loading-form");
    const contentElements = this.form.querySelectorAll(
      ".row-one, .mark, .your-reviews, .agent, .message-recently, .sec-form",
    );

    const clearLoading = () => {
      if (loader) loader.style.display = "none";
      this.form.style.overflow = "";
      contentElements.forEach((el) => {
        el.style.transition = "opacity 0.5s ease-in-out";
        el.style.opacity = "";
        el.style.pointerEvents = ""; // رجع التفاعل
      });
    };

    if (loader) loader.style.display = "block";
    this.form.style.overflow = "hidden";
    contentElements.forEach((el) => {
      el.style.transition = "";
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
    });

    if (this.state) {
      clearLoading();
    } else {
      this.state = !this.state;
      setTimeout(() => {
        clearLoading();
      }, 1500);
    }

    const productName = this.form.querySelector(".title .bottom");
    const productPhoto = this.form.querySelector(
      ".intro-title img.photo-review",
    );
    const btnOut = this.form.querySelector(".row-one .btn-out");
    const container = this.form.querySelector(
      ".rating .container-review-product",
    );
    this.stars = this.form.querySelectorAll(
      ".rating .container-review-product .parent-star",
    );
    this.msg = this.form.querySelector(".rating .message");
    const allStars = this.itemReviews.querySelectorAll(
      ".container-review-product .parent-star",
    );

    productName.textContent = this.data.name;
    productPhoto.src = this.imagesView.basic;

    this.activeStars = e.currentTarget.getAttribute("index");
    this.messageActive(this.activeStars);

    this.stars.forEach((star, i) => {
      if (i < this.activeStars) star.classList.add("active");
      else star.classList.remove("active");

      star.addEventListener("mousemove", (e) => {
        this.stars.forEach((star, i) => {
          const indexActive = e.currentTarget.getAttribute("index");
          if (i > indexActive - 1) star.classList.remove("active");
          else star.classList.add("active");
        });
      });

      star.onclick = (e) => {
        this.activeStars = e.currentTarget.getAttribute("index");
        this.messageActive(this.activeStars);
      };

      container.addEventListener("mouseleave", () => {
        for (let i = this.stars.length - 1; i >= 0; i--) {
          if (i > this.activeStars - 1)
            this.stars[i].classList.remove("active");
          else this.stars[i].classList.add("active");
        }
      });
    });

    btnOut.addEventListener(
      "click",
      () => {
        this.refreshStarsActives();
        const allAgents = document.querySelectorAll(".agent");
        allAgents.forEach((a) => a.removeAttribute("isEdit"));

        const anim = this.form.animate(
          [
            {
              opacity: 1,
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            },
            {
              opacity: 0,
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -47.5%)",
            },
          ],
          {
            duration: 400,
          },
        );
        const allForms = this.form.querySelectorAll(`.sec-form`);
        this.recentlyMessage = this.form.querySelector(".message-recently");
        const agent = this.form.querySelector("#agentYR");

        focus.animate([{ opacity: "0.5" }, { opacity: "0" }], {
          duration: 400,
          fill: "both",
        });

        anim.addEventListener("finish", () => {
          UIHelper.toggleScroll(false);
          focus.classList.remove("show");
          this.form.style.display = "none";

          if (agent.classList.contains("completed")) {
            this.recentlyMessage.style.display = "flex";
          }

          allForms.forEach((form) => {
            if (form.classList.contains("recent-active")) {
              form.classList.add("active");
            } else {
              form.classList.remove("active");
            }
          });
        });

        allStars.forEach((s, i) => {
          if (this.activeStars <= i) {
            s.classList.remove("active");
            s.removeAttribute("old");
          } else {
            s.classList.add("active");
            s.setAttribute("old", true);
          }
        });
      },
      { passive: true },
    );

    this.allForms = Array.from(this.allForms);
    this.allForms.push(document.querySelector(".success"));

    this.checkSaveEdit();
    const checkFormOne = this.initInputs();
    this.initFormFiles();
    this.initFormPersonal();
    this.initFormProductRating();
    this.transformFromThis(btnsEdit, btnsNext, checkFormOne, btnOut);
    this.show();
    this.successPopab();
    this.onSubmit();
  }

  initFunctions(btnsEdit, btnsNext, btnOut) {
    this.checkSaveEdit();
    const checkFormOne = this.initInputs();
    this.initFormFiles();
    this.initFormPersonal();
    this.transformFromThis(btnsEdit, btnsNext, checkFormOne, btnOut);
    this.initFormProductRating();
    this.show();
    this.successPopab();
    this.onSubmit();
  }

  saveData(i, agent, isSkippedBtn) {
    this.saveLocal = this.getCurrentRouteReview();

    if (agent) {
      if (!this.saveLocal.agents) this.saveLocal.agents = [];
      this.saveLocal.agents.splice(i, 1, agent.className);
    }

    const form = this.allForms[i];

    if (!this.saveLocal.formsClasses) this.saveLocal.formsClasses = [];

    this.saveLocal.formsClasses.splice(i, 1, form.className);

    if (agent.dataset.parent === "your-reviews" && !isSkippedBtn) {
      if (!this.saveLocal.formsData) {
        this.saveLocal.formsData = [];
        this.saveLocal.formsData[i] = {};
      }

      this.saveLocal.formsData[i].textArea = this.textArea.value;
      this.saveLocal.formsData[i].nickname = this.nickname.value;
      this.saveLocal.formsData[i].reviewInput = this.reviewInput.value;
      this.saveLocal.formsData[i].email = this.email.value;
      this.saveLocal.formsData[i].activeStars = this.activeStars;
      this.saveLocal.formsData[i].checkBox = this.checkbox.checked;
      this.saveLocal.hasNew = false;
    }

    if (agent.dataset.parent === "add-files") {
      this.saveLocal.formsData[i] = structuredClone(this.filesData);
    }

    if (agent.dataset.parent === "personal-info") {
      this.saveLocal.formsData[i] = structuredClone(this.resultPer);
    }

    if (agent.dataset.parent === "product-rating") {
      this.saveLocal.formsData[i] = structuredClone(this.dataPrR);
    }

    this.addAndEditRouteReviews(this.saveLocal);
  }

  addAndEditRouteReviews(target) {
    let routeReviews = localStorage.getItem("routeReviews") || "[]";
    routeReviews = JSON.parse(routeReviews);

    const check = routeReviews.find((r) => r.productId === target.productId);

    if (check) {
      routeReviews = routeReviews.map((r) => {
        if (r.productId === target.productId) return target;
        return r;
      });
    } else routeReviews.push(target);

    localStorage.setItem("routeReviews", JSON.stringify(routeReviews));
  }

  getCurrentRouteReview() {
    let routeReviews = localStorage.getItem("routeReviews") || "[]";
    routeReviews = JSON.parse(routeReviews);

    if (!this.productId || routeReviews.length < 1) {
      return { productId: this.productId || "notFound", hasNew: true };
    } else {
      const item = routeReviews.find((a) => a.productId === this.productId);
      return item
        ? item
        : { productId: this.productId || "notFound", hasNew: true };
    }
  }

  checkSaveEdit() {
    this.textArea = this.form.querySelector(".review-input textarea");
    this.nickname = this.form.querySelector(".nickname .review-title");
    this.reviewInput = this.form.querySelector(
      ".review-title-box .review-title",
    );
    this.email = this.form.querySelector(".email .review-title");
    this.checkbox = this.form.querySelector(`.isAgree input[type="checkbox"]`);
    const popubSuc = document.querySelector(".success");
    const recentMessage = document.querySelector(".message-recently");
    const msgRecent = recentMessage.querySelector("p");

    setTimeout(() => {
      if (!popubSuc.classList.contains("recent-active")) {
        msgRecent.innerText =
          "You have already submitted a review for this product.";
        recentMessage.style.display = "flex";
      } else {
        msgRecent.innerText =
          "You have recently submitted this review. Please add more details about your experience with the product.";
        recentMessage.style.display = "flex";
      }
    }, 0);

    const data = this.getCurrentRouteReview();

    if (data.hasNew) {
      this.writeInput();
      return;
    }

    this.removeActives(this.allForms, "recent-active");

    if (Object.keys(data).length < 1) {
      this.allForms[0].classList.add("active");
      return;
    }

    this.allForms.forEach((form, i) => {
      if (i < data.formsClasses.length) {
        const agent = this.form.querySelector(`#${form.dataset.agent}`);

        if (agent) {
          const state = agent.querySelector(".agent-state");

          agent.className = data.agents[i];

          if (agent.classList.contains("completed")) {
            state.innerText = "Completed";
          } else if (agent.classList.contains("skipped")) {
            state.innerText = "Skipped";
          }
        }

        if (i === data.formsClasses.length - 1) {
          this.removeActives(this.allForms, "active", "recent-active");
          if (this.allForms[i + 1]) {
            this.allForms[i + 1].classList.add("recent-active", "active");
          } else {
            const btnEdit = this.form.querySelector("#agentYR .agent-btn-edit");
            setTimeout(() => {
              btnEdit.click();
            }, 0);
            this.allForms[i].classList.add("recent-active");
          }
        }

        if (form.classList.contains("success")) form.classList.remove("active");

        if (form.classList.contains("your-reviews")) {
          this.textArea.value = data.formsData[0].textArea || "";
          this.nickname.value = data.formsData[0].nickname || "";
          this.reviewInput.value = data.formsData[0].reviewInput || "";
          this.email.value = data.formsData[0].email || "";
          this.checkbox.checked = data.formsData[0].checkBox || false;
        }

        if (i === 1) {
          this.filesData = structuredClone(data.formsData[i]) || this.filesData;
        }

        if (i === 2) {
          this.resultPer = structuredClone(data.formsData[i]) || this.resultPer;
        }

        if (i === 3) {
          this.dataPrR = structuredClone(data.formsData[i]) || this.dataPrR;
        }
      }
    });
  }

  show() {
    this.btnsSkip = Array.from(this.form.querySelectorAll(".btn-skip"));

    let check = false;
    this.btnsNext.forEach((btn) => {
      btn.onclick = (e) => {
        check = this.clearAndCheck(e.target.dataset.parent, false);
        if (check) {
          const agent = this.form.querySelector(`#${e.target.dataset.agent}`);
          this.saveInputs(e.target.dataset.parent);
          const checkCancel = this.form.querySelector(
            `.${e.target.dataset.parent} .btn-cancel`,
          );

          let next = e.target.dataset.next;
          if (checkCancel) next = "recent-active";
          this.showNext(next, agent, true);
          this.saveData(e.currentTarget.dataset.index, agent, false);
          this.writeInput(e.target.dataset.parent);
        }
      };
    });

    this.btnsSkip.forEach((btn) => {
      btn.onclick = (e) => {
        this.clearAndCheck(e.target.dataset.parent, true);
        const agent = this.form.querySelector(`#${e.target.dataset.agent}`);
        if (e.target.dataset.parent === "add-files") {
          this.filesData = [];
        }
        this.renderForms(e.target.dataset.parent);
        this.showNext(e.target.dataset.next, agent, false);
        this.saveData(e.currentTarget.dataset.index, agent, true);
      };
    });

    this.clickEdit();
  }

  showNext(isNext, agent, isComplete, isEdit, isCancel) {
    if (agent) {
      const stateAgent = agent.querySelector(".agent-state");

      if (isComplete) {
        agent.classList.add("completed", "done");
        stateAgent.innerText = "Completed";
      } else {
        stateAgent.innerText = "Skipped";
        agent.classList.add("skipped", "done");
      }
    }

    this.allForms.forEach((f) => {
      if (f.classList.contains(isNext)) {
        if (!isEdit) f.classList.add("recent-active");
        if (!f.dataset.agent && !isCancel) f.classList.add("active");
        else if (f.dataset.agent) f.classList.add("active");
      } else {
        if (!isEdit) f.classList.remove("recent-active");
        f.classList.remove("active");
      }
    });
  }

  transformFromThis(btnsEdit, btnsNext, checkFormOne, btnOut) {
    this.btnsEdit = btnsEdit;
    this.btnsNext = btnsNext;
    this.checkFormOne = checkFormOne;
    this.btnOut = btnOut;
  }

  messageActive(activeStars) {
    switch (activeStars) {
      case "1":
        this.msg.textContent = `${activeStars} out of 5 stars selected. Product is Poor.`;
        break;
      case "2":
        this.msg.textContent = `${activeStars} out of 5 stars selected. Product is Fair.`;
        break;
      case "3":
        this.msg.textContent = `${activeStars} out of 5 stars selected. Product is Average.`;
        break;
      case "4":
        this.msg.textContent = `${activeStars} out of 5 stars selected. Product is Good.`;
        break;
      case "5":
        this.msg.textContent = `${activeStars} out of 5 stars selected. Product is Excellent.`;
        break;
    }
  }

  reActiveStars() {
    this.stars.forEach((star, i) => {
      if (i < this.activeStars) star.classList.add("active");
      else star.classList.remove("active");
    });
    this.messageActive(this.activeStars);
  }

  initInputs() {
    this.textArea = this.form.querySelector(".review-input textarea");
    this.nickname = this.form.querySelector(".nickname .review-title");
    this.reviewInput = this.form.querySelector(
      ".review-title-box .review-title",
    );
    this.email = this.form.querySelector(".email .review-title");
    this.checkbox = this.form.querySelector(`.isAgree input[type="checkbox"]`);

    const btnTerms = this.form.querySelector(`.isAgree span.terms`);
    const termsAndconditions = document.querySelector(".termsAndconditions");
    const btnOutTerms =
      termsAndconditions.querySelectorAll(`button.btn-out-terms`);
    const focus2 = document.querySelector(".focus-two");

    const msgContainer = this.form.querySelectorAll(".mesg-review-input");
    const msgNumber = this.form.querySelectorAll(
      ".mesg-review-input .msg-number",
    );
    const msgWarning = this.form.querySelectorAll(
      ".mesg-review-input .warning span",
    );
    const reviewText = this.form.querySelectorAll(".head-title h3");
    let time = null;

    function scanEmail(el, isReq) {
      const msgWar = Array.from(msgWarning).find((msg) => {
        return msg.getAttribute("parent") == el.getAttribute("parent");
      });
      const reviewTex = Array.from(reviewText).find((text) => {
        return text.getAttribute("parent") == el.getAttribute("parent");
      });

      const msgCont = Array.from(msgContainer).find((msg) => {
        return msg.getAttribute("parent") == el.getAttribute("parent");
      });

      function hiddenStyle() {
        reviewTex.style.color = "";
        msgCont.classList.remove("active");
      }

      function timeOut(time, fn, n) {
        time = setTimeout(() => {
          fn(true);
        }, n);
      }

      clearTimeout(time);

      msgCont.classList.add("active");
      reviewTex.style.color = "rgb(153, 43, 43)";

      const value = el.value;
      const regEx = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
      if (regEx.test(value)) {
        hiddenStyle();
      } else if (value.length > 0) {
        msgWar.textContent = `invalid email`;
      } else if (isReq) {
        msgWar.textContent = `required`;
      } else if (!isReq) {
        timeOut(time, hiddenStyle, 200);
      }
    }

    function scanInput(num, el, isMinimum, isReq) {
      const value = el.value;
      const msgNum = Array.from(msgNumber).find((msg) => {
        return msg.getAttribute("parent") == el.getAttribute("parent");
      });

      const msgWar = Array.from(msgWarning).find((msg) => {
        return msg.getAttribute("parent") == el.getAttribute("parent");
      });
      const reviewTex = Array.from(reviewText).find((text) => {
        return text.getAttribute("parent") == el.getAttribute("parent");
      });

      const msgCont = Array.from(msgContainer).find((msg) => {
        return msg.getAttribute("parent") == el.getAttribute("parent");
      });

      function hiddenStyle(hiddenDisplay) {
        reviewTex.style.color = "";
        msgNum.style.display = "";
        msgCont.classList.remove("active");
        if (hiddenDisplay) {
          msgNum.style.display = "none";
        }
      }

      clearTimeout(time);

      if (isMinimum) {
        if (value.length < num && value.length > 0) {
          const n = num - value.length;
          time = setTimeout(() => {
            msgCont.classList.add("active");
            reviewTex.style.color = "rgb(153, 43, 43)";
            msgWar.textContent =
              n <= 1 ? `${n} character too short` : `${n} characters too short`;
          }, 200);
        } else if (value.length === num) {
          hiddenStyle();
        } else if (value.length <= 0) {
          if (isReq) {
            reviewTex.style.color = "rgb(153, 43, 43)";
            msgCont.classList.add("active");
            msgWar.textContent = `Required`;
            return;
          }
          hiddenStyle();
        } else {
          hiddenStyle(true);
        }
      } else {
        if (value.length > num) {
          el.value = el.value.slice(0, num);
        } else {
          hiddenStyle();
        }
      }
      msgNum.textContent = `${el.value.length}`;
      if (isMinimum) msgNum.textContent += `/${num} minimum`;
      else msgNum.textContent += `/${num} maximum`;
    }

    function outFocus() {
      termsAndconditions.classList.remove("active");
      focus2.classList.remove("active");
    }
    this.textArea.addEventListener("input", (e) => {
      const minimumNumber = 50;
      scanInput(minimumNumber, e.currentTarget, true, false);
    });

    this.reviewInput.addEventListener("input", (e) => {
      const maximumNumber = 50;
      scanInput(maximumNumber, e.currentTarget, false, false);
    });

    this.nickname.addEventListener("input", (e) => {
      const minimumNumber = 4;
      scanInput(minimumNumber, e.currentTarget, true, true);
    });

    this.email.addEventListener("input", (e) => {
      scanEmail(e.currentTarget, true);
    });

    btnTerms.addEventListener(
      "click",
      () => {
        termsAndconditions.classList.add("active");
        focus2.classList.add("active");
      },
      { passive: true },
    );

    focus2.addEventListener("click", outFocus, { passive: true });

    this.checkbox.addEventListener("change", (e) => {
      const parentText = e.currentTarget.getAttribute("parent");
      const parent = this.form.querySelector(`.${parentText}`);
      if (e.currentTarget.checked) {
        parent.classList.remove("active");
      } else {
        parent.classList.add("active");
      }
    });

    btnOutTerms.forEach(
      (btn) => {
        btn.addEventListener("click", () => {
          outFocus();
        });
      },
      { passive: true },
    );

    const checkFormOne = (isAll) => {
      const regEx = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
      const isAgree = this.form.querySelector(".isAgree");

      if (isAll) {
        scanEmail(this.email, true);
        scanInput(4, this.nickname, true, true);
        scanInput(50, this.textArea, true, false);
        scanInput(50, this.reviewInput, false, false);
        isAgree.classList.remove("active");
      } else if (
        this.nickname.value.length >= 4 &&
        regEx.test(this.email.value) &&
        this.checkbox.checked &&
        (this.textArea.value.length >= 50 || this.textArea.value.length < 1)
      ) {
        scanEmail(this.email, true);
        scanInput(4, this.nickname, true, true);
        isAgree.classList.remove("active");

        return true;
      } else {
        if (this.nickname.value.length < 4) {
          scanInput(4, this.nickname, true, true);
        }
        if (!regEx.test(this.email.value)) {
          scanEmail(this.email, true);
        }
        if (!this.checkbox.checked) {
          isAgree.classList.add("active");
        }
        return false;
      }
    };

    return checkFormOne;
  }

  writeInput(classForm) {
    const data = this.getCurrentRouteReview();

    if (data.formsData) {
      if (classForm === "your-reviews") {
        this.textArea.value = structuredClone(data.formsData[0].textArea) || "";
        this.nickname.value = structuredClone(data.formsData[0].nickname) || "";
        this.reviewInput.value = structuredClone(data.formsData[0].reviewInput);
        this.email.value = structuredClone(data.formsData[0].email) || "";
        this.checkbox.checked = structuredClone(data.formsData[0].checkBox);
        this.activeStars = structuredClone(data.formsData[0].activeStars) || "";

        this.reActiveStars();

        this.checkFormOne(true);
      } else if (classForm === "add-files") {
        this.filesData = structuredClone(data.formsData[1]) || [];

        this.renderPhotos();
      } else if (classForm === "personal-info") {
        this.resultPer = structuredClone(data.formsData[2]) || {};
      } else if (classForm === "product-rating") {
        this.dataPrR = structuredClone(data.formsData[3]) || {
          qP: {
            index: -1,
            rating: 0,
          },
          vP: {
            index: -1,
            rating: 0,
          },
          rec: {
            index: -1,
            recommend: "",
          },
        };
      }
    } else {
      this.textArea.value = "";
      this.nickname.value = "";
      this.reviewInput.value = "";
      this.email.value = "";
      this.checkbox.checked = false;

      this.reActiveStars();

      this.filesData = [];

      this.resultPer = {};
      this.dataPrR = {
        qP: {
          index: -1,
          rating: 0,
        },
        vP: {
          index: -1,
          rating: 0,
        },
        rec: {
          index: -1,
          recommend: "",
        },
      };

      const agents = document.querySelectorAll(".my-review .agent");
      this.removeActives(this.allForms, "active", "recent-active");
      this.removeActives(agents, "completed", "skipped", "done");

      let checkTag = false;
      this.allForms = this.allForms.filter((f) => {
        if (f.classList.contains("success") && checkTag) {
          return false;
        } else if (f.classList.contains("success")) {
          checkTag = true;
          return true;
        }
        return true;
      });

      this.allForms[0].classList.add("active", "recent-active");
    }
  }

  saveInputs(classForm) {
    if (classForm === "your-reviews") {
      this.textAreaValue = this.textArea.value;
      this.nicknameValue = this.nickname.value;
      this.reviewInputValue = this.reviewInput.value;
      this.emailValue = this.email.value;
      this.activeStarsValue = this.activeStars;
    } else if (classForm === "add-files") {
      this.filesDataValue = structuredClone(this.filesData);
    } else if (classForm === "personal-info") {
      this.resultPerValue = structuredClone(this.resultPer);
    } else if (classForm === "product-rating") {
      this.dataPrRValue = structuredClone(this.dataPrR);
    }
  }

  renderForms(classForm) {
    switch (classForm) {
      case "your-reviews":
        this.writeInput("your-reviews");
        break;
      case "add-files":
        this.renderPhotos();
        break;
      case "personal-info":
        this.renderPersonal(true);
        break;
      case "product-rating":
        this.renderProdRat(true);
        break;
    }
  }

  clearAndCheck(classForm, isAll) {
    switch (classForm) {
      case "your-reviews":
        return this.checkFormOne(isAll);
      case "add-files":
        return this.checkFormTwo(isAll);
      case "personal-info":
        return this.checkFormThree(isAll);
      case "product-rating":
        return this.checkFormFour(isAll);
      default:
        return true;
    }
  }

  clickEdit() {
    this.btnsEdit.forEach((btn) => {
      btn.onclick = (e) => {
        const classForm = e.target.dataset.parent;
        this.clearAndCheck(classForm, true);
        const form = this.form.querySelector(`.${classForm}`);
        const containerBtn = form.querySelector(
          `.btn-style-modern-container.cancel`,
        );
        const skipBtn = form.querySelector(".btn-skip");
        const tempBtnCancel = document.getElementById("btn-cancel");
        const cloneBtnCancel = tempBtnCancel.content.cloneNode(true);

        if (skipBtn) skipBtn.style.display = "none";
        containerBtn.innerHTML = "";
        containerBtn.appendChild(cloneBtnCancel);

        this.btnsCancel = this.form.querySelectorAll(".btn-cancel");
        this.btnsCancel.forEach((btn) => {
          btn.onclick = () => {
            this.clearAndCheck(classForm, true);
            this.writeInput(classForm);
            this.renderForms(classForm);
            this.showNext("recent-active", "", "", "", true);
          };
        });
        this.showNext(classForm, "", "", true);
      };
    });
  }

  initFormFiles() {
    // تعريف العناصر
    this.guidelines = this.form.querySelector(".btn-guidelines");
    // المربعات الـ 6 الثابتة في الـ HTML
    this.allItemsPh = Array.from(this.form.querySelectorAll(".photo_item"));
    this.countPh = this.form.querySelector(".n");

    // مصفوفة البيانات (هي دي اللي بتتحكم في كل حاجة)
    if (!this.filesData) this.filesData = [];
    // تشغيل القوائم الجانبية
    this.eventGuidelines();

    // الرسم المبدئي
    this.renderPhotos();
  }

  renderPhotos(isSkipped) {
    if (!this.filesData || isSkipped) this.filesData = [];

    // 1. تحديث رقم العداد فوق
    this.countPh.innerText = this.filesData.length;

    // 2. لف على الـ 6 مربعات ونضفهم وابنيهم من الأول
    this.allItemsPh.forEach((item, index) => {
      // أ. تنضيف شامل للمربع (عشان ميفضلش واخد كلاسات قديمة)
      item.className = "photo_item center";
      item.onclick = null; // الغاء أي حدث نقر قديم

      const boxPhoto = item.querySelector(".box-photo");
      const img = item.querySelector(".target-file");
      const inputFileContainer = item.querySelector(".input-file");
      const btnCancel = item.querySelector(".btn-cancel-photo");

      // ب. إعادة تهيئة العناصر الداخلية للحالة الافتراضية
      boxPhoto.style.display = "none";
      img.src = "";
      inputFileContainer.innerHTML = "";
      inputFileContainer.style.display = "none";

      // ج. تحديد حالة المربع بناءً على الـ Index والـ Data

      // --- الحالة الأولى: المربع ده فيه صورة (Downloaded) ---
      if (index < this.filesData.length) {
        item.classList.add("downloaded");

        // عرض الصورة
        img.src = this.filesData[index].src;
        boxPhoto.style.display = "flex";

        item.onclick = () => {
          this.setActiveItem(index);
        };

        // تفعيل زرار الحذف
        btnCancel.onclick = (e) => {
          e.stopPropagation();
          this.deleteImage(index);
        };
      }

      // --- الحالة الثانية: ده مكان الزرار "Add Photo" (المربع اللي عليه الدور) ---
      else if (index === this.filesData.length && this.filesData.length < 6) {
        item.classList.add("add");

        inputFileContainer.style.display = "";

        // رسم زرار الإضافة
        inputFileContainer.innerHTML = `<div class="file">+Photo</div><input type="file" hidden accept="image/*" />`;
        const input = inputFileContainer.querySelector("input");

        // بنحط الحدث على المربع كله عشان اليوزر يضغط في أي حتة
        item.onclick = () => input.click();

        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) this.uploadImage(file);
          this.checkFormTwo(true);
        };
      }

      // --- الحالة الثالثة: مربعات فاضية في الآخر (Inactive) ---
      else {
        // سيبه فاضي ونضيف ومفهوش أي تفاعل
        item.style.cursor = "default";
      }

      const activeIndex = this.filesData.findIndex((_, i) =>
        this.allItemsPh[i].classList.contains("active"),
      );
      this.updateCaptionView(activeIndex);
    });
  }

  // إضافة صورة
  uploadImage(file) {
    const reader = new FileReader();
    reader.onload = () => {
      // ضيف في المصفوفة
      this.filesData.push({
        src: reader.result,
        caption: "",
      });

      // عيد الرسم (تلقائي المربع اللي عليه الدور هيتحول لصورة، واللي بعده هيبقى Add)
      this.renderPhotos();

      // خلي الصورة الجديدة هي الـ Active
      this.setActiveItem(this.filesData.length - 1);
    };
    reader.readAsDataURL(file);
  }

  deleteImage(index) {
    // شيل من المصفوفة (الصور اللي بعدها "هتتزحزح" مكانها تلقائي في المصفوفة)
    this.filesData.splice(index, 1);

    // عيد الرسم (renderPhotos هتشوف المصفوفة الجديدة وترتب المربعات صح)
    this.renderPhotos();

    // لو لسه فيه صور، خلي اللي قبلها Active، لو مفيش فضي الكابشن
    if (this.filesData.length > 0) {
      // const newActive = index > 0 ? index - 1 : 0;
      const newActive = this.filesData.length - 1;
      this.setActiveItem(newActive);
    } else {
      this.updateCaptionView(-1);
    }
  }

  // تغيير البرواز الـ Active
  setActiveItem(index) {
    this.allItemsPh.forEach((item) => item.classList.remove("active"));

    if (this.allItemsPh[index]) {
      this.allItemsPh[index].classList.add("active");
    }
    this.updateCaptionView(index);
  }

  // تحديث الـ Input Caption
  updateCaptionView(index) {
    const containerCaption = this.form.querySelector(".boxCaption");
    containerCaption.innerHTML = "";

    // لو مفيش اندكس (يعني -1) أو الاندكس مش موجود في الداتا.. اخرج
    if (index === -1 || !this.filesData[index]) return;

    // هات التيمبلت وارسمه
    const tempCaption = document
      .getElementById("boxCaption")
      .content.cloneNode(true);
    const input = tempCaption.querySelector("input");

    // حط القيمة المحفوظة
    input.value = this.filesData[index].caption;

    // احفظ اللي بيتكتب فوراً في المصفوفة
    input.oninput = (e) => {
      this.filesData[index].caption = e.target.value;
    };

    containerCaption.appendChild(tempCaption);
  }

  eventGuidelines() {
    const popub = document.querySelector(".guidelines-photo-container");
    const btnsClose = popub.querySelectorAll(
      ".btn-style-modern.guidelines, .btn-exit-guidelines",
    );
    this.guidelines.onclick = () => popub.classList.add("active");
    (this.focusTwo.addEventListener("click", () =>
      popub.classList.remove("active"),
    ),
      { passive: true });
    btnsClose.forEach(
      (btn) => (btn.onclick = () => popub.classList.remove("active")),
    );
  }

  checkFormTwo(isValid) {
    const msgError = this.form.querySelector(".error.addFiles");
    if (isValid) {
      msgError.classList.remove("active");
      return;
    }
    if (this.filesData.length > 0) {
      msgError.classList.remove("active");
      return true;
    }
    msgError.classList.add("active");
    return false;
  }

  initFormPersonal() {
    this.person = this.form.querySelector(".personal-info");
    this.ageItems = Array.from(this.person.querySelectorAll("li.age-item"));
    this.genderItems = Array.from(this.person.querySelectorAll("li.gend-item"));
    this.inputLocation = this.person.querySelector("input");

    if (!this.person || !this.ageItems || !this.genderItems) return;

    if (!this.resultPer) this.resultPer = {};

    this.renderPersonal();
  }

  removeActives(arr, ...wordActive) {
    arr.forEach((ite) => ite.classList.remove(...wordActive));
  }

  renderPersonal(isEdit) {
    if (isEdit) this.writeInput("personal-info");

    this.removeActives(this.ageItems, "clicked");
    this.removeActives(this.genderItems, "clicked");
    this.inputLocation.value = "";

    if (Object.keys(this.resultPer).length > 0) {
      this.selectPersItems();
    }

    this.onClickItemsPer(true);
    this.onClickItemsPer();
  }

  selectPersItems() {
    if (this.resultPer.input) {
      this.inputLocation.value = this.resultPer.input;
    }

    if (this.resultPer.age) {
      this.ageItems[this.resultPer.ageIndex].classList.add("clicked");
    }

    if (this.resultPer.gend) {
      this.genderItems[this.resultPer.gendIndex].classList.add("clicked");
    }
  }

  onClickItemsPer(isAgeItem) {
    this.inputLocation.oninput = (e) => {
      this.resultPer.input = e.target.value;
      this.checkFormThree(true);
    };

    if (isAgeItem) {
      this.ageItems.forEach((ite) => {
        ite.onclick = (e) => {
          e.target.classList.add("clicked");
          this.resultPer.age = e.target.dataset.age;
          this.resultPer.ageIndex = e.target.dataset.index;

          this.renderPersonal();
        };
      });
    } else {
      this.genderItems.forEach((ite) => {
        ite.onclick = (e) => {
          e.target.classList.add("clicked");
          this.resultPer.gend = e.target.dataset.gend;
          this.resultPer.gendIndex = e.target.dataset.index;

          this.renderPersonal();
        };
      });
    }
  }

  isFoundThisForm(n) {
    const data = JSON.parse(localStorage.getItem("routeReviews") || "[]");
    const curr = data.find((r) => r.productId === this.productId);

    if (curr && Object.hasOwn(curr, "formsData")) {
      if (curr.formsData[n]) return curr.formsData[n];
      else return [];
    }

    return [];
  }

  checkFormThree(isValid) {
    const msgError = this.person.querySelector("msg.error.personal");

    this.resultPerValue = this.isFoundThisForm(2);

    function activeMsg() {
      msgError.classList.add("active");
      return false;
    }

    if (isValid) {
      msgError.classList.remove("active");
      return;
    }

    const check =
      JSON.stringify(this.resultPer) === JSON.stringify(this.resultPerValue);

    if (check) {
      return activeMsg();
    }

    if (
      this.resultPer.age ||
      this.resultPer.gend ||
      this.resultPer.input.length > 0
    ) {
      msgError.classList.remove("active");
      return true;
    }
  }

  initFormProductRating() {
    this.productRat = this.form.querySelector(".product-rating");
    this.recItems = Array.from(this.productRat.querySelectorAll(".rec-item"));
    this.qulPrd = this.productRat.querySelector(".qulPrd");
    this.starsQ = Array.from(this.qulPrd.querySelectorAll(".parent-star-two"));
    this.valPrd = this.productRat.querySelector(".valPrd");
    this.starsV = Array.from(this.valPrd.querySelectorAll(".parent-star-two"));

    if (!this.productRat) return;

    if (!this.dataPrR) {
      this.dataPrR = {
        qP: {
          index: -1,
          rating: 0,
        },
        vP: {
          index: -1,
          rating: 0,
        },
        rec: {
          index: -1,
          recommend: "",
        },
      };
    }

    this.renderProdRat();
  }

  eventHovStars(stars, parent) {
    stars.forEach((star) => {
      star.addEventListener("mousemove", (e) => {
        stars.forEach((star, i) => {
          if (i <= e.currentTarget.dataset.index) star.classList.add("active");
          else star.classList.remove("active");
        });
      });
    });

    const index = this.dataPrR[parent.dataset.class].index || 0;
    parent.addEventListener("mouseleave", () => {
      for (let i = stars.length - 1; i >= 0; i--) {
        if (i > index) {
          stars[i].classList.remove("active");
        } else stars[i].classList.add("active");
      }
    });
  }

  renderProdRat(isEdit) {
    if (isEdit) this.writeInput("product-rating");

    this.removeActives(this.starsQ, "active");
    this.removeActives(this.starsV, "active");
    this.removeActives(this.recItems, "clicked");

    this.eventHovStars(this.starsQ, this.qulPrd);
    this.eventHovStars(this.starsV, this.valPrd);

    this.selectData();

    this.onChangeValue();
  }

  onChangeValue() {
    this.starsQ.forEach((star) => {
      star.onclick = (e) => {
        this.dataPrR.qP.index = e.currentTarget.dataset.index;
        this.dataPrR.qP.rating = e.currentTarget.dataset.star;
        this.renderProdRat();
      };
    });
    this.starsV.forEach((star) => {
      star.onclick = (e) => {
        this.dataPrR.vP.index = e.currentTarget.dataset.index;
        this.dataPrR.vP.rating = e.currentTarget.dataset.star;
        this.renderProdRat();
      };
    });

    this.recItems.forEach((rec) => {
      rec.onclick = (e) => {
        this.dataPrR.rec.index = e.currentTarget.dataset.index;
        this.dataPrR.rec.recommend = e.currentTarget.dataset.rec;
        this.renderProdRat();
      };
    });
  }

  reSelectStarsActive(end, allStars) {
    for (let i = allStars.length - 1; i > end; i--) {
      allStars[i].classList.remove("active");
    }
  }

  loopStars(arr, start, end) {
    for (let i = start; i <= end; i++) {
      arr[i].classList.add("active");
    }
  }

  selectData() {
    this.loopStars(this.starsQ, 0, this.dataPrR.qP.index);

    this.loopStars(this.starsV, 0, this.dataPrR.vP.index);
    this.recItems[this.dataPrR.rec.index]?.classList.add("clicked");
  }

  checkFormFour(isValid) {
    const msgError = this.productRat.querySelector("msg.error.msg-pr-error");

    this.dataPrRValue = this.isFoundThisForm(3);

    function activeMsg() {
      msgError.classList.add("active");
      return false;
    }

    if (isValid) {
      msgError.classList.remove("active");
      return;
    }

    const check =
      JSON.stringify(this.dataPrR) === JSON.stringify(this.dataPrRValue);

    if (check) {
      return activeMsg();
    }

    if (
      this.dataPrR.qP.index > -1 ||
      this.dataPrR.vP.index > -1 ||
      this.dataPrR.rec.index > -1
    ) {
      msgError.classList.remove("active");
      return true;
    }

    return activeMsg();
  }

  successPopab() {
    const btnsClose = document.querySelectorAll(".btn-success");
    const parent = document.querySelector(".success");
    const message = document.querySelector(".message");
    if (!btnsClose) return;

    btnsClose.forEach((btn) => {
      btn.onclick = () => {
        this.saveLocal.formsClasses.splice(4, 1, parent.className);
        this.addAndEditRouteReviews(this.saveLocal);
        this.onClickOut(parent, message);
      };

      this.focusTwo.onclick = () => {
        if (!parent.classList.contains("active")) return;
        this.saveLocal.formsClasses.splice(4, 1, parent.className);
        this.onClickOut(parent, message);
        this.addAndEditRouteReviews(this.saveLocal);
      };
    });
  }

  onClickOut(parent, message) {
    parent.classList.remove("active");
    this.btnOut.click();
    setTimeout(() => {
      message.innerText =
        "You have already submitted a review for this product.";
    }, 200);

    let btn = document.createElement("button");
    btn.className = "btn-submit";
    btn.type = "submit";

    this.form.append(btn);

    let sub = this.form.querySelector(".btn-submit");

    sub.click();
    sub.remove();
  }

  check() {
    return this.clearAndCheck("your-reviews");
  }

  //? --------------Submit------------
  onSubmit() {
    this.form.onsubmit = (e) => {
      e.preventDefault(); // 1. منع الريفريش

      if (this.check()) {
        const formData = new FormData(this.form);
        const basicInputs = Object.fromEntries(formData); // الاسم، الايميل، النص

        const newReview = {
          // بيانات أساسية
          id: Date.now(), // Unique ID للريفيو
          date: new Date().toISOString(),
          userId: basicInputs.mail, // هنستخدم الايميل كمعرف للمستخدم

          // بيانات الفورم الأول (Review)
          rating: this.activeStars,
          title: basicInputs.reivew__title || "", // تأكد من الـ name في الـ HTML
          review: basicInputs.review || "",
          nickname: basicInputs.nickname,
          email: basicInputs.mail,
          isRecommended: basicInputs["isAgree?"] === "on",

          // بيانات الفورم الثاني (Images)
          // بناخد نسخة منها عشان متبقاش مرتبطة بالذاكرة
          images: this.filesData ? structuredClone(this.filesData) : [],

          // بيانات الفورم الثالث (Personal Info)
          personalInfo: this.resultPer ? structuredClone(this.resultPer) : {},

          // بيانات الفورم الرابع (Detailed Rating)
          productRating: this.dataPrR ? structuredClone(this.dataPrR) : {},
        };

        // 3. التعامل مع LocalStorage (Read -> Modify -> Save)

        // أ. هات كل المنتجات
        let allProducts = JSON.parse(localStorage.getItem("products")) || [];

        // ب. هات المنتج اللي احنا واقفين عليه دلوقتي وعدل عليه
        const targetProductIndex = allProducts.findIndex(
          (p) => p.id === this.data.id,
        );

        // تحديث العدادات (Rating Counters)

        // تزويد العداد المناسب (مثلاً لو اختار 5 نجوم نزود fiveStar)
        const starMap = [
          "oneStar",
          "twoStar",
          "threeStar",
          "fourStar",
          "fiveStar",
        ];
        const starKeyNew = starMap[this.activeStars - 1];

        if (targetProductIndex !== -1) {
          const isFound = allProducts[targetProductIndex].reviews.some(
            (rev) => {
              return rev.userId === newReview.userId;
            },
          );

          if (isFound) {
            let starIndexOld = -1;
            allProducts[targetProductIndex].reviews = allProducts[
              targetProductIndex
            ].reviews.map((rev) => {
              if (rev.userId === newReview.userId) {
                starIndexOld = rev.rating;
                return newReview;
              } else return rev;
            });

            const starKeyOld = starMap[starIndexOld - 1];

            if (starKeyOld) {
              allProducts[targetProductIndex].allRating[starKeyOld] -= 1;
            }
          } else {
            allProducts[targetProductIndex].reviews.push(newReview);
            allProducts[targetProductIndex].allRating.allReviews += 1;
          }

          if (starKeyNew) {
            allProducts[targetProductIndex].allRating[starKeyNew] += 1;
          }

          // ج. احفظ المصفوفة الكبيرة تاني في المتصفح
          localStorage.setItem("products", JSON.stringify(allProducts));

          // تحديث الداتا اللي شغالة في الصفحة حالياً عشان التغيير يظهر فوراً
          this.data = allProducts[targetProductIndex];
        }

        // 4. تحديث الواجهة فوراً (عشان المستخدم يشوف النتيجة)
        this.updateUI();

        this.dataReviews = structuredClone(this.data.reviews);

        if (this.dataReviews.length === 1) {
          this.initFilteringComments();
          this.initSortingReviews();
        }

        this.eSortBySearch = null;
        this.resultBoxSortStarsRating = [];
        this.filterBySearch.value = "";

        const itemsStars = Array.from(
          this.containerLists.querySelectorAll("li.fn"),
        );

        this.removeActives(itemsStars, "active");
        this.renderResultsSort(true);
        this.test();
        this.runSorting(this.SORT_TYPES.MOST_RECENT);
        this.resetFormsFuncs();

        const items = this.commentsReview.querySelectorAll(".item-review");
        const curr = Array.from(items).find((item) => {
          return item.dataset.user == newReview.email;
        });

        curr?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        console.error("Validation Failed");
      }
    };
  }

  resetFormsFuncs() {
    this.dataPrRValue = null;
    this.dataPrR = null;
    this.resultPer = null;
    this.resultPerValue = null;
  }

  initShowCommentsRating() {
    this.commentsReview = this.accordion.querySelector(".comments-reviews");
    this.dataReviews = structuredClone(this.data.reviews) || [];

    if (!this.commentsReview) return;
    this.renderShowComments();
  }

  renderShowComments(isReDefault) {
    if (isReDefault) {
      this.dataReviews = structuredClone(this.data.reviews);
    }

    this.commentsReview.innerHTML = ``;

    this.currentIndex = 0;
    this.limit = 10;

    if (this.dataReviews.length < 1) {
      this.commentsReview.innerHTML = ``;
      const div = document.createElement("div");
      div.innerText = "Not Found Reviews :(";
      div.style =
        "text-align: center; font-size: 24px; padding: 20px 0; font-family: var(--font-special)";
      this.commentsReview.append(div);
      return;
    }

    const containerComments = document.createElement("div");
    containerComments.className = "container-comments-reviews";

    this.commentsReview.append(containerComments);

    this.btnLoadMore = `<div class="btn-style-modern-container">
        <button class="btn-style-modern btn-load-more-comments center" type="button">Load More</button>
      </div>`;

    this.commentsReview.insertAdjacentHTML("beforeend", this.btnLoadMore);

    this.onclickBtnLoad();

    this.loadMoreReviews();
  }

  onclickBtnLoad() {
    this.btnLoadMoreHTML = this.commentsReview.querySelector(
      ".btn-load-more-comments",
    );
    this.btnLoadMoreHTML.onclick = () => {
      this.loadMoreReviews();
    };
  }

  loadMoreReviews() {
    const container = this.commentsReview.querySelector(
      ".container-comments-reviews",
    );

    if (!container) return;

    const nextReview = this.dataReviews.slice(
      this.currentIndex,
      this.currentIndex + this.limit,
    );

    let newHTML = ``;

    nextReview.forEach((rev, i) => {
      const adidasOrigi = `<div class="item-adidas-origi">
          <div class="container-adidas-origi center">
            <img src="/images/adidas_logo.svg" alt="adidas__logo" />
            <p>Originally posted on adidas.com</p>
          </div>
        </div>`;

      const qualityLine = ` <div class="user-quality-product">
          <h3>Quality of Product</h3>
          <div class="user-quality-result">
            <div class="user-line">
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-result" style="width: ${(rev.productRating.qP.rating / 5) * 100 - 1}%"></div>
            </div>
            <div class="user-rating-n">${Number(rev.productRating.qP.rating).toFixed(1)}</div>
          </div>
        </div>`;

      const valueLine = `<div class="user-value-product">
          <h3>Value Of Product</h3>
          <div class="user-value-result">
            <div class="user-line">
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-result" style="width: ${(rev.productRating.vP.rating / 5) * 100 - 1}%"></div>
            </div>
            <div class="user-rating-n">${Number(rev.productRating.vP.rating).toFixed(1)}</div>
          </div>
        </div>
      </div>`;

      let customRating = ``;

      customRating += rev.productRating.qP.rating > 0 ? qualityLine : "";
      customRating += rev.productRating.vP.rating > 0 ? valueLine : "";

      const parentCustomRating = `<div class="user-custom-rating">${customRating}</div>`;

      let userPhotos = ``;
      this.cs = rev;
      rev.images.forEach((img, index, arr) => {
        if (index === 2) {
          userPhotos += `<li class="item-photo more center" title="Review Photo ${index + 1}" data-index="${index}" data-indexuser="${this.currentIndex + i}"><i class="fa-solid fa-plus"></i><span>${arr.length - index}</span></li>`;
        }
        if (index < 2) {
          userPhotos += `<li class="item-photo" title="Review Photo ${index + 1}" data-index="${index}" data-indexuser="${this.currentIndex + i}">
            <img
              data-index="${index}"
              data-indexuser="${this.currentIndex + i}"
              class="item-img"  
              src="${img.src}"
              alt="user__photo"
            />
          </li>`;
        }
      });

      let userPhotosParent = `<ul class="user-photos-items" data-index="${i}">${userPhotos}</ul>`;

      let stars = ``;
      const classesStars = ["one", "two", "three", "four", "five"];
      for (let i = 0; i < 5; i++) {
        stars += `<li class="star ${classesStars[i]}">
            <span class="result" data-index="${i}" style="width: ${rev.rating - i <= 0 ? 0 : 100}%"></span>
          </li>`;
      }

      const target = `
  <div class="item-review" data-index="${i}" data-user="${rev.email}" data-rating="${rev.rating}">
    <div class="comments-container">
      <div class="comment-left">
        <ul class="user-rating">${stars}</ul>
      <h3 class="user-title">${rev.title}</h3>
      <h4 class="user-nickname">${rev.nickname}</h4>
      <div class="user-date">${this.timeAgo(rev.date)}</div>
      <div class="user-review">${rev.review}</div>
      <div class="user-photos">${userPhotos ? userPhotosParent : ""}</div>
      <div class="adidas-original">${userPhotos ? "" : customRating ? "" : adidasOrigi}</div>
    </div>
    <div class="comment-right ${customRating ? "active" : ""}">${customRating ? parentCustomRating : ""}</div>
  </div>
</div>`;
      newHTML += target;
    });

    container.insertAdjacentHTML("beforeend", newHTML);

    this.currentIndex += this.limit;
    this.refreshSortingCount();
    if (this.currentIndex >= this.dataReviews.length) {
      this.btnLoadMoreHTML.remove();
    }
  }

  viewPhotos() {
    this.viewPhotosParent = document.querySelector(".view-photos");
    const commentsReviews = this.accordion.querySelector(".comments-reviews");
    if (!this.viewPhotosParent) return;

    commentsReviews.onclick = (e) => {
      if (
        e.target.classList.contains("item-photo") ||
        e.target.classList.contains("item-img")
      ) {
        UIHelper.toggleScroll(true);
        this.renderViewPhotos(
          e.target.dataset.indexuser,
          e.target.dataset.index,
        );
      }
    };
  }

  renderViewPhotos(indexUser, indexPhoto) {
    this.viewPhotosParent.innerHTML = "";
    let userData;
    if (this.dataReviews) {
      userData = this.dataReviews.find((_, i) => i == indexUser);
    } else userData = this.data.reviews.find((_, i) => i == indexUser);

    if (!userData) return;
    let userPhotos = ``;

    userData.images.forEach((img, i) => {
      userPhotos += `<li class="photo ${i == indexPhoto ? "active" : ""}" title="Review Photo ${i + 1}" data-index="${i}">
            <img
              src="${img.src}"
              alt="user__photo"
            />
          </li>`;
    });

    let stars = ``;
    const classesStars = ["one", "two", "three", "four", "five"];
    for (let i = 0; i < 5; i++) {
      stars += `<li class="star ${classesStars[i]}">
            <span class="result" data-index="${i}" style="width: ${userData.rating - i <= 0 ? 0 : 100}%"></span>
          </li>`;
    }

    const qualityLine = ` <div class="user-quality-product">
          <h3>Quality of Product</h3>
          <div class="user-quality-result">
            <div class="user-line">
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-result" style="width: ${(userData.productRating.qP.rating / 5) * 100 - 1}%"></div>
            </div>
            <div class="user-rating-n">${Number(userData.productRating.qP.rating).toFixed(1)}</div>
          </div>
        </div>`;

    const valueLine = `<div class="user-value-product">
          <h3>Value Of Product</h3>
          <div class="user-value-result">
            <div class="user-line">
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-rating-square"></div>
              <div class="user-result" style="width: ${(userData.productRating.vP.rating / 5) * 100 - 1}%"></div>
            </div>
            <div class="user-rating-n">${Number(userData.productRating.vP.rating).toFixed(1)}</div>
          </div>
        </div>
      </div>`;

    let customRating = ``;

    customRating += userData.productRating.qP.rating > 0 ? qualityLine : "";
    customRating += userData.productRating.vP.rating > 0 ? valueLine : "";

    const parentCustomRating = `<div class="user-custom-rating">${customRating}</div>`;
    const target = ` <div class="view-photos-item">
                      <div class="view-left">
                        <button class="before btn-view-photos" data-parent="view-photos-item">
                          <i class="fa-solid fa-angle-left"></i>
                        </button>
                        <ul class="view-galary">${userPhotos}</ul>
                        <button class="after btn-view-photos">
                          <i class="fa-solid fa-angle-right"></i>
                        </button>
                      </div>
                      <div class="view-right">
                        <button class="view-right-exit-btn">
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                        <ul class="user-rating rating-view-galary">${stars}</ul>
                        <h3 class="user-title">${userData.title}</h3>
                        <h4 class="user-nickname">${userData.nickname}</h4>
                        <div class="user-date">${this.timeAgo(userData.date)}</div>
                        <div class="user-review">${userData.review}</div>
                        <div class="user-custom-rating-container ${customRating ? "active" : ""}">${customRating ? parentCustomRating : ""}</div>
                      </div>
                    </div>`;

    this.viewPhotosParent.innerHTML = target;
    this.eventViewPhotos();
  }

  activeFocus(isRun) {
    if (isRun) {
      this.focusTwo.classList.add("active");
      this.focusTwo.style.opacity = "0.75";
    } else {
      this.focusTwo.classList.remove("active");
      this.focusTwo.style.opacity = "";
    }
  }

  clearViewPhotos() {
    this.activeFocus(false);
    const ph = this.viewPhotosParent.querySelectorAll(".view-galary .photo");
    ph.forEach((ph) => ph.classList.remove("active"));
    this.viewPhotosParent.innerHTML = "";
  }

  eventOut() {
    const btnExit = this.viewPhotosParent.querySelector(".view-right-exit-btn");
    this.focusTwo.onclick = () => {
      UIHelper.toggleScroll(false);
      this.clearViewPhotos();
    };
    btnExit.onclick = () => {
      UIHelper.toggleScroll(false);
      this.clearViewPhotos();
    };
  }

  hiddenScroll(isEnable) {
    document.body.classList.toggle("no-scroll", isEnable);
    return;
  }

  removeActivesBtns(btn, isEnable) {
    if (isEnable) {
      btn.style.display = "";
      btn.removeAttribute("disabled");
    } else {
      btn.style.display = "none";
      btn.setAttribute("disabled", true);
    }
  }

  btnEditing(opt) {
    if (opt == "clear") {
      this.btnBefore.remove();
      this.btnAfter.remove();
    } else if (opt == "after") {
      let next;
      if (this.activeBtnNow.nextElementSibling) {
        next = this.activeBtnNow.nextElementSibling;

        this.activeBtnNow.classList.remove("active");
        next.classList.add("active");
        this.activeBtnNow = next;
        this.initBtns();
      }
    } else if (opt == "before") {
      let before;
      if (this.activeBtnNow.previousElementSibling) {
        before = this.activeBtnNow.previousElementSibling;

        this.activeBtnNow.classList.remove("active");
        before.classList.add("active");
        this.activeBtnNow = before;
        this.initBtns();
      }
    }
  }

  initBtns() {
    if (this.activeBtnNow.dataset.index <= 0) {
      this.removeActivesBtns(this.btnBefore);
    } else this.removeActivesBtns(this.btnBefore, true);

    if (this.activeBtnNow.dataset.index >= this.ph.length - 1) {
      this.removeActivesBtns(this.btnAfter);
    } else this.removeActivesBtns(this.btnAfter, true);
  }

  btnsGalary() {
    this.ph = this.viewPhotosParent.querySelectorAll(".view-galary .photo");
    this.ph = Array.from(this.ph);

    this.btnBefore = this.viewPhotosParent.querySelector(
      ".before.btn-view-photos",
    );
    this.btnAfter = this.viewPhotosParent.querySelector(
      ".after.btn-view-photos",
    );

    this.activeBtnNow = this.ph.find((photo) =>
      photo.classList.contains("active"),
    );

    this.initBtns();

    if (this.ph.length < 2) this.btnEditing("clear");

    this.btnBefore.onclick = () => this.btnEditing("before");
    this.btnAfter.onclick = () => this.btnEditing("after");
  }

  eventViewPhotos() {
    if (!this.viewPhotosParent.innerHTML) return;

    this.activeFocus(true);

    this.btnsGalary();

    this.eventOut();
  }

  refreshSortingCount() {
    const reviewCount = this.parentFilter?.querySelector(".reviews-count");

    if (!reviewCount) return;

    const start = Math.abs(this.currentIndex - this.limit);
    const end =
      this.limit >= this.dataReviews.length
        ? this.dataReviews.length
        : (this.limit += start);

    if (this.dataReviews) {
      reviewCount.innerText = `${this.dataReviews.length < 1 ? 0 : 1} - ${end} of ${this.dataReviews.length} Reviews`;
    } else {
      reviewCount.innerText = `${this.data.reviews.length < 1 ? 0 : 1} - ${this.data.reviews.length} of ${this.data.allRating.allReviews} Reviews`;
    }
  }

  initFilteringComments() {
    this.parentFilter = this.accordion.querySelector(".filtering-comments");

    const filterHTML = ` <div class="container-filtering">
                        <h3 class="title-filter">Filter Reviews</h3>
                        <div class="row-one">
                          <div class="filter-search">
                            <input
                              class="filter-search-input center"
                              type="text"
                              name="noname"
                              placeholder="Search topics and reviews"
                            />
                            <i class="fa-solid fa-magnifying-glass"></i>
                          </div>
                          <div class="list-filters">
                            <div class="list-rating center func-sort">
                              <div class="title-list rating-list">
                                <h3>Rating</h3>
                                <i class="fa-solid fa-angle-down"></i>
                              </div>
                              <ul class="list-rating-functions func-sort-box">
                                <li class="fn" data-index="0" data-rating="1">
                                  <i class="fa-solid fa-circle-plus"></i
                                  ><span class="fn-name">1 star</span>
                                </li>
                                <li class="fn" data-index="1" data-rating="2">
                                  <i class="fa-solid fa-circle-plus"></i
                                  ><span class="fn-name">2 stars</span>
                                </li>
                                <li class="fn" data-index="2" data-rating="3">
                                  <i class="fa-solid fa-circle-plus"></i
                                  ><span class="fn-name">3 stars</span>
                                </li>
                                <li class="fn" data-index="3" data-rating="4">
                                  <i class="fa-solid fa-circle-plus"></i
                                  ><span class="fn-name">4 stars</span>
                                </li>
                                <li class="fn" data-index="4" data-rating="5">
                                  <i class="fa-solid fa-circle-plus"></i
                                  ><span class="fn-name">5 stars</span>
                                </li>
                              </ul>
                            </div>
                            <div class="list-local center func-sort">
                              <div class="title-list local-list">
                                <h3>Local</h3>
                                <i class="fa-solid fa-angle-down"></i>
                              </div>
                              <ul class="list-local-functions func-sort-box">
                                <li class="fn" data-index="0">
                                  <i class="fa-solid fa-circle-plus"></i
                                  ><span class="fn-name">English</span>
                                </li>
                                <li class="fn" data-index="1">
                                  <i class="fa-solid fa-circle-plus"></i
                                  ><span class="fn-name">English [Egypt]</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div class="result-sorting"></div>
                        </div>
                        <div class="row-two">
                          <div class="numbers-reviews-container">
                            <p class="reviews-count">1 - 3 of 4980 Reviews</p>
                          </div>
                          <div class="sort-reviews">
                            <div class="message-sort">
                              <h3 class="msg-title" data-mesg="message">
                                <i class="fa-solid fa-circle-exclamation"></i
                                >Relevancy Info
                              </h3>
                              <div class="message">
                                <button class="out-msg">
                                  <i class="fa-solid fa-xmark"></i>
                                </button>
                                <strong>Relevancy sort</strong>puts the best
                                reviews at the top. We look at things like
                                helpfulness votes, latest reviews, pictures and
                                other traits that readers look for in their
                                reviews.
                              </div>
                            </div>
                            <div class="sort-container">
                              <div class="sort-title">
                                <span class="text">Sort by: Most Relevant</span>
                                <i class="fa-solid fa-angle-down"></i>
                              </div>
                              <ul class="sort-functions func-sort">
                                <li class="fn" data-sort="0">
                                  <i class="fa-solid fa-check"></i
                                  ><span class="fn-name">Most Relevant</span>
                                </li>
                                <li class="fn" data-sort="1">
                                  <i class="fa-solid fa-check"></i
                                  ><span class="fn-name"
                                    >Highest to Lowest Rating</span
                                  >
                                </li>
                                <li class="fn" data-sort="2">
                                  <i class="fa-solid fa-check"></i
                                  ><span class="fn-name"
                                    >Lowest to Highest Rating</span
                                  >
                                </li>
                                <li class="fn" data-sort="3">
                                  <i class="fa-solid fa-check"></i
                                  ><span class="fn-name">Most Recent</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>`;

    if (!this.parentFilter) return;

    if (this.dataReviews.length < 1) {
      this.parentFilter.innerHTML = ``;
      return;
    }
    this.parentFilter.innerHTML = structuredClone(filterHTML);

    this.refreshSortingCount();
    this.initFunctionsSorting();
  }

  initFunctionsSorting() {
    this.timeSearchSortingComments = null;

    this.filterBySearch = this.parentFilter.querySelector(
      ".filter-search-input",
    );

    this.containerLists = this.parentFilter.querySelector(".list-filters");

    //* Sort By Search :
    this.filterBySearch.addEventListener(
      "input",
      this.sortBySearch.bind(this),
      {
        passive: true,
      },
    );

    //* Sort By Lists :
    this.containerLists.addEventListener("click", this.sortByLists.bind(this), {
      passive: true,
    });
  }

  sortBySearch(e) {
    this.eSortBySearch = e.currentTarget;

    clearTimeout(this.timeSearchSortingComments);
    this.timeSearchSortingComments = setTimeout(() => {
      this.test();
      this.runSorting();
    }, 200);
  }

  sortByLists(e) {
    if (e.target.classList.contains("fn")) {
      e.target.classList.toggle("active");
      this.renderResultsSort();
      this.test();
      this.runSorting();
      this.refreshSortingCount();
    }
  }

  test() {
    // 1. تجهيز القيم بره اللوب
    const searchValue = this.eSortBySearch?.value?.trim().toLowerCase() || "";
    const hasRatingFilter = this.resultBoxSortStarsRating?.length > 0;

    // 2. الفلترة في خطوة واحدة نظيفة
    this.dataReviews = this.data.reviews.filter((rev) => {
      // هل الريفيو ده يطابق البحث؟ (لو مفيش بحث اعتبره مطابق)
      const matchesSearch =
        searchValue === "" || rev.review.toLowerCase().includes(searchValue);

      // هل الريفيو ده يطابق النجوم؟ (لو مفيش فلتر نجوم اعتبره مطابق)
      const matchesRating =
        !hasRatingFilter || this.resultBoxSortStarsRating.includes(rev.rating);

      // لازم الشرطين يتحققوا سوا
      return matchesSearch && matchesRating;
    });
    // 3. التحكم في العرض
    // لو مفيش أي فلاتر خالص، رجع الداتا الأصلية (Reset)
    if (searchValue === "" && !hasRatingFilter) {
      this.renderShowComments(true);
    } else {
      // لو فيه فلاتر (حتى لو النتيجة صفر)، اعرض النتيجة المتفلترة
      this.renderShowComments();
    }
  }

  renderResultsSort(onSub) {
    const resultSorting = this.parentFilter.querySelector(".result-sorting");
    const allItemsSortListIcon = this.containerLists.querySelectorAll(".fn i");
    this.allItemsSortListStars = this.containerLists.querySelectorAll(
      ".list-rating-functions .fn",
    );
    this.allItemsSortListLocal = this.containerLists.querySelectorAll(
      ".list-local-functions .fn",
    );

    allItemsSortListIcon.forEach(
      (ite) => (ite.className = "fa-solid fa-circle-plus"),
    );

    resultSorting.innerHTML = ``;

    if (onSub) return;

    this.resultBoxSortStars = Array.from(
      this.containerLists.querySelectorAll(".list-rating-functions .fn.active"),
    );

    this.resultBoxSortStarsRating = this.resultBoxSortStars.map(
      (ite) => ite.dataset.rating,
    );

    this.resultBoxSortLocal = Array.from(
      this.containerLists.querySelectorAll(".list-local-functions .fn.active"),
    );

    if (
      this.resultBoxSortStars.length < 1 &&
      this.resultBoxSortLocal.length < 1
    )
      return;

    let resultItems = "";

    resultItems += this.removeAndAdd(
      this.resultBoxSortStars,
      "stars",
      false,
      false,
    );

    resultItems += this.removeAndAdd(
      this.resultBoxSortLocal,
      "local",
      true,
      false,
    );

    resultSorting.innerHTML = `<div class="container-result-sorting">${resultItems}</div>`;

    this.onclickItemsListsResult();
  }

  onclickItemsListsResult() {
    const containerResultSorting = this.parentFilter.querySelector(
      ".container-result-sorting",
    );

    containerResultSorting.onclick = (e) => {
      if (e.target.classList.contains("result-sort")) {
        if (e.target.dataset.parent === "stars") {
          this.allItemsSortListStars[e.target.dataset.index].click();
        } else {
          this.allItemsSortListLocal[e.target.dataset.index].click();
        }
        this.runSorting();
      } else if (e.target.classList.contains("result-clear-all")) {
        this.removeAndAdd(this.allItemsSortListStars, "", "", true);
        this.removeAndAdd(this.allItemsSortListLocal, "", "", true);
        this.renderResultsSort();
        this.test();
        this.runSorting();
      }
    };
  }

  removeAndAdd(arr, parent, isEnd, isClean) {
    let resultItems = ``;

    if (isClean) {
      arr.forEach((ite) => ite.classList.remove("active"));
    } else {
      arr.forEach((item) => {
        item.querySelector("i").className = "fa-solid fa-circle-check";
        resultItems += `<div class="result-sort center" data-parent="${parent}" data-index="${item.dataset.index}">${item.innerText}</div>`;
      });

      if (isEnd) {
        resultItems += `<div class="result-clear-all center">clear all</div>`;
      }
      return resultItems;
    }
  }

  //* Start Filter Part 2
  initSortingReviews() {
    this.containerReviewsSorting =
      this.accordion.querySelector(".sort-reviews");

    if (!this.containerReviewsSorting) return;

    this.allItemsSorting = Array.from(
      this.containerReviewsSorting.querySelectorAll(".func-sort li.fn"),
    );

    this.allItemsSorting[0].classList.add("select");

    this.eventClickChilderns();
  }

  eventClickChilderns() {
    const mesg = this.containerReviewsSorting.querySelector(".message");
    const btnMesg = mesg.querySelector("button.out-msg");
    const allItems =
      this.containerReviewsSorting.querySelectorAll(".func-sort .fn");

    this.selectedNow = ``;
    btnMesg.onclick = () => {
      mesg.classList.remove("active");
    };

    this.containerReviewsSorting.onclick = (e) => {
      if (e.target.classList.contains("msg-title")) {
        mesg.classList.add("active");
      }

      if (e.target.classList.contains("fn")) {
        this.removeActives(allItems, "select");
        e.target.classList.add("select");
        this.selectedNow = e.target;
        this.runSorting();
      }
    };
  }

  reSorting(fn, parentMsg) {
    let title = this.containerReviewsSorting.querySelector(
      ".sort-container .text",
    );

    if (fn > 0) {
      parentMsg.style.display = "none";
    }
    if (fn == 0) {
      parentMsg.style.display = "";
      title.innerText = "Sort by: Most Relevant";

      this.test();
    } else if (fn == 1) {
      title.innerText = "Sort by: Highest to Lowest Rating";

      this.dataReviews = this.dataReviews.sort((a, b) => {
        return b.rating - a.rating;
      });
    } else if (fn == 2) {
      title.innerText = "Sort by: Lowest to Highest Rating";

      this.dataReviews = this.dataReviews.sort((a, b) => {
        return a.rating - b.rating;
      });
    } else if (fn == 3) {
      this.removeActives(this.allItemsSorting, "select");

      this.allItemsSorting
        .find((ite) => ite.dataset.sort == 3)
        .classList.add("select");
      title.innerText = "Sort by: Most Recent";

      this.dataReviews = this.dataReviews.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    }

    this.renderShowComments();
  }
  runSorting(onSub) {
    if (onSub) {
      this.selectedNow = this.allItemsSorting[onSub];
    }
    const nSort = this.selectedNow.dataset?.sort || "";
    const parentMsg =
      this.containerReviewsSorting.querySelector(".message-sort");

    this.reSorting(nSort, parentMsg);
  }

  timeAgo(dateString) {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    const date = new Date(dateString);
    const now = new Date();

    const diffInSeconds = Math.round((date - now) / 1000);

    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 365 * day;

    const absSeconds = Math.abs(diffInSeconds);

    if (absSeconds < 30) {
      return "Just now";
    } else if (absSeconds < minute) {
      // لو أقل من دقيقة
      return rtf.format(Math.round(diffInSeconds), "second");
    } else if (absSeconds < hour) {
      // لو أقل من ساعة (اقسم على 60 ثانية)
      return rtf.format(Math.round(diffInSeconds / minute), "minute");
    } else if (absSeconds < day) {
      // لو أقل من يوم (اقسم على 3600 ثانية)
      return rtf.format(Math.round(diffInSeconds / hour), "hour");
    } else if (absSeconds < month) {
      // لو أقل من شهر (اقسم على ثواني اليوم)
      return rtf.format(Math.round(diffInSeconds / day), "day");
    } else if (absSeconds < year) {
      // لو أقل من سنة
      return rtf.format(Math.round(diffInSeconds / month), "month");
    } else {
      // لو سنين
      return rtf.format(Math.round(diffInSeconds / year), "year");
    }
  }

  download() {
    const accordionTest = this.data.accordion.map((ac) => ac.toLowerCase());

    this.description(accordionTest);
    this.details(accordionTest);
    this.reviews(accordionTest);
  }
}

export class ViewGallery {
  constructor(containerId) {
    this.images = null;
    this.container = document.getElementById(containerId);
    this.viewport = null;
    this.items = null;
    this.run = this.init;

    //*------------------

    this.index = 0;
    this.maxIndex = 0;
    this.startTranslate = 0;
    this.maxTranslate = 0;
    this.step = 0;
    this.dots = null;

    if (!this.container) {
      this.createContainer(containerId);
    }
  }

  init(data) {
    this.images = data;

    if (!this.images) return;

    this.render();
    this.viewport = this.container.querySelector(".viewport-view-st-two");
    this.track = this.container.querySelector(".track-view-st-two");
    this.items = this.container.querySelectorAll(".track-view-st-two li");
    this.prevBtn = document.querySelector(".btn-next-by-carousel.prev");
    this.nextBtn = this.container.querySelector(".btn-next-by-carousel.next");
    this.dotsElemtnts = this.container.querySelectorAll(
      ".container-dots-view-st-two li",
    );
    this.cursor = document.querySelector(".zoom-icon-two");
    this.btnExit = this.container.querySelector(".btn-ph-st-two-exit");

    this.prevBtn.onclick = () => {
      this.index = Math.max(this.index - 1, 0);
      this.apply();
    };

    this.nextBtn.onclick = () => {
      this.index = Math.min(+this.index + 1, this.maxIndex);
      this.apply();
    };

    let t = null;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        this.measure();
        this.apply();
      }, 100);
    });

    Array.from(this.dotsElemtnts).forEach((dot) => {
      dot.onclick = () => {
        this.index = dot.dataset.index;
        this.apply();
      };
    });

    this.btnExit.onclick = () => {
      this.close();
    };

    this.applayToutch();
    this.onClickVideo();

    this.createZoom();
  }

  onClickVideo() {
    let video = "";
    Array.from(this.items).forEach((ite) => {
      if (ite.dataset.type === "video") {
        video = ite.querySelector("video");
      }
    });
    if (video) {
      video?.addEventListener(
        "click",
        (e) => {
          if (!e.currentTarget.paused) {
            e.currentTarget.pause();
          } else {
            e.currentTarget.play();
          }
        },
        { passive: true },
      );
    }
  }

  measure() {
    const currentFirstSlide = this.items[0];

    if (!currentFirstSlide) {
      this.step = 0;
      this.maxTranslate = 0;
      this.maxIndex = 0;
      return;
    }

    const slideWidth = currentFirstSlide.offsetWidth;
    const singleSlideFullWidth = slideWidth;

    const visibleItems = Math.ceil(
      this.viewport.clientWidth / singleSlideFullWidth,
    );

    this.step = singleSlideFullWidth * Math.max(1, visibleItems);

    this.maxTranslate = Math.max(
      0,
      this.track.scrollWidth - this.viewport.clientWidth,
    );

    this.maxIndex =
      this.step > 0 ? Math.ceil(this.maxTranslate / this.step) : 0;
    this.index = Math.max(0, Math.min(this.index, this.maxIndex));

    if (this.maxIndex >= 0) {
      this.dots = this.container.querySelectorAll(
        ".container-dots-view-st-two li",
      );
      this.checkDots();
    } else {
      this.dots = null;
    }
  }

  checkDots() {
    if (!this.dots) return;
    this.dots.forEach((dot) => dot.classList.remove("active"));
    this.dots[this.index].classList.add("active");
  }

  getTranslate() {
    return Math.min(this.index * this.step, this.maxTranslate);
  }

  checkButtons(translate) {
    const EPS = 0.5;
    if (translate <= EPS) this.prevBtn.classList.remove("active");
    else this.prevBtn.classList.add("active");

    if (translate >= this.maxTranslate - EPS)
      this.nextBtn.classList.remove("active");
    else this.nextBtn.classList.add("active");
  }

  apply() {
    const translate = this.getTranslate();
    this.track.style.transform = `translateX(${-translate}px)`;
    this.checkButtons(translate);
    this.checkDots();
  }

  createContainer(id) {
    const div = document.createElement("div");
    div.className = "view-photos-style-two";
    div.id = id;
    document.body.append(div);
    this.container = document.getElementById("viewPhotosStyleTwo");
  }

  render() {
    let viewDataHTML = {
      itemsHTML: ``,
      dotsHTML: ``,
    };

    this.images.forEach((img, i) => {
      if (img.includes("mp4") || img.includes("webm")) {
        // بنولد رقم عشوائي بناءً على الوقت
        const cacheBuster = Date.now();
        const videoUrl = `${img}?v=${cacheBuster}`;

        viewDataHTML.itemsHTML += `<li class="item" data-index="${i}" data-type="video"><video src="${videoUrl}" data-play="true" autoplay muted loop></video></li>`;
        viewDataHTML.dotsHTML += `<li class="center video" data-index="${i}"><video src="${videoUrl}" data-play="true" muted loop ></video><i class="fa-solid fa-play"></i></li>`;
      } else {
        viewDataHTML.itemsHTML += `<li class="item" data-index="${i}" data-type="img"><img src="${img}" data-type="special"><img/></li>`;
        viewDataHTML.dotsHTML += `<li class="center" data-index="${i}"><img src="${img}"/></li>`;
      }
    });

    let viewHTML = `<div class="parent-view-st-two">
            <div class="zoom-icon-two center"><i class="fa-solid fa-plus"></i></div>
            <button class="btn-ph-st-two-exit">
              <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="viewport-view-st-two">
              <button class="btn-next-by-carousel prev" type="button"></button>
              <ul class="track-view-st-two">${viewDataHTML.itemsHTML}</ul>
              <button class="btn-next-by-carousel next" type="button"></button>
            </div>
            <div class="dots-view-st-two center">
              <ul class="container-dots-view-st-two">${viewDataHTML.dotsHTML}</ul>
            </div>
          </div>`;
    this.container.innerHTML = viewHTML;
  }

  createZoom() {
    const allItems = this.container.querySelectorAll(`.track-view-st-two li`);
    allItems.forEach((ch) => {
      new Zoom(ch, true);
    });
  }

  applayToutch() {
    this.isDragging = false;
    this.lockAxis = null;
    this.startX = 0;
    this.lastX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.isLinkBlocked = false;

    this.viewport.addEventListener("touchstart", this.onDragStart.bind(this), {
      passive: true,
    });
    this.viewport.addEventListener("touchmove", this.onDragMove.bind(this), {
      passive: false,
    });
    this.viewport.addEventListener("touchend", this.onDragEnd.bind(this), {
      passive: true,
    });
    this.viewport.addEventListener("touchcancel", this.onDragEnd.bind(this), {
      passive: true,
    });

    // Mouse Events (الجديد)
    this.viewport.addEventListener("mousedown", this.onDragStart.bind(this));
    this.viewport.addEventListener("mousemove", this.onDragMove.bind(this));
    this.viewport.addEventListener("mouseup", this.onDragEnd.bind(this));
    this.viewport.addEventListener("mouseleave", this.onDragEnd.bind(this)); // عشان لو الماوس خرج بره العنصر وهو دايس

    //!---------------------------

    this.viewport.addEventListener(
      "click",
      (e) => {
        if (this.isLinkBlocked) {
          e.stopPropagation(); // امنع الحدث إنه يوصل للصورة
          e.preventDefault(); // امنع أي أكشن افتراضي
        }
      },
      { capture: true, passive: false },
    );
  }

  onDragStart(e) {
    if (e.type === "mousedown" && e.button !== 0) return;
    // للتاتش: اتأكد إن مفيش أكتر من صباع
    if (e.type === "touchstart" && e.touches.length !== 1) return;

    this.isDragging = true;
    this.container.classList.add("is-dragging");
    this.isLinkBlocked = false;
    this.lockAxis = null;

    // استخدمنا الدالة الموحدة هنا
    this.startX = this.getEventX(e);
    this.startY = this.getEventY(e);

    this.lastX = this.startX;
    this.startTime = performance.now();
    this.startTranslate = this.getTranslate();

    this.track.style.transition = "none";
  }

  onDragMove(e) {
    if (!this.isDragging || (e.type === "touchmove" && e.touches.length !== 1))
      return;

    if (e.type.includes("mouse")) e.preventDefault();

    const x = this.getEventX(e);

    if (Math.abs(x - this.startX) > 5) this.isLinkBlocked = true;

    const y = this.getEventY(e);

    const dx = x - this.startX;
    const dy = y - this.startY;

    if (!this.lockAxis) {
      this.lockAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }

    if (this.lockAxis === "y") return;

    if (e.cancelable) e.preventDefault(); // للتاتش

    this.lastX = x;
    const raw = this.startTranslate - dx;
    const next = Math.max(0, Math.min(raw, this.maxTranslate));

    this.setTranslate(next);
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.container.classList.remove("is-dragging");

    this.track.style.transition = "";

    const endTime = performance.now();
    const dt = Math.max(1, endTime - this.startTime);
    const dxTotal = this.lastX - this.startX;
    const velocity = dxTotal / dt;

    const distanceThreshold = Math.max(40, this.step * 0.25);
    const velocityThreshold = 0.5;

    if (this.lockAxis === "y") {
      this.apply();
      return;
    }

    if (dxTotal <= -distanceThreshold || velocity <= -velocityThreshold) {
      this.index = Math.min(+this.index + 1, this.maxIndex);
    } else if (dxTotal >= distanceThreshold || velocity >= velocityThreshold) {
      this.index = Math.max(+this.index - 1, 0);
    }

    this.apply();
  }

  getEventX(e) {
    return e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
  }

  getEventY(e) {
    return e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
  }

  setTranslate(px) {
    this.track.style.transform = `translateX(${-px}px)`;
  }

  open(index) {
    UIHelper.toggleScroll(true);
    this.track.style.transition = "none";
    setTimeout(() => {
      this.track.style.transition = "";
    }, 0);
    this.focus = document.querySelector(".focus-two");
    this.focus.classList.add("active");
    this.container.style.display = "block";
    this.container.animate(
      [
        { opacity: "0", translate: "0 -10%" },
        { opacity: "1", translate: "0 0" },
      ],
      {
        duration: 500,
        fill: "both",
        direction: "alternate",
        easing: "linear",
      },
    );

    this.index = index;

    setTimeout(() => {
      this.measure();
      this.apply();
    }, 0);
  }

  close() {
    this.focus.classList.remove("active");
    const anim = this.container.animate(
      [
        { opacity: "1", translate: "0 0" },
        { opacity: "0", translate: "0 -5%" },
      ],
      {
        duration: 200,
        fill: "both",
        direction: "alternate",
        easing: "linear",
      },
    );

    anim.addEventListener("finish", () => {
      UIHelper.toggleScroll();
      this.container.style.display = "";
    });
  }

  remove() {
    this.container.innerHTML = ``;
  }
}

export class MobileGallery {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      this.createContainer();
    }

    this.run = this.init;
  }

  init(images, runDots) {
    if (!images || images.length === 0) return;

    this.images = images;

    this.initContainerGlry(runDots);

    setTimeout(() => {
      this.physicsEvents();
    }, 0);
  }

  createContainer() {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div id="mobileGallery" class="mobile-gallery"></div>`,
    );
    this.container = document.getElementById("mobileGallery");
  }

  initContainerGlry(runDots) {
    let items = ``;
    let dots = ``;

    this.images.forEach((item, index) => {
      if (item.includes("mp4") || item.includes("webm")) {
        const cacheBuster = Date.now();
        const videoUrl = `${item}?v=${cacheBuster}`;
        items += `<video src="${videoUrl}" autoplay="" draggable="false" data-play="true" muted="" loop="" class="item-video item ${index === 0 ? "active" : ""}" data-index="${index}"></video>`;
      } else {
        items += `<img class="item-photo item ${index === 0 ? "active" : ""}" draggable="false" src="${item}" alt="photo ${index + 1}" data-index="${index}"/>`;
      }

      dots += `<div class="dot2 ${index === 0 ? "active" : ""}" data-index="${index}"></div>`;
    });

    const mainDots = `<div class="carousel__dots" aria-label="Carousel pagination" draggable="false" data-carousel-dots="">${dots}</div>`;

    const mainHTML = `
    <div class="container-mobile-gallery" draggable="false">
    <ul class="items-photos" draggable="false">${items}</ul>
    <div class="dots">${runDots ? mainDots : ""}</div>
    </div>
    `;

    this.container.innerHTML = mainHTML;
  }

  physicsEvents() {
    this.parent = this.container.querySelector(".container-mobile-gallery");
    this.containerItems = this.parent.querySelector(".items-photos");
    this.allItems = this.containerItems.querySelectorAll(".item");
    this.allDots = this.parent.querySelectorAll(".carousel__dots .dot2");

    if (!this.allItems) return;

    this.singleSlideFullWidth = this.allItems[0].offsetWidth;
    const visibleItems = Math.ceil(
      this.containerItems.clientWidth / this.singleSlideFullWidth,
    );

    this.rect = this.allItems[0].getBoundingClientRect();
    this.step = this.singleSlideFullWidth * Math.max(1, visibleItems);
    this.maxIndex = this.allItems.length - 1;
    this.index = 0;
    this.isDragging = false;
    this.isScaling = false;
    this.lockAxis = null;
    this.startX = 0;
    this.lastX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.isLinkBlocked = false;
    this.lastTapTime = 0;
    this.isDoubleClick = false;
    this.lastTouchTime = 0;

    window.addEventListener("scroll", () => {
      this.rect = this.allItems[0].getBoundingClientRect();
    });

    window.addEventListener("resize", () => {
      // تحديث الأبعاد فوراً
      this.singleSlideFullWidth = this.allItems[0].offsetWidth;
      this.rect = this.allItems[0].getBoundingClientRect();

      // لازم نلغي الزوم لو اليوزر لف الشاشة عشان الحسابات متضربش
      if (this.isZooming) {
        this.allItems[this.index].style.transform = "";
        this.isZooming = false;
      }
    });

    this.readEvents();
  }

  readEvents() {
    this.parent.addEventListener("dragstart", (e) => {
      e.preventDefault();
    });
    this.parent.addEventListener("touchstart", this.onTouchStart.bind(this), {
      passive: "true",
    });

    this.parent.addEventListener("touchmove", this.onDragMove.bind(this), {
      passive: false,
    });
    this.parent.addEventListener("touchend", this.onDragEnd.bind(this), {
      passive: true,
    });

    this.parent.addEventListener("mousedown", this.onTouchStart.bind(this));

    this.parent.addEventListener("mousemove", this.onDragMove.bind(this), {
      passive: false,
    });

    this.parent.addEventListener("mouseup", this.onDragEnd.bind(this), {
      passive: true,
    });

    this.parent.addEventListener("mouseleave", this.onDragEnd.bind(this), {
      passive: true,
    });
  }

  onTouchStart(e) {
    this.isScaling = false;

    // لو الحدث ماوس، بس إحنا لسه كنا عاملين تاتش من أقل من نص ثانية، يبقى ده "شبح" اخرج وماتعملش حاجة
    if (e.type === "mousedown" && Date.now() - this.lastTouchTime < 500) {
      return;
    }

    // لو الحدث تاتش حقيقي، سجل وقت اللمسة عشان نحمي نفسنا من الماوس اللي هيجي وراها
    if (e.type === "touchstart") {
      this.lastTouchTime = Date.now();
    }

    if (e.target.tagName === "IMG") {
      this.onZoom(e);
    }

    if (e.target.classList.contains("item")) this.onDragStart(e);

    if (e.target.classList.contains("dot2")) {
      this.index = e.target.dataset.index;
      this.applyMove();
    }
  }

  onZoom(e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - this.lastTapTime;
    if (tapLength < 300 && tapLength > 0) {
      this.lastTapTime = 0;
      this.handleZoom(e);
      e.preventDefault();
    }
    this.lastTapTime = currentTime;
  }

  handleZoom(e) {
    this.target = this.allItems[this.index];
    this.isDoubleClick = !this.isDoubleClick;

    if (this.isDoubleClick) {
      // 1. نحسب مكان الضغطة بالبيكسل والنسبة
      const x = this.getEventX(e) - this.rect.left;
      const y = this.getEventY(e) - this.rect.top;

      this.originX = x;
      this.originY = y;

      const xPercent = (x / this.rect.width) * 100;
      const yPercent = (y / this.rect.height) * 100;

      this.target.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      this.target.style.transform = `scale(2) translate(0px, 0px)`;

      this.isZooming = true;
      this.panX = 0;
      this.panY = 0;

      setTimeout(() => {
        this.allItems[this.index].style.transition = "none";
      }, 500);
    } else {
      this.allItems[this.index].style.transition = "";
      // 3. نلغي الزوم ونرجع كل حاجة لاصلها
      this.target.style.transform = ``;
      this.isZooming = false;
      this.panX = 0;
      this.panY = 0;
    }
  }

  setMove(deltaX, deltaY) {
    if (!this.isZooming) return;

    // 1. نجمع الحركة الجديدة
    this.panX += deltaX;
    this.panY += deltaY;

    const maxX = this.originX;
    const minX = -(this.target.clientWidth - this.originX);

    const maxY = this.originY;
    const minY = -(this.rect.height - this.originY);

    // تطبيق الحدود عشان panX و panY ميتخطوش الأرقام دي
    this.panX = Math.max(minX, Math.min(this.panX, maxX));
    this.panY = Math.max(minY, Math.min(this.panY, maxY));

    // 3. نحرك الصورة بالـ translate
    // بنقسم على 2 عشان السكيل (2) بيضاعف أي حركة بنعملها جوه الـ translate
    this.target.style.transform = `scale(2) translate(${this.panX / 2}px, ${this.panY / 2}px)`;
  }

  onDragStart(e) {
    if (
      (e.type === "mousedown" && e.button !== 0) ||
      !e.target.classList.contains("item")
    )
      return;
    if (e.type === "touchstart" && e.touches.length !== 1) return;

    this.isDragging = true;
    this.isLinkBlocked = false;
    this.lockAxis = null;

    this.startX = this.getEventX(e);
    this.startY = this.getEventY(e);

    this.lastX = this.startX;
    this.lastY = this.startY;

    this.startTime = performance.now();
  }

  onDragMove(e) {
    if (
      !this.isDragging ||
      (e.type === "touchmove" && e.touches.length !== 1) ||
      !e.target.classList.contains("item")
    ) {
      return;
    }

    this.isScaling = true;

    const x = this.getEventX(e);
    const y = this.getEventY(e);

    const deltaX = x - this.lastX;
    const deltaY = y - (this.lastY || this.startY);

    if (Math.abs(x - this.startX) > 5) this.isLinkBlocked = true;

    // لو احنا عاملين زوم، حرك الصورة بالـ Delta وامنع أي تقليب
    if (this.isZooming) {
      e.preventDefault(); // إجبار منع السكرول وإنت عامل زوم
      this.setMove(deltaX, deltaY);
    }
    // لو مفيش زوم، شغل التقليب الطبيعي بتاعك (الـ Opacity)
    else {
      if (e.type.includes("mouse")) e.preventDefault();
      const dx = x - this.startX;
      const dy = y - this.startY;

      if (!this.lockAxis)
        this.lockAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (this.lockAxis === "y") return;
      if (e.cancelable) e.preventDefault();
    }

    // تحديث دائم للمكان الأخير
    this.lastX = x;
    this.lastY = y;
  }

  onDragEnd(e) {
    if (!this.isDragging || !e.target.classList.contains("item")) return;

    if (e.target.tagName === "VIDEO" && !this.isScaling) {
      if (e.target.paused) e.target.play();
      else e.target.pause();
    }

    this.isDragging = false;

    if (this.isZooming) return;

    const endTime = performance.now();
    const dt = Math.max(1, endTime - this.startTime);
    const dxTotal = this.lastX - this.startX;
    const velocity = Math.abs(dxTotal / dt);
    const distanceThreshold = Math.max(20, (this.step * 1) / 8);
    const velocityThreshold = 0.5;
    this.index = +this.index;

    if (dxTotal <= -distanceThreshold || velocity <= -velocityThreshold) {
      this.index = this.index + 1 > this.maxIndex ? 0 : this.index + 1;
    } else if (dxTotal >= distanceThreshold || velocity >= velocityThreshold) {
      this.index = this.index - 1 < 0 ? this.maxIndex : this.index - 1;
    }

    this.applyMove();
  }

  applyMove() {
    // تأمين: إلغاء الزوم من الصورة الحالية قبل الانتقال
    if (this.isZooming) {
      this.target.style.transform = "";
      this.isDoubleClick = false;
      this.isZooming = false;
      this.panX = 0;
      this.panY = 0;
    }

    this.removeActives(this.allItems, "active");
    this.removeActives(this.allDots, "active");
    this.allItems[this.index].classList.add("active");
    this.allDots[this.index].classList.add("active");
  }

  removeActives(arr, ...removeClass) {
    arr.forEach((ite) => ite.classList.remove(removeClass));
  }

  getEventX(e) {
    return e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
  }
  getEventY(e) {
    return e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
  }
}
