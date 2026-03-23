# 🌱 Programación con Propósito

Plataforma educativa para enseñar programación a estudiantes de 1ero de secundaria mediante retos interactivos y un asistente de IA.

## 📋 Descripción

Este proyecto es una aplicación web estática (GitHub Pages) que combina:
- **Retos interactivos**: 8 desafíos de programación basados en la planificación del curso
- **Asistente de IA**: Chatbot que ayuda a los estudiantes cuando no pueden avanzar

## 🏗️ Estructura del Proyecto

```
progra-purpose/
├── index.html          # Frontend principal
├── styles.css          # Estilos (diseño kid-friendly)
├── script.js           # Lógica + API Hugging Face
├── data/
│   └── links.json      # Links organizados por sesión
├── skills/             # Archivos descriptivos para el agente
│   ├── ai-birds.json
│   ├── ocean-ai.json
│   ├── blockly.json
│   ├── codemonkey.json
│   ├── scratch.json
│   ├── code-art.json
│   ├── codecombat.json
│   └── sports-game.json
└── README.md           # Documentación
```

## 🚀 Cómo Usar

### 1. Configurar el Token de Hugging Face

1. Crea una cuenta en [Hugging Face](https://huggingface.co)
2. Ve a Settings → Access Tokens
3. Crea un nuevo token (Read permission)
4. Edita `script.js` y reemplaza:

```javascript
//ínea 1 del script.js
let HF_TOKEN = "TU_TOKEN_AQUI";
```

### 2. Subir a GitHub Pages

1. Crea un repositorio en GitHub
2. Sube todos los archivos de la carpeta `progra-purpose`
3. Ve a Settings → Pages
4. Selecciona la rama `main` y guarda
5. Espera 1-2 minutos y tu sitio estará vivo

### 3. Usar la Plataforma

**Apartado de Retos:**
- Muestra 8 tarjetas con los retos del curso
- Cada tarjeta incluye: día, título, descripción, fase, y enlace
- Al hacer clic, pregunta si completaste el reto y lo marca
- Guarda el progreso en localStorage

**Apartado de Chat:**
- Chat con el asistente de IA
- El agente conoce todos los skills/cada reto
- Ayuda sin dar la solución directa
- Usa el modelo Mistral-7B-Instruct de Hugging Face

## 📚 Contenido de los Retos

| Día | Reto | Plataforma | Concepto |
|-----|------|------------|----------|
| 1 | AI for Birds | CodeMonkey | Machine Learning |
| 2 | IA para los Océanos | Code.org | Clasificación de datos |
| 3 | Blockly Games | Blockly | Lógica y bloques |
| 4 | Código del Mono | CodeMonkey | Algoritmos |
| 5 | Gemas y Condicionales | Scratch | Lógica condicional |
| 6 | Arte con Código | Code.org | Patrones visuales |
| 7 | CodeCombat | CodeCombat | Desarrollo de juegos |
| 8 | Sports Game | Code.org | Iteración y personalización |

## ⚠️ Nota de Seguridad

**Importante:** Si planeas publicar este sitio públicamente, tu token de API quedará visible en el código.

**Soluciones seguras:**
1. **Para desarrollo/prueba local**: Usar token directamente
2. **Para producción**: Crear un Cloudflare Worker como proxy

### Ejemplo con Cloudflare Worker:

```javascript
// worker.js
export default {
  async fetch(request) {
    const hfToken = "TU_HF_TOKEN"; // Secured here
    const body = await request.json();
    
    const response = await fetch("https://api-inferencia.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    return new Response(response.body);
  }
};
```

Luego cambiar en `script.js` la URL a tu worker.

## 🎨 Personalización

### Cambiar el modelo
En `script.js`, línea 2:
```javascript
const HF_API_URL = "https://api-inference.huggingface.co/models/NOMBRE_DEL_MODELO";
```

Modelos gratuitos recomendados:
- `mistralai/Mistral-7B-Instruct-v0.2`
- `google/gemma-7b-it`
- `meta-llama/Llama-3-8B-Instruct`

### Agregar más retos
1. Añade el link en `links.txt`
2. Crea un nuevo archivo en `skills/`
3. Actualiza `data/links.json`

## 📝 Licencia

MIT License - Educational Use

## 👨‍🏫 Créditos

Basado en la planificación curricular del Prof. Edwin Agustín para 1ero de Secundaria - Programación