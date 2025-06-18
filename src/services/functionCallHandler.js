import {
  getWeatherFromCityName,
  addToCallbackList,
  scheduleTechAppointment,
  getCustomerInfoByPhone,
  getAvailableTechnicians,
  getCurrentDateTime // ← Add this
} from "./functionCall.js";

export async function handleFunctionCall(functions, deepgramWs) {
  try {
    const funct = functions?.[0];
    if (!funct?.name || !funct?.arguments) {
      console.warn("No valid function call found.");
      return;
    }

    const functArguments = JSON.parse(funct.arguments);
    let result;

switch (funct.name) {
  case "getWeatherFromCityName":
    result = await getWeatherFromCityName(functArguments.city);
    break;

  case "addToCallbackList":
    result = await addToCallbackList({
      name: functArguments.name,
      phone: functArguments.phone,
      location: functArguments.location,
      concern: functArguments.concern
    });
    break;

  case "scheduleTechAppointment":
    result = await scheduleTechAppointment({
      tech_email: functArguments.tech_email,
      vin_number: functArguments.vin_number,
      customer_email: functArguments.customer_email,
      service_request_id: functArguments.service_request_id,
      start_date: functArguments.start_date,
      end_date: functArguments.end_date,
      time_zone: functArguments.time_zone
    });
    break;

  case "getCustomerInfoByPhone":
    result = await getCustomerInfoByPhone({
      phone_number: functArguments.phone_number
    });
    break;

    case "getAvailableTechnicians":
  result = await getAvailableTechnicians({
    time_zone: functArguments.time_zone,
    service_request_id: functArguments.service_request_id,
    start_date: functArguments.start_date,
    end_date: functArguments.end_date,
    offset: functArguments.offset || 0,
    limit: functArguments.limit || 100
  });
  break;

  default:
    console.warn(`Unknown function call name: ${funct.name}`);
    result = `I don't know how to handle the function: ${funct.name}`;
    break;

    case "getCurrentDateTime":
        result = await getCurrentDateTime();
        break;
}


    const functionCallResponse = {
      type: "FunctionCallResponse",
      id: funct.id,
      name: funct.name,
      content: result
    };

    console.log("Sending FunctionCallResponse:", functionCallResponse);
    deepgramWs.send(JSON.stringify(functionCallResponse));

  } catch (error) {
    console.error("❌ Error handling function call:", error);
  }
}
