import { EventBus } from "/JS/components/event-bus.js";
import { Cart } from "/JS/store/cart/cart.js";
import { MyBag } from "/JS/store/cart/my-bag.js";
import { Wishlist } from "/JS/store/wishlist/wishlist.js";

export const appEventBus = new EventBus();
export const myBagInstance = new MyBag(appEventBus);
export const wishlistInstance = new Wishlist();
export const cartInstance = new Cart(appEventBus, wishlistInstance);
