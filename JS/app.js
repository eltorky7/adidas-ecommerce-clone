//* 1. استدعاء مكونات الواجهة
import { Navigation, Footer } from "/JS/components/nav-and-foot.js";

//* 2. استدعاء الحالة العامة (Global States)
// import { myBagInstance } from "/JS/store/my-bag.js";

//* 3. استدعاء الصفحات والراوتر
import { NotFoundView } from "/JS/pages/not-found-view.js";
import { HomeView } from "/JS/pages/home-page/home-view.js";
import { ProductView } from "/JS/pages/product-page/product-view.js";
import { WishlistView } from "/JS/pages/wishlist-page/wishlist-view.js";
import { CartView } from "/JS/pages/cart-page/cart-view.js";
import { Router } from "/JS/router.js";

//* ==========================================
//* تهيئة المستخدم
if (!localStorage.getItem("user")) {
  localStorage.setItem("user", `userId_${Math.trunc(Math.random() * 1e10)}`);
}

//* ==========================================
//* تشغيل واجهة المستخدم الأساسية (الناف والفوتر)
let nav = new Navigation();
let foot = new Footer("foot", "footerMain");

nav.start();
foot.start("/data/home.json");

//* ==========================================
//* تشغيل الراوتر (SPA)
const routes = [
  { path: "/404", view: NotFoundView },
  { path: "/", view: HomeView },
  { path: "/product/:id", view: ProductView },
  { path: "/wishlist", view: WishlistView },
  { path: "/cart", view: CartView },
];

document.addEventListener("DOMContentLoaded", () => {
  new Router(routes);
});
