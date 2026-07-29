import { useEffect, useRef } from 'react';
import idleUrl from '../assets/hummingbird-cursor.png';
import hoverUrl from '../assets/hummingbird-cursor-hover.png';
import pressedUrl from '../assets/hummingbird-cursor-clic.png';

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

type Pose = 'idle' | 'interactive' | 'pressed';

const DISPLAY_WIDTH = 74;

const POSES: Record<Pose, { src: string; width: number; height: number; hotspotXRatio: number; hotspotYRatio: number }> = {
  idle: { src: idleUrl, width: 961, height: 688, hotspotXRatio: 0.0062, hotspotYRatio: 0.0603 },
  interactive: { src: hoverUrl, width: 1028, height: 760, hotspotXRatio: 0.0058, hotspotYRatio: 0.1836 },
  pressed: { src: pressedUrl, width: 1056, height: 615, hotspotXRatio: 0.0057, hotspotYRatio: 0.6260 }
};

const poseMetrics = (pose: Pose) => {
  const config = POSES[pose];
  const displayHeight = DISPLAY_WIDTH * (config.height / config.width);
  return {
    src: config.src,
    displayHeight,
    hotspotX: DISPLAY_WIDTH * config.hotspotXRatio,
    hotspotY: displayHeight * config.hotspotYRatio
  };
};

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastPointRef = useRef({ x: -200, y: -200 });
  const poseRef = useRef<Pose>('idle');
  const hotspotRef = useRef(poseMetrics('idle'));

  useEffect(() => {
    (['idle', 'interactive', 'pressed'] as Pose[]).forEach((pose) => {
      const image = new Image();
      image.src = POSES[pose].src;
    });
  }, []);

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
        const { hotspotX, hotspotY } = hotspotRef.current;
        cursor.style.transform = `translate3d(${x - hotspotX}px, ${y - hotspotY}px, 0)`;
      });
    };

    const applyPose = (pose: Pose) => {
      if (poseRef.current === pose) return;
      poseRef.current = pose;
      const metrics = poseMetrics(pose);
      hotspotRef.current = metrics;
      img.src = metrics.src;
      cursor.style.width = `${DISPLAY_WIDTH}px`;
      cursor.style.height = `${metrics.displayHeight}px`;
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
      setMode(event.target);
      renderAt(event.clientX, event.clientY);
    };

    const down = (event: PointerEvent) => {
      setMode(event.target, true);
      renderAt(event.clientX, event.clientY);
    };

    const up = (event: PointerEvent) => {
      const element = document.elementFromPoint(event.clientX, event.clientY);
      setMode(element);
      renderAt(event.clientX, event.clientY);
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
      style={{ width: DISPLAY_WIDTH, height: poseMetrics('idle').displayHeight }}
    >
      <img ref={imgRef} src={idleUrl} alt="" draggable={false} />
    </div>
  );
};

export default CustomCursor;
