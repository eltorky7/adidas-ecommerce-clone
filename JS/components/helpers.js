export class UIHelper {
  static toggleScroll(hid) {
    const body = document.body;
    const nav = document.querySelector("nav.bottomNav.active");

    if (hid) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      body.style.setProperty("--sb-width", `${scrollbarWidth}px`);
      body.classList.add("no-scroll");
    } else {
      if (nav) {
        nav.style.transition = "none";
        setTimeout(() => {
          nav.style.transition = "";
        }, 300);
      }

      setTimeout(() => {
        body.style.removeProperty("--sb-width");
        body.classList.remove("no-scroll");
      }, 200);
    }
  }

  static createFocus(exitBtn, showStyle) {
    //* Init (createFocust) Funtion
    const focusDelete = (e) => {
      if (e.currentTarget === focus) exitBtn.click();

      setTimeout(() => {
        focus.classList.remove(`${showStyle == 1 ? "show" : "showTwo"}`);
        setTimeout(() => {
          focus.remove();
        }, 600);
      }, 0);
    };

    const focus = document.createElement("div");

    focus.className = `${showStyle == 1 ? "focus-custom" : "focus-custom-two"}`;

    document.body.append(focus);

    setTimeout(
      () => focus.classList.add(`${showStyle == 1 ? "show" : "showTwo"}`),
      0,
    );

    //* Focus Events
    if (exitBtn) {
      exitBtn.onclick = focusDelete;
    }

    focus.onclick = focusDelete;
  }

  static getLocalPrice(price) {
    if (isNaN(price) || null) return;
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  static showAndHidPopup(popup, openBtn, exitBtn, showStyle = 1, signal) {
    if (openBtn) {
      if (openBtn === true) {
        popup.classList.add("show");
        this.createFocus(exitBtn, showStyle, signal);
      } else {
        openBtn.addEventListener("click", () => {
          popup.classList.add("show");
          this.createFocus(exitBtn, showStyle, signal);
        });
      }

      if (window.innerWidth - document.documentElement.clientWidth > 1) {
        UIHelper.toggleScroll(true);
      }
    }

    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        popup.classList.remove("show");

        if (+exitBtn.dataset["ishid"]) {
          setTimeout(() => {
            UIHelper.toggleScroll();
          }, 0);
        }
      });
    }
  }

  static removeActives(arr, ...wordActive) {
    arr.forEach((ite) => ite.classList.remove(...wordActive));
  }

  static popupQuickMsg(msg, backgroundColor, textColor) {
    const checkFoundEl = document.querySelector(".quick-popup");

    if (checkFoundEl) checkFoundEl.remove();

    const popup = document.createElement("div");
    popup.textContent = msg;
    popup.style.backgroundColor = backgroundColor || "black";
    popup.style.outlineColor = backgroundColor;
    popup.style.color = textColor || "";
    popup.style.borderColor = textColor || "";
    popup.className = "quick-popup center";

    document.body.append(popup);

    const anim = popup.animate(
      [
        { transform: "translate3d(-50%, -50%, 0)", opacity: 0 },
        { transform: "translate3d(-50%, 0, 0)", opacity: 1 },
        { transform: "translate3d(-50%, 0, 0)", opacity: 1 },
        { transform: "translate3d(-50%, 0, 0)", opacity: 1 },
        { transform: "translate3d(-50%, 0, 0)", opacity: 1 },
        { transform: "translate3d(-50%, 0, 0)", opacity: 0 },
      ],
      {
        duration: 2000,
        easing: "linear",
      },
    );

    anim.onfinish = () => popup.remove();
  }

  static getSalePrice(salePrice, regularPrice) {
    return 100 - (salePrice / regularPrice) * 100;
  }

  static random(min, max) {
    const rand = Math.floor(Math.random() * (max + 1));
    return rand < min ? min : rand;
  }

  static getPageURL(arr) {
    const pathArray = window.location.pathname.split("/");
    if (arr) return arr.some((page) => pathArray[1].includes(page));

    const currentPage = pathArray[1];
    const currentId = pathArray[2];

    return { currentPage, currentId };
  }
}

export class Products {
  static get products() {
    return JSON.parse(localStorage.getItem("products")) || [];
  }

  static setProducts(data) {
    localStorage.setItem("products", JSON.stringify(data));
  }

  static getProduct(id) {
    return this.products.find((pr) => pr.id === id);
  }
}
