import {
  Agent,
  ConversationMemory,
  GeminiProvider,
  ToolRegistry,
} from "@subhajit60/aiagent";

export const agent = new Agent({
  name: "MyAgent",
  provider: new GeminiProvider({ defaultModel: "gemini-3.5-flash" }),
  memory: new ConversationMemory(),
  tools: new ToolRegistry([]),
});
