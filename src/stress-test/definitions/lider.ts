/**
 * "Stress Test de Robustez y Crecimiento del Líder".
 * Fuente: Excel del cliente (octubre 2026).
 *
 * 25 afirmaciones en 5 pilares (5 c/u), escala Likert 1-5.
 * Puntaje por pilar (5-25) con 4 bandas, y puntaje global (25-125) con 4 niveles.
 *
 * A diferencia del cuestionario de emprendimiento, la devolución de cada banda
 * es una lista de 5 afirmaciones (`bullets`) y el cierre sale del cruce entre
 * el norte elegido y el nivel alcanzado (`CRUCES`).
 */

import type {
  Assessment,
  Cruce,
  GlobalBand,
  NorteOption,
  Pilar,
  ScalePoint,
} from '../types';

const SCALE: ScalePoint[] = [
  { value: 1, label: 'Totalmente en desacuerdo' },
  { value: 2, label: 'En desacuerdo' },
  { value: 3, label: 'Ni de acuerdo ni en desacuerdo' },
  { value: 4, label: 'De acuerdo' },
  { value: 5, label: 'Totalmente de acuerdo' },
];

/** Sectores definidos por el cliente (2026-10-06). */
const SECTORES = [
  'Administración Pública / Gobierno',
  'Agro y Ganadería',
  'Comercio / Retail',
  'Construcción y Bienes Raíces',
  'Educación',
  'Energía, Minería y Recursos Naturales',
  'Industria / Manufactura',
  'Logística y Transporte',
  'Medios, Entretenimiento y Cultura',
  'ONG y Sector Social',
  'Salud y Farmacéutica',
  'Servicios (Profesionales, Financieros, Seguros)',
  'Tecnología y Telecomunicaciones',
  'Turismo, Hotelería y Gastronomía',
  'Otro',
];

const ORG_FIELDS = [
  {
    key: 'nombreEmprendimiento',
    label: 'Nombre de la organización (opcional)',
    placeholder: 'Ej.: Polaris',
    optional: true,
  },
  {
    key: 'sector',
    label: 'Sector',
    placeholder: 'Elegí una opción',
    options: SECTORES,
  },
  {
    key: 'antiguedad',
    label: 'Antigüedad de la organización',
    placeholder: 'Ej.: 2 años',
  },
  {
    key: 'tamanoEquipo',
    label: 'Número de personas a cargo',
    placeholder: 'Ej.: 8 personas',
  },
];

const PILARES: Pilar[] = [
  {
    key: 'direccion',
    name: 'Dirección, Alineación Estratégica y Foco',
    questions: [
      {
        id: 1,
        text: 'Comprendo con claridad los objetivos estratégicos de la organización y puedo explicárselos a mi equipo de manera sencilla.',
        textoTercera:
          'Comprende con claridad los objetivos estratégicos de la organización y puede explicárselos a su equipo de manera sencilla.',
      },
      {
        id: 2,
        text: 'Traduzco las metas de la empresa en prioridades operativas concretas y alcanzables para mi área.',
        textoTercera:
          'Traduce las metas de la empresa en prioridades operativas concretas y alcanzables para su área.',
      },
      {
        id: 3,
        text: 'Reviso periódicamente el foco de trabajo de mi equipo y ajusto prioridades para evitar la dispersión.',
        textoTercera:
          'Revisa periódicamente el foco de trabajo de su equipo y ajusta prioridades para evitar la dispersión.',
      },
      {
        id: 4,
        text: 'Tomo decisiones cotidianas coherentes con el rumbo estratégico de la compañía, incluso bajo presión.',
        textoTercera:
          'Toma decisiones cotidianas coherentes con el rumbo estratégico de la compañía, incluso bajo presión.',
      },
      {
        id: 5,
        text: 'Negocio recursos y discuto prioridades con la dirección para garantizar el cumplimiento de los objetivos de mi área.',
        textoTercera:
          'Negocia recursos y discute prioridades con la dirección para garantizar el cumplimiento de los objetivos de su área.',
      },
    ],
    bands: [
      {
        min: 21,
        max: 25,
        title: 'Visión Estratégica y Foco Claro',
        bullets: [
          'Demostrás una comprensión profunda del rumbo de la organización y la habilidad de traducirlo en metas cotidianas.',
          'Mantenés a tu equipo enfocado en las prioridades clave, protegiéndolo de la dispersión y los pedidos secundarios.',
          'Tomás decisiones alineadas con la estrategia general, aun en escenarios de alta presión o incertidumbre.',
          'Contás con la capacidad política para negociar prioridades y recursos de forma madura ante la dirección.',
          'Tu área opera con un foco claro y consistente, que refleja de manera directa la estrategia de la compañía.',
        ],
      },
      {
        min: 16,
        max: 20,
        title: 'Alineación Operativa Funcional',
        bullets: [
          'Comprendés las metas de la empresa y lográs orientar el trabajo operativo del área hacia ellas.',
          'Ocasionalmente la acumulación de urgencias provoca breves momentos de dispersión en la agenda de tu equipo.',
          'Tomás decisiones mayormente alineadas con la estrategia, aunque bajo alta presión podés perder cierta coherencia o costar comunicarle el “por qué” al equipo.',
          'Negociás recursos y prioridades cuando es estrictamente necesario, pero podrías tomar un rol más proactivo ante la dirección.',
          'Tu área funciona de manera coherente con la estrategia, aunque con márgenes de mejora en foco, comunicación y negociación.',
        ],
      },
      {
        min: 11,
        max: 15,
        title: 'Desalineación Estratégica Moderada',
        bullets: [
          'El trabajo de tu área está excesivamente orientado al día a día y con poca conexión visible con la estrategia global.',
          'Te cuesta decir “no” o frenar iniciativas secundarias, lo que sobrecarga al equipo con tareas dispersas.',
          'Traducir las metas de la empresa en prioridades operativas concretas representa un desafío frecuente.',
          'Las decisiones tienden a ser reactivas antes que planificadas según el rumbo estratégico de la empresa.',
          'Aceptás metas o restricciones de la dirección sin discutir si existen los recursos o el tiempo real para cumplirlas.',
        ],
      },
      {
        min: 5,
        max: 10,
        title: 'Desconexión Estratégica Crítica',
        bullets: [
          'Existe una desconexión severa entre lo que la empresa busca y lo que tu área ejecuta cotidianamente.',
          'El equipo trabaja sin prioridades claras, operando en un estado permanente de apagar incendios.',
          'Te resulta difícil transformar las metas de la compañía en un plan operativo con foco definido.',
          'Tus decisiones responden a la presión del momento sin un criterio organizador ni mirada de mediano plazo.',
          'Falta capacidad o espacio de interlocución con la dirección para definir los rumbos del área y negociar recursos.',
        ],
      },
    ],
  },
  {
    key: 'comunicacion',
    name: 'Comunicación, Confianza y Seguridad Psicológica',
    questions: [
      {
        id: 6,
        text: 'Comunico de manera transparente a mi equipo los cambios, expectativas y decisiones que los afectan.',
        textoTercera:
          'Comunica de manera transparente a su equipo los cambios, expectativas y decisiones que los afectan.',
      },
      {
        id: 7,
        text: 'Fomento un clima donde el equipo puede expresar ideas, dudas o errores sin temor a represalias.',
        textoTercera:
          'Fomenta un clima donde el equipo puede expresar ideas, dudas o errores sin temor a represalias.',
      },
      {
        id: 8,
        text: 'Abordo a tiempo los conflictos y las conversaciones difíciles sobre desempeño o conducta.',
        textoTercera:
          'Aborda a tiempo los conflictos y las conversaciones difíciles sobre desempeño o conducta.',
      },
      {
        id: 9,
        text: 'Escucho activamente las sugerencias y desacuerdos de mi equipo antes de decidir.',
        textoTercera:
          'Escucha activamente las sugerencias y desacuerdos de su equipo antes de decidir.',
      },
      {
        id: 10,
        text: 'Promuevo en mi equipo el compromiso con la calidad y los plazos de entrega pactados.',
        textoTercera:
          'Promueve en su equipo el compromiso con la calidad y los plazos de entrega pactados.',
      },
    ],
    bands: [
      {
        min: 21,
        max: 25,
        title: 'Entorno de Alta Confianza y Asertividad',
        bullets: [
          'Generás un espacio seguro donde las personas expresan ideas, asumen riesgos calculados y reconocen errores sin temor.',
          'Comunicás las decisiones y cambios con absoluta transparencia y previsibilidad.',
          'Enfrentás los conflictos y desvíos de desempeño de forma oportuna, asertiva y constructiva.',
          'Escuchás activamente las sugerencias y desacuerdos del equipo antes de tomar decisiones.',
          'Promovés una cultura interna de compromiso con la calidad y el cumplimiento de los plazos pactados.',
        ],
      },
      {
        min: 16,
        max: 20,
        title: 'Comunicación Efectiva con Oportunidades de Ajuste',
        bullets: [
          'Mantenés informada a tu gente sobre los cambios, expectativas y decisiones que los afectan.',
          'El equipo se expresa con libertad, aunque ante errores críticos puede aparecer cierta reticencia a reportarlos de inmediato.',
          'Abordás las conversaciones difíciles, aunque a veces demorás el momento de encararlas por evitar tensiones.',
          'Escuchás las sugerencias del equipo, aunque en situaciones de estrés tendés a decidir de forma unilateral.',
          'Existe un compromiso básico con la calidad y los plazos, pero no siempre está plenamente internalizado en el equipo.',
        ],
      },
      {
        min: 11,
        max: 15,
        title: 'Clima Inestable y Fricción Comunicacional',
        bullets: [
          'La información fluye de manera irregular o parcial hacia el equipo, generando incertidumbre o rumores.',
          'Existen señales de cautela o temor en los colaboradores al momento de señalar fallas, proponer ideas o disentir.',
          'Solés postergar el manejo de conductas problemáticas o desacuerdos hasta que la situación escala.',
          'Escuchás de forma limitada las sugerencias del equipo, y su impacto en las decisiones es bajo.',
          'La exigencia por la calidad se percibe más como una presión externa que como un compromiso compartido.',
        ],
      },
      {
        min: 5,
        max: 10,
        title: 'Déficit de Confianza y Comunicación Defensiva',
        bullets: [
          'La comunicación es unidireccional, escasa o se limita a la bajada de órdenes directas.',
          'El clima de trabajo carece de seguridad psicológica; las personas operan a la defensiva para evitar culpas.',
          'Evitás por completo los conflictos difíciles o los abordás desde el exabrupto y la imposición.',
          'No hay espacios reales de escucha ni de participación para los integrantes de tu equipo.',
          'El compromiso con la calidad y los plazos es débil o inexistente, y se cumple solo bajo control o presión.',
        ],
      },
    ],
  },
  {
    key: 'resultados',
    name: 'Gestión de Resultados, Mejora Continua e IA',
    questions: [
      {
        id: 11,
        text: 'Establezco indicadores claros para medir el avance y el éxito del trabajo de mi área.',
        textoTercera:
          'Establece indicadores claros para medir el avance y el éxito del trabajo de su área.',
      },
      {
        id: 12,
        text: 'Hago seguimiento periódico de los indicadores y entregables de mi área.',
        textoTercera:
          'Hace seguimiento periódico de los indicadores y entregables de su área.',
      },
      {
        id: 13,
        text: 'Asumo la responsabilidad final por los errores o incumplimientos de mi área, sin trasladar la culpa a otros.',
        textoTercera:
          'Asume la responsabilidad final por los errores o incumplimientos de su área, sin trasladar la culpa a otros.',
      },
      {
        id: 14,
        text: 'Incorporo herramientas digitales e inteligencia artificial disponible para optimizar los procesos y la toma de decisiones de mi área.',
        textoTercera:
          'Incorpora herramientas digitales e inteligencia artificial disponible para optimizar los procesos y la toma de decisiones de su área.',
      },
      {
        id: 15,
        text: 'Propongo e impulso mejoras e innovaciones en los procesos y servicios de mi área.',
        textoTercera:
          'Propone e impulsa mejoras e innovaciones en los procesos y servicios de su área.',
      },
    ],
    bands: [
      {
        min: 21,
        max: 25,
        title: 'Gestión Basada en Datos e Innovación',
        bullets: [
          'Establecés indicadores claros y objetivos para medir el avance y el éxito del trabajo de tu área.',
          'Realizás un seguimiento riguroso y periódico de esos indicadores y de los entregables del área.',
          'Asumís la responsabilidad de los resultados del equipo con total accountability frente a la organización.',
          'Adoptás e integrás activamente herramientas de IA y tecnologías disponibles para hacer más eficientes los procesos.',
          'Promovés una cultura proactiva de innovación, simplificación y mejora continua en procesos y servicios.',
        ],
      },
      {
        min: 16,
        max: 20,
        title: 'Control Operativo Eficiente',
        bullets: [
          'Contás con métricas definidas para evaluar el avance del trabajo de tu área.',
          'Hacés seguimiento de los entregables e indicadores, aunque con cierta irregularidad en la rutina.',
          'Asumís los errores del área, aunque ocasionalmente el análisis se enfoca más en buscar responsables que en corregir sistemas.',
          'Utilizás la tecnología estándar de la empresa y explorás de manera puntual herramientas digitales o de IA.',
          'Impulsás mejoras cuando detectás fallas evidentes, aunque la innovación no es aún una rutina sistemática.',
        ],
      },
      {
        min: 11,
        max: 15,
        title: 'Seguimiento Informal y Baja Digitalización',
        bullets: [
          'La medición del área se basa más en sensaciones o percepciones que en indicadores objetivos y sistemáticos.',
          'El seguimiento de entregables es irregular y muchas veces reactivo ante problemas.',
          'Te cuesta asumir con plenitud la responsabilidad por desvíos, justificando fallas en terceros o imprevistos.',
          'Hay resistencia o desinterés hacia el uso de nuevas tecnologías e inteligencia artificial en la operación diaria.',
          'Las mejoras en los procesos ocurren de forma aislada, solo cuando un problema vuelve insostenible la rutina.',
        ],
      },
      {
        min: 5,
        max: 10,
        title: 'Descontrol de Gestión y Obsolescencia',
        bullets: [
          'No existen métricas claras para medir el éxito del trabajo de tu área.',
          'La gestión carece de visibilidad y seguimiento sobre los entregables y el avance del área.',
          'Se evade la responsabilidad por los incumplimientos del área, trasladando culpas a otras dependencias o subordinados.',
          'El área opera de forma obsoleta, rechazando el uso de herramientas digitales disponibles que optimizarían el tiempo.',
          'No hay iniciativas de mejora; los procesos se ejecutan “como siempre se hicieron” a pesar de su ineficiencia.',
        ],
      },
    ],
  },
  {
    key: 'desarrollo',
    name: 'Desarrollo, Delegación, Autonomía y Stakeholders',
    questions: [
      {
        id: 16,
        text: 'Delego tareas importantes y doy margen de decisión a mis colaboradores.',
        textoTercera:
          'Delega tareas importantes y da margen de decisión a sus colaboradores.',
      },
      {
        id: 17,
        text: 'Mi equipo puede sostener la operación con calidad si me ausento por varios días.',
        textoTercera:
          'Su equipo puede sostener la operación con calidad si se ausenta por varios días.',
      },
      {
        id: 18,
        text: 'Identifico las necesidades de capacitación de mi equipo y gestiono soluciones concretas para su desarrollo profesional.',
        textoTercera:
          'Identifica las necesidades de capacitación de su equipo y gestiona soluciones concretas para su desarrollo profesional.',
      },
      {
        id: 19,
        text: 'Brindo las herramientas y recursos necesarios para que mi equipo trabaje con autonomía.',
        textoTercera:
          'Brinda las herramientas y recursos necesarios para que su equipo trabaje con autonomía.',
      },
      {
        id: 20,
        text: 'Gestiono de forma activa las relaciones con otras áreas, clientes internos/externos y proveedores para cumplir los objetivos de mi área.',
        textoTercera:
          'Gestiona de forma activa las relaciones con otras áreas, clientes internos/externos y proveedores para cumplir los objetivos de su área.',
      },
    ],
    bands: [
      {
        min: 21,
        max: 25,
        title: 'Liderazgo Facilitador y Ecosistema Integrado',
        bullets: [
          'Delegás tareas importantes y das margen de decisión real a tus colaboradores.',
          'Tu equipo sostiene la operación con calidad y fluidez cuando te ausentás por varios días.',
          'Detectás las brechas de competencias de tu equipo y gestionás activamente soluciones para su crecimiento.',
          'Proveés los recursos y herramientas necesarias para el desempeño autónomo de tus colaboradores.',
          'Construís alianzas fluidas y colaborativas con clientes internos, proveedores y áreas pares.',
        ],
      },
      {
        min: 16,
        max: 20,
        title: 'Delegación Funcional con Redes Activas',
        bullets: [
          'Delegás tareas operativas adecuadamente, aunque en temas críticos tendés a rebalancear el control hacia vos.',
          'El área funciona bien si te ausentás unos días, aunque pueden frenarse algunas decisiones clave.',
          'Identificás necesidades de capacitación y apoyás al equipo cuando te lo solicitan.',
          'Brindás las herramientas y recursos necesarios, aunque no siempre de forma suficiente u oportuna.',
          'Mantenés buenas relaciones con otras áreas, resolviendo las demandas interdepartamentales con solvencia.',
        ],
      },
      {
        min: 11,
        max: 15,
        title: 'Centralización Operativa y Aislamiento',
        bullets: [
          'Presentás dificultades para delegar; tendés al micromanagement o a supervisar en exceso la ejecución.',
          'La operación del área se desacelera o detiene de forma notable si no estás disponible para decidir.',
          'La capacitación se percibe como una tarea secundaria frente a la urgencia de la producción o la entrega.',
          'No siempre brindás las herramientas y recursos necesarios para que el equipo trabaje con plena autonomía.',
          'Mantenés una relación reactiva o tirante con clientes internos y otras áreas, trabajando en lógica de “isla”.',
        ],
      },
      {
        min: 5,
        max: 10,
        title: 'Cuello de Botella y Fricción Institucional',
        bullets: [
          'Sos un cuello de botella absoluto para tu equipo; no delegás margen de decisión ni responsabilidades.',
          'El equipo se paraliza ante tu ausencia por falta de autonomía, procesos o preparación.',
          'Desatendés el desarrollo profesional del personal; no hay espacios ni recursos para el aprendizaje.',
          'Faltan herramientas y recursos básicos para que el equipo pueda trabajar con autonomía.',
          'Existe una fricción permanente o desconexión total con el resto de la organización, generando bloqueos entre áreas.',
        ],
      },
    ],
  },
  {
    key: 'autogestion',
    name: 'Autogestión, Resiliencia, Criterio y Ética',
    questions: [
      {
        id: 21,
        text: 'Mantengo el autocontrol y la claridad de criterio ante crisis y cambios abruptos de prioridad.',
        textoTercera:
          'Mantiene el autocontrol y la claridad de criterio ante crisis y cambios abruptos de prioridad.',
      },
      {
        id: 22,
        text: 'Reviso y modifico mis opiniones o decisiones cuando la evidencia muestra una alternativa mejor.',
        textoTercera:
          'Revisa y modifica sus opiniones o decisiones cuando la evidencia muestra una alternativa mejor.',
      },
      {
        id: 23,
        text: 'Reconozco mis límites y pido ayuda cuando un problema supera mi capacidad o conocimiento.',
        textoTercera:
          'Reconoce sus límites y pide ayuda cuando un problema supera su capacidad o conocimiento.',
      },
      {
        id: 24,
        text: 'Actúo conforme a los valores éticos de la organización, incluso cuando esto implica costos personales o para mi área.',
        textoTercera:
          'Actúa conforme a los valores éticos de la organización, incluso cuando esto implica costos personales o para su área.',
      },
      {
        id: 25,
        text: 'Busco activamente feedback de superiores, pares y colaboradores sobre mi desempeño como líder.',
        textoTercera:
          'Busca activamente feedback de superiores, pares y colaboradores sobre su desempeño como líder.',
      },
    ],
    bands: [
      {
        min: 21,
        max: 25,
        title: 'Integridad, Inteligencia Emocional y Autogestión',
        bullets: [
          'Mantenés la calma, la templanza y el criterio analítico durante las crisis o reconfiguraciones de trabajo.',
          'Ajustás o cambiás tus posturas con flexibilidad cuando la evidencia demuestra una opción superior.',
          'Mostrás humildad profesional para reconocer tus límites y pedir asesoramiento oportuno.',
          'Actuás conforme a los valores éticos de la organización, incluso cuando esto implica costos personales o para tu área.',
          'Buscás activamente feedback sobre tu liderazgo y lo integras de forma sistemática en tu autodesarrollo.',
        ],
      },
      {
        min: 16,
        max: 20,
        title: 'Consistencia y Flexibilidad en Desarrollo',
        bullets: [
          'Manejás bien la presión en el trabajo, aunque las crisis prolongadas resienten ocasionalmente tu claridad.',
          'Modificás tus opiniones ante datos contundentes, aunque inicialmente te cuesta soltar tu idea original.',
          'Reconocés cuando un problema te supera, aunque podés demorar un tiempo antes de solicitar apoyo externo.',
          'Guiás tu gestión por principios éticos, incluso en situaciones donde hay presiones o costos asociados.',
          'Recibís el feedback de forma constructiva la mayor parte del tiempo y lo usas para ajustar tu forma de liderar.',
        ],
      },
      {
        min: 11,
        max: 15,
        title: 'Rigidez y Fricción Emocional Bajo Presión',
        bullets: [
          'Te cuesta regular tus respuestas emocionales ante cambios abruptos o escenarios de alta exigencia.',
          'Mostrás rigidez para revisar tus propias opiniones o decisiones, defendiendo tus enfoques a pesar de los datos.',
          'Dudás en pedir ayuda por temor a proyectar debilidad o falta de capacidad ante la estructura.',
          'Tu coherencia con los valores éticos es variable y depende del contexto o la presión del momento.',
          'Presentás resistencia defensiva al recibir feedback sobre tu forma de liderar.',
        ],
      },
      {
        min: 5,
        max: 10,
        title: 'Reactividad, Inflexibilidad e Incoherencia',
        bullets: [
          'Perdés con facilidad el autocontrol o la claridad de criterio en situaciones de estrés o incertidumbre.',
          'Tenés una posición dogmática: rechazás evidencias que contradigan tu visión, cerrándote a alternativas mejores.',
          'Operás en soledad, incapaz de reconocer tus límites o pedir ayuda, exponiendo al área a errores graves.',
          'Actuás de forma inconsistentemente con los valores éticos de la organización, priorizando resultados o presiones del momento.',
          'Hay nula apertura a recibir feedback sobre tu desempeño; cualquier evaluación se percibe como amenaza.',
        ],
      },
    ],
  },
];

const GLOBAL_BANDS: GlobalBand[] = [
  {
    level: 'alto',
    min: 105,
    max: 125,
    title: 'Gestión robusta con base para escalar',
    perfil: 'Atleta de élite',
    text: 'Demostrás un dominio integral de las competencias directivas y operás con alto impacto estratégico. Aunque tu desempeño es sobresaliente, el mayor riesgo es la complacencia o perder de vista puntos ciegos. Tu trabajo a partir de hoy es de optimización fina, escalado de impacto y formación de nuevos líderes.',
    closing: 'Aceleración y escalado de impacto. Tu liderazgo muestra una estructura sólida, madura y altamente alineada con la estrategia. La prioridad en esta etapa no es solo sostener la excelencia operativa, sino seguir consolidando procesos, afilar la visión de futuro y potenciar la capacidad de crecimiento del equipo sin aumentar dependencias ni sobrecarga personal. Tu foco de coaching es el desarrollo de sucesores y la optimización fina.',
  },
  {
    level: 'medio',
    min: 80,
    max: 104,
    title: 'Liderazgo solvente con potencial de aceleración',
    perfil: 'Piloto de consolidación',
    text: 'Mantenés la operación bajo control y respondés con eficacia a las demandas de tu rol. Tus bases son sólidas, pero el riesgo principal es quedar atrapado en la inercia operativa o en el micromanagement. Tu trabajo clave es profundizar la delegación, afilar la estrategia y acelerar el desarrollo del equipo.',
    closing: 'Optimización y liberación de capacidad. Tu desempeño es totalmente funcional y responde a las exigencias actuales, pero aún presenta áreas de fricción o centralización que conviene ordenar. El foco del trabajo debe estar en fortalecer la delegación, sistematizar los indicadores clave y reducir la dependencia que el área mantiene sobre tu presencia constante.',
  },
  {
    level: 'bajo',
    min: 55,
    max: 79,
    title: 'Liderazgo reactivo con desgaste operativo',
    perfil: 'Apagafuegos en emergencia',
    text: 'Experimentás fricciones frecuentes en la gestión del equipo y en el cumplimiento sostenido de metas. Aun reconociendo tu esfuerzo por sostener la rutina, el peligro inminente es el agotamiento y la rotación de talento. Tu trabajo urgente es reordenar prioridades, establecer certezas operativas e implementar rutinas básicas de comunicación.',
    closing: 'Reordenamiento y estabilización operativa. Tu liderazgo sostiene la rutina mediante un alto esfuerzo personal, pero opera en un escenario de desgaste y fragilidad estructural. La prioridad inmediata debe centrarse en redefinir prioridades, establecer certezas operativas para el equipo, sanear la comunicación y recuperar margen de maniobra antes de intentar asumir nuevos compromisos.',
  },
  {
    level: 'muyBajo',
    min: 25,
    max: 54,
    title: 'Liderazgo en riesgo con necesidad de reajuste de bases',
    perfil: 'Timonel sin rumbo',
    text: 'La dinámica actual presenta altos niveles de improvisación, fricción y sobrecarga personal. Reconociendo la complejidad del escenario que atravesás, el mayor riesgo es la pérdida de legitimidad y efectividad. El trabajo inmediato es alinear expectativas con la dirección, sanear la comunicación con el equipo y redefinir tus mínimos no negociables.',
    closing: 'Intervención y reconstrucción de bases. El diagnóstico evidencia una desconexión severa entre las demandas del rol y la rutina diaria, con un riesgo alto de parálisis o rotación. El trabajo urgente no es de optimización, sino de intervención de fondo: alinear expectativas mínimas no negociables con la dirección, restablecer la confianza básica con el equipo y rediseñar por completo tus hábitos de gestión.',
  },
];

const NORTE_QUESTION = '¿Cuál es el norte principal de tu liderazgo hoy?';

const NORTE_OPTIONS: NorteOption[] = [
  {
    key: 'aceleracion',
    label: 'Aceleración y Escala: Busco acelerar mi crecimiento, validar mi potencial de gestión y asumir desafíos de mayor impacto profesional.',
  },
  {
    key: 'estructura',
    label: 'Estructura y Equilibrio: Busco optimizar la operación, consolidar la autonomía de mi equipo y gestionar con más equilibrio estratégico.',
  },
];

/**
 * Cierre que combina el norte elegido con el nivel alcanzado.
 *
 * En el Excel los dos bloques venían rotulados "Joven / Sub-40" y "Senior /
 * +40". El cliente confirmó (2026-10-05) que la distinción es por NORTE, no
 * por edad: Norte A = Aceleración y Escala, Norte B = Estructura y Equilibrio.
 * El formulario no pregunta la edad.
 */
const CRUCES: Cruce[] = [
  {
    norteKey: 'aceleracion',
    level: 'alto',
    lectura: 'Tracción y escalado de impacto.',
    diagnostico: 'Tus capacidades actuales respaldan plenamente tu ambición de aceleración. Tu prioridad de coaching no es corregir fallas, sino preparar la estructura para duplicar tu impacto sin que el crecimiento degrade la calidad operativa.',
    primerPaso: 'Identificá 2 iniciativas de alto impacto que puedas liderar en los próximos 6 meses y definí a 1 persona clave a desarrollar como sucesor en tu área.',
  },
  {
    norteKey: 'aceleracion',
    level: 'medio',
    lectura: 'Desafío de crecimiento con necesidad de delegación.',
    diagnostico: 'Tu intención de acelerar requerirá romper la inercia operativa. Para asumir desafíos mayores sin saturarte, el trabajo de coaching debe centrarse en soltar el control directo y acelerar el desarrollo de tu primera línea.',
    primerPaso: 'Identificá 1 proceso clave que hoy absorba tu agenda y diseña un plan para delegar su ejecución en 30 días, conservando únicamente los indicadores de control.',
  },
  {
    norteKey: 'aceleracion',
    level: 'bajo',
    lectura: 'Alerta de sobreestiramiento.',
    diagnostico: 'Existe una brecha entre tu deseo de acelerar y la fragilidad de tu estructura actual. Intentar escalar hoy aumentará el desgaste personal. Tu prioridad de coaching no es acelerar, sino estabilizar las bases para que el crecimiento sea sostenible. Una vez estabilizadas, tu ambición de expansión tendrá un piso mucho más sólido.',
    primerPaso: 'Antes de asumir nuevos compromisos, define 3 prioridades no negociables de tu área para los próximos 60 días y comunicalas de forma transparente a tu equipo y a tu superior.',
  },
  {
    norteKey: 'aceleracion',
    level: 'muyBajo',
    lectura: 'Incompatibilidad de escenario.',
    diagnostico: 'Pretender asumir nuevos desafíos o acelerar en la situación actual representa un alto riesgo de frustración y parálisis. El trabajo de coaching exige hacer una pausa, alinear expectativas realistas con la dirección y reconstruir hábitos básicos antes de planificar cualquier expansión. Una vez saneada la base, la ambición de crecimiento recobrará viabilidad.',
    primerPaso: 'Solicitá una reunión con tu líder para recalibrar expectativas, transparentar el estado actual de la operación y acordar qué condiciones mínimas deben estabilizarse antes de proyectar nuevos desafíos.',
  },
  {
    norteKey: 'estructura',
    level: 'alto',
    lectura: 'Maestría y eficiencia sistémica.',
    diagnostico: 'Tenés la solidez necesaria para volcar tu energía en ganar autonomía, liberar tiempo personal y elevar la madurez del equipo. Tu trabajo de coaching es afilar la delegación para que la operación funcione con mayor fluidez y menor desgaste.',
    primerPaso: 'Seleccioná 3 decisiones operativas que hoy tomás vos y transferilas de forma explícita a tu equipo en las próximas 2 semanas.',
  },
  {
    norteKey: 'estructura',
    level: 'medio',
    lectura: 'Consolidación operativa focalizada.',
    diagnostico: 'Tu meta de equilibrio coincide muy bien con el estado de tu gestión. El foco de coaching estará en sistematizar procesos, reducir la dependencia sobre tu presencia y eliminar cuellos de botella para lograr una operación predecible.',
    primerPaso: 'Mapeá los 3 principales cuellos de botella donde la gestión depende exclusivamente de vos y definí una primera medida concreta para reducir cada uno en el próximo mes.',
  },
  {
    norteKey: 'estructura',
    level: 'bajo',
    lectura: 'Foco urgente en reducción de fricción.',
    diagnostico: 'Tu búsqueda de mayor equilibrio es acertada e imprescindible. El trabajo de coaching se enfocará en reordenar prioridades, establecer certezas operativas básicas y recuperar margen de maniobra personal.',
    primerPaso: 'Coordiná una reunión con tu equipo para acordar 3 reglas básicas de operación (plazos, canales de comunicación y prioridades) y revisalas semanalmente durante un mes.',
  },
  {
    norteKey: 'estructura',
    level: 'muyBajo',
    lectura: 'Intervención y reconstrucción de bases.',
    diagnostico: 'Tu diagnóstico evidencia la necesidad urgente de detener la improvisación. La prioridad absoluta de coaching es redefinir mínimos no negociables, sanear la comunicación con el equipo y reordenar tu rutina operativa.',
    primerPaso: 'Definí por escrito 3 mínimos no negociables de tu gestión (ej.: seguimiento semanal de indicadores, reunión táctica de equipo y límite de horas diarias) y comprometete a cumplirlos durante 4 semanas.',
  },
];

const LECTURA_GENERAL: string[] = [
  'Este diagnóstico busca identificar tanto la robustez actual de tu liderazgo como sus principales palancas de crecimiento. El resultado no debe leerse como una etiqueta cerrada, sino como un mapa dinámico de fortalezas, vulnerabilidades y oportunidades de mejora.',
  'Es importante tener en cuenta que se trata de una autoevaluación: los resultados reflejan la visión que vos tenés de tu propia gestión, no una evaluación externa de 360°. Esto no resta valor al diagnóstico; por el contrario, lo convierte en un punto de partida honesto para trabajar sobre tu autopercepción, contrastarla con feedback concreto y ajustar tu estilo de liderazgo.',
  'La lectura por pilares permite distinguir entre zonas de fragilidad, áreas de consolidación y potencial de escalado, orientando el trabajo de coaching de manera precisa hacia donde tendrá mayor impacto.',
];

export const LIDER: Assessment = {
  key: 'lider',
  title: 'Stress Test de Robustez y Crecimiento del Líder',
  shortName: 'Stress Test del Líder',
  intro:
    '25 afirmaciones en 5 pilares. Respondé según cuánto coincidís con cada una (1 a 5). Al ' +
    'finalizar vas a recibir tu nivel de robustez como líder y una devolución por pilar. ' +
    'Toma unos 10 minutos.',
  orgFieldsTitle: 'Sobre tu organización',
  orgFields: ORG_FIELDS,
  scale: SCALE,
  pilares: PILARES,
  globalBands: GLOBAL_BANDS,
  norteQuestion: NORTE_QUESTION,
  norteOptions: NORTE_OPTIONS,
  cruces: CRUCES,
  lecturaGeneral: LECTURA_GENERAL,

  // ── Presentación pública (textos del cliente, 09/10/2026) ──
  // En el sitio se ofrece como una de las dos miradas de la conversación de
  // desempeño; el título del test queda como está para no romper los informes
  // ya emitidos, que lo llevan impreso.
  nombrePublico: 'Autoevaluación de la Persona Evaluada',
  subtitulo: 'La práctica de autogestión de quien recibe la evaluación',
  orientadoA:
    'Orientada a profesionales y líderes que participan como evaluados. Permite revisar ' +
    'cómo gestionan sus metas, su desempeño y su desarrollo.',
  explora: [
    'Dirección, alineación estratégica y foco.',
    'Comunicación, confianza y seguridad psicológica.',
    'Gestión de resultados y mejora continua.',
    'Delegación, autonomía y gestión de stakeholders.',
    'Autogestión, resiliencia, criterio y ética.',
    'Apropiación del PDI y compromiso con el aprendizaje.',
  ],
  aporta:
    'Mayor preparación para participar en la conversación con datos, sentido de autoría y ' +
    'una visión clara de sus posibilidades de desarrollo.',
  grupo: 'gestion-desempeno',

  // Se publica con el sitio. Para esconderlo hay que desactivarlo en el panel.
  activo: true,

  // Evaluación 360°. Queda habilitada, pero no se puede usar hasta que las
  // afirmaciones tengan su `textoTercera`: el cuestionario de terceros habla
  // de otra persona y el texto en primera persona no sirve ahí.
  // Esa redacción la aporta el cliente.
  evaluacion360: true,
  dias360: 7,
  maxEvaluadores: 3,
};
