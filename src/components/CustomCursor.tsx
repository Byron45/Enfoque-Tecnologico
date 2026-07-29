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

const CROSSHAIR_SELECTOR = '[data-cursor="crosshair"]';

// El archivo real mide 70 × 54 px y tiene 2 px transparentes de margen.
// Lo mostramos a menos de la mitad del tamaño que tenía el cursor original.
const DISPLAY_WIDTH = 34;
const DISPLAY_HEIGHT = (54 / 70) * DISPLAY_WIDTH;

// La punta del pico está en x=2, y=4 dentro del PNG (incluyendo el margen).
// Estas coordenadas hacen que el punto real del mouse coincida con el pico.
const HOTSPOT_X = (2 / 70) * DISPLAY_WIDTH;
const HOTSPOT_Y = (4 / 54) * DISPLAY_HEIGHT;

const CROSSHAIR_SIZE = 28;

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const crosshairRef = useRef<SVGSVGElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastPointRef = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    if (!finePointer.matches) return;

    const cursor = cursorRef.current;
    const crosshair = crosshairRef.current;
    if (!cursor || !crosshair) return;

    document.documentElement.classList.add('custom-cursor-enabled');

    const renderAt = (clientX: number, clientY: number) => {
      lastPointRef.current = { x: clientX, y: clientY };
      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const { x, y } = lastPointRef.current;
        cursor.style.transform = `translate3d(${x - HOTSPOT_X}px, ${y - HOTSPOT_Y}px, 0)`;
        crosshair.style.transform = `translate3d(${x - CROSSHAIR_SIZE / 2}px, ${y - CROSSHAIR_SIZE / 2}px, 0)`;
      });
    };

    const isCrosshairTarget = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      return Boolean(element?.closest(CROSSHAIR_SELECTOR));
    };

    const setMode = (target: EventTarget | null, pressed = false) => {
      const overCrosshair = isCrosshairTarget(target);
      crosshair.dataset.visible = overCrosshair ? 'true' : 'false';
      cursor.dataset.visible = overCrosshair ? 'false' : 'true';

      if (pressed) {
        cursor.dataset.mode = 'pressed';
        return;
      }

      const element = target instanceof Element ? target : null;
      cursor.dataset.mode = element?.closest(INTERACTIVE_SELECTOR) ? 'interactive' : 'idle';
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
      cursor.dataset.mode = 'idle';
      crosshair.dataset.visible = 'false';
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
    <>
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="custom-hummingbird-cursor"
        data-visible="false"
        data-mode="idle"
        style={{ width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT }}
      >
        <img src={hummingbirdCursorUrl} alt="" draggable={false} />
      </div>
      <svg
        ref={crosshairRef}
        aria-hidden="true"
        viewBox="0 0 28 28"
        className="custom-crosshair-cursor"
        data-visible="false"
        style={{ width: CROSSHAIR_SIZE, height: CROSSHAIR_SIZE }}
      >
        <line x1="14" y1="1" x2="14" y2="9" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="19" x2="14" y2="27" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="1" y1="14" x2="9" y2="14" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="19" y1="14" x2="27" y2="14" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="1" x2="14" y2="9" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="14" y1="19" x2="14" y2="27" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="1" y1="14" x2="9" y2="14" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="19" y1="14" x2="27" y2="14" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
        <circle cx="14" cy="14" r="2.75" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="14" cy="14" r="2.75" fill="none" stroke="#0f172a" strokeWidth="0.85" />
      </svg>
    </>
  );
};

export default CustomCursor;
