import { AnalysisResult, DetectedSymptom } from '../types';

export class AIAnalysisService {
  private static readonly API_KEY = import.meta.env.VITE_REACT_APP_AI_API_KEY;
  private static readonly API_URL = import.meta.env.VITE_REACT_APP_AI_API_URL || 'https://api.openai.com/v1';

  static async analyzeFile(file: File): Promise<AnalysisResult> {
    if (!this.API_KEY) {
      throw new Error('API key no configurada. Revisa tu archivo .env');
    }

    try {
      const fileType = this.getFileType(file);
      if (!fileType) {
        throw new Error('Tipo de archivo no soportado');
      }

      let analysisData: any;

      if (fileType === 'image') {
        analysisData = await this.processImage(file);
      } else if (fileType === 'video') {
        analysisData = await this.processVideo(file);
      } else {
        throw new Error('Tipo de archivo no soportado para análisis');
      }

      const response = await this.callOpenAIAPI(analysisData, fileType);
      return this.parseAIResponse(response, file, fileType);

    } catch (error) {
      console.error('Error en análisis de IA:', error);
      throw new Error('Error al procesar el archivo con IA: ' + (error as Error).message);
    }
  }

  private static getFileType(file: File): 'video' | 'image' | null {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    return null;
  }

  private static async processImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Error al leer la imagen'));
      reader.readAsDataURL(file);
    });
  }

  private static async processVideo(file: File): Promise<string> {
    // Para videos, extraemos un frame representativo
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        // Ir al segundo 2 del video para obtener un frame representativo
        video.currentTime = Math.min(2, video.duration / 2);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0);
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);
      };

      video.onerror = () => reject(new Error('Error al procesar el video'));
      
      video.src = URL.createObjectURL(file);
    });
  }

  private static async callOpenAIAPI(imageData: string, fileType: string): Promise<any> {
    const prompt = this.buildAnalysisPrompt(fileType);

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
            text: 'Analiza esta imagen en busca de síntomas de enfermedades en vacas o caballos:'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error de API: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static buildAnalysisPrompt(fileType: string): string {
    return `Eres un veterinario experto especializado en el análisis de comportamiento y síntomas en vacas y caballos. 

Analiza la ${fileType === 'video' ? 'imagen extraída del video' : 'imagen'} proporcionada y detecta cualquier síntoma o patrón de comportamiento anormal que pueda indicar problemas de salud.

Busca específicamente estos síntomas:

SÍNTOMAS DE MOVIMIENTO:
- Cojera o marcha irregular
- Rigidez en las articulaciones
- Temblores o convulsiones
- Movimientos repetitivos anormales
- Dificultad para levantarse o acostarse

SÍNTOMAS POSTURALES:
- Postura encorvada o anormal
- Cabeza baja persistente
- Aislamiento del grupo
- Posición de dolor (espalda arqueada)

SÍNTOMAS COMPORTAMENTALES:
- Agresividad inusual
- Apatía o letargo
- Comportamiento estereotipado
- Vocalización excesiva

SÍNTOMAS FÍSICOS VISIBLES:
- Hinchazón en extremidades
- Secreciones anormales
- Cambios en la condición corporal
- Problemas respiratorios visibles

Para cada síntoma detectado, proporciona:
1. Nombre específico del síntoma
2. Nivel de confianza (0.0 a 1.0)
3. Descripción detallada de lo observado
4. Enfermedades asociadas más probables
5. Nivel de severidad: low, medium, high, o critical

Determina también:
- Tipo de animal (vaca o caballo)
- Confianza general del análisis

Responde ÚNICAMENTE en formato JSON válido:
{
  "symptoms": [
    {
      "name": "string",
      "confidence": number,
      "description": "string",
      "associatedDiseases": ["string"],
      "severity": "low|medium|high|critical",
      "timestamp": "string",
      "location": "string (opcional)"
    }
  ],
  "confidence": number,
  "animalType": "vaca|caballo|desconocido"
}

Si no detectas síntomas evidentes, devuelve un array vacío en "symptoms" pero mantén la estructura JSON.`;
  }

  private static parseAIResponse(response: string, file: File, fileType: 'video' | 'image'): AnalysisResult {
    try {
      // Limpiar la respuesta para extraer solo el JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Respuesta de IA no contiene JSON válido');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      const symptoms: DetectedSymptom[] = (parsed.symptoms || []).map((symptom: any) => ({
        name: symptom.name || 'Síntoma desconocido',
        confidence: Math.min(Math.max(symptom.confidence || 0, 0), 1),
        description: symptom.description || 'Sin descripción',
        associatedDiseases: Array.isArray(symptom.associatedDiseases) ? symptom.associatedDiseases : [],
        severity: ['low', 'medium', 'high', 'critical'].includes(symptom.severity) ? symptom.severity : 'medium',
        timestamp: symptom.timestamp || new Date().toISOString(),
        location: symptom.location || undefined,
      }));

      const confidence = Math.min(Math.max(parsed.confidence || 0.5, 0), 1);
      const animalType = ['vaca', 'caballo'].includes(parsed.animalType) ? parsed.animalType : 'desconocido';

      const result: AnalysisResult = {
        id: Date.now().toString(),
        fileName: file.name,
        fileType: fileType,
        symptoms: symptoms,
        confidence: confidence,
        timestamp: new Date(),
        animalType: animalType,
        alertGenerated: symptoms.some(s => s.severity === 'high' || s.severity === 'critical'),
      };

      return result;

    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw response:', response);
      
      // Crear respuesta de fallback
      return {
        id: Date.now().toString(),
        fileName: file.name,
        fileType: fileType,
        symptoms: [],
        confidence: 0.5,
        timestamp: new Date(),
        animalType: 'desconocido',
        alertGenerated: false,
      };
    }
  }
}