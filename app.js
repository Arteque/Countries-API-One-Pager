// fetch data

const countriesArr = []
const searchInput = document.querySelector(".search-container input")
const filterCountries = document.querySelector("#filter-countries select")
const cardContainerParent = document.querySelector("section#main-data")
const baseUrl = window.location.origin+window.location.pathname

fetch("data.json")
.then(data => data.json())
.then(data => {
    // console.log(data)
    data.forEach((country,index) => {
        countriesArr.push({
            "index": index,
            "alphaCode":country.alpha3Code,
            "alphaCode2":country.alpha2Code,
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


async function analyseWindowLocation(){
    if(!window.location.href.includes("?country")) return
    // we can split the data using && if we knew that there is more attributes
    const country = Number(window.location.href.split("?country=")[1].trim())
    
    cardContainerParent.classList.add("no-disp")
    filterCountries.parentElement.parentElement.classList.add("no-disp")
    cardContainerParent.parentElement.innerHTML += detailsTemplate(countriesArr[country])
    
    getMoreDataWiki(countriesArr[country].name, "#country-data-text");
    getTheCountryCoord(countriesArr[country].name)
    //showCountryOnTheMap()
}

//Get the choosen country national anthems if available 

function getMoreDataWiki(stateName,DomContainer){
    const formattedCountryName = stateName.replace(/ /g, "_");
    const url =  `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=&explaintext=&titles=${formattedCountryName}`
    fetch(url)
    .then(response => response.json())
    .then(async data => {
        const pages = data.query.pages;
        const page = Object.values(pages)[0];
        
        if(page && page.extract){
            const container = await document.querySelector(DomContainer)
            container.innerHTML = `
                <h3>Description</h3>
               <p> ${page.extract}  </p>
            `
            const audioUrl = await getNationalAnthem(stateName)
            
            document.querySelector("#audio-anthem-player").innerHTML = `
                <source src="https://commons.wikimedia.org/wiki/Special:FilePath/${audioUrl}" type="audio/ogg">
            `
           
        }

    })
    .catch(err => console.log(err))
}


async function getNationalAnthem(countryName){
    const formattedCountryName = countryName.replace(/ /g, "_")
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${formattedCountryName}&prop=extracts|pageimages|revisions&rvprop=content&rvslots=main`
    // console.log(formattedCountryName)
    try{
        const response = await fetch(url)
        const data = await response.json()
        const pages = data.query.pages
        const page = Object.values(pages)[0]
        console.log(page.revisions[0].slots.main)

        //
        if(page && page.revisions[0].slots.main){
            const anthemFile = extractAnthem(page.revisions[0].slots.main["*"])
            if(anthemFile){
                return String(anthemFile)
            }else{
                console.error('Notional Anthem not found')
            }
        }
    } catch (err) {
        console.log(err)
    }
    
}

function extractAnthem(extract) {
    const regex = /\[\[File:(.+?)\]\]/
    const match = extract.match(regex)
    // console.log(match)
    const refineMatch = match[0].replace(/\[\[File:(.+?)\]\]}?/, '$1').replace(/ /g, "_");
    
    return refineMatch ? refineMatch : null
}



// Get the lat and lon for the leaflet map
async function getTheCountryCoord(country){
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=coordinates&titles=${encodeURI(country)}&colimit=1`
    try{
        const response = await fetch(url)
        const data = await response.json()
        const pages = data.query.pages
        const pageId = Object.values(pages)[0]

        const coordData = {
            lat: pageId.coordinates[0].lat,
            lon: pageId.coordinates[0].lon
        }
        console.log(coordData) 

        showCountryOnTheMap(coordData.lat, coordData.lon)

    }catch(err){
        console.log(err)
    }
}

function showCountryOnTheMap(lat,long){

    var map = L.map('map').setView([lat, long], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 4,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}


function singleTemplate(country){
    return `
        <div class="card-container" 
        data-filter="${country.region.toLowerCase()}" 
        data-index="${country.alphaCode}" 
        data-name="${country.name.toLowerCase().trim()}"
        data-iso2=${country.alphaCode2}
        >
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
    // console.log(elements)
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
        <section id="details-section" 
        data-name="${country.name}" 
        data-index="${country.index}"
        data-iso2=${country.alphaCode2}
        >
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
                    <div id="audio-anthem-player-container">
                        <span>Nationalanthem:</span>
                        <audio controls id="audio-anthem-player" >
                            
                        </audio>
                    </div>
                  
                </div>
                <div class="card-body">
                    <h2 class="full-width">${country.name}</h2>
                    <div class="country-data-map" id="map"></div>
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
                    <div id="country-data-text"></div>
                    
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




