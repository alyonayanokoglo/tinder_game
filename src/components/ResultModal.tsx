import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal
      onClick={(e) => { if (e.target === e.currentTarget) onNext(); }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className={`modal ${isCorrect ? 'correct' : 'incorrect'}`}>
        <div className="modal-header">
          <h2 className={isCorrect ? 'correct-text' : 'incorrect-text'}>
            {isCorrect ? 'Верно' : 'Неверно'}
          </h2>
        </div>
        <div className="modal-body">
          <div className="answer-line">
            <span className="real">{caseItem.reality}</span>
          </div>
          <div className="section">
            <div className="section-title">Как отреагировал банк</div>
            <p>{caseItem.bankReaction}</p>
          </div>
          <div className="section">
            <div className="section-title">Как защитил банк свои интересы</div>
            <pre className="protection">{caseItem.bankProtection}</pre>
          </div>
        </div>
        <div className="modal-actions">
          <button className="next-btn" onClick={onNext}>Дальше ⏎</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}


