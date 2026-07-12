# Kotoba Tower — 言ノ葉の塔

일본어의 네 학습 영역을 성장시켜 전투 선택 없이 무한 탑을 오르는 세로형 자동전투 RPG입니다. 언어지식은 일반 공격력, 독해는 최대 체력, 청해는 속도와 선공권, 회화는 마법 피해로 정확히 연결됩니다. 1000층부터 모든 적은 마법 쉴드를 가집니다.

## 기술 스택과 실행 형태

- TypeScript strict, Vite, React 19, Phaser 4
- Zustand, Zod, Vitest, ESLint
- PWA(service worker + manifest), Capacitor Android
- 브라우저 저장은 localStorage, Android 저장은 Capacitor Preferences 어댑터를 사용합니다.

필요 환경은 Node.js 22.13 이상, npm 11 이상입니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다. 같은 네트워크의 휴대폰에서는 터미널에 표시된 Network 주소로 접속합니다.

## 검증 명령

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
```

프로덕션 PWA 결과는 `dist/`에 생성됩니다. 앱은 390×844를 기준으로 설계했고 360×800에서도 스크롤과 하단 safe-area를 유지합니다.

## Android APK

Android 프로젝트는 `android/`에 포함되어 있습니다. Android Studio와 Android SDK/JDK 21을 설치한 뒤 다음을 실행합니다.

```bash
npm install
npm run android:sync
npm run android:open
```

Android Studio에서 **Build > Build Bundle(s) / APK(s) > Build APK(s)** 를 선택합니다. 터미널만 사용할 때는 다음 명령으로 디버그 APK를 만듭니다.

```bash
npm run android:apk
```

결과 파일은 `android/app/build/outputs/apk/debug/app-debug.apk`입니다. 배포용 APK/AAB는 별도 서명 키가 필요합니다.

앱 ID는 `com.gameme.kotobatower`, 앱 이름은 `Kotoba Tower`이며 세로 방향으로 고정됩니다. Android 뒤로가기는 탑 이외 화면에서 탑으로 돌아가고, 탑에서는 앱을 최소화합니다. pause/resume은 Capacitor App 이벤트로 처리합니다.

## 아이콘과 스플래시 교체

원본 이미지를 아래 위치에 둡니다.

```text
assets/icon-only.png        1024×1024 투명 아이콘
assets/icon-foreground.png  1024×1024 Android 전경
assets/icon-background.png  1024×1024 Android 배경
assets/splash.png           2732×2732 스플래시
assets/splash-dark.png      2732×2732 다크 스플래시
```

그 뒤 생성 도구와 동기화를 실행합니다.

```bash
npx @capacitor/assets generate --android
npm run android:sync
```

현재 PWA 아이콘은 `public/icons/icon.svg`, 게임 교체 자산 안내는 `public/assets/README.md`에 있습니다.

## 게임 흐름

1. 시작 화면에서 탑에 입장하면 현재 층의 전투가 자동 시작됩니다.
2. 높은 속도가 선공하며 동속도는 플레이어가 먼저 공격합니다.
3. 승리하면 자동으로 다음 층에 진입하고, 패배나 80턴 제한이면 현재 층에서 멈춥니다.
4. 패배 분석은 선공, 양측 공격 횟수, 일반·마법 피해, 받은 피해, 쉴드 파괴 턴, 회복량과 남은 체력/쉴드를 보여줍니다.
5. 학습 화면에서 네 영역 중 하나에 임시 +50 XP를 추가하면 능력치가 오르고 해당 층에 자동 재도전합니다.

1000층 이상에서 쉴드가 남아 있으면 일반 피해는 완전히 차단되고 회화 기반 마법 피해만 쉴드에 적용됩니다. 쉴드를 깨뜨린 공격은 본체에 넘치지 않으며, 다음 공격부터 일반·마법 피해가 본체에 함께 적용됩니다.

## 지정 층 수동 검증

설정 → 개발용 디버그에서 다음 버튼을 사용합니다.

- 1F: 균형형, 쉴드 없음, 기본 자동전투
- 5F: 회복형, 지정 행동 주기 회복과 최대 턴 종료
- 999F: 일반 피해와 마법 피해가 본체에 함께 적용
- 1000F: 파란 쉴드가 일반 피해를 차단하고 마법 피해로만 파괴

디버그 화면의 진행도 초기화는 기기 저장을 지웁니다. 그 외에는 새로고침하거나 앱을 종료해도 스탯, 현재/최고층, 연승, 설정, 마지막 결과와 학습 XP가 복원됩니다.

## 구조

```text
src/domains/       프레임과 무관한 결정적 전투·학습 규칙
src/game/          계산된 BattleEvent를 재생하는 Phaser Scene과 연출
src/screens/       시작·탑·학습·성장·설정·디버그 모바일 화면
src/stores/        자동 진행과 Zustand 상태
src/services/      웹/Android 저장, 오디오, 햅틱 어댑터
src/schemas/       Zod 저장 데이터 검증
tests/             전투 규칙과 저장 복원 테스트
android/           Capacitor Android 프로젝트
```

서버, 로그인, 데이터베이스와 AI 문제 생성은 현재 포함하지 않으며, 이후 별도 서버를 추가해도 순수 도메인과 화면 계층을 유지할 수 있습니다.
