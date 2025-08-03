
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ArrowLeft, Shuffle, Repeat } from 'lucide-react';
import { WaveButton } from './WaveButton';
import { TrackCard } from './TrackCard';
import { GlassCard } from './GlassCard';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from './ui/utils';
import { useApp } from '../App';
import { Link } from 'react-router-dom';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
}

interface MusicPlayerProps {
  className?: string;
}

// 간단한 음악 플레이어 상태 관리
const useMusicPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks: MusicTrack[] = [
    {
      id: '1',
      title: 'Wavie Sync Part1',
      artist: 'Moonwave',
      duration: 240,
      audioUrl: '/music/1. Wavie Sync Part1.mp3',
      coverUrl: '/moonwave.png'
    },
    {
      id: '2',
      title: 'Wavie Sync Part2',
      artist: 'Moonwave',
      duration: 216,
      audioUrl: '/music/2. Wavie Sync Part2.mp3',
      coverUrl: '/moonwave.png'
    },
    {
      id: '3',
      title: 'Wavecoded Part2',
      artist: 'Moonwave',
      duration: 174,
      audioUrl: '/music/3. Wavecoded Part2.mp3',
      coverUrl: '/moonwave.png'
    },
    {
      id: '4',
      title: 'Wavefront Part1',
      artist: 'Moonwave',
      duration: 198,
      audioUrl: '/music/4. Wavefront Part1.mp3',
      coverUrl: '/moonwave.png'
    },
    {
      id: '5',
      title: 'Wavefront',
      artist: 'Moonwave',
      duration: 252,
      audioUrl: '/music/5. Wavefront.mp3',
      coverUrl: '/moonwave.png'
    },
    {
      id: '6',
      title: 'Under the Moonlight',
      artist: 'Moonwave',
      duration: 204,
      audioUrl: '/music/6. Under the Moonlight.mp3',
      coverUrl: '/moonwave.png'
    },
    {
      id: '7',
      title: 'Moonwave Rising',
      artist: 'Moonwave',
      duration: 300,
      audioUrl: '/music/7. Moonwave Rising.mp3',
      coverUrl: '/moonwave.png'
    },
    {
      id: '8',
      title: 'Ride My Wave',
      artist: 'Moonwave',
      duration: 294,
      audioUrl: '/music/8. Ride My Wave.mp3',
      coverUrl: '/moonwave.png'
    },
    {
      id: '9',
      title: "It's my Moonwave life",
      artist: 'Moonwave',
      duration: 228,
      audioUrl: '/music/9. It\'s my Moonwave life.mp3',
      coverUrl: '/moonwave.png'
    },
    {
      id: '10',
      title: 'Glow Not Noise',
      artist: 'Moonwave',
      duration: 258,
      audioUrl: '/music/10. Glow Not Noise.mp3',
      coverUrl: '/moonwave.png'
    },
    {
      id: '11',
      title: 'Decode me slow',
      artist: 'Moonwave',
      duration: 252,
      audioUrl: '/music/11. Decode me slow.mp3',
      coverUrl: '/moonwave.png'
    }
  ];

  const currentTrack = tracks[currentTrackIndex];

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 재생/일시정지
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('재생 실패:', error);
      });
    }
  };

  // 이전 트랙
  const previousTrack = () => {
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    setCurrentTrackIndex(newIndex);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // 다음 트랙
  const nextTrack = () => {
    const newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
    setCurrentTrackIndex(newIndex);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // 볼륨 변경
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
  };

  // 음소거 토글
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      setIsMuted(false);
      audio.volume = volume;
    } else {
      setIsMuted(true);
      audio.volume = 0;
    }
  };

  // 오디오 이벤트 핸들러
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      nextTrack();
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // 트랙 변경 시 오디오 소스 업데이트
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.audioUrl;
    audio.load();
    audio.volume = isMuted ? 0 : volume;
  }, [currentTrackIndex, currentTrack?.audioUrl, volume, isMuted]);

  return {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    audioRef,
    formatTime,
    togglePlay,
    previousTrack,
    nextTrack,
    handleVolumeChange,
    toggleMute,
    setCurrentTrackIndex
  };
};

export function MusicPlayer({ className }: MusicPlayerProps) {
  const { isAuthenticated } = useApp();
  const [isMusicPage, setIsMusicPage] = useState(false);

  useEffect(() => {
    setIsMusicPage(window.location.pathname === '/music');
  }, []);

  if (isMusicPage) {
    return <MusicPage />;
  }

  return <MusicPlayerComponent className={className} />;
}

// 음악 페이지 컴포넌트
function MusicPage() {
  const {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    audioRef,
    formatTime,
    togglePlay,
    previousTrack,
    nextTrack,
    handleVolumeChange,
    toggleMute,
    setCurrentTrackIndex
  } = useMusicPlayer();

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const handlePlayTrack = (track: MusicTrack) => {
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    if (trackIndex !== -1) {
      setCurrentTrackIndex(trackIndex);
    }
  };

  const handleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const handleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-28 pb-token-xl px-token-md">
        <div className="max-w-7xl mx-auto space-y-token-xl">
          
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-token-sm">
              <Link to="/">
                <WaveButton 
                  variant="glass" 
                  size="sm" 
                  className="wave-button-glass-enhanced hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white-force font-medium touch-target"
                  aria-label="뒤로 가기"
                >
                  <ArrowLeft size={16} className="mr-token-xs icon-enhanced" strokeWidth={1.5} />
                  뒤로
                </WaveButton>
              </Link>
              <div>
                <h1 className="text-3xl-ko font-bold text-white-force break-keep-ko">Moonwave Music</h1>
                <p className="text-white-force/60 text-sm-ko break-keep-ko">당신만의 특별한 음악 경험</p>
              </div>
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio ref={audioRef} preload="auto" />

          {/* Current Track Info */}
          {currentTrack && (
            <GlassCard variant="strong" className="p-token-lg">
              <div className="space-y-token-lg">
                {/* Track Info */}
                <div className="text-center">
                  <h2 className="text-3xl-ko font-bold text-white-force mb-2 break-keep-ko">
                    {currentTrack.title}
                  </h2>
                  <p className="text-lg-ko text-white-force/70 break-keep-ko">
                    {currentTrack.artist}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white-force/60">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center space-x-token-lg">
                  <WaveButton
                    variant="ghost"
                    size="lg"
                    onClick={previousTrack}
                    className="wave-button-ghost-enhanced"
                  >
                    <SkipBack size={24} className="icon-enhanced" />
                  </WaveButton>

                  <WaveButton
                    variant="primary"
                    size="lg"
                    onClick={togglePlay}
                    className="wave-button-primary-enhanced p-4"
                  >
                    {isPlaying ? (
                      <Pause size={32} className="icon-enhanced" />
                    ) : (
                      <Play size={32} className="icon-enhanced" />
                    )}
                  </WaveButton>

                  <WaveButton
                    variant="ghost"
                    size="lg"
                    onClick={nextTrack}
                    className="wave-button-ghost-enhanced"
                  >
                    <SkipForward size={24} className="icon-enhanced" />
                  </WaveButton>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-center space-x-token-md">
                  <WaveButton
                    variant="ghost"
                    size="sm"
                    onClick={handleShuffle}
                    className={cn(
                      "wave-button-ghost-enhanced",
                      isShuffle && "text-primary-400"
                    )}
                  >
                    <Shuffle size={20} className="icon-enhanced" />
                  </WaveButton>

                  <WaveButton
                    variant="ghost"
                    size="sm"
                    onClick={handleRepeat}
                    className={cn(
                      "wave-button-ghost-enhanced",
                      isRepeat && "text-primary-400"
                    )}
                  >
                    <Repeat size={20} className="icon-enhanced" />
                  </WaveButton>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="wave-button-ghost-enhanced"
                    >
                      {isMuted ? 
                        <VolumeX size={20} className="icon-enhanced" /> : 
                        <Volume2 size={20} className="icon-enhanced" />
                      }
                    </WaveButton>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Track List */}
          <div className="space-y-token-md">
            <h3 className="text-xl-ko font-semibold text-white-force break-keep-ko">모든 트랙</h3>
            <div className="space-y-token-sm">
              {tracks.map((track, index) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying && currentTrackIndex === index}
                  isCurrentTrack={currentTrackIndex === index}
                  onPlay={handlePlayTrack}
                  onPause={togglePlay}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// TrackCard 컴포넌트는 별도 파일에서 import됨

// 기존 음악 플레이어 컴포넌트 (Footer용)
function MusicPlayerComponent({ className }: MusicPlayerProps) {
  const {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    audioRef,
    togglePlay,
    previousTrack,
    nextTrack,
    handleVolumeChange,
    toggleMute
  } = useMusicPlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!currentTrack) {
    return null;
  }

  return (
    <div className={cn(
      "w-full max-w-7xl mx-auto glass-default border border-glass-border-default rounded-xl shadow-lg mt-4",
      "transition-all duration-300 transform-gpu hover-card-subtle",
      "px-4 sm:px-6 py-3 sm:py-4",
      className
    )}>
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="auto" />

      {/* Player Interface */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Track Info */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-white-force truncate tracking-ko-normal">
              {currentTrack.title}
            </p>
            <p className="text-xs text-muted-foreground truncate tracking-ko-normal hidden sm:block">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
          {/* Previous Button */}
          <WaveButton
            variant="ghost"
            size="sm"
            onClick={previousTrack}
            ariaLabel="이전 트랙"
            className="wave-button-ghost-enhanced p-1.5 sm:p-2 rounded-full transition-all duration-300 hidden sm:flex"
          >
            <SkipBack size={14} className="icon-primary sm:w-4 sm:h-4" />
          </WaveButton>

          {/* Play/Pause Button */}
          <WaveButton
            variant="primary"
            size="sm"
            onClick={togglePlay}
            ariaLabel={isPlaying ? "일시정지" : "재생"}
            className={cn(
              "wave-button-primary-enhanced p-2.5 sm:p-4 rounded-full transition-all duration-300",
              "bg-gradient-primary hover:bg-gradient-primary",
              "shadow-lg hover:shadow-xl"
            )}
          >
            {isPlaying ? 
              <Pause size={18} className="icon-primary sm:w-6 sm:h-6" /> : 
              <Play size={18} className="icon-primary sm:w-6 sm:h-6 ml-0.5" />
            }
          </WaveButton>

          {/* Next Button */}
          <WaveButton
            variant="ghost"
            size="sm"
            onClick={nextTrack}
            ariaLabel="다음 트랙"
            className="wave-button-ghost-enhanced p-1.5 sm:p-2 rounded-full transition-all duration-300 hidden sm:flex"
          >
            <SkipForward size={14} className="icon-primary sm:w-4 sm:h-4" />
          </WaveButton>

          {/* Volume Control */}
          <div className="relative volume-control">
            <WaveButton
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              ariaLabel={isMuted ? "음소거 해제" : "볼륨 조절"}
              className="wave-button-ghost-enhanced p-1.5 sm:p-2 rounded-full transition-all duration-300"
            >
              {isMuted ? 
                <VolumeX size={14} className="icon-primary sm:w-4 sm:h-4" /> : 
                <Volume2 size={14} className="icon-primary sm:w-4 sm:h-4" />
              }
            </WaveButton>
            
            {/* Volume Slider Popup */}
            {showVolumeSlider && (
              <div className="absolute bottom-full right-0 mb-2 sm:mb-3 p-3 sm:p-4 glass-strong rounded-xl border border-glass-border-strong shadow-2xl z-50">
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-1 h-16 sm:h-20 bg-gray-600 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      style={{
                        background: `linear-gradient(to top, var(--primary-500) 0%, var(--primary-500) ${(isMuted ? 0 : volume) * 100}%, rgba(75, 85, 99, 0.5) ${(isMuted ? 0 : volume) * 100}%, rgba(75, 85, 99, 0.5) 100%)`
                      }}
                      aria-label="볼륨 조절"
                    />
                  </div>
                  
                  <span className="text-xs text-white-force font-medium tracking-ko-normal">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}