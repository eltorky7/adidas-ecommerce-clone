export class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe
   * @param {string} eventName
   * @param {function} callback
   * @returns {void}
   */
  on(eventName, callback) {
    if (!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(callback);
  }

  /**
   * @param {string} eventName
   * @param {function} targetCallback
   * @returns {void}
   */
  removeEvent(eventName, targetCallback) {
    if (!this.events[eventName]) return;

    this.events[eventName] = this.events[eventName].filter((callback) => {
      return callback.toString() !== targetCallback.toString();
    });
  }

  /**
   * Publish
   * @param {string} eventName
   * @param {any} data
   * @returns {void}
   */
  emit(eventName, data) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach((callback) => callback(data));
  }
}
