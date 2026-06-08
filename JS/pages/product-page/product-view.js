import { AbstractView } from "/JS/pages/abstract-view.js";
import { Details } from "/JS/pages/product-page/product-details.js";
import { appEventBus } from "/JS/components/dependencies.js";

class Config {
  static get load() {
    return {
      VIEW_ID: `app`,
      LEFT_ID: `leftSection`,
      RIGHT_ID: `rightSection`,
      pathesData: {
        DATA_PRODUCTS_PATH: `/data/products-normalized.json`,
      },
      classesIds: {
        DETAILS_ID: `view-details`,
      },
    };
  }
}

export class ProductView extends AbstractView {
  constructor(params) {
    super(params);
    this.params = params;
    this.config = Config.load;
    this.setTitle(`Products | Adidas`);
  }

  async mount() {
    const {
      VIEW_ID,
      LEFT_ID,
      RIGHT_ID,
      pathesData: { DATA_PRODUCTS_PATH },
    } = this.config;

    this.details = new Details(VIEW_ID, LEFT_ID, RIGHT_ID, appEventBus);
    await this.details.run(DATA_PRODUCTS_PATH, this.params.id);
  }

  unmount() {
    if (this.details.channel) {
      this.details.channel.close();
      this.details.channel = null;
    }

    if (this.details.updateTimer) {
      clearTimeout(this.details.updateTimer);
      this.details.updateTimer = null;
    }
  }

  getHtml() {
    return `
    <section id="${this.config.classesIds.DETAILS_ID}" class="view-details page-view active">
        <div class="container-details">
          <div class="left-section" id="leftSection">
            <div class="gallery" id="gallery">
              <button
                class="btn-gallery"
                id="btn-gallery"
                aria-label="button gallery"
              >
                <span class="text"></span>
                <img src="/images/icons/arrow_top25.svg" alt="arrow-top" />
              </button>
              <div class="container-gallery" id="container-gallery"></div>
            </div>
            <div class="accordion" id="accordion">
              <!--! End The Form  -->
              <div class="accordion-item desc" id="ac-desc">
                <div class="accordion-header">
                  <span>Product Description</span>
                  <img src="/images/icons/arrow_top25.svg" alt="arrow-top" />
                </div>
                <div class="accordion-content">
                  <div class="inner-content">
                    <div class="details">
                      <h2 class="product-name"></h2>
                      <h3 class="sub"></h3>
                      <p class="description"></p>
                    </div>
                    <div class="photo">
                      <img src="" alt="photo product" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="accordion-item details-point" id="ac-details">
                <div class="accordion-header">
                  <span>Product Details</span>
                  <img src="/images/icons/arrow_top25.svg" alt="arrow-top" />
                </div>
                <div class="accordion-content">
                  <div class="inner-content">
                    <ul class="details-point-container"></ul>
                  </div>
                </div>
              </div>
              <div class="accordion-item details-reviews" id="ac-reviews">
                <div class="accordion-header">
                  <span>Reviews</span>
                  <img src="/images/icons/arrow_top25.svg" alt="arrow-top" />
                </div>
                <div class="accordion-content">
                  <div class="inner-content">
                    <div class="rating-container">
                      <div class="rating-snapshot item-rating">
                        <h3 class="head-rating head-snapshot">
                          Rating Snapshot
                        </h3>
                        <p class="desc-snapshot">
                          Select a row below to filter reviews.
                        </p>
                        <div class="rating-result">
                          <ul class="row-star fiveStar">
                            <li class="star-num">5 stars</li>
                            <li class="presentation">
                              <div class="col-full">
                                <div class="col-result"></div>
                              </div>
                            </li>
                            <li class="rating-count">000</li>
                          </ul>
                          <ul class="row-star fourStar">
                            <li class="star-num">4 stars</li>
                            <li class="presentation">
                              <div class="col-full">
                                <div class="col-result"></div>
                              </div>
                            </li>
                            <li class="rating-count">000</li>
                          </ul>
                          <ul class="row-star threeStar">
                            <li class="star-num">3 stars</li>
                            <li class="presentation">
                              <div class="col-full">
                                <div class="col-result"></div>
                              </div>
                            </li>
                            <li class="rating-count">000</li>
                          </ul>
                          <ul class="row-star twoStar">
                            <li class="star-num">2 stars</li>
                            <li class="presentation">
                              <div class="col-full">
                                <div class="col-result"></div>
                              </div>
                            </li>
                            <li class="rating-count">000</li>
                          </ul>
                          <ul class="row-star oneStar">
                            <li class="star-num">1 stars</li>
                            <li class="presentation">
                              <div class="col-full">
                                <div class="col-result"></div>
                              </div>
                            </li>
                            <li class="rating-count">000</li>
                          </ul>
                        </div>
                      </div>

                      <div class="overall-rating item-rating">
                        <h3 class="head-rating head-overall">Overall Rating</h3>
                        <div class="overall-container">
                          <div class="rating-num"></div>
                          <div class="reviews">
                            <ul class="stars">
                              <li class="star one">
                                <span class="result" index="1"></span>
                              </li>
                              <li class="star two">
                                <span class="result" index="2"></span>
                              </li>
                              <li class="star three">
                                <span class="result" index="3"></span>
                              </li>
                              <li class="star four">
                                <span class="result" index="4"></span>
                              </li>
                              <li class="star five">
                                <span class="result" index="5"></span>
                              </li>
                            </ul>
                            <div class="all-reviews"></div>
                          </div>
                        </div>
                      </div>
                      <div class="review-product item-rating">
                        <h3 class="head-rating head-review">
                          Review this Product
                        </h3>
                        <ul class="container-review-product">
                          <li class="parent-star" index="1" star="oneStar">
                            <div class="star">
                              <div class="border-result">
                                <span class="result"></span>
                              </div>
                            </div>
                          </li>
                          <li class="parent-star" index="2" star="twoStar">
                            <div class="star">
                              <div class="border-result">
                                <span class="result"></span>
                              </div>
                            </div>
                          </li>
                          <li class="parent-star" index="3" star="threeStar">
                            <div class="star">
                              <div class="border-result">
                                <span class="result"></span>
                              </div>
                            </div>
                          </li>
                          <li class="parent-star" index="4" star="fourStar">
                            <div class="star">
                              <div class="border-result">
                                <span class="result"></span>
                              </div>
                            </div>
                          </li>
                          <li class="parent-star" index="5" star="fiveStar">
                            <div class="star">
                              <div class="border-result">
                                <span class="result"></span>
                              </div>
                            </div>
                          </li>
                        </ul>
                        <p class="desc">
                          Adding a review will require a valid email for
                          verification
                        </p>
                      </div>
                    </div>
                    <div class="ai-summary">
                      <h3 class="title">Summary of Reviews</h3>
                      <div class="summary">
                        <div class="summary-head-container">
                          <div class="gemini">
                            <!--?lit$837559167$-->
                            <svg
                              viewBox="0 0 14 13"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              <path
                                d="M11.4545 5.47368L12.25 3.59211L14 2.73684L12.25 1.88158L11.4545 0L10.6591 1.88158L8.90909 2.73684L10.6591 3.59211L11.4545 5.47368ZM6.68182 5.81579L5.09091 2.05263L3.5 5.81579L0 7.52632L3.5 9.23684L5.09091 13L6.68182 9.23684L10.1818 7.52632L6.68182 5.81579Z"
                              ></path>
                            </svg>
                          </div>
                          <h4 class="summary-head">
                            AI-generated using English reviews only
                          </h4>
                        </div>
                        <p class="summary-content">
                          The shoes have a classic and stylish design that is
                          comfortable and versatile. Reviewers praise the good
                          arch support and soft suede uppers, though some note
                          the shoes run slightly large and recommend sizing
                          down. Overall, customers are satisfied with the
                          quality and comfort of the shoes.
                        </p>
                        <div class="events-summary">
                          <span class="show">Show more</span>
                          <div class="helpful">
                            <span>Helpful?</span>
                            <i class="fa-regular fa-thumbs-up"></i>
                            <i class="fa-regular fa-thumbs-down"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="customer-ratings">
                      <h3 class="title">Average Customer Ratings</h3>
                      <div class="container-customer-rating">
                        <div class="quality-product">
                          <h3 class="title-product">Quality of Product</h3>
                          <div class="quality-result">
                            <div class="line">
                              <div class="rating-square"></div>
                              <div class="rating-square"></div>
                              <div class="rating-square"></div>
                              <div class="rating-square"></div>
                              <div class="rating-square"></div>
                              <div class="result"></div>
                            </div>
                            <div class="rating-n">4.6</div>
                          </div>
                        </div>
                        <div class="value-product">
                          <h3 class="title-product">Value of Product</h3>
                          <div class="value-result">
                            <div class="line">
                              <div class="rating-square"></div>
                              <div class="rating-square"></div>
                              <div class="rating-square"></div>
                              <div class="rating-square"></div>
                              <div class="rating-square"></div>
                              <div class="result"></div>
                            </div>
                            <div class="rating-n">4.6</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="filtering-comments"></div>
                    <div class="comments-reviews"></div>
                  </div>
                </div>
              </div>
            </div>
            <div id="completeTheLook" class="recommendation-carousles"></div>
            <div id="youMightAlsoLike" class="recommendation-carousles"></div>
            <div id="othersAlsoBought" class="recommendation-carousles"></div>
            <div id="recentlyViewd" class="recommendation-carousles"></div>
          </div>
          <!-- !-------------------------------- -->
          <div class="right-section" id="rightSection">
            <div class="right-section-container">
              <div class="product-breadcrumbs"></div>
              <div class="rating-pricing-section">
                <div class="sale-badge"></div>
                <div class="rating_summary">
                  <ul class="stars">
                    <li class="star one">
                      <span class="result" index="1" style="width: 100%"></span>
                    </li>
                    <li class="star two">
                      <span class="result" index="2" style="width: 100%"></span>
                    </li>
                    <li class="star three">
                      <span class="result" index="3" style="width: 100%"></span>
                    </li>
                    <li class="star four">
                      <span class="result" index="4" style="width: 100%"></span>
                    </li>
                    <li class="star five">
                      <span
                        class="result"
                        index="5"
                        style="width: 59.2169%"
                      ></span>
                    </li>
                  </ul>
                  <div class="average-rating">4.6</div>
                  <div class="reviews-count">(382)</div>
                  <div class="popub-rating__summary">
                    <ul class="reviews-details">
                      <li>
                        <div class="item-container">
                          <span class="average-count-star center"
                            >5<i class="fa-solid fa-star"></i
                          ></span>
                          <div class="line"><div class="result"></div></div>
                          <span class="reviews-count-star center">000</span>
                        </div>
                      </li>
                      <li>
                        <div class="item-container">
                          <span class="average-count-star center"
                            >4<i class="fa-solid fa-star"></i
                          ></span>
                          <div class="line"><div class="result"></div></div>
                          <span class="reviews-count-star center">000</span>
                        </div>
                      </li>
                      <li>
                        <div class="item-container">
                          <span class="average-count-star center"
                            >3<i class="fa-solid fa-star"></i
                          ></span>
                          <div class="line"><div class="result"></div></div>
                          <span class="reviews-count-star center">000</span>
                        </div>
                      </li>
                      <li>
                        <div class="item-container">
                          <span class="average-count-star center"
                            >2<i class="fa-solid fa-star"></i
                          ></span>
                          <div class="line"><div class="result"></div></div>
                          <span class="reviews-count-star center">000</span>
                        </div>
                      </li>
                      <li>
                        <div class="item-container">
                          <span class="average-count-star center"
                            >1<i class="fa-solid fa-star"></i
                          ></span>
                          <div class="line"><div class="result"></div></div>
                          <span class="reviews-count-star center">000</span>
                        </div>
                      </li>
                    </ul>
                    <button
                      class="go-reviews-position center"
                      type="button"
                      aria-label=""
                    ></button>
                  </div>
                </div>
              </div>
              <!--? ===============================  -->
              <div class="details-product">
                <h2 class="title-head"></h2>
                <h3 class="basic-price"></h3>
                <div class="hasSale"></div>
                <h3 class="message-info"></h3>
                <div id="mobileGallery" class="mobile-gallery"></div>
                <div class="available-size"></div>
                <div class="colors-available"></div>
                <div class="the-size">
                  <div class="the-sizes-container">
                    <div class="row-titles">
                      <h3 class="title">Select Size (EU)</h3>
                      <button class="click-popup-details-page" aria-label="">
                        size chart
                      </button>
                    </div>
                    <ul class="row-table-sizes"></ul>

                    <div class="advice-size">
                      <i class="fa-solid fa-circle-exclamation"></i>
                      <h3 class="advice-msg">
                        <span>Size Advice.</span> Order your usual size.
                      </h3>
                    </div>

                    <div class="available-stock-msg"></div>
                  </div>
                </div>
                <!--!------------------------- WORK ---------------------------->
                <div class="action-details">
                  <div class="msgActionDetails"></div>
                  <div class="container-action-details">
                    <button
                      class="btn-offer black"
                      id="addToBag"
                      aria-label="add product in bag"
                    >
                      <div class="style">Add To Bag</div>
                    </button>
                    <button
                      id="addToWishListBtn"
                      class="add-to-wishlist center"
                    >
                      <i class="fa-regular fa-heart"></i>
                    </button>
                    <!-- <div class="add-to-wishlist"></div> -->
                  </div>
                </div>

                <ul class="right-sec-footer">
                  <li class="style-action">
                    <img
                      src="https://www.adidas.com.eg/on/demandware.static/-/Library-Sites-AdidasSharedLibrary/default/dw5c263a82/images/adidas/icons/delivery.svg"
                      alt="photo"
                    />
                    <span class="text">Free Delivery over EGP 999</span>
                  </li>
                  <li class="read-only">
                    <img
                      src="https://www.adidas.com.eg/on/demandware.static/-/Library-Sites-AdidasSharedLibrary/default/dw97db3e4e/images/adidas/icons/delivery-same-day.svg"
                      alt="photo"
                    />
                    <span class="text"
                      >Faster delivery within the next day (sat - thu) for
                      prepaid orders in greater cairo.</span
                    >
                  </li>
                  <li class="read-only">
                    <img
                      src="https://www.adidas.com.eg/on/demandware.static/-/Library-Sites-AdidasSharedLibrary/en_EG/dwe160fc7f/COD.png"
                      alt="photo"
                    />
                    <span class="text"
                      >Cash On Delivery Available : Standard courier delivery (4
                      to 5 days).</span
                    >
                  </li>
                  <li class="read-only">
                    <img
                      src="https://www.adidas.com.eg/on/demandware.static/-/Library-Sites-AdidasSharedLibrary/en_EG/dwe54db0d5/LOCK.jpg"
                      alt="photo"
                    />
                    <span class="text">Secure transactions</span>
                  </li>
                  <li class="read-only">
                    <img
                      src="https://www.adidas.com.eg/on/demandware.static/-/Library-Sites-AdidasSharedLibrary/en_EG/dw021cbd62/FR.png"
                      alt="photo"
                    />
                    <span class="text">Hassle Free 30 days returns.</span>
                  </li>
                  <li class="read-only">
                    <img
                      src="https://www.adidas.com.eg/on/demandware.static/-/Library-Sites-AdidasSharedLibrary/default/dwe61dd909/valU.png"
                      alt="photo"
                    />
                    <span class="text"
                      >ValU: Up to 3 months, 0% Interest 0% Purchase fees</span
                    >
                  </li>
                </ul>

                <!--!------------------------- WORK ---------------------------->
              </div>
            </div>
          </div>
        </div>
      </section>`;
  }
}
