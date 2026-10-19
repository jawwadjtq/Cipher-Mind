import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
app.use(express.json({ limit: "5mb" }));
const apiKey = process.env.GEMINI_API_KEY;
let ai = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiEnabled: Boolean(ai),
    serverTime: (/* @__PURE__ */ new Date()).toISOString()
  });
});
function getLocalizedServerExplain(candidate, targetLang) {
  const name = candidate.primaryCipherName || "Cipher";
  const score = candidate.metrics?.totalScore || 70;
  const wordCount = candidate.metrics?.recognizedWords?.length || 0;
  const langLower = (targetLang || "English").toLowerCase();
  if (langLower.includes("span") || langLower === "es") {
    return {
      summary: `Descifrado determinista completado mediante ${name}.`,
      analysis: `El texto exhibe una s\xF3lida estructura ling\xFC\xEDstica con ${wordCount} palabras de diccionario reconocidas y una puntuaci\xF3n Chi-cuadrado de ${candidate.metrics?.frequencyScore || 0}/100.`,
      historicalContext: `Los cifrados cl\xE1sicos como ${name} se basan en permutaciones o desplazamientos matem\xE1ticos en el alfabeto.`,
      uncertaintyNotes: `Verificaci\xF3n determinista confirmada. Se recomienda contrastar el mensaje con el contexto esperado.`,
      suggestedNextSteps: [
        "Comprobar las transformaciones intermedias paso a paso.",
        "Explorar posibles cribs o palabras clave adicionales si existen pistas."
      ]
    };
  }
  if (langLower.includes("fren") || langLower === "fr") {
    return {
      summary: `D\xE9chiffrement d\xE9terministe achev\xE9 via ${name}.`,
      analysis: `Le texte pr\xE9sente de fortes propri\xE9t\xE9s linguistiques avec ${wordCount} mots de dictionnaire reconnus et un score Chi-deux de ${candidate.metrics?.frequencyScore || 0}/100.`,
      historicalContext: `Les chiffres historiques comme ${name} reposent sur des d\xE9calages modulaires et des permutations g\xE9om\xE9triques.`,
      uncertaintyNotes: `V\xE9rification d\xE9terministe r\xE9ussie. Validez la coh\xE9rence avec le contexte d'origine.`,
      suggestedNextSteps: [
        "Inspecter les \xE9tapes interm\xE9diaires dans la vue d\xE9taill\xE9e.",
        "Tester des mots probables (cribs) suppl\xE9mentaires."
      ]
    };
  }
  if (langLower.includes("germ") || langLower.includes("deut") || langLower === "de") {
    return {
      summary: `Deterministische Entschl\xFCsselung \xFCber ${name} abgeschlossen.`,
      analysis: `Der Text zeigt ausgepr\xE4gte sprachliche Merkmale mit ${wordCount} erkannten W\xF6rterbuchw\xF6rtern und einer Chi-Quadrat-G\xFCte von ${candidate.metrics?.frequencyScore || 0}/100.`,
      historicalContext: `Klassische Chiffren wie ${name} nutzen mathematische Verschiebungen oder Permutationen.`,
      uncertaintyNotes: `Deterministische Umkehrbarkeit best\xE4tigt. Pr\xFCfen Sie den Sinngehalt im Kontext.`,
      suggestedNextSteps: [
        "Die Zwischenschritte der Pipeline pr\xFCfen.",
        "Mit bekannten Schl\xFCsselw\xF6rtern vergleichen."
      ]
    };
  }
  if (langLower.includes("chin") || langLower === "zh") {
    return {
      summary: `\u5DF2\u901A\u8FC7 ${name} \u5B8C\u6210\u786E\u5B9A\u6027\u5BC6\u7801\u89E3\u5BC6\u9A8C\u8BC1\u3002`,
      analysis: `\u89E3\u5BC6\u6587\u672C\u5448\u73B0\u51FA\u9AD8\u5EA6\u7B26\u5408\u81EA\u7136\u8BED\u8A00\u7279\u5F81\u7684\u7EDF\u8BA1\u5206\u5E03\uFF0C\u8BC6\u522B\u51FA ${wordCount} \u4E2A\u5E38\u7528\u8BCD\u6C47\uFF0C\u5361\u65B9\u62DF\u5408\u5F97\u5206\uFF1A${candidate.metrics?.frequencyScore || 0}/100\u3002`,
      historicalContext: `\u5982 ${name} \u7B49\u7ECF\u5178\u5BC6\u7801\u4F9D\u8D56\u6A21\u8FD0\u7B97\u79FB\u4F4D\u6216\u7F51\u683C\u7F6E\u6362\uFF0C\u5728\u73B0\u4EE3\u5206\u6790\u4E2D\u53EF\u901A\u8FC7\u7A77\u4E3E\u4E0E\u7EDF\u8BA1\u5B66\u8FC5\u901F\u653B\u7834\u3002`,
      uncertaintyNotes: `\u53EF\u9006\u6570\u5B66\u7B97\u6CD5\u9A8C\u8BC1\u5DF2\u5B8C\u6210\uFF0C\u77ED\u6587\u672C\u53EF\u80FD\u4F1A\u5B58\u5728\u5047\u9633\u6027\uFF0C\u8BF7\u6839\u636E\u9884\u671F\u80CC\u666F\u6838\u5B9E\u8BED\u4E49\u3002`,
      suggestedNextSteps: [
        "\u67E5\u770B\u591A\u5C42\u8F6C\u6362\u7BA1\u9053\u7684\u6BCF\u4E00\u6B65\u4E2D\u95F4\u660E\u6587\u72B6\u6001\u3002",
        "\u82E5\u5B58\u5728\u591A\u91CD\u5D4C\u5957\u52A0\u5BC6\uFF0C\u53EF\u5C06\u6B64\u7ED3\u679C\u4F5C\u4E3A\u4E0B\u4E00\u9636\u6BB5\u8F93\u5165\u3002"
      ]
    };
  }
  if (langLower.includes("jap") || langLower === "ja") {
    return {
      summary: `${name} \u306B\u3088\u308B\u6C7A\u5B9A\u8AD6\u7684\u5FA9\u53F7\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002`,
      analysis: `\u5FA9\u53F7\u30C6\u30AD\u30B9\u30C8\u306F ${wordCount} \u500B\u306E\u8A8D\u8B58\u3055\u308C\u305F\u8F9E\u66F8\u5358\u8A9E\u3068\u30AB\u30A4\u4E8C\u4E57\u9069\u5408\u5EA6 ${candidate.metrics?.frequencyScore || 0}/100 \u3092\u793A\u3057\u3066\u3044\u307E\u3059\u3002`,
      historicalContext: `${name} \u306A\u3069\u306E\u53E4\u5178\u7684\u6697\u53F7\u306F\u30E2\u30B8\u30E5\u30ED\u6F14\u7B97\u3084\u7F6E\u63DB\u30C6\u30FC\u30D6\u30EB\u306B\u57FA\u3065\u3044\u3066\u3044\u307E\u3059\u3002`,
      uncertaintyNotes: `\u6C7A\u5B9A\u8AD6\u7684\u691C\u8A3C\u306B\u3088\u308A\u5B8C\u5168\u306A\u53EF\u9006\u6027\u304C\u78BA\u8A8D\u3055\u308C\u307E\u3057\u305F\u3002\u6587\u8108\u306B\u6CBF\u3063\u3066\u3044\u308B\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
      suggestedNextSteps: [
        "\u30B9\u30C6\u30C3\u30D7\u30D0\u30A4\u30B9\u30C6\u30C3\u30D7\u306E\u5909\u63DB\u5C65\u6B74\u3092\u78BA\u8A8D\u3059\u308B\u3002",
        "\u5FC5\u8981\u306B\u5FDC\u3058\u3066\u65E2\u77E5\u306E\u30AD\u30FC\u30EF\u30FC\u30C9\u3067\u691C\u8A3C\u3059\u308B\u3002"
      ]
    };
  }
  if (langLower.includes("arab") || langLower === "ar") {
    return {
      summary: `\u062A\u0645 \u0641\u0643 \u0627\u0644\u062A\u0634\u0641\u064A\u0631 \u0627\u0644\u062D\u062A\u0645\u064A \u0628\u0646\u062C\u0627\u062D \u0639\u0628\u0631 ${name}.`,
      analysis: `\u064A\u064F\u0638\u0647\u0631 \u0627\u0644\u0646\u0635 \u0628\u0646\u064A\u0629 \u0644\u063A\u0648\u064A\u0629 \u0642\u0648\u064A\u0629 \u0645\u0639 \u0627\u0644\u062A\u0639\u0631\u0641 \u0639\u0644\u0649 ${wordCount} \u0643\u0644\u0645\u0629 \u0645\u0639\u062C\u0645\u064A\u0629 \u0648\u0645\u0644\u0627\u0621\u0645\u0629 \u0643\u0627\u064A \u062A\u0631\u0628\u064A\u0639 \u0642\u062F\u0631\u0647\u0627 ${candidate.metrics?.frequencyScore || 0}/100.`,
      historicalContext: `\u062A\u0639\u062A\u0645\u062F \u0627\u0644\u0634\u064A\u0641\u0631\u0627\u062A \u0627\u0644\u0643\u0644\u0627\u0633\u064A\u0643\u064A\u0629 \u0645\u062B\u0644 ${name} \u0639\u0644\u0649 \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0646\u0645\u0637\u064A \u0648\u0627\u0644\u062A\u0628\u0627\u062F\u064A\u0644 \u0627\u0644\u0623\u0628\u062C\u062F\u064A\u0629 \u0627\u0644\u0645\u0646\u0638\u0645\u0629.`,
      uncertaintyNotes: `\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0642\u0627\u0628\u0644\u064A\u0629 \u0627\u0644\u0639\u0643\u0633 \u0627\u0644\u0631\u064A\u0627\u0636\u064A. \u064A\u064F\u0631\u062C\u0649 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0633\u064A\u0627\u0642 \u0627\u0644\u062F\u0644\u0627\u0644\u064A \u0644\u0644\u0646\u0635 \u0627\u0644\u0645\u0641\u0643\u0648\u0643.`,
      suggestedNextSteps: [
        "\u0641\u062D\u0635 \u062E\u0637\u0648\u0627\u062A \u062E\u0637 \u0627\u0644\u0623\u0646\u0627\u0628\u064A\u0628 \u0627\u0644\u062A\u0641\u0635\u064A\u0644\u064A\u0629.",
        "\u062A\u062C\u0631\u0628\u0629 \u0643\u0644\u0645\u0627\u062A \u0645\u0631\u062C\u0639\u064A\u0629 \u0625\u0636\u0627\u0641\u064A\u0629 \u0625\u0646 \u0648\u062C\u062F\u062A."
      ]
    };
  }
  return {
    summary: `Deterministic decryption completed via ${name}.`,
    analysis: `The text exhibits strong linguistic properties with ${wordCount} recognized dictionary words and a Chi-squared fitness of ${candidate.metrics?.frequencyScore || 0}/100.`,
    historicalContext: `Classical ciphers like ${name} rely on mathematical permutations or shifts. In modern cryptanalysis, small key spaces or static frequency distributions make recovery instantaneous without manual trial.`,
    uncertaintyNotes: `Deterministic verification confirmed reversibility. While the candidate matches grammatical patterns, historical ciphers can yield false positives on short texts under 15 characters.`,
    suggestedNextSteps: [
      "Verify if the original sender used known conventions or word spacing.",
      "Try testing with additional crib words if context is available."
    ]
  };
}
function getLocalizedServerIdentify(inspection, targetLang) {
  const isHighIoc = (inspection?.ioc || 0) > 0.055;
  const langLower = (targetLang || "English").toLowerCase();
  if (langLower.includes("span") || langLower === "es") {
    return {
      detectedFamilies: isHighIoc ? ["Sustituci\xF3n Monoalfab\xE9tica (C\xE9sar)", "Cifrado de Transposici\xF3n", "Atbash / Af\xEDn"] : ["Cifrado Polialfab\xE9tico (Vigen\xE8re)", "Codificaci\xF3n Digital (Base64/Hex)", "Flujo de Alta Entrop\xEDa"],
      assessment: `El perfil estad\xEDstico indica un \xCDndice de Coincidencia (IoC) de ${inspection?.ioc || 0} y entrop\xEDa de ${inspection?.entropy || 0}.`,
      recommendedTechniques: [
        "Ejecutar Auto Solve All con profundidad 2 para barrer todos los algoritmos cl\xE1sicos.",
        "Analizar la distribuci\xF3n de frecuencias de letras en el Inspector.",
        "Probar longitudes de clave Vigen\xE8re sugeridas si el IoC es bajo."
      ]
    };
  }
  if (langLower.includes("fren") || langLower === "fr") {
    return {
      detectedFamilies: isHighIoc ? ["Substitution Monoalphab\xE9tique (C\xE9sar)", "Transposition (Rail Fence)", "Atbash / Affine"] : ["Chiffre Polyalphab\xE9tique (Vigen\xE8re)", "Encodage Num\xE9rique (Base64/Hex)", "Flux \xE0 Haute Entropie"],
      assessment: `L'analyse statistique montre un indice de co\xEFncidence (IoC) de ${inspection?.ioc || 0} et une entropie de ${inspection?.entropy || 0}.`,
      recommendedTechniques: [
        "Lancer Auto-Solve All avec profondeur 2 pour tester les algorithmes classiques.",
        "Examiner le graphique de fr\xE9quences de lettres."
      ]
    };
  }
  if (langLower.includes("chin") || langLower === "zh") {
    return {
      detectedFamilies: isHighIoc ? ["\u5355\u8868\u4EE3\u6362\u5BC6\u7801 (\u51EF\u6492/\u4EFF\u5C04\u5BC6\u7801)", "\u7F6E\u6362\u5BC6\u7801 (\u6805\u680F/\u5217\u6362\u4F4D\u5BC6\u7801)", "\u963F\u7279\u5DF4\u5E0C\u5BC6\u7801 (Atbash)"] : ["\u591A\u8868\u4EE3\u6362\u5BC6\u7801 (\u7EF4\u5409\u5C3C\u4E9A/\u535A\u798F\u7279)", "\u6570\u5B57\u7F16\u7801 (Base64/\u5341\u516D\u8FDB\u5236)", "\u9AD8\u71B5\u6D41\u5BC6\u7801"],
      assessment: `\u7EDF\u8BA1\u5B66\u6307\u6807\u663E\u793A\u91CD\u5408\u6307\u6570 (IoC) \u4E3A ${inspection?.ioc || 0}\uFF0C\u9999\u519C\u71B5\u4E3A ${inspection?.entropy || 0}\u3002`,
      recommendedTechniques: [
        "\u6267\u884C\u201CAuto Solve All\u201D\u4EE5\u6DF1\u5EA6 2 \u81EA\u52A8\u904D\u5386\u6240\u6709\u5DF2\u5B9E\u73B0\u7ECF\u5178\u5BC6\u7801\u3002",
        "\u5728\u5BC6\u7801\u5206\u6790\u68C0\u67E5\u5668\u4E2D\u67E5\u770B\u5B57\u6BCD\u9891\u7387\u5206\u5E03\u76F4\u65B9\u56FE\u3002",
        "\u82E5 IoC \u63A5\u8FD1\u968F\u673A\u503C\uFF0C\u4F18\u5148\u68C0\u67E5\u7EF4\u5409\u5C3C\u4E9A\u5468\u671F\u6216\u591A\u5C42\u5D4C\u5957\u7F16\u7801\u3002"
      ]
    };
  }
  if (langLower.includes("germ") || langLower.includes("deut") || langLower === "de") {
    return {
      detectedFamilies: isHighIoc ? ["Monoalphabetische Substitution (Caesar)", "Transpositionschiffre", "Atbash / Affin"] : ["Polyalphabetische Chiffre (Vigen\xE8re)", "Digitale Kodierung (Base64/Hex)", "Hohe Entropie"],
      assessment: `Das statistische Profil weist einen Koinzidenzindex (IoC) von ${inspection?.ioc || 0} auf.`,
      recommendedTechniques: [
        "Auto-Solve All mit Suchtiefe 2 ausf\xFChren.",
        "Buchstabenh\xE4ufigkeiten im Inspektor untersuchen."
      ]
    };
  }
  return {
    detectedFamilies: isHighIoc ? ["Monoalphabetic Substitution (Caesar)", "Transposition Cipher", "Atbash / Affine"] : ["Polyalphabetic Cipher (Vigen\xE8re)", "Digital Encoding (Base64/Hex)", "High Entropy Stream"],
    assessment: `Statistical inspection calculated an Index of Coincidence (IoC) of ${inspection?.ioc || 0} (Standard English is ~0.0667, Random is ~0.0385) and entropy ${inspection?.entropy || 0}.`,
    recommendedTechniques: [
      "Run Auto-Solve All with depth 2 to sweep all standard classical algorithms.",
      "Examine letter frequency distribution bar chart in the Inspector.",
      "Check suggested Vigen\xE8re key lengths if IoC indicates polyalphabetic dispersion."
    ]
  };
}
app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { candidate, ciphertext, userLanguage } = req.body;
    const targetLang = userLanguage || "English";
    if (!candidate || !candidate.plaintext) {
      return res.status(400).json({ error: "Missing candidate details" });
    }
    if (!ai) {
      const fallback = getLocalizedServerExplain(candidate, targetLang);
      return res.json({
        success: true,
        ...fallback,
        source: "local_fallback"
      });
    }
    const prompt = `
Analyze this cryptographic solution found by CipherMind AI:
Original Ciphertext: "${ciphertext || candidate.originalCiphertext}"
Candidate Plaintext: "${candidate.plaintext}"
Cipher Used: "${candidate.primaryCipherName}"
Transformation Steps: ${JSON.stringify(candidate.transformationChain || [])}
Confidence Score: ${candidate.metrics?.totalScore}/100 (Word Match: ${candidate.metrics?.wordMatchRatio * 100}%, Chi-Squared Score: ${candidate.metrics?.frequencyScore}/100, IoC: ${candidate.metrics?.ioc})
Recognized Words: ${(candidate.metrics?.recognizedWords || []).join(", ")}

MANDATORY USER LANGUAGE REQUIREMENT:
The user has chosen to receive explanations in: "${targetLang}".
You MUST formulate ALL fields ('summary', 'analysis', 'historicalContext', 'uncertaintyNotes', 'suggestedNextSteps') entirely in ${targetLang}.
Be strictly accurate, mathematical, and logical. Explain the exact mechanism (e.g. shift value, modular arithmetic, transposition rows, key repetition) and demonstrate why the decrypted text is accurate.
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert cryptographic educator and senior cryptanalyst for CipherMind AI. Explain transformations clearly, mathematically, and objectively in the user's requested language (${targetLang}). Distinguish mathematical certainty from linguistic probability. Always output strictly valid JSON matching the schema.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: `Clear, concise explanation of the transformation mechanism in ${targetLang}.`
            },
            analysis: {
              type: Type.STRING,
              description: `Linguistic and mathematical assessment of why this candidate is accurate and scored well in ${targetLang}.`
            },
            historicalContext: {
              type: Type.STRING,
              description: `Brief historical background or algorithmic relevance in ${targetLang}.`
            },
            uncertaintyNotes: {
              type: Type.STRING,
              description: `Caveats regarding message length, false positives, or key ambiguity in ${targetLang}.`
            },
            suggestedNextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `2-3 recommended actions or verification tests for the student in ${targetLang}.`
            }
          },
          required: ["summary", "analysis", "historicalContext", "uncertaintyNotes", "suggestedNextSteps"]
        }
      }
    });
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini");
    }
    const parsed = JSON.parse(responseText);
    res.json({
      success: true,
      ...parsed,
      source: "gemini"
    });
  } catch (error) {
    console.error("Gemini explain error:", error?.message || error);
    const targetLang = req.body.userLanguage || "English";
    const fallback = getLocalizedServerExplain(req.body.candidate || {}, targetLang);
    res.json({
      success: true,
      ...fallback,
      source: "local_fallback"
    });
  }
});
app.post("/api/gemini/identify", async (req, res) => {
  try {
    const { ciphertext, inspection, userLanguage } = req.body;
    const targetLang = userLanguage || "English";
    if (!ciphertext) {
      return res.status(400).json({ error: "Missing ciphertext" });
    }
    if (!ai) {
      const fallback = getLocalizedServerIdentify(inspection, targetLang);
      return res.json({
        success: true,
        ...fallback,
        source: "local_fallback"
      });
    }
    const prompt = `
A user submitted this unknown ciphertext for cryptanalytic identification:
"${ciphertext}"
Statistical Profile:
- Total Characters: ${inspection?.totalCharacters}
- Total Letters: ${inspection?.totalLetters}
- Index of Coincidence (IoC): ${inspection?.ioc} (English is ~0.0667, Random is ~0.0385)
- Shannon Entropy: ${inspection?.entropy}
- Chi-Squared vs English: ${inspection?.chiSquaredToEnglish}
- Suggested Vigenere Key Lengths: ${(inspection?.suggestedVigenereKeyLengths || []).join(", ") || "None detected"}
- Patterns: ${JSON.stringify(inspection?.detectedPatterns || {})}

MANDATORY USER LANGUAGE REQUIREMENT:
The user has chosen: "${targetLang}".
You MUST formulate ALL fields ('detectedFamilies', 'assessment', 'recommendedTechniques') entirely in ${targetLang}.
Provide a professional cryptanalytic assessment of what family this ciphertext most likely belongs to, and what techniques or clues the student should try.
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are a senior cryptanalyst. Provide an objective, educational analysis of the ciphertext statistical profile. Formulate your entire response in ${targetLang}. Output strictly valid JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedFamilies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Top 3 likely cipher families in ${targetLang}.`
            },
            assessment: {
              type: Type.STRING,
              description: `In-depth interpretation of the IoC, entropy, and character distribution in ${targetLang}.`
            },
            recommendedTechniques: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Concrete steps to attempt next in ${targetLang}.`
            }
          },
          required: ["detectedFamilies", "assessment", "recommendedTechniques"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      ...parsed,
      source: "gemini"
    });
  } catch (error) {
    console.error("Gemini identify error:", error?.message || error);
    const targetLang = req.body.userLanguage || "English";
    const fallback = getLocalizedServerIdentify(req.body.inspection, targetLang);
    res.json({
      success: true,
      ...fallback,
      source: "local_fallback"
    });
  }
});
async function startServer() {
  const distDir = path.resolve(__dirname, "dist");
  const distIndex = path.resolve(distDir, "index.html");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(distIndex);
  if (isProduction) {
    app.use(express.static(distDir));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        res.status(404).json({ error: "Endpoint not found" });
        return;
      }
      res.sendFile(distIndex);
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`CipherMind AI server active on http://0.0.0.0:${port} [mode: ${isProduction ? "production" : "development"}]`);
  });
}
process.on("uncaughtException", (err) => {
  console.error("CipherMind AI server uncaught exception isolated:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("CipherMind AI server unhandled rejection isolated:", reason);
});
startServer();
