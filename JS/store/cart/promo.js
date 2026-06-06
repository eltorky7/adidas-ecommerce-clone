export class PromoStorage {
  constructor(key, keySummary, keyUser, jsonPath) {
    this.key = key;
    this.keySummary = keySummary;
    this.keyUser = keyUser;
    this.jsonPath = jsonPath;
  }

  load() {
    if (!localStorage.getItem(this.key)) return this.deepLoad();
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  /**
   * @returns {array}
   */
  async deepLoad() {
    try {
      const res = await fetch(this.jsonPath);
      const data = await res.json();

      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  loadSummary() {
    return JSON.parse(localStorage.getItem(this.keySummary)) || null;
  }

  saveSummary(data) {
    localStorage.setItem(this.keySummary, JSON.stringify(data));
  }

  loadUser() {
    return localStorage.getItem(this.keyUser);
  }
}

export class PromoStore {
  #promos = [];
  #summary = {};

  get promos() {
    return structuredClone(this.#promos);
  }

  get summary() {
    return structuredClone(this.#summary);
  }

  setPromos(promos) {
    this.#promos = promos;
  }

  setSummary(summary) {
    this.#summary = summary;
  }

  stopPromo(code) {
    this.#promos = this.#promos.map((pr) => {
      if (pr.code === code) {
        pr.is_active = false;
        return pr;
      }
      return pr;
    });
  }

  activePromo(code) {
    this.#promos = this.#promos.map((pr) => {
      if (pr.code === code) {
        pr.is_active = true;
        return pr;
      }
      return pr;
    });
  }

  reset() {
    this.setPromos([]);
    this.setSummary({});
  }
}

export class PromoService {
  constructor(store, storage) {
    this.store = store;
    this.storage = storage;
  }

  validateCode(inputCode, cartTotal, user) {
    if (!Object.keys(this.store.promos).length) return;

    const promo = this.store.promos.find((pr) => pr.code === inputCode);
    if (!promo) return { valid: false, message: "Invalid promo code." };

    if (!promo.is_active) {
      return { valid: false, message: "This promo code is expired." };
    }

    if (promo.max_uses !== null && promo.usage_count >= promo.max_uses) {
      return {
        valid: false,
        message: "This promo code has reached its usage limit.",
      };
    }

    if (cartTotal < promo.min_order_value)
      return {
        valid: false,
        message: `Minimum order value for this code is ${promo.min_order_value} EGP.`,
      };

    const userUsageTimes = promo.used_by.filter((email) => email === user);

    if (userUsageTimes.length >= promo.max_uses_per_user) {
      return {
        valid: false,
        message:
          "Oups .. You have reached the maximum usage limit for this promo code.",
      };
    }

    return {
      valid: true,
      promo,
    };
  }

  calculateDiscount(valuePromo, cartTotal) {
    if (!valuePromo) return;

    const { promo } = valuePromo;
    if (!promo) return;

    let discountAmount = 0;

    if (promo.type === "percentage") {
      discountAmount = cartTotal * (promo.value / 100);
    } else if (promo.type === "fixed") {
      discountAmount = promo.value;
    }

    return Math.min(cartTotal, discountAmount);
  }

  checkoutValidate(summary) {
    if (!summary) {
      this.store.setPromos(this.storage.load());
      return;
    }

    const { code, cartTotal, user } = summary;
    const isValid = this.validateCode(code, cartTotal, user).valid;

    if (isValid) {
      const updatePromos = this.store.promos.map((pr) => {
        if (pr.code === code) {
          pr.usage_count++;
          pr.used_by.push(user);
        }

        return pr;
      });

      this.store.setPromos(updatePromos);
    }
    return isValid;
  }
}
