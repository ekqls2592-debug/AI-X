# TrackIn 시스템 아키텍처 분석
**AI 에이전트 프레임워크 관점에서의 구성요소 분석**

작성일: 2026-02-09  
버전: 1.4.0

---

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [핵심 구성요소](#핵심-구성요소)
3. [데이터 플로우](#데이터-플로우)
4. [AI 에이전트 아키텍처](#ai-에이전트-아키텍처)
5. [컴포넌트 관계도](#컴포넌트-관계도)
6. [기술 스택](#기술-스택)

---

## 🎯 시스템 개요

### 시스템 목적
**TrackIn**은 일상 기록을 통한 진로 탐색 지원 플랫폼으로, AI 에이전트가 사용자의 행동 패턴을 분석하고 인사이트를 제공하는 **자기 인식 강화 프레임워크**입니다.

### 핵심 컨셉
```
사용자 일상 기록 → AI 패턴 분석 → 구조화된 리포트 → 자기 이해 증진
```

### 아키텍처 패러다임
- **클라이언트-서버 분리형**: Frontend (Client-side) + Backend (Serverless)
- **데이터 레이어**: LocalStorage (클라이언트) + Serverless API (백엔드)
- **AI 통합**: OpenAI GPT-4o-mini (외부 LLM 에이전트)
- **배포 모델**: JAMstack (GitHub Pages + Vercel Functions)

---

## 🧩 핵심 구성요소

### 1. 프론트엔드 계층 (Frontend Layer)

#### 1.1 **UI 컴포넌트** (Presentation Layer)
| 파일 | 역할 | 주요 기능 |
|------|------|----------|
| `index.html` | 홈 페이지 | 랜딩, 서비스 소개, CTA |
| `write.html` | 기록 입력 페이지 | AI 질문 제시, 기록 작성, 과거 기록 조회 |
| `report.html` | 리포트 조회 페이지 | AI 리포트 생성 및 조회, 삭제 |
| `styles.css` | 스타일시트 | 전체 UI 디자인, 모달, 반응형 |

#### 1.2 **애플리케이션 로직** (app.js)
**역할**: 프론트엔드의 핵심 비즈니스 로직 처리

##### 📦 **모듈 구조**

```javascript
// 1. CONFIG - 전역 설정
const CONFIG = {
  STORAGE_KEYS: { LOGS, REPORT },    // LocalStorage 키
  API_ENDPOINT: string,               // 백엔드 API URL
  USE_MOCK_MODE: boolean,             // Mock 모드 활성화
  MIN_RECORDS_FOR_REPORT: number,    // 최소 기록 수 (5)
  AI_QUESTIONS: string[]              // AI 질문 풀 (10개)
}

// 2. Utils - 유틸리티 함수
const Utils = {
  getFromStorage(key)        // LocalStorage 읽기
  saveToStorage(key, value)  // LocalStorage 쓰기
  formatDate(isoString)      // 날짜 포맷팅
  getRandomQuestions(count)  // 랜덤 질문 선택
  generateId()               // UUID 생성
}

// 3. DataService - 데이터 관리
const DataService = {
  getAllLogs()                      // 모든 기록 조회
  addLog(title, content, dateISO)   // 기록 추가
  deleteLog(id)                     // 기록 삭제
  getReport()                       // 리포트 조회
  saveReport(text, count)           // 리포트 저장
  deleteReport()                    // 리포트 삭제
}

// 4. APIService - 백엔드 통신
const APIService = {
  async generateReport(records)     // AI 리포트 생성 요청
    → Mock 모드: 더미 리포트 반환
    → Real 모드: POST /api/generate-report
}

// 5. WritePage - 기록 페이지 로직
const WritePage = {
  init()                   // 초기화
  loadQuestions()          // AI 질문 로드
  handleSubmit(e)          // 폼 제출 처리
  showAIResponse()         // AI 응답 표시
  renderRecordsList()      // 기록 목록 렌더링
  showRecordDetail(id)     // 기록 상세보기 모달
}

// 6. ReportPage - 리포트 페이지 로직
const ReportPage = {
  init()                     // 초기화
  updateRecordCount()        // 기록 수 업데이트
  handleGenerateReport()     // 리포트 생성 처리
  displayReport()            // 리포트 표시
  handleDeleteReport()       // 리포트 삭제
}

// 7. 페이지 라우팅
DOMContentLoaded → 현재 페이지 감지 → 해당 페이지 초기화
```

##### 🔄 **상태 관리**
- **저장소**: Browser LocalStorage
- **키**: 
  - `trackin_logs_v1`: 기록 배열
  - `trackin_report_v1`: 최근 리포트 객체
- **데이터 모델**:
```javascript
// Log 객체
{
  id: string,           // UUID
  dateISO: string,      // ISO 8601 날짜
  title: string,        // 기록 제목
  content: string       // 기록 내용
}

// Report 객체
{
  createdAtISO: string, // 생성 시각
  sourceCount: number,  // 기록 수
  reportText: string    // 마크다운 리포트
}
```

---

### 2. 백엔드 계층 (Backend Layer - Serverless)

#### 2.1 **API 엔드포인트** (generate-report.js)
**역할**: OpenAI LLM을 활용한 AI 리포트 생성

##### 📡 **API 스펙**
```javascript
POST /api/generate-report

// 요청
{
  records: [
    { dateISO: string, title: string, content: string }
  ]
}

// 응답 (성공)
{
  report: string,      // 마크다운 형식 리포트
  model: string,       // 사용된 모델 이름
  usage: {             // 토큰 사용량
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number
  }
}

// 응답 (실패)
{
  error: string,       // 에러 타입
  message: string      // 에러 메시지
}
```

##### 🤖 **AI 에이전트 통합**
```javascript
// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// LLM 호출
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: USER_RECORDS }
  ],
  temperature: 0.7,
  max_tokens: 2000
});
```

##### 📝 **시스템 프롬프트 구조**
```
역할: TrackIn 데이터 분석가
입력: 사용자의 일상 기록 (날짜, 제목, 내용)
제약: 
  - 직무/직업/회사명 제시 금지
  - MBTI 등 성격 유형 분류 금지
  - 확정적 표현 금지
  - 할루시네이션 금지
출력 형식:
  ## 0. 기록 개요
  ## 1. 전체 요약
  ## 2. 에너지 사용 패턴 분석
  ## 3. 선택 기준 발견
  ## 4. 동기 요인 정리
  ## 5. 다음 탐색 질문
```

##### 🔧 **모드 전환**
- **Mock 모드** (`USE_MOCK_RESPONSE=true`):
  - OpenAI API 호출 없이 더미 리포트 반환
  - 비용 절감 및 빠른 테스트
  - `generateMockReport()` 함수 사용

- **Real 모드** (`USE_MOCK_RESPONSE=false`):
  - OpenAI GPT-4o-mini 실제 호출
  - 실제 AI 분석 수행

#### 2.2 **로컬 테스트 서버** (test-server.js)
**역할**: Vercel Functions를 로컬에서 테스트

```javascript
// Express 서버로 Vercel handler 래핑
app.post('/api/generate-report', async (req, res) => {
  await handler(req, res);  // Vercel 핸들러 재사용
});
```

#### 2.3 **배포 설정** (vercel.json)
```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,      // 메모리 제한
      "maxDuration": 30    // 타임아웃 30초
    }
  },
  "headers": [...]           // CORS 설정
}
```

---

### 3. 데이터 저장소 (Data Storage)

#### 3.1 **클라이언트 저장소** (LocalStorage)
```
Browser LocalStorage
├── trackin_logs_v1: Log[]
└── trackin_report_v1: Report
```

**특징**:
- 용량: ~5-10MB
- 접근: 동기적
- 영속성: 브라우저별 독립적
- 백업: 없음 (사용자 책임)

#### 3.2 **서버 저장소** (환경 변수)
```
Backend Environment Variables (.env)
├── OPENAI_API_KEY: string
└── USE_MOCK_RESPONSE: boolean
```

---

## 🔄 데이터 플로우

### Flow 1: 기록 작성 플로우
```
┌─────────────┐
│   write.html│
└──────┬──────┘
       │ 1. 페이지 로드
       ▼
┌─────────────────┐
│ WritePage.init() │
└──────┬───────────┘
       │ 2. AI 질문 3개 랜덤 선택
       │    Utils.getRandomQuestions(3)
       ▼
┌──────────────────┐
│ AI 질문 표시      │
│ [질문1, 질문2, 3] │
└──────┬───────────┘
       │ 3. 사용자 입력
       │    - 날짜 선택 (기본: 오늘)
       │    - 제목 입력
       │    - 내용 입력
       ▼
┌──────────────────────┐
│ WritePage.handleSubmit│
└──────┬───────────────┘
       │ 4. 데이터 저장
       │    DataService.addLog()
       │    ↓
       │    Utils.saveToStorage()
       │    ↓
       │    localStorage.setItem()
       ▼
┌──────────────────────┐
│ AI 응답 생성 & 표시   │
│ (맥락 기반 피드백)    │
└──────┬───────────────┘
       │ 5. 기록 목록 갱신
       │    WritePage.renderRecordsList()
       ▼
┌──────────────────────┐
│ 저장 완료 알림        │
└──────────────────────┘
```

### Flow 2: 리포트 생성 플로우
```
┌─────────────┐
│ report.html │
└──────┬──────┘
       │ 1. 페이지 로드
       ▼
┌──────────────────┐
│ ReportPage.init() │
└──────┬───────────┘
       │ 2. 기록 수 확인
       │    DataService.getAllLogs()
       │    ↓
       │    logs.length >= 5 ? 버튼 활성화 : 비활성화
       ▼
┌──────────────────────────┐
│ "AI 리포트 생성하기" 클릭 │
└──────┬───────────────────┘
       │ 3. 로딩 UI 표시
       ▼
┌────────────────────────────┐
│ APIService.generateReport() │
└────────┬──────────┬─────────┘
         │          │
    Mock │          │ Real
         ▼          ▼
    ┌──────┐   ┌────────────────┐
    │더미   │   │ POST /api/     │
    │리포트 │   │ generate-report│
    └──┬───┘   └────┬───────────┘
       │            │ 4. OpenAI API 호출
       │            │    openai.chat.completions.create()
       │            │    ↓
       │            │    GPT-4o-mini 분석
       │            ▼
       │       ┌──────────────┐
       │       │ AI 리포트     │
       │       │ (마크다운)    │
       │       └──────┬───────┘
       │              │
       └──────────────┘
                │ 5. 리포트 저장
                │    DataService.saveReport()
                │    ↓
                │    localStorage.setItem()
                ▼
       ┌──────────────────┐
       │ 리포트 표시       │
       │ (5개 섹션 구조)   │
       └──────────────────┘
```

### Flow 3: 과거 기록 조회 플로우
```
┌─────────────┐
│ write.html  │
└──────┬──────┘
       │ 1. 기록 목록 렌더링
       │    WritePage.renderRecordsList()
       ▼
┌───────────────────────┐
│ 최근 10개 기록 표시    │
│ [보기] [삭제] 버튼     │
└──────┬────────────────┘
       │ 2. "보기" 클릭
       ▼
┌──────────────────────────┐
│ WritePage.showRecordDetail│
└──────┬───────────────────┘
       │ 3. 기록 조회
       │    DataService.getAllLogs()
       │    ↓
       │    logs.find(id)
       ▼
┌─────────────────────┐
│ 모달 팝업 생성       │
│ - 제목               │
│ - 날짜               │
│ - 전체 내용          │
│ [X] [닫기]           │
└─────────────────────┘
       │ 4. 모달 닫기 (4가지 방법)
       │    - X 버튼
       │    - 닫기 버튼
       │    - ESC 키
       │    - 배경 클릭
       ▼
┌─────────────────────┐
│ 모달 제거 & 이벤트   │
│ 리스너 정리          │
└─────────────────────┘
```

---

## 🤖 AI 에이전트 아키텍처

### 에이전트 계층 구조
```
┌───────────────────────────────────────────────────┐
│           APPLICATION LAYER (Frontend)            │
│  ┌────────────────────────────────────────────┐   │
│  │      UI Components (HTML/CSS/JS)           │   │
│  │  - write.html: 기록 입력 인터페이스         │   │
│  │  - report.html: 리포트 출력 인터페이스      │   │
│  └────────────────────────────────────────────┘   │
└───────────────────┬───────────────────────────────┘
                    │ User Interaction
                    ▼
┌───────────────────────────────────────────────────┐
│        BUSINESS LOGIC LAYER (app.js)              │
│  ┌────────────────────────────────────────────┐   │
│  │         Agent Coordination Logic           │   │
│  │  - WritePage: 사용자 입력 처리              │   │
│  │  - ReportPage: 리포트 생성 제어             │   │
│  │  - DataService: 데이터 관리                 │   │
│  │  - APIService: AI 에이전트 호출             │   │
│  └────────────────────────────────────────────┘   │
└───────────────────┬───────────────────────────────┘
                    │ API Request
                    ▼
┌───────────────────────────────────────────────────┐
│         SERVERLESS LAYER (Backend)                │
│  ┌────────────────────────────────────────────┐   │
│  │     API Gateway (Vercel Functions)         │   │
│  │  - CORS 처리                                │   │
│  │  - 입력 검증                                │   │
│  │  - 에러 핸들링                              │   │
│  └────────────────────────────────────────────┘   │
└───────────────────┬───────────────────────────────┘
                    │ LLM Request
                    ▼
┌───────────────────────────────────────────────────┐
│          AI AGENT LAYER (OpenAI GPT)              │
│  ┌────────────────────────────────────────────┐   │
│  │       Large Language Model Agent           │   │
│  │  Model: gpt-4o-mini                        │   │
│  │  Role: 데이터 분석가                        │   │
│  │  Task: 패턴 분석 & 인사이트 생성            │   │
│  │  Constraints:                              │   │
│  │    - 직무 추천 금지                         │   │
│  │    - 확정적 표현 금지                       │   │
│  │    - 근거 기반 분석                         │   │
│  └────────────────────────────────────────────┘   │
└───────────────────┬───────────────────────────────┘
                    │ Structured Output
                    ▼
┌───────────────────────────────────────────────────┐
│            DATA PERSISTENCE LAYER                 │
│  ┌────────────────────────────────────────────┐   │
│  │         LocalStorage (Client-side)         │   │
│  │  - trackin_logs_v1: 사용자 기록             │   │
│  │  - trackin_report_v1: AI 리포트             │   │
│  └────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────┘
```

### AI 에이전트 특성

#### 1. **에이전트 타입**: Analytical Agent (분석형 에이전트)
- **목적**: 사용자 행동 패턴 분석 및 구조화
- **입력**: 자연어 일상 기록
- **출력**: 구조화된 마크다운 리포트

#### 2. **에이전트 제약 조건** (Constraints)
```javascript
// 시스템 프롬프트에 명시된 제약
{
  금지사항: [
    "직무/직업/회사명 제시",
    "MBTI 등 성격 유형 분류",
    "확정적 표현",
    "맥락 추측 (할루시네이션)"
  ],
  허용사항: [
    "관찰",
    "정리",
    "요약",
    "다중 방향 제시"
  ]
}
```

#### 3. **에이전트 출력 구조** (Output Schema)
```markdown
## 0. 기록 개요
- 전체 기록 수: X개
- 기록 기간: YYYY-MM-DD ~ YYYY-MM-DD

## 1. 전체 요약
(2-3문장 핵심 흐름)

## 2. 에너지 사용 패턴 분석
높은 에너지 순간:
- (구체적 인용)
낮은 에너지 순간:
- (구체적 인용)

## 3. 선택 기준 발견
- 기준 1
- 기준 2
- 기준 3

## 4. 동기 요인 정리
**내재적 동기:**
- ...
**외재적 동기:**
- ...

## 5. 다음 탐색 질문
1. ...
2. ...
3. ...
```

#### 4. **에이전트 파라미터**
```javascript
{
  model: 'gpt-4o-mini',
  temperature: 0.7,        // 창의성 중간 수준
  max_tokens: 2000,        // 긴 형식 리포트
  messages: [
    { role: 'system', ... },
    { role: 'user', ... }
  ]
}
```

---

## 🔗 컴포넌트 관계도

### 전체 시스템 다이어그램
```
┌──────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │ index.html   │   │  write.html  │   │ report.html  │    │
│  │ (랜딩 페이지) │   │ (기록 작성)  │   │ (리포트 조회)│    │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘    │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                            ▼                                │
│                   ┌─────────────────┐                       │
│                   │    app.js       │                       │
│                   │  (앱 로직 핵심) │                       │
│                   └────────┬────────┘                       │
│                            │                                │
│            ┌───────────────┼───────────────┐                │
│            ▼               ▼               ▼                │
│      ┌──────────┐   ┌───────────┐   ┌──────────┐           │
│      │  Utils   │   │DataService│   │APIService│           │
│      │(유틸리티)│   │(데이터 관리)│   │(API 호출)│           │
│      └────┬─────┘   └─────┬─────┘   └─────┬────┘           │
│           │               │               │                │
│           │               │               │                │
│           │               ▼               │                │
│           │      ┌────────────────┐       │                │
│           │      │ LocalStorage   │       │                │
│           │      │ - logs_v1      │       │                │
│           │      │ - report_v1    │       │                │
│           │      └────────────────┘       │                │
│           │                               │                │
│           └───────────────────────────────┘                │
│                                           │                │
└───────────────────────────────────────────┼────────────────┘
                                            │
                                  HTTP POST │
                                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    VERCEL SERVERLESS                         │
│                                                              │
│              ┌────────────────────────────┐                  │
│              │  /api/generate-report.js   │                  │
│              │  (Serverless Function)     │                  │
│              └────────────┬───────────────┘                  │
│                           │                                  │
│                ┌──────────┴──────────┐                       │
│                ▼                     ▼                       │
│         ┌──────────────┐      ┌──────────────┐              │
│         │  Mock Mode   │      │  Real Mode   │              │
│         │  (더미 리포트)│      │ (OpenAI 호출)│              │
│         └──────────────┘      └──────┬───────┘              │
│                                      │                      │
└──────────────────────────────────────┼──────────────────────┘
                                       │
                             HTTPS API │
                                       ▼
                        ┌──────────────────────────┐
                        │     OpenAI Platform      │
                        │   (GPT-4o-mini Model)    │
                        │   - 패턴 분석            │
                        │   - 리포트 생성          │
                        └──────────────────────────┘
```

### 모듈 간 의존성 그래프
```
CONFIG
  ↓
Utils ←──┐
  ↓      │
DataService
  ↑      │
  │      │
WritePage ←──┤
  │          │
ReportPage ←─┤
  │          │
APIService ←─┘
  ↓
Backend API
  ↓
OpenAI GPT
```

### 데이터 흐름 방향
```
User Input → WritePage → DataService → LocalStorage
                ↓
        AI Response Display

LocalStorage → ReportPage → APIService → Backend API
                                              ↓
                                         OpenAI GPT
                                              ↓
                                         AI Report
                                              ↓
                                         DataService
                                              ↓
                                         LocalStorage
                                              ↓
                                         ReportPage
                                              ↓
                                         User Display
```

---

## 🛠️ 기술 스택

### 프론트엔드
| 기술 | 역할 | 버전/특징 |
|------|------|----------|
| **HTML5** | 마크업 | Semantic HTML |
| **CSS3** | 스타일링 | CSS Variables, Flexbox, Grid, Animation |
| **Vanilla JavaScript** | 로직 | ES6+, Async/Await, Modules |
| **LocalStorage API** | 클라이언트 저장소 | 5-10MB 용량 |

### 백엔드
| 기술 | 역할 | 버전 |
|------|------|------|
| **Node.js** | 런타임 | ES Modules |
| **Vercel Functions** | Serverless | - |
| **OpenAI SDK** | LLM 통합 | ^4.67.3 |
| **Express** | 로컬 테스트 | ^4.18.2 |
| **CORS** | CORS 처리 | ^2.8.5 |
| **dotenv** | 환경 변수 | ^16.3.1 |

### AI/ML
| 모델 | 역할 | 특징 |
|------|------|------|
| **GPT-4o-mini** | 패턴 분석 | Cost-effective, 빠른 응답 |
| **Temperature: 0.7** | 창의성 조절 | 중간 수준 |
| **Max Tokens: 2000** | 출력 길이 | 긴 형식 리포트 |

### 배포
| 플랫폼 | 용도 | URL |
|--------|------|-----|
| **GitHub Pages** | 프론트엔드 호스팅 | Static Site |
| **Vercel** | 백엔드 호스팅 | Serverless Functions |

---

## 📊 시스템 메트릭

### 성능 지표
| 지표 | 값 | 설명 |
|------|-----|------|
| **리포트 생성 시간** | 1초 (Mock) / 10-30초 (Real) | AI 응답 속도 |
| **최소 기록 수** | 5개 | 리포트 생성 조건 |
| **최대 토큰** | 2000 | OpenAI 응답 길이 |
| **LocalStorage 용량** | ~5-10MB | 브라우저 제한 |

### 비용 구조 (Real 모드)
```
GPT-4o-mini 가격:
  - Input: $0.15 / 1M tokens
  - Output: $0.60 / 1M tokens

예상 비용 (5개 기록 기준):
  - Input: ~500 tokens
  - Output: ~1500 tokens
  - 총 비용: ~$0.001 (약 1.3원)

월 100개 리포트: ~$0.10 (약 130원)
```

---

## 🔐 보안 고려사항

### 1. **API 키 보호**
- ❌ 프론트엔드에 API 키 노출 금지
- ✅ 백엔드 환경 변수로 관리
- ✅ `.env` 파일 `.gitignore` 등록

### 2. **CORS 정책**
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
// 프로덕션: 특정 도메인만 허용 권장
```

### 3. **입력 검증**
```javascript
// 백엔드에서 필수 파라미터 검증
if (!records || !Array.isArray(records)) {
  return res.status(400).json({ error: 'Bad Request' });
}
```

---

## 🚀 확장 가능성

### 1. **데이터베이스 통합**
```
LocalStorage → Supabase / Firebase
  - 다중 기기 동기화
  - 백업 자동화
  - 협업 기능
```

### 2. **고급 AI 기능**
```
추가 AI 에이전트:
  - 감정 분석 에이전트
  - 진로 추천 에이전트 (옵션)
  - 질문 생성 에이전트 (동적)
```

### 3. **사용자 인증**
```
익명 → 계정 기반
  - Google OAuth
  - Email/Password
  - 데이터 프라이버시
```

---

## 📚 참고 자료

### 파일 위치
```
/home/user/webapp/
├── frontend/
│   ├── index.html          # 홈 페이지
│   ├── write.html          # 기록 페이지
│   ├── report.html         # 리포트 페이지
│   ├── app.js              # 앱 로직 (핵심)
│   └── styles.css          # 스타일
├── backend/
│   ├── api/
│   │   └── generate-report.js  # API 엔드포인트 (핵심)
│   ├── test-server.js      # 로컬 테스트 서버
│   ├── package.json        # 의존성
│   ├── vercel.json         # 배포 설정
│   └── .env                # 환경 변수
└── README.md               # 프로젝트 문서
```

### 핵심 문서
- `FEATURE_UPDATE_v1.4.md`: 최신 기능 업데이트
- `FINAL_SUMMARY.md`: 프로젝트 완성 요약
- `DEPLOYMENT_GUIDE.md`: 배포 가이드
- `API_SETUP_COMPLETE.md`: API 설정 완료

---

## 🎯 핵심 인사이트

### 시스템의 핵심 강점
1. ✅ **단순성**: Vanilla JS, LocalStorage, Serverless
2. ✅ **AI 통합**: OpenAI GPT-4o-mini 활용
3. ✅ **비용 효율**: Mock 모드 + 저렴한 모델
4. ✅ **확장성**: 모듈화된 구조
5. ✅ **사용자 프라이버시**: 클라이언트 데이터 저장

### AI 에이전트로서의 특징
- **목적**: 자기 인식 강화 (Self-awareness)
- **방법론**: 일상 기록 → 패턴 분석 → 구조화된 인사이트
- **제약 기반 설계**: 확정적 판단 금지, 근거 기반 분석
- **사용자 중심**: AI가 답을 주는 게 아니라 질문을 제시

---

**작성**: AI Assistant  
**버전**: 1.4.0  
**날짜**: 2026-02-09
