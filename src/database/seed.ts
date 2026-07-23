import { AppDataSource } from './data-source';
import { Role } from '../assessment/entities/role.entity';
import { Category } from '../assessment/entities/category.entity';
import { Question } from '../assessment/entities/question.entity';
import { Option } from '../assessment/entities/option.entity';
import { OptionScore } from '../assessment/entities/option-score.entity';

/**
 * Carga inicial de datos (ver cotización: 3 categorías + 20 preguntas).
 *
 * El contenido es EJEMPLO editable: las situaciones, opciones y puntajes
 * están pensados para que VAIU los reemplace/ajuste desde la base de datos
 * sin tocar código. Cada opción está "alineada" a un rol (nivel 1..5) y su
 * puntaje para cada rol declarado se deriva de la cercanía entre ambos niveles.
 *
 * Ejecutar:  npm run build && npm run seed
 * Recargar contenido:  SEED_FORCE=true npm run seed
 */

const ROLES: { key: string; name: string; level: number }[] = [
  { key: 'empleado', name: 'Empleado', level: 1 },
  { key: 'supervisor', name: 'Supervisor', level: 2 },
  { key: 'jefe', name: 'Jefe', level: 3 },
  { key: 'gerente', name: 'Gerente', level: 4 },
  { key: 'director', name: 'Director', level: 5 },
];

/** Puntaje de una opción (alineada a `optLevel`) para un rol declarado `roleLevel`. */
const MAX_POINTS = 10;
const STEP = 2.5;
function scoreFor(optLevel: number, roleLevel: number): number {
  return Math.max(0, MAX_POINTS - Math.abs(optLevel - roleLevel) * STEP);
}

/**
 * Cada pregunta trae 5 opciones ORDENADAS por nivel de rol (índice 0 = Empleado …
 * índice 4 = Director). La opción i queda alineada al rol de nivel i+1.
 */
interface SeedQuestion {
  situation: string;
  options: [string, string, string, string, string];
}
interface SeedCategory {
  name: string;
  description: string;
  questions: SeedQuestion[];
}

const CONTENT: SeedCategory[] = [
  {
    name: 'Liderazgo y toma de decisiones',
    description:
      'Cómo encarás decisiones, delegación y responsabilidad ante problemas.',
    questions: [
      {
        situation:
          'Surge un problema urgente que afecta a tu área y nadie te dio indicaciones.',
        options: [
          'Espero instrucciones de un superior antes de actuar.',
          'Reviso el procedimiento y resuelvo lo que está a mi alcance.',
          'Organizo al equipo para contener el problema y luego informo.',
          'Decido un plan de acción y asigno responsables de inmediato.',
          'Evalúo el impacto en el negocio y defino la estrategia de respuesta.',
        ],
      },
      {
        situation: 'Hay que tomar una decisión con información incompleta.',
        options: [
          'Prefiero no decidir hasta tener todos los datos.',
          'Consulto a alguien con más experiencia y sigo su criterio.',
          'Decido con lo disponible y monitoreo de cerca el resultado.',
          'Asumo el riesgo, decido y me hago responsable del resultado.',
          'Priorizo según los objetivos estratégicos y comunico la dirección.',
        ],
      },
      {
        situation: 'Un miembro del equipo comete un error importante.',
        options: [
          'Lo reporto a mi superior para que él lo resuelva.',
          'Le ayudo a corregirlo puntualmente.',
          'Reviso con la persona qué falló y ajusto el proceso.',
          'Analizo la causa raíz y redefino cómo trabaja el equipo.',
          'Reviso si el error revela un problema sistémico de la organización.',
        ],
      },
      {
        situation: 'Se presenta una oportunidad que requiere asumir un riesgo.',
        options: [
          'Evito el riesgo, prefiero lo seguro.',
          'La consulto con mi jefe antes de avanzar.',
          'Evalúo pros y contras con el equipo y decido.',
          'Impulso la iniciativa asignando recursos.',
          'La evalúo en función de la visión de largo plazo.',
        ],
      },
      {
        situation:
          'Detectás que una norma interna quedó desactualizada y complica el trabajo.',
        options: [
          'La sigo igual, no me corresponde cuestionarla.',
          'Le comento la molestia a un compañero.',
          'Propongo formalmente una revisión de la norma.',
          'Reúno evidencia y promuevo el cambio con los responsables.',
          'Reviso el marco de políticas para evitar casos similares.',
        ],
      },
      {
        situation: 'Tu equipo está desmotivado y baja el rendimiento.',
        options: [
          'Me concentro en mi trabajo y no me involucro.',
          'Trato de dar ánimo a los más cercanos.',
          'Hablo con el equipo para entender qué pasa.',
          'Diseño acciones concretas para recuperar la motivación.',
          'Reviso si hay causas estructurales de clima o incentivos.',
        ],
      },
      {
        situation:
          'Te ofrecen liderar una iniciativa nueva fuera de tu zona de confort.',
        options: [
          'La rechazo, prefiero seguir con lo conocido.',
          'La acepto si alguien me guía paso a paso.',
          'La acepto y armo un plan para aprender sobre la marcha.',
          'La acepto y convoco al equipo necesario para llevarla adelante.',
          'La acepto y la enmarco dentro de los objetivos estratégicos.',
        ],
      },
    ],
  },
  {
    name: 'Comunicación y trabajo en equipo',
    description:
      'Cómo te comunicás, colaborás y gestionás relaciones dentro del equipo.',
    questions: [
      {
        situation: 'Hay un conflicto entre dos compañeros de tu equipo.',
        options: [
          'Me mantengo al margen, no es asunto mío.',
          'Escucho a ambos y trato de calmar la situación.',
          'Medio entre las partes para encontrar un acuerdo.',
          'Intervengo, defino reglas de convivencia y hago seguimiento.',
          'Reviso si el conflicto responde a un problema de cultura o estructura.',
        ],
      },
      {
        situation: 'Necesitás comunicar un cambio importante.',
        options: [
          'Espero que alguien más lo comunique.',
          'Se lo cuento a los que trabajan cerca mío.',
          'Reúno al equipo y explico el cambio y sus motivos.',
          'Preparo un plan de comunicación por niveles.',
          'Alineo el mensaje con la estrategia y lo bajo a toda la organización.',
        ],
      },
      {
        situation: 'Un proyecto requiere coordinar con otras áreas.',
        options: [
          'Hago mi parte y espero que las otras áreas hagan la suya.',
          'Me contacto con quien conozco en la otra área.',
          'Coordino reuniones para alinear al equipo con las otras áreas.',
          'Defino responsables e hitos entre áreas y superviso.',
          'Establezco los acuerdos de colaboración a nivel gerencial.',
        ],
      },
      {
        situation: 'Recibís una crítica sobre tu trabajo.',
        options: [
          'Me cuesta aceptarla y me pongo a la defensiva.',
          'La escucho y corrijo lo señalado.',
          'La tomo, la analizo y busco mejorar el proceso.',
          'La uso para revisar cómo trabaja el equipo.',
          'La integro a una revisión más amplia de resultados.',
        ],
      },
      {
        situation: 'Un compañero nuevo necesita ayuda para integrarse.',
        options: [
          'Asumo que ya alguien se encargará de él.',
          'Le respondo dudas puntuales cuando me pregunta.',
          'Me ofrezco a acompañarlo en sus primeras semanas.',
          'Armo un plan de onboarding para el equipo.',
          'Reviso cómo integra la organización a los nuevos ingresos.',
        ],
      },
      {
        situation:
          'Tenés que dar una devolución difícil a alguien de tu entorno laboral.',
        options: [
          'La evito, prefiero no generar incomodidad.',
          'La comento de forma indirecta.',
          'La doy en privado, con ejemplos concretos.',
          'La doy y acuerdo un plan de mejora con seguimiento.',
          'La enmarco dentro de la gestión del desempeño del área.',
        ],
      },
      {
        situation: 'La información importante no está llegando a todos.',
        options: [
          'Me ocupo solo de estar informado yo.',
          'Reenvío lo que recibo a quien tengo cerca.',
          'Establezco un canal para que el equipo esté al día.',
          'Defino qué se comunica, a quién y con qué frecuencia.',
          'Diseño el flujo de información entre áreas.',
        ],
      },
    ],
  },
  {
    name: 'Gestión y orientación a resultados',
    description:
      'Cómo planificás, priorizás y llevás el trabajo hacia los objetivos.',
    questions: [
      {
        situation: 'Tenés varias tareas y no llegás con los plazos.',
        options: [
          'Hago las tareas en el orden en que llegaron.',
          'Le pregunto a mi jefe qué priorizar.',
          'Priorizo según impacto y reasigno lo que puedo.',
          'Reorganizo la carga del equipo según los objetivos.',
          'Renegocio alcance y plazos con las partes interesadas.',
        ],
      },
      {
        situation: 'Un objetivo del área no se está cumpliendo.',
        options: [
          'Cumplo mi parte y asumo que otros verán el resto.',
          'Aviso a mi superior que no se está cumpliendo.',
          'Identifico qué falla y propongo ajustes.',
          'Redefino el plan y realoco recursos del equipo.',
          'Reviso si el objetivo sigue alineado a la estrategia.',
        ],
      },
      {
        situation: 'Te piden mejorar la eficiencia de un proceso.',
        options: [
          'Sigo haciendo el proceso como siempre.',
          'Propongo pequeñas mejoras en mi tarea.',
          'Analizo el proceso completo y sugiero cambios.',
          'Rediseño el proceso e implemento con el equipo.',
          'Evalúo el impacto del proceso en los resultados del negocio.',
        ],
      },
      {
        situation: 'Debés planificar el trabajo del próximo trimestre.',
        options: [
          'Espero que me asignen las tareas.',
          'Planifico mis propias tareas.',
          'Planifico las tareas de mi equipo cercano.',
          'Defino objetivos y metas para toda el área.',
          'Fijo prioridades alineadas con la estrategia de la empresa.',
        ],
      },
      {
        situation: 'Un indicador clave empeora de un mes a otro.',
        options: [
          'Sigo con mi tarea, no me corresponde analizarlo.',
          'Aviso a mi jefe del número.',
          'Investigo las causas y propongo acciones.',
          'Ajusto el plan del área para revertirlo.',
          'Evalúo su impacto en los resultados del negocio y actúo.',
        ],
      },
      {
        situation: 'Hay que decidir dónde invertir un presupuesto limitado.',
        options: [
          'Que lo decida quien corresponda.',
          'Sugiero en qué gastar dentro de mi tarea.',
          'Priorizo el gasto según las necesidades del equipo.',
          'Asigno el presupuesto según los objetivos del área.',
          'Distribuyo la inversión según el retorno estratégico.',
        ],
      },
    ],
  },
];

async function seed() {
  await AppDataSource.initialize();
  const force = process.env.SEED_FORCE === 'true';

  // --- Roles (upsert por key) ---
  const roleRepo = AppDataSource.getRepository(Role);
  for (const r of ROLES) {
    const existing = await roleRepo.findOne({ where: { key: r.key } });
    if (existing) {
      existing.name = r.name;
      existing.level = r.level;
      existing.isActive = true;
      await roleRepo.save(existing);
    } else {
      await roleRepo.save(roleRepo.create({ ...r, isActive: true }));
    }
  }
  const roles = await roleRepo.find({ order: { level: 'ASC' } });
  const roleByLevel = new Map(roles.map((r) => [r.level, r]));
  console.log(`Roles listos: ${roles.map((r) => r.name).join(', ')}`);

  // --- Contenido ---
  const categoryRepo = AppDataSource.getRepository(Category);
  const existingCategories = await categoryRepo.count();
  if (existingCategories > 0 && !force) {
    console.log(
      `Ya existen ${existingCategories} categorías. Se omite el contenido. ` +
        `Usá SEED_FORCE=true para recargarlo.`,
    );
    await AppDataSource.destroy();
    return;
  }

  if (force) {
    // Borra solo contenido (respeta participantes/intentos ya guardados
    // fallará si hay answers apuntando a options; en dev conviene DB limpia).
    await AppDataSource.getRepository(OptionScore).delete({});
    await AppDataSource.getRepository(Option).delete({});
    await AppDataSource.getRepository(Question).delete({});
    await categoryRepo.delete({});
    console.log('Contenido anterior eliminado (SEED_FORCE).');
  }

  const questionRepo = AppDataSource.getRepository(Question);
  const optionRepo = AppDataSource.getRepository(Option);
  const scoreRepo = AppDataSource.getRepository(OptionScore);

  let totalQuestions = 0;
  for (let ci = 0; ci < CONTENT.length; ci++) {
    const c = CONTENT[ci];
    const category = await categoryRepo.save(
      categoryRepo.create({
        name: c.name,
        description: c.description,
        sortOrder: ci,
        isActive: true,
      }),
    );

    for (let qi = 0; qi < c.questions.length; qi++) {
      const q = c.questions[qi];
      const question = await questionRepo.save(
        questionRepo.create({
          categoryId: category.id,
          situation: q.situation,
          sortOrder: qi,
          isActive: true,
        }),
      );

      for (let oi = 0; oi < q.options.length; oi++) {
        const alignedLevel = oi + 1; // opción 0 → nivel 1 (Empleado) … 4 → 5
        const alignedRole = roleByLevel.get(alignedLevel)!;
        const option = await optionRepo.save(
          optionRepo.create({
            questionId: question.id,
            text: q.options[oi],
            alignedRoleId: alignedRole.id,
            sortOrder: oi,
          }),
        );

        // Matriz de puntajes: un puntaje por cada rol declarado.
        for (const role of roles) {
          await scoreRepo.save(
            scoreRepo.create({
              optionId: option.id,
              roleId: role.id,
              score: scoreFor(alignedLevel, role.level),
            }),
          );
        }
      }
      totalQuestions++;
    }
  }

  console.log(
    `Contenido cargado: ${CONTENT.length} categorías, ${totalQuestions} preguntas.`,
  );
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Error en el seed:', err);
  process.exit(1);
});
