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
prompt: `You are a helpful AI assistant named Sylvia working for RV Fix, a division of Bish's RV. You answer customer calls conversationally and can:
- Schedule technician appointments
- Retrieve customer info
- Add people to a callback list
- Give weather updates

Speak naturally and act like you're on the phone.

Always validate information with the customer if it's something that is important, such as VIN or Email.`,
      functions: [
        {
        name: "getAvailableTechnicians",
        description: "Get available technicians during the customer-defined time window",
        parameters: {
            type: "object",
            properties: {
            time_zone: {
                type: "string",
                enum: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix"]
            },
            service_request_id: { type: "integer" },
            start_date: { type: "string", format: "date-time" },
            end_date: { type: "string", format: "date-time" },
            offset: { type: "integer", default: 0 },
            limit: { type: "integer", default: 100 }
            },
            required: ["time_zone", "service_request_id", "start_date", "end_date"]
        }
        },
        {
            name: "scheduleTechAppointment",
            description: "Schedule a technician appointment in Supabase",
            parameters: {
                type: "object",
                properties: {
                tech_email: { type: "string", description: "The technician's email address." },
                vin_number: { type: "string", description: "The VIN number of the customer's RV" },
                customer_email: { type: "string", description: "The Customer's preferred email" },
                service_request_id: { type: "integer", description: "The ID of the linked service request" },
                start_date: { type: "string", format: "date-time", description: "Appointment start time in ISO format" },
                end_date: { type: "string", format: "date-time", description: "Appointment end time in ISO format" },
                time_zone: {
                    type: "string",
                    enum: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix"],
                    description: "Time zone of the customer for their virtual call"
                }
                },
                required: ["tech_email", "service_request_id", "start_date", "end_date", "time_zone"]
            }
            },
            {
            name: "getCustomerInfoByPhone",
            description: "Retrieve customer details by phone number",
            parameters: {
                type: "object",
                properties: {
                phone_number: {
                    type: "string",
                    description: "Phone number of the customer in E.164 format"
                }
                },
                required: ["phone_number"]
            }
            },
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