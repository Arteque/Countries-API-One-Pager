// fetch data

const countriesArr = []
const searchInput = document.querySelector(".search-container input")
const filterCountries = document.querySelector("#filter-countries select")
const cardContainerParent = document.querySelector("section#main-data")
const baseUrl = window.location.origin+window.location.pathname

fetch("data.json")
.then(data => data.json())
.then(data => {
    data.forEach((country,index) => {
        countriesArr.push({
            "index": index,
            "alphaCode":country.alpha3Code,
            "name":country.name,
            "region":country.region,
            "population":country.population,
            "capital": country.capital,
            "flag":country.flag,
            "nativename": country.nativeName,
            "subregion": country.subregion,
            "topleveldomain": country.topLevelDomain,
            "languages": country.languages,
            "currencies": country.currencies,
            "bordercountries": country.borders
        })
    })
})
.then(() => {
   
    
    cardContainerParent.innerHTML = countriesArr.map(singleTemplate).join("")


    //Filter
   

    filterCountries.addEventListener("input", (e) => {
        const filterIndex = Number( e.target.selectedIndex)
        const region = String(e.target[filterIndex].value)
        const allCards = cardContainerParent.querySelectorAll(".card-container")

        searchInput.value = ""
        allCards.forEach(card => {
            card.classList.remove("no-disp")
        })
        if(e.target.filterIndex == "0"){
            allCards.forEach(card => {
                card.classList.remove("no-disp")
            })
        }else{
            const cardsContainer = cardContainerParent.querySelectorAll(".card-container:not([data-filter="+region+"])")
            cardsContainer.forEach(item => {
                item.classList.add("no-disp")
             })
        }
    })
})
.then(() => {
    //details page
const cardsDOM = [...document.querySelectorAll(".card-container")]

    cardsDOM.forEach((card, index) => {
        card.addEventListener("click", () => {
            window.location.href = baseUrl + "?country=" + index
        })
    })
})
.then(() => {
    analyseWindowLocation()
})




function analyseWindowLocation(){
    if(!window.location.href.includes("?country")) return
    // we can split the data using && if we knew that there is more attributes
    const country = Number(window.location.href.split("?country=")[1].trim())
    
    cardContainerParent.classList.add("no-disp")
    filterCountries.parentElement.parentElement.classList.add("no-disp")
    cardContainerParent.parentElement.innerHTML += detailsTemplate(countriesArr[country])

}


function singleTemplate(country){
    return `
        <div class="card-container" data-filter="${country.region.toLowerCase()}" data-index="${country.alphaCode}" data-name="${country.name.toLowerCase().trim()}">
            <div class="card-header">
                <img loading="lazy" src="${country.flag}" alt="${country.name}s flag">
            </div>
            <div class="card-body">
                <h3>${country.name}</h3>
                <ul>
                    <li>
                        <b>Population:</b> ${new Intl.NumberFormat("de-DE").format(country.population)}
                    </li>
                    <li>
                        <b>Region:</b> ${country.region}
                    </li>
                    <li>
                        <b>Capital:</b> ${country.capital}
                    </li>
                </ul>
            </div>
        </div>
    `
}
let dataArr = []
function getCountriesBorderFullName(elements){
    console.log(elements)
    if(elements == undefined){
        dataArr.push({"name": "No neighboring countries due to the geographic location!", "index": "none"})
        return
    }
    elements.forEach(border => {
        countriesArr.forEach(element => {
            if(element.alphaCode == border){
                dataArr.push({"name":element.name, "index": element.index}) 
            }
        })
    })
}
function bordersTemplate(el){
    return `<span class="bordered ${el.index}" data-index="${el.index}" onclick="changeIndex(${el.index})">${el.name}</span>`
}

function changeIndex(index){
    if(index == "none") return 
    window.location.href = baseUrl+"?country="+index
}

function backToHome(){
    window.location.href=baseUrl
}

function getCountryLangues(language){
    return `<span>${language.name}</span>`
}

function detailsTemplate(country){
    getCountriesBorderFullName(country.bordercountries)
    return `
        <section id="details-section" data-name="${country.name}" data-index="${country.index}">
            <header class="back-container">
                <button class="bordered" onclick="backToHome()">
                    <span class="icon">
                        <i class="fa-solid fa-arrow-left"></i>
                    </span>
                    <span class="text">
                        Back
                    </span>
                </button>
            </header>
            <div class="card-container details">
                <div class="card-header">
                    <img src="${country.flag}" alt="${country.name}">
                </div>
                <div class="card-body">
                    <h2 class="full-width">${country.name}</h2>
                    <ul>
                        <li>
                            <b>Native Name:</b> ${country.nativename}
                        </li>
                        <li>
                            <b>Population:</b> ${new Intl.NumberFormat("de-DE").format(country.population)}
                        </li>
                        <li>
                            <b>Region:</b> ${country.region}
                        </li>
                        <li>
                            <b>Sub Region:</b> ${country.subregion}
                        </li>
                        <li>
                            <b>Capital:</b> ${country.capital}
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <b>Top Level Domain:</b> ${country.topleveldomain}
                        </li>
                        <li>
                            <b>Currencies:</b> ${country.currencies[0].name} | ${country.currencies[0].symbol}
                        </li>
                        <li>
                            <b>Languages:</b> ${country.languages.map(getCountryLangues).join(", ")}
                        </li>
                    </ul>

                    <ul class="full-width">
                        <li class="flex row wrap gap"> 
                            <b>Border Countries:</b>${dataArr.map(bordersTemplate).join(" ")}
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    `
}
    //Search
    
    
    searchInput.addEventListener("input", e => {
        const allCards = document.querySelectorAll("section .card-container")
        if(e.target.value.length >= 3){
            allCards.forEach(card => {
                card.classList.add("no-disp")
                if(!card.dataset.name.includes(e.target.value.toLowerCase().trim())) return
                card.classList.remove("no-disp")    
            })
        }else{
            allCards.forEach(card => {
                card.classList.remove("no-disp")
            })
        }
    })


