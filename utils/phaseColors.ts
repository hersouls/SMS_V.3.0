export type PhaseType = 'beginning' | 'growth' | 'challenge' | 'shine';

export interface PhaseColors {
  gradient: string;
  text: string;
  bg: string;
  border: string;
}

export function getPhaseColors(phase: PhaseType): PhaseColors {
  const phaseColorMap: Record<PhaseType, PhaseColors> = {
    beginning: {
      gradient: 'bg-gradient-phase-beginning',
      text: 'text-phase-beginning',
      bg: 'bg-phase-beginning-light',
      border: 'border-phase-beginning'
    },
    growth: {
      gradient: 'bg-gradient-phase-growth',
      text: 'text-phase-growth',
      bg: 'bg-phase-growth-light',
      border: 'border-phase-growth'
    },
    challenge: {
      gradient: 'bg-gradient-phase-challenge',
      text: 'text-phase-challenge',
      bg: 'bg-phase-challenge-light',
      border: 'border-phase-challenge'
    },
    shine: {
      gradient: 'bg-gradient-phase-shine',
      text: 'text-phase-shine',
      bg: 'bg-phase-shine-light',
      border: 'border-phase-shine'
    }
  };

  return phaseColorMap[phase];
}

export function getPhaseIcon(phase: PhaseType): string {
  const phaseIconMap: Record<PhaseType, string> = {
    beginning: '🌱',
    growth: '🌿',
    challenge: '⚡',
    shine: '✨'
  };

  return phaseIconMap[phase];
}

export function getPhaseName(phase: PhaseType): string {
  const phaseNameMap: Record<PhaseType, string> = {
    beginning: '시작',
    growth: '성장',
    challenge: '도전',
    shine: '빛남'
  };

  return phaseNameMap[phase];
}