import React from 'react';
import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { getPhaseColors, getPhaseIcon, getPhaseName, PhaseType } from '../utils/phaseColors';
import { cn } from './ui/utils';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  phase: PhaseType;
  lyrics?: string[];
  isLiked?: boolean;
  playCount?: number;
}

interface TrackCardProps {
  track: Track;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  onPlay?: (track: Track) => void;
  onPause?: () => void;
  onLike?: (trackId: string) => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export function TrackCard({
  track,
  isPlaying = false,
  isCurrentTrack = false,
  onPlay,
  onPause,
  onLike,
  className,
  variant = 'default'
}: TrackCardProps) {

  const phaseColors = getPhaseColors(track.phase);

  const handlePlayPause = () => {
    if (isCurrentTrack && isPlaying) {
      onPause?.();
    } else {
      onPlay?.(track);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(track.id);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (variant === 'compact') {
    return (
      <GlassCard
        variant="light"
        hoverable
        className={cn(
          "p-3 transition-all duration-300 cursor-pointer touch-target",
          isCurrentTrack && "ring-2 ring-primary-500/50",
          className
        )}
        onClick={handlePlayPause}
      >
        <div className="flex items-center space-x-3">
          {/* Play Button / Track Number */}
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            {isCurrentTrack ? (
              <WaveButton
                variant={isCurrentTrack ? "primary" : "ghost"}
                size="sm"
                onClick={handlePlayPause}
                ariaLabel={isPlaying ? "일시정지" : "재생"}
                className="p-1 touch-target"
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause size={14} className="icon-enhanced text-white-force" />
                ) : (
                  <Play size={14} className="icon-enhanced text-white-force" />
                )}
              </WaveButton>
            ) : (
              <span className="text-sm-ko text-white-force/60 tracking-ko-normal text-high-contrast">
                {track.playCount || 1}
              </span>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={cn(
                "text-sm-ko font-medium tracking-ko-normal break-keep-ko truncate text-high-contrast",
                isCurrentTrack ? "text-primary-400" : "text-white-force"
              )}>
                {track.title}
              </h4>
              <div className={cn(
                "px-1.5 py-0.5 rounded text-xs-ko font-medium tracking-ko-normal flex-shrink-0",
                phaseColors.bg,
                phaseColors.text
              )}>
                {getPhaseIcon(track.phase)}
              </div>
            </div>
            <p className="text-xs-ko text-white-force/60 tracking-ko-normal break-keep-ko truncate text-high-contrast">
              {track.artist}
            </p>
          </div>

          {/* Duration & Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleLike}
              className={cn(
                "p-1 rounded transition-colors duration-200 touch-target focus-ring",
                track.isLiked 
                  ? "text-red-500 hover:text-red-400" 
                  : "text-white-force/60 hover:text-white-force"
              )}
              aria-label={track.isLiked ? "좋아요 취소" : "좋아요"}
            >
              <Heart size={14} className={cn("icon-enhanced text-white-force", track.isLiked ? "fill-current" : "")} />
            </button>
            
            <span className="text-xs-ko text-white-force/60 tracking-ko-normal text-high-contrast">
              {formatDuration(track.duration)}
            </span>
          </div>
        </div>

        {/* Playing Indicator */}
        {isCurrentTrack && isPlaying && (
          <div className="mt-2 flex items-center space-x-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-0.5 rounded-full",
                  phaseColors.bg
                )}
                style={{
                  height: `${Math.random() * 8 + 4}px`,
                  animation: `wave-pulse ${Math.random() * 0.5 + 0.8}s ease-in-out infinite ${Math.random() * 0.3}s`
                }}
              />
            ))}
            <span className="text-xs-ko text-white-force/60 tracking-ko-normal ml-2 text-high-contrast">
              재생 중...
            </span>
          </div>
        )}
      </GlassCard>
    );
  }

  return (
    <GlassCard
      variant="default"
      hoverable
      className={cn(
        "p-4 transition-all duration-300 cursor-pointer group touch-target",
        isCurrentTrack && "ring-2 ring-primary-500/50 bg-primary-500/5",
        className
      )}
      onClick={handlePlayPause}
      withWaveEffect={isCurrentTrack && isPlaying}
    >
      <div className="flex items-start space-x-4">
        {/* Album Cover */}
        <div className={cn(
          "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative",
          phaseColors.bg,
          phaseColors.border,
          "border"
        )}>
          {track.coverUrl ? (
            <img 
              src={track.coverUrl} 
              alt={`${track.title} 앨범 커버`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {getPhaseIcon(track.phase)}
            </div>
          )}
          
          {/* Play Overlay */}
          <div className={cn(
            "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200",
            isCurrentTrack ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <WaveButton
              variant="primary"
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

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-lg-ko font-medium tracking-ko-normal break-keep-ko text-high-contrast",
                isCurrentTrack ? "text-primary-400" : "text-white-force"
              )}>
                {track.title}
              </h3>
              <p className="text-sm-ko text-white-force/70 tracking-ko-normal break-keep-ko text-high-contrast">
                {track.artist}
              </p>
              {track.album && (
                <p className="text-xs-ko text-white-force/60 tracking-ko-normal break-keep-ko text-high-contrast">
                  {track.album}
                </p>
              )}
            </div>

            {/* Phase Badge */}
            <div className={cn(
              "px-2 py-1 rounded-md text-xs-ko font-medium tracking-ko-normal flex items-center space-x-1",
              phaseColors.bg,
              phaseColors.text,
              phaseColors.border,
              "border"
            )}>
              <span>{getPhaseIcon(track.phase)}</span>
              <span>{getPhaseName(track.phase)}</span>
            </div>
          </div>

          {/* Lyrics Preview */}
          {track.lyrics && track.lyrics.length > 0 && (
            <div className="mb-3 p-2 glass-light rounded-md">
              <p className="text-xs-ko text-white-force/70 tracking-ko-normal break-keep-ko italic line-clamp-2 text-high-contrast">
                "{track.lyrics[0]}"
              </p>
            </div>
          )}

          {/* Track Stats & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs-ko text-white-force/60 tracking-ko-normal text-high-contrast">
              <div className="flex items-center space-x-1">
                <Clock size={12} className="icon-enhanced text-white-force" />
                <span>{formatDuration(track.duration)}</span>
              </div>
              {track.playCount && (
                <span>재생 {track.playCount.toLocaleString()}회</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={cn(
                  "p-2 rounded-full transition-all duration-200 touch-target focus-ring",
                  track.isLiked 
                    ? "text-red-500 hover:text-red-400 bg-red-500/10" 
                    : "text-white-force/60 hover:text-white-force hover:bg-white/10"
                )}
                aria-label={track.isLiked ? "좋아요 취소" : "좋아요"}
              >
                <Heart size={16} className={cn("icon-enhanced text-white-force", track.isLiked ? "fill-current" : "")} />
              </button>
              
              <button
                className="p-2 rounded-full text-white-force/60 hover:text-white-force hover:bg-white/10 transition-all duration-200 touch-target focus-ring"
                aria-label="더보기"
              >
                <MoreHorizontal size={16} className="icon-enhanced text-white-force" />
              </button>
            </div>
          </div>

          {/* Playing Visualizer */}
          {isCurrentTrack && isPlaying && (
            <div className="mt-3 flex items-center space-x-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full",
                    phaseColors.bg
                  )}
                  style={{
                    height: `${Math.random() * 16 + 4}px`,
                    animation: `wave-pulse ${Math.random() * 0.5 + 0.8}s ease-in-out infinite ${Math.random() * 0.5}s`
                  }}
                />
              ))}
              <span className="text-xs-ko text-white-force/60 tracking-ko-normal ml-3 text-high-contrast">
                재생 중...
              </span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}