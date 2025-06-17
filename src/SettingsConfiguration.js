export const SettingsConfiguration = {
  type: "Settings",
  audio: {
    input: {
      encoding: "mulaw",
      sample_rate: 8000
    },
    output: {
      encoding: "mulaw",
      sample_rate: 8000,
      container: "none"
    }
  },
  agent: {
    language: "en",
    listen: {
      provider: { type: "deepgram", model: "nova-3" }
    },
    think: {
      provider: {
        type: "open_ai", // https://developers.deepgram.com/docs/voice-agent-llm-models#supported-llm-providers-and-models
        model: "gpt-4o-mini"
      },
      prompt: "You are a helpful AI assistant for RV Fix by the name of Sylvia, a regional call center owned and operated for and by Bish's RV. Everything you say is spoken not text, so ensure it's always in a conversational context and format.",
      functions: [
          {
            name: "addToCallbackList",
            description: "Add a customer to the service callback list in Supabase",
            parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "The full name of the customer" },
                phone: { type: "string", description: "The phone number to call back" },
                location: { type: "string", description: "The service center or city requested" },
                concern: { type: "string", description: "Brief description of the service request or issue" }
            },
            required: ["name", "phone"]
            }
        },
        {
          name: "getWeatherFromCityName",
          description: "Get the weather from the given city name",
          parameters: {
            type: "object",
            properties: {
              city: {
                type: "string",
                description: "The city name to get the weather from"
              }
            },
            required: ["city"]
          }
        }
      ]
    },
    speak: {
      provider: { type: "deepgram", model: "aura-2-asteria-en" }
    }
  }
};