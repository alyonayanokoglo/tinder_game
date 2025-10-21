import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDragControls } from 'framer-motion';
import type { CaseItem, SwipeDirection } from '../types';
import { CaseCard } from './CaseCard';
import { ResultModal } from './ResultModal';

interface Props {
  cases: CaseItem[];
  onFinish?: () => void;
}

const STORAGE_KEY = 'case-progress-v1';

export function SwipeDeck({ cases, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [lastChoice, setLastChoice] = useState<SwipeDirection | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [numCorrect, setNumCorrect] = useState(0);

  const current = useMemo(() => cases[index], [cases, index]);

  const handleSwipe = useCallback((dir: SwipeDirection) => {
    setLastChoice(dir);
    setShowResult(true);
    // update score immediately based on current card
    if ((dir === 'right') === current.was) {
      setNumCorrect((n) => n + 1);
    }
  }, [current]);

  const handleNext = useCallback(() => {
    setShowResult(false);
    setLastChoice(null);
    setIndex((v) => {
      const next = v + 1;
      if (next >= cases.length) {
        onFinish?.();
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
        return v; // stay on last
      }
      return next;
    });
  }, [cases.length, onFinish]);

  // Load progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedIndex = parsed?.index;
        const savedCorrect = parsed?.correct;
        if (typeof savedIndex === 'number' && savedIndex >= 0 && savedIndex < cases.length) {
          setIndex(savedIndex);
        }
        if (typeof savedCorrect === 'number' && savedCorrect >= 0) {
          setNumCorrect(savedCorrect);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save progress
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ index, correct: numCorrect })); } catch {}
  }, [index, numCorrect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showResult) return; // when modal open, Enter handles next
      if (e.key === 'ArrowRight') handleSwipe('right');
      if (e.key === 'ArrowLeft') handleSwipe('left');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSwipe, showResult]);

  if (!current) {
    return (
      <div className="done">
        <h2>Все кейсы завершены</h2>
        <p style={{opacity:0.8}}>Ваш результат: {numCorrect} / {cases.length}</p>
        {numCorrect === cases.length ? (
          <p style={{color:'#2ecc71', fontWeight:700}}>Отлично! Все ответы верные — вы молодец 🎉</p>
        ) : (
          <p>Можно попробовать ещё раз и улучшить результат.</p>
        )}
        <button onClick={() => window.location.reload()}>Начать заново</button>
      </div>
    );
  }

  const visible = cases.slice(index, Math.min(index + 3, cases.length));
  const top = visible[0];
  const next = visible[1];
  const dragControls = useDragControls();
  const startDrag = (e: React.PointerEvent) => {
    if (showResult) return;
    const anyEvent = e as unknown as { buttons?: number };
    if (anyEvent.buttons !== undefined && anyEvent.buttons !== 1) return;
    dragControls.start(e);
  };

  return (
    <div className={`deck${showResult ? ' result-only' : ''}`} aria-hidden={showResult}>
      {!showResult && (
        <>
          <div className="drag-layer" onPointerDown={startDrag} />
          {next && (
            <CaseCard key={`${next.id}-back`} item={next} index={1} onSwipe={handleSwipe} isBack />
          )}
          {top && (
            <CaseCard key={top.id} item={top} index={0} onSwipe={handleSwipe} dragControls={dragControls} />
          )}
          <div className="progress">{Math.min(index + 1, cases.length)} / {cases.length}</div>
          <div className="score">Баллы: {numCorrect}</div>
        </>
      )}
      {showResult && lastChoice && (
        <ResultModal caseItem={current} chosen={lastChoice} onNext={handleNext} />
      )}
    </div>
  );
}


