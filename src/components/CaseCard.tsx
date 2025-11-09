import { motion, useMotionValue, useTransform, type DragControls } from 'framer-motion';
import type { CaseItem } from '../types';

interface Props {
  item: CaseItem;
  index: number;
  onSwipe: (direction: 'left' | 'right') => void;
  isBack?: boolean; // if true, show back-side without text
  dragControls?: DragControls; // external drag start controller
}

export function CaseCard({ item, index, onSwipe, isBack = false, dragControls }: Props) {
  const rotation = (index % 2 === 0 ? 1 : -1) * Math.min(index * 1.25, 5);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const tilt = useTransform(x, [-300, 0, 300], [-12, 0, 12]);
  const leftOpacity = useTransform(x, [0, -120], [0, 1]);
  const rightOpacity = useTransform(x, [0, 120], [0, 1]);

  return (
    <motion.div
      className="card"
      style={{ zIndex: 100 - index, x, y, rotate: tilt }}
      initial={{ scale: 0.95, y: 10, rotate: rotation }}
      animate={{ scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={isBack ? undefined : { scale: 1.02 }}
      whileDrag={isBack ? undefined : { scale: 1.04 }}
      drag={isBack ? false : true}
      dragControls={dragControls}
      dragListener={!isBack}
      dragElastic={0.2}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        if (isBack) return;
        const vx = info.velocity.x;
        const vy = info.velocity.y;
        const ox = info.offset.x;
        const oy = info.offset.y;
        const threshold = 120;
        // Prefer the axis with a larger absolute movement
        if (Math.abs(ox) >= Math.abs(oy)) {
          if (ox > threshold || vx > 800) onSwipe('right');
          else if (ox < -threshold || vx < -800) onSwipe('left');
        } else {
          // Vertical swipe: up = right (Было), down = left (Не было)
          if (oy < -threshold || vy < -800) onSwipe('right');
          else if (oy > threshold || vy > 800) onSwipe('left');
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


