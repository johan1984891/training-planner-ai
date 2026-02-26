// ============================================================
//  trainingAI.ts — Motor de Inteligencia Artificial del Entrenador
//  Training Planner AI · Lógica separada de la capa de vista
//  Autor: Training Planner AI Team
// ============================================================

// ─────────────────────────────────────────────────────────────
// TIPOS Y CONTRATOS DE DATOS
// ─────────────────────────────────────────────────────────────

export type Position = "base" | "escolta" | "alero" | "ala-pivot" | "pivot";
export type Level = "principiante" | "intermedio" | "avanzado";

export interface PlayerProfile {
  nombre: string;
  edad: number;
  altura: number; // en cm
  posicion: Position;
  nivel: Level;
  fortalezas: string[]; // e.g. ["tiro", "velocidad"]
  debilidades: string[]; // e.g. ["defensa", "rebote"]
}

export interface Exercise {
  nombre: string;
  descripcion: string;
  series: number;
  repeticiones: string; // puede ser "3x10" o "20 min"
  intensidad: "baja" | "media" | "alta";
  categoria: "físico" | "técnico" | "táctico" | "mental";
  icono: string; // emoji representativo
}

export interface TrainingDay {
  dia: string;
  enfoque: string;
  ejercicios: Exercise[];
  duracionEstimada: number; // minutos
  descanso: boolean;
}

export interface WeeklyPlan {
  dias: TrainingDay[];
  objetivosSemana: string[];
  mensajeMotivacional: string;
  nivelIntensidadGeneral: number; // 1–10
}

export interface VideoFeedback {
  erroresDetectados: string[];
  puntosFuertes: string[];
  recomendaciones: string[];
  puntuacion: number; // 0–100
  mensaje: string;
}

export interface ProgressEntry {
  fecha: string;
  ejerciciosCompletados: number;
  notas: string;
  puntuacion: number;
}

// ─────────────────────────────────────────────────────────────
// BANCO DE EJERCICIOS POR CATEGORÍA
// Sistema de ponderación: cada ejercicio tiene un "peso" según posición y necesidad
// ─────────────────────────────────────────────────────────────

const EJERCICIOS_BANCO: Record<string, Exercise[]> = {
  manejo: [
    {
      nombre: "Dribble en 8",
      descripcion: "Conduce el balón en forma de ocho entre las piernas sin mirarlo.",
      series: 3, repeticiones: "30 seg", intensidad: "media",
      categoria: "técnico", icono: "🏀"
    },
    {
      nombre: "Crossover explosivo",
      descripcion: "Cambios de dirección rápidos con el balón a baja cadera.",
      series: 4, repeticiones: "10 reps", intensidad: "alta",
      categoria: "técnico", icono: "⚡"
    },
    {
      nombre: "Control con mano débil",
      descripcion: "Dribbling continuo solo con la mano no dominante.",
      series: 3, repeticiones: "45 seg", intensidad: "baja",
      categoria: "técnico", icono: "🤚"
    },
  ],
  tiro: [
    {
      nombre: "Tiro en forma de C",
      descripcion: "Desde 5 posiciones alrededor del aro, 2 tiros por posición.",
      series: 3, repeticiones: "10 tiros", intensidad: "media",
      categoria: "técnico", icono: "🎯"
    },
    {
      nombre: "Triple amenaza → Tiro",
      descripcion: "Parte de posición triple amenaza, finta y tira en salto.",
      series: 3, repeticiones: "8 reps", intensidad: "media",
      categoria: "técnico", icono: "🏹"
    },
    {
      nombre: "Tiro libre bajo presión",
      descripcion: "Hace sprints al otro extremo y regresa a tirar dos libres.",
      series: 5, repeticiones: "2 tiros libres", intensidad: "alta",
      categoria: "mental", icono: "💢"
    },
  ],
  defensa: [
    {
      nombre: "Slides defensivos",
      descripcion: "Desplazamientos laterales en posición defensiva por la zona.",
      series: 4, repeticiones: "20 m", intensidad: "alta",
      categoria: "físico", icono: "🛡️"
    },
    {
      nombre: "Cierre al tirador",
      descripcion: "Sale desde la zona y cierra la línea de tiro con mano en alto.",
      series: 3, repeticiones: "8 reps", intensidad: "media",
      categoria: "táctico", icono: "✋"
    },
  ],
  fisico: [
    {
      nombre: "Saltos al cajón",
      descripcion: "Salta a una plataforma elevada con dos piernas, baja controlado.",
      series: 4, repeticiones: "8 saltos", intensidad: "alta",
      categoria: "físico", icono: "📦"
    },
    {
      nombre: "Sprint + parada en seco",
      descripcion: "Sprint de 15 m, frena en 2 pasos y asume posición defensiva.",
      series: 6, repeticiones: "15 m", intensidad: "alta",
      categoria: "físico", icono: "🏃"
    },
    {
      nombre: "Core: tablón lateral",
      descripcion: "Posición de tablón lateral, mantén la cadera alineada.",
      series: 3, repeticiones: "30 seg", intensidad: "media",
      categoria: "físico", icono: "💪"
    },
  ],
  rebote: [
    {
      nombre: "Box-out drill",
      descripcion: "Bloquea al compañero (o poste) tras el tiro, captura el rebote.",
      series: 3, repeticiones: "10 reps", intensidad: "media",
      categoria: "técnico", icono: "🧲"
    },
    {
      nombre: "Tip-in continuo",
      descripcion: "Lanza el balón contra el tablero y capta el rebote en salto repetidamente.",
      series: 3, repeticiones: "60 seg", intensidad: "alta",
      categoria: "técnico", icono: "🔄"
    },
  ],
  pase: [
    {
      nombre: "Pase de pecho + recepción",
      descripcion: "Contra la pared: pase de pecho con dedos hacia arriba, captura firme.",
      series: 3, repeticiones: "20 pases", intensidad: "baja",
      categoria: "técnico", icono: "👐"
    },
    {
      nombre: "Pase de béisbol largo",
      descripcion: "Lanza el balón con precisión a máxima distancia posible.",
      series: 2, repeticiones: "10 pases", intensidad: "media",
      categoria: "técnico", icono: "⚾"
    },
  ],
  descanso: [
    {
      nombre: "Estiramiento + movilidad",
      descripcion: "Cadena posterior, cadera, hombros y muñecas. Movimientos suaves.",
      series: 1, repeticiones: "20 min", intensidad: "baja",
      categoria: "físico", icono: "🧘"
    },
    {
      nombre: "Visualización táctica",
      descripcion: "Estudia 10 min de jugadas en video y mentaliza tu rol en ellas.",
      series: 1, repeticiones: "15 min", intensidad: "baja",
      categoria: "mental", icono: "🧠"
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL — generateTrainingPlan()
// Genera un plan semanal personalizado mediante sistema de reglas ponderadas
// ─────────────────────────────────────────────────────────────

export function generateTrainingPlan(perfil: PlayerProfile): WeeklyPlan {
  // 1. Calcular intensidad base según nivel
  const intensidadBase = calcularIntensidad(perfil.nivel);

  // 2. Construir los 7 días con lógica basada en reglas
  const dias: TrainingDay[] = [
    buildDay("Lunes",    "Manejo y primer paso",   seleccionarEjercicios(perfil, ["manejo", "fisico"], intensidadBase)),
    buildDay("Martes",   "Tiro y mecánica",         seleccionarEjercicios(perfil, ["tiro", "pase"],    intensidadBase)),
    buildDay("Miércoles","Defensa y resistencia",   seleccionarEjercicios(perfil, ["defensa", "fisico"], intensidadBase)),
    buildDay("Jueves",   "Recuperación activa",     seleccionarEjercicios(perfil, ["descanso"],        "baja"), true),
    buildDay("Viernes",  "Técnica integral",        seleccionarEjercicios(perfil, ["tiro", "manejo", "rebote"], intensidadBase)),
    buildDay("Sábado",   "Potencia + lectura",      seleccionarEjercicios(perfil, ["fisico", "pase"],  intensidadBase)),
    buildDay("Domingo",  "Descanso y mente",        seleccionarEjercicios(perfil, ["descanso"],        "baja"), true),
  ];

  // 3. Generar objetivos específicos según debilidades del jugador
  const objetivos = generarObjetivos(perfil);

  // 4. Calcular intensidad general numérica para la UI
  const nivelNum = perfil.nivel === "principiante" ? 4 : perfil.nivel === "intermedio" ? 6 : 9;

  return {
    dias,
    objetivosSemana: objetivos,
    mensajeMotivacional: generarMensaje(perfil),
    nivelIntensidadGeneral: nivelNum,
  };
}

// ─────────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES DEL MOTOR AI
// ─────────────────────────────────────────────────────────────

/**
 * Calcula intensidad de entrenamiento según nivel del jugador.
 * Regla: principiante → baja, intermedio → media, avanzado → alta
 */
function calcularIntensidad(nivel: Level): "baja" | "media" | "alta" {
  const mapa: Record<Level, "baja" | "media" | "alta"> = {
    principiante: "baja",
    intermedio: "media",
    avanzado: "alta",
  };
  return mapa[nivel];
}

/**
 * Selecciona ejercicios del banco aplicando sistema de ponderación:
 * - Si la categoría cubre una debilidad del jugador → prioridad máxima
 * - Si la categoría cubre una fortaleza → incluir pero sin prioridad extra
 * - Filtra por intensidad compatible con el nivel
 */
function seleccionarEjercicios(
  perfil: PlayerProfile,
  categorias: string[],
  intensidadMax: "baja" | "media" | "alta"
): Exercise[] {
  const nivelNum = (i: string) => ({ baja: 1, media: 2, alta: 3 }[i] || 1);
  const maxNum = nivelNum(intensidadMax);

  const ejerciciosSeleccionados: Exercise[] = [];

  categorias.forEach((cat) => {
    const banco = EJERCICIOS_BANCO[cat] || [];
    // Filtrar por intensidad compatible
    const compatibles = banco.filter((e) => nivelNum(e.intensidad) <= maxNum + 1);

    // Ponderación: ¿el cat cubre una debilidad?
    const esPrioridad = perfil.debilidades.some((d) => cat.includes(d) || d.includes(cat));

    // Tomar 1–2 ejercicios (2 si es zona de debilidad)
    const cantidad = esPrioridad ? 2 : 1;
    ejerciciosSeleccionados.push(...compatibles.slice(0, cantidad));
  });

  return ejerciciosSeleccionados;
}

/**
 * Construye un objeto TrainingDay con metadatos calculados.
 */
function buildDay(
  dia: string,
  enfoque: string,
  ejercicios: Exercise[],
  esDescanso: boolean = false
): TrainingDay {
  // Estima duración: cada ejercicio ~8 min promedio
  const duracion = esDescanso ? 35 : Math.max(ejercicios.length * 8, 30);
  return { dia, enfoque, ejercicios, duracionEstimada: duracion, descanso: esDescanso };
}

/**
 * Genera objetivos de la semana basados en el perfil del jugador.
 * Sistema de reglas: una regla por debilidad detectada + objetivo de posición.
 */
function generarObjetivos(perfil: PlayerProfile): string[] {
  const objetivos: string[] = [];

  // Regla por debilidad
  const reglasDebilidades: Record<string, string> = {
    tiro: "Mejorar mecánica de tiro: codo en línea, muñeca suelta, punto de mira alto",
    defensa: "Consolidar posición defensiva: cadera baja, pies activos, manos arriba",
    manejo: "Dominar dribble con mano débil sin bajar la cabeza",
    fisico: "Aumentar explosividad: 3 sesiones de pliometría integradas",
    rebote: "Anticipar trayectoria: box-out antes de que el balón abandone la mano",
    pase: "Perfeccionar pases sin telegrafiar: cabeza arriba, lectura de cancha",
    velocidad: "Desarrollar primer paso explosivo desde posición triple amenaza",
  };

  perfil.debilidades.forEach((d) => {
    if (reglasDebilidades[d]) objetivos.push(reglasDebilidades[d]);
  });

  // Objetivo específico por posición
  const objetivosPosicion: Record<Position, string> = {
    base: "Mejorar visión de juego y toma de decisiones en pick & roll",
    escolta: "Dominar el pull-up jumper y el corte sin balón",
    alero: "Versatilidad ofensiva: tiro en suspensión y driving al aro",
    "ala-pivot": "Juego de espaldas al aro y bloqueos ofensivos",
    pivot: "Dominar el área: posición de poste, rebote y pick & roll/pop",
  };
  objetivos.push(objetivosPosicion[perfil.posicion]);

  // Objetivo de altura (si aplica)
  if (perfil.altura < 175) objetivos.push("Compensar con velocidad y lectura táctica superior");
  if (perfil.altura > 195) objetivos.push("Aprovechar ventaja física en rebote y tapones");

  return objetivos;
}

/**
 * Genera un mensaje motivacional personalizado según nivel y edad.
 */
function generarMensaje(perfil: PlayerProfile): string {
  const mensajesJoven = [
    `${perfil.nombre}, cada hora de entrenamiento es una inversión en tu futuro. ¡Trabaja hoy lo que otros descansaron!`,
    `La consistencia vence al talento. Tú estás aquí, eso ya te pone por delante, ${perfil.nombre}.`,
    `Nadie llegó al nivel que sueñas sin pasar por los días difíciles. Esto es uno de esos días. ¡Adelante!`,
  ];
  const mensajesIntermedios = [
    `${perfil.nombre}, tienes las bases. Ahora es tiempo de refinar los detalles que separan al bueno del grande.`,
    `El siguiente nivel no espera. Tus debilidades son oportunidades disfrazadas. ¡Atácalas!`,
  ];
  const mensajesAvanzados = [
    `${perfil.nombre}, eres el estándar. Los detalles que ignoran los demás son tu ventaja competitiva.`,
    `Excelencia es hábito. Hoy no es diferente: cien por cien, siempre.`,
  ];

  const pool =
    perfil.nivel === "principiante"
      ? mensajesJoven
      : perfil.nivel === "intermedio"
      ? mensajesIntermedios
      : mensajesAvanzados;

  return pool[Math.floor(Math.random() * pool.length)];
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN — generateVideoFeedback()
// Genera retroalimentación automática basada en errores marcados
// ─────────────────────────────────────────────────────────────

export function generateVideoFeedback(
  erroresDetectados: string[],
  perfil: PlayerProfile
): VideoFeedback {
  // Base de reglas de corrección: error detectado → recomendación específica
  const correcciones: Record<string, string> = {
    "codo afuera en tiro": "Mantén el codo alineado con la canasta. Practica frente al espejo antes de tirar con balón.",
    "no dobla rodillas": "Inicia cada movimiento con flexión de rodillas. Refuerza con sentadillas isométricas.",
    "cabeza abajo driblando": "Enfoca un punto en la pared a altura de ojos mientras practicas dribbling libre.",
    "mal pivote": "Practica el pivote sin balón: establece el pie pivote y gira 360°. 50 repeticiones diarias.",
    "no hace box-out": "Antes del tiro, ubica al rival y establece contacto de espalda. Es instinto, entrénalo.",
    "pase telegrafíado": "Practica dribble-pase sin telegrafiar mirando un punto fijo. Confunde al defensor.",
    "posición defensiva alta": "Cadera baja siempre. Si te duelen los cuádriceps, ¡estás en la postura correcta!",
    "falta de explosividad": "Integra 3 series de saltos en profundidad (drop jumps) cada sesión de piernas.",
  };

  const recomendaciones = erroresDetectados
    .map((e) => correcciones[e.toLowerCase()] || `Trabaja conscientemente en: "${e}" esta semana.`)
    .filter(Boolean);

  // Puntos fuertes inferidos (si no hay errores en un área, se elogia)
  const todasAreas = ["tiro", "defensa", "manejo", "físico", "rebote"];
  const areasConError = erroresDetectados.map((e) => e.toLowerCase());
  const puntosFuertes = todasAreas
    .filter((a) => !areasConError.some((ae) => ae.includes(a)))
    .map((a) => `Buena ejecución general en ${a}`);

  // Puntuación: 100 - (errores * peso)
  const pesoError = perfil.nivel === "avanzado" ? 15 : perfil.nivel === "intermedio" ? 12 : 8;
  const puntuacion = Math.max(0, 100 - erroresDetectados.length * pesoError);

  const mensaje =
    puntuacion >= 80
      ? "¡Excelente sesión! Tu técnica muestra una mejora sostenida."
      : puntuacion >= 60
      ? "Sesión sólida con áreas claras de mejora. Enfócate en las recomendaciones."
      : "Sesión con bastante margen de crecimiento. No te desanimes, cada error es un maestro.";

  return { erroresDetectados, puntosFuertes, recomendaciones, puntuacion, mensaje };
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN — generateAutoProfile()
// Infiere descripción del perfil del jugador a partir de sus datos
// ─────────────────────────────────────────────────────────────

export function generateAutoProfile(perfil: PlayerProfile): string {
  const posicionLabel: Record<Position, string> = {
    base: "Base (Punto Guard)",
    escolta: "Escolta (Shooting Guard)",
    alero: "Alero (Small Forward)",
    "ala-pivot": "Ala-Pívot (Power Forward)",
    pivot: "Pívot (Center)",
  };

  const rangos = {
    principiante: "0–1 años de experiencia",
    intermedio: "2–4 años de experiencia",
    avanzado: "5+ años de experiencia",
  };

  const imc = ((perfil.altura / 100) ** 2); // base para categorizar altura
  const alturaCategoria =
    perfil.altura < 170 ? "talla baja" : perfil.altura < 185 ? "talla media" : "talla alta";

  return `
${perfil.nombre} es un jugador de ${perfil.edad} años, ${perfil.altura} cm (${alturaCategoria}), 
que actúa como ${posicionLabel[perfil.posicion]} a nivel ${perfil.nivel} (${rangos[perfil.nivel]}).

Fortalezas identificadas: ${perfil.fortalezas.join(", ") || "por definir"}.
Áreas de mejora prioritarias: ${perfil.debilidades.join(", ") || "por definir"}.

Plan recomendado: El programa de esta semana tiene un enfoque especial en compensar las debilidades 
detectadas mientras mantiene y explota las fortalezas del jugador. La intensidad está calibrada para 
el nivel ${perfil.nivel}.
  `.trim();
}
