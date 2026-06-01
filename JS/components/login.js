import { UIHelper } from "/JS/components/helpers.js";

export class LoginStorage {
  /**
   * @class LoginStorage
   * @description Login Manager
   * @param {string} key
   */
  constructor(key) {
    this.key = key;
  }

  /**
   * @method user
   * @returns {string}
   */
  get user() {
    return localStorage.getItem(this.key) || "";
  }

  /**
   * @method saveLogin
   * @param {string} id
   * @returns {void}
   */
  saveLogin(id = "", isRandom) {
    if (isRandom) id = `${id}_${UIHelper.random(50, 1e6)}`;

    localStorage.setItem(this.key, id);
  }
}
