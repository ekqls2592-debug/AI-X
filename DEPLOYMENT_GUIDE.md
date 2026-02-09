# 🚀 TrackIn 배포 완전 가이드

## 📋 배포 순서

**⚠️ 중요: 반드시 백엔드 먼저 배포한 후 프론트엔드를 배포하세요!**

1. 백엔드 배포 (Vercel) → API URL 획득
2. 프론트엔드 `app.js`에 API URL 설정
3. 프론트엔드 배포 (GitHub Pages)
4. 통합 테스트

---

## 1️⃣ 백엔드 배포 (Vercel Serverless Functions)

### Step 1: Vercel CLI 설치

```bash
# 전역 설치
npm install -g vercel

# 설치 확인
vercel --version
```

### Step 2: Vercel 로그인

```bash
vercel login

# 브라우저에서 인증 완료
```

### Step 3: 프로젝트 배포

```bash
# backend 폴더로 이동
cd backend

# 첫 배포
vercel

# 질문 답변:
# ? Set up and deploy "~/backend"? [Y/n] → Y
# ? Which scope do you want to deploy to? → (본인 계정 선택)
# ? Link to existing project? [y/N] → N
# ? What's your project's name? → trackin-backend
# ? In which directory is your code located? → ./
# ? Want to override the settings? [y/N] → N

# Production 배포
vercel --prod
```

### Step 4: 환경변수 설정

#### 방법 1: Vercel 대시보드 (권장)

1. https://vercel.com/dashboard 접속
2. `trackin-backend` 프로젝트 클릭
3. **Settings** 탭
4. **Environment Variables** 메뉴
5. 새 환경변수 추가:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-xxxxx...` (본인의 OpenAI API Key)
   - **Environments**: Production, Preview, Development 모두 체크
6. **Save** 클릭

#### 방법 2: CLI

```bash
vercel env add OPENAI_API_KEY

# 값 입력: sk-proj-xxxxx...
# 환경 선택: Production, Preview, Development
```

### Step 5: 환경변수 적용을 위한 재배포

```bash
vercel --prod
```

### Step 6: 배포 URL 확인 및 저장

배포 완료 후 다음과 같은 메시지가 출력됩니다:

```
✅  Production: https://trackin-backend-xxxxx.vercel.app [복사]
```

**📝 이 URL을 메모장에 복사해두세요!** (프론트엔드 설정에 필요)

API 엔드포인트:
```
https://trackin-backend-xxxxx.vercel.app/api/generate-report
```

### Step 7: API 테스트

```bash
# CURL 테스트
curl -X POST https://trackin-backend-xxxxx.vercel.app/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {"dateISO": "2026-01-01T00:00:00.000Z", "title": "테스트1", "content": "오늘은 프로젝트 기획을 했다."},
      {"dateISO": "2026-01-02T00:00:00.000Z", "title": "테스트2", "content": "코딩하는 시간이 즐거웠다."},
      {"dateISO": "2026-01-03T00:00:00.000Z", "title": "테스트3", "content": "팀원들과 회의했다."},
      {"dateISO": "2026-01-04T00:00:00.000Z", "title": "테스트4", "content": "버그를 해결했다."},
      {"dateISO": "2026-01-05T00:00:00.000Z", "title": "테스트5", "content": "발표 자료를 준비했다."}
    ]
  }'
```

**예상 응답**: (약 10-30초 소요)
```json
{
  "report": "전체 요약\n\n...(AI가 생성한 리포트)...",
  "model": "gpt-4o-mini",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 500,
    "total_tokens": 650
  }
}
```

✅ **백엔드 배포 완료!**

---

## 2️⃣ 프론트엔드 배포 (GitHub Pages)

### Step 1: app.js 파일 수정

```bash
# frontend 폴더로 이동
cd frontend

# app.js 파일 열기 (에디터 사용)
# nano app.js 또는 vim app.js
```

**수정할 부분** (약 15번째 줄):

```javascript
// 수정 전
API_ENDPOINT: 'https://your-vercel-project.vercel.app/api/generate-report',

// 수정 후 (Step 6에서 복사한 URL 사용)
API_ENDPOINT: 'https://trackin-backend-xxxxx.vercel.app/api/generate-report',
```

### Step 2: Git 초기화 (처음 한 번만)

```bash
# Git 초기화
git init

# 모든 파일 스테이징
git add .

# 첫 커밋
git commit -m "Initial commit: TrackIn frontend with API integration"

# 메인 브랜치로 이름 변경
git branch -M main
```

### Step 3: GitHub 저장소 생성

1. https://github.com/new 접속
2. **Repository name**: `trackin-demo`
3. **Public** 선택 (GitHub Pages는 Public 저장소만 무료)
4. **Create repository** 클릭

### Step 4: 원격 저장소 연결 및 푸시

```bash
# 원격 저장소 추가 (YOUR-USERNAME을 본인 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR-USERNAME/trackin-demo.git

# 푸시
git push -u origin main

# GitHub 로그인 필요 시 username/password(또는 token) 입력
```

### Step 5: GitHub Pages 활성화

1. GitHub 저장소 페이지 접속
   - `https://github.com/YOUR-USERNAME/trackin-demo`
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source** 섹션:
   - **Branch**: `main` 선택
   - **Folder**: `/ (root)` 선택
   - **Save** 버튼 클릭
5. 약 1-2분 대기 (배포 중)
6. 페이지 새로고침 후 상단에 URL 확인:
   ```
   ✅ Your site is published at https://YOUR-USERNAME.github.io/trackin-demo/
   ```

### Step 6: 배포 확인

브라우저에서 접속:
```
https://YOUR-USERNAME.github.io/trackin-demo/
```

✅ **프론트엔드 배포 완료!**

---

## 3️⃣ 통합 테스트

### 테스트 시나리오

#### 1. 홈 페이지 테스트
- [ ] 페이지 로드 확인
- [ ] "지금 시작하기" 버튼 클릭 → write.html 이동 확인
- [ ] 헤더 네비게이션 링크 작동 확인
- [ ] 브라우저 콘솔 에러 없음

#### 2. 기록 작성 테스트 (write.html)
- [ ] AI 질문 3개 표시됨
- [ ] "새로운 질문 받기" 클릭 시 질문 변경됨
- [ ] 질문 클릭 시 textarea에 자동 입력됨
- [ ] 제목 + 내용 입력 후 "저장하기" 클릭
- [ ] "✅ 기록이 저장되었습니다!" 알림 표시
- [ ] AI 응답 박스가 표시됨
- [ ] 하단 "최근 기록"에 방금 저장한 기록 표시
- [ ] 기록 5개 작성 (리포트 생성을 위해)

#### 3. 리포트 생성 테스트 (report.html)
- [ ] "현재 X개의 기록이 있습니다" 정확히 표시
- [ ] 5개 미만일 때 "AI 리포트 생성하기" 버튼 비활성화
- [ ] 5개 이상일 때 버튼 활성화
- [ ] "AI 리포트 생성하기" 클릭
- [ ] 로딩 상태 표시 (스피너 + "AI가 리포트를 생성하고 있습니다...")
- [ ] 약 10-30초 후 리포트 출력
- [ ] 리포트 내용 확인:
  - 전체 요약
  - 에너지 사용 패턴 분석
  - 선택 기준 발견
  - 동기 요인 정리
  - 다음 탐색 질문 3가지
- [ ] "✅ AI 리포트가 생성되었습니다!" 알림 표시

#### 4. 리포트 관리 테스트
- [ ] "최근 생성된 리포트 불러오기" 클릭 → 저장된 리포트 표시
- [ ] "리포트 삭제" 클릭 → 확인 대화상자 → 삭제됨
- [ ] 리포트 삭제 후 "불러오기" 클릭 → "저장된 리포트가 없습니다" 알림

#### 5. 브라우저 콘솔 확인
- [ ] F12 개발자 도구 열기
- [ ] Console 탭: JavaScript 에러 없음
- [ ] Network 탭: API 요청 성공 (200 OK)
- [ ] Application 탭 > Local Storage: 
  - `trackin_logs_v1` 확인
  - `trackin_report_v1` 확인

---

## 4️⃣ 문제 해결 (Troubleshooting)

### 🔴 백엔드 문제

#### 문제: `vercel` 명령어를 찾을 수 없음
```bash
# 해결: 전역 설치 확인
npm install -g vercel

# 또는 npx 사용
npx vercel
```

#### 문제: OpenAI API 호출 실패 (500 에러)
```bash
# 해결: 환경변수 확인
vercel env ls

# 로그 확인
vercel logs --follow

# 환경변수 재설정
vercel env add OPENAI_API_KEY
vercel --prod
```

#### 문제: CORS 에러
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**해결**: `backend/vercel.json` 확인
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### 🔴 프론트엔드 문제

#### 문제: GitHub Pages가 404 에러
**해결**:
1. Settings > Pages에서 Source 확인 (main branch, root folder)
2. 1-2분 대기 후 재시도
3. 브라우저 캐시 삭제 (Ctrl+Shift+R)

#### 문제: CSS/JS 파일 로드 안 됨
**해결**: 
- 모든 링크가 상대경로(`./`)로 시작하는지 확인
- `<link rel="stylesheet" href="./styles.css">`
- `<script src="./app.js"></script>`

#### 문제: API 호출 실패 (Network Error)
**해결**:
1. 브라우저 개발자 도구(F12) > Console 확인
2. `app.js`의 `CONFIG.API_ENDPOINT` 확인
3. 백엔드 URL이 정확한지 확인
4. 백엔드 API 테스트 (CURL)

#### 문제: LocalStorage 작동 안 함
**해결**:
- 브라우저 시크릿/프라이빗 모드에서는 LocalStorage 제한됨
- 일반 모드에서 테스트
- 다른 브라우저에서 테스트 (Chrome, Firefox, Edge)

---

## 5️⃣ 더미 데이터 주입 (테스트용)

리포트 생성을 빠르게 테스트하려면:

1. 배포된 사이트 접속
2. 브라우저 개발자 도구(F12) > Console 탭
3. 다음 코드 복사 & 실행:

```javascript
// 5개의 더미 기록 생성
const demoLogs = [
    {
        id: Date.now() + '-1',
        dateISO: new Date('2026-02-01').toISOString(),
        title: '프로젝트 기획 회의',
        content: '[AI 질문에 답변]\nQ: 오늘 하루 중 가장 에너지가 넘쳤던 순간은 언제였나요?\n\nA: 팀원들과 새로운 프로젝트를 기획하면서 아이디어를 나누는 시간이 가장 즐거웠다. 특히 내가 제안한 기능에 대해 팀원들이 긍정적인 반응을 보였을 때 뿌듯했다.'
    },
    {
        id: Date.now() + '-2',
        dateISO: new Date('2026-02-02').toISOString(),
        title: '코딩 몰입',
        content: '오늘은 혼자 조용히 코딩에 집중했다. 복잡한 버그를 해결하는 과정에서 시간 가는 줄 몰랐다. 문제를 해결했을 때의 성취감이 컸다.'
    },
    {
        id: Date.now() + '-3',
        dateISO: new Date('2026-02-03').toISOString(),
        title: '사용자 피드백 분석',
        content: '사용자들의 피드백을 읽으면서 우리 서비스가 실제로 도움이 되고 있다는 것을 알게 되어 보람찼다. 개선점을 찾는 것도 흥미로웠다.'
    },
    {
        id: Date.now() + '-4',
        dateISO: new Date('2026-02-04').toISOString(),
        title: 'UI 디자인 개선',
        content: 'UI 디자인을 개선하는 작업을 했다. 세부적인 것들을 조정하면서 완성도를 높이는 과정이 즐거웠다. 시각적으로 더 나아진 결과물을 보니 만족스러웠다.'
    },
    {
        id: Date.now() + '-5',
        dateISO: new Date('2026-02-05').toISOString(),
        title: '발표 준비',
        content: '대회 발표 자료를 준비했다. 우리 서비스의 가치를 어떻게 전달할지 고민하는 과정이 의미 있었다. 스토리를 구성하는 것이 재미있었다.'
    }
];

// LocalStorage에 저장
localStorage.setItem('trackin_logs_v1', JSON.stringify(demoLogs));

// 페이지 새로고침
alert('✅ 5개의 더미 기록이 생성되었습니다!');
location.reload();
```

4. write.html로 이동하여 기록 확인
5. report.html로 이동하여 리포트 생성 테스트

---

## 6️⃣ 대회 발표 준비

### 준비물
- [x] 배포된 사이트 URL (GitHub Pages)
- [x] 백엔드 API URL (Vercel)
- [x] 5개 이상의 기록 (더미 또는 실제)
- [x] 브라우저 콘솔 에러 0개 확인

### 발표 시나리오
1. **랜딩 페이지 소개** (30초)
   - "일상 기록으로 시작하는 진로 탐색"
   - "직무 추천이 아닌, 근거 언어화"
   
2. **기록 작성 시연** (1분)
   - AI 질문 클릭 → 자동 입력
   - 답변 작성 → 저장
   - AI 응답 시뮬레이션
   
3. **리포트 생성 시연** (2분)
   - 5개 기록 확인
   - "AI 리포트 생성하기" 클릭
   - 로딩 대기 (10-30초)
   - 리포트 결과 설명:
     * 에너지 사용 패턴
     * 선택 기준
     * 동기 요인
     * 다음 탐색 질문
   
4. **기술 스택 강조** (30초)
   - Vanilla JS (프레임워크 없음)
   - GitHub Pages (무료)
   - Vercel Serverless (무료)
   - OpenAI GPT-4o-mini

### 강조 포인트
- ✅ "직무 매칭이 아닌, 자기 이해를 돕는 서비스"
- ✅ "API Key 보호 (서버리스 백엔드)"
- ✅ "서버 관리 불필요 (Serverless)"
- ✅ "LocalStorage 기반 (프라이버시)"

---

## 📞 도움이 필요할 때

### Vercel 관련
- 공식 문서: https://vercel.com/docs
- Discord: https://vercel.com/discord

### GitHub Pages 관련
- 공식 문서: https://docs.github.com/pages
- 커뮤니티: https://github.community

### OpenAI API 관련
- API 문서: https://platform.openai.com/docs
- 커뮤니티: https://community.openai.com

---

## ✅ 최종 체크리스트

### 백엔드
- [ ] Vercel 배포 완료
- [ ] API URL 획득 및 저장
- [ ] 환경변수 `OPENAI_API_KEY` 설정
- [ ] CURL 테스트 성공
- [ ] CORS 설정 확인

### 프론트엔드
- [ ] `app.js`에 API URL 설정
- [ ] GitHub 저장소 생성
- [ ] Git 푸시 완료
- [ ] GitHub Pages 활성화
- [ ] 배포 URL 확인
- [ ] 모든 페이지 로드 확인
- [ ] 브라우저 콘솔 에러 없음

### 기능 테스트
- [ ] 기록 작성 기능
- [ ] AI 응답 시뮬레이션
- [ ] 기록 삭제 기능
- [ ] 리포트 생성 (5개 기록)
- [ ] 리포트 불러오기
- [ ] 리포트 삭제

### 발표 준비
- [ ] 더미 데이터 준비
- [ ] 시연 시나리오 연습
- [ ] 백업 계획 (로컬 버전)

---

**🎉 모든 준비 완료! 대회 발표 화이팅!**
