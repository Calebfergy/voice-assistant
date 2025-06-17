import { getWeatherFromCityName, addToCallbackList } from "./functionCall.js";

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

      default:
        console.warn(`Unknown function call name: ${funct.name}`);
        result = `I don't know how to handle the function: ${funct.name}`;
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
