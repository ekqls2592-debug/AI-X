# ⚡ TrackIn 빠른 시작 가이드

> 5분 안에 배포 완료하기

## 🎯 배포 전 준비물

- [ ] GitHub 계정
- [ ] Vercel 계정 (GitHub 계정으로 로그인 가능)
- [ ] OpenAI API Key (https://platform.openai.com/api-keys)
- [ ] Node.js 설치 (v18 이상)

---

## 🚀 1단계: 백엔드 배포 (2분)

```bash
# Vercel CLI 설치
npm install -g vercel

# backend 폴더로 이동
cd backend

# 배포
vercel login        # 브라우저에서 인증
vercel --prod      # Production 배포
```

**📝 배포 URL 복사**: `https://trackin-backend-xxxxx.vercel.app`

### 환경변수 설정
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택 > Settings > Environment Variables
3. 추가: `OPENAI_API_KEY` = `sk-proj-...`
4. 터미널에서 `vercel --prod` 재실행

---

## 🌐 2단계: 프론트엔드 배포 (3분)

```bash
# frontend 폴더로 이동
cd ../frontend

# app.js 파일 수정 (15번째 줄)
# API_ENDPOINT: 'https://trackin-backend-xxxxx.vercel.app/api/generate-report'

# Git 설정
git init
git add .
git commit -m "TrackIn demo"
git branch -M main

# GitHub 저장소 생성 후
git remote add origin https://github.com/YOUR-USERNAME/trackin-demo.git
git push -u origin main
```

### GitHub Pages 활성화
1. GitHub 저장소 > Settings > Pages
2. Source: `main` branch, `/ (root)` folder
3. Save
4. 1-2분 대기
5. URL 확인: `https://YOUR-USERNAME.github.io/trackin-demo/`

---

## ✅ 3단계: 테스트

1. 배포된 사이트 접속
2. write.html → 기록 5개 작성
3. report.html → "AI 리포트 생성하기" 클릭
4. 리포트 확인

### 빠른 테스트용 더미 데이터

브라우저 콘솔(F12)에서 실행:

```javascript
const demoLogs = [
    { id: Date.now() + '-1', dateISO: new Date('2026-02-01').toISOString(), title: '프로젝트 기획', content: '팀원들과 아이디어를 나누는 시간이 즐거웠다.' },
    { id: Date.now() + '-2', dateISO: new Date('2026-02-02').toISOString(), title: '코딩 몰입', content: '버그를 해결하는 과정에서 시간 가는 줄 몰랐다.' },
    { id: Date.now() + '-3', dateISO: new Date('2026-02-03').toISOString(), title: '피드백 분석', content: '사용자 피드백을 읽으면서 보람을 느꼈다.' },
    { id: Date.now() + '-4', dateISO: new Date('2026-02-04').toISOString(), title: '디자인 개선', content: 'UI 디자인을 개선하는 작업이 즐거웠다.' },
    { id: Date.now() + '-5', dateISO: new Date('2026-02-05').toISOString(), title: '발표 준비', content: '발표 자료를 준비하면서 스토리를 구성했다.' }
];
localStorage.setItem('trackin_logs_v1', JSON.stringify(demoLogs));
location.reload();
```

---

## 🐛 문제 해결

| 문제 | 해결 |
|------|------|
| CORS 에러 | `backend/vercel.json` 확인 → `vercel --prod` 재실행 |
| API 호출 실패 | `app.js`의 `API_ENDPOINT` URL 확인 |
| GitHub Pages 404 | Settings > Pages > Source 확인 → 1-2분 대기 |
| OpenAI API 에러 | Vercel 환경변수 `OPENAI_API_KEY` 확인 |

---

## 📚 상세 가이드

- 전체 배포 가이드: `DEPLOYMENT_GUIDE.md`
- 백엔드 가이드: `backend/README.md`
- 프론트엔드 가이드: `frontend/README.md`

---

## 🎉 완료!

배포된 사이트:
- Frontend: `https://YOUR-USERNAME.github.io/trackin-demo/`
- Backend: `https://trackin-backend-xxxxx.vercel.app/api/generate-report`

**대회 발표 화이팅! 🚀**
