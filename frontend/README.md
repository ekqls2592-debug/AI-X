# TrackIn Frontend - GitHub Pages 배포

## 📁 프로젝트 구조

```
frontend/
├── index.html      # 랜딩/홈 페이지
├── write.html      # 기록 작성 페이지
├── report.html     # AI 리포트 페이지
├── styles.css      # 전역 스타일시트
└── app.js          # Vanilla JavaScript (LocalStorage + API 호출)
```

## 🚀 GitHub Pages 배포 방법

### 1. GitHub 저장소 생성

1. GitHub에서 새 저장소 생성: `trackin-demo`
2. Public 저장소로 생성

### 2. Git 초기화 및 푸시

```bash
# frontend 폴더로 이동
cd frontend

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: TrackIn frontend demo"

# 메인 브랜치 설정
git branch -M main

# 원격 저장소 연결 (본인의 GitHub username으로 변경)
git remote add origin https://github.com/YOUR-USERNAME/trackin-demo.git

# 푸시
git push -u origin main
```

### 3. GitHub Pages 활성화

1. GitHub 저장소 페이지 접속
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source** 섹션에서:
   - Branch: `main` 선택
   - Folder: `/ (root)` 선택
   - **Save** 클릭
5. 약 1-2분 후 배포 완료
6. 배포된 URL 확인: `https://YOUR-USERNAME.github.io/trackin-demo/`

### 4. API 엔드포인트 설정

백엔드 배포 완료 후, `app.js` 파일을 수정하세요:

```javascript
// app.js 파일 상단 부분
const CONFIG = {
    STORAGE_KEYS: {
        LOGS: 'trackin_logs_v1',
        REPORT: 'trackin_report_v1',
    },
    API_ENDPOINT: 'https://YOUR-VERCEL-PROJECT.vercel.app/api/generate-report', // ⚠️ 여기를 수정!
    MIN_RECORDS_FOR_REPORT: 5,
    // ...
};
```

수정 후 다시 커밋 및 푸시:
```bash
git add app.js
git commit -m "Update API endpoint"
git push
```

## 🧪 로컬 테스트

배포 전 로컬에서 테스트하려면:

```bash
# Python 3 사용
cd frontend
python3 -m http.server 8000

# 또는 Node.js 사용
npx http-server -p 8000
```

브라우저에서 `http://localhost:8000` 접속

## ✅ 배포 확인 체크리스트

### 프론트엔드
- [ ] 모든 페이지가 상대경로(`./`)로 링크됨
- [ ] `index.html`, `write.html`, `report.html` 정상 로드
- [ ] 헤더/푸터가 모든 페이지에서 동일
- [ ] CSS 스타일이 정상 적용됨
- [ ] 브라우저 콘솔에 에러 없음

### 기능 테스트
- [ ] **홈 페이지**: 모든 링크 작동
- [ ] **기록하기 페이지**:
  - [ ] AI 질문 3개 무작위 표시
  - [ ] 질문 클릭 시 textarea에 자동 입력
  - [ ] "새로운 질문 받기" 버튼 작동
  - [ ] 기록 저장 후 LocalStorage에 저장됨
  - [ ] AI 응답 시뮬레이션 표시
  - [ ] 최근 기록 목록 표시
  - [ ] 기록 삭제 기능 작동
- [ ] **리포트 페이지**:
  - [ ] 기록 개수 표시
  - [ ] 5개 미만일 때 생성 버튼 비활성화
  - [ ] 5개 이상일 때 생성 버튼 활성화
  - [ ] (백엔드 연동 후) 리포트 생성 기능
  - [ ] 리포트 불러오기 기능
  - [ ] 리포트 삭제 기능

### 백엔드 연동 테스트 (배포 후)
- [ ] API 엔드포인트가 올바르게 설정됨
- [ ] CORS 에러 없이 API 호출 성공
- [ ] 리포트 생성 시 로딩 상태 표시
- [ ] 리포트 생성 완료 후 결과 표시
- [ ] 에러 발생 시 에러 메시지 표시

## 🎯 데모 시연 준비

### 더미 데이터 생성 (선택사항)

브라우저 개발자 도구 콘솔에서 실행:

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
        title: '디자인 작업',
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
location.reload();
```

## 📱 반응형 디자인

- 데스크톱: 최적화된 레이아웃
- 태블릿: 768px 이하에서 적응형 레이아웃
- 모바일: 세로 스크롤, 버튼 풀 너비

## 🔒 보안 고려사항

- ✅ 모든 데이터는 클라이언트 LocalStorage에 저장
- ✅ OpenAI API Key는 프론트엔드 코드에 노출되지 않음
- ✅ API 호출은 백엔드 서버리스 함수를 통해서만 수행
- ✅ GitHub 저장소에 민감한 정보 없음

## 🐛 트러블슈팅

### GitHub Pages가 404 에러
- 저장소 Settings > Pages에서 Source가 올바르게 설정되었는지 확인
- 배포 완료까지 1-2분 대기
- 브라우저 캐시 삭제 후 재시도

### CSS/JS 파일 로드 실패
- 모든 링크가 상대경로(`./`)로 시작하는지 확인
- 파일명 대소문자 확인 (Linux는 대소문자 구분)

### LocalStorage 작동 안 함
- 브라우저의 프라이빗 모드에서는 LocalStorage가 제한될 수 있음
- 다른 브라우저에서 테스트

### API 호출 CORS 에러
- 백엔드 `vercel.json`의 CORS 설정 확인
- API 엔드포인트 URL이 정확한지 확인
- 브라우저 개발자 도구의 Network 탭에서 요청/응답 확인

## 📊 브라우저 콘솔 로그

개발 중에는 브라우저 개발자 도구(F12)를 열어서:
- Console: JavaScript 에러 확인
- Network: API 요청/응답 확인
- Application > Local Storage: 저장된 데이터 확인

## 🎉 배포 완료!

배포가 완료되면 다음 URL에서 접속 가능:
```
https://YOUR-USERNAME.github.io/trackin-demo/
```

대회 발표 시 이 URL을 공유하세요!

## 📌 참고 링크

- [GitHub Pages 공식 문서](https://docs.github.com/pages)
- [LocalStorage API](https://developer.mozilla.org/ko/docs/Web/API/Window/localStorage)
- [Fetch API](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API)
