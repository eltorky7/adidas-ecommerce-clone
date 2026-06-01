import { UIHelper } from "/JS/components/helpers.js";

// =-=-=-=--=--=--=- { Navigation Bar } =-=-=-=--=--=--=-
export class Navigation {
  constructor() {
    this.ads = document.querySelectorAll(".ad > div");

    this.bottomNav = document.getElementById("bottomNav");
    this.trigger = document.getElementById("navTrigger");

    this.btnOpen = document.getElementById("btnOpenMenu");
    this.btnClose = document.getElementById("btnCloseMenu");
    this.btnBack = document.querySelector("button.back");
    this.menu = document.getElementById("boxMenu");
    this.levelOne = document.querySelector(".level-one");
    this.overlay = document.querySelector(".clean");

    this.box = document.getElementById("boxMenu");

    this.start = this.init;
  }

  scrollingNav(nav, trigger) {
    if (!nav || !trigger) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]) return;

      entries[0].isIntersecting
        ? nav.classList.remove("active")
        : nav.classList.add("active");
    });

    observer.observe(trigger);
  }

  clickedMiniMenu() {
    if (
      !this.btnOpen ||
      !this.btnClose ||
      !this.btnBack ||
      !this.menu ||
      !this.levelOne ||
      !this.overlay
    )
      return; // حماية

    this.btnOpen.addEventListener("click", (e) => {
      e.currentTarget.setAttribute("disabled", "true");

      this.menu.style.display = "block";
      this.overlay.style.display = "block";
      this.overlay.animate([{ opacity: "0" }, { opacity: ".5" }], {
        duration: 300,
        fill: "both",
      });
      const anim = this.menu.animate(
        [{ transform: "translateX(-100%)" }, { transform: "translateX(0)" }],
        {
          duration: 300,
          fill: "both",
          easing: "ease-out",
        },
      );
      anim.addEventListener("finish", () =>
        this.btnClose.removeAttribute("disabled"),
      );
    });

    this.btnClose.addEventListener("click", (e) => {
      e.currentTarget.setAttribute("disabled", "true");

      this.overlay.animate([{ opacity: ".5" }, { opacity: "0" }], {
        duration: 300,
        fill: "forwards",
      });

      const anim = this.menu.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-100%)" }],
        {
          duration: 300,
          fill: "both",
          easing: "ease-in",
        },
      );

      anim.addEventListener("finish", () => {
        const activeNow = document.querySelector(".level.active");
        this.menu.style.display = "none";
        this.overlay.style.display = "none";
        activeNow.classList.remove("active");
        this.levelOne.classList.add("active");
        this.btnBack.classList.remove("active");
        this.btnOpen.removeAttribute("disabled");
        localStorage.setItem("backHere", "[]");
      });
    });
  }

  animationNavTop(ads) {
    let intervalId = null; // متغير عشان نمسك بيه العداد ونقدر نوقفه
    const mediaQuery = window.matchMedia("(max-width: 767px)"); // مراقب الشاشة

    // 1. دالة بتشغل الانيميشن (للموبايل)
    function startSlider() {
      if (intervalId) return; // لو شغال بالفعل متعملش واحد جديد عشان ميهيسش

      // تجهيز حالة البداية: الأول ظاهر والتاني مخفي
      ads[0].style.display = "block";
      ads[0].style.opacity = "1";
      ads[1].style.display = "none";
      ads[1].style.opacity = "0";

      let activeIndex = 0;

      intervalId = setInterval(() => {
        const currentAd = ads[activeIndex];
        const nextAd = ads[activeIndex === 0 ? 1 : 0];

        // نخفي الحالي
        const fadeOut = currentAd.animate(
          [{ opacity: "1" }, { opacity: "0" }],
          {
            duration: 500,
            fill: "forwards",
          },
        );

        // لما يخلص اختفاء.. نظهر الجديد
        fadeOut.addEventListener("finish", () => {
          currentAd.style.display = "none";

          nextAd.style.display = "block";
          nextAd.animate([{ opacity: "0" }, { opacity: "1" }], {
            duration: 500,
            fill: "forwards",
          });

          // نقلب الدور
          activeIndex = activeIndex === 0 ? 1 : 0;
        });
      }, 3000); // 3 ثواني وقت مناسب
    }

    // 2. دالة بتوقف الانيميشن (للديسكتوب)
    function stopSlider() {
      if (intervalId) {
        clearInterval(intervalId); // وقف العداد
        intervalId = null;
      }

      // أهم خطوة: نرجع العناصر لطبيعتها عشان الديسكتوب يظهر صح
      // بنشيل أي ستايل JS حطيناه عشان ملف CSS يشتغل
      ads.forEach((ad) => {
        ad.style.display = "";
        ad.style.opacity = "";
        ad.getAnimations().forEach((anim) => anim.cancel()); // نلغي أي انيميشن معلق
      });
    }

    // 3. دالة بتشوف حالة الشاشة وتتصرف
    function handleScreenChange(e) {
      if (e.matches)
        startSlider(); // لو شاشة صغيرة -> شغل
      else stopSlider(); // لو شاشة كبيرة -> وقف ورجع كل حاجة لأصلها
    }

    // نشغل المراقب
    mediaQuery.addEventListener("change", handleScreenChange); // يراقب التغيير
    handleScreenChange(mediaQuery); // يشتغل أول مرة لما الصفحة تفتح
  }

  sliderTo(box, btnBack) {
    if (!box || !btnBack) return;

    // بنصفر الذاكرة أول ما الموقع يفتح
    localStorage.setItem("backHere", JSON.stringify([]));

    box.addEventListener("click", (e) => {
      // 1. استخدام contains بدل item(0) للأمان
      if (e.target.classList.contains("go")) {
        // 2. استخدام dataset بدل الـ id
        const next = e.target.dataset.next;
        const back = e.target.dataset.back;

        // حماية: لو مفيش data attributes متكملش
        if (!next || !back) return;

        const nextLevel = document.querySelector(`.${next}`);
        const backLevel = document.querySelector(`.${back}`);

        if (nextLevel && backLevel) {
          nextLevel.classList.add("active");
          backLevel.classList.remove("active");

          let arr = JSON.parse(localStorage.getItem("backHere"));
          arr.push([next, back]);
          localStorage.setItem("backHere", JSON.stringify(arr));

          if (back === "level-one") {
            btnBack.removeAttribute("disabled");
            btnBack.classList.add("active");
          }
        }
      }

      if (e.target === btnBack) {
        let btnBackById = JSON.parse(localStorage.getItem("backHere"));

        // حماية: لو الذاكرة فاضية ميعملش pop عشان ميديلاش undefined
        if (btnBackById.length === 0) return;

        let [next, back] = btnBackById[btnBackById.length - 1];

        const nextLevel = document.querySelector(`.${next}`);
        const backLevel = document.querySelector(`.${back}`);

        if (backLevel && nextLevel) {
          backLevel.classList.add("active");
          nextLevel.classList.remove("active");

          btnBackById.pop();
          localStorage.setItem("backHere", JSON.stringify(btnBackById));

          if (back === "level-one") {
            btnBack.setAttribute("disabled", "true");
            btnBack.classList.remove("active");
          }
        }
      }
    });
  }

  handleMenuHoverIntent() {
    const li = document.querySelectorAll(".megaMenu > li");
    const megaMenu = document.querySelector(".megaMenu");
    let time = null;

    li.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        clearTimeout(time); // الغي أي أمر سابق (سواء غلق أو فتح)

        // خزن التايمر مباشرة في المتغير time
        time = setTimeout(() => {
          li.forEach((i) => {
            if (i !== item) i.classList.remove("active");
          });
          item.classList.add("active");
        }, 300);
      });
    });

    megaMenu.addEventListener("mouseleave", () => {
      clearTimeout(time); // الغي أي أمر فتح معلق

      time = setTimeout(() => {
        li.forEach((c) => {
          c.classList.remove("active");
        });
      }, 300);
    });
  }

  init() {
    this.scrollingNav(this.bottomNav, this.trigger);
    this.clickedMiniMenu();
    this.animationNavTop(this.ads);
    this.sliderTo(this.box, this.btnBack);
    this.handleMenuHoverIntent();
  }
}

export class Footer {
  constructor(footId, viewId) {
    this.footerTemp = document.getElementById(footId);
    this.view = document.getElementById(viewId);
    if (!this.footerTemp || !this.view) return;

    this.data = null;

    this.start = this.getData;
  }

  async getData(jsonFile) {
    try {
      const res = await fetch(jsonFile);
      const data = await res.json();
      this.data = data.find((f) => f.name === "footer");
      this.init();
    } catch (err) {
      console.log(err);
    }
  }

  init() {
    const foot = document.getElementById("footer");
    if (foot) {
      foot.remove();
    }

    this.createFooter();
    this.eventsFooterElements();
  }

  createFooter() {
    const footerClone = this.footerTemp.content.cloneNode(true);
    const saleMessage = footerClone.querySelector(".text");
    if (this.data.isSaleMessage) {
      saleMessage.parentElement.style.display = "flex";
      saleMessage.textContent = this.data.text;
    } else saleMessage.parentElement.style.display = "none";
    this.view.appendChild(footerClone);
  }

  eventsFooterElements() {
    const footer = document.getElementById("footer");
    const containerItems = footer.querySelector(".items-foot.mobile");
    const items = footer.querySelectorAll(".item");
    const btnBack = footer.querySelector(".back-top");

    Footer.handleFooterBottom();

    btnBack.addEventListener("click", () => {
      window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    });

    containerItems.addEventListener("click", (e) => {
      if (!e.target.classList.contains("title-item")) return;

      if (e.target.parentElement.classList.contains("active")) {
        e.target.parentElement.classList.remove("active");
      } else {
        items.forEach((item) => item.classList.remove("active"));
        e.target.parentElement.classList.add("active");
      }
    });
  }

  static handleFooterBottom() {
    const result = UIHelper.getPageURL(["cart", "wishlist"]);
    const [backTop, offer] = document.querySelectorAll(
      ".footer-container .back-top, .footer-container .ad-offer",
    );
    if (result) {
      backTop.style.display = "none";
      offer.style.display = "none";
    } else {
      backTop.style.display = "";
      offer.style.display = "";
    }
  }
}
