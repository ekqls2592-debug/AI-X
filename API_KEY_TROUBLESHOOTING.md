# OpenAI API 키 문제 해결 가이드

## 현재 상황
- ✅ API 키가 .env 파일에 올바르게 저장됨
- ✅ 백엔드 코드가 API 키를 읽어오고 있음
- ❌ OpenAI API가 401 Unauthorized 에러 반환

## 401 에러의 원인

### 1. API 키 문제
- **만료된 키**: API 키가 비활성화되었거나 삭제됨
- **잘못된 키**: 키 복사 시 공백이나 줄바꿈이 포함됨
- **권한 부족**: 키에 필요한 권한이 없음

### 2. OpenAI 계정 문제
- **크레딧 부족**: 계정에 사용 가능한 크레딧이 없음
- **계정 정지**: 결제 문제나 정책 위반으로 계정 정지
- **무료 플랜 만료**: 무료 크레딧이 소진됨

## 해결 방법

### 단계 1: OpenAI 대시보드 확인
1. https://platform.openai.com/api-keys 접속
2. 현재 API 키가 목록에 있고 활성화되어 있는지 확인
3. 키 옆에 "Last used" 정보가 있는지 확인

### 단계 2: 크레딧 확인
1. https://platform.openai.com/usage 접속
2. 사용 가능한 크레딧이 있는지 확인
3. 무료 플랜의 경우 $5-$18 정도의 크레딧이 제공됨

### 단계 3: 새 API 키 발급 (필요시)
1. https://platform.openai.com/api-keys 에서 "Create new secret key" 클릭
2. 키 이름 입력 (예: "TrackIn Demo")
3. 생성된 키를 안전하게 복사 (한 번만 표시됨!)

### 단계 4: .env 파일 업데이트
```bash
cd /home/user/webapp/backend
nano .env
```

새 API 키로 교체:
```
OPENAI_API_KEY=sk-proj-새로운키여기
```

### 단계 5: 백엔드 서버 재시작
```bash
cd /home/user/webapp/backend
# 기존 서버 종료
pkill -f "node test-server.js"

# 서버 재시작
npm run dev
```

### 단계 6: 테스트
```bash
# 2초 후 테스트
sleep 2 && curl -X POST http://localhost:3001/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "dateISO": "2026-02-04T00:00:00.000Z",
        "title": "테스트 기록",
        "content": "오늘은 프로젝트를 진행했다. 재미있었다."
      }
    ]
  }'
```

## API 키 안전하게 관리하기

### 로컬 개발
```bash
# .env 파일에 저장 (이미 .gitignore에 포함됨)
OPENAI_API_KEY=your-key-here
```

### Vercel 배포
1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Environment Variables
3. `OPENAI_API_KEY` 추가
4. Value에 API 키 입력
5. Production/Preview/Development 모두 체크
6. Save

## 대안: OpenAI API 키 없이 테스트하기

API 키가 없거나 크레딧이 부족한 경우, 목(mock) 응답으로 테스트할 수 있습니다:

### backend/api/generate-report.js 수정
```javascript
// 파일 맨 위에 추가
const USE_MOCK_RESPONSE = process.env.USE_MOCK_RESPONSE === 'true';

// handler 함수 내부, OpenAI 호출 전에 추가
if (USE_MOCK_RESPONSE) {
  return res.status(200).json({
    report: `## 0. 기록 개요
- 전체 기록 수: ${records.length}개
- 기록 기간: ${records[0].dateISO.split('T')[0]} ~ ${records[records.length-1].dateISO.split('T')[0]}

## 1. 전체 요약
5일간의 기록을 분석한 결과, 시각화 작업과 문제 해결 과정에서 높은 몰입을 보였으며, 정해진 형식의 작업보다 자유로운 창작 활동에서 더 큰 에너지를 느끼는 것으로 나타났습니다.

## 2. 에너지 사용 패턴 분석
기록에 따르면, 높은 에너지와 몰입을 경험한 순간은 다음과 같습니다:
- 아이디어를 화이트보드에 정리하며 머릿속이 정리되는 순간
- 알고리즘 문제가 풀리는 짜릿한 순간
- 데이터에서 패턴을 찾는 작업

반면, 반복 작업이나 정해진 포맷대로 하는 일은 상대적으로 에너지가 덜 드는 것으로 기록되었습니다.

## 3. 선택 기준 발견
- 복잡한 내용을 간결하게 정리하고 전달하는 작업을 선호
- 새로운 작업이 루틴 업무보다 더 재미있다고 느낌
- 시각적 정리(화이트보드, 발표 자료)를 통해 생각을 구조화하는 경향

## 4. 동기 요인 정리
**내재적 동기:**
- 문제 해결의 쾌감 (알고리즘 풀이)
- 패턴 발견의 재미 (데이터 분석)
- 아이디어 구조화의 만족감 (기획, 발표)

**외재적 동기:**
- 명확하게 드러난 외재적 동기는 기록에서 확인되지 않음
- 팀원과의 협업 언급은 있으나 사회적 인정보다는 작업 자체에 초점

## 5. 다음 탐색 질문 (스스로 답하며 방향 좁히기)
1. 시각적 정리 작업(화이트보드, 발표 자료)과 논리적 분석 작업(데이터 패턴, 알고리즘) 중 어느 쪽에서 더 자주 몰입을 경험하는가?

2. 반복 작업이 지루하다고 느낀 이유는 무엇인가? 효율성 때문인가, 창의성 부족 때문인가, 아니면 다른 이유인가?

3. 혼자 집중하는 작업과 팀원과 함께하는 작업 중 어느 쪽에서 더 큰 에너지를 느끼는가? 기록에서 두 가지 모두 나타났는데, 각각의 장점은 무엇인가?

---
*이 리포트는 ${records.length}개의 기록을 바탕으로 생성되었습니다. 더 많은 기록을 축적할수록 패턴이 더 명확해질 수 있습니다.*`,
    model: 'mock-model',
    usage: { prompt_tokens: 100, completion_tokens: 500, total_tokens: 600 }
  });
}
```

### .env 파일에 추가
```
USE_MOCK_RESPONSE=true
```

## 문제가 계속되면

1. **OpenAI 계정 상태 확인**: support@openai.com 문의
2. **다른 API 키 시도**: 다른 OpenAI 계정이 있다면 테스트
3. **Mock 모드로 데모**: 위의 대안 사용

## 참고 링크
- OpenAI API Keys: https://platform.openai.com/api-keys
- OpenAI Usage: https://platform.openai.com/usage
- OpenAI Status: https://status.openai.com/
- OpenAI 문서: https://platform.openai.com/docs/

---

**현재 상태**: API 키 인증 실패 (401)
**다음 단계**: OpenAI 대시보드에서 키 상태 및 크레딧 확인 필요
