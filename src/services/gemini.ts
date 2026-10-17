/**
 * CipherMind AI - Client AI Service
 * Communicates with backend /api/gemini routes for cryptographic explanations and identification
 */

import { CipherCandidate, FrequencyAnalysis } from '../crypto/types';

export interface AiExplanationResult {
  success: boolean;
  summary: string;
  analysis: string;
  historicalContext: string;
  uncertaintyNotes: string;
  suggestedNextSteps: string[];
  source?: 'gemini' | 'local_fallback';
}

export interface AiIdentificationResult {
  success: boolean;
  detectedFamilies: string[];
  assessment: string;
  recommendedTechniques: string[];
  source?: 'gemini' | 'local_fallback';
}

function getLocalizedClientExplanation(candidate: CipherCandidate, lang: string): AiExplanationResult {
  const score = candidate.metrics?.totalScore || 0;
  const name = candidate.primaryCipherName;

  if (lang.toLowerCase().includes('span') || lang === 'es') {
    return {
      success: true,
      summary: `Transformación criptográfica verificada mediante ${name}.`,
      analysis: `Evaluado mediante coincidencia de vocabulario y prueba Chi-cuadrado. Puntuación de confianza: ${score}/100.`,
      historicalContext: `Los cifrados clásicos transforman el texto de forma determinista según claves o permutaciones definidas.`,
      uncertaintyNotes: `Verificación determinista completada. Compruebe si el texto recuperado coincide con el contexto esperado.`,
      suggestedNextSteps: [
        'Inspeccionar los pasos intermedios de transformación.',
        'Usar el resultado como entrada para análisis de capas adicionales si es necesario.',
      ],
      source: 'local_fallback',
    };
  }

  if (lang.toLowerCase().includes('fren') || lang === 'fr') {
    return {
      success: true,
      summary: `Transformation cryptographique vérifiée par ${name}.`,
      analysis: `Évalué par correspondance lexicale et test de fréquence Chi-deux. Score de confiance : ${score}/100.`,
      historicalContext: `Les chiffres classiques transforment le texte de manière déterministe selon des clés ou permutations fixées.`,
      uncertaintyNotes: `Vérification déterministe achevée. Vérifiez la cohérence du texte en clair avec le contexte attendu.`,
      suggestedNextSteps: [
        'Examiner les étapes intermédiaires de déchiffrement.',
        'Utiliser le résultat comme entrée pour des analyses multicouches si besoin.',
      ],
      source: 'local_fallback',
    };
  }

  if (lang.toLowerCase().includes('germ') || lang.toLowerCase().includes('deut') || lang === 'de') {
    return {
      success: true,
      summary: `Kryptografische Transformation über ${name} verifiziert.`,
      analysis: `Ausgewertet mittels Wörterbuch-Übereinstimmung und Chi-Quadrat-Häufigkeitsanalyse. Zuverlässigkeit: ${score}/100.`,
      historicalContext: `Klassische Chiffren transformieren Text deterministisch anhand definierter Schlüssel oder Permutationen.`,
      uncertaintyNotes: `Deterministische Überprüfung abgeschlossen. Prüfen Sie, ob der Klartext zum Kontext passt.`,
      suggestedNextSteps: [
        'Die Zwischenschritte der Pipeline prüfen.',
        'Den Text als Eingabe für tiefergehende Analysen verwenden.',
      ],
      source: 'local_fallback',
    };
  }

  if (lang.toLowerCase().includes('chin') || lang === 'zh') {
    return {
      success: true,
      summary: `已通过 ${name} 完成密码学逆变换验证。`,
      analysis: `通过词典词汇匹配度与卡方频率检验进行综合评估，置信度得分：${score}/100。`,
      historicalContext: `经典密码根据固定的数学置换或密钥变换文本，具备完全可逆的确定性特征。`,
      uncertaintyNotes: `确定性算法反解已完成，请核对解密明文是否符合预期的语义上下文。`,
      suggestedNextSteps: [
        '查看多层解密管道中的各个中间步骤。',
        '如怀疑为多层复合加密，可将此候选结果直接设为新输入继续分析。',
      ],
      source: 'local_fallback',
    };
  }

  if (lang.toLowerCase().includes('jap') || lang === 'ja') {
    return {
      success: true,
      summary: `${name} による決定論的暗号解読が検証されました。`,
      analysis: `辞書単語照合およびカイ二乗文字頻度検定により評価され、信頼度スコア ${score}/100 を記録しました。`,
      historicalContext: `古典暗号は固定キーまたは置換行列に基づいてテキストを決定論的に変換します。`,
      uncertaintyNotes: `アルゴリズム検証は完了しました。平文が意図した文脈と一致するか確認してください。`,
      suggestedNextSteps: [
        'パイプラインの各変換ステップを詳細確認する。',
        '必要に応じてこの復号結果を入力としてさらなる分析を実施する。',
      ],
      source: 'local_fallback',
    };
  }

  if (lang.toLowerCase().includes('arab') || lang === 'ar') {
    return {
      success: true,
      summary: `تم التحقق من التحويل التشفيري باستخدام ${name}.`,
      analysis: `تم التقييم عبر مطابقة المعجم واختبار كاي تربيع للتوزيع التكراري. درجة الثقة: ${score}/100.`,
      historicalContext: `تقوم الشيفرات الكلاسيكية بتحويل النصوص بشكل حتمي بناءً على مفاتيح أو تباديل محددة.`,
      uncertaintyNotes: `اكتمل التحقق الرياضي الحتمي. يُرجى مراجعة النص المفكوك للتأكد من مطابقة المعنى والسياق.`,
      suggestedNextSteps: [
        'فحص خطوات التحويل المرحلية والطبقات التشفيرية.',
        'استخدام النتيجة كمدخل جديد لتحليل متعدد الطبقات إن لزم الأمر.',
      ],
      source: 'local_fallback',
    };
  }

  // Default English
  return {
    success: true,
    summary: `Transformation verified via ${name}.`,
    analysis: `Evaluated using dictionary word matching and Chi-squared letter frequency testing. Yielded confidence score of ${score}/100.`,
    historicalContext: `Classical algorithmic ciphers transform text deterministically according to fixed keys or permutations.`,
    uncertaintyNotes: `Deterministic verification is complete. Check whether the plaintext matches expected context.`,
    suggestedNextSteps: [
      'Inspect the step-by-step intermediate transformations.',
      'Use candidate as input for further multi-layer analysis if needed.',
    ],
    source: 'local_fallback',
  };
}

export async function requestCandidateExplanation(
  candidate: CipherCandidate,
  ciphertext: string,
  userLanguage = 'English'
): Promise<AiExplanationResult> {
  try {
    const res = await fetch('/api/gemini/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate, ciphertext, userLanguage }),
    });

    if (!res.ok) {
      throw new Error(`HTTP status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend explain request failed, using local cryptographic analysis:', err);
    return getLocalizedClientExplanation(candidate, userLanguage);
  }
}

export async function requestCipherIdentification(
  ciphertext: string,
  inspection: FrequencyAnalysis,
  userLanguage = 'English'
): Promise<AiIdentificationResult> {
  try {
    const res = await fetch('/api/gemini/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ciphertext, inspection, userLanguage }),
    });

    if (!res.ok) {
      throw new Error(`HTTP status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend identify request failed, using local fallback:', err);
    const isHighIoc = inspection.ioc > 0.055;
    const isZh = userLanguage.toLowerCase().includes('chin') || userLanguage === 'zh';
    const isEs = userLanguage.toLowerCase().includes('span') || userLanguage === 'es';

    if (isZh) {
      return {
        success: true,
        detectedFamilies: isHighIoc ? ['单表替换密码 / 凯撒移位', '置换密码 (栅栏/列换位)'] : ['多表密码 (维吉尼亚)', '数字编码 (Base64/十六进制)'],
        assessment: `统计学检验得出重合指数 (IoC) 为 ${inspection.ioc}（标准英语通常约为 0.0667，完全随机约为 0.0385）。`,
        recommendedTechniques: [
          '运行全自动求解器 (Auto Solve All) 扫描所有实现的经典算法。',
          '检查字母频率直方图以寻找规律峰值。',
        ],
        source: 'local_fallback',
      };
    }

    if (isEs) {
      return {
        success: true,
        detectedFamilies: isHighIoc ? ['Sustitución Monoalfabética / César', 'Transposición'] : ['Polialfabético (Vigenère)', 'Codificación Digital'],
        assessment: `El análisis estadístico calculó un Índice de Coincidencia (IoC) de ${inspection.ioc} (el inglés estándar es ~0.0667).`,
        recommendedTechniques: [
          'Ejecutar Auto Solve All en todas las familias clásicas.',
          'Revisar el gráfico de barras de distribución de frecuencias.',
        ],
        source: 'local_fallback',
      };
    }

    return {
      success: true,
      detectedFamilies: isHighIoc ? ['Monoalphabetic Shift / Substitution', 'Transposition'] : ['Polyalphabetic (Vigenère)', 'Digital Encoding'],
      assessment: `Statistical inspection calculated an Index of Coincidence of ${inspection.ioc} (Standard English is ~0.0667).`,
      recommendedTechniques: [
        'Run Auto Solve All across all implemented classical families.',
        'Review the letter frequency distribution bar chart.',
      ],
      source: 'local_fallback',
    };
  }
}
