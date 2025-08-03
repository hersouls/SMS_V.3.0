import React from 'react';
import { Play, Pause } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { cn } from './ui/utils';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
}

interface TrackCardProps {
  track: MusicTrack;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  onPlay?: (track: MusicTrack) => void;
  onPause?: () => void;
  className?: string;
}

export function TrackCard({
  track,
  isPlaying = false,
  isCurrentTrack = false,
  onPlay,
  onPause,
  className
}: TrackCardProps) {

  const handlePlayPause = () => {
    if (isCurrentTrack && isPlaying) {
      onPause?.();
    } else {
      onPlay?.(track);
    }
  };

  return (
    <GlassCard
      variant="light"
      hoverable
      className={cn(
        "p-4 transition-all duration-300 cursor-pointer touch-target",
        isCurrentTrack && "ring-2 ring-primary-500/50",
        className
      )}
      onClick={handlePlayPause}
    >
      <div className="flex items-center justify-between">
        {/* Track Title */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-lg-ko font-medium tracking-ko-normal break-keep-ko text-high-contrast",
            isCurrentTrack ? "text-primary-400" : "text-white-force"
          )}>
            {track.title}
          </h3>
        </div>

        {/* Play Button */}
        <div className="flex-shrink-0 ml-4">
          <WaveButton
            variant={isCurrentTrack ? "primary" : "ghost"}
            size="sm"
            onClick={handlePlayPause}
            ariaLabel={isPlaying ? "일시정지" : "재생"}
            className="p-2 rounded-full touch-target"
          >
            {isCurrentTrack && isPlaying ? (
              <Pause size={16} className="icon-enhanced text-white-force" />
            ) : (
              <Play size={16} className="icon-enhanced text-white-force" />
            )}
          </WaveButton>
        </div>
      </div>
    </GlassCard>
  );
}