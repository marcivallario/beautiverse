let productData;
let featuredProduct;
let results = document.getElementById('results');
let form = document.getElementById('search-bar');
let favoritesList = document.getElementById('favorites-list');
let currentProduct;

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://makeup-api.herokuapp.com/api/v1/products.json')
    .then(resp => resp.json())
    .then(data => {
        productData = data;
        featuredProduct = data[Math.floor(Math.random() * data.length)]
        results.innerHTML = '';
        buildProductCard(featuredProduct);
    })

    fetch('http://localhost:3000/favorites')
    .then(resp => resp.json())
    .then(favoritesListData => renderFavoritesList(favoritesListData))

    form.addEventListener('submit', getSearchResults)
})

function buildProductCard(product) {
    let card = document.createElement('div');
    let shadeNames = product.product_colors.map(shade => {
        return shade.colour_name;
    })
    shadeNames = shadeNames.join(', ');
    card.className = 'makeup-details';
    card.innerHTML = `
        <img class='makeup-image' src='${product.api_featured_image}' />
        <div class='makeup-text'>
            <h2 class='makeup-name'>${product.name}</h2>
            <button class="favorite-button">Favorite</button>
            <p>${product.description}</p>
            <ul em class='product-description'>
            <br>
                <li>Price: ${(product.price_sign ? product.price_sign : '$')
                } ${(parseFloat(product.price).toFixed(2))}</li>
                <li>Available shades: ${shadeNames}</li>
                <li>Buy at <a href=${product.product_link} target='_blank'>${product.brand}</a></li>
            </ul>
        </div>
    `
    results.append(card);
    // document.querySelector('.favorite-button').addEventListener('click', addToFavorites);
}

function getSearchResults(e) {
    e.preventDefault();
    results.innerHTML=''
    let searchQuery = e.target[0].value.toLowerCase();
    let matchingBrands = [];
    productData.forEach(product => {
        if (product.brand === searchQuery) {
            matchingBrands.push(product)
        }
    })
    console.log(matchingBrands);
    if (matchingBrands.length === 0) {
        results.innerHTML = '<h1>No products found!</h1>';
    } else {
        loadSearchResults(matchingBrands);
    }
    e.target.reset();
}

function loadSearchResults(productArray) {
    productArray.forEach(product => buildProductCard(product))
}

// function addToFavorites(product) {
    
//     fetch('http://localhost:3000', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(product)
//     })
//     // pass product info into this function
//     // send fetch POST request to db.json with this information
//     // run renderfavoriteslist function (that has helper of renderfavoriteditem)

// }

function renderFavoritesList(favoritesListArr) {
    favoritesList.innerHTML = '';
    favoritesListArr.forEach(favorite => renderFavorite(favorite))
}

function renderFavorite(favorite) {
    let li = document.createElement('li');
    li.textContent = favorite.name;
    favoritesList.append(li);
}