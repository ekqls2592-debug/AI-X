# TrackIn Backend - Vercel Serverless Functions

## 🚀 배포 방법

### 1. Vercel CLI 설치 및 로그인

```bash
# Vercel CLI 설치
npm install -g vercel

# Vercel 계정 로그인
vercel login
```

### 2. 프로젝트 배포

```bash
# backend 폴더로 이동
cd backend

# 의존성 설치 (선택사항 - Vercel이 자동으로 설치함)
npm install

# 프로젝트 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 3. 환경변수 설정

#### 방법 1: Vercel 대시보드 (권장)
1. https://vercel.com/dashboard 접속
2. 배포된 프로젝트 선택
3. **Settings** > **Environment Variables**
4. 다음 환경변수 추가:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-proj-...` (본인의 OpenAI API Key)
   - Environments: Production, Preview, Development 모두 체크

#### 방법 2: CLI
```bash
vercel env add OPENAI_API_KEY
# 값 입력 후 환경 선택
```

### 4. 재배포 (환경변수 적용)
```bash
vercel --prod
```

### 5. 배포 URL 확인
배포가 완료되면 다음과 같은 URL을 얻게 됩니다:
```
https://trackin-backend.vercel.app
```

API 엔드포인트:
```
POST https://trackin-backend.vercel.app/api/generate-report
```

## 🧪 API 테스트

### CURL 테스트
```bash
curl -X POST https://trackin-backend.vercel.app/api/generate-report \
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

### 예상 응답
```json
{
  "report": "...AI가 생성한 리포트...",
  "model": "gpt-4o-mini",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 500,
    "total_tokens": 650
  }
}
```

## 📝 프론트엔드 연동

배포 완료 후, 프론트엔드의 `app.js` 파일을 수정하세요:

```javascript
// frontend/app.js
const CONFIG = {
    // ...
    API_ENDPOINT: 'https://YOUR-PROJECT.vercel.app/api/generate-report', // 여기를 수정!
    // ...
};
```

## 🔒 보안 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] OpenAI API Key가 코드에 하드코딩되지 않음
- [ ] Vercel 환경변수에 `OPENAI_API_KEY` 설정 완료
- [ ] CORS 헤더가 올바르게 설정됨 (vercel.json)
- [ ] GitHub 저장소에 API Key가 노출되지 않음

## 🐛 트러블슈팅

### 배포 실패
- `npm install` 오류: Node.js 버전 확인 (권장: v18 이상)
- Vercel 권한 오류: `vercel login` 재실행

### API 호출 실패
- CORS 오류: `vercel.json`의 `Access-Control-Allow-Origin` 확인
- 401 Unauthorized: OpenAI API Key 확인
- 500 Internal Server Error: Vercel 로그 확인 (`vercel logs`)

### OpenAI API 오류
- `insufficient_quota`: OpenAI 계정 잔액 확인
- `invalid_api_key`: API Key 재발급 및 재설정
- Rate limit: 요청 속도 제한 확인

## 📊 Vercel 로그 확인

```bash
# 실시간 로그 확인
vercel logs --follow

# 특정 배포의 로그
vercel logs [deployment-url]
```

## 🔄 업데이트 배포

코드 수정 후:
```bash
vercel --prod
```

## 📌 참고 링크

- [Vercel 공식 문서](https://vercel.com/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Node.js OpenAI SDK](https://github.com/openai/openai-node)
