import { useEffect, useRef } from 'react';
import hummingbirdCursorUrl from '../assets/hummingbird-cursor.png';

const INTERACTIVE_SELECTOR = [
  'button',
  'a',
  'input',
  'textarea',
  'select',
  'summary',
  '[role="button"]',
  '[data-cursor="interactive"]',
  '.leaflet-interactive',
  '.cursor-interactive'
].join(',');

// Dentro de esta zona (el visor de mapas) el colibrí se oculta: esa página
// dibuja su propia cruz de precisión pegada al mapa (ver MapasPage.tsx),
// necesario porque position:fixed no se ve de forma fiable en pantalla completa.
const CROSSHAIR_SELECTOR = '[data-cursor="crosshair"]';

// El archivo real mide 70 × 54 px y tiene 2 px transparentes de margen.
// Lo mostramos a menos de la mitad del tamaño que tenía el cursor original.
const DISPLAY_WIDTH = 34;
const DISPLAY_HEIGHT = (54 / 70) * DISPLAY_WIDTH;

// La punta del pico está en x=2, y=4 dentro del PNG (incluyendo el margen).
// Estas coordenadas hacen que el punto real del mouse coincida con el pico.
const HOTSPOT_X = (2 / 70) * DISPLAY_WIDTH;
const HOTSPOT_Y = (4 / 54) * DISPLAY_HEIGHT;

// La pose (escala/rotación) se aplica por JS directo al <img>, no por CSS
// condicionado a [data-mode], para que no dependa de la cascada de estilos.
const POSE_TRANSFORM: Record<'idle' | 'interactive' | 'pressed', string> = {
  idle: 'none',
  interactive: 'scale(1.1) rotate(-7deg)',
  pressed: 'scale(.86) rotate(9deg)'
};

const POSE_FILTER: Record<'idle' | 'interactive' | 'pressed', string> = {
  idle: 'drop-shadow(0 1px 2px rgba(2, 6, 23, .55))',
  interactive: 'drop-shadow(0 1px 2px rgba(2, 6, 23, .55)) drop-shadow(0 0 4px rgba(34, 211, 238, .35))',
  pressed: 'drop-shadow(0 1px 2px rgba(2, 6, 23, .55))'
};

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastPointRef = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    if (!finePointer.matches) return;

    const cursor = cursorRef.current;
    const img = imgRef.current;
    if (!cursor || !img) return;

    document.documentElement.classList.add('custom-cursor-enabled');

    const renderAt = (clientX: number, clientY: number) => {
      lastPointRef.current = { x: clientX, y: clientY };
      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const { x, y } = lastPointRef.current;
        cursor.style.transform = `translate3d(${x - HOTSPOT_X}px, ${y - HOTSPOT_Y}px, 0)`;
      });
    };

    const applyPose = (pose: 'idle' | 'interactive' | 'pressed') => {
      if (cursor.dataset.mode === pose) return;
      cursor.dataset.mode = pose;
      img.style.transform = POSE_TRANSFORM[pose];
      img.style.filter = POSE_FILTER[pose];
    };

    const setMode = (target: EventTarget | null, pressed = false) => {
      const element = target instanceof Element ? target : null;
      const overCrosshair = Boolean(element?.closest(CROSSHAIR_SELECTOR));
      cursor.dataset.visible = overCrosshair ? 'false' : 'true';

      if (pressed) {
        applyPose('pressed');
        return;
      }

      applyPose(element?.closest(INTERACTIVE_SELECTOR) ? 'interactive' : 'idle');
    };

    const move = (event: PointerEvent) => {
      renderAt(event.clientX, event.clientY);
      setMode(event.target);
    };

    const down = (event: PointerEvent) => {
      renderAt(event.clientX, event.clientY);
      setMode(event.target, true);
    };

    const up = (event: PointerEvent) => {
      renderAt(event.clientX, event.clientY);
      const element = document.elementFromPoint(event.clientX, event.clientY);
      setMode(element);
    };

    const hide = () => {
      cursor.dataset.visible = 'false';
      applyPose('idle');
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('blur', hide);
    document.documentElement.addEventListener('mouseleave', hide);
    document.addEventListener('visibilitychange', hide);

    return () => {
      document.documentElement.classList.remove('custom-cursor-enabled');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('blur', hide);
      document.documentElement.removeEventListener('mouseleave', hide);
      document.removeEventListener('visibilitychange', hide);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="custom-hummingbird-cursor"
      data-visible="false"
      data-mode="idle"
      style={{ width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT }}
    >
      <img ref={imgRef} src={hummingbirdCursorUrl} alt="" draggable={false} />
    </div>
  );
};

export default CustomCursor;
