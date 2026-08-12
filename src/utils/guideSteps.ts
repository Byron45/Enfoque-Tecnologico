export type GuideStep = {
  title: string;
  text: string;
};

// Un set de pasos por pantalla. La key es el "guideId" que recibe <GuideAssistant>,
// y también el sufijo que se usa para recordar en localStorage si el niño ya la vio.
export const GUIDE_STEPS: Record<string, GuideStep[]> = {
  lobby: [
    {
      title: '¡Hola, futuro agente!',
      text: 'Soy tu guía y te voy a ayudar a preparar tu misión. Primero, escribe tu nombre aquí arriba.'
    },
    {
      title: 'Cuéntame tu edad',
      text: 'Toca el número que corresponde a tu edad.'
    },
    {
      title: 'Tu escuela',
      text: 'Toca "Tu escuela" y busca la tuya en la lista.'
    },
    {
      title: 'Elige tu personaje',
      text: 'Escoge si quieres jugar como niña o niño. ¡Ese será tu agente!'
    },
    {
      title: '¡A la aventura!',
      text: 'Cuando todo esté listo, presiona "Comenzar aventura" y nos vemos en el centro de mando.'
    }
  ],
  hub: [
    {
      title: '¡Bienvenido al centro de mando!',
      text: 'Aquí ves tu nivel y tu progreso como agente de prevención.'
    },
    {
      title: 'Elige tu misión',
      text: 'Tienes cinco misiones: Diagnóstico, Alerta Volcánica, Inundaciones, Sismos y Evacuación. Se desbloquean una por una, en orden.'
    },
    {
      title: 'Caja de herramientas',
      text: 'Aquí abajo puedes ver Videos, Mapas de amenazas y una guía rápida cuando la necesites.'
    },
    {
      title: '¡Éxito, agente!',
      text: 'Toca "Entrar a la misión" en la que esté desbloqueada para empezar.'
    }
  ],
  mapas: [
    {
      title: 'Explorador de amenazas',
      text: 'Aquí puedes ver mapas de riesgos de tu distrito: inundaciones, volcán, deslizamientos y más.'
    },
    {
      title: 'Elige un mapa',
      text: 'Toca una de las tarjetas de arriba para cambiar de mapa.'
    },
    {
      title: 'Explora y cambia colores',
      text: 'Mueve el mapa con el mouse o el dedo, acércate con los botones + y −, y prueba distintos colores en "Cambiar colores".'
    },
    {
      title: 'Descubre el riesgo',
      text: 'Pasa el dedo o el mouse sobre el mapa para ver el nivel de amenaza de cada zona.'
    }
  ],
  'mision-diagnostico': [
    {
      title: 'Diagnóstico inicial',
      text: '¡Hola, agente! Antes de salir a tus misiones, vamos a descubrir qué tanto sabes sobre Gestión de Riesgos: amenazas, vulnerabilidad, prevención y más.'
    },
    {
      title: 'Sin apuros',
      text: 'No necesitas prepararte, solo responde con lo que ya sabes. Si te equivocas, puedes volver a intentarlo sin perder tu avance.'
    },
    {
      title: 'Responde la evaluación',
      text: 'Toca "Iniciar evaluación" y responde las 10 preguntas para desbloquear tu primera misión. ¡Tú puedes!'
    }
  ],
  'mision-volcan': [
    {
      title: 'Alerta Volcánica',
      text: 'Esta misión te enseña a protegerte de la ceniza del volcán Tungurahua.'
    },
    {
      title: 'Lee los consejos',
      text: 'Revisa las tarjetas de la derecha: mascarilla, cuidado con los lentes y proteger el agua.'
    },
    {
      title: 'Responde la evaluación',
      text: 'Cuando estés listo, toca "Iniciar evaluación" y responde las preguntas para completar la misión.'
    }
  ],
  'mision-inundacion': [
    {
      title: 'Misión Inundaciones',
      text: 'Aprende qué hacer si el agua sube en tu casa o tu barrio.'
    },
    {
      title: 'Lee los consejos',
      text: 'Revisa las tarjetas con las recomendaciones antes de continuar.'
    },
    {
      title: 'Responde la evaluación',
      text: 'Toca "Iniciar evaluación" y responde las preguntas para completar la misión.'
    }
  ],
  'mision-sismo': [
    {
      title: 'Alerta Sísmica',
      text: 'Esta misión te enseña qué hacer antes, durante y después de un sismo.'
    },
    {
      title: 'Lee los consejos',
      text: 'Revisa las tarjetas de la derecha: agáchate y cúbrete, aléjate de ventanas y qué revisar después.'
    },
    {
      title: 'Responde la evaluación',
      text: 'Cuando estés listo, toca "Iniciar evaluación" y responde las preguntas para completar la misión.'
    }
  ],
  'mision-evacuacion': [
    {
      title: 'Misión Evacuación',
      text: 'Practica cómo salir con calma y llegar a un punto seguro.'
    },
    {
      title: 'Lee los consejos',
      text: 'Revisa las tarjetas con los pasos para evacuar de forma segura.'
    },
    {
      title: 'Responde la evaluación',
      text: 'Toca "Iniciar evaluación" y responde las preguntas para completar la misión.'
    }
  ],
  videos: [
    {
      title: 'Videos educativos',
      text: 'Aquí puedes ver una cápsula corta que te ayuda a entender mejor cada tema.'
    },
    {
      title: 'Antes o después de la misión',
      text: 'Puedes verlo antes del quiz para repasar, o después para reforzar lo aprendido.'
    }
  ]
};
