const searchBar = document.querySelector("search-text");
const searchButton = document.querySelector("search-button");

const filter = () => {
    console.log(searchBar.value);
}

searchButton.addEventListener('click', filter)