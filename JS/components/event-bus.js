export class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe
   * @param {string} eventName
   * @param {function} callback
   */
  on(eventName, callback) {
    if (!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(callback);
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
