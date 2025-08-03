# 🚀 Firebase 프로덕션 배포 가이드

**프로젝트:** Moonwave SMS V.3.0  
**마이그레이션:** Supabase → Firebase  
**배포 대상:** Production Environment

## 📋 배포 전 체크리스트

### ✅ 필수 준비사항
- [ ] Firebase Console 액세스 권한 확인
- [ ] 도메인 소유권 확인 (sub.moonwave.kr)
- [ ] Supabase 데이터 백업 완료
- [ ] Google OAuth 클라이언트 ID 준비
- [ ] SSL 인증서 설정 확인

### ✅ 환경 변수 확인
```bash
# .env 파일 프로덕션 설정 확인
VITE_FIREBASE_API_KEY=<프로덕션용 API 키>
VITE_FIREBASE_AUTH_DOMAIN=sms-v3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sms-v3
VITE_FIREBASE_STORAGE_BUCKET=sms-v3.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=278884646788
VITE_FIREBASE_APP_ID=1:278884646788:web:9f534ea0468581b16867d1
VITE_DEV_MODE=false
VITE_ENABLE_DEBUG=false
```

## 🔥 Phase 7: 프로덕션 배포

### 1단계: Firebase Console 설정

#### 1.1 Firestore 활성화
1. [Firebase Console](https://console.firebase.google.com) 접속
2. `sms-v3` 프로젝트 선택
3. **Build** > **Firestore Database** 메뉴 이동
4. **Create database** 클릭
5. **Start in production mode** 선택
6. 지역 선택: `asia-northeast3 (Seoul)`

#### 1.2 Authentication 설정
1. **Build** > **Authentication** 메뉴 이동
2. **Get started** 클릭
3. **Sign-in method** 탭에서 다음 활성화:
   - **Email/Password**: 사용 설정
   - **Email link (passwordless sign-in)**: 사용 설정
   - **Google**: 사용 설정 (OAuth 클라이언트 ID 등록)

#### 1.3 Google OAuth 설정
```bash
# Google Cloud Console에서 OAuth 클라이언트 설정
승인된 자바스크립트 원본:
- https://sub.moonwave.kr
- https://sms-v3.firebaseapp.com

승인된 리디렉션 URI:
- https://sub.moonwave.kr/auth-callback
- https://sms-v3.firebaseapp.com/auth-callback
```

### 2단계: Cloud Functions 배포

```bash
# 1. Functions 의존성 설치
cd functions
npm install

# 2. 함수 배포
firebase deploy --only functions

# 예상 출력:
✔ functions: Finished running predeploy script.
✔ functions[getUserSubscriptions(us-central1)]: Successful create operation.
✔ functions[createSubscription(us-central1)]: Successful create operation.
✔ functions[updateSubscription(us-central1)]: Successful create operation.
✔ functions[deleteSubscription(us-central1)]: Successful create operation.
✔ functions[getUserNotifications(us-central1)]: Successful create operation.
✔ functions[markNotificationAsRead(us-central1)]: Successful create operation.
✔ functions[getUserProfile(us-central1)]: Successful create operation.
✔ functions[getExchangeRates(us-central1)]: Successful create operation.
✔ functions[createPaymentNotifications(us-central1)]: Successful create operation.

Deploy complete!
```

### 3단계: Firestore Rules 및 인덱스 배포

```bash
# Security Rules 및 인덱스 배포
firebase deploy --only firestore:rules,firestore:indexes

# 예상 출력:
✔ firestore: rules file firestore.rules compiled successfully
✔ firestore: released rules firestore.rules to cloud.firestore
✔ firestore: deployed indexes in firestore.indexes.json successfully

Deploy complete!
```

### 4단계: 데이터 마이그레이션

#### 4.1 Dry Run 테스트
```bash
# 마이그레이션 테스트 (실제 데이터 변경 없음)
node scripts/supabase-to-firebase-migration.js --dry-run

# 예상 출력:
=== Supabase to Firebase 마이그레이션 시작 ===
모드: DRY RUN (테스트)
배치 크기: 500

사용자 마이그레이션 시작...
총 150명의 사용자를 마이그레이션합니다.
사용자 마이그레이션 완료: 성공 150, 실패 0

카테고리 마이그레이션 시작...
카테고리 마이그레이션 완료: 성공 8, 실패 0

구독 마이그레이션 시작...
구독 마이그레이션 완료: 성공 847, 실패 0

알림 마이그레이션 시작...
알림 마이그레이션 완료: 성공 1250, 실패 0

=== 마이그레이션 완료 ===
```

#### 4.2 실제 마이그레이션 실행
```bash
# ⚠️ 주의: 실제 데이터 마이그레이션 (되돌릴 수 없음)
node scripts/supabase-to-firebase-migration.js

# 진행 상황 모니터링
tail -f scripts/migration-2025-08-03.log
```

### 5단계: 프론트엔드 배포

#### 5.1 프로덕션 빌드
```bash
# 프로덕션 빌드 생성
npm run build

# 빌드 결과 확인
ls -la dist/
```

#### 5.2 Firebase Hosting 배포
```bash
# 호스팅 배포
firebase deploy --only hosting

# 예상 출력:
✔ hosting: Finished running predeploy script.
✔ hosting: 15 files uploaded.
Deploy complete!

Project Console: https://console.firebase.google.com/project/sms-v3/overview
Hosting URL: https://sms-v3.firebaseapp.com
```

### 6단계: 커스텀 도메인 설정

#### 6.1 도메인 연결
1. Firebase Console > **Hosting** 메뉴
2. **Add custom domain** 클릭
3. 도메인 입력: `sub.moonwave.kr`
4. 소유권 확인 TXT 레코드 DNS에 추가
5. A 레코드 설정 (Firebase IP 주소)

#### 6.2 DNS 설정 예시
```bash
# DNS 레코드 설정
Type: A
Name: sub
Value: <Firebase Hosting IP>
TTL: 3600

Type: CNAME
Name: www.sub
Value: sub.moonwave.kr
TTL: 3600
```

## 🔍 배포 후 검증

### ✅ 기능 테스트 체크리스트

#### 인증 시스템
- [ ] Magic Link 로그인 테스트
- [ ] Google OAuth 로그인 테스트
- [ ] 로그아웃 기능 확인
- [ ] 인증 상태 유지 확인

#### 구독 관리
- [ ] 구독 생성 기능
- [ ] 구독 목록 조회
- [ ] 구독 수정/삭제
- [ ] 실시간 데이터 동기화

#### 알림 시스템
- [ ] 알림 목록 표시
- [ ] 알림 읽음 처리
- [ ] 스케줄된 알림 생성 (다음날 확인)

#### 일반 기능
- [ ] 대시보드 로딩
- [ ] 통계 데이터 표시
- [ ] 환율 정보 조회
- [ ] PWA 설치 프롬프트

---

**배포 실행자:** SMS V.3.0 개발팀  
**배포 승인자:** 프로덕트 매니저  
**배포 일정:** 2025-08-03 (토) 오후 (트래픽 최소 시간대)  

> 🚀 **준비 완료!** 모든 준비가 완료되었습니다. 배포를 시작하세요!