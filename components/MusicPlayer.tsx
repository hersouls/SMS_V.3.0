import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { WaveButton } from './WaveButton';
import { PhaseType } from '../utils/phaseColors';
import { cn } from './ui/utils';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  phase: PhaseType;
}

interface MusicPlayerProps {
  className?: string;
}

export function MusicPlayer({ className }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);

  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 전체 트랙 목록
  const tracks: Track[] = [
    {
      id: '1',
      title: 'Wabie Sync Part1',
      artist: 'Moonwave',
      duration: 240,
      audioUrl: '/music/1. Wabie Sync Part1.mp3',
      phase: 'beginning'
    },
    {
      id: '2',
      title: 'Wabie Sync Part2',
      artist: 'Moonwave',
      duration: 216,
      audioUrl: '/music/2. Wabie Sync Part2.mp3',
      phase: 'growth'
    },
    {
      id: '3',
      title: 'Wavecoded Part2',
      artist: 'Moonwave',
      duration: 174,
      audioUrl: '/music/3. Wavecoded Part2.mp3',
      phase: 'challenge'
    },
    {
      id: '4',
      title: 'Wavefront Part1',
      artist: 'Moonwave',
      duration: 198,
      audioUrl: '/music/4. Wavefront Part1.mp3',
      phase: 'shine'
    },
    {
      id: '5',
      title: 'Wavefront',
      artist: 'Moonwave',
      duration: 252,
      audioUrl: '/music/5. Wavefront.mp3',
      phase: 'beginning'
    },
    {
      id: '6',
      title: 'Under the Moonlight',
      artist: 'Moonwave',
      duration: 204,
      audioUrl: '/music/6. Under the Moonlight.mp3',
      phase: 'growth'
    },
    {
      id: '7',
      title: 'Moonwave Rising',
      artist: 'Moonwave',
      duration: 300,
      audioUrl: '/music/7. Moonwave Rising.mp3',
      phase: 'shine'
    },
    {
      id: '8',
      title: 'Ride My Wave',
      artist: 'Moonwave',
      duration: 294,
      audioUrl: '/music/8. Ride My Wave.mp3',
      phase: 'challenge'
    },
    {
      id: '9',
      title: "It's my Moonwave life",
      artist: 'Moonwave',
      duration: 228,
      audioUrl: '/music/9. It\'s my Moonwave life.mp3',
      phase: 'beginning'
    },
    {
      id: '10',
      title: 'Glow Not Noise',
      artist: 'Moonwave',
      duration: 258,
      audioUrl: '/music/10. Glow Not Noise.mp3',
      phase: 'growth'
    },
    {
      id: '11',
      title: 'Decode me slow',
      artist: 'Moonwave',
      duration: 252,
      audioUrl: '/music/11. Decode me slow.mp3',
      phase: 'shine'
    }
  ];

  const currentTrack = tracks[currentTrackIndex];

  // 오디오 로드 및 자동재생
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('오디오 로드 시작:', currentTrack.audioUrl);

    const handleCanPlay = () => {
      console.log('오디오 로드 완료');
      setAudioError(null);
      
      // 자동재생 시도
      audio.play().then(() => {
        console.log('자동재생 성공');
        setIsPlaying(true);
      }).catch((error) => {
        console.log('자동재생이 차단되었습니다:', error);
        setIsPlaying(false);
        setAudioError('자동재생이 차단되었습니다. 재생 버튼을 클릭해주세요.');
      });
    };

    const handleLoadStart = () => {
      console.log('오디오 로딩 시작');

      setAudioError(null);
    };

    const handleError = (error: any) => {
      console.log('오디오 로드 에러:', error);
      setAudioError('오디오 파일을 로드할 수 없습니다.');
      // 에러가 있어도 재생 버튼은 활성화
    };

    const handlePlay = () => {
      console.log('재생 시작');
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('일시정지');
      setIsPlaying(false);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentTrackIndex]);

  // 트랙 끝나면 다음 트랙으로
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      console.log('트랙 종료, 다음 트랙으로 이동');
      handleNext();
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) {
      console.log('오디오 요소가 없습니다');
      return;
    }

    console.log('재생/일시정지 버튼 클릭');

    try {
      if (isPlaying) {
        console.log('일시정지 시도');
        audio.pause();
        setIsPlaying(false);
      } else {
        console.log('재생 시도');
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('재생 실패:', error);
      setIsPlaying(false);
      setAudioError('재생에 실패했습니다. 브라우저 설정을 확인해주세요.');
    }
  };

  const handlePrevious = () => {
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    console.log('이전 트랙으로 이동:', newIndex);
    setCurrentTrackIndex(newIndex);
    setIsPlaying(false);
  };

  const handleNext = () => {
    const newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
    console.log('다음 트랙으로 이동:', newIndex);
    setCurrentTrackIndex(newIndex);
    setIsPlaying(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  return (
    <div className={cn("p-3", className)}>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        preload="auto"
        onLoadedMetadata={() => {
          if (audioRef.current) {
            audioRef.current.volume = volume;
          }
        }}
      />

      {/* Simple Player */}
      <div className="flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center space-x-3">
          <div className="min-w-0">
            <p className="text-xs-ko font-medium text-white-force truncate tracking-ko-normal break-keep-ko">
              {currentTrack.title}
            </p>
            {audioError && (
              <p className="text-xs-ko text-error-400 truncate tracking-ko-normal break-keep-ko">
                {audioError}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Previous Button */}
          <WaveButton
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            ariaLabel="이전 트랙"
            className="p-1.5 hover-button touch-target-sm focus-ring"
          >
            <SkipBack size={12} className="icon-enhanced" />
          </WaveButton>

          {/* Play/Pause Button */}
          <WaveButton
            variant="primary"
            size="sm"
            onClick={handlePlayPause}
            ariaLabel={isPlaying ? "일시정지" : "재생"}
            className="p-1.5 rounded-full hover-button touch-target-sm focus-ring wave-button-primary-enhanced"
          >
            {isPlaying ? <Pause size={14} className="icon-enhanced" /> : <Play size={14} className="icon-enhanced" />}
          </WaveButton>

          {/* Next Button */}
          <WaveButton
            variant="ghost"
            size="sm"
            onClick={handleNext}
            ariaLabel="다음 트랙"
            className="p-1.5 hover-button touch-target-sm focus-ring"
          >
            <SkipForward size={12} className="icon-enhanced" />
          </WaveButton>

          {/* Volume Control */}
          <WaveButton
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            ariaLabel={isMuted ? "음소거 해제" : "음소거"}
            className="p-1 hover-button touch-target-sm focus-ring"
          >
            {isMuted ? <VolumeX size={12} className="icon-enhanced" /> : <Volume2 size={12} className="icon-enhanced" />}
          </WaveButton>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-10 h-1 glass-light rounded-full appearance-none cursor-pointer focus-ring touch-target-sm"
            style={{
              background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
            aria-label="볼륨 조절"
            aria-describedby="volume-description"
          />
          <span id="volume-description" className="sr-only">
            볼륨을 조절하려면 슬라이더를 드래그하세요
          </span>
        </div>
      </div>
    </div>
  );
}