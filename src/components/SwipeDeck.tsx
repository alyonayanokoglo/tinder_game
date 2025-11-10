import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDragControls, motion } from 'framer-motion';
import type { CaseItem, SwipeDirection } from '../types';
import { CaseCard } from './CaseCard';
import { ResultModal } from './ResultModal';

interface Props {
  cases: CaseItem[];
  onFinish?: () => void;
}

export function SwipeDeck({ cases, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [lastChoice, setLastChoice] = useState<SwipeDirection | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [numCorrect, setNumCorrect] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(null);

  const current = useMemo(() => cases[index], [cases, index]);

  const handleSwipe = useCallback((dir: SwipeDirection) => {
    setLastChoice(dir);
    setSwipeDirection(dir);
    // update score immediately based on current card
    if ((dir === 'right') === current.was) {
      setNumCorrect((n) => n + 1);
    }
    // Задержка перед показом модального окна
    setTimeout(() => {
      setShowResult(true);
    }, 200);
  }, [current]);

  const handleNext = useCallback(() => {
    setShowResult(false);
    setLastChoice(null);
    setSwipeDirection(null);
    setIndex((v) => {
      const next = v + 1;
      if (next >= cases.length) {
        onFinish?.();
      }
      return next;
    });
  }, [cases.length, onFinish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showResult) return; // when modal open, Enter handles next
      if (e.key === 'ArrowRight') handleSwipe('right');
      if (e.key === 'ArrowLeft') handleSwipe('left');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSwipe, showResult]);

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

  // Final screen when all cases are done
  if (!current) {
    let title = '';
    let message = '';
    let messageColor = '';
    
    if (numCorrect >= 8) {
      // 8-9 из 9
      title = 'Идеально! Ты настоящий защитник интересов банка!';
      message = 'Ты уверенно разбираешься в кейсах и видишь суть каждой ситуации. Можно доверить самые сложные задачи.';
      messageColor = '#2ecc71';
    } else if (numCorrect >= 6) {
      // 6-7 из 9
      title = 'Почти идеально! Ещё немного — и ты эксперт';
      message = 'Ты отлично ориентируешься в непростых кейсах. Ещё чуть-чуть практики — и ни один заемщик не проскользнёт мимо!';
      messageColor = '#2ecc71';
    } else if (numCorrect >= 4) {
      // 4-5 из 9
      title = 'Есть над чем поработать';
      message = 'Ты на правильном пути — пара деталей, и всё станет ясно!';
      messageColor = '#f39c12';
    } else {
      // 0-3 из 9
      title = 'Упс… Банк бы не одобрил';
      message = 'Кажется, ты доверился клиентам слишком сильно..';
      messageColor = '#ff6b6b';
    }

    return (
      <motion.div 
        className="modal-backdrop" 
        role="dialog" 
        aria-modal
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <motion.div 
          className="modal final-modal"
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            scale: { duration: 0.4 }
          }}
        >
          <div className="modal-header">
            <h2 style={{color: messageColor}}>{title}</h2>
          </div>
          <div className="modal-body">
            <div className="final-score">
              <div className="score-number">{numCorrect} / {cases.length}</div>
            </div>
            <p className="final-message" style={{fontSize: '16px', textAlign: 'center', marginTop: '16px', lineHeight: '1.6'}}>
              {message}
            </p>
          </div>
          <div className="modal-actions">
            <button className="next-btn" onClick={() => {
              window.location.reload();
            }}>
              Начать заново
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className={`deck${showResult ? ' result-only' : ''}`} aria-hidden={showResult}>
      <>
        {!showResult && <div className="drag-layer" onPointerDown={startDrag} />}
        {next && (
          <CaseCard key={`${next.id}-back`} item={next} index={1} onSwipe={handleSwipe} isBack />
        )}
        {top && (
          <CaseCard 
            key={top.id} 
            item={top} 
            index={0} 
            onSwipe={handleSwipe} 
            dragControls={dragControls}
            swipeDirection={swipeDirection}
          />
        )}
        {!showResult && (
          <>
            <div className="progress">{Math.min(index + 1, cases.length)} / {cases.length}</div>
            <div className="score">Баллы: {numCorrect}</div>
          </>
        )}
      </>
      {showResult && lastChoice && current && (
        <ResultModal caseItem={current} chosen={lastChoice} onNext={handleNext} />
      )}
    </div>
  );
}


