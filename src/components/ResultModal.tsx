import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import type { CaseItem, SwipeDirection } from '../types';

interface Props {
  caseItem: CaseItem;
  chosen: SwipeDirection; // what user chose
  onNext: () => void;
}

export function ResultModal({ caseItem, chosen, onNext }: Props) {
  const isCorrect = (chosen === 'right') === caseItem.was;
  const startYRef = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext]);

  const handlePointerDown = (e: React.PointerEvent) => {
    startYRef.current = e.clientY;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    const startY = startYRef.current;
    startYRef.current = null;
    if (startY == null) return;
    const dy = e.clientY - startY;
    if (Math.abs(dy) > 60) onNext();
  };

  const modal = (
    <motion.div
      className="modal-backdrop"
      role="dialog"
      aria-modal
      onClick={(e) => { if (e.target === e.currentTarget) onNext(); }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.div 
        className={`modal ${isCorrect ? 'correct' : 'incorrect'}`}
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.16, 1, 0.3, 1],
          scale: { duration: 0.4 }
        }}
      >
        <div className="modal-header">
          <h2 className={isCorrect ? 'correct-text' : 'incorrect-text'}>
            {isCorrect ? 'Верно' : 'Неверно'}
          </h2>
        </div>
        <div className="modal-body">
          <div className="answer-line">
            <span className="real">{caseItem.reality}</span>
          </div>
          {caseItem.was && (
            <>
              <div className="section">
                <div className="section-title">Как отреагировал банк</div>
                <p>{caseItem.bankReaction}</p>
              </div>
              {caseItem.bankProtection && (
                <div className="section">
                  <div className="section-title">Как банку защитить свои интересы</div>
                  <pre className="protection">{caseItem.bankProtection}</pre>
                </div>
              )}
            </>
          )}
          {!caseItem.was && caseItem.bankReaction && (
            <div className="section">
              <p>{caseItem.bankReaction}</p>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="next-btn" onClick={onNext}>Дальше ⏎</button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}


