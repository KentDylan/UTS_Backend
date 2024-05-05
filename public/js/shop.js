document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const products = document.querySelectorAll(".pro");
  const proContainer = document.querySelector("#product1 .pro-container");
  const seriesFilter = document.getElementById("series-filter");
  const sortBy = document.getElementById("sort-by");

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    products.forEach(function (product) {
      const productName = product.querySelector("h5").textContent.toLowerCase();
      if (productName.includes(searchTerm)) {
        product.style.display = "block";
      } else {
        product.style.display = "none";
      }
    });
  });

  seriesFilter.addEventListener("change", function () {
    const selectedSeries = this.value.toLowerCase();
    // Filter products based on the selected series
    products.forEach((product) => {
      const productName = product.querySelector("h5").textContent.toLowerCase();
      const productSeries = productName.split(" ")[0].toLowerCase();
      if (!selectedSeries || productSeries === selectedSeries) {
        product.style.display = "block";
      } else {
        product.style.display = "none";
      }
    });
  });

  sortBy.addEventListener("change", function () {
    const sortByValue = this.value;
    let sortedProducts = Array.from(products);

    if (sortByValue === "asc") {
      sortedProducts.sort((a, b) => {
        const priceA = parseFloat(
          a.querySelector("h4").textContent.replace("$", "").trim()
        );
        const priceB = parseFloat(
          b.querySelector("h4").textContent.replace("$", "").trim()
        );
        return priceA - priceB;
      });
    } else if (sortByValue === "desc") {
      sortedProducts.sort((a, b) => {
        const priceA = parseFloat(
          a.querySelector("h4").textContent.replace("$", "").trim()
        );
        const priceB = parseFloat(
          b.querySelector("h4").textContent.replace("$", "").trim()
        );
        return priceB - priceA;
      });
    }

    proContainer.innerHTML = "";
    sortedProducts.forEach((product) => {
      proContainer.appendChild(product);
    });
  });
});
