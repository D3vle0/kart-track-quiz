# Kart Track Quiz (카트라이더 트랙 맞히기)

카트라이더 트랙 이미지를 보고 트랙명을 맞히는 웹 퀴즈 게임입니다.

---

## 주요 기능
- **문제 수 선택**: 3문제부터 30문제까지 원하는 문항 수 설정 (프리셋 버튼 지원)
- **테마별 필터링**: 빌리지, 포레스트, 광산 등 원하는 테마만 선택하여 플레이 가능 (전체 선택/해제 지원)
- **유연한 정답 채점**: 공백 및 대소문자 차이를 허용하여 오타로 인한 억울한 오답 방지
- **편리한 UX**: Enter 키 입력 시 다음 문제로 자동 포커스 이동 및 부드러운 문제 풀이 경험
- **상세 결과 카드**: 퀴즈 완료 후 전체 점수와 함께 문항별 내 답변 / 정답 / 이미지 비교 확인
- **세션 기반 상태 격리**: 다중 접속자 간 데이터 충돌 없는 안전한 세션 관리 (`express-session`)

---

## 기술 스택
- **Runtime**: Node.js
- **Package Manager**: npm
- **Language**: TypeScript
- **Framework**: Express.js
- **Template Engine**: EJS
- **Session**: express-session

---

## 실행 방법

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행 (Watch & Hot Reload)
```bash
npm run dev
```

### 3. 프로덕션 빌드 및 실행
```bash
npm run build
npm start
```

서버가 실행되면 웹 브라우저에서 `http://localhost:3000`으로 접속하여 플레이할 수 있습니다.
*(기본 포트 3000이 사용 중일 경우 다음 포트로 자동 바인딩됩니다)*
