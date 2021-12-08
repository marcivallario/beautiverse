let productData;
let featuredProduct;
let results = document.getElementById('results');
let form = document.getElementById('search-bar');
let favoritesList = document.getElementById('favorites-list');
let currentProduct;

// Featured products & persisting Favorites List
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
    .then(favoritesListData => {
        renderFavoritesList(favoritesListData)
    })

    form.addEventListener('submit', getSearchResults)
})

//Building product cards
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

// Favoriting
function handleAddFavorite(event) {
    console.log('click');
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
    .then(renderFavorite(product))
}

// Favorites List
function renderFavoritesList(favoritesListArr) {
    favoritesList.innerHTML = '';
    favoritesListArr.forEach(favorite => renderFavorite(favorite))
}

function renderFavorite(favorite) {
    const existingLi = document.querySelector(
        `#favorites-list li[data-product-id="${favorite.id}"]`
    )
    let li = existingLi || document.createElement('li');
    li.innerHTML = `<button class="delete-button" data-product-id=${favorite.id}>x</button>${favorite.name}`;
    li.dataset.productId = favorite.id;
    if (!existingLi) {
        favoritesList.append(li);
        let deleteButtons = document.querySelectorAll('.delete-button')
        deleteButtons.forEach(button => button.addEventListener('click', handleDelete));
        
        let favoriteItems = document.querySelectorAll('li')
        console.log(favoriteItems);
        favoriteItems.forEach(item => item.addEventListener('click', loadFavoriteItem));
    }
}

function handleDelete(e) {
    fetch(`http://localhost:3000/favorites/${e.target.dataset.productId}`, {
        method: 'DELETE'
    })
    e.target.parentElement.remove();
}

function loadFavoriteItem(e) {
    results.innerHTML='';
    let favoriteToLoad = productData.find(product => parseInt(product.id) === parseInt(e.target.dataset.productId));
    buildProductCard(favoriteToLoad);
}