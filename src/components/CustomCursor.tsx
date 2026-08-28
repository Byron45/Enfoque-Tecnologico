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

const DISPLAY_WIDTH = 45;

const POSES: Record<Pose, { src: string; width: number; height: number; hotspotXRatio: number; hotspotYRatio: number }> = {
  idle: { src: idleUrl, width: 961, height: 688, hotspotXRatio: 0.0062, hotspotYRatio: 0.0603 },
  interactive: { src: hoverUrl, width: 1028, height: 760, hotspotXRatio: 0.0058, hotspotYRatio: 0.1836 },
  pressed: { src: pressedUrl, width: 1056, height: 615, hotspotXRatio: 0.0057, hotspotYRatio: 0.6260 }
};

const poseMetrics = (pose: Pose) => {
  const config = POSES[pose];
  const displayHeight = DISPLAY_WIDTH * (config.height / config.width);
  return {
    hotspotX: DISPLAY_WIDTH * config.hotspotXRatio,
    hotspotY: displayHeight * config.hotspotYRatio,
    displayHeight
  };
};

const METRICS_BY_POSE: Record<Pose, { hotspotX: number; hotspotY: number; displayHeight: number }> = {
  idle: poseMetrics('idle'),
  interactive: poseMetrics('interactive'),
  pressed: poseMetrics('pressed')
};

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    if (!finePointer.matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    document.documentElement.classList.add('custom-cursor-enabled');

    let isPressed = false;
    let currentPose: Pose = 'idle';
    let currentHotspot = METRICS_BY_POSE.idle;

    const setPose = (newPose: Pose) => {
      if (currentPose === newPose) return;
      currentPose = newPose;
      currentHotspot = METRICS_BY_POSE[newPose];
      cursor.dataset.pose = newPose;
    };

    const updatePosition = (clientX: number, clientY: number) => {
      cursor.style.transform = `translate3d(${clientX - currentHotspot.hotspotX}px, ${clientY - currentHotspot.hotspotY}px, 0)`;
      if (cursor.dataset.visible !== 'true') {
        cursor.dataset.visible = 'true';
      }
    };

    const checkHoverState = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      const overCrosshair = Boolean(element?.closest(CROSSHAIR_SELECTOR));
      if (overCrosshair) {
        cursor.dataset.visible = 'false';
        return;
      }
      cursor.dataset.visible = 'true';

      if (isPressed) {
        setPose('pressed');
        return;
      }

      const isInteractive = Boolean(element?.closest(INTERACTIVE_SELECTOR));
      setPose(isInteractive ? 'interactive' : 'idle');
    };

    const move = (event: PointerEvent) => {
      updatePosition(event.clientX, event.clientY);
    };

    const over = (event: PointerEvent) => {
      checkHoverState(event.target);
      updatePosition(event.clientX, event.clientY);
    };

    const out = (event: PointerEvent) => {
      const element = event.relatedTarget instanceof Element ? event.relatedTarget : null;
      checkHoverState(element);
    };

    const down = (event: PointerEvent) => {
      isPressed = true;
      setPose('pressed');
      updatePosition(event.clientX, event.clientY);
    };

    const up = (event: PointerEvent) => {
      isPressed = false;
      const element = document.elementFromPoint(event.clientX, event.clientY);
      checkHoverState(element);
      updatePosition(event.clientX, event.clientY);
    };

    const hide = () => {
      cursor.dataset.visible = 'false';
      setPose('idle');
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerout', out, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('blur', hide);
    document.documentElement.addEventListener('mouseleave', hide);
    document.addEventListener('visibilitychange', hide);

    return () => {
      document.documentElement.classList.remove('custom-cursor-enabled');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerout', out);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('blur', hide);
      document.documentElement.removeEventListener('mouseleave', hide);
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="custom-hummingbird-cursor"
      data-visible="false"
      data-pose="idle"
    >
      <img src={idleUrl} className="cursor-img cursor-img-idle" alt="" draggable={false} />
      <img src={hoverUrl} className="cursor-img cursor-img-interactive" alt="" draggable={false} />
      <img src={pressedUrl} className="cursor-img cursor-img-pressed" alt="" draggable={false} />
    </div>
  );
};

export default CustomCursor;
