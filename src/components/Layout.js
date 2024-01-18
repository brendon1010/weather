import React, { useState, useEffect, useRef } from "react";
import { useGeolocated } from "react-geolocated"; //import geolocated hook

export default function Layout() {
  const [currLocation, setCurrLocation] = useState(null); //state to store sting with location details
  const [currCity, setCurrCity] = useState(null); //state to store only city name to use in api call
  const [currWeather, setCurrWeather] = useState(null); //state to store weather in users location

  const { coords } = useGeolocated(); //use geolocated hook to get users coords to get latitude and longitude

  useEffect(() => {
    if (coords) {
      async function userLocation() {
        const { latitude, longitude } = coords; //get latitude and longitude to use in api

        fetch(
          //call api
          `http://api.timezonedb.com/v2.1/get-time-zone?key=X6JMDDGCNBG2&format=json&by=position&lat=${latitude}&lng=${longitude}`
        )
          .then((res) => res.json()) //convert response to json
          .then((data) => {
            setCurrLocation(`${data.cityName}, ${data.countryName}`); //set the users location as a string
            setCurrCity(data.cityName); //store users city
          })
          .catch((error) => {
            //error handling
            setCurrLocation(`(${error})`);
          });

        //api to get weather using users city
        fetch(
          `https://api.weatherapi.com/v1/current.json?key=5a2ca7c7b99c423dbed112539231711&q=${currCity}`
        )
          .then((res) => res.json())
          .then((data) => {
            setCurrWeather(
              `${data.current.condition.text} (${data.location.localtime.slice(
                11
              )})`
            ); //create string with both the weather and time
          })
          .catch((error) => {
            setCurrWeather(`(${error})`);
          });
      }
      userLocation();
    }
  }, [coords, currCity]); //use coords and currCity as dependences

  const [weather, setWeather] = useState(null); //state for storing the weather
  const [icon, setIcon] = useState(
    "//cdn.weatherapi.com/weather/64x64/day/113.png"
  ); //state for the image url for the corresponding weather
  const [city, setCity] = useState(null); //state to store input from user for the city
  const [time, setTime] = useState(null); //state to store day or night
  const myRef = useRef(null); //ref to foucus on input box

  useEffect(() => {
    //effect to fetch api
    myRef.current.focus(); //focus on input
    if (city !== null) {
      //check to see if city hasnt yet been defined
      async function weatherapi() {
        fetch(
          `https://api.weatherapi.com/v1/current.json?key=5a2ca7c7b99c423dbed112539231711&q=${city}` //fetch the api with the users city
        )
          .then((res) => res.json()) //convert to usable object
          .then((data) => {
            setWeather(`${String(data.current.condition.text)} in ${city}`); //set the weather
            setIcon(String(data.current.condition.icon)); //set the icon
            if (Number(data.current.is_day) === 1) {
              //check if day is 1
              setTime(`Day (${String(data.location.localtime.slice(11))})`);
            } else {
              setTime(`Night (${String(data.location.localtime.slice(11))})`);
            }
          })
          .catch((error) => {
            setWeather("City Not Found! " + error); //error handling
            setTime("N/A");
          });
      }
      weatherapi();
    }
  }, [city]); //let city be dependency

  function handleWeather() {
    //function to set user input to city on button click
    let userInput = document.querySelector("input");
    setCity(userInput.value);
    userInput.value = "";
  }

  return (
    <div>
      <h1>Enter City Name</h1>
      <img className="myImage" src={icon} alt="icon" />
      <input className="inputBox" type="text" ref={myRef} />
      <button onClick={handleWeather}>Enter</button>
      <h2>weather: {weather}</h2>
      <h2>Time: {time}</h2>
      <br />
      <br />
      <hr />
      <h1>weather in {currLocation}</h1>
      <h2>{currWeather}</h2>
    </div>
  );
}
