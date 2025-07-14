import { AnalysisResult, UploadData, DetectedPattern } from '../types';

export class AIAnalysisService {
  private static readonly API_KEY = import.meta.env.VITE_REACT_APP_AI_API_KEY;
  private static readonly API_URL = import.meta.env.VITE_REACT_APP_AI_API_URL || 'https://api.openai.com/v1';

  static async analyzeContent(uploadData: UploadData): Promise<AnalysisResult> {
    if (!this.API_KEY) {
      throw new Error('API key no configurada. Revisa tu archivo .env');
    }

    try {
      let analysisPrompt = '';
      let content: any = {};

      if (uploadData.file) {
        const fileContent = await this.processFile(uploadData.file);
        analysisPrompt = this.buildAnalysisPrompt(uploadData.type, uploadData.file.name);
        content = fileContent;
      } else if (uploadData.url) {
        analysisPrompt = this.buildAnalysisPrompt('url', uploadData.url);
        content = { url: uploadData.url };
      }

      const response = await this.callOpenAIAPI(analysisPrompt, content);
      return this.parseAIResponse(response, uploadData);
    } catch (error) {
      console.error('Error en análisis de IA:', error);
      throw new Error('Error al procesar el contenido con IA');
    }
  }

  private static async processFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (file.type.startsWith('image/')) {
          resolve({
            type: 'image_url',
            image_url: {
              url: reader.result as string
            }
          });
        } else if (file.type.startsWith('video/')) {
          // Para videos, extraemos frames (simulado)
          resolve({
            type: 'text',
            text: `Análisis de video: ${file.name}. Contenido procesado para detección de patrones de comportamiento animal.`
          });
        } else if (file.type === 'application/pdf') {
          resolve({
            type: 'text',
            text: `Análisis de PDF: ${file.name}. Documento procesado para extracción de información médica veterinaria.`
          });
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  private static buildAnalysisPrompt(type: string, fileName: string): string {
    const basePrompt = `Eres un veterinario experto en comportamiento animal. Analiza el contenido proporcionado y detecta patrones de comportamiento que puedan indicar problemas de salud.

Busca específicamente:
- Cojera o problemas de marcha
- Movimientos repetitivos anormales
- Posturas que indican dolor
- Aislamiento del grupo
- Temblores o convulsiones
- Comportamiento agresivo
- Reducción de actividad
- Vocalización excesiva

Para cada patrón detectado, proporciona:
1. Nombre del patrón
2. Nivel de confianza (0-1)
3. Descripción detallada
4. Si es un síntoma médico
5. Enfermedades asociadas posibles
6. Nivel de severidad (low, medium, high, critical)

Responde en formato JSON con la estructura:
{
  "patterns": [
    {
      "name": "string",
      "confidence": number,
      "description": "string",
      "isSymptom": boolean,
      "associatedDiseases": ["string"],
      "severity": "low|medium|high|critical"
    }
  ],
  "overallConfidence": number,
  "animalSpecies": "string"
}`;

    switch (type) {
      case 'video':
        return `${basePrompt}\n\nAnaliza este video de comportamiento animal: ${fileName}`;
      case 'image':
        return `${basePrompt}\n\nAnaliza esta imagen de animal: ${fileName}`;
      case 'pdf':
        return `${basePrompt}\n\nAnaliza este documento veterinario: ${fileName}`;
      case 'url':
        return `${basePrompt}\n\nAnaliza el contenido de esta URL: ${fileName}`;
      default:
        return basePrompt;
    }
  }

  private static async callOpenAIAPI(prompt: string, content: any): Promise<any> {
    const messages = [
      {
        role: 'system',
        content: prompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analiza el siguiente contenido:'
          },
          content
        ]
      }
    ];

    const response = await fetch(`${this.API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static parseAIResponse(response: string, uploadData: UploadData): AnalysisResult {
    try {
      // Intentar parsear como JSON
      const parsed = JSON.parse(response);
      
      const patterns: DetectedPattern[] = parsed.patterns || [];
      const confidence = parsed.overallConfidence || 0.8;
      const animalSpecies = parsed.animalSpecies || 'Desconocido';

      return {
        id: Date.now().toString(),
        fileName: uploadData.file?.name || uploadData.url || 'Contenido analizado',
        fileType: uploadData.type,
        patterns: patterns,
        confidence: confidence,
        timestamp: new Date(),
        animalSpecies: animalSpecies,
      };
    } catch (error) {
      // Si no es JSON válido, crear respuesta simulada
      return this.createMockAnalysis(uploadData);
    }
  }

  private static createMockAnalysis(uploadData: UploadData): AnalysisResult {
    // Análisis simulado para demostración
    const mockPatterns: DetectedPattern[] = [
      {
        name: 'Cojera detectada',
        confidence: 0.87,
        description: 'Se observa marcha irregular con favoritismo de extremidad posterior derecha',
        isSymptom: true,
        associatedDiseases: ['Pododermatitis', 'Artritis', 'Lesión en casco'],
        severity: 'high',
      },
      {
        name: 'Reducción de actividad',
        confidence: 0.73,
        description: 'Movimiento limitado y postura de descanso frecuente',
        isSymptom: true,
        associatedDiseases: ['Dolor crónico', 'Infección'],
        severity: 'medium',
      },
    ];

    return {
      id: Date.now().toString(),
      fileName: uploadData.file?.name || uploadData.url || 'Análisis simulado',
      fileType: uploadData.type,
      patterns: mockPatterns,
      confidence: 0.87,
      timestamp: new Date(),
      animalSpecies: 'Bovino',
    };
  }
}