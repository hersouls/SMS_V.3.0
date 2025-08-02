import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { WaveBackground } from './WaveBackground';
import { AboutMoonwaveModal } from './AboutMoonwaveModal';
import { useApp } from '../App';
import {
  Heart,
  Brain,
  Rocket,
  Crown,
  Gift,
  CreditCard,
  Coins,
  Music,
  Globe,
  Zap,
  Target,
  Users,
  Activity,
  TrendingUp,
  Mail,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { cn } from './ui/utils';

export function AboutUs() {
  const { } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const services = [
    {
      name: 'Music Platform',
      url: 'music.moonwave.kr',
      description: 'Moonwave만의 감성음악 제작',
      icon: Music,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Travel Service',
      url: 'travel.moonwave.kr',
      description: 'Moonwave과 함께 세계여행',
      icon: Globe,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Subscription Manager',
      url: 'sub.moonwave.kr',
      description: 'AI 서비스 중심의 구독 관리',
      icon: CreditCard,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Crypto Trading',
      url: 'btc.moonwave.kr',
      description: 'Moonwave와 함께하는 크립토 매매',
      icon: Coins,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'Music Album',
      url: 'oh.moonwave.kr',
      description: '국가대표 오안나 헌정 앨범',
      icon: Gift,
      color: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Financial Strategy',
      url: 'financial.moonwave.kr',
      description: 'Moonwave와 함께하는 금융투자 전략',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Kids Platform',
      url: 'lego.moonwave.kr',
      description: '아이들과 함께 Lego 블럭 재사용 조립놀이',
      icon: Crown,
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const values = [
    {
      title: '자신만의 파동',
      description: '세상의 기준이 아닌, 각자의 고유함을 존중합니다',
      icon: Heart,
      color: 'from-red-500 to-pink-500'
    },
    {
      title: '명료한 전략',
      description: '복잡함 속에서 본질을 찾아 단순하게 만듭니다',
      icon: Target,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: '지속적인 혁신',
      description: '멈추지 않되, 자신의 속도로 진화합니다',
      icon: Rocket,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      title: '진정한 파트너십',
      description: '함께 파동을 만들고 흐름을 이어갑니다',
      icon: Users,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const technologies = [
    {
      category: 'AI가 만드는 공명',
      items: [
        { name: 'GPT-4, Claude, Gemini', description: '전략적 사고의 파트너' },
        { name: 'SUNO AI', description: '텍스트를 음악의 파동으로' },
        { name: 'Sora', description: '상상을 시각적 파동으로' }
      ],
      icon: Brain,
      color: 'from-purple-500 to-pink-500'
    },
    {
      category: '흐름을 만드는 인프라',
      items: [
        { name: 'Supabase, Firebase', description: '실시간으로 흐르는 데이터' },
        { name: 'Vercel', description: '빠르고 안정적인 배포의 흐름' },
        { name: 'Make, n8n', description: '끊김 없는 업무 프로세스' }
      ],
      icon: Zap,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      category: '전문 AI 서비스',
      items: [
        { name: 'Zenspike', description: '데이터에서 인사이트의 파동을 발견' },
        { name: 'Skywork', description: '복잡한 워크플로우를 자연스러운 흐름으로' },
        { name: 'Perplexcity', description: '스토리텔링에 몰입의 파동을 더하다' }
      ],
      icon: Crown,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen relative">
      <WaveBackground />
      <Header />

      <main className="pt-28 pb-token-xl px-token-md relative z-10">
        <div className="max-w-7xl mx-auto space-y-token-xl">
          
          {/* Hero Section */}
          <div className="text-center space-y-token-lg">
            <GlassCard variant="strong" className="p-token-2xl glass-breathe hover-card-strong transition-smooth transform-gpu will-change-transform">
              <div className="space-y-token-lg">
                {/* Logo and Brand */}
                <div className="flex items-center justify-center gap-token-sm">
                  <img 
                    src="/music/moowave.png" 
                    alt="Moonwave Logo" 
                    className="w-16 h-16 object-cover"
                  />
                  <div>
                    <h1 className="text-white-force text-5xl-ko font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Moonwave
                    </h1>
                    <p className="text-white-force text-lg-ko opacity-80 tracking-ko-normal">
                      당신만의 파동과 흐름으로 만드는 디지털 혁신
                    </p>
                  </div>
                </div>

                {/* Philosophy Quote */}
                <div className="space-y-token-md">
                  <blockquote className="text-white-force text-xl-ko italic leading-relaxed tracking-ko-normal">
                    "세상이 만들어낸 속도는 나의 기준이 될 수 없으며,<br />
                    타인의 걸음은 나의 존재를 설명할 수 없다.<br />
                    나는 오직 나만의 파동으로, 나만의 흐름으로 존재한다."
                  </blockquote>
                  <p className="text-white-force text-sm-ko opacity-60 tracking-ko-normal">
                    Moonwave는 이 철학에서 시작되었습니다.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* About Moonwave 전문 Section */}
          <div className="space-y-token-lg">
            <GlassCard variant="light" className="p-token-2xl hover-card-subtle transition-smooth transform-gpu will-change-transform">
              <div className="space-y-token-xl">
                <div className="text-center space-y-token-sm">
                  <h2 className="text-white-force text-3xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                    About Moonwave 전문
                  </h2>
                  <p className="text-white-force text-lg-ko opacity-80 tracking-ko-normal">
                    Moonwave의 철학과 가치에 대해 더 자세히 알아보세요
                  </p>
                </div>

                <div className="text-center space-y-token-md">
                  <p className="text-white-force text-base-ko opacity-90 leading-relaxed tracking-ko-normal">
                    Moonwave는 세상의 기준이 아닌, 각자의 고유한 파동과 흐름으로 움직이는 디지털 혁신을 만들어갑니다.
                  </p>
                  <WaveButton
                    variant="primary"
                    onClick={() => setIsModalOpen(true)}
                    className="wave-button-primary-enhanced"
                  >
                    자세히 보기
                  </WaveButton>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Philosophy Section */}
          <div className="space-y-token-lg">
            <GlassCard variant="light" className="p-token-xl hover-card-subtle transition-smooth transform-gpu will-change-transform">
              <div className="space-y-token-lg">
                <div className="text-center space-y-token-sm">
                  <h2 className="text-white-force text-3xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                    Philosophy: 파동(Wave)과 흐름(Flow)
                  </h2>
                  <p className="text-white-force text-lg-ko opacity-80 tracking-ko-normal">
                    우리가 믿는 것
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-token-lg">
                  <div className="space-y-token-md p-token-lg bg-white/5 rounded-xl">
                    <div className="flex items-center gap-token-sm">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Zap className="text-white text-xl" />
                      </div>
                      <h3 className="text-white-force text-xl-ko font-semibold">파동(Wave)</h3>
                    </div>
                    <p className="text-white-force text-base-ko leading-relaxed tracking-ko-normal">
                      각자가 가진 고유한 내적 철학과 감성의 진동입니다. 이는 남과 비교할 수 없는, 오직 자신만의 존재 방식입니다.
                    </p>
                  </div>

                  <div className="space-y-token-md p-token-lg bg-white/5 rounded-xl">
                    <div className="flex items-center gap-token-sm">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Activity className="text-white text-xl" />
                      </div>
                      <h3 className="text-white-force text-xl-ko font-semibold">흐름(Flow)</h3>
                    </div>
                    <p className="text-white-force text-base-ko leading-relaxed tracking-ko-normal">
                      그 파동을 현실에서 실현하는 전략과 실행의 연결입니다. 끊임없이 움직이되, 자신만의 속도로 흐르는 것입니다.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Values Section */}
          <div className="space-y-token-lg">
            <div className="text-center">
              <h2 className="text-white-force text-3xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Values: 우리가 지키는 것
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-token-lg">
              {values.map((value, index) => (
                <GlassCard 
                  key={value.title}
                  variant="light" 
                  className={cn(
                    "p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform",
                    "fade-in-up"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-token-md text-center">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mx-auto", `bg-gradient-to-r ${value.color}`)}>
                      <value.icon className="text-white text-2xl" />
                    </div>
                    <h3 className="text-white-force text-lg-ko font-semibold">{value.title}</h3>
                    <p className="text-white-force text-sm-ko opacity-80 leading-relaxed tracking-ko-normal">
                      {value.description}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-token-lg">
            <div className="text-center">
              <h2 className="text-white-force text-3xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Projects: 파동이 만드는 디지털 경험
              </h2>
              <p className="text-white-force text-lg-ko opacity-80 tracking-ko-normal mt-token-sm">
                우리가 만들어가는 고유한 서비스들
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-lg">
              {services.map((service, index) => (
                <GlassCard 
                  key={service.name}
                  variant="light" 
                  className={cn(
                    "p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform",
                    "fade-in-up"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-token-md">
                    <div className="flex items-center justify-between">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg", `bg-gradient-to-r ${service.color}`)}>
                        <service.icon className="text-white text-xl" />
                      </div>
                      <ExternalLink className="text-white/60 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white-force text-lg-ko font-semibold mb-token-xs">{service.name}</h3>
                      <p className="text-white-force text-sm-ko opacity-80 leading-relaxed tracking-ko-normal mb-token-sm">
                        {service.description}
                      </p>
                      <p className="text-primary-400 text-xs-ko font-medium tracking-ko-normal">
                        {service.url}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Technology Section */}
          <div className="space-y-token-lg">
            <div className="text-center">
              <h2 className="text-white-force text-3xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Technology: 파동을 실현하는 도구들
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-token-lg">
              {technologies.map((tech, index) => (
                <GlassCard 
                  key={tech.category}
                  variant="light" 
                  className={cn(
                    "p-token-lg hover-card-subtle transition-smooth transform-gpu will-change-transform",
                    "fade-in-up"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-token-md">
                    <div className="flex items-center gap-token-sm">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", `bg-gradient-to-r ${tech.color}`)}>
                        <tech.icon className="text-white text-lg" />
                      </div>
                      <h3 className="text-white-force text-lg-ko font-semibold">{tech.category}</h3>
                    </div>
                    <div className="space-y-token-sm">
                      {tech.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="p-token-sm bg-white/5 rounded-lg">
                          <p className="text-white-force text-sm-ko font-medium">{item.name}</p>
                          <p className="text-white-force text-xs-ko opacity-70 tracking-ko-normal">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-token-lg">
            <GlassCard variant="strong" className="p-token-2xl glass-breathe hover-card-strong transition-smooth transform-gpu will-change-transform">
              <div className="text-center space-y-token-lg">
                <div>
                  <h2 className="text-white-force text-3xl-ko font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                    Join the Wave
                  </h2>
                  <p className="text-white-force text-lg-ko opacity-80 tracking-ko-normal mt-token-sm">
                    당신만의 파동을 찾고 계신가요?
                  </p>
                </div>

                <div className="space-y-token-md">
                  <blockquote className="text-white-force text-xl-ko italic leading-relaxed tracking-ko-normal">
                    "속도는 순간의 환호를 가져올지 모르나<br />
                    파동과 흐름은 생존을 가져온다."
                  </blockquote>
                  <p className="text-white-force text-base-ko opacity-80 tracking-ko-normal">
                    Moonwave는 당신이 세상의 속도에 휩쓸리지 않고, 자신만의 파동과 흐름을 만들 수 있도록 돕습니다.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-token-md">
                  <WaveButton
                    variant="primary"
                    onClick={() => window.location.href = 'mailto:deasoung@gmail.com'}
                    className="wave-button-primary-enhanced"
                  >
                    <Mail className="w-5 h-5" />
                    Contact Moonwave
                  </WaveButton>
                  
                  <WaveButton
                    variant="secondary"
                    onClick={() => window.open('https://www.moonwave.kr', '_blank')}
                    className="wave-button-secondary-enhanced"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Visit Website
                  </WaveButton>
                </div>

                <div className="text-center space-y-token-sm">
                  <p className="text-white-force text-sm-ko opacity-60 tracking-ko-normal">
                    Moonwave HQ
                  </p>
                  <p className="text-white-force text-sm-ko opacity-80 tracking-ko-normal">
                    전략적 디지털 운영실에서 당신의 파동을 기다립니다.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Back to Home */}
          <div className="flex justify-center">
            <WaveButton
              variant="ghost"
              onClick={() => window.history.back()}
              className="wave-button-ghost-enhanced"
            >
              <ArrowLeft className="w-5 h-5" />
              뒤로 가기
            </WaveButton>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* About Moonwave Modal */}
      <AboutMoonwaveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
} 