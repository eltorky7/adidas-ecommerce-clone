import { AbstractView } from "/JS/pages/abstract-view.js";

export class NotFoundView extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Not Found Page | Adidas");
  }

  getHtml() {
    return `NOT_FOUND!`;
  }
}
