/**
 * "Stress Test de Robustez y Crecimiento del Líder Evaluador".
 * Fuente: hoja "AutoEv Evaluador (2)" del Excel del cliente (V05, 08/10/2026).
 *
 * 25 afirmaciones en 5 pilares (5 c/u), escala Likert 1-5.
 * Puntaje por pilar (5-25) con 4 bandas, y puntaje global (25-125) con 4 niveles.
 *
 * Igual que el cuestionario del líder: devolución por banda en viñetas y cierre
 * que cruza el norte elegido con el nivel alcanzado.
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

/** Mismos sectores que el cuestionario del líder. */
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
  { key: 'sector', label: 'Sector', placeholder: 'Elegí una opción', options: SECTORES },
  {
    key: 'antiguedad',
    label: 'Antigüedad en la organización',
    placeholder: 'Ej.: 4 años',
  },
  {
    key: 'tamanoEquipo',
    label: 'Número de personas a cargo',
    placeholder: 'Ej.: 8 personas',
  },
];

const PILARES: Pilar[] = [
  {
    key: 'objetividad',
    name: 'Objetividad, Evidencias y Criterios Claros',
    questions: [
      {
        id: 1,
        text: 'Registro de forma periódica hechos concretos, logros y evidencias observables de la persona evaluada durante todo el año.',
        textoTercera:
          'Registra de forma periódica hechos concretos, logros y evidencias observables de la persona evaluada durante todo el año.',
      },
      {
        id: 2,
        text: 'Fundamento mis calificaciones en indicadores u objetivos previamente acordados y no en impresiones generales.',
        textoTercera:
          'Fundamenta sus calificaciones en indicadores u objetivos previamente acordados y no en impresiones generales.',
      },
      {
        id: 3,
        text: 'Evalúo el desempeño basándome en el estándar esperado para el rol y no en comparaciones entre colaboradores.',
        textoTercera:
          'Evalúa el desempeño basándose en el estándar esperado para el rol y no en comparaciones entre colaboradores.',
      },
      {
        id: 4,
        text: 'Documento tanto los aciertos destacados como las desviaciones específicas para explicarlos con precisión durante la reunión.',
        textoTercera:
          'Documenta tanto los aciertos destacados como las desviaciones específicas para explicarlos con precisión durante la reunión.',
      },
      {
        id: 5,
        text: 'Reviso la descripción del puesto y las metas vigentes antes de redactar la evaluación final.',
        textoTercera:
          'Revisa la descripción del puesto y las metas vigentes antes de redactar la evaluación final.',
      },
    ],
    bands: [
      {
        min: 21,
        max: 25,
        title: 'Objetividad y registro sistemático consolidados',
        bullets: [
          'Llevás un seguimiento continuo y riguroso de hechos observables durante todo el periodo, construyendo una base sólida de evidencias que elimina la improvisación.',
          'Calificás con anclaje exclusivo en métricas, indicadores y metas previamente acordadas, blindando el proceso contra apreciaciones puramente intuitivas.',
          'Sostienes como único parámetro de evaluación la descripción de puesto y el estándar del rol, evitando distorsiones por comparación directa entre colaboradores.',
          'Documentás tanto aciertos como desviaciones con un nivel de detalle específico que le da solvencia, precisión y autoridad técnica a tus conversaciones de devolución.',
          'Revisás y contrastás exhaustivamente las metas vigentes antes de redactar el dictamen final, asegurando total coherencia entre la exigencia y la expectativa acordada.',
        ],
      },
      {
        min: 16,
        max: 20,
        title: 'Objetividad con registro parcial',
        bullets: [
          'Registrás logros y eventos significativos, aunque la recolección de evidencias pierde consistencia durante los momentos de mayor intensidad operativa.',
          'Apoyás tus evaluaciones en datos e indicadores claros, si bien en situaciones ambiguas la percepción general o el recuerdo reciente llegan a influir en la nota.',
          'Utilizás el estándar del puesto como referencia principal, aunque ocasionalmente permitís que el desempeño relativo de otros miembros del equipo sesgue tu criterio.',
          'Documentás los puntos clave del año, pero podés carecer de ejemplos concretos o fechas específicas para respaldar ciertos argumentos durante la reunión.',
          'Consultás la descripción del puesto y los objetivos al momento de redactar la evaluación, realizando una revisión correcta pero que se beneficiaría de un análisis más profundo.',
        ],
      },
      {
        min: 11,
        max: 15,
        title: 'Objetividad frágil y registro insuficiente',
        bullets: [
          'Llevás un registro de hechos intermitente o concentrado en los últimos meses del año, lo que te expone a evaluar por impresiones generales o momentos aislados.',
          'Combinás datos objetivos con supuestos o apreciaciones personales, restándole rigor y fundamentación formal a la calificación otorgada.',
          'Tendés a medir el rendimiento comparando a los colaboradores entre sí, alejándote de la vara objetiva que define el perfil y la responsabilidad del rol.',
          'Documentás aciertos o fallas de manera vaga o incompleta, lo que genera fricción o desacuerdo durante la devolución al no contar con ejemplos concretos.',
          'Revisás las metas formales de forma superficial o apurada antes de cerrar el informe, sin que funcionen como el eje estructurador de tu juicio.',
        ],
      },
      {
        min: 5,
        max: 10,
        title: 'Subjetividad y ausencia de registro',
        bullets: [
          'Carecés de un sistema de registro de evidencias a lo largo del año, lo que convierte la evaluación en un ejercicio basado en el recuerdo reciente o la intuición.',
          'Calificás a partir de percepciones globales o afinidades, omitiendo el contraste con indicadores medibles u objetivos previamente establecidos.',
          'Evaluás por comparación interpersonal, perdiendo de vista el nivel de exigencia real que demanda la función y el puesto en la organización.',
          'Omitís la documentación de hechos puntuales, dejando la conversación de feedback expuesta a discusiones subjetivas o interpretaciones encontradas.',
          'Prescindís de la lectura previa de la descripción del puesto y las metas vigentes, elaborando el dictamen sin un marco de referencia formal.',
        ],
      },
    ],
  },
  {
    key: 'imparcialidad',
    name: 'Conciencia Imparcial y Control de Sesgos',
    questions: [
      {
        id: 6,
        text: 'Evito que un incidente reciente (positivo o negativo) condicione la valoración de todo el periodo anual.',
        textoTercera:
          'Evita que un incidente reciente (positivo o negativo) condicione la valoración de todo el periodo anual.',
      },
      {
        id: 7,
        text: 'Distingo claramente entre la calidad del desempeño profesional y la simpatía personal hacia el evaluado.',
        textoTercera:
          'Distingue claramente entre la calidad del desempeño profesional y la simpatía personal hacia el evaluado.',
      },
      {
        id: 8,
        text: 'Mantengo una ponderación equilibrada, evitando que una fortaleza o debilidad puntual invalide el resto de las competencias (efecto halo).',
        textoTercera:
          'Mantiene una ponderación equilibrada, evitando que una fortaleza o debilidad puntual invalide el resto de las competencias (efecto halo).',
      },
      {
        id: 9,
        text: 'Reconozco mis propios prejuicios o supuestos previos para evitar que influyan en la calificación final.',
        textoTercera:
          'Reconoce sus propios prejuicios o supuestos previos para evitar que influyan en la calificación final.',
      },
      {
        id: 10,
        text: 'Muestro apertura para revisar y ajustar mi apreciación inicial si el colaborador aporta datos o matices válidos.',
        textoTercera:
          'Muestra apertura para revisar y ajustar su apreciación inicial si el colaborador aporta datos o matices válidos.',
      },
    ],
    bands: [
      {
        min: 21,
        max: 25,
        title: 'Neutralidad analítica y gestión de sesgos consolidada',
        bullets: [
          'Neutralizás el sesgo de recencia de forma sistemática, asegurando que un hecho puntual (positivo o negativo) no eclipse la trayectoria global del año.',
          'Distinguís con absoluta lucidez la calidad técnica del desempeño de la afinidad o empatía personal, garantizando un dictamen profesional e imparcial.',
          'Mantenés un criterio ponderado e integral, impidiendo que una fortaleza o debilidad puntual contamine la valoración global del abanico de competencias (efecto halo).',
          'Practicás un ejercicio consciente de autoconocimiento para identificar tus propios supuestos y prejuicios, evitando que distorsionen la calificación final.',
          'Sostenés una postura de apertura mental genuina para revisar y recalibrar tu apreciación inicial si el colaborador aporta evidencias o matices válidos.',
        ],
      },
      {
        min: 16,
        max: 20,
        title: 'Imparcialidad consistente con fisuras ocasionales',
        bullets: [
          'Lográs valorar la totalidad del periodo evaluado, aunque ante eventos recientes de alto impacto te cuesta no sesgar la mirada sin un esfuerzo consciente.',
          'Separás el rendimiento profesional de la simpatía personal como regla general, si bien la fluidez en la relación puede modificar involuntariamente tus apreciaciones.',
          'Controlás el efecto halo en la mayoría de los casos, aunque podés permitir que un atributo muy sobresaliente o deficiente matice en exceso áreas no relacionadas.',
          'Reconocés la existencia de prejuicios o sesgos propios, aunque no siempre lográs desactivarlos por completo antes de cerrar la nota definitiva.',
          'Escuchás con atención los argumentos del evaluado en la devolución, pero te cuesta ajustar la calificación a menos que el colaborador aporte evidencias muy contundentes.',
        ],
      },
      {
        min: 11,
        max: 15,
        title: 'Control de sesgos frágil y juicio vulnerable',
        bullets: [
          'Tendés a darle un peso mayor a lo acontecido en los últimos meses del año, lo que puede desdibujar la perspectiva de la continuidad global del periodo.',
          'Mezclás la calidad del trabajo con la relación interpersonal, permitiendo que la simpatía o la tensión relacional influyan sensiblemente en la calificación.',
          'Caés con frecuencia en el efecto halo, dejando que una única conducta o hecho crítico defina el juicio global sobre las competencias de la persona.',
          'Te cuesta revisar tus propios supuestos e ideas preconcebidas antes de evaluar, partiendo de la premisa de que tu primera impresión es la correcta.',
          'Tendés a mostrar rigidez frente a los aportes del colaborador durante la entrevista, defendiendo tu postura previa y limitando la incorporación de nuevos matices.',
        ],
      },
      {
        min: 5,
        max: 10,
        title: 'Sesgo predominante y subjetividad alta',
        bullets: [
          'Dejás que un incidente aislado o reciente condicione la calificación de todo el periodo, perdiendo de vista la perspectiva histórica del rendimiento anual.',
          'Fundamentás tu evaluación en la afinidad o distancia personal con el colaborador, perdiendo el foco en la entrega real de valor y los resultados del puesto.',
          'Incurris de manera marcada en el efecto halo, generalizando un juicio positivo o negativo a partir de una única fortaleza o debilidad puntual.',
          'Ignorás tus propios prejuicios y marcos de referencia, proyectando sesgos personales sobre la medición formal del desempeño.',
          'Operás con cerrazón frente al punto de vista del evaluado, clausurando el diálogo y cualquier posibilidad de rectificación durante la devolución.',
        ],
      },
    ],
  },
  {
    key: 'entrevista',
    name: 'Conducción de la Entrevista y Calidad del Feedback',
    questions: [
      {
        id: 11,
        text: 'Garantizo un espacio y un tiempo adecuados, sin interrupciones, para realizar la reunión de devolución con dedicación exclusiva.',
        textoTercera:
          'Garantiza un espacio y un tiempo adecuados, sin interrupciones, para realizar la reunión de devolución con dedicación exclusiva.',
      },
      {
        id: 12,
        text: 'Explicito al inicio de la reunión que el objetivo es el aprendizaje y el desarrollo mutuo, y no un espacio de juzgamiento o sanción.',
        textoTercera:
          'Explicita al inicio de la reunión que el objetivo es el aprendizaje y el desarrollo mutuo, y no un espacio de juzgamiento o sanción.',
      },
      {
        id: 13,
        text: 'Utilizo preguntas abiertas que invitan al colaborador a reflexionar sobre su propio desempeño antes de emitir mi postura.',
        textoTercera:
          'Utiliza preguntas abiertas que invitan al colaborador a reflexionar sobre su propio desempeño antes de emitir su postura.',
      },
      {
        id: 14,
        text: 'Comunico las oportunidades de mejora con asertividad y claridad, manteniendo el foco en las conductas y no en la persona.',
        textoTercera:
          'Comunica las oportunidades de mejora con asertividad y claridad, manteniendo el foco en las conductas y no en la persona.',
      },
      {
        id: 15,
        text: 'Mantengo la calma, la empatía y el control de la conversación ante posibles desacuerdos o reacciones defensivas.',
        textoTercera:
          'Mantiene la calma, la empatía y el control de la conversación ante posibles desacuerdos o reacciones defensivas.',
      },
    ],
    bands: [
      {
        min: 21,
        max: 25,
        title: 'Conducción excelente y comunicación de alto impacto',
        bullets: [
          'Le das a la reunión la jerarquía formal y el respeto que merece, resguardando un momento de dedicación exclusiva y libre de interrupciones.',
          'Instalás desde el inicio una lógica de aprendizaje y construcción mutua, eliminando cualquier sensación de juicio o sanción.',
          'Promovés la autoevaluación del colaborador mediante preguntas abiertas, logrando que reflexione sobre su gestión antes de dar tu mirada.',
          'Transmitís los focos de mejora con precisión técnica y asertividad, orientando el feedback estrictamente hacia conductas observables.',
          'Liderás los desacuerdos con madurez y empatía, transformando las tensiones en conversaciones productivas.',
        ],
      },
      {
        min: 16,
        max: 20,
        title: 'Conducción solvente con margen de fluidez',
        bullets: [
          'Reservás el tiempo necesario para conversar, aunque en la práctica la dedicación exclusiva se cumple de forma irregular.',
          'Aclarás el sentido constructivo de la charla al comenzar, si bien ante la falta de tiempo podrías acortar el encuadre e ir directo a la nota, resintiendo el resultado.',
          'Indagás la visión del colaborador durante el diálogo, aunque tu propia ansiedad a veces te tienta a adelantar conclusiones.',
          'Tu tendencia es señalar los puntos débiles con respeto, pero en ocasiones podés dudar o matizar en exceso al comunicar las críticas más exigentes.',
          'Aunque sostenés el buen trato en la charla, las respuestas defensivas te requieren un esfuerzo extra para no mostrar rigidez.',
        ],
      },
      {
        min: 11,
        max: 15,
        title: 'Conducción intuitiva y comunicación frágil',
        bullets: [
          'El descuido del entorno y momento de la devolución permite distracciones y reduce la confidencialidad que la reunión merece y requiere.',
          'La dificultad frecuente para destacar el aprendizaje y el desarrollo mutuo como prioridad favorece la activación de posturas defensivas en el evaluado, en menoscabo de mejores resultados.',
          'Corrés el riesgo de monopolizar la palabra, exponiendo tus puntos de vista y perdiendo la oportunidad de escuchar suficientemente la perspectiva del otro.',
          'Presentás las oportunidades de mejora con cierta ambigüedad o enfocándote en la persona, dificultando que comprenda qué conducta concreta debe ajustar.',
          'La incomodidad ante el disenso o el conflicto suele limitar la profundidad de la conversación, dificultando la superación de obstáculos.',
        ],
      },
      {
        min: 5,
        max: 10,
        title: 'Conducción deficiente y feedback punitivo',
        bullets: [
          'Abordar la reunión de manera apresurada o en un contexto inadecuado le resta seriedad y confidencialidad a una conversación clave.',
          'El encuadre de la conversación tiende a ser fiscalizador, lo que dificulta generar un clima de confianza y diálogo abierto.',
          'Negar o reducir el espacio de reflexión y escucha al colaborador sobre su balance de desempeño debilita la confianza y la sensación de integrar un verdadero equipo.',
          'La retroalimentación se expresa mediante juicios de valor sobre la persona, generando frustración y rechazo en el evaluado.',
          'Las objeciones o preguntas del evaluado suelen recibirse con molestia, lo que deteriora el clima de la reunión y cierra el diálogo.',
        ],
      },
    ],
  },
  {
    key: 'acuerdos',
    name: 'Co-creación de Acuerdos y Planes de Desarrollo – PDI',
    questions: [
      {
        id: 16,
        text: 'Transformo las oportunidades de mejora detectadas en objetivos de desarrollo concretos, medibles y viables.',
        textoTercera:
          'Transforma las oportunidades de mejora detectadas en objetivos de desarrollo concretos, medibles y viables.',
      },
      {
        id: 17,
        text: 'Construyo el Plan de Desarrollo Individual (PDI) en conjunto con el colaborador, promoviendo su compromiso activo.',
        textoTercera:
          'Construye el Plan de Desarrollo Individual (PDI) en conjunto con el colaborador, promoviendo su compromiso activo.',
      },
      {
        id: 18,
        text: 'Asumo compromisos explícitos de apoyo (recursos, formación, mentoría o desbloqueo de obstáculos) para acompañar el plan.',
        textoTercera:
          'Asume compromisos explícitos de apoyo (recursos, formación, mentoría o desbloqueo de obstáculos) para acompañar el plan.',
      },
      {
        id: 19,
        text: 'Establezco metas de aprendizaje desafiantes pero alcanzables, alineadas con el potencial de la persona y las necesidades del área.',
        textoTercera:
          'Establece metas de aprendizaje desafiantes pero alcanzables, alineadas con el potencial de la persona y las necesidades del área.',
      },
      {
        id: 20,
        text: 'Cierro la reunión con acuerdos por escrito claros, plazos definidos y el entendimiento compartido sobre los pasos a seguir.',
        textoTercera:
          'Cierra la reunión con acuerdos por escrito claros, plazos definidos y el entendimiento compartido sobre los pasos a seguir.',
      },
    ],
    bands: [
      {
        min: 21,
        max: 25,
        title: 'Co-construcción estratégica y desarrollo efectivo',
        bullets: [
          'Tu capacidad te permite conectar el margen de progreso del evaluado con la realidad de su rol a través de objetivos de desarrollo concretos, medibles y viables.',
          'Tu predisposición para co-diseñar el Plan de Desarrollo Individual (PDI), integrando las metas del colaborador, no solo fortalece su compromiso, sino que alinea su desarrollo con las prioridades estratégicas del área.',
          'Fortalecés la confianza del evaluado en tu gestión y en su capacidad de logro asumiendo compromisos explícitos de apoyo al plan a lo largo de todo el proceso.',
          'Garantizás un enfoque integral mediante la incorporación de experiencias prácticas en el puesto y retroalimentación continua, trascendiendo la simple capacitación formal.',
          'Reducis márgenes de conflicto a futuro mediante claridad y documentación de los compromisos asumidos.',
        ],
      },
      {
        min: 16,
        max: 20,
        title: 'Co-creación funcional con márgenes de mejora',
        bullets: [
          'Tu predisposición a definir acciones de desarrollo alineadas al rol es clara, aunque en ocasiones puede ceder a las urgencias operativas, o estas resultar genéricas o poco medibles.',
          'Involucrás al colaborador en la construcción del PDI, aunque, en ocasiones, el plan refleja más tu propia visión que una auténtica co-creación lo que descuida su compromiso activo.',
          'La imprecisión en los compromisos de apoyo y la escasez de opciones de desarrollo pueden limitar la efectividad del plan.',
          'Las metas de aprendizaje suelen armonizar con el potencial del evaluado, pero en ocasiones no logran equilibrar el desafío con la realidad operativa del área.',
          'Habitualmente cerrás la reunión con acuerdos y plazos, aunque el entendimiento compartido sobre los pasos a seguir podría ser más preciso y detallado.',
        ],
      },
      {
        min: 11,
        max: 15,
        title: 'Co-creación débil y PDI poco operativo',
        bullets: [
          'Tendés a traducir las oportunidades de mejora en objetivos vagos o poco medibles, lo que dificulta su seguimiento y evaluación.',
          'El PDI se define de forma predominantemente unilateral, con una participación limitada del colaborador, lo que reduce su compromiso y apropiación.',
          'Mencionar el apoyo al desarrollo de forma genérica, sin asumir compromisos claros de recursos, formación o mentoría, puede derivar en conflictos o frustraciones futuras para ambas partes.',
          'Las metas de aprendizaje poco realistas o desalineadas del potencial del colaborador y de la realidad del área -o directamente su ausencia- generan desinterés y derroche de recursos organizacionales.',
          'Dejás los acuerdos y plazos implícitos o poco claros, sin un entendimiento compartido sobre los pasos a seguir, lo que diluye los esquemas de acompañamiento y las alertas tempranas.',
        ],
      },
      {
        min: 5,
        max: 10,
        title: 'Ausencia de co-creación y plan nominal',
        bullets: [
          'Las oportunidades de mejora no se traducen en objetivos concretos, quedando como enunciados genéricos sin anclaje en la realidad del rol, lo que clausura opciones de desarrollo en el período siguiente.',
          'El PDI, si existe, es un documento formal impuesto, sin participación real del colaborador ni sentido de autoría.',
          'Tu reticencia a asumir compromisos explícitos de apoyo, de recursos o de acompañamiento deja el desarrollo librado a la iniciativa individual, lo que, implícitamente, equivale a renunciar al liderazgo.',
          'Las metas de aprendizaje son vagas o están desconectadas del potencial de la persona y las necesidades del área, desestimando una oportunidad de escalar de nivel para tu equipo.',
          'Cerrás la reunión con un PDI virtualmente inexistente o relegado a un trámite administrativo, transformando el desarrollo en acciones reactivas aisladas o incoherentes, con una relación costo-beneficio muy pobre.',
        ],
      },
    ],
  },
  {
    key: 'continuidad',
    name: 'Continuidad, Coaching y Seguimiento Anual',
    questions: [
      {
        id: 21,
        text: 'Sostengo espacios de coaching y seguimiento periódicos (1-a-1) durante el año para revisar objetivos y avances del PDI, y no solo al cierre anual.',
        textoTercera:
          'Sostiene espacios de coaching y seguimiento periódicos (1-a-1) durante el año para revisar objetivos y avances del PDI, y no solo al cierre anual.',
      },
      {
        id: 22,
        text: 'Proporciono retroalimentación oportuna en el momento en que ocurren los hechos, evitando acumular observaciones para la reunión formal.',
        textoTercera:
          'Proporciona retroalimentación oportuna en el momento en que ocurren los hechos, evitando acumular observaciones para la reunión formal.',
      },
      {
        id: 23,
        text: 'Ajusto los objetivos de desempeño y el PDI cuando las prioridades del área o las condiciones del contexto sufren cambios significativos',
        textoTercera:
          'Ajusta los objetivos de desempeño y el PDI cuando las prioridades del área o las condiciones del contexto sufren cambios significativos.',
      },
      {
        id: 24,
        text: 'Reconozco y visibilizo el esfuerzo y los avances intermedios del equipo a lo largo del periodo, sin esperar a la evaluación anual.',
        textoTercera:
          'Reconoce y visibiliza el esfuerzo y los avances intermedios del equipo a lo largo del periodo, sin esperar a la evaluación anual.',
      },
      {
        id: 25,
        text: 'Utilizo los resultados del proceso de evaluación para tomar decisiones estratégicas de desarrollo, rotación o reconocimiento en el área.',
        textoTercera:
          'Utiliza los resultados del proceso de evaluación para tomar decisiones estratégicas de desarrollo, rotación o reconocimiento en el área.',
      },
    ],
    bands: [
      {
        min: 21,
        max: 25,
        title: 'Acompañamiento sistemático y gestión activa del desempeño',
        bullets: [
          'Abordás el desarrollo con cercanía y compromiso genuino, manteniendo un ritmo de seguimiento y coaching periódico que transforma la gestión del desempeño en una conversación continua y no en un hito aislado.',
          'Retroalimentás en el momento en que suceden los hechos, garantizando que tus observaciones persigan cambios efectivos en las capacidades del colaborador y no solo el respaldo de la evaluación final.',
          'Sostenés la vigencia del plan mediante la recalibración ágil de metas o acuerdos del PDI ante cambios en las prioridades del área o en las condiciones del contexto.',
          'Reforzás la motivación, el sentido de logro y el compromiso durante el año, reconociendo y visibilizando el esfuerzo y los avances intermedios de tu equipo.',
          'Ponés en valor la información del seguimiento como un insumo estratégico para tomar decisiones fundadas sobre desarrollo, movilidad, asignación de proyectos y reconocimiento.',
        ],
      },
      {
        min: 16,
        max: 20,
        title: 'Acompañamiento consistente con margen de regularidad',
        bullets: [
          'Mantenés espacios de coaching y seguimiento periódicos (1-a-1) durante el año, aunque en algunos periodos la revisión de objetivos y avances del PDI pierde profundidad o continuidad.',
          'Brindás retroalimentación oportuna en la mayoría de los casos, aunque podés postergar algunas conversaciones por la alta carga laboral o la complejidad de la situación.',
          'Ajustás los objetivos de desempeño y el PDI ante cambios significativos, aunque en ocasiones la revisión llega tarde o de forma parcial.',
          'Valorás los logros intermedios del equipo, pero la práctica del reconocimiento tiende a ser discontinua o quedar sujeta a la disponibilidad de tiempo.',
          'Aplicás las conclusiones de la evaluación para tomar decisiones de área, aunque la articulación entre el diagnóstico del desempeño y los planes de carrera o reconocimiento aún puede profundizarse.',
        ],
      },
      {
        min: 11,
        max: 15,
        title: 'Seguimiento discontinuo y gestión reactiva',
        bullets: [
          'Sostenés espacios de coaching y seguimiento (1-a-1) de forma esporádica o concentrados en momentos de crisis, lo que reduce la probabilidad de que tu equipo cumpla sus objetivos y avance en el PDI del período.',
          'Acumulás la retroalimentación para la reunión formal, perdiendo la oportunidad de corregir o reforzar conductas en el momento oportuno y aumentando la defensividad del evaluado.',
          'Conservás objetivos o planes de desarrollo desactualizados —total o parcialmente— ante cambios de contexto, lo que puede llevarte a evaluar al colaborador sobre parámetros que perdieron vigencia operativa.',
          'Reconocer de forma esporádica el esfuerzo y los avances intermedios tiende a debilitar la motivación y el sentido de logro de tu equipo.',
          'Utilizás los resultados de la evaluación de forma limitada para decisiones de desarrollo, rotación o reconocimiento, lo que hace que el proceso se perciba como un control administrativo más que como un motor de crecimiento.',
        ],
      },
      {
        min: 5,
        max: 10,
        title: 'Ausencia de acompañamiento e ineficacia del proceso',
        bullets: [
          'Prescindís del seguimiento y coaching a lo largo del año, reduciendo la gestión del desempeño a un trámite puramente formal que se activa al cierre del ciclo. Esto convierte al proceso en una instancia improductiva y estresante para vos y tu equipo.',
          'Al omitir la retroalimentación continua durante el ciclo, privás al colaborador de la posibilidad de corregir desviaciones cuando aún eran gestionables y abordables sin percepción de sanción.',
          'Mantenés metas e indicadores fijos e inalterables a pesar de mutaciones evidentes en el rol o en la organización, deslegitimando la validez y utilidad de la medición.',
          'Omitís la retroalimentación positiva sobre los esfuerzos y logros intermedios del equipo, deteriorando el clima de trabajo y desmotivando la entrega de valor sostenida.',
          'Desconectás los resultados de la evaluación de las decisiones estratégicas de desarrollo, rotación o reconocimiento, desperdiciando la sinergia entre el proceso de seguimiento y la gestión activa del talento en tu área. Si mejorás tus prácticas de coaching y retroalimentación, podrás aprovechar esa sinergia',
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
    title: 'Evaluador Estratégico y Desarrollador de Talento',
    perfil: 'Atleta de élite',
    text: 'Liderazgo de Alto Impacto e Integridad Metodológica. Capital: Desplegás una gestión del desempeño rigurosa, cercana y basada en evidencias, convirtiendo la evaluación en un motor genuino de aceleración y compromiso para tu equipo. Riesgo: Dar por sentada la maestría alcanzada o flexibilizar el ritmo de acompañamiento frente a urgencias coyunturales del negocio. Foco de coaching: Profundizar la co-creación de planes de sucesión y potenciar el rol de los líderes emergentes de tu propia estructura.',
    closing: 'Consolidación de Maestría y Legado Directivo. Tu práctica como evaluador refleja un dominio metodológico y una madurez relacional. La prioridad en este nivel no es corregir desvíos, sino asegurar que tu criterio y rigor en la gestión de personas se transformen en un estándar para toda la organización. Tu foco de coaching consiste en elevar el estándar de tu entorno, modelar una cultura de feedback y utilizar el proceso de evaluación como una plataforma para desarrollar a los líderes del futuro.',
  },
  {
    level: 'medio',
    min: 80,
    max: 104,
    title: 'Evaluador Consolidado con Foco Operativo',
    perfil: 'Estado Físico Óptimo',
    text: 'Gestión Efectiva y Acompañamiento Regular. Capital: Contás con un criterio técnico y relacional sólido para conducir evaluaciones objetivas, generar feedback oportuno y sostener acuerdos claros de PDI. Riesgo: Que las fricciones de agenda o la carga de trabajo releguen la consistencia del seguimiento continuo a lo largo del año. Foco de coaching: Profundizar las conversaciones difíciles y la calibración sistemática de objetivos ante cambios de contexto.',
    closing: 'Optimización fina y consistencia en la gestión. Contás con bases sólidas para conducir evaluaciones objetivas, constructivas y alineadas con el negocio. El desafío en esta etapa es cerrar las brechas de consistencia que suelen aparecer ante picos de demanda operativa, asegurando que el seguimiento y el reconocimiento mantengan continuidad durante el año. Tu foco de coaching consiste en afinar las conversaciones difíciles y estructurar el PDI para que no dependa de la disponibilidad circunstancial.',
  },
  {
    level: 'bajo',
    min: 55,
    max: 79,
    title: 'Evaluador Intuitivo con Margen de Método',
    perfil: 'Estado Físico Medio',
    text: 'Gestión Discontinua y Cumplimiento Procesal. Capital: Reconocés la importancia de evaluar y desarrollar a tu gente, manteniendo una predisposición positiva durante las instancias formales de revisión. Riesgo: Caer en la concentración de observaciones al cierre del ciclo, la vaguedad en los indicadores del PDI o la falta de seguimiento constante. Foco de coaching: Incorporar herramientas de feedback oportuno, gestión de sesgos y metodologías concretas para la co-construcción de metas.',
    closing: 'Instalación de método y superación del formalismo. Reconocés el valor del desarrollo, pero tu práctica actual presenta discontinuidad, acumulación de observaciones y poca precisión en la co-creación de metas. Para consolidar tu liderazgo, necesitás pasar de una gestión del desempeño intuitiva a un método estructurado de acompañamiento. Tu foco de coaching consiste en incorporar herramientas de feedback oportuno, gestionar los sesgos y asegurar que la evaluación se convierta en un proceso vivo a lo largo del ciclo.',
  },
  {
    level: 'muyBajo',
    min: 25,
    max: 54,
    title: 'Evaluador Burocrático o Reactivo',
    perfil: 'En Acondicionamiento',
    text: 'Desconexión Procesal y Riesgo de Abandono del Rol. Capital de tu nivel: La identificación explicita de las brechas actuales constituye el punto de partida indispensable para reestructurar tu práctica directiva. Riesgo a vigilar: Percibir la evaluación de desempeño como una carga administrativa o un evento estresante, omitiendo el seguimiento y desmotivando al equipo. Foco de coaching: Construir rutinas básicas de liderazgo, desarrollo de hábitos de acompañamiento 1-a-1 y asunción de compromisos explícitos de apoyo.',
    closing: 'Reconstrucción del rol y asunción del acompañamiento. Tu diagnóstico muestra una desconexión crítica entre el rol de liderazgo y la práctica actual de evaluación, que quedó relegada a un trámite administrativo o a un evento estresante. Esta situación desgasta la confianza del equipo y debilita tu ejercicio del liderazgo. Tu foco de coaching inicial consiste en reencuadrar el proceso como una responsabilidad de conducción y construir rutinas elementales de interacción, registro y compromiso explícito con tu gente.',
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
    label: 'Estructura y Equilibrio: Busco perfeccionar la conversación de desarrollo, afianzar la autonomía del equipo y gestionar el talento con visión estratégica sostenida.',
  },
];

/**
 * Cierre que combina el norte elegido con el nivel alcanzado.
 * El cliente entregó los bloques ya rotulados "Norte A" y "Norte B".
 */
const CRUCES: Cruce[] = [
  {
    norteKey: 'aceleracion',
    level: 'alto',
    lectura: 'Maestría metodológica puesta al servicio de la aceleración',
    diagnostico: 'Tu orientación hacia una mayor responsabilidad directiva requiere convertir la solidez de tu práctica actual en capacidad de escala: delegar con criterio, ampliar la visibilidad de tu equipo y reservar tu intervención para las decisiones de mayor impacto. El desafío no es demostrar nuevamente tu competencia, sino hacer que los resultados del área crezcan sin depender de tu presencia constante.',
    primerPaso: 'Identificá a dos colaboradores con potencial de desarrollo en tu área y diseñá con ellos un plan de delegación y visibilidad a seis meses que acelere su preparación como sucesores.',
  },
  {
    norteKey: 'estructura',
    level: 'alto',
    lectura: 'Excelencia en la gestión de personas orientada a la autonomía y el legado.',
    diagnostico: 'Tu orientación está puesta en profundizar la calidad de las conversaciones y consolidar una práctica de desarrollo que otros puedan replicar. El próximo desafío es convertir tu experiencia en criterios compartidos, ayudando a que otros líderes sostengan conversaciones de PDI rigurosas, consistentes y útiles para la autonomía del equipo.',
    primerPaso: 'Institucionalizá espacios de calibración y coaching cruzado en tu área para asegurar que las conversaciones de PDI de tus mandos medios mantengan una profundidad y rigor similares a los tuyos.',
  },
  {
    norteKey: 'aceleracion',
    level: 'medio',
    lectura: 'Capacidad de gestión en expansión y necesidad de liberar capacidad directiva.',
    diagnostico: 'Tus aspiraciones de asumir mayor responsabilidad requieren que el desarrollo del equipo gane autonomía y no dependa de tu intervención constante. El desafío consiste en convertir la regularidad del seguimiento en una capacidad delegable, que sostenga el rendimiento mientras ampliás tu foco hacia decisiones de mayor alcance.',
    primerPaso: 'Agendá bloques fijos en tu calendario trimestral para las revisiones 1-a-1 del PDI y definí qué aspectos del seguimiento puede asumir progresivamente cada colaborador',
  },
  {
    norteKey: 'estructura',
    level: 'medio',
    lectura: 'Foco en la calidad del desarrollo con margen de precisión metodológica.',
    diagnostico: 'Tu orientación hacia el acompañamiento y el crecimiento del equipo puede ganar profundidad si traducís cada conversación de desarrollo en objetivos, apoyos y criterios de avance más explícitos. Esto permitirá fortalecer la autonomía del colaborador y sostener decisiones de desarrollo con mayor trazabilidad.',
    primerPaso: 'Revisá los PDI vigentes de tu equipo y asegurate de que cada objetivo cuente con un indicador de avance y una fecha concreta de revisión intermedia.',
  },
  {
    norteKey: 'aceleracion',
    level: 'bajo',
    lectura: 'Ambición de crecimiento condicionada por fisuras en el método de gestión.',
    diagnostico: 'Para asumir mayor responsabilidad, necesitás convertir tu práctica actual en evidencia consistente de criterio directivo. Las brechas en el PDI y en la retroalimentación oportuna pueden debilitar la confianza en tu capacidad para sostener resultados a través de otros, no solo mediante tu intervención directa.',
    primerPaso: 'Seleccioná a un colaborador de tu equipo y realizá este mes un ciclo completo de feedback oportuno y revisión del PDI, utilizando un registro sistemático de evidencias y acuerdos.',
  },
  {
    norteKey: 'estructura',
    level: 'bajo',
    lectura: 'Vocación por el desarrollo que requiere herramientas de ejecución práctica.',
    diagnostico: 'Tu orientación hacia conversaciones de desarrollo de mayor calidad necesita respaldarse en una disciplina procesal más constante. Sin seguimiento regular ni objetivos precisos, el compromiso y la autonomía del equipo se diluyen, aun cuando exista una intención genuina de acompañar.',
    primerPaso: 'Rediseñá la estructura de tus reuniones 1-a-1 para reservar un bloque específico a la revisión de compromisos del PDI y al destrabe de obstáculos del colaborador.',
  },
  {
    norteKey: 'aceleracion',
    level: 'muyBajo',
    lectura: 'Brecha crítica entre la aspiración de rol y la práctica cotidiana de gestión.',
    diagnostico: 'Tu intención de asumir mayores desafíos exige reconstruir primero la consistencia de tu gestión actual. Sin seguimiento, retroalimentación y compromisos básicos de desarrollo, se vuelve difícil demostrar que podés sostener resultados a través de otros y ampliar tu alcance directivo.',
    primerPaso: 'Establecé una reunión de alineación con cada integrante de tu equipo para clarificar los tres objetivos principales del período, acordar una regla básica de comunicación de avances y fijar una primera instancia de seguimiento.',
  },
  {
    norteKey: 'estructura',
    level: 'muyBajo',
    lectura: 'Intención de desarrollo humano que todavía no se traduce en una práctica sostenida.',
    diagnostico: 'No es posible construir autonomía ni conversaciones de valor sin seguimiento y retroalimentación continua. El punto de partida es asumir un compromiso activo de cercanía y apoyo, creando condiciones para que cada colaborador pueda abordar sus dificultades operativas sin quedar librado a su propia iniciativa.',
    primerPaso: 'Implementá durante este mes una rutina quincenal de escucha y acompañamiento situacional de 30 minutos con cada colaborador, enfocada en comprender sus dificultades operativas y acordar apoyos concretos.',
  },
];

const LECTURA_GENERAL: string[] = [
  'Este diagnóstico busca identificar tanto la robustez actual de tu liderazgo como sus principales palancas de crecimiento. El resultado no debe leerse como una etiqueta cerrada, sino como un mapa dinámico de fortalezas, vulnerabilidades y oportunidades de mejora.',
  'Es importante tener en cuenta que se trata de una autoevaluación: los resultados reflejan la visión que vos tenés de tu propia gestión, no una evaluación externa de 360°. Esto no resta valor al diagnóstico; por el contrario, lo convierte en un punto de partida honesto para trabajar sobre tu autopercepción, contrastarla con feedback concreto y ajustar tu estilo de liderazgo.',
  'La lectura por pilares permite distinguir entre zonas de fragilidad, áreas de consolidación y potencial de escalado, orientando el trabajo de coaching de manera precisa hacia donde tendrá mayor impacto.',
];

export const EVALUADOR: Assessment = {
  key: 'evaluador',
  title: 'Stress Test de Robustez y Crecimiento del Líder Evaluador',
  shortName: 'Stress Test del Evaluador',
  intro:
    '25 afirmaciones en 5 pilares. Respondé según cuánto coincidís con cada una (1 a 5). Al ' +
    'finalizar vas a recibir tu nivel como evaluador y una devolución por pilar. ' +
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
  nombrePublico: 'Autoevaluación del Evaluador',
  subtitulo: 'La práctica de quien conduce el proceso',
  orientadoA:
    'Orientada a líderes, gerentes y supervisores. Permite revisar cómo se evalúa, se ' +
    'brinda feedback y se acompaña el desarrollo del equipo.',
  explora: [
    'Claridad de criterios y uso de evidencias.',
    'Conciencia y gestión de sesgos.',
    'Calidad de la conversación de feedback.',
    'Co-creación del Plan Individual de Desarrollo.',
    'Seguimiento, coaching y reconocimiento.',
  ],
  aporta:
    'Una práctica directiva más consistente, cercana y orientada al desarrollo, para que la ' +
    'evaluación no se reduzca a un trámite.',
  grupo: 'gestion-desempeno',

  // Se publica con el sitio. Para esconderlo hay que desactivarlo en el panel.
  activo: true,

  // Igual que el del líder: habilitado, pero inactivo hasta que las
  // afirmaciones tengan su `textoTercera` (lo aporta el cliente).
  evaluacion360: true,
  dias360: 7,
  maxEvaluadores: 3,
};
