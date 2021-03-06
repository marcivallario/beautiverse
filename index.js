let productData;
let favoritesData;

let results = document.getElementById('results'); // results div
let form = document.getElementById('search-bar'); // search form
let favoritesList = document.getElementById('favorites-list'); // favorites unordered list

// Load featured product, fetch Favorites List, load search bar
document.addEventListener('DOMContentLoaded', () => {
    fetch('http://makeup-api.herokuapp.com/api/v1/products.json')
    .then(resp => resp.json())
    .then(data => {
        productData = data;
        featuredProduct = data[Math.floor(Math.random() * data.length)]
        results.innerHTML = '';
        buildProductCard(featuredProduct);
        
        fetch('http://localhost:3000/favorites')
        .then(resp => resp.json())
        .then(favoritesListData => {
            favoritesData = favoritesListData;
            renderFavoritesList(favoritesData);
        })
        
        form.innerHTML = `
            <input id="search-field" type="text" placeholder="Search Brands..">
            <button id="search-button" type="submit">
                <img src="./src/search.png" alt="Search">
            </button>
        `
        form.addEventListener('submit', getSearchResults)
    })
})

//Building product cards & append to DOM
function buildProductCard(product) {
    let card = document.createElement('div');
    let shadeNames = product.product_colors.map(shade => {
        return shade.colour_name;
    })
    shadeNames = shadeNames.join(', ');
    card.className = 'makeup-details';
    const existingLi = document.querySelector(
        `#favorites-list li[data-product-id="${product.id}"]`
    )
    if (existingLi) {
        card.innerHTML = `
        <div class='image-container'>
            <img class='makeup-image' src='${product.api_featured_image}' />
        </div>
        <div class='makeup-text'>
            <h2 class='makeup-name'>${product.name}</h2>
            <button class="favorite-button" disabled="true" data-product-id="${product.id}">Added to Favorites</button>
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
    } else {
        card.innerHTML = `
        <div class='image-container'>
            <img class='makeup-image' src='${product.api_featured_image}' />
        </div>
        <div class='makeup-text'>
            <h2 class='makeup-name'>${product.name}</h2>
            <button class="favorite-button" data-product-id="${product.id}">Favorite</button>
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
    }
    results.append(card);
    let favoriteButtons = document.querySelectorAll('.favorite-button')
    favoriteButtons.forEach(button => button.addEventListener('click', handleAddFavorite));
}

// Loading Search Results
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

// Adding favorites
function handleAddFavorite(event) {
    let chosenProduct = productData.find(product => parseInt(product.id) === parseInt(event.target.dataset.productId));
    let liList = Array.from(favoritesList.querySelectorAll('li'));
    if (!(liList.find(li => parseInt(li.dataset.productId) === chosenProduct.id))) {
        addToFavorites(chosenProduct);
        event.target.disabled = true;
        event.target.textContent = "Added to Favorites";
    }
}

function addToFavorites(product) {
    fetch('http://localhost:3000/favorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    })
    .then(() => {
        favoritesData.push(product);
        renderFavorite(product)
    })
}

// Loading favorites list
function renderFavoritesList(favoritesListArr) {
    favoritesList.innerHTML = '';
    favoritesListArr.forEach(favorite => renderFavorite(favorite))
}

function renderFavorite(favorite) {
    const existingLi = document.querySelector(
        `#favorites-list li[data-product-id="${favorite.id}"]`
    )
    let li = existingLi || document.createElement('li');
    li.innerHTML = `<button class="delete-button" data-product-id=${favorite.id}>x</button><p data-product-id=${favorite.id}> ${favorite.name}</p>`;
    li.dataset.productId = favorite.id;
    if (!existingLi) {
        favoritesList.append(li);
        let deleteButtons = document.querySelectorAll('.delete-button')
        deleteButtons.forEach(button => button.addEventListener('click', handleDelete));
        
        let favoriteItemsText = document.querySelectorAll('li > p')
        favoriteItemsText.forEach(item => item.addEventListener('click', loadFavoriteItem));
    }
}

// Deleting favorites
function handleDelete(e) {
    fetch(`http://localhost:3000/favorites/${e.target.dataset.productId}`, {
        method: 'DELETE'
    })
    e.target.parentElement.remove();
    let cardsArr = Array.from(results.childNodes);
    let matchingProduct = cardsArr.find(card => card.children[1].children[1].dataset.productId === e.target.dataset.productId);
    if (matchingProduct) {
        matchingProduct.children[1].children[1].disabled = false;
        matchingProduct.children[1].children[1].textContent = 'Favorite';
    }
}

// Load clicked favorited item
function loadFavoriteItem(e) {
    results.innerHTML='';
    const favoriteToLoad = favoritesData.find(product => parseInt(product.id) === parseInt(e.target.dataset.productId));
    buildProductCard(favoriteToLoad);
}