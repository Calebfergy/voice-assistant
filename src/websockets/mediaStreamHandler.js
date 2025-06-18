import WebSocket from "ws";
import { SettingsConfiguration } from "../SettingsConfiguration.js";
import { DEEPGRAM_API_KEY } from "../config/dotenv.js";
import { handleFunctionCall } from "../services/functionCallHandler.js";
import { v4 as uuidv4 } from "uuid";
const sessions = new Map(); // NEW: holds active sessions

export default function mediaStreamHandler(fastify) {
  fastify.register(async (fastify) => {
    fastify.get("/media-stream", { websocket: true }, (connection, req) => {
      const sessionId = uuidv4();
      console.log(`[WS] Client connected — Session: ${sessionId}`);
    
      const session = {
        streamSid: null,
        latestMediaTimestamp: 0,
        deepgramWs: null,
      };
      sessions.set(sessionId, session);

      // Initialize Deepgram WebSocket
      const deepgramWs = new WebSocket("wss://agent.deepgram.com/v1/agent/converse", {
        headers: {
          Authorization: "Token " + DEEPGRAM_API_KEY
        }
      });

      // Event: Deepgram WebSocket open
        deepgramWs.on("open", () => {
        console.log("[Deepgram] Connected");

        // Assign to session object first
        session.deepgramWs = deepgramWs;

        // Now it's safe to use
        session.deepgramWs.send(JSON.stringify(SettingsConfiguration));
        });

      // Event: Deepgram WebSocket close
      deepgramWs.on("close", () => {
        console.log("[Deepgram] Disconnected");
      });

      // Event: Deepgram WebSocket error
      deepgramWs.on("error", (error) => {
        console.error("[Deepgram] Error: ", error);
      });

      // Event: Deepgram WebSocket message
      deepgramWs.on("message", async (message, isBinary) => {
        try {
          // Process messages
          if (isBinary) {
            const audioDelta = {
              event: "media",
              streamSid: session.streamSid,
              media: { payload: Buffer.from(message).toString("base64") }
            };

            connection.send(JSON.stringify(audioDelta));
            connection.send(
              JSON.stringify({
                event: "mark",
                streamSid: session.streamSid,
                mark: { name: "responsePart" }
              })
            );
          } else {
            // Process JSON messages
            const response = JSON.parse(message);
            switch (response.type) {
              case "SettingsApplied":
                console.log("[Deepgram] Settings applied successfully");
                session.deepgramWs.send(
                  JSON.stringify({
                    type: "InjectAgentMessage",
                    content: "Thank you for calling RV Fix, my name is Sylvia, how can I help you today?"
                  })
                );
                break;
              case "Welcome":
                console.log("[Deepgram] Welcome message received");
                break;
              case "UserStartedSpeaking":
                console.log("[Deepgram] User started speaking");
                    connection.send(JSON.stringify({ event: "clear", streamSid: session.streamSid }));
                break;
              case "FunctionCallRequest":
                console.log("[Deepgram] Function call request: ", response);
                await handleFunctionCall(response.functions, deepgramWs);
                break;
              default:
                console.log("[Deepgram] Response received: ", response);
            }
          }
        } catch (error) {
          console.error("[Deepgram] Error processing message: ", error, "Message: ", message);
        }
      });

      // Event: Twilio WebSocket message
      connection.on("message", (message) => {
        try {
          const data = JSON.parse(message);

          switch (data.event) {
            case "media":
              session.latestMediaTimestamp = data.media.timestamp;
              if (session.deepgramWs && session.deepgramWs.readyState === WebSocket.OPEN) {
                session.deepgramWs.send(Buffer.from(data.media.payload, "base64"));
              }
              break;
            case "start":
              session.streamSid = data.start.streamSid;
              console.log("[Twilio] Stream started. SID:", session.streamSid);
              session.latestMediaTimestamp = 0;
              break;
            default:
            // console.log("[Twilio] Non-media event: ", data.event);
          }
        } catch (error) {
          console.error("[Twilio] Error parsing message: ", error, "Message: ", message);
        }
      });

      // Event: WebSocket connection close
      connection.on("close", () => {
        if (deepgramWs.readyState === WebSocket.OPEN) deepgramWs.close();
        console.log("[WS] Client disconnected");
      });
    });
  });
}
