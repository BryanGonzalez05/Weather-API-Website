

let weatherData = [
    {
        id: crypto.randomUUID(),
        location: "Location",
        temp: "Temperature",
        weather: "Weather",
        windSpeed: "Wind Speed",
        active:true
    }
];

let savedCoord = [];

const apiKey = "Enter your key here";
const from = document.getElementById("searchBar");
const inputBox = document.getElementById("inputbox");
const tabContainer = document.querySelector(".tabcontainer");
const warningText = document.getElementById("warningText");
const tabPlus = document.querySelector(".tabPlus");

//displayCase elements
const displayLocation = document.getElementById("displayLocation");
const displayTemperature = document.getElementById("displayTemperature");
const displayWeather = document.getElementById("displayWeather");
const displayWindSpeed = document.getElementById("displayWindSpeed");


//takes user input
from.addEventListener("submit",async (e)=>{
    e.preventDefault(); //stops the page from reloading
    const input = inputBox.value.trim().toLowerCase();

    if(!input){
        warningText.textContent = "Enter a location!"
        warningText.classList.remove("hidden");
        warningText.classList.add("warning");
        return;
    }
    else {
        warningText.classList.add("hidden");
        warningText.classList.remove("warning");
    }

    const userInput = splitInput(input);
    
    if(weatherData.find(d => d.location === userInput.fullLocation)){
        weatherData.forEach(a => a.active = a.location=== userInput.fullLocation);
        saveState();
        renderTabs();
        renderWeather();
        return;
    }

    const inputCoords = await getCoords(userInput);

    if(!inputCoords){
        warningText.textContent = "Error! invalid!";
        warningText.classList.remove("hidden");
        warningText.classList.add("warning");
        return;
    }
    else{
        warningText.classList.add("hidden");
        warningText.classList.remove("warning");
        let infoW = await getWeather(inputCoords);

        if(!infoW){
            warningText.textContent = "Could not fetch weather!";
            warningText.classList.remove("hidden");
            warningText.classList.add("warning");
            return;
        }

        infoW.temp = tempConvert(infoW.temp);

        //get the tab that is active and change text 
        weatherData.forEach(data =>{
            if(data.active){
                if(userInput.state){
                    data.location = userInput.fullLocation;
                    data.temp = infoW.temp;
                    data.weather = infoW.w;
                    data.windSpeed = infoW.windSpeed;
                }else{
                    data.location = userInput.fullLocation
                    data.temp = infoW.temp;
                    data.weather = infoW.w;
                    data.windSpeed = infoW.windSpeed;
                }
            }
        });
        
    saveState();
    renderTabs();
    renderWeather();
    }
    inputBox.value = "";
})


//get the coords of location via api
async function getCoords(o){
    try{

        let response;
        if(o.state){
            //encodeURLComponent makes the url safe and valid so the url does not misinterpret the link
            response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(`${o.city},${o.state},${o.region}`)}&limit=1&appid=${apiKey}`);
        }
        else{
            response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(`${o.city},${o.region}`)}&limit=1&appid=${apiKey}`);
        }

        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`)    
        }
        
        const data = await response.json();

        //if the json file does not have anything meaning the location DNE
        if(!data.length){
            throw new Error(`Location not Found`);
        }

        const lat = data[0].lat;
        const lon = data[0].lon;
        
        return {lat, lon};
    }
    catch(error){
        console.error(error);
        return null;
    }
}

//splits user input into objects ex: city: queens, state: NY, region: USA
function splitInput(i){
    let city = "";
    let state = "";
    let region = "";
    let fullLocation = ""
    if(i.includes(",")){
        const words = i.split(",");
        if(words.length > 2){
            city = words[0].trim().toLowerCase();
            state = words[1].trim().toUpperCase();
            region = words[2].trim().toUpperCase();
            fullLocation = city + ", " + state + ", " + region;
            return {city, state, region, fullLocation};
        }
        else{
            city = words[0].trim().toLowerCase();
            region = words[1].trim().toUpperCase();
            fullLocation = city + ", " + region;
            return {city, region, fullLocation};
        }
    }
    else{
        const parts = i.split(" ");
        if(parts.length >= 3){
            if(parts[parts.length-2].length == 2){
                //joins the slice array into a string
                //ex: ["los", "angles"].join(" ") = "los angles"
                city = parts.slice(0, -2).join(" ").toLowerCase().trim();
                state = parts[parts.length-2].trim().toUpperCase();
                region = parts[parts.length-1].trim().toUpperCase();
                fullLocation = city + ", " + state + ", " + region;
                return{city,state,region,fullLocation};
            }
            else{
                //same here
                city = parts.slice(0,-1).join(" ").toLowerCase().trim();
                region = parts[parts.length-1].trim().toUpperCase();
                fullLocation = city + ", " + region;
                return{city,region,fullLocation};
            }
        }
        else{
            [city, region] = parts.map(p => p.trim());
            region = region.toUpperCase();
            fullLocation = city + ", " + region;
            return {city, region, fullLocation};
        }
    }
}

//get the weather of location from coords
async function getWeather(coord){
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`);

        if(!response.ok){
            throw new Error(`HTTP error! status:${response.status}`);
        }

        const data = await response.json();

        const temp = data.main.temp;
        const w = data.weather[0].main;
        const windSpeed = data.wind.speed;
        return{temp, w, windSpeed};
    }
    catch(e){
        console.error(e);
        return null;
    }
}

//creates new tabs 
tabPlus.addEventListener("click",()=>{
    warningText.textContent = "Max Tabs is 4"
    const tabs = tabContainer.querySelectorAll(".tab")
    if(tabs.length >= 4){
        if(!warningText.classList.contains("warning")){
            warningText.classList.remove("hidden");
            warningText.classList.add("warning");
        }
    }
    else{

        if(!warningText.classList.contains("hidden")){
            warningText.classList.remove("warning");
            warningText.classList.add("hidden");
        }
            
        const newTabData ={
                id: crypto.randomUUID(),
                location: "Location",
                temp: "Temperature",
                weather: "Weather",
                windSpeed: "Wind Speed",
                active:true 
            }

        weatherData.forEach(data => {
            data.active = false;
        });
        
        weatherData.push(newTabData);
        saveState();
        loadState();
        renderTabs();
        renderWeather();
    }
    
});

//removes all tabs and sets it to default one
function clearTabs(){
    //clear tab info
    weatherData = [];
    //clear tabs from local storage
    localStorage.removeItem("weatherTabs")

    count = 0;
    if(warningText.classList.contains("warning")){
            warningText.classList.remove("warning");
            warningText.classList.add("hidden")
    }

    //Re-render tabs
    const newTab = document.createElement("div");
    newTab.classList.add("tab");
    newTab.textContent = "Location"
    const newTabData ={
            id: crypto.randomUUID(),
            location: "Location",
            temp: "Temperature",
            weather: "Weather",
            windSpeed: "Wind Speed",
            active: true
        }

        weatherData.push(newTabData);

        saveState();
        loadState();
        renderTabs();
        renderWeather();
    
}

//saves all weather info
function saveState(){
    //stores weather State array in a json called weatherTabs
    localStorage.setItem("weatherTabs", JSON.stringify(weatherData));
}

//loads the saved info to the weather state array
function loadState(){
    //get json file with stored array of objects
    const saved = localStorage.getItem("weatherTabs");
    //if saved does not exit or is empty return
    if(!saved)return;

    //past all information on JSON file to array
    weatherData = JSON.parse(saved);
}

//renders the info from the array and puts id to the tab 
function renderTabs(){

    //removes existing tabs
    const existingTabs = tabContainer.querySelectorAll(".tab");
    existingTabs.forEach(t => t.remove());

    const check = (weatherData.length-1 > 0)
    weatherData.forEach(tabData =>{
        const tab = document.createElement("div");
        tab.classList.add("tab");

        //create the close button for each tab
        const closeB = document.createElement("button");
        closeB.classList.add("remove");
        closeB.textContent ="X";

        //if there is only one tab open then there is no need for the button
        if(!check){
            closeB.classList.remove("remove");
            closeB.classList.add("hidden");
        }

        if(tabData.active){
            tab.classList.add("active"); 
        }
            
        tab.dataset.id = tabData.id;
        tab.textContent = tabData.location;
        tab.appendChild(closeB);

        closeB.addEventListener("click", (e)=>{
            e.stopPropagation();
            closeTab(closeB.parentElement);
        });

        tab.addEventListener("click", ()=>{
        setActiveTab(tab.dataset.id);
        });

        tabContainer.insertBefore(tab, tabPlus);
    });
    
}

//deletes a tab;
function closeTab(tab){
    const index = weatherData.findIndex(
        data => data.id === tab.dataset.id
    );
    const ob = weatherData[index].active;
    weatherData.splice(index, 1);
    if(ob){
        weatherData[weatherData.length-1].active = true;    
    }

    saveState();
    renderTabs();
    renderWeather();
}

//when clicking a tab it add the active class to make it display info
function setActiveTab(tabId){

    weatherData.forEach(data =>{
        data.active = (data.id === tabId);
    });
    
    saveState(); //save new activeState
    renderTabs(); //updates tabs
    renderWeather(); //updates the displayCase
}

//renders the info to the displayCase 
function renderWeather(){
    weatherData.forEach(data =>{
        if(data.active){
            displayLocation.textContent = data.location;
            displayTemperature.textContent = data.temp + "°F";
            displayWeather.textContent = data.weather;
            displayWindSpeed.textContent = data.windSpeed + " mph";
        }
    });
}

//convert weather kelvin to farienheight 
function tempConvert(k){
    const f = (k-273.15)*(9/5)+32;
    return Math.trunc(f);
}

loadState();
renderTabs();
renderWeather();