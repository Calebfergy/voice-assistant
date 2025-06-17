import { WEATHER_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY } from "../config/dotenv.js";
import { createClient } from '@supabase/supabase-js';

// 🌦️ Get weather info
export const getWeatherFromCityName = async (city) => {
  console.log("getWeatherFromCityName", city, WEATHER_API_KEY);

  const response = await fetch(`https://api.weatherapi.com/v1/current.json?q=${city}&key=${WEATHER_API_KEY}`);
  const text = await response.text();
  const data = JSON.parse(text);

  console.log("get Weather response", data);

  if (response.status === 200) {
    return data.current.temp_c + " degree Celsius";
  } else if (response.status === 1002) {
    return "Cannot get the weather details for " + city;
  } else if (response.status === 1006) {
    return "No matching location found. Cannot get the weather details for " + city;
  } else {
    return "Failed to fetch weather data";
  }
};

// 🧾 Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 📞 Add a callback request to Supabase
export const addToCallbackList = async ({ name, phone, location, concern }) => {
  console.log("addToCallbackList:", { name, phone, location, concern });

  const { data, error } = await supabase
    .from("callback_requests")
    .insert([{ name, phone, location, concern }]);

  if (error) {
    console.error("❌ Supabase error:", error);
    return "Sorry, something went wrong while adding you to the callback list.";
  }

  console.log("✅ Callback request saved:", data);
  return `You're all set! A team member from ${location || 'RV Fix'} will give you a call back shortly.`;
};
