export type SwipeDirection = 'left' | 'right';

export interface CaseItem {
  id: string;
  title: string; // case title
  prompt: string; // case description shown on the card
  was: boolean; // true => Реальность: Было; false => Не было
  bankReaction: string; // Как отреагировал банк
  reality: string; // e.g. Реальность: Было / Не было
  bankProtection: string; // Как защитил банк свои интересы
}


