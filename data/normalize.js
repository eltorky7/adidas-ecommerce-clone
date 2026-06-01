const fs = require("fs");

// 1. قراءة الملف الأصلي
const rawData = fs.readFileSync("products.json", "utf8");
const products = JSON.parse(rawData);

// 2. استخراج الـ Schema من المنتج المشرف (JH5438)
const goldStandard = products[0];
const standardKeys = Object.keys(goldStandard);

// تجهيز القيم الافتراضية اللي هتتنسخ
const defaultReviews = goldStandard.reviews;
const defaultAllRating = goldStandard.allRating;
const defaultSizeChart = goldStandard.size_chart;

// 3. توحيد البيانات (Normalization Process)
const normalizedProducts = products.map((product, index) => {
  // تخطي أول منتجين لأنهم الأساس
  if (index === 0 || index === 1) return product;

  const updatedProduct = {};

  // أ. إضافة الحقول الأساسية وتعبئة الناقص
  standardKeys.forEach((key) => {
    if (product.hasOwnProperty(key)) {
      updatedProduct[key] = product[key];
    } else {
      // تعبئة البيانات الناقصة بذكاء بناءً على نوع الـ Key
      if (key === "reviews") updatedProduct[key] = defaultReviews;
      else if (key === "allRating") updatedProduct[key] = defaultAllRating;
      else if (key === "size_chart") updatedProduct[key] = defaultSizeChart;
      else if (key === "quality_of_product")
        updatedProduct[key] = 4.5; // قيمة افتراضية للتقييم
      else if (key === "value_of_product") updatedProduct[key] = 4.5;
      else updatedProduct[key] = goldStandard[key];
    }
  });

  // ب. تنظيف أي حقول غير موجودة في الـ Gold Standard
  // (لو في حقول زيادة في المنتج ده هنطنشها لأننا بنبني من הـ standardKeys فقط)

  // ج. معالجة الـ Variants عشان نضيف الـ color_hex لو ناقص
  if (updatedProduct.variants && Array.isArray(updatedProduct.variants)) {
    updatedProduct.variants = updatedProduct.variants.map((variant) => {
      if (!variant.hasOwnProperty("color_hex")) {
        // إضافة Hex وهمي بناءً على الكلمة الأولى من اللون
        const colorStr = variant.color_name.toLowerCase();
        let hex = "#000000"; // Default Black
        if (colorStr.includes("white")) hex = "#ffffff";
        if (colorStr.includes("red")) hex = "#ff0000";
        if (colorStr.includes("navy")) hex = "#000080";

        variant = {
          color_name: variant.color_name,
          color_hex: hex, // الحقل المضاف
          ...variant,
        };
      }
      return variant;
    });
  }

  return updatedProduct;
});

// 4. استخراج الملف النهائي النظيف
fs.writeFileSync(
  "products-normalized.json",
  JSON.stringify(normalizedProducts, null, 2),
);