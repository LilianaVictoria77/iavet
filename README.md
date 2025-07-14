# Sistema de IA para Detección de Patrones de Comportamiento Animal

Sistema completo de análisis de comportamiento animal usando inteligencia artificial real para detectar síntomas y generar alertas médicas.

## 🚀 Características Principales

- **Análisis Real de IA**: Procesamiento de videos, imágenes y PDFs con GPT-4 Vision
- **Detección de Patrones**: Identificación automática de síntomas de comportamiento animal
- **Sistema de Alertas**: Generación automática de alertas médicas con sugerencias de enfermedades
- **Mensajería Interna**: Sistema completo de comunicación entre usuarios
- **Gestión de Usuarios**: Administración de veterinarios, ganaderos, investigadores
- **Dashboard Completo**: Visualización de estadísticas y análisis recientes

## 🛠️ Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar API de IA
```bash
# Copiar archivo de configuración
cp .env.example .env

# Editar .env y agregar tu API key de OpenAI
VITE_REACT_APP_AI_API_KEY=tu_api_key_aqui
```

### 3. Obtener API Key de OpenAI
1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nueva API key
3. Cópiala en tu archivo `.env`

### 4. Ejecutar la Aplicación
```bash
npm run dev
```

## 📋 Funcionalidades

### Análisis de IA Real
- **Videos**: Extracción de frames y análisis de comportamiento
- **Imágenes**: Detección de posturas y movimientos anormales
- **PDFs**: Extracción de texto y análisis de contenido médico
- **URLs**: Procesamiento de videos desde enlaces externos

### Detección de Síntomas
- Cojera y problemas de marcha
- Movimientos repetitivos anormales
- Posturas que indican dolor
- Aislamiento del grupo
- Temblores y convulsiones
- Comportamiento agresivo
- Reducción de actividad
- Vocalización excesiva

### Base de Conocimiento
- Mapeo automático de síntomas a enfermedades
- Sugerencias de diagnóstico diferencial
- Niveles de severidad (bajo, medio, alto, crítico)
- Recomendaciones de tratamiento

## 🏗️ Arquitectura Modular

### Servicios
- `AIAnalysisService`: Procesamiento de IA y análisis de contenido
- `UserManagement`: Gestión de usuarios y roles
- `MessagingSystem`: Sistema de mensajería interna
- `AlertSystem`: Generación y distribución de alertas

### Componentes
- `FileUpload`: Carga y procesamiento de archivos
- `PatternAnalysis`: Visualización de resultados de IA
- `Dashboard`: Panel principal con estadísticas
- `UserManagement`: Administración de usuarios
- `MessagingSystem`: Chat interno con imágenes
- `AlertSystem`: Gestión de alertas médicas

## 🔧 Integración

### API Endpoints (Para integración externa)
```typescript
// Analizar contenido
const result = await AIAnalysisService.analyzeContent(uploadData);

// Crear alerta
const alert = await AlertService.createAlert(patternData);

// Enviar mensaje
const message = await MessagingService.sendMessage(messageData);
```

### Hooks Personalizados
```typescript
// Estado global de la aplicación
const { users, alerts, messages, analysisResults } = useAppState();

// Análisis de IA
const { analyzeContent, isAnalyzing } = useAIAnalysis();
```

## 📊 Tipos de Datos

### AnalysisResult
```typescript
interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: 'video' | 'image' | 'pdf' | 'url';
  patterns: DetectedPattern[];
  confidence: number;
  timestamp: Date;
  animalSpecies?: string;
}
```

### DetectedPattern
```typescript
interface DetectedPattern {
  name: string;
  confidence: number;
  description: string;
  isSymptom: boolean;
  associatedDiseases: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

## 🚨 Sistema de Alertas

### Flujo de Alertas
1. **Detección**: IA identifica patrones anormales
2. **Clasificación**: Sistema determina si es síntoma
3. **Asociación**: Mapeo a enfermedades potenciales
4. **Alerta**: Generación automática de alerta médica
5. **Notificación**: Envío a usuarios relevantes

### Niveles de Severidad
- **Crítico**: Requiere atención inmediata
- **Alto**: Atención urgente en 24h
- **Medio**: Evaluación en 48-72h
- **Bajo**: Monitoreo continuo

## 🔒 Seguridad

- Validación de archivos y URLs
- Límites de tamaño de archivo (100MB)
- Sanitización de contenido
- Manejo seguro de API keys
- Validación de tipos de usuario

## 📱 Responsive Design

- Diseño adaptativo para móviles y tablets
- Navegación optimizada para touch
- Carga eficiente de contenido multimedia
- Interfaz intuitiva en todos los dispositivos

## 🎨 Personalización

### Tema Visual
- Fondo negro profesional
- Texto blanco para legibilidad
- Acentos rojos para acciones importantes
- Gradientes sutiles y efectos hover
- Iconografía clara y consistente

### Configuración de Colores
```css
:root {
  --primary-bg: #000000;
  --secondary-bg: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
  --accent-red: #ef4444;
  --accent-red-hover: #dc2626;
}
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Agrega tests si es necesario
5. Envía un pull request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Abre un issue en GitHub
- Consulta la documentación de la API
- Revisa los logs de error en la consola del navegador

## 🔄 Actualizaciones

- Versión actual: 1.0.0
- Última actualización: 2024
- Próximas características: Análisis en tiempo real, ML personalizado