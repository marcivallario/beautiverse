let featuredProduct;
let results = document.getElementById('results');

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://makeup-api.herokuapp.com/api/v1/products.json')
    .then(resp => resp.json())
    .then(data => {
        featuredProduct = data[Math.floor(Math.random() * data.length)]
        console.log(featuredProduct)
        results.innerHTML = '';
        buildProductCard(featuredProduct);
    })
})

function buildProductCard(product) {
    let card = document.createElement('div');
    let shadeNames = featuredProduct.product_colors.map(shade => {
        return shade.colour_name;
    })
    shadeNames = shadeNames.join(', ');
    card.className = 'makeup-details';
    card.innerHTML = `
    <img class='makeup-image' src='${featuredProduct.api_featured_image}' />
                <div class='makeup-text'>
                    <h2 class='makeup-name'>${featuredProduct.brand} ${featuredProduct.name}</h2>
                    <span id="favorite-button" class="iconify" data-icon="bi:bookmark-heart"></span>
                    <p>${featuredProduct.description}</p>
                    <ul em class='product-description'>
                    <br>
                        <li>Price: ${(featuredProduct.price_sign ? featuredProduct.price_sign : '$')
                        } ${(parseFloat(featuredProduct.price).toFixed(2))}</li>
                        <li>Available shades: ${shadeNames}</li>
                        <li>Buy at <a href=${featuredProduct.product_link} target='_blank'>${featuredProduct.brand}</a></li>
                    </ul>
                </div>
    `
    results.append(card);
}
