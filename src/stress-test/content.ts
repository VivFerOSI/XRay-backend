/**
 * Contenido del "Stress Test de Robustez y Crecimiento del Emprendimiento".
 * Fuente: Excel del cliente (V02 070826). Es la autoevaluación de la Fase 2.
 *
 * 25 afirmaciones en 5 pilares (5 c/u), escala Likert 1–5.
 * Puntaje por pilar (5–25) con 4 bandas, y puntaje global (25–125) con 4 niveles.
 */

export interface ScalePoint {
  value: number;
  label: string;
}

export interface Question {
  id: number;
  text: string;
  /** Si es true, el puntaje se invierte (5→1, 4→2, 3→3, 2→4, 1→5). */
  reverse?: boolean;
}

export interface Band {
  min: number;
  max: number;
  title: string;
  text: string;
}

export interface Pilar {
  key: string;
  name: string;
  questions: Question[];
  bands: Band[];
}

export type GlobalLevel = 'alto' | 'medio' | 'bajo' | 'muyBajo';

export interface GlobalBand {
  level: GlobalLevel;
  min: number;
  max: number;
  title: string;
  perfil: string;
  text: string;
  /** Párrafo de "llamada a la acción" según el nivel global. */
  closing: string;
}

export interface NorteOption {
  key: string;
  label: string;
  /** Cierre personalizado según el norte elegido. */
  closing: string;
}

export const SCALE: ScalePoint[] = [
  { value: 1, label: 'Totalmente en desacuerdo' },
  { value: 2, label: 'En desacuerdo' },
  { value: 3, label: 'Ni de acuerdo ni en desacuerdo' },
  { value: 4, label: 'De acuerdo' },
  { value: 5, label: 'Totalmente de acuerdo' },
];

/** Datos del emprendimiento que se piden al inicio. */
export const ORG_FIELDS = [
  { key: 'nombreEmprendimiento', label: 'Nombre del emprendimiento', placeholder: 'Ej.: Polaris' },
  { key: 'sector', label: 'Sector / rubro', placeholder: 'Ej.: Climatización, software, salud…' },
  { key: 'antiguedad', label: 'Antigüedad', placeholder: 'Ej.: 2 años' },
  { key: 'tamanoEquipo', label: 'Número de personas en el equipo', placeholder: 'Ej.: 8 personas' },
];

export const PILARES: Pilar[] = [
  {
    key: 'resiliencia',
    name: 'Resiliencia Estratégica',
    questions: [
      { id: 1, text: 'Ningún cliente representa hoy más del 30% de mi facturación total.' },
      { id: 2, text: 'Si mi producto o servicio principal cayera mañana, tengo otros que sostienen la estructura.' },
      { id: 3, text: 'Cuento con liquidez para cubrir al menos 4 meses de costos fijos si la facturación se detuviera.' },
      { id: 4, text: 'Mi negocio no depende de una sola ley, subsidio, plataforma o condición externa que no controlo.' },
      { id: 5, text: 'Tengo calculado, mes a mes, mi margen neto real después de pagarlo todo, incluido un sueldo razonable para mí.' },
    ],
    bands: [
      { min: 21, max: 25, title: 'Modelo robusto', text: 'El emprendimiento muestra una base comercial sana. La facturación no depende excesivamente de un solo cliente, producto o condición externa, y existe margen para absorber cambios del entorno. La rentabilidad real está relativamente clara y la estructura tiene capacidad de sostenerse ante contingencias de corto plazo.' },
      { min: 16, max: 20, title: 'Modelo en desarrollo', text: 'La estructura comercial funciona, pero todavía presenta dependencias que conviene reducir. Puede haber cierta concentración de ingresos, margen ajustado o una reserva de caja limitada. El negocio no está en riesgo inmediato, pero sí necesita fortalecer su base económica para ganar previsibilidad.' },
      { min: 11, max: 15, title: 'Modelo frágil', text: 'La operación depende demasiado de pocos ingresos, poca holgura financiera o condiciones difíciles de controlar. La rentabilidad y la liquidez probablemente requieren más orden y seguimiento. Antes de pensar en expansión, conviene trabajar sobre la solidez económica del negocio.' },
      { min: 5, max: 10, title: 'Modelo de alta exposición', text: 'El emprendimiento está muy vulnerable a cualquier caída de facturación o cambio externo. La caja es escasa, la dependencia comercial es alta y la continuidad puede verse comprometida con facilidad. En este nivel, la prioridad es proteger la supervivencia y ordenar la estructura financiera.' },
    ],
  },
  {
    key: 'madurez',
    name: 'Madurez Operativa',
    questions: [
      { id: 6, text: 'Puedo desconectarme 15 días sin que la operación se detenga o baje la calidad del servicio.' },
      { id: 7, text: 'Los procesos críticos de mi negocio están documentados de manera clara y actualizada.' },
      { id: 8, text: 'He capacitado a mi equipo para que ejecute tareas clave con autonomía, sin depender de mi intervención permanente.' },
      { id: 9, text: 'Uso de forma sistemática herramientas de IA y automatización para optimizar o agilizar tareas y procesos clave de mi negocio.' },
      { id: 10, text: 'Tomamos decisiones basadas en métricas e informes periódicos, no solo intuición.' },
    ],
    bands: [
      { min: 21, max: 25, title: 'Operación autónoma', text: 'Los procesos críticos están bien estructurados y apoyados en tecnología, automatización e IA. El equipo opera con autonomía sin depender de manera permanente del fundador, lo que distribuye el conocimiento clave y asegura la continuidad y escalabilidad del negocio.' },
      { min: 16, max: 20, title: 'Operación en consolidación', text: 'Existe orden, cierta delegación y un aprovechamiento inicial de herramientas digitales, pero persisten cuellos de botella. El fundador sigue siendo indispensable para destrabar decisiones clave. El desafío está en profundizar la automatización e institucionalizar rutinas.' },
      { min: 11, max: 15, title: 'Operación centralizada', text: 'El negocio depende en gran medida del dueño para sostener la calidad y resolver problemas. Aunque existen procesos o herramientas aisladas, no hay una sistemática de documentación, automatización ni delegación real. Conviene enfocarse en estandarizar y digitalizar la operación.' },
      { min: 5, max: 10, title: 'Operación dependiente del fundador', text: 'La continuidad del negocio está atada a la presencia diaria y la energía del emprendedor, con escaso uso de procesos documentados o herramientas de automatización. Si el líder se ausenta, la operación pierde fluidez. En este nivel hace falta construir sistema antes que escalar.' },
    ],
  },
  {
    key: 'blindaje',
    name: 'Blindaje de Riesgos',
    questions: [
      { id: 11, text: 'Tengo formalizada la situación laboral de mi equipo o, si no, cuento con provisiones reales para cubrir contingencias.' },
      { id: 12, text: 'Mi negocio cuenta con coberturas o seguros adecuados frente a riesgos relevantes para su actividad.' },
      { id: 13, text: 'Tengo protocolos claros para prevenir daños a clientes, terceros o al propio negocio.' },
      { id: 14, text: 'Si tengo deudas, fueron tomadas para inversión y conozco su costo real.' },
      { id: 15, text: 'Mi negocio cumple con las habilitaciones, permisos y normativas que le corresponden.' },
    ],
    bands: [
      { min: 21, max: 25, title: 'Riesgo bien administrado', text: 'La organización cuenta con medidas razonables de prevención, formalidad y cobertura. Los principales riesgos están identificados y existe una gestión preventiva que reduce la exposición legal, laboral y patrimonial. Este nivel aporta tranquilidad y estabilidad.' },
      { min: 16, max: 20, title: 'Riesgo parcialmente controlado', text: 'Hay avances en formalización y prevención, pero todavía quedan brechas por cerrar. Puede haber coberturas incompletas, registros parciales o protocolos no del todo consolidados. El negocio funciona, pero aún tiene puntos vulnerables que conviene ordenar.' },
      { min: 11, max: 15, title: 'Riesgo subatendido', text: 'La empresa presenta varias exposiciones que podrían generar complicaciones serias si ocurre un incidente. Es probable que haya vacíos en formalidad, seguros, contratos o protocolos. El foco debería estar en reducir contingencias antes de que se conviertan en problemas mayores.' },
      { min: 5, max: 10, title: 'Riesgo crítico', text: 'El emprendimiento está desprotegido frente a eventos relevantes. Hay alta exposición a problemas laborales, legales, operativos o patrimoniales. En este nivel, cualquier incidente puede afectar con fuerza la continuidad del negocio.' },
    ],
  },
  {
    key: 'liderazgo',
    name: 'Liderazgo y Cultura',
    questions: [
      { id: 16, text: 'Con frecuencia pido feedback honesto a mi equipo y estoy dispuesto/a a cambiar procesos a partir de lo que escucho.' },
      { id: 17, text: 'Los objetivos del negocio están claros para mi equipo y sabemos cómo se mide el avance.' },
      { id: 18, text: 'En mi negocio, mi equipo sabe que hay reconocimientos y beneficios pensados para quienes contribuyen al logro de los resultados.' },
      { id: 19, text: 'Mis contratos con consultores tienen objetivos medibles, plazos de entrega y retorno esperado.' },
      { id: 20, text: 'Siento con frecuencia que la operación diaria me satura y que puedo ser el principal cuello de botella de mi negocio.', reverse: true },
    ],
    bands: [
      { min: 21, max: 25, title: 'Liderazgo abierto y orientado al aprendizaje', text: 'El fundador muestra apertura al feedback, claridad para comunicar objetivos y disposición para revisar decisiones. El equipo puede crecer dentro de una cultura de mejora continua, y la asesoría externa tiene posibilidades reales de aportar valor. Este es un contexto muy favorable para coaching.' },
      { min: 16, max: 20, title: 'Liderazgo funcional con oportunidades de mejora', text: 'Hay bases sanas de conducción y cierta apertura al cambio, pero no siempre se traducen en hábitos consistentes. Puede haber buena intención, aunque todavía aparecen límites personales o culturales que frenan parte del desarrollo. El trabajo debería enfocarse en consolidar criterios y rutinas de gestión.' },
      { min: 11, max: 15, title: 'Liderazgo con fricciones', text: 'La comunicación, el feedback o la revisión de procesos aparecen de manera irregular. Es posible que exista distancia entre lo que el líder dice y lo que efectivamente cambia. Acá suele ser útil trabajar autoconciencia, delegación y capacidad de escucha.' },
      { min: 5, max: 10, title: 'Liderazgo cerrado o defensivo', text: 'Hay poca apertura al cuestionamiento y escasa flexibilidad para revisar prácticas de gestión. Eso limita el aprendizaje del equipo y disminuye el valor de cualquier apoyo externo. En este nivel, el coaching debería empezar por la relación del líder con el cambio.' },
    ],
  },
  {
    key: 'crecimiento',
    name: 'Palancas de Crecimiento',
    questions: [
      { id: 21, text: 'Mi propuesta de valor está tan bien definida que mi equipo y clientes la entienden sin esfuerzo.' },
      { id: 22, text: 'Tengo al menos un canal de ventas o adquisición que funciona de forma relativamente estable y previsible.' },
      { id: 23, text: 'Dispongo de una rutina personal que me ayuda a priorizar lo importante y sostener mi productividad.' },
      { id: 24, text: 'En mi negocio, hacemos seguimiento sistemático de los acuerdos y las tareas relevantes.' },
      { id: 25, text: 'Tengo identificadas mis palancas de crecimiento (canales, productos, alianzas o mercados) y ejecuto acciones concretas en al menos una de ellas.' },
    ],
    bands: [
      { min: 21, max: 25, title: 'Crecimiento bien apalancado', text: 'La propuesta de valor está clara, hay señales de previsibilidad comercial y existe una base razonable de productividad, seguimiento e indicadores. El negocio no solo vende: también aprende, ordena y mejora. Este nivel muestra una capacidad real de escalar con criterio.' },
      { min: 16, max: 20, title: 'Crecimiento en consolidación', text: 'Existen elementos importantes para crecer, pero todavía no están totalmente integrados. Puede haber ventas, productividad y seguimiento, aunque no siempre con suficiente consistencia. La oportunidad está en ordenar mejor las prioridades y convertir más acciones en rutina.' },
      { min: 11, max: 15, title: 'Crecimiento poco sistematizado', text: 'Hay intención de crecer, pero faltan foco, hábitos de ejecución y métricas claras. El negocio probablemente avance más por empuje que por método. El desafío es instalar una lógica más estable de priorización, seguimiento y medición.' },
      { min: 5, max: 10, title: 'Crecimiento débil o improvisado', text: 'El emprendimiento no tiene todavía palancas claras para crecer de manera sostenida. La propuesta de valor puede ser difusa, las decisiones poco ordenadas y el seguimiento insuficiente. Antes de escalar, conviene construir una base mínima de claridad y gestión.' },
    ],
  },
];

export const GLOBAL_BANDS: GlobalBand[] = [
  {
    level: 'alto',
    min: 105,
    max: 125,
    title: 'Emprendimiento robusto y con base para escalar',
    perfil: 'Emprendimiento Robustecido · Atleta de Elite',
    text: 'El negocio tiene estructura. El peligro aquí es el estancamiento o la complacencia. El trabajo es de optimización y escalado exponencial.',
    closing: 'Tu emprendimiento muestra una estructura relativamente sólida. La prioridad no es solo sostener la operación, sino seguir consolidando procesos, liderazgo y capacidad de crecimiento sin aumentar dependencias.',
  },
  {
    level: 'medio',
    min: 80,
    max: 104,
    title: 'Emprendimiento funcional, con áreas claras de mejora',
    perfil: 'Emprendimiento Funcional · En Estado Físico Medio',
    text: 'Funciona pero con fricciones. Están a una crisis o a la salida de un empleado clave de caer en zona de riesgo. El coaching los ayudará a consolidar autonomía.',
    closing: 'Tu emprendimiento funciona, pero todavía presenta áreas de fragilidad que conviene ordenar. El foco debería estar en fortalecer la base operativa, mejorar la previsibilidad comercial y reducir la dependencia excesiva del fundador.',
  },
  {
    level: 'bajo',
    min: 55,
    max: 79,
    title: 'Emprendimiento frágil, con riesgos y dependencias importantes',
    perfil: 'Emprendimiento Frágil · Sedentario con Sobreesfuerzo',
    text: 'Avanza por puro empuje y pulmón del dueño, pero el desgaste es insostenible. Detener el incendio operativo inmediato y reestructurar las bases antes de que colapse la salud del fundador.',
    closing: 'Tu emprendimiento muestra vulnerabilidades importantes en más de un frente. Antes de pensar en expandir, conviene trabajar sobre caja, procesos, riesgos y claridad de gestión para construir una base más sana.',
  },
  {
    level: 'muyBajo',
    min: 25,
    max: 54,
    title: 'Emprendimiento en situación crítica, con necesidad de intervención prioritaria',
    perfil: 'En situación Crítica · En Terapia Intensiva',
    text: 'Riesgo inminente de continuidad. Intervención prioritaria de rescate financiero y de procesos básicos.',
    closing: 'Tu emprendimiento requiere una revisión prioritaria de su estructura. El objetivo inicial no es crecer, sino recuperar control sobre la operación, el riesgo y la viabilidad del negocio.',
  },
];

export const NORTE_QUESTION = '¿Cuál es el norte principal de tu liderazgo hoy?';

export const NORTE_OPTIONS: NorteOption[] = [
  {
    key: 'aceleracion',
    label: 'Aceleración y Escala: quiero validar mi modelo, ganar mercado y hacer crecer el negocio de forma exponencial.',
    closing: 'Tu diagnóstico muestra que tenés el empuje para crecer, pero tu negocio sigue dependiendo al 100% de tu energía diaria. Si querés escalar sin fundirte en el intento, necesitás aprender a crear estructura. Sumate al entrenamiento.',
  },
  {
    key: 'estructura',
    label: 'Estructura y Equilibrio: quiero ordenar la operación, delegar con criterio y recuperar tiempo libre o blindar mi bienestar.',
    closing: 'A esta altura, el negocio debería trabajar para vos y no al revés. Tu diagnóstico indica que es momento de consolidar procesos, blindar riesgos y proteger tu bienestar y tu tiempo libre. Agendá un Pit Stop con nosotros.',
  },
];

/** Todas las preguntas en orden (1–25), derivadas de los pilares. */
export const ALL_QUESTIONS: Question[] = PILARES.flatMap((p) => p.questions);
