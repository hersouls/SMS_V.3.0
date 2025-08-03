import { Link } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import { ArrowLeft, FileText, Shield, User, Lock, AlertTriangle, Mail } from 'lucide-react';

export function TermsOfService() {

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Background Wave Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-secondary-900/20 to-primary-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="relative z-10 px-token-md py-token-2xl">
          <div className="max-w-4xl mx-auto">
            {/* Navigation */}
            <div className="mb-token-xl">
              <Link
                to="/"
                className="text-white-force hover:text-primary-400"
              >
                <ArrowLeft size={16} />
                <span>뒤로 가기</span>
              </Link>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-token-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 mb-token-lg shadow-lg">
                <FileText size={24} className="text-white-force icon-enhanced" />
              </div>
              <h1 className="text-4xl-ko font-bold text-white-force text-high-contrast mb-token-sm tracking-ko-normal">
                서비스 이용약관
              </h1>
              <p className="text-lg-ko text-white-force text-high-contrast tracking-ko-normal">
                sub.moonwave.kr 서비스 이용과 관련된 약관 및 개인정보처리방침
              </p>
              <div className="flex items-center justify-center space-x-token-md mt-token-lg">
                <div className="flex items-center space-x-token-xs">
                  <Shield size={16} className="text-success-400 icon-enhanced" />
                  <span className="text-sm-ko text-white-force text-high-contrast tracking-ko-normal">안전한 서비스</span>
                </div>
                <div className="flex items-center space-x-token-xs">
                  <Lock size={16} className="text-primary-400 icon-enhanced" />
                  <span className="text-sm-ko text-white-force text-high-contrast tracking-ko-normal">개인정보 보호</span>
                </div>
                <div className="flex items-center space-x-token-xs">
                  <User size={16} className="text-secondary-400 icon-enhanced" />
                  <span className="text-sm-ko text-white-force text-high-contrast tracking-ko-normal">사용자 중심</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-token-md pb-token-2xl">
        <div className="max-w-4xl mx-auto space-y-token-xl">
          
          {/* Service Terms Section */}
          <GlassCard variant="default" className="p-token-xl">
            <div className="space-y-token-lg">
              <div className="flex items-center space-x-token-sm mb-token-lg">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <FileText size={20} className="text-white-force icon-enhanced" />
                </div>
                <div>
                  <h2 className="text-2xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    sub.moonwave.kr 서비스 이용약관
                  </h2>
                  <p className="text-sm-ko text-white-force text-high-contrast tracking-ko-normal opacity-80">
                    시행일: 2025년 1월 1일
                  </p>
                </div>
              </div>

              <div className="space-y-token-lg text-base-ko text-white-force text-high-contrast tracking-ko-normal leading-relaxed">
                
                {/* 제1조 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    제1조 (목적)
                  </h3>
                  <p className="break-keep-ko">
                    이 약관은 문유(문대성)(이하 "운영자")가 제공하는 AI 서비스 구독 관리 플랫폼 sub.moonwave.kr(이하 "서비스")의 이용과 관련하여 운영자와 이용자의 권리, 의무 및 책임사항을 명확히 규정함을 목적으로 합니다.
                  </p>
                </div>

                {/* 제2조 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    제2조 (정의)
                  </h3>
                  <div className="space-y-token-sm">
                    <p className="break-keep-ko">
                      1. "서비스"란 운영자가 제공하는 AI 서비스 구독 관리 플랫폼과 이를 통해 제공되는 모든 기능을 의미합니다.
                    </p>
                    <p className="break-keep-ko">
                      2. "이용자"란 이 약관에 따라 운영자가 제공하는 서비스를 이용하기 위하여 본 약관에 동의하고 가입한 자를 의미합니다.
                    </p>
                    <p className="break-keep-ko">
                      3. "계정"이란 이용자가 서비스 이용 시 본인을 식별하고 접속할 수 있도록 이메일 주소와 비밀번호를 설정하여 생성한 로그인 정보를 의미합니다.
                    </p>
                  </div>
                </div>

                {/* 제3조 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    제3조 (약관의 효력 및 변경)
                  </h3>
                  <div className="space-y-token-sm">
                    <p className="break-keep-ko">
                      1. 본 약관은 이용자가 회원가입 시 동의함으로써 효력이 발생합니다.
                    </p>
                    <p className="break-keep-ko">
                      2. 운영자는 필요한 경우 「약관의 규제에 관한 법률」 및 기타 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.
                    </p>
                    <p className="break-keep-ko">
                      3. 약관이 변경될 경우 운영자는 변경된 약관의 시행일로부터 최소 7일 이전에 서비스 홈페이지 또는 이메일 등을 통해 공지합니다.
                    </p>
                    <p className="break-keep-ko">
                      4. 이용자가 약관 변경 고지 이후에도 서비스를 계속 사용할 경우 변경된 약관에 동의한 것으로 간주합니다.
                    </p>
                  </div>
                </div>

                {/* 제4조 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    제4조 (서비스의 제공 및 변경)
                  </h3>
                  <div className="space-y-token-sm">
                    <p className="break-keep-ko">
                      1. 운영자는 다음 서비스를 제공합니다:
                    </p>
                    <ul className="list-disc list-inside space-y-token-xs ml-token-md">
                      <li className="break-keep-ko">AI 서비스 구독 현황의 통합 관리</li>
                      <li className="break-keep-ko">구독 비용 분석 및 최적화 제안</li>
                      <li className="break-keep-ko">구독 갱신 일정 및 관련 알림</li>
                      <li className="break-keep-ko">AI 서비스 활용 관련 정보 제공</li>
                    </ul>
                    <p className="break-keep-ko">
                      2. 서비스는 연중무휴, 1일 24시간 제공을 원칙으로 합니다. 다만, 운영상의 이유나 기술적 유지보수를 위해 일시 중지될 수 있습니다.
                    </p>
                    <p className="break-keep-ko">
                      3. 운영자는 서비스의 품질 개선, 기술적 사유, 법적 이유 등으로 서비스의 내용을 변경할 수 있으며, 변경 사항은 미리 공지합니다.
                    </p>
                  </div>
                </div>

                {/* 제5조 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    제5조 (서비스 이용)
                  </h3>
                  <div className="space-y-token-sm">
                    <p className="break-keep-ko">
                      1. 서비스는 회원가입 절차를 통해 이용 가능하며, 현재 모든 기능은 무료로 제공됩니다.
                    </p>
                    <p className="break-keep-ko">
                      2. 이용자는 계정의 관리 책임이 있으며, 계정을 타인과 공유하거나 양도할 수 없습니다.
                    </p>
                    <p className="break-keep-ko">
                      3. 이용자는 다음 행위를 금지합니다:
                    </p>
                    <ul className="list-disc list-inside space-y-token-xs ml-token-md">
                      <li className="break-keep-ko">타인의 개인정보 도용 및 허위 정보 등록</li>
                      <li className="break-keep-ko">서비스의 안정적 운영을 방해하는 행위</li>
                      <li className="break-keep-ko">기타 대한민국 법률에 위반되는 행위</li>
                    </ul>
                  </div>
                </div>

                {/* 제6조 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    제6조 (저작권 및 지적재산권)
                  </h3>
                  <div className="space-y-token-sm">
                    <p className="break-keep-ko">
                      1. 서비스에 대한 저작권 및 기타 지적재산권은 운영자에게 귀속됩니다.
                    </p>
                    <p className="break-keep-ko">
                      2. 이용자가 서비스 내에서 생성한 콘텐츠의 저작권은 이용자 본인에게 있으며, 운영자는 서비스 운영에 필요한 범위 내에서만 이를 이용할 수 있습니다.
                    </p>
                  </div>
                </div>

                {/* 제7조 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    제7조 (책임 제한)
                  </h3>
                  <div className="space-y-token-sm">
                    <p className="break-keep-ko">
                      1. 운영자는 무료로 제공하는 서비스의 사용과 관련하여 발생하는 어떠한 손해에 대해서도 책임을 지지 않습니다.
                    </p>
                    <p className="break-keep-ko">
                      2. 천재지변, 정전, 인터넷 장애 등 불가항력적 사유로 인한 서비스 중단에 대해서도 책임지지 않습니다.
                    </p>
                    <p className="break-keep-ko">
                      3. 이용자의 서비스 이용으로 기대한 수익이나 효과가 발생하지 않은 것에 대해서 운영자는 책임지지 않습니다.
                    </p>
                  </div>
                </div>

                {/* 제8조 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    제8조 (분쟁 해결)
                  </h3>
                  <div className="space-y-token-sm">
                    <p className="break-keep-ko">
                      1. 서비스 이용과 관련한 분쟁 발생 시 우선 운영자와 이용자는 상호협의를 통해 해결합니다.
                    </p>
                    <p className="break-keep-ko">
                      2. 협의가 이루어지지 않을 경우, 분쟁은 대한민국 법률을 적용하며 관할 법원은 민사소송법에 따라 정합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Privacy Policy Section */}
          <GlassCard variant="default" className="p-token-xl">
            <div className="space-y-token-lg">
              <div className="flex items-center space-x-token-sm mb-token-lg">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center">
                  <Lock size={20} className="text-white-force icon-enhanced" />
                </div>
                <div>
                  <h2 className="text-2xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    sub.moonwave.kr 개인정보처리방침
                  </h2>
                  <p className="text-sm-ko text-white-force text-high-contrast tracking-ko-normal opacity-80">
                    시행일: 2025년 1월 1일
                  </p>
                </div>
              </div>

              <div className="space-y-token-lg text-base-ko text-white-force text-high-contrast tracking-ko-normal leading-relaxed">
                <p className="break-keep-ko">
                  운영자 문유(문대성)는 「개인정보 보호법」을 준수하여 이용자의 개인정보를 보호합니다.
                </p>

                {/* 1. 개인정보처리자 정보 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    1. 개인정보처리자 정보
                  </h3>
                  <ul className="list-disc list-inside space-y-token-xs ml-token-md">
                    <li className="break-keep-ko">개인정보처리자: 문유(문대성)</li>
                    <li className="break-keep-ko">서비스명: sub.moonwave.kr</li>
                    <li className="break-keep-ko">연락처: <a href="mailto:deasoung@gmail.com" className="text-primary-400 hover:text-primary-300 underline">deasoung@gmail.com</a></li>
                  </ul>
                </div>

                {/* 2. 개인정보 수집 항목 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    2. 개인정보 수집 항목
                  </h3>
                  <p className="break-keep-ko">
                    운영자는 서비스 제공을 위해 다음 개인정보를 수집합니다:
                  </p>
                  <div className="space-y-token-sm">
                    <div>
                      <h4 className="text-lg-ko font-medium text-white-force text-high-contrast tracking-ko-normal mb-token-xs">
                        필수 항목
                      </h4>
                      <ul className="list-disc list-inside space-y-token-xs ml-token-md">
                        <li className="break-keep-ko">이메일 주소, 비밀번호(암호화 저장), 서비스 이용 기록</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg-ko font-medium text-white-force text-high-contrast tracking-ko-normal mb-token-xs">
                        선택 항목
                      </h4>
                      <ul className="list-disc list-inside space-y-token-xs ml-token-md">
                        <li className="break-keep-ko">이용 중인 AI 서비스 목록, 구독 정보(서비스명, 시작일, 비용 등)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 3. 개인정보 수집 목적 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    3. 개인정보 수집 목적
                  </h3>
                  <ul className="list-disc list-inside space-y-token-xs ml-token-md">
                    <li className="break-keep-ko">회원 관리: 서비스 이용자 식별 및 인증</li>
                    <li className="break-keep-ko">서비스 제공: 구독 현황 관리 및 맞춤형 정보 제공</li>
                    <li className="break-keep-ko">서비스 개선: 이용 통계 분석 및 신규 기능 개발</li>
                  </ul>
                </div>

                {/* 4. 개인정보 보유 및 이용 기간 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    4. 개인정보 보유 및 이용 기간
                  </h3>
                  <div className="space-y-token-sm">
                    <p className="break-keep-ko">
                      • 회원 탈퇴 시 즉시 파기합니다.
                    </p>
                    <p className="break-keep-ko">
                      • 관계법령에 따라 필요한 경우 다음과 같이 보관합니다:
                    </p>
                    <ul className="list-disc list-inside space-y-token-xs ml-token-md">
                      <li className="break-keep-ko">서비스 이용 기록: 3년 (통신비밀보호법)</li>
                      <li className="break-keep-ko">로그인 기록: 3개월 (통신비밀보호법)</li>
                    </ul>
                  </div>
                </div>

                {/* 5. 개인정보 제3자 제공 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    5. 개인정보 제3자 제공
                  </h3>
                  <p className="break-keep-ko">
                    운영자는 원칙적으로 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않으며, 법률의 특별한 규정에 의한 경우에만 제공합니다.
                  </p>
                </div>

                {/* 6. 개인정보 안전성 확보 조치 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    6. 개인정보 안전성 확보 조치
                  </h3>
                  <ul className="list-disc list-inside space-y-token-xs ml-token-md">
                    <li className="break-keep-ko">비밀번호 암호화 저장</li>
                    <li className="break-keep-ko">해킹 방지 기술적 조치: 보안 프로그램 설치 및 정기적 점검</li>
                    <li className="break-keep-ko">접근 권한 제한: 운영자 외 접근 불가</li>
                  </ul>
                </div>

                {/* 7. 이용자의 권리 행사 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    7. 이용자의 권리 행사
                  </h3>
                  <p className="break-keep-ko">
                    이용자는 이메일(<a href="mailto:deasoung@gmail.com" className="text-primary-400 hover:text-primary-300 underline">deasoung@gmail.com</a>)을 통해 언제든지 개인정보의 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다.
                  </p>
                </div>

                {/* 8. 쿠키(Cookie) 운영 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    8. 쿠키(Cookie) 운영
                  </h3>
                  <p className="break-keep-ko">
                    운영자는 쿠키를 통해 이용자 맞춤형 서비스를 제공합니다.
                  </p>
                  <ul className="list-disc list-inside space-y-token-xs ml-token-md">
                    <li className="break-keep-ko">목적: 로그인 유지, 이용 행태 분석</li>
                    <li className="break-keep-ko">쿠키 거부 방법: 웹 브라우저 설정 변경을 통해 가능</li>
                    <li className="break-keep-ko">쿠키 거부 시 서비스 일부 기능 사용이 제한될 수 있습니다.</li>
                  </ul>
                </div>

                {/* 9. 개인정보처리방침 변경 */}
                <div className="space-y-token-sm">
                  <h3 className="text-xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    9. 개인정보처리방침 변경
                  </h3>
                  <p className="break-keep-ko">
                    개인정보처리방침 변경 시 시행 7일 전 서비스 웹사이트 및 이메일 등을 통해 고지합니다.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Disclaimer Section */}
          <GlassCard variant="default" className="p-token-xl">
            <div className="space-y-token-lg">
              <div className="flex items-center space-x-token-sm mb-token-lg">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white-force icon-enhanced" />
                </div>
                <div>
                  <h2 className="text-2xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    면책조항
                  </h2>
                  <p className="text-sm-ko text-white-force text-high-contrast tracking-ko-normal opacity-80">
                    서비스 이용 관련 안내
                  </p>
                </div>
              </div>

              <div className="space-y-token-lg text-base-ko text-white-force text-high-contrast tracking-ko-normal leading-relaxed">
                <div className="space-y-token-sm">
                  <p className="break-keep-ko">
                    1. 개인 운영 서비스로서 운영자 개인이 관리합니다.
                  </p>
                  <p className="break-keep-ko">
                    2. 서비스가 제공하는 정보는 참고용이며, 정확성이나 최신성을 보장하지 않습니다.
                  </p>
                  <p className="break-keep-ko">
                    3. 모든 서비스는 무료 제공이며, 이에 대한 품질 보증이나 지속적 제공 의무는 없습니다.
                  </p>
                  <p className="break-keep-ko">
                    4. 이용자는 중요 데이터를 별도 백업해야 하며, 데이터 손실에 대한 책임은 운영자에게 없습니다.
                  </p>
                  <p className="break-keep-ko">
                    5. 외부 서비스 연동 시 해당 서비스 이용약관이 별도로 적용됩니다.
                  </p>
                  <p className="break-keep-ko">
                    6. 개인 서비스 특성상 서비스는 예고 없이 중단될 수 있으며, 이로 인한 손해는 책임지지 않습니다.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Contact Section */}
          <GlassCard variant="default" className="p-token-xl">
            <div className="space-y-token-lg">
              <div className="flex items-center space-x-token-sm mb-token-lg">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-info-500 to-info-600 flex items-center justify-center">
                  <Mail size={20} className="text-white-force icon-enhanced" />
                </div>
                <div>
                  <h2 className="text-2xl-ko font-semibold text-white-force text-high-contrast tracking-ko-normal">
                    문의사항
                  </h2>
                  <p className="text-sm-ko text-white-force text-high-contrast tracking-ko-normal opacity-80">
                    궁금한 점이 있으시면 언제든 연락주세요
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-token-lg">
                <div className="space-y-token-sm">
                  <h3 className="text-lg-ko font-medium text-white-force text-high-contrast tracking-ko-normal">
                    운영자 정보
                  </h3>
                  <div className="space-y-token-xs text-base-ko text-white-force text-high-contrast tracking-ko-normal">
                    <p className="break-keep-ko">
                      <span className="font-medium">운영자:</span> 문유(문대성)
                    </p>
                    <p className="break-keep-ko">
                      <span className="font-medium">Email:</span>{' '}
                      <a href="mailto:deasoung@gmail.com" className="text-primary-400 hover:text-primary-300 underline">
                        deasoung@gmail.com
                      </a>
                    </p>
                    <p className="break-keep-ko">
                      <span className="font-medium">Website:</span>{' '}
                      <a href="http://www.moonwave.kr" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">
                        www.moonwave.kr
                      </a>
                    </p>
                  </div>
                </div>

                <div className="space-y-token-sm">
                  <h3 className="text-lg-ko font-medium text-white-force text-high-contrast tracking-ko-normal">
                    서비스 정보
                  </h3>
                  <div className="space-y-token-xs text-base-ko text-white-force text-high-contrast tracking-ko-normal">
                    <p className="break-keep-ko">
                      <span className="font-medium">서비스명:</span> sub.moonwave.kr
                    </p>
                    <p className="break-keep-ko">
                      <span className="font-medium">서비스 유형:</span> AI 구독 관리 플랫폼
                    </p>
                    <p className="break-keep-ko">
                      <span className="font-medium">제공 방식:</span> 무료 서비스
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-token-lg border-t border-white/20">
                <p className="text-center text-sm-ko text-white-force text-high-contrast tracking-ko-normal opacity-80">
                  © 2025 Moonwave by 문유(문대성). All rights reserved.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
} 