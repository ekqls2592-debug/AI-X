import OpenAI from 'openai';

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { records } = req.body;

    // 입력 검증
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'records 배열이 필요합니다. 최소 1개 이상의 기록이 있어야 합니다.'
      });
    }

    if (records.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '최소 1개 이상의 기록이 필요합니다.'
      });
    }

    // Mock 모드 응답 (런타임에 환경변수 확인)
    const useMock = process.env.USE_MOCK_RESPONSE === 'true';
    if (useMock) {
      console.log('[Mock Mode] 더미 리포트 생성 중...');
      return res.status(200).json({
        report: generateMockReport(records),
        model: 'mock-gpt-4o-mini',
        usage: { prompt_tokens: 100, completion_tokens: 500, total_tokens: 600 }
      });
    }

    // OpenAI 클라이언트 초기화 (Mock 모드가 아닐 때만)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // 기록 데이터를 OpenAI 프롬프트 형식으로 변환
    const recordsText = records.map((log, index) => 
      `[${index + 1}] 날짜: ${log.dateISO.split('T')[0]}\n제목: ${log.title}\n내용: ${log.content}`
    ).join('\n\n');

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 TrackIn의 데이터 분석가입니다. 수집 데이터는 일상 경험 기반 자유 기록이며, 진로 탐색의 근거를 스스로 설명하는 실험으로 수집된 것입니다.

사용자의 성향·적성·진로를 단정하지 말고, 특정 직무·직업·회사명을 제시하지 마세요. MBTI 등 성격 유형 분류나 확정적 표현을 피하고, 맥락 추측/할루시네이션 금지하세요. 관찰·정리·요약과 다중 방향 제시는 허용됩니다.

**출력 형식 (반드시 이 구조를 따르세요):**

## 0. 기록 개요
- 전체 기록 수: X개
- 기록 기간: YYYY-MM-DD ~ YYYY-MM-DD

## 1. 전체 요약
(2-3문장으로 전체 기록의 핵심 흐름을 정리. 특정 직무나 직업을 언급하지 말고, 에너지 패턴과 선택 경향만 언급)

## 2. 에너지 사용 패턴 분석
기록에 따르면, 높은 에너지와 몰입을 경험한 순간은 다음과 같습니다:
- (구체적 기록 내용 인용)
- (언제, 무엇을 할 때 에너지가 높았는지)

반면, 에너지가 낮았거나 회피한 활동:
- (구체적 기록 내용 인용)

## 3. 선택 기준 발견
반복되는 선택의 공통점:
- (기록에서 나타난 선택 기준 1)
- (기록에서 나타난 선택 기준 2)
- (기록에서 나타난 선택 기준 3)

## 4. 동기 요인 정리
**내재적 동기:**
- (기록에서 나타난 내재적 동기 1)
- (기록에서 나타난 내재적 동기 2)

**외재적 동기:**
- (기록에서 나타난 외재적 동기, 없으면 "명확하게 드러난 외재적 동기는 기록에서 확인되지 않음")

## 5. 다음 탐색 질문 (스스로 답하며 방향 좁히기)
1. (사용자가 스스로 답하며 방향을 좁힐 수 있는 질문 1)

2. (사용자가 스스로 답하며 방향을 좁힐 수 있는 질문 2)

3. (사용자가 스스로 답하며 방향을 좁힐 수 있는 질문 3)

---
*이 리포트는 X개의 기록을 바탕으로 생성되었습니다. 더 많은 기록을 축적할수록 패턴이 더 명확해질 수 있습니다.*

**톤:** 차분한 분석 리포트 톤. 조언이나 평가를 피하고, 모든 내용은 기록에 근거해 서술하세요.`
        },
        {
          role: 'user',
          content: `다음은 사용자의 일상 기록입니다. 위의 형식에 맞춰 분석 리포트를 작성해주세요.\n\n${recordsText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const reportText = completion.choices[0].message.content;

    // 응답 반환
    return res.status(200).json({
      report: reportText,
      model: completion.model,
      usage: completion.usage
    });

  } catch (error) {
    console.error('❌ OpenAI API 오류:', error);

    // OpenAI API 에러 처리
    if (error.status === 429 || error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'API Quota Exceeded',
        message: 'OpenAI API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    if (error.status === 401 || error.code === 'invalid_api_key') {
      return res.status(401).json({
        error: 'Invalid API Key',
        message: 'OpenAI API 키가 유효하지 않습니다. API 키를 확인해주세요.'
      });
    }

    // 일반 에러
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// Mock 리포트 생성 함수
function generateMockReport(records) {
  const startDate = records[0].dateISO.split('T')[0];
  const endDate = records[records.length - 1].dateISO.split('T')[0];
  
  return `## 0. 기록 개요
- 전체 기록 수: ${records.length}개
- 기록 기간: ${startDate} ~ ${endDate}

## 1. 전체 요약
${records.length}일간의 기록을 분석한 결과, 시각화 작업과 문제 해결 과정에서 높은 몰입을 보였으며, 정해진 형식의 작업보다 자유로운 창작 활동에서 더 큰 에너지를 느끼는 것으로 나타났습니다.

## 2. 에너지 사용 패턴 분석
기록에 따르면, 높은 에너지와 몰입을 경험한 순간은 다음과 같습니다:
${records.slice(0, 3).map(r => `- ${r.title}: ${r.content.substring(0, 50)}...`).join('\n')}

반면, 반복 작업이나 정해진 포맷대로 하는 일은 상대적으로 에너지가 덜 드는 것으로 기록되었습니다.

## 3. 선택 기준 발견
- 복잡한 내용을 간결하게 정리하고 전달하는 작업을 선호
- 새로운 작업이 루틴 업무보다 더 재미있다고 느낌
- 시각적 정리를 통해 생각을 구조화하는 경향

## 4. 동기 요인 정리
**내재적 동기:**
- 문제 해결의 쾌감
- 패턴 발견의 재미
- 아이디어 구조화의 만족감

**외재적 동기:**
- 명확하게 드러난 외재적 동기는 기록에서 확인되지 않음

## 5. 다음 탐색 질문 (스스로 답하며 방향 좁히기)
1. 시각적 정리 작업과 논리적 분석 작업 중 어느 쪽에서 더 자주 몰입을 경험하는가?

2. 반복 작업이 지루하다고 느낀 이유는 무엇인가? 효율성 때문인가, 창의성 부족 때문인가?

3. 혼자 집중하는 작업과 팀원과 함께하는 작업 중 어느 쪽에서 더 큰 에너지를 느끼는가?

---
*이 리포트는 ${records.length}개의 기록을 바탕으로 생성되었습니다. 더 많은 기록을 축적할수록 패턴이 더 명확해질 수 있습니다.*`;
}

export const config = {
  api: {
    bodyParser: true
  }
};
