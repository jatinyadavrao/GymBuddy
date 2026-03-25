import { GoogleGenerativeAI } from "@google/generative-ai";

let cachedKey = "";
let cachedClient = null;

const getClient = () => {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return null;
  }

  if (!cachedClient || cachedKey !== key) {
    cachedKey = key;
    cachedClient = new GoogleGenerativeAI(key);
  }

  return cachedClient;
};

const getModel = () => {
  const client = getClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY is missing");
  }
  return client.getGenerativeModel({ model: "gemini-2.5-flash" });
};

const extractJson = (text) => {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const cleaned = jsonMatch ? jsonMatch[1].trim() : text.trim();
    // Sometimes Gemini outputs leading/trailing non-json strings, we use match to extract just the curly braces block if it fails.
    if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
       const braceMatch = cleaned.match(/(\{|\[)[\s\S]*(\}|\])/);
       if (braceMatch) {
         return JSON.parse(braceMatch[0]);
       }
    }
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn("Failed to parse Gemini response JSON. Raw text:", text);
    return null;
  }
};

export const analyzeBioWithGemini = async (bio) => {
  try {
    const model = getModel();
    const prompt = `You are a fitness social app assistant. Analyze this gym bio and return valid JSON only with keys: summarizedBio (string), personalityTraits (string[]), workoutStyle (string). Bio: ${bio}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson(text);

    return (
      parsed || {
        summarizedBio: bio.slice(0, 150),
        personalityTraits: ["motivated"],
        workoutStyle: "balanced"
      }
    );
  } catch (error) {
    console.error("Gemini analyzeBio fallback invoked:", error.message);
    return {
       summarizedBio: bio.slice(0, 100) + "... (AI summary unavailable)",
       personalityTraits: ["active", "determined"],
       workoutStyle: "mixed"
    };
  }
};

export const analyzeCompatibilityWithGemini = async (bioA, bioB) => {
  try {
    const model = getModel();
    const prompt = `User A bio: ${bioA}\nUser B bio: ${bioB}\nAnalyze compatibility as gym partners. Return valid JSON only with keys: compatibilityExplanation (string), suggestedWorkout (string).`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson(text);

    return (
      parsed || {
        compatibilityExplanation: "Both users appear compatible for consistent gym sessions.",
        suggestedWorkout: "Push-Pull-Legs split with one partner day."
      }
    );
  } catch (error) {
    console.error("Gemini compatibility fallback invoked:", error.message);
    return {
      compatibilityExplanation: "Based on profiles, these users have compatible fitness goals.",
      suggestedWorkout: "A solid full-body circuit or shared cardio session."
    };
  }
};

export const calculateAiMatchScore = async (profileA, profileB) => {
  try {
    const model = getModel();
    const prompt = `User A Profile: ${profileA}\nUser B Profile: ${profileB}\nCalculate a match score (0-100) based on fitness goals, schedule, and interests. CRITICAL: Pay very close attention to the "gender" fields of both users, and explicitly analyze both users' bios to see if they state a preference for a specific gender (e.g., "looking for a female partner", "want a male gym bro"). If their gender preferences strongly clash, severely penalize the score (e.g., < 40). Return valid JSON only with keys: score (number), reason (string, max 20 words).`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson(text);

    return {
      score: typeof parsed?.score === "number" ? parsed.score : 80,
      reason: parsed?.reason || "Compatible goals and schedule."
    };
  } catch (error) {
    console.error("Gemini match score fallback invoked:", error.message, error.stack);
    return {
      score: 75,
      reason: "Basic fitness compatibility detected."
    };
  }
};

export const generateIcebreakersWithGemini = async (bioA, bioB) => {
  try {
    const model = getModel();
    const prompt = `Generate 5 gym-related conversation starters between these users. Return valid JSON only as {\"icebreakers\": string[]}. User A bio: ${bioA}. User B bio: ${bioB}.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson(text);

    return parsed?.icebreakers?.slice(0, 5) || [
      "What does your ideal weekly workout split look like?",
      "What fitness goal are you most focused on this month?",
      "Do you prefer strength sets or high-intensity circuits?",
      "What is your favorite post-workout meal?",
      "Want to plan a morning session this week?"
    ];
  } catch (error) {
    console.error("Gemini icebreakers fallback invoked:", error.message);
    return [
      "Hey! What's your go-to workout routine?",
      "Do you prefer morning or evening gym sessions?",
      "What muscle group are you focusing on today?",
      "Interested in spotting each other for heavy lifts?",
      "What's your favorite gym music playlist?"
    ];
  }
};

export const generateWorkoutSuggestions = async (profileText) => {
  try {
    const model = getModel();
    const prompt = `Create a concise 7-day workout suggestion for this profile. Return valid JSON only with key \"plan\" as string[]. Profile: ${profileText}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson(text);
    return parsed?.plan || ["Day 1: Full body strength", "Day 2: Cardio + mobility"];
  } catch (error) {
    console.error("Gemini workout suggestions fallback invoked:", error.message);
    return [
      "Day 1: Full body strength focus", 
      "Day 2: Active recovery or light cardio",
      "Day 3: Upper body push/pull",
      "Day 4: Rest and mobility",
      "Day 5: Lower body power",
      "Day 6: HIIT and core",
      "Day 7: Complete rest"
    ];
  }
};
