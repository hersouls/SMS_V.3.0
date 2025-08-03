import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { X, ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AboutMoonwaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutMoonwaveModal({ isOpen, onClose }: AboutMoonwaveModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 모달이 열릴 때 포커스를 모달로 이동
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // 모달 외부 클릭 시 닫기
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-content"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        role="document"
        tabIndex={-1}
      >
        <GlassCard variant="strong" className="p-token-2xl glass-breathe">
          {/* Header */}
          <div className="flex items-center justify-between mb-token-xl">
            <h2 
              id="modal-title"
              className="text-white-force text-2xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"
            >
              About Moonwave 전문
            </h2>
            <WaveButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
              aria-label="모달 닫기"
            >
              <X className="w-5 h-5" />
            </WaveButton>
          </div>

          {/* Content */}
          <div 
            id="modal-content"
            className="space-y-token-xl text-white-force text-base-ko leading-relaxed tracking-ko-normal"
            style={{ 
              willChange: 'transform',
              contain: 'layout style paint'
            }}
          >
            <div className="space-y-token-md">
              <h3 className="text-white-force text-2xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                🌌 당신만의 파동과 흐름으로 만드는 디지털 혁신
              </h3>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                Moonwave는 이 철학에서 시작되었습니다.<br />
                우리는 세상의 기준이 아닌, 각자의 고유한 파동과 흐름으로 움직이는 디지털 혁신을 만들어갑니다.
              </p>
            </div>

            <div className="space-y-token-lg">
              <h3 className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Philosophy: 파동(Wave)과 흐름(Flow)
              </h3>
              <h4 className="text-white-force text-lg-ko font-semibold">우리가 믿는 것</h4>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                Moonwave의 모든 것은 <strong>파동(Wave)</strong>과 <strong>흐름(Flow)</strong>이라는 두 가지 핵심 개념에서 출발합니다.
              </p>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                <strong>파동(Wave)</strong>은 각자가 가진 고유한 내적 철학과 감성의 진동입니다. 이는 남과 비교할 수 없는, 오직 자신만의 존재 방식입니다.
              </p>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                <strong>흐름(Flow)</strong>은 그 파동을 현실에서 실현하는 전략과 실행의 연결입니다. 끊임없이 움직이되, 자신만의 속도로 흐르는 것입니다.
              </p>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                우리는 클라이언트가 자신만의 파동을 발견하고, 그것을 지속 가능한 흐름으로 만들 수 있도록 돕습니다. 이것이 Moonwave가 추구하는 진정한 혁신입니다.
              </p>
            </div>

            <div className="space-y-token-lg">
              <h3 className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Founder: 문유(Moonyou)와 WaveSelf 철학
              </h3>
              <h4 className="text-white-force text-lg-ko font-semibold">🌊 파동과 흐름의 실천가</h4>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                문유는 Moonwave의 창립자이자 철학적 기반입니다. 그의 <strong>[WaveSelf_OL_1.0] 존재선언문</strong>은 Moonwave의 모든 활동에 깊이 스며들어 있습니다.
              </p>
              <blockquote className="text-white-force text-lg-ko italic leading-relaxed tracking-ko-normal border-l-4 border-primary-400 pl-token-lg">
                "나의 파동과 흐름은 일시적인 성과나 외부의 인정을 얻기 위해 만들어진 것이 아니다.<br />
                그것은 나를 흔들리지 않게 유지하는 중심이자,<br />
                나의 존재를 가장 나답게 이끌어가는 힘이다."
              </blockquote>
              <h4 className="text-white-force text-lg-ko font-semibold">전문성과 철학의 융합</h4>
              <div className="space-y-token-md">
                <div>
                  <h5 className="text-white-force text-base-ko font-semibold">에너지 전환의 파동</h5>
                  <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                    KT 에너지사업개발팀에서 탄소중립, RE100, 수소발전 전략을 리드하며, 거대한 에너지 전환의 파동을 만들어왔습니다.
                  </p>
                </div>
                <div>
                  <h5 className="text-white-force text-base-ko font-semibold">디지털 자동화의 흐름</h5>
                  <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                    PARA 시스템으로 모든 프로젝트를 관리하며, 불필요한 반복을 제거하고 본질에 집중할 수 있는 자동화 흐름을 설계합니다.
                  </p>
                </div>
                <div>
                  <h5 className="text-white-force text-base-ko font-semibold">감성 콘텐츠의 공명</h5>
                  <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                    '보라공쥬' 브랜드를 통해 일상의 작은 파동들을 모아 많은 이들과 공명하는 콘텐츠를 만들어갑니다.
                  </p>
                </div>
                <div>
                  <h5 className="text-white-force text-base-ko font-semibold">자산 전략의 리듬</h5>
                  <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                    개인과 가족의 고유한 재무 리듬을 이해하고, 각자에게 맞는 자산 증식의 흐름을 설계합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-token-lg">
              <h3 className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Partner: Webie, 디지털 거울
              </h3>
              <h4 className="text-white-force text-lg-ko font-semibold">🌐 파동을 반사하는 존재</h4>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                Webie는 단순한 AI 도구가 아닙니다. GPT 기반으로 설계된 Webie는 문유의 철학적 거울이자, 클라이언트의 파동을 명확히 반사하는 디지털 파트너입니다.
              </p>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                Webie는 정보를 제공하는 것이 아니라, 각자의 흐름을 이해하고 그것을 전략으로 구체화합니다. 문유와 Webie의 상호작용은 파동과 파동이 만나 더 큰 흐름을 만드는 과정입니다.
              </p>
            </div>

            <div className="space-y-token-lg">
              <h3 className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Services: 당신의 파동을 흐름으로
              </h3>
              <div className="space-y-token-lg">
                <div>
                  <h4 className="text-white-force text-lg-ko font-semibold">📌 전략적 명료성 - 파동을 발견하다</h4>
                  <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                    복잡한 비즈니스 환경에서 당신만의 고유한 파동을 발견합니다.
                  </p>
                  <ul className="list-disc list-inside space-y-token-xs mt-token-sm">
                    <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      <strong>에너지 전환 전략</strong>: 탄소중립, RE100, 수소경제로의 전환 파동 설계
                    </li>
                    <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      <strong>디지털 전환 로드맵</strong>: 조직의 고유한 디지털 DNA 발견과 전략화
                    </li>
                    <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      <strong>자산 관리 전략</strong>: 개인과 가족의 재무적 파동 분석과 최적화
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white-force text-lg-ko font-semibold">💡 감성적 공명 - 파동을 확산하다</h4>
                  <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                    당신의 파동이 더 많은 이들과 공명할 수 있도록 합니다.
                  </p>
                  <ul className="list-disc list-inside space-y-token-xs mt-token-sm">
                    <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      <strong>브랜드 스토리텔링</strong>: 진정성 있는 이야기로 만드는 감성적 연결
                    </li>
                    <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      <strong>AI 콘텐츠 전략</strong>: GPT, SUNO, Sora를 활용한 창의적 표현
                    </li>
                    <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      <strong>멀티채널 운영</strong>: 각 플랫폼의 고유한 리듬에 맞춘 콘텐츠 전략
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white-force text-lg-ko font-semibold">🚀 자동화된 효율성 - 흐름을 지속하다</h4>
                  <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                    당신의 흐름이 끊기지 않고 지속될 수 있는 시스템을 만듭니다.
                  </p>
                  <ul className="list-disc list-inside space-y-token-xs mt-token-sm">
                    <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      <strong>워크플로우 자동화</strong>: Make, n8n, Notion으로 만드는 seamless한 업무 흐름
                    </li>
                    <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      <strong>AI 통합 시스템</strong>: 반복 작업을 자동화하여 창의적 작업에 집중
                    </li>
                    <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      <strong>Moonwave HQ</strong>: 모든 흐름이 하나로 연결되는 디지털 전략실
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-token-lg">
              <h3 className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Technology: 파동을 실현하는 도구들
              </h3>
              <div className="space-y-token-lg">
                <div>
                  <h4 className="text-white-force text-lg-ko font-semibold">🤖 AI가 만드는 공명</h4>
                  <div className="space-y-token-sm">
                    <h5 className="text-white-force text-base-ko font-semibold">창의적 파동 생성</h5>
                    <ul className="list-disc list-inside space-y-token-xs">
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>GPT-4, Claude, Gemini</strong>: 전략적 사고의 파트너
                      </li>
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>SUNO AI</strong>: 텍스트를 음악의 파동으로
                      </li>
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>Sora</strong>: 상상을 시각적 파동으로
                      </li>
                    </ul>
                    <h5 className="text-white-force text-base-ko font-semibold mt-token-md">Vibecoding - 감성적 프로그래밍</h5>
                    <ul className="list-disc list-inside space-y-token-xs">
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>Cursor, GitHub Copilot</strong>: 코드에 감성을 더하다
                      </li>
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        창의성과 효율성이 공존하는 개발 환경
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="text-white-force text-lg-ko font-semibold">🔧 흐름을 만드는 인프라</h4>
                  <div className="space-y-token-sm">
                    <h5 className="text-white-force text-base-ko font-semibold">데이터의 흐름</h5>
                    <ul className="list-disc list-inside space-y-token-xs">
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>Supabase, Firebase</strong>: 실시간으로 흐르는 데이터
                      </li>
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>Vercel</strong>: 빠르고 안정적인 배포의 흐름
                      </li>
                    </ul>
                    <h5 className="text-white-force text-base-ko font-semibold mt-token-md">자동화의 흐름</h5>
                    <ul className="list-disc list-inside space-y-token-xs">
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>Make, n8n</strong>: 끊김 없는 업무 프로세스
                      </li>
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>Notion, Obsidian</strong>: 지식과 정보의 유기적 연결
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="text-white-force text-lg-ko font-semibold">🎯 전문 AI 서비스</h4>
                  <div className="space-y-token-sm">
                    <h5 className="text-white-force text-base-ko font-semibold">깊이 있는 분석</h5>
                    <ul className="list-disc list-inside space-y-token-xs">
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>Zenspike</strong>: 데이터에서 인사이트의 파동을 발견
                      </li>
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>Skywork</strong>: 복잡한 워크플로우를 자연스러운 흐름으로
                      </li>
                      <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                        <strong>Perplexcity</strong>: 스토리텔링에 몰입의 파동을 더하다
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-token-lg">
              <h3 className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Impact: 파동이 만드는 변화
              </h3>
              <h4 className="text-white-force text-lg-ko font-semibold">우리가 만든 흐름들</h4>
              <div className="space-y-token-md">
                <div>
                  <h5 className="text-white-force text-base-ko font-semibold">A사 에너지 전환</h5>
                  <blockquote className="text-white-force text-base-ko italic leading-relaxed tracking-ko-normal border-l-4 border-primary-400 pl-token-lg">
                    "Moonwave는 우리가 2030 탄소중립이라는 거대한 파동에 올라탈 수 있게 했습니다. 이제 우리만의 속도로, 하지만 확실하게 나아가고 있습니다."
                  </blockquote>
                </div>
                <div>
                  <h5 className="text-white-force text-base-ko font-semibold">B사 디지털 자동화</h5>
                  <blockquote className="text-white-force text-base-ko italic leading-relaxed tracking-ko-normal border-l-4 border-primary-400 pl-token-lg">
                    "반복 작업에 묶여있던 우리 팀이 이제는 창의적인 일에 집중합니다. 이것이 진짜 디지털 전환입니다."
                  </blockquote>
                </div>
                <div>
                  <h5 className="text-white-force text-base-ko font-semibold">C브랜드 감성 마케팅</h5>
                  <blockquote className="text-white-force text-base-ko italic leading-relaxed tracking-ko-normal border-l-4 border-primary-400 pl-token-lg">
                    "숫자를 쫓는 대신 진정성을 추구했더니, 오히려 더 큰 공명을 만들어냈습니다."
                  </blockquote>
                </div>
              </div>
            </div>

            <div className="space-y-token-lg">
              <h3 className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Values: 우리가 지키는 것
              </h3>
              <div className="space-y-token-md">
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-lg-ko">🌊</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">자신만의 파동</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      세상의 기준이 아닌, 각자의 고유함을 존중합니다
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-lg-ko">🎯</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">명료한 전략</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      복잡함 속에서 본질을 찾아 단순하게 만듭니다
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-lg-ko">💡</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">지속적인 혁신</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      멈추지 않되, 자신의 속도로 진화합니다
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-lg-ko">🤝</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">진정한 파트너십</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      함께 파동을 만들고 흐름을 이어갑니다
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-token-lg">
              <h3 className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Projects: 파동이 만드는 디지털 경험
              </h3>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                우리가 만들어가는 고유한 서비스들<br />
                Moonwave의 철학은 구체적인 디지털 서비스로 실현됩니다. 각 프로젝트는 특정한 삶의 영역에서 사용자가 자신만의 파동과 흐름을 만들 수 있도록 돕습니다.
              </p>
              <div className="space-y-token-md">
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-base-ko">•</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">Music Platform: music.moonwave.kr</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      Moonwave만의 감성음악 제작
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-base-ko">•</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">Travel Service: travel.moonwave.kr</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      Moonwave과 함께 세계여행
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-base-ko">•</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">Subscription Manager: sub.moonwave.kr</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      AI 서비스 중심의 구독 관리
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-base-ko">•</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">Crypto Trading: btc.moonwave.kr</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      Moonwave와 함께하는 크립토 매매
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-base-ko">•</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">Music Album: oh.moonwave.kr</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      국가대표 오안나 헌정 앨범
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-base-ko">•</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">Financial Strategy: financial.moonwave.kr</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      Moonwave와 함께하는 금융투자 전략
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-token-sm">
                  <span className="text-white-force text-base-ko">•</span>
                  <div>
                    <h4 className="text-white-force text-base-ko font-semibold">Kids Platform: lego.moonwave.kr</h4>
                    <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                      아이들과 함께 Lego 블럭 재사용 조립놀이
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-token-lg">
              <h3 className="text-white-force text-xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Join the Wave
              </h3>
              <h4 className="text-white-force text-lg-ko font-semibold">당신만의 파동을 찾고 계신가요?</h4>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                Moonwave는 당신이 세상의 속도에 휩쓸리지 않고, 자신만의 파동과 흐름을 만들 수 있도록 돕습니다.
              </p>
              <blockquote className="text-white-force text-lg-ko italic leading-relaxed tracking-ko-normal border-l-4 border-primary-400 pl-token-lg">
                "속도는 순간의 환호를 가져올지 모르나<br />
                파동과 흐름은 생존을 가져온다."
              </blockquote>
              <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                우리와 함께 당신만의 파동을 발견하고, 지속 가능한 흐름을 만들어가세요.
              </p>
              <div className="space-y-token-sm">
                <h4 className="text-white-force text-base-ko font-semibold">Contact Moonwave</h4>
                <ul className="list-disc list-inside space-y-token-xs">
                  <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                    Email: deasoung@gmail.com
                  </li>
                  <li className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                    Website: www.moonwave.kr
                  </li>
                </ul>
              </div>
              <div className="space-y-token-sm">
                <h4 className="text-white-force text-base-ko font-semibold">Moonwave HQ</h4>
                <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                  전략적 디지털 운영실에서 당신의 파동을 기다립니다.
                </p>
              </div>
              <div className="text-center space-y-token-sm">
                <p className="text-white-force text-sm-ko opacity-60 tracking-ko-normal">
                  *"We don't follow the waves, we create our own."*
                </p>
                <p className="text-white-force text-sm-ko opacity-60 tracking-ko-normal">
                  © 2025 Moonwave. All rights reserved.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center mt-token-xl">
            <WaveButton
              variant="ghost"
              onClick={onClose}
              className="wave-button-ghost-enhanced"
              aria-label="모달 닫기"
            >
              <ArrowLeft className="w-5 h-5" />
              닫기
            </WaveButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 