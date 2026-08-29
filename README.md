<p align="center">
  <img src="https://img.icons8.com/fluency/96/shield.png" alt="Agentes de Prevención Logo"/>
</p>

<h1 align="center">🛡️ Agentes de Prevención — Plataforma Geoespacial y Lúdica de Gestión de Riesgos</h1>

<p align="center">
  <strong>Plataforma web interactiva para la educación, diagnóstico y análisis geoespacial de amenazas naturales en comunidades escolares.</strong><br/>
  <em>Caso de estudio: Cantón Baños de Agua Santa, Ecuador.</em>
</p>

<p align="center">
  <a href="https://enfoque-tecnologico.vercel.app/">
    <img src="https://img.shields.io/badge/Demo_en_Vivo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"/>
  </a>
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18"/>
  <img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/GIS-GeoTIFF_%26_Shapefiles-4A90E2?style=for-the-badge&logo=qgis&logoColor=white" alt="GIS"/>
  <img src="https://img.shields.io/badge/Animations-Framer_Motion-FF4154?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"/>
</p>

---

## 🌐 Despliegue en Producción

- **🔗 Aplicación Web en Vivo:** [https://enfoque-tecnologico.vercel.app/](https://enfoque-tecnologico.vercel.app/)
- **📦 Repositorio en GitHub:** [https://github.com/Byron45/Enfoque-Tecnologico](https://github.com/Byron45/Enfoque-Tecnologico)

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Módulo Geoespacial & Visor de Mapas (GIS)](#-módulo-geoespacial--visor-de-mapas-gis)
  - [1. Capas Temáticas de Amenaza](#1-capas-temáticas-de-amenaza)
  - [2. Renderizado de GeoTIFFs y Shapefiles en el Navegador](#2-renderizado-de-geotiffs-y-shapefiles-en-el-navegador)
  - [3. Georreferenciación de Instituciones Educativas](#3-georreferenciación-de-instituciones-educativas)
- [Módulo de Gamificación & Misiones de Aprendizaje](#-módulo-de-gamificación--misiones-de-aprendizaje)
- [Panel de Administración](#-panel-de-administración)
- [Modelo de Base de Datos (Supabase)](#-modelo-de-base-de-datos-supabase)
- [Stack Tecnológico](#-stack-tecnológico)
- [Guía de Instalación y Ejecución](#-guía-de-instalación-y-ejecución)
- [Estructura del Proyecto](#-estructura-del-proyecto)

---

## 🔍 Descripción General

**Agentes de Prevención (Proyecto Fusilero)** es una plataforma tecnológica desarrollada como proyecto de investigación y grado universitario orientada a la **Gestión del Riesgo de Desastres (GRD)** en el sistema educativo.

El sistema fusiona dos pilares fundamentales:
1. **Gamificación Pedagógica**: Una experiencia inmersiva para niños de educación básica donde crean su perfil de "Agente de Prevención", superan misiones lúdicas ante erupciones volcánicas, sismos, inundaciones y evacuaciones, resuelven dinámicas de mochila de emergencia con *drag-and-drop*, y obtienen un **certificado oficial de aprobación en PDF de alta resolución generado al instante**.
2. **Sistema de Información Geográfica (GIS) en la Nube**: Un visor cartográfico interactivo que procesa y superpone capas raster GeoTIFF y vectoriales de 8 tipos de amenazas naturales sobre el territorio de **Baños de Agua Santa (Tungurahua, Ecuador)**, evaluando la vulnerabilidad de las escuelas y colegios locales.

---

## ✨ Características Principales

| Característica | Detalle |
|----------------|---------|
| 🌋 **Misiones de Aprendizaje Temáticas** | 5 misiones interactivas con narrativa visual: Diagnóstico Inicial, Volcán Tungurahua, Inundaciones, Sismos y Plan de Evacuación. |
| 🎒 **Minijuegos de Mochila de Emergencia** | Mecánica interactiva de arrastrar y soltar (*drag-and-drop*) con validación de elementos indispensables para supervivencia. |
| 🗺️ **Visor GIS Multicapa en Tiempo Real** | Carga y renderizado dinámico de archivos GeoTIFF y Shapefiles (`.shp`/`.zip`/`.kml`) directamente en el cliente mediante HTML5 Canvas. |
| 🏫 **Geolocalización de Escuelas** | 13 instituciones educativas de Baños georreferenciadas con coordenadas y cotas de elevación sobre el mapa de riesgo. |
| 📜 **Generador de Certificados PDF** | Motor de dibujo en Canvas (2400×1680 px) que compone el nombre del estudiante, avatar e institución educativa y exporta un documento PDF listo para imprimir. |
| 📊 **Panel de Administración Completo** | Control de acceso seguro (`/admin`), gestión masiva de agentes registrados, analíticas de avance y publicación de mapas raster a Supabase Storage. |
| 🎨 **Diseño Inclusivo y Adaptativo** | Tema visual lúdico infantil con cursor personalizado de colibrí animado, microinteracciones con Framer Motion y responsive design con Tailwind CSS. |

---

## 🏗 Arquitectura del Sistema

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                               CLIENT BROWSER                                │
│                                                                             │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │   🧒 MÓDULO ESTUDIANTE (KIDS)   │   │   🛠️ MÓDULO ADMINISTRADOR (ADMIN)│  │
│  │   • KidLobby: Registro & Avatar │   │   • AdminGate: Acceso por PIN   │  │
│  │   • Hub: Selección de Misiones  │   │   • Gestión masiva de Agentes   │  │
│  │   • Misiones Gamificadas        │   │   • Publicador de Mapas GIS     │  │
│  │   • Drag & Drop de Mochila      │   │   • Buzón de sugerencias        │  │
│  │   • Certificados PDF Canvas     │   │   • Analíticas de aprobación    │  │
│  └────────────────┬────────────────┘   └────────────────┬────────────────┘  │
│                   │                                     │                   │
│  ┌────────────────▼─────────────────────────────────────▼────────────────┐  │
│  │                🗺️ VISOR GEOESPACIAL INTERACTIVO (GIS)                 │  │
│  │  • geotiffRenderer.ts (Decodificación de matrices raster en Canvas)   │  │
│  │  • territorialMaps.ts (Shapefiles de Parroquias y Cantón Baños)       │  │
│  │  • OpenStreetMap Tiles + 13 Instituciones Educativas geolocalizadas   │  │
│  │  • Control de opacidad, leyendas y selector de simbología             │  │
│  └────────────────┬──────────────────────────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────────────────────────┘
                    │
                    │ REST API / WebSocket Subscriptions (supabase-js)
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ☁️ SUPABASE CLOUD BACKEND                            │
│                                                                             │
│  ┌──────────────────────────────┐          ┌─────────────────────────────┐  │
│  │ 🐘 PostgreSQL Database (RLS) │          │ 📦 Supabase Storage Buckets │  │
│  │ • public.agentes             │          │ • bucket: "mapas"           │  │
│  │ • public.mapas_recursos      │          │   ├─ /inundaciones/preview  │  │
│  │ • public.sugerencias         │          │   ├─ /volcanico/raster.json │  │
│  └──────────────────────────────┘          │   └─ /territorio/poligonos  │  │
│                                            └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                    │
                    │ Continuous Deployment (Git Push Hook)
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ⚡ VERCEL EDGE PLATFORM HOSTING                        │
│                   https://enfoque-tecnologico.vercel.app/                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Módulo Geoespacial & Visor de Mapas (GIS)

### 1. Capas Temáticas de Amenaza

La plataforma integra 8 recursos cartográficos especializados del cantón Baños de Agua Santa:

```text
┌────────────────────────┬─────────────────────────────────────────────────────────────┐
│ Recurso Cartográfico   │ Descripción del Fenómeno Modelado                           │
├────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 🏫 Instituciones       │ Mapa territorial con las 13 escuelas y colegios de Baños.   │
│ 🌊 Inundaciones        │ Modelo de susceptibilidad por desbordamiento del Río Pastaza│
│ 🌋 Amenaza Volcánica   │ Lahares y avalanchas de escombros del Volcán Tungurahua.    │
│ ⛰️ Deslizamientos      │ Zonas de ladera inestable por movimientos en masa.          │
│ ❄️ Heladas             │ Zonas de alta cota afectadas por descensos térmicos severos.│
│ 🔥 Incendios           │ Sectores de alta susceptibilidad de cobertura vegetal.      │
│ ☀️ Sequía Hidrológica  │ Áreas con déficit de escorrentía superficial.               │
│ 💥 Amenaza Sísmica     │ Aceleración máxima del suelo (PGA: 0.40g a 0.60g).          │
└────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

### 2. Renderizado de GeoTIFFs y Shapefiles en el Navegador

El motor [`geotiffRenderer.ts`](file:///C:/Air/Enfoque-Tecnol-gico/src/utils/geotiffRenderer.ts) y [`territorialMaps.ts`](file:///C:/Air/Enfoque-Tecnol-gico/src/utils/territorialMaps.ts) ejecutan el procesamiento geoespacial del lado del cliente:
- **Decodificación GeoTIFF**: Utiliza `geotiff.js` para leer rasters georreferenciados, extrayendo bounding boxes `[minX, minY, maxX, maxY]` y matrices de valores.
- **Normalización de Escala de Color**: Mapea valores numéricos de amenaza a paletas cromáticas accesibles (Verde $\to$ Amarillo $\to$ Naranja $\to$ Rojo).
- **Simplificación Vectorial**: Integra `shpjs` y `simplify-js` para procesar polígonos de límites parroquiales en formato `.shp` empaquetados en `.zip`.

---

### 3. Georreferenciación de Instituciones Educativas

Las principales instituciones educativas de Baños de Agua Santa están parametrizadas con coordenadas exactas WGS84 y cotas de elevación:

```text
┌───────────────────────────────────────────────────┬──────────────┬──────────────┬────────────┐
│ Institución Educativa                             │ Longitud     │ Latitud      │ Elevación  │
├───────────────────────────────────────────────────┼──────────────┼──────────────┼────────────┤
│ Escuela de E.B. Pablo Arturo Suárez               │ -78.42138    │ -1.39640     │ 1,799 m    │
│ Escuela de E.B. Pedro Vicente Maldonado           │ -78.42355    │ -1.40000     │ 1,806 m    │
│ Escuela de Vizcaya                                │ -78.40653    │ -1.34856     │ 2,262 m    │
│ Escuela Fray Sebastián Acosta                     │ -78.42293    │ -1.39956     │ 1,810 m    │
│ Escuela Leonidas García (Río Blanco)              │ -78.34883    │ -1.39856     │ 1,584 m    │
│ Escuela Río Negro                                 │ -78.21185    │ -1.41321     │ 1,227 m    │
│ Unidad Educativa Baños (Secundaria)               │ -78.43042    │ -1.39722     │ 1,859 m    │
│ Unidad Educativa Baños (Primaria)                 │ -78.42655    │ -1.39795     │ 1,828 m    │
│ Unidad Educativa Dr. Misael Acosta Solís (Ulba)   │ -78.41172    │ -1.39268     │ 1,757 m    │
│ Unidad Educativa Oscar Efrén Reyes                │ -78.42047    │ -1.39765     │ 1,800 m    │
│ Unidad Educativa Palomino Flores (Agoyán)         │ -78.39553    │ -1.39543     │ 1,710 m    │
│ Unidad Educativa Puerta del Dorado (Río Verde)    │ -78.30033    │ -1.40169     │ 1,502 m    │
│ Unidad Educativa San Pío X                        │ -78.42308    │ -1.39964     │ 1,811 m    │
└───────────────────────────────────────────────────┴──────────────┴──────────────┴────────────┘
```

---

## 🎮 Módulo de Gamificación & Misiones de Aprendizaje

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │ Reg   │                 │       │   MISIONES      │
│   KidLobby      │──────▶│  Hub Principal  │──────▶│   TEMÁTICAS     │
│ (Nombre, Edad,  │       │ (Nivel 1 al 4)  │       │ 🌋 Volcán       │
│  Avatar, Esc.)  │       └────────┬────────┘       │ 🌊 Inundación   │
└─────────────────┘                │                │ 💥 Sismo        │
                                   │ Completa       │ 🚶 Evacuación   │
                                   │ todas          └────────┬────────┘
                                   ▼                         │
                          ┌─────────────────┐                │
                          │   Certificado   │◀───────────────┘
                          │   Oficial PDF   │
                          │ (Descarga HD)   │
                          └─────────────────┘
```

### Dinámicas Interactivas
1. **Mochila de Emergencia (`MochilaDragDropQuestion.tsx`)**: Los estudiantes deben clasificar y colocar dentro de la mochila únicamente los insumos vitales (linterna, agua embotellada, botiquín, radio a pilas, documentos plastificados, alimentos no perecibles), descartando distractores.
2. **Evaluaciones de Diagnóstico y Cierre (`Quiz.tsx`)**: Cuestionarios interactivos con retroalimentación inmediata, barras de vida y puntuaciones visuales.
3. **Generación Instantánea de Certificado**: Tras completar las misiones, se activa un diálogo interactivo con el diploma oficial que dibuja en alta resolución el sello institucional, firmas de acreditación y datos del estudiante.

---

## 🛠️ Panel de Administración

Ubicado en la ruta protegida `/admin`:
- **Control de Acceso (`AdminGate.tsx`)**: Protección por clave secreta de administración.
- **Gestión Masiva de Estudiantes**: Tabla interactiva con búsqueda por nombre o escuela, filtros por estado de misión completada, selección individual o total, eliminación y exportación a CSV.
- **Publicador de Mapas (`MapasAdminPage.tsx`)**: Interfaz para cargar nuevos archivos `.tif`, procesarlos en caliente y actualizar los enlaces en Supabase Storage sin necesidad de redeployar el código.
- **Buzón de Sugerencias**: Lectura de feedback y comentarios enviados por la comunidad escolar.

---

## 🗄 Modelo de Base de Datos (Supabase)

```sql
-- Tabla de Estudiantes / Agentes
create table public.agentes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  institucion text,
  edad integer,
  avatar text,
  nivel integer default 1,
  mision_volcan boolean default false,
  mision_inundacion boolean default false,
  mision_evacuacion boolean default false,
  mision_sismo boolean default false,
  ultima_conexion timestamptz
);

-- Tabla de Metadatos de Mapas Raster y Vectoriales
create table public.mapas_recursos (
  id text primary key,
  titulo text,
  descripcion text,
  tif_url text,
  preview_url text,
  storage_folder text,
  updated_at timestamptz not null default now()
);

-- Tabla de Retroalimentación de Usuarios
create table public.sugerencias (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  agente_nombre text,
  mensaje text not null,
  leido boolean default false
);
```

---

## 🛠 Stack Tecnológico

| Capa | Tecnologías |
|------|------------|
| **Frontend Framework** | React 18.2, TypeScript 5.2, Vite 5.1 |
| **Estilos & UI** | Tailwind CSS 3.4, PostCSS, Autoprefixer |
| **Iconografía & Gráficos** | Lucide React (0.344), HTML5 Canvas API |
| **Animaciones** | Framer Motion (11.0) |
| **Procesamiento GIS** | `geotiff` (2.1), `shpjs` (6.2), `simplify-js` (1.2), `jszip` (3.10) |
| **Backend & Cloud DB** | Supabase (@supabase/supabase-js 2.39), PostgreSQL |
| **Enrutamiento** | React Router DOM (6.22) |
| **Hosting & CI/CD** | Vercel (Edge Network) |

---

## 🚀 Guía de Instalación y Ejecución

### Requisitos Previos
- **Node.js** (v18.0.0 o superior)
- **npm** o **yarn**
- Cuenta en **[Supabase](https://supabase.com/)** (opcional para desarrollo local con nube propia)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Byron45/Enfoque-Tecnologico.git
cd Enfoque-Tecnologico
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 5. Compilar para Producción
```bash
npm run build
```

---

## 📁 Estructura del Proyecto

```
Enfoque-Tecnologico/
├── public/                         # Archivos estáticos públicos (logos, cursores, texturas)
├── scripts/                        # Scripts Node.js para pre-generación de mapas
├── src/
│   ├── assets/                     # Imágenes, avatares e ilustraciones de misiones
│   ├── components/                 # Componentes React y vistas principales
│   │   ├── KidLobby.tsx            # Pantalla de bienvenida y registro infantil
│   │   ├── Hub.tsx / KidHub.tsx    # Centro de control de misiones y niveles
│   │   ├── MapasPage.tsx           # Visor GIS interactivo multicapa
│   │   ├── MisionVolcan.tsx        # Misión interactiva de riesgo volcánico
│   │   ├── MisionInundacion.tsx    # Misión interactiva de riesgo por inundaciones
│   │   ├── MisionSismo.tsx         # Misión interactiva de riesgo sísmico
│   │   ├── MisionEvacuacion.tsx    # Misión y simulador de evacuación escolar
│   │   ├── MochilaDragDropQuestion # Minijuego interactivo de mochila de emergencia
│   │   ├── CertificateModal.tsx    # Generador de certificado de aprobación en PDF
│   │   ├── AdminPanel.tsx          # Panel administrativo de gestión de estudiantes
│   │   └── MapasAdminPage.tsx      # Publicador de recursos cartográficos a Supabase
│   ├── config/
│   │   └── mapResources.ts         # Metadatos, colores y capas temáticas del GIS
│   ├── data/
│   │   └── institucionesData.ts    # BDD georreferenciada de escuelas de Baños
│   ├── utils/
│   │   ├── geotiffRenderer.ts      # Motor de decodificación de rasters GeoTIFF
│   │   └── territorialMaps.ts      # Parser y simplificador de polígonos Shapefile
│   ├── supabaseClient.ts           # Inicialización y cliente de Supabase
│   ├── App.tsx                     # Enrutador principal y lazy loading
│   └── index.css                   # Estilos globales y clases del tema infantil
├── supabase/                       # Scripts de migración y esquemas SQL de Supabase
├── tailwind.config.js              # Configuración de paletas y extensiones de Tailwind
└── package.json                    # Dependencias y scripts del proyecto
```

---

<p align="center">
  <sub>Desarrollado como Proyecto de Investigación y Grado Universitario para la Gestión del Riesgo en Comunidades Educativas</sub>
</p>
