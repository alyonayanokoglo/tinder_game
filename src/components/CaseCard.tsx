import { motion, useMotionValue, useTransform, useAnimate, type DragControls } from 'framer-motion';
import { useEffect } from 'react';
import type { CaseItem } from '../types';

interface Props {
  item: CaseItem;
  index: number;
  onSwipe: (direction: 'left' | 'right') => void;
  isBack?: boolean; // if true, show back-side without text
  dragControls?: DragControls; // external drag start controller
  swipeDirection?: 'left' | 'right' | null;
}

export function CaseCard({ item, index, onSwipe, isBack = false, dragControls, swipeDirection }: Props) {
  const rotation = (index % 2 === 0 ? 1 : -1) * Math.min(index * 1.25, 5);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const tilt = useTransform(x, [-300, 0, 300], [-8, 0, 8]);
  const leftOpacity = useTransform(x, [0, -120], [0, 1]);
  const rightOpacity = useTransform(x, [0, 120], [0, 1]);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (swipeDirection && !isBack) {
      const targetX = swipeDirection === 'right' ? 1000 : -1000;
      animate(scope.current, { x: targetX, opacity: 0 }, { duration: 0.3, ease: 'easeOut' });
    }
  }, [swipeDirection, isBack, animate, scope]);

  return (
    <motion.div
      ref={scope}
      className="card"
      style={{ zIndex: 100 - index, x, y, rotate: isBack ? rotation : tilt }}
      initial={{ scale: 0.95, y: 10, rotate: rotation }}
      animate={isBack ? { scale: 1, y: 0, opacity: 1, rotate: rotation } : { scale: 1, y: 0, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      whileHover={isBack ? undefined : { scale: 1.02, transition: { duration: 0.2 } }}
      whileDrag={isBack ? undefined : { scale: 1.04, transition: { duration: 0.2 } }}
      drag={isBack ? false : true}
      dragControls={dragControls}
      dragListener={!isBack}
      dragElastic={0.4}
      dragMomentum={false}
      dragTransition={{ bounceStiffness: 100, bounceDamping: 20 }}
      onDragEnd={(_, info) => {
        if (isBack) return;
        const vx = info.velocity.x;
        const vy = info.velocity.y;
        const ox = info.offset.x;
        const oy = info.offset.y;
        const threshold = 100;
        const velocityThreshold = 500;
        // Prefer the axis with a larger absolute movement
        if (Math.abs(ox) >= Math.abs(oy)) {
          if (ox > threshold || vx > velocityThreshold) onSwipe('right');
          else if (ox < -threshold || vx < -velocityThreshold) onSwipe('left');
        } else {
          // Vertical swipe: up = right (Было), down = left (Не было)
          if (oy < -threshold || vy < -velocityThreshold) onSwipe('right');
          else if (oy > threshold || vy > velocityThreshold) onSwipe('left');
        }
      }}
    >
      {isBack ? (
        <div className="card-back" aria-hidden />
      ) : (
        <div className="card-inner">
          <div className="card-labels">
            <motion.span className="label left" style={{ opacity: leftOpacity }}>Не было</motion.span>
            <motion.span className="label right" style={{ opacity: rightOpacity }}>Было</motion.span>
          </div>
          <p className="prompt">{item.prompt}</p>
          <div className="hint">Свайп вправо — Было, влево — Не было.</div>
        </div>
      )}
    </motion.div>
  );
}


