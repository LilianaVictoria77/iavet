export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'file' | 'array';
  label: string;
  required: boolean;
  validation?: string;
  options?: string[];
  description?: string;
}

export interface FormSchema {
  formName: string;
  fields: FormField[];
  purpose: string;
}

export interface FormData {
  formType: string;
  data: Record<string, any>;
  timestamp: Date;
  id: string;
}

export interface FieldComparison {
  fieldName: string;
  oldValue: any;
  newValue: any;
  changed: boolean;
  interpretation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface FormComparison {
  formType: string;
  id1: string;
  id2: string;
  timestamp1: Date;
  timestamp2: Date;
  fieldComparisons: FieldComparison[];
  overallChanges: number;
  significantChanges: string[];
  interpretation: string;
}

export class FormAnalysisService {
  // Esquemas de formularios definidos
  private static readonly FORM_SCHEMAS: Record<string, FormSchema> = {
    aiFeeding: {
      formName: 'Alimentación de IA',
      purpose: 'Cargar datos de entrenamiento para la IA',
      fields: [
        {
          name: 'description',
          type: 'textarea',
          label: 'Descripción del Contenido',
          required: true,
          description: 'Descripción detallada de los síntomas o comportamientos observados'
        },
        {
          name: 'symptoms',
          type: 'array',
          label: 'Síntomas Observados',
          required: true,
          description: 'Lista de síntomas identificados en el contenido'
        },
        {
          name: 'diseases',
          type: 'array',
          label: 'Enfermedades Asociadas',
          required: false,
          description: 'Enfermedades potencialmente relacionadas con los síntomas'
        },
        {
          name: 'animalType',
          type: 'select',
          label: 'Tipo de Animal',
          required: true,
          options: ['vaca', 'caballo', 'ambos'],
          description: 'Especie animal a la que se refiere el contenido'
        },
        {
          name: 'fileName',
          type: 'text',
          label: 'Nombre del Archivo',
          required: true,
          description: 'Nombre del archivo o URL cargada'
        },
        {
          name: 'fileType',
          type: 'select',
          label: 'Tipo de Archivo',
          required: true,
          options: ['pdf', 'image', 'video', 'url'],
          description: 'Tipo de contenido multimedia'
        },
        {
          name: 'url',
          type: 'url',
          label: 'URL del Video',
          required: false,
          validation: 'URL válida',
          description: 'Enlace externo al contenido de video'
        }
      ]
    },

    userManagement: {
      formName: 'Gestión de Usuarios',
      purpose: 'Registrar usuarios del sistema',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Nombre Completo',
          required: true,
          validation: 'Mínimo 2 caracteres',
          description: 'Nombre y apellido del usuario'
        },
        {
          name: 'phone',
          type: 'tel',
          label: 'Teléfono',
          required: true,
          validation: 'Formato: +54 11 1234-5678',
          description: 'Número de teléfono con código de país'
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          required: true,
          validation: 'Email válido y único',
          description: 'Dirección de correo electrónico'
        },
        {
          name: 'cargo',
          type: 'text',
          label: 'Cargo',
          required: true,
          description: 'Posición o rol profesional (Veterinario, Ganadero, etc.)'
        }
      ]
    },

    messaging: {
      formName: 'Sistema de Mensajería',
      purpose: 'Enviar mensajes entre usuarios',
      fields: [
        {
          name: 'content',
          type: 'textarea',
          label: 'Mensaje',
          required: false,
          description: 'Contenido del mensaje de texto'
        },
        {
          name: 'receiverId',
          type: 'select',
          label: 'Destinatario',
          required: true,
          description: 'Usuario que recibirá el mensaje'
        },
        {
          name: 'attachments',
          type: 'file',
          label: 'Archivos Adjuntos',
          required: false,
          validation: 'Solo imágenes',
          description: 'Imágenes adjuntas al mensaje'
        }
      ]
    }
  };

  // Obtener esquema de formulario
  static getFormSchema(formType: string): FormSchema | null {
    return this.FORM_SCHEMAS[formType] || null;
  }

  // Obtener todos los esquemas
  static getAllSchemas(): Record<string, FormSchema> {
    return this.FORM_SCHEMAS;
  }

  // Validar datos del formulario
  static validateFormData(formType: string, data: Record<string, any>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const schema = this.getFormSchema(formType);
    if (!schema) {
      return { isValid: false, errors: ['Esquema de formulario no encontrado'], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    schema.fields.forEach(field => {
      const value = data[field.name];

      // Validar campos requeridos
      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        errors.push(`${field.label} es requerido`);
      }

      // Validaciones específicas por tipo
      if (value) {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`${field.label} debe tener formato válido`);
            }
            break;

          case 'tel':
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
              errors.push(`${field.label} debe tener formato válido`);
            }
            break;

          case 'url':
            try {
              new URL(value);
            } catch {
              errors.push(`${field.label} debe ser una URL válida`);
            }
            break;

          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`${field.label} debe ser una lista`);
            } else if (value.some(item => !item || item.trim() === '')) {
              warnings.push(`${field.label} contiene elementos vacíos`);
            }
            break;

          case 'select':
            if (field.options && !field.options.includes(value)) {
              errors.push(`${field.label} debe ser una opción válida`);
            }
            break;
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Comparar dos conjuntos de datos del mismo formulario
  static compareFormData(
    formType: string,
    data1: FormData,
    data2: FormData
  ): FormComparison {
    const schema = this.getFormSchema(formType);
    if (!schema) {
      throw new Error('Esquema de formulario no encontrado');
    }

    const fieldComparisons: FieldComparison[] = [];
    let significantChanges: string[] = [];

    schema.fields.forEach(field => {
      const oldValue = data1.data[field.name];
      const newValue = data2.data[field.name];
      const changed = !this.deepEqual(oldValue, newValue);

      if (changed) {
        const interpretation = this.interpretFieldChange(field, oldValue, newValue);
        const severity = this.determineSeverity(field, oldValue, newValue);

        fieldComparisons.push({
          fieldName: field.name,
          oldValue,
          newValue,
          changed,
          interpretation,
          severity
        });

        if (severity === 'high' || severity === 'medium') {
          significantChanges.push(field.label);
        }
      }
    });

    const overallInterpretation = this.generateOverallInterpretation(
      formType,
      fieldComparisons,
      significantChanges
    );

    return {
      formType,
      id1: data1.id,
      id2: data2.id,
      timestamp1: data1.timestamp,
      timestamp2: data2.timestamp,
      fieldComparisons,
      overallChanges: fieldComparisons.length,
      significantChanges,
      interpretation: overallInterpretation
    };
  }

  // Interpretar cambio en un campo específico
  private static interpretFieldChange(
    field: FormField,
    oldValue: any,
    newValue: any
  ): string {
    switch (field.name) {
      case 'symptoms':
        return this.interpretSymptomsChange(oldValue, newValue);
      
      case 'diseases':
        return this.interpretDiseasesChange(oldValue, newValue);
      
      case 'animalType':
        return `Tipo de animal cambió de "${oldValue}" a "${newValue}"`;
      
      case 'description':
        return this.interpretDescriptionChange(oldValue, newValue);
      
      case 'name':
        return `Nombre actualizado de "${oldValue}" a "${newValue}"`;
      
      case 'email':
        return `Email cambió de "${oldValue}" a "${newValue}"`;
      
      case 'phone':
        return `Teléfono actualizado de "${oldValue}" a "${newValue}"`;
      
      case 'cargo':
        return `Cargo cambió de "${oldValue}" a "${newValue}"`;
      
      default:
        return `${field.label} cambió de "${oldValue}" a "${newValue}"`;
    }
  }

  // Interpretar cambios en síntomas
  private static interpretSymptomsChange(oldSymptoms: string[], newSymptoms: string[]): string {
    if (!oldSymptoms) oldSymptoms = [];
    if (!newSymptoms) newSymptoms = [];

    const added = newSymptoms.filter(s => !oldSymptoms.includes(s));
    const removed = oldSymptoms.filter(s => !newSymptoms.includes(s));

    let interpretation = '';
    if (added.length > 0) {
      interpretation += `Síntomas agregados: ${added.join(', ')}. `;
    }
    if (removed.length > 0) {
      interpretation += `Síntomas removidos: ${removed.join(', ')}. `;
    }

    return interpretation.trim();
  }

  // Interpretar cambios en enfermedades
  private static interpretDiseasesChange(oldDiseases: string[], newDiseases: string[]): string {
    if (!oldDiseases) oldDiseases = [];
    if (!newDiseases) newDiseases = [];

    const added = newDiseases.filter(d => !oldDiseases.includes(d));
    const removed = oldDiseases.filter(d => !newDiseases.includes(d));

    let interpretation = '';
    if (added.length > 0) {
      interpretation += `Enfermedades agregadas: ${added.join(', ')}. `;
    }
    if (removed.length > 0) {
      interpretation += `Enfermedades removidas: ${removed.join(', ')}. `;
    }

    return interpretation.trim();
  }

  // Interpretar cambios en descripción
  private static interpretDescriptionChange(oldDesc: string, newDesc: string): string {
    const oldLength = oldDesc?.length || 0;
    const newLength = newDesc?.length || 0;
    const lengthDiff = newLength - oldLength;

    if (lengthDiff > 50) {
      return `Descripción expandida significativamente (+${lengthDiff} caracteres)`;
    } else if (lengthDiff < -50) {
      return `Descripción reducida significativamente (${lengthDiff} caracteres)`;
    } else {
      return `Descripción modificada (${lengthDiff > 0 ? '+' : ''}${lengthDiff} caracteres)`;
    }
  }

  // Determinar severidad del cambio
  private static determineSeverity(
    field: FormField,
    oldValue: any,
    newValue: any
  ): 'low' | 'medium' | 'high' {
    switch (field.name) {
      case 'symptoms':
      case 'diseases':
        return 'high'; // Cambios en síntomas/enfermedades son críticos
      
      case 'animalType':
        return 'high'; // Cambio de especie es significativo
      
      case 'description':
        const lengthDiff = Math.abs((newValue?.length || 0) - (oldValue?.length || 0));
        return lengthDiff > 100 ? 'medium' : 'low';
      
      case 'email':
      case 'phone':
        return 'medium'; // Cambios de contacto son importantes
      
      default:
        return 'low';
    }
  }

  // Generar interpretación general
  private static generateOverallInterpretation(
    formType: string,
    fieldComparisons: FieldComparison[],
    significantChanges: string[]
  ): string {
    if (fieldComparisons.length === 0) {
      return 'No se detectaron cambios en el formulario';
    }

    const highSeverityChanges = fieldComparisons.filter(fc => fc.severity === 'high').length;
    const mediumSeverityChanges = fieldComparisons.filter(fc => fc.severity === 'medium').length;

    let interpretation = `Se detectaron ${fieldComparisons.length} cambios en el formulario. `;

    if (highSeverityChanges > 0) {
      interpretation += `${highSeverityChanges} cambios críticos requieren atención inmediata. `;
    }

    if (mediumSeverityChanges > 0) {
      interpretation += `${mediumSeverityChanges} cambios importantes detectados. `;
    }

    if (significantChanges.length > 0) {
      interpretation += `Campos modificados: ${significantChanges.join(', ')}.`;
    }

    // Interpretaciones específicas por tipo de formulario
    switch (formType) {
      case 'aiFeeding':
        interpretation += ' Estos cambios pueden afectar el entrenamiento de la IA.';
        break;
      case 'userManagement':
        interpretation += ' Actualización de información de usuario completada.';
        break;
      case 'messaging':
        interpretation += ' Modificación en configuración de mensajería.';
        break;
    }

    return interpretation;
  }

  // Comparación profunda de valores
  private static deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, index) => this.deepEqual(val, b[index]));
    }
    
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      return keysA.every(key => this.deepEqual(a[key], b[key]));
    }
    
    return false;
  }

  // Generar reporte de análisis de formulario
  static generateFormReport(formType: string, data: FormData): {
    summary: string;
    fieldAnalysis: Array<{
      field: string;
      value: any;
      analysis: string;
      recommendations: string[];
    }>;
    overallScore: number;
    recommendations: string[];
  } {
    const schema = this.getFormSchema(formType);
    if (!schema) {
      throw new Error('Esquema de formulario no encontrado');
    }

    const fieldAnalysis = schema.fields.map(field => {
      const value = data.data[field.name];
      return {
        field: field.label,
        value,
        analysis: this.analyzeFieldValue(field, value),
        recommendations: this.getFieldRecommendations(field, value)
      };
    });

    const overallScore = this.calculateFormScore(schema, data.data);
    const recommendations = this.generateFormRecommendations(formType, data.data, overallScore);

    return {
      summary: this.generateFormSummary(formType, data.data, overallScore),
      fieldAnalysis,
      overallScore,
      recommendations
    };
  }

  // Analizar valor de campo individual
  private static analyzeFieldValue(field: FormField, value: any): string {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return field.required ? 'Campo requerido sin completar' : 'Campo opcional vacío';
    }

    switch (field.name) {
      case 'symptoms':
        return `${value.length} síntomas identificados: ${value.join(', ')}`;
      
      case 'diseases':
        return value.length > 0 
          ? `${value.length} enfermedades asociadas: ${value.join(', ')}`
          : 'Sin enfermedades específicas asociadas';
      
      case 'description':
        const wordCount = value.split(' ').length;
        return `Descripción de ${wordCount} palabras, ${value.length} caracteres`;
      
      case 'email':
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        return emailValid ? 'Email con formato válido' : 'Email con formato inválido';
      
      case 'phone':
        const phoneValid = /^[\+]?[0-9\s\-\(\)]{10,}$/.test(value);
        return phoneValid ? 'Teléfono con formato válido' : 'Teléfono con formato inválido';
      
      default:
        return `Valor: ${value}`;
    }
  }

  // Generar recomendaciones para campo
  private static getFieldRecommendations(field: FormField, value: any): string[] {
    const recommendations: string[] = [];

    if (!value || (Array.isArray(value) && value.length === 0)) {
      if (field.required) {
        recommendations.push(`Completar ${field.label} es obligatorio`);
      }
      return recommendations;
    }

    switch (field.name) {
      case 'symptoms':
        if (value.length < 2) {
          recommendations.push('Considerar agregar más síntomas para mejor análisis');
        }
        break;
      
      case 'diseases':
        if (value.length === 0) {
          recommendations.push('Asociar enfermedades ayuda a mejorar el diagnóstico');
        }
        break;
      
      case 'description':
        if (value.length < 50) {
          recommendations.push('Descripción más detallada mejora el análisis de IA');
        }
        break;
    }

    return recommendations;
  }

  // Calcular puntuación del formulario
  private static calculateFormScore(schema: FormSchema, data: Record<string, any>): number {
    let score = 0;
    let maxScore = 0;

    schema.fields.forEach(field => {
      const value = data[field.name];
      maxScore += field.required ? 20 : 10;

      if (value && (typeof value !== 'object' || (Array.isArray(value) && value.length > 0))) {
        score += field.required ? 20 : 10;
        
        // Bonificaciones por calidad
        switch (field.name) {
          case 'symptoms':
            if (Array.isArray(value) && value.length > 2) score += 5;
            break;
          case 'diseases':
            if (Array.isArray(value) && value.length > 0) score += 5;
            break;
          case 'description':
            if (value.length > 100) score += 5;
            break;
        }
      }
    });

    return Math.round((score / maxScore) * 100);
  }

  // Generar resumen del formulario
  private static generateFormSummary(
    formType: string,
    data: Record<string, any>,
    score: number
  ): string {
    const schema = this.getFormSchema(formType);
    if (!schema) return 'Formulario no reconocido';

    let summary = `${schema.formName} completado con ${score}% de calidad. `;

    switch (formType) {
      case 'aiFeeding':
        const symptoms = data.symptoms?.length || 0;
        const diseases = data.diseases?.length || 0;
        summary += `Contiene ${symptoms} síntomas y ${diseases} enfermedades para entrenar la IA.`;
        break;
      
      case 'userManagement':
        summary += `Usuario "${data.name}" registrado como ${data.cargo}.`;
        break;
      
      case 'messaging':
        const hasAttachments = data.attachments?.length > 0;
        summary += `Mensaje ${hasAttachments ? 'con archivos adjuntos' : 'de texto'} preparado.`;
        break;
    }

    return summary;
  }

  // Generar recomendaciones generales
  private static generateFormRecommendations(
    formType: string,
    data: Record<string, any>,
    score: number
  ): string[] {
    const recommendations: string[] = [];

    if (score < 70) {
      recommendations.push('Completar más campos para mejorar la calidad de los datos');
    }

    switch (formType) {
      case 'aiFeeding':
        if (!data.symptoms || data.symptoms.length < 2) {
          recommendations.push('Agregar más síntomas mejora el entrenamiento de la IA');
        }
        if (!data.diseases || data.diseases.length === 0) {
          recommendations.push('Asociar enfermedades ayuda en el diagnóstico automático');
        }
        break;
      
      case 'userManagement':
        if (!data.phone || !data.email) {
          recommendations.push('Información de contacto completa es esencial');
        }
        break;
    }

    return recommendations;
  }
}