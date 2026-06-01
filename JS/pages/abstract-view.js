export class AbstractView {
  /**
   * AbstractView
   * @param {object} params
   */
  constructor(params) {
    this.params = params;
  }

  /**
   *
   * @param {string} title
   */
  setTitle(title) {
    document.title = title;
  }

  async getHtml() {
    return ``;
  }

  async mount() {}
}
