import { useEffect, useRef } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export const scrollViewport = { once: true, amount: 0.18, margin: "0px 0px -48px" };

export const scrollReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

export const scrollStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } }
};

export const heroStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
};

export const heroReveal = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } }
};

export const tableRowReveal = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }
};

export function usePointerDepth({ maxTilt = 4, maxTranslate = 0 } = {}) {
  const elementRef = useRef(null);
  const boundsRef = useRef(null);
  const frameRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const enabledRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), { stiffness: 190, damping: 25, mass: 0.45 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 190, damping: 25, mass: 0.45 });
  const translateX = useSpring(useMotionValue(0), { stiffness: 170, damping: 26, mass: 0.5 });
  const translateY = useSpring(useMotionValue(0), { stiffness: 170, damping: 26, mass: 0.5 });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const pointerQuery = window.matchMedia("(pointer: fine) and (hover: hover)");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
      || connection?.saveData
      || ["slow-2g", "2g"].includes(connection?.effectiveType);

    const updateEnabled = () => { enabledRef.current = reducedMotion !== true && pointerQuery.matches && !lowPower; };
    const onMediaChange = () => updateEnabled();
    updateEnabled();
    if (pointerQuery.addEventListener) pointerQuery.addEventListener("change", onMediaChange);
    else pointerQuery.addListener?.(onMediaChange);

    return () => {
      enabledRef.current = false;
      if (pointerQuery.removeEventListener) pointerQuery.removeEventListener("change", onMediaChange);
      else pointerQuery.removeListener?.(onMediaChange);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [reducedMotion]);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  function applyTarget() {
    frameRef.current = null;
    const { x, y } = targetRef.current;
    rotateX.set(y * -maxTilt);
    rotateY.set(x * maxTilt);
    if (maxTranslate) {
      translateX.set(x * maxTranslate);
      translateY.set(y * maxTranslate);
    }
    if (elementRef.current) {
      elementRef.current.style.setProperty("--depth-pointer-x", `${(x + 0.5) * 100}%`);
      elementRef.current.style.setProperty("--depth-pointer-y", `${(y + 0.5) * 100}%`);
    }
  }

  function scheduleTarget(x, y) {
    targetRef.current = { x, y };
    if (!frameRef.current) frameRef.current = requestAnimationFrame(applyTarget);
  }

  function onPointerEnter(event) {
    if (!enabledRef.current || event.pointerType !== "mouse" || !elementRef.current) return;
    boundsRef.current = elementRef.current.getBoundingClientRect();
  }

  function onPointerMove(event) {
    if (!enabledRef.current || event.pointerType !== "mouse" || !elementRef.current) return;
    const bounds = boundsRef.current || elementRef.current.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
    scheduleTarget(x, y);
  }

  function onPointerLeave() {
    boundsRef.current = null;
    scheduleTarget(0, 0);
  }

  const style = { rotateX, rotateY, transformPerspective: 900 };
  if (maxTranslate) {
    style.x = translateX;
    style.y = translateY;
  }

  return { ref: elementRef, style, onPointerEnter, onPointerMove, onPointerLeave };
}
