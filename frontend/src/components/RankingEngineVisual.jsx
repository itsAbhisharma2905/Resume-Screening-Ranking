import { CheckCircle2, FileText, Sparkles, Target, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { scrollViewport } from "./motion.js";

export default function RankingEngineVisual() {
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const boundsRef = useRef(null);
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerEnabledRef = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const pointerQuery = window.matchMedia("(pointer: fine) and (hover: hover)");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
      || connection?.saveData
      || ["slow-2g", "2g"].includes(connection?.effectiveType);
    const updateEnabled = () => { pointerEnabledRef.current = reducedMotion !== true && pointerQuery.matches && !lowPower; };
    const onMediaChange = () => updateEnabled();
    updateEnabled();
    if (pointerQuery.addEventListener) pointerQuery.addEventListener("change", onMediaChange);
    else pointerQuery.addListener?.(onMediaChange);
    return () => {
      pointerEnabledRef.current = false;
      if (pointerQuery.removeEventListener) pointerQuery.removeEventListener("change", onMediaChange);
      else pointerQuery.removeListener?.(onMediaChange);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [reducedMotion]);

  function applyPointerTarget() {
    frameRef.current = null;
    if (!stageRef.current) return;
    const { x, y } = pointerTargetRef.current;
    stageRef.current.style.setProperty("--engine-rotate-x", `${y * -5}deg`);
    stageRef.current.style.setProperty("--engine-rotate-y", `${x * 5}deg`);
    stageRef.current.style.setProperty("--engine-shift-x", `${x * 10}px`);
    stageRef.current.style.setProperty("--engine-shift-y", `${y * 8}px`);
    stageRef.current.style.setProperty("--engine-core-shift-x", `${x * 5}px`);
    stageRef.current.style.setProperty("--engine-core-shift-y", `${y * 4}px`);
    stageRef.current.style.setProperty("--engine-pointer-x", `${(x + 0.5) * 100}%`);
    stageRef.current.style.setProperty("--engine-pointer-y", `${(y + 0.5) * 100}%`);
  }

  function schedulePointerTarget(x, y) {
    pointerTargetRef.current = { x, y };
    if (!frameRef.current) frameRef.current = requestAnimationFrame(applyPointerTarget);
  }

  function handlePointerMove(event) {
    if (!pointerEnabledRef.current || event.pointerType !== "mouse" || !stageRef.current) return;
    const bounds = boundsRef.current || stageRef.current.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
    schedulePointerTarget(x, y);
  }

  function handlePointerEnter(event) {
    if (!pointerEnabledRef.current || event.pointerType !== "mouse" || !stageRef.current) return;
    boundsRef.current = stageRef.current.getBoundingClientRect();
  }

  function resetPointer() {
    boundsRef.current = null;
    schedulePointerTarget(0, 0);
  }

  return (
    <motion.div className="ranking-engine-entrance" initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={scrollViewport} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}>
      <div
        ref={stageRef}
        className={`ranking-engine-stage ${reducedMotion ? "is-reduced" : ""}`}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
        aria-label="Interactive resume ranking engine visualization"
        role="img"
      >
      <div className="engine-light" />
      <div className="engine-grid" />
      <div className="engine-connections" aria-hidden="true">
        <span className="connection connection-one" />
        <span className="connection connection-two" />
        <span className="connection connection-three" />
        <span className="connection connection-four" />
      </div>

      <div className="engine-document document-back" aria-hidden="true">
        <div className="document-topline"><FileText size={13} /><span>resume_02.pdf</span><span className="document-status">84</span></div>
        <div className="document-lines"><i /><i /><i /><i /><i /></div>
        <div className="document-tags"><span /> <span /> <span /></div>
      </div>
      <div className="engine-document document-front" aria-hidden="true">
        <div className="document-topline"><FileText size={13} /><span>resume_01.pdf</span><span className="document-status strong">98</span></div>
        <div className="document-highlight"><span /> <span /> <span /></div>
        <div className="document-lines"><i /><i /><i /><i /><i /></div>
        <div className="document-tags"><span /> <span /> <span /></div>
      </div>

      <div className="engine-chip chip-python">Python</div>
      <div className="engine-chip chip-ml">Machine learning</div>
      <div className="engine-chip chip-fastapi">FastAPI</div>

      <div className="engine-core-wrap">
        <div className="engine-core-halo" />
        <div className="engine-score-ring"><span className="score-ring-progress" /><div className="engine-score"><strong>98%</strong><span>match score</span></div></div>
        <div className="engine-core-label"><Sparkles size={12} />Semantic fit</div>
      </div>

      <div className="engine-pill pill-match"><Sparkles size={14} /><span><strong>98% Match</strong><small>semantic fit</small></span></div>
      <div className="engine-pill pill-skill"><CheckCircle2 size={14} /><span><strong>Skill Fit</strong><small>9 of 10 skills</small></span></div>
      <div className="engine-pill pill-experience"><TrendingUp size={14} /><span><strong>Experience</strong><small>6+ years detected</small></span></div>
      <div className="engine-pill pill-top"><Target size={14} /><span><strong>Top Candidate</strong><small>ranked #1</small></span></div>
      </div>
    </motion.div>
  );
}
