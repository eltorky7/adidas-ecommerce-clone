import { AbstractView } from "/JS/pages/abstract-view.js";
import {
  Slides,
  SlidesCategory,
  Carousel,
} from "/JS/pages/home-page/home-components.js";

class Config {
  /**
   * @returns {object}
   */
  static get load() {
    return {
      VIEW_ID: `viewHome`,
      GENDER: "home",
      pathesData: {
        DATA_SLIDES_PATH: `data/home.json`,
        DATA_CAROUSEL_PATH: `data/carousel.json`,
        DATA_PRODUCTS_PATH: `data/products-normalized.json`,
      },
      classesIds: {
        SLIDES_ID: "slidesContainer",
        SLIDES_CATEGORY_ID: "slidesCategoryContainer",
        CAROUSEL_ID: "carousel",
      },
    };
  }
}

export class HomeView extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Home | adidas Egypt");
    this.config = Config.load;
  }

  getHtml() {
    return `
        <section id="viewHome" class="view-home active">
            <div id="slidesContainer"></div>
            <div id="slidesCategoryContainer"></div>
            <div id="carousel-section"></div>
        </section>
    `;
  }

  async mount() {
    const {
      VIEW_ID,
      GENDER,
      pathesData: { DATA_SLIDES_PATH, DATA_CAROUSEL_PATH, DATA_PRODUCTS_PATH },
      classesIds: { SLIDES_ID, SLIDES_CATEGORY_ID, CAROUSEL_ID },
    } = this.config;

    this.slides = new Slides(SLIDES_ID);
    this.slidesCategory = new SlidesCategory("temp2", SLIDES_CATEGORY_ID);
    this.carouCards = new Carousel(CAROUSEL_ID, VIEW_ID, "1", "2", {
      cardTemplate: "card",
      slideTemplate: "slide",
    });
    this.carouSlides = new Carousel(CAROUSEL_ID, VIEW_ID, "2", "1", {
      cardTemplate: "card",
      slideTemplate: "slide",
    });

    // نشغلهم
    await this.slides.start(DATA_SLIDES_PATH);
    await this.slidesCategory.start(DATA_SLIDES_PATH);
    await this.carouCards.start(GENDER, DATA_CAROUSEL_PATH, DATA_PRODUCTS_PATH);
    await this.carouSlides.start(GENDER, DATA_CAROUSEL_PATH);
  }

  destroy() {}
}
