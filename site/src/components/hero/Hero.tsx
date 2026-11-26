import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { cta, hero } from "@/content";
import { Button } from "@/components/ui/Button";
import { GridLines } from "@/components/ui/GridLines";
import { StageIndicator } from "./StageIndicator";
import { stageIndex } from "./sceneConfig";

// 3D-сцена грузится отдельным чанком, чтобы текст появлялся сразу
const HeroScene = lazy(() => import("./HeroScene"));

/**
 * Первый экран. Секция высотой ~280vh, внутри — «липкий» экран:
 * прокрутка внутри секции управляет 3D-сценой (4 состояния).
 * При prefers-reduced-motion секция не закрепляется и сразу показывает финальный кадр.
 */
export function Hero() {
  const reduced = useReducedMotion() ?? false;
  const track = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const finalProgress = useMotionValue(1);
  const progress = reduced ? finalProgress : scrollYProgress;

  const [stage, setStage] = useState(reduced ? 3 : 0);
  useMotionValueEvent(scrollYProgress, "change", (v) => !reduced && setStage(stageIndex(v)));

  // не рендерим WebGL, когда hero вне экрана
  const [active, setActive] = useState(true);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={track} id="top" className={reduced ? "relative" : "relative h-[280vh]"} aria-label="Катализ">
      <div className="sticky top-0 h-[100svh] min-h-[600px] overflow-hidden bg-mist">
        {/* 3D */}
        <div className="absolute inset-x-0 bottom-0 h-[50%] lg:inset-0 lg:h-full">
          <Suspense fallback={<div className="h-full w-full bg-mist" />}>
            <HeroScene progress={progress} active={active} reducedMotion={reduced} />
          </Suspense>
          {/* мягкий переход сцены в текстовую зону на мобильных */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-mist to-transparent lg:hidden" />
        </div>

        <GridLines className="pointer-events-none absolute inset-0" />

        {/* текст */}
        <div className="container relative flex h-full flex-col pt-24 lg:justify-center lg:pt-0">
          <div className="max-w-[560px]">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="label-mono mb-4 lg:mb-6"
            >
              {hero.eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[44px] font-medium leading-[1.02] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[88px] xl:text-[100px]"
            >
              {hero.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-5 font-mono text-xl tracking-[0.06em] text-brand lg:mt-8 lg:text-[26px]"
            >
              {hero.speed}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-4 max-w-[420px] text-[14px] leading-relaxed text-ink-soft sm:text-[15px] lg:mt-6"
            >
              {hero.lead}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-6 hidden flex-wrap gap-3 sm:flex lg:mt-8"
            >
              <Button href="#contact">{cta.primary}</Button>
              <Button href="#works" variant="ghost">
                {cta.secondary}
              </Button>
            </motion.div>
          </div>
        </div>

        <StageIndicator stage={stage} />
      </div>
    </section>
  );
}
