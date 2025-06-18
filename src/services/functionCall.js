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



// 📅 Schedule a tech appointment
export const scheduleTechAppointment = async ({ tech_email, vin_number, customer_email, service_request_id, start_date, end_date, time_zone }) => {
  console.log("📅 Scheduling appointment:", { tech_email, vin_number, customer_email, service_request_id, start_date, end_date, time_zone });

  const { data, error } = await supabase
    .from("post_diagnostic_appointments")
    .insert([{ tech_email, vin_number, customer_email, service_request_id, start_date, end_date, time_zone }]);

  if (error) {
    console.error("❌ Supabase error (schedule):", error);
    return "Sorry, I couldn't schedule the appointment right now.";
  }

  return `You're all set. A technician has been scheduled from ${start_date} to ${end_date} in the ${time_zone} timezone.`;
};

// 📇 Get customer info by phone number
export const getCustomerInfoByPhone = async ({ phone_number }) => {
  console.log("🔍 Fetching customer by phone:", phone_number);

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("phone_number", phone_number)
    .single();

  if (error || !data) {
    console.error("❌ Supabase error (lookup):", error);
    return "I couldn't find any customer with that phone number.";
  }

  return `I found the customer: ${data.first_name} ${data.last_name}.`;
};

export const getAvailableTechnicians = async ({ time_zone, service_request_id, start_date, end_date, offset = 0, limit = 100 }) => {
  console.log("🔍 Getting availabilities for:", { time_zone, service_request_id, start_date, end_date });

  const { data, error } = await supabase
    .from("technician_availabilities")
    .select("email, start, end, status, day")
    .eq("status", "Available")
    .gte("start", start_date)
    .lte("end", end_date)
    .range(offset, offset + limit - 1); // Supabase uses 0-based indexing

  if (error) {
    console.error("❌ Error fetching availabilities:", error);
    return "There was a problem retrieving availability.";
  }

  if (!data || data.length === 0) {
    return "There are no available technicians in that time window.";
  }

  return data; // Deepgram will format this as JSON in the function response
};


// 🕒 Get current date/time
export const getCurrentDateTime = async () => {
  const now = new Date();
  const date = now.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  return `It is currently ${time} on ${date}.`;
};
