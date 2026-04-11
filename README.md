# Velvet 🏨💜 (Impacthon 2026)

## Tu asistente hotelero personalizado con IA

Velvet es una herramienta integral de gestión y análisis para el sector hotelero, desarrollada durante la **Impacthon 2026**. Su objetivo es proporcionar a los gestores una plataforma avanzada para adelantarse a las tendencias, analizar la competencia y ejecutar estrategias de crecimiento mediante inteligencia artificial.

## 🌟 Características Principales

### 1. 🤖 Oráculo de Estrategias (IA)
Velvet ofrece un análisis personalizado de tu hotel y te recomienda estrategias basadas en datos reales y tendencias del mercado.
*   **Generación de Estrategias**: Crea tácticas específicas con análisis de ROI, costes y tiempos.
*   **Seguimiento Dinámico**: Permite modificar las estrategias sobre la marcha y Velvet te ayuda a adaptarlas.
*   **Markdown Interactivo**: Presentación de planes claros mediante `MarkdownRenderer.tsx`.

### 2. 📊 Dashboard de Estadísticas (Stats)
Visualización profunda de métricas clave (KPIs) combinando datos de ocupación y segmentación de clientes desde `customer_data_200.csv` y `hotel_data.csv`.

### 3. 🏁 Análisis de Competencia
Compara el rendimiento de tu hotel con el mercado. Detecta carencias en servicios (amenities) y optimiza tu posicionamiento competitivo.

### 4. 💰 Revenue Management (Estrategia de Pricing)
Implementación de lógica de precios dinámicos para maximizar el RevPar buscando el equilibrio perfecto entre ocupación y tarifa media.

## 🛠️ Stack Tecnológico

*   **Frontend**: [Next.js](https://nextjs.org/) (App Router), React 19, Tailwind CSS.
*   **Base de Datos**: [Prisma](https://www.prisma.io/) con SQLite para persistencia y auditoría de cambios.
*   **IA**: **Google Gemini (Vertex AI)** para la generación de contenido y lógica predictiva.
*   **Visualización**: [Recharts](https://recharts.org/) para gráficos de negocio interactivos.

## 📂 Estructura del Proyecto

*   `frontend/app/`: Rutas de la aplicación (Stats, Competition, Strategy, Amenities, Login).
*   `frontend/api/`: Servicios backend para análisis de datos, chat de IA y gestión de hoteles.
*   `frontend/components/`: Interfaz UI reactiva (Sidebar, Header, MarkdownRenderer).
*   `frontend/data/`: Fuentes de datos en CSV para análisis histórico.
*   `frontend/prisma/`: Esquema de datos y sembrado (seeding) de la aplicación.

## 🚀 Instalación y Uso

1.  **Clonar e Instalar**:
    ```bash
    npm install
    ```
2.  **Configurar Base de Datos**:
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```
3.  **Lanzar Entorno**:
    ```bash
    npm run dev
    ```
