/**
 * CipherMind AI - Express Backend Server
 * Securely proxies Gemini API for cryptanalytic explanation and provides Vite middleware
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiEnabled: Boolean(ai),
    serverTime: new Date().toISOString(),
  });
});

function getLocalizedServerExplain(candidate: any, targetLang: string) {
  const name = candidate.primaryCipherName || 'Cipher';
  const score = candidate.metrics?.totalScore || 70;
  const wordCount = candidate.metrics?.recognizedWords?.length || 0;
  const langLower = (targetLang || 'English').toLowerCase();

  if (langLower.includes('span') || langLower === 'es') {
    return {
      summary: `Descifrado determinista completado mediante ${name}.`,
      analysis: `El texto exhibe una sólida estructura lingüística con ${wordCount} palabras de diccionario reconocidas y una puntuación Chi-cuadrado de ${candidate.metrics?.frequencyScore || 0}/100.`,
      historicalContext: `Los cifrados clásicos como ${name} se basan en permutaciones o desplazamientos matemáticos en el alfabeto.`,
      uncertaintyNotes: `Verificación determinista confirmada. Se recomienda contrastar el mensaje con el contexto esperado.`,
      suggestedNextSteps: [
        'Comprobar las transformaciones intermedias paso a paso.',
        'Explorar posibles cribs o palabras clave adicionales si existen pistas.',
      ],
    };
  }

  if (langLower.includes('fren') || langLower === 'fr') {
    return {
      summary: `Déchiffrement déterministe achevé via ${name}.`,
      analysis: `Le texte présente de fortes propriétés linguistiques avec ${wordCount} mots de dictionnaire reconnus et un score Chi-deux de ${candidate.metrics?.frequencyScore || 0}/100.`,
      historicalContext: `Les chiffres historiques comme ${name} reposent sur des décalages modulaires et des permutations géométriques.`,
      uncertaintyNotes: `Vérification déterministe réussie. Validez la cohérence avec le contexte d'origine.`,
      suggestedNextSteps: [
        'Inspecter les étapes intermédiaires dans la vue détaillée.',
        'Tester des mots probables (cribs) supplémentaires.',
      ],
    };
  }

  if (langLower.includes('germ') || langLower.includes('deut') || langLower === 'de') {
    return {
      summary: `Deterministische Entschlüsselung über ${name} abgeschlossen.`,
      analysis: `Der Text zeigt ausgeprägte sprachliche Merkmale mit ${wordCount} erkannten Wörterbuchwörtern und einer Chi-Quadrat-Güte von ${candidate.metrics?.frequencyScore || 0}/100.`,
      historicalContext: `Klassische Chiffren wie ${name} nutzen mathematische Verschiebungen oder Permutationen.`,
      uncertaintyNotes: `Deterministische Umkehrbarkeit bestätigt. Prüfen Sie den Sinngehalt im Kontext.`,
      suggestedNextSteps: [
        'Die Zwischenschritte der Pipeline prüfen.',
        'Mit bekannten Schlüsselwörtern vergleichen.',
      ],
    };
  }

  if (langLower.includes('chin') || langLower === 'zh') {
    return {
      summary: `已通过 ${name} 完成确定性密码解密验证。`,
      analysis: `解密文本呈现出高度符合自然语言特征的统计分布，识别出 ${wordCount} 个常用词汇，卡方拟合得分：${candidate.metrics?.frequencyScore || 0}/100。`,
      historicalContext: `如 ${name} 等经典密码依赖模运算移位或网格置换，在现代分析中可通过穷举与统计学迅速攻破。`,
      uncertaintyNotes: `可逆数学算法验证已完成，短文本可能会存在假阳性，请根据预期背景核实语义。`,
      suggestedNextSteps: [
        '查看多层转换管道的每一步中间明文状态。',
        '若存在多重嵌套加密，可将此结果作为下一阶段输入。',
      ],
    };
  }

  if (langLower.includes('jap') || langLower === 'ja') {
    return {
      summary: `${name} による決定論的復号が完了しました。`,
      analysis: `復号テキストは ${wordCount} 個の認識された辞書単語とカイ二乗適合度 ${candidate.metrics?.frequencyScore || 0}/100 を示しています。`,
      historicalContext: `${name} などの古典的暗号はモジュロ演算や置換テーブルに基づいています。`,
      uncertaintyNotes: `決定論的検証により完全な可逆性が確認されました。文脈に沿っているか確認してください。`,
      suggestedNextSteps: [
        'ステップバイステップの変換履歴を確認する。',
        '必要に応じて既知のキーワードで検証する。',
      ],
    };
  }

  if (langLower.includes('arab') || langLower === 'ar') {
    return {
      summary: `تم فك التشفير الحتمي بنجاح عبر ${name}.`,
      analysis: `يُظهر النص بنية لغوية قوية مع التعرف على ${wordCount} كلمة معجمية وملاءمة كاي تربيع قدرها ${candidate.metrics?.frequencyScore || 0}/100.`,
      historicalContext: `تعتمد الشيفرات الكلاسيكية مثل ${name} على الحساب النمطي والتباديل الأبجدية المنظمة.`,
      uncertaintyNotes: `تم تأكيد قابلية العكس الرياضي. يُرجى التحقق من السياق الدلالي للنص المفكوك.`,
      suggestedNextSteps: [
        'فحص خطوات خط الأنابيب التفصيلية.',
        'تجربة كلمات مرجعية إضافية إن وجدت.',
      ],
    };
  }

  return {
    summary: `Deterministic decryption completed via ${name}.`,
    analysis: `The text exhibits strong linguistic properties with ${wordCount} recognized dictionary words and a Chi-squared fitness of ${candidate.metrics?.frequencyScore || 0}/100.`,
    historicalContext: `Classical ciphers like ${name} rely on mathematical permutations or shifts. In modern cryptanalysis, small key spaces or static frequency distributions make recovery instantaneous without manual trial.`,
    uncertaintyNotes: `Deterministic verification confirmed reversibility. While the candidate matches grammatical patterns, historical ciphers can yield false positives on short texts under 15 characters.`,
    suggestedNextSteps: [
      'Verify if the original sender used known conventions or word spacing.',
      'Try testing with additional crib words if context is available.',
    ],
  };
}

function getLocalizedServerIdentify(inspection: any, targetLang: string) {
  const isHighIoc = (inspection?.ioc || 0) > 0.055;
  const langLower = (targetLang || 'English').toLowerCase();

  if (langLower.includes('span') || langLower === 'es') {
    return {
      detectedFamilies: isHighIoc
        ? ['Sustitución Monoalfabética (César)', 'Cifrado de Transposición', 'Atbash / Afín']
        : ['Cifrado Polialfabético (Vigenère)', 'Codificación Digital (Base64/Hex)', 'Flujo de Alta Entropía'],
      assessment: `El perfil estadístico indica un Índice de Coincidencia (IoC) de ${inspection?.ioc || 0} y entropía de ${inspection?.entropy || 0}.`,
      recommendedTechniques: [
        'Ejecutar Auto Solve All con profundidad 2 para barrer todos los algoritmos clásicos.',
        'Analizar la distribución de frecuencias de letras en el Inspector.',
        'Probar longitudes de clave Vigenère sugeridas si el IoC es bajo.',
      ],
    };
  }

  if (langLower.includes('fren') || langLower === 'fr') {
    return {
      detectedFamilies: isHighIoc
        ? ['Substitution Monoalphabétique (César)', 'Transposition (Rail Fence)', 'Atbash / Affine']
        : ['Chiffre Polyalphabétique (Vigenère)', 'Encodage Numérique (Base64/Hex)', 'Flux à Haute Entropie'],
      assessment: `L'analyse statistique montre un indice de coïncidence (IoC) de ${inspection?.ioc || 0} et une entropie de ${inspection?.entropy || 0}.`,
      recommendedTechniques: [
        'Lancer Auto-Solve All avec profondeur 2 pour tester les algorithmes classiques.',
        'Examiner le graphique de fréquences de lettres.',
      ],
    };
  }

  if (langLower.includes('chin') || langLower === 'zh') {
    return {
      detectedFamilies: isHighIoc
        ? ['单表代换密码 (凯撒/仿射密码)', '置换密码 (栅栏/列换位密码)', '阿特巴希密码 (Atbash)']
        : ['多表代换密码 (维吉尼亚/博福特)', '数字编码 (Base64/十六进制)', '高熵流密码'],
      assessment: `统计学指标显示重合指数 (IoC) 为 ${inspection?.ioc || 0}，香农熵为 ${inspection?.entropy || 0}。`,
      recommendedTechniques: [
        '执行“Auto Solve All”以深度 2 自动遍历所有已实现经典密码。',
        '在密码分析检查器中查看字母频率分布直方图。',
        '若 IoC 接近随机值，优先检查维吉尼亚周期或多层嵌套编码。',
      ],
    };
  }

  if (langLower.includes('germ') || langLower.includes('deut') || langLower === 'de') {
    return {
      detectedFamilies: isHighIoc
        ? ['Monoalphabetische Substitution (Caesar)', 'Transpositionschiffre', 'Atbash / Affin']
        : ['Polyalphabetische Chiffre (Vigenère)', 'Digitale Kodierung (Base64/Hex)', 'Hohe Entropie'],
      assessment: `Das statistische Profil weist einen Koinzidenzindex (IoC) von ${inspection?.ioc || 0} auf.`,
      recommendedTechniques: [
        'Auto-Solve All mit Suchtiefe 2 ausführen.',
        'Buchstabenhäufigkeiten im Inspektor untersuchen.',
      ],
    };
  }

  return {
    detectedFamilies: isHighIoc
      ? ['Monoalphabetic Substitution (Caesar)', 'Transposition Cipher', 'Atbash / Affine']
      : ['Polyalphabetic Cipher (Vigenère)', 'Digital Encoding (Base64/Hex)', 'High Entropy Stream'],
    assessment: `Statistical inspection calculated an Index of Coincidence (IoC) of ${inspection?.ioc || 0} (Standard English is ~0.0667, Random is ~0.0385) and entropy ${inspection?.entropy || 0}.`,
    recommendedTechniques: [
      'Run Auto-Solve All with depth 2 to sweep all standard classical algorithms.',
      'Examine letter frequency distribution bar chart in the Inspector.',
      'Check suggested Vigenère key lengths if IoC indicates polyalphabetic dispersion.',
    ],
  };
}

/**
 * Endpoint: /api/gemini/explain
 * Generates structured educational explanation for a cipher decryption candidate in the user's chosen language
 */
app.post('/api/gemini/explain', async (req: Request, res: Response) => {
  try {
    const { candidate, ciphertext, userLanguage } = req.body;
    const targetLang = userLanguage || 'English';

    if (!candidate || !candidate.plaintext) {
      return res.status(400).json({ error: 'Missing candidate details' });
    }

    if (!ai) {
      // Fallback response when GEMINI_API_KEY is not configured
      const fallback = getLocalizedServerExplain(candidate, targetLang);
      return res.json({
        success: true,
        ...fallback,
        source: 'local_fallback',
      });
    }

    const prompt = `
Analyze this cryptographic solution found by CipherMind AI:
Original Ciphertext: "${ciphertext || candidate.originalCiphertext}"
Candidate Plaintext: "${candidate.plaintext}"
Cipher Used: "${candidate.primaryCipherName}"
Transformation Steps: ${JSON.stringify(candidate.transformationChain || [])}
Confidence Score: ${candidate.metrics?.totalScore}/100 (Word Match: ${candidate.metrics?.wordMatchRatio * 100}%, Chi-Squared Score: ${candidate.metrics?.frequencyScore}/100, IoC: ${candidate.metrics?.ioc})
Recognized Words: ${(candidate.metrics?.recognizedWords || []).join(', ')}

MANDATORY USER LANGUAGE REQUIREMENT:
The user has chosen to receive explanations in: "${targetLang}".
You MUST formulate ALL fields ('summary', 'analysis', 'historicalContext', 'uncertaintyNotes', 'suggestedNextSteps') entirely in ${targetLang}.
Be strictly accurate, mathematical, and logical. Explain the exact mechanism (e.g. shift value, modular arithmetic, transposition rows, key repetition) and demonstrate why the decrypted text is accurate.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          `You are an expert cryptographic educator and senior cryptanalyst for CipherMind AI. Explain transformations clearly, mathematically, and objectively in the user's requested language (${targetLang}). Distinguish mathematical certainty from linguistic probability. Always output strictly valid JSON matching the schema.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: `Clear, concise explanation of the transformation mechanism in ${targetLang}.`,
            },
            analysis: {
              type: Type.STRING,
              description: `Linguistic and mathematical assessment of why this candidate is accurate and scored well in ${targetLang}.`,
            },
            historicalContext: {
              type: Type.STRING,
              description: `Brief historical background or algorithmic relevance in ${targetLang}.`,
            },
            uncertaintyNotes: {
              type: Type.STRING,
              description: `Caveats regarding message length, false positives, or key ambiguity in ${targetLang}.`,
            },
            suggestedNextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `2-3 recommended actions or verification tests for the student in ${targetLang}.`,
            },
          },
          required: ['summary', 'analysis', 'historicalContext', 'uncertaintyNotes', 'suggestedNextSteps'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(responseText);
    res.json({
      success: true,
      ...parsed,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini explain error:', error?.message || error);
    const targetLang = req.body.userLanguage || 'English';
    const fallback = getLocalizedServerExplain(req.body.candidate || {}, targetLang);
    res.json({
      success: true,
      ...fallback,
      source: 'local_fallback',
    });
  }
});

/**
 * Endpoint: /api/gemini/identify
 * Analyzes unknown ciphertext statistical profile and advises candidate avenues in user's choice language
 */
app.post('/api/gemini/identify', async (req: Request, res: Response) => {
  try {
    const { ciphertext, inspection, userLanguage } = req.body;
    const targetLang = userLanguage || 'English';

    if (!ciphertext) {
      return res.status(400).json({ error: 'Missing ciphertext' });
    }

    if (!ai) {
      const fallback = getLocalizedServerIdentify(inspection, targetLang);
      return res.json({
        success: true,
        ...fallback,
        source: 'local_fallback',
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
- Suggested Vigenere Key Lengths: ${(inspection?.suggestedVigenereKeyLengths || []).join(', ') || 'None detected'}
- Patterns: ${JSON.stringify(inspection?.detectedPatterns || {})}

MANDATORY USER LANGUAGE REQUIREMENT:
The user has chosen: "${targetLang}".
You MUST formulate ALL fields ('detectedFamilies', 'assessment', 'recommendedTechniques') entirely in ${targetLang}.
Provide a professional cryptanalytic assessment of what family this ciphertext most likely belongs to, and what techniques or clues the student should try.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          `You are a senior cryptanalyst. Provide an objective, educational analysis of the ciphertext statistical profile. Formulate your entire response in ${targetLang}. Output strictly valid JSON.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedFamilies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Top 3 likely cipher families in ${targetLang}.`,
            },
            assessment: {
              type: Type.STRING,
              description: `In-depth interpretation of the IoC, entropy, and character distribution in ${targetLang}.`,
            },
            recommendedTechniques: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Concrete steps to attempt next in ${targetLang}.`,
            },
          },
          required: ['detectedFamilies', 'assessment', 'recommendedTechniques'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      ...parsed,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini identify error:', error?.message || error);
    const targetLang = req.body.userLanguage || 'English';
    const fallback = getLocalizedServerIdentify(req.body.inspection, targetLang);
    res.json({
      success: true,
      ...fallback,
      source: 'local_fallback',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`CipherMind AI server active on http://0.0.0.0:${port}`);
  });
}

// Process-level crash prevention for concurrent multi-device reliability
process.on('uncaughtException', (err) => {
  console.error('CipherMind AI server uncaught exception isolated:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('CipherMind AI server unhandled rejection isolated:', reason);
});

startServer();

