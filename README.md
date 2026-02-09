# 🎯 TrackIn - 일상 기록으로 시작하는 진로 탐색

> **대회 발표용 실전 데모 프로젝트**

TrackIn은 직무 추천이 아닌, 사용자의 일상 기록에서 에너지 사용 패턴, 선택 기준, 동기 요인을 발견하여 **스스로 방향을 설명할 수 있게 만드는** 진로 탐색 서비스입니다.

## ✨ 주요 특징

- 📝 **AI 질문 기반 기록**: 매일 AI가 제안하는 3가지 질문에 답하며 일상 경험 기록
- 🔍 **패턴 분석**: 5일 이상의 기록을 바탕으로 AI가 에너지 사용 패턴과 선택 기준 구조화
- 💡 **근거 언어화**: 직무 매칭이 아닌, 자기 이해를 돕는 근거 중심 리포트 제공
- 🎨 **순수 Vanilla Stack**: React/Vue 없이 HTML/CSS/JS만 사용 (프레임워크 제약 없음)
- 🔒 **API Key 보호**: OpenAI API는 서버리스 백엔드에서만 호출 (GitHub Pages 안전)

## 🏗️ 프로젝트 구조

```
trackin-demo/
├── backend/                    # Vercel Serverless Functions
│   ├── api/
│   │   └── generate-report.js # POST /api/generate-report
│   ├── package.json
│   ├── vercel.json            # CORS + 배포 설정
│   ├── .gitignore
│   ├── .env.example
│   └── README.md
│
└── frontend/                   # GitHub Pages 정적 사이트
    ├── index.html             # 랜딩 페이지
    ├── write.html             # 기록 작성
    ├── report.html            # AI 리포트 생성/조회
    ├── styles.css             # 전역 스타일
    ├── app.js                 # Vanilla JS (LocalStorage + API)
    └── README.md
```

## 🚀 빠른 시작

### 1️⃣ 백엔드 배포 (Vercel)

```bash
# backend 폴더로 이동
cd backend

# Vercel CLI 설치 및 로그인
npm install -g vercel
vercel login

# 배포
vercel --prod

# 환경변수 설정 (Vercel 대시보드)
# Settings > Environment Variables
# OPENAI_API_KEY=sk-proj-...
```

**배포된 API URL 예시**: `https://trackin-backend.vercel.app/api/generate-report`

### 2️⃣ 프론트엔드 배포 (GitHub Pages)

```bash
# frontend 폴더로 이동
cd frontend

# API 엔드포인트 수정
# app.js 파일에서 CONFIG.API_ENDPOINT를 배포된 Vercel URL로 변경

# Git 초기화 및 푸시
git init
git add .
git commit -m "Initial commit: TrackIn demo"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/trackin-demo.git
git push -u origin main

# GitHub Pages 활성화
# 저장소 Settings > Pages > Source: main branch
```

**배포된 사이트 URL 예시**: `https://YOUR-USERNAME.github.io/trackin-demo/`

## 🎯 핵심 기능

### 1. 일상 기록 (write.html)
- AI가 제안하는 3가지 질문 중 선택
- 질문 클릭 시 자동으로 텍스트 입력 영역에 삽입
- 기록 저장 시 AI 상담사의 따뜻한 응답
- LocalStorage 기반 (서버 불필요)

### 2. AI 리포트 생성 (report.html)
- 최소 5개의 기록 필요
- OpenAI GPT-4o-mini 모델 사용
- 출력 구조:
  1. 전체 요약
  2. 에너지 사용 패턴 분석
  3. 선택 기준 발견
  4. 동기 요인 정리
  5. 다음 탐색 질문 3가지

### 3. 데이터 관리
- LocalStorage에 기록 및 리포트 저장
- 기록 삭제 기능
- 리포트 불러오기/삭제 기능

## 🛠️ 기술 스택

### 프론트엔드
- **HTML5**: 시맨틱 태그 (header, main, footer)
- **CSS3**: CSS Variables, Flexbox, Grid
- **Vanilla JavaScript**: DOMContentLoaded, LocalStorage, Fetch API
- **배포**: GitHub Pages

### 백엔드
- **Node.js**: ES Modules
- **OpenAI SDK**: gpt-4o-mini 모델
- **Vercel Serverless Functions**: Edge Runtime
- **CORS**: 모든 Origin 허용 (또는 GitHub Pages 도메인만)

## 📊 데이터 구조

### LocalStorage 기록 (trackin_logs_v1)
```javascript
[
  {
    id: "1738957200000-abc123",
    dateISO: "2026-02-09T00:00:00.000Z",
    title: "프로젝트 기획 회의",
    content: "팀원들과 아이디어를 나누는 시간이 즐거웠다..."
  },
  // ...
]
```

### LocalStorage 리포트 (trackin_report_v1)
```javascript
{
  createdAtISO: "2026-02-09T12:00:00.000Z",
  sourceCount: 7,
  reportText: "전체 요약\n\n당신의 기록을 분석한 결과..."
}
```

## 🎬 데모 시연 시나리오

1. **랜딩 페이지**: "일상 기록으로 시작하는 진로 탐색" 컨셉 소개
2. **기록 작성**: AI 질문 클릭 → 답변 작성 → 저장 → AI 응답
3. **5개 기록 작성**: 빠르게 시연 (또는 더미 데이터 사용)
4. **리포트 생성**: 버튼 클릭 → 로딩 (10-30초) → 리포트 출력
5. **핵심 강조**: "직무 추천이 아닌, 근거 언어화"

## 🔒 보안 체크리스트

- ✅ OpenAI API Key는 Vercel 환경변수에만 저장
- ✅ 프론트엔드 코드에 API Key 노출 없음
- ✅ GitHub 저장소에 `.env` 파일 제외 (.gitignore)
- ✅ CORS 설정으로 허용된 도메인만 API 호출 가능
- ✅ LocalStorage 기반 (개인정보 서버 전송 없음)

## 🐛 트러블슈팅

### 백엔드 배포 실패
```bash
# Vercel 로그 확인
vercel logs --follow

# 환경변수 확인
vercel env ls
```

### 프론트엔드 404 에러
- GitHub Pages 설정 확인 (Settings > Pages)
- 상대경로 사용 확인 (`./index.html`, `./styles.css`)

### CORS 에러
- `vercel.json`의 `Access-Control-Allow-Origin` 확인
- API 엔드포인트 URL 정확성 확인

### API 호출 실패
```javascript
// 브라우저 개발자 도구 Console에서 확인
console.log(CONFIG.API_ENDPOINT);

// Network 탭에서 요청/응답 확인
```

## 📈 개선 아이디어 (시간 여유 시)

1. **더미 데이터 주입 버튼**: 테스트용 5개 기록 자동 생성
2. **리포트 다운로드**: TXT 파일로 내보내기
3. **다크모드**: 테마 토글 기능
4. **기록 수정**: 저장된 기록 편집 기능
5. **통계 대시보드**: 기록 개수, 에너지 패턴 시각화

## 📝 라이선스

MIT License - 대회 발표 및 포트폴리오 용도로 자유롭게 사용 가능

## 🙋 FAQ

**Q: 왜 React를 사용하지 않았나요?**
A: 대회 규정/제약이 있거나, Vanilla JS만으로 충분히 구현 가능한 서비스임을 증명하기 위해.

**Q: LocalStorage가 삭제되면 데이터가 사라지나요?**
A: 네. 프로덕션에서는 백엔드 DB 연동이 필요합니다. 이 프로젝트는 데모용입니다.

**Q: OpenAI API 비용은 얼마나 드나요?**
A: gpt-4o-mini 모델 기준, 1회 리포트 생성 시 약 $0.001-0.005 (약 1-7원).

**Q: 서버가 필요 없나요?**
A: 프론트엔드는 GitHub Pages (무료), 백엔드는 Vercel Serverless (무료 한도), 둘 다 서버 관리 불필요.

## 📞 문의

프로젝트 관련 문의는 GitHub Issues로 남겨주세요.

---

**🎉 대회 발표 화이팅!**
