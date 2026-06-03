import { Footer } from "/JS/components/nav-and-foot.js";
import { myBagInstance } from "/JS/store/cart/my-bag.js";

/* { تعليمات }
 * routes = [{ path: "/", view: "CLASS" }]; Path => الرابط, view => (Root) كل صفحة ليها كلاس
 * appElement = المناسب لكل صفحة HTML الي هيتم اضافة فيه ال container ده ال
 * init = التشغيل
 */

class Config {
  /**
   * @returns {object}
   */
  static load() {
    return {
      containerId: "app",
    };
  }
}

class RouterHelper {
  static pathToRegex(path) {
    return new RegExp(
      "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$",
    );
  }

  static getParams({ route, result }) {
    const values = result.slice(1);
    const keys = Array.from(route.path.matchAll(/:(\w+)/g)).map(
      (result) => result[1],
    );

    return Object.fromEntries(
      keys.map((key, i) => {
        return [key, values[i]];
      }),
    );
  }
}

export class Router {
  constructor(routes) {
    this.routes = routes;
    this.config = Config.load();
    this.appElement = document.getElementById(this.config.containerId);

    this.scrollTimeout = null;
    this.currentPageInstance = null;
    this.#init();
  }

  #init() {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    //* تسجيل مكان السكرول بشكل مستمر
    window.addEventListener("scroll", () => {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        sessionStorage.setItem(`scroll_${location.pathname}`, window.scrollY);
      }, 100);
    });

    //* التعامل مع زراير الـ Back والـ Forward
    window.addEventListener("popstate", () => {
      this.router();
      this.applyScrolled();
    });

    //* السيطرة على كل الروابط اللي عندها attribute `data-link`
    document.body.addEventListener("click", (e) => {
      const targetLink = e.target.closest("[data-link]");

      if (targetLink) {
        e.preventDefault();
        this.navigateTo(targetLink.href);
        this.applyScrolled(true);
      }
    });

    //* تشغيل الراوتر أول ما الصفحة تحمل
    this.router();
  }

  async router() {
    if (
      this.currentPageInstance &&
      typeof this.currentPageInstance.unmount === "function"
    ) {
      this.currentPageInstance.unmount();
    }

    //* 1. اختبار الرابط الحالي مع كل الروابط المسجلة
    const potentialMatches = this.routes.map((route) => {
      return {
        route: route,
        result: location.pathname.match(RouterHelper.pathToRegex(route.path)),
      };
    });

    //* 2. إيجاد التطابق
    let match = potentialMatches.find(({ result }) => result !== null);

    //* 3. التعامل مع الـ 404
    if (!match) {
      match = {
        route: this.routes[0], //* 404 أول راوت هو الـ
        result: [location.pathname],
      };
    }

    //* 4. وعرضه View تهيئة الـ
    const view = new match.route.view(RouterHelper.getParams(match));
    this.appElement.innerHTML = await view.getHtml();

    this.currentPageInstance = view;
    if (typeof view.mount === "function") await view.mount();
  }

  navigateTo(url) {
    history.pushState(null, null, url);

    Footer.handleFooterBottom();
    myBagInstance.updateAsideCartUi();

    this.router();
  }

  applyScrolled(isDefault) {
    const savedPosition = sessionStorage.getItem(`scroll_${location.pathname}`);
    if (savedPosition && !isDefault) {
      // لو كان ليه سكرول محفوظ، ننزله للمكان ده فوراً
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedPosition),
          behavior: "instant",
        });
      }, 400);
    } else {
      // لو دي صفحة جديدة لسه بيدخلها، نطلعه فوق خالص
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }
}

export const navigateTo = (url) => {
  history.pushState(null, null, url);
  window.dispatchEvent(new Event("popstate"));
};
