/**
 * TrackIn - Vanilla JavaScript Application
 * LocalStorage 기반 일상 기록 + AI 리포트 생성
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    STORAGE_KEYS: {
        LOGS: 'trackin_logs_v1',
        REPORT: 'trackin_report_v1',
    },
    API_ENDPOINT: 'http://localhost:3001/api/generate-report', // 로컬 테스트용 (Vercel 배포 시 변경 필요)
    USE_MOCK_MODE: true, // Mock 모드 활성화 (API 서버 없이 테스트)
    MIN_RECORDS_FOR_REPORT: 5,
    AI_QUESTIONS: [
        '오늘 하루 중 가장 에너지가 넘쳤던 순간은 언제였나요?',
        '최근 일주일 동안 무언가를 선택할 때, 가장 중요하게 생각한 기준은 무엇이었나요?',
        '오늘 한 일 중에서 시간 가는 줄 몰랐던 활동이 있나요?',
        '다른 사람에게 인정받았을 때와 스스로 만족했을 때, 어느 쪽이 더 기억에 남나요?',
        '오늘 피하고 싶었던 일이 있다면 무엇이고, 그 이유는 무엇인가요?',
        '최근에 새롭게 시도해본 것이 있나요? 그 경험은 어땠나요?',
        '오늘 누군가와 나눈 대화 중 가장 흥미로웠던 주제는 무엇인가요?',
        '최근에 자주 생각하게 되는 질문이나 고민이 있나요?',
        '오늘 한 선택 중에서 가장 만족스러운 것은 무엇인가요?',
        '지금 이 순간 가장 하고 싶은 일은 무엇인가요?',
    ],
};

// ========================================
// Utility Functions
// ========================================
const Utils = {
    // LocalStorage에서 데이터 가져오기
    getFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Storage read error (${key}):`, error);
            return null;
        }
    },

    // LocalStorage에 데이터 저장
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Storage write error (${key}):`, error);
            alert('저장 중 오류가 발생했습니다. 용량이 부족할 수 있습니다.');
            return false;
        }
    },

    // 날짜 포맷팅
    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
        });
    },

    // 랜덤 질문 3개 선택
    getRandomQuestions(count = 3) {
        const shuffled = [...CONFIG.AI_QUESTIONS].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    },

    // UUID 생성
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
};

// ========================================
// Data Layer
// ========================================
const DataService = {
    // 모든 기록 가져오기
    getAllLogs() {
        return Utils.getFromStorage(CONFIG.STORAGE_KEYS.LOGS) || [];
    },

    // 기록 추가
    addLog(title, content, dateISO = null) {
        const logs = this.getAllLogs();
        const newLog = {
            id: Utils.generateId(),
            dateISO: dateISO || new Date().toISOString(), // 날짜가 제공되지 않으면 현재 시간
            title: title.trim(),
            content: content.trim(),
        };
        logs.unshift(newLog); // 최신 기록이 앞에 오도록
        return Utils.saveToStorage(CONFIG.STORAGE_KEYS.LOGS, logs);
    },

    // 기록 삭제
    deleteLog(id) {
        const logs = this.getAllLogs();
        const filtered = logs.filter(log => log.id !== id);
        return Utils.saveToStorage(CONFIG.STORAGE_KEYS.LOGS, filtered);
    },

    // 리포트 가져오기
    getReport() {
        return Utils.getFromStorage(CONFIG.STORAGE_KEYS.REPORT);
    },

    // 리포트 저장
    saveReport(reportText, sourceCount) {
        const report = {
            createdAtISO: new Date().toISOString(),
            sourceCount,
            reportText,
        };
        return Utils.saveToStorage(CONFIG.STORAGE_KEYS.REPORT, report);
    },

    // 리포트 삭제
    deleteReport() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.REPORT);
        return true;
    },
};

// ========================================
// API Service
// ========================================
const APIService = {
    async generateReport(records) {
        // Mock 모드: API 서버 없이 더미 리포트 생성
        if (CONFIG.USE_MOCK_MODE) {
            console.log('[Mock Mode] 더미 리포트 생성 중...');
            
            // 약간의 지연 시뮬레이션 (실제 API 호출처럼)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
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
*이 리포트는 ${records.length}개의 기록을 바탕으로 생성되었습니다. 더 많은 기록을 축적할수록 패턴이 더 명확해질 수 있습니다.*

(Mock 모드: 실제 AI가 아닌 샘플 리포트입니다)`;
        }
        
        // Real 모드: 실제 API 호출
        try {
            const response = await fetch(CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ records }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            return data.report;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
};

// ========================================
// Write Page (write.html)
// ========================================
const WritePage = {
    selectedQuestion: null,

    init() {
        this.loadQuestions();
        this.bindEvents();
        this.renderRecordsList();
        this.setDefaultDate();
    },

    setDefaultDate() {
        const dateInput = document.getElementById('recordDate');
        if (dateInput) {
            // 오늘 날짜를 YYYY-MM-DD 형식으로 설정
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        }
    },

    loadQuestions() {
        const questionsContainer = document.getElementById('aiQuestions');
        if (!questionsContainer) return;

        const questions = Utils.getRandomQuestions(3);
        questionsContainer.innerHTML = questions
            .map((q, idx) => `
                <div class="question-item" data-question="${q}">
                    <strong>질문 ${idx + 1}.</strong> ${q}
                </div>
            `)
            .join('');

        // 질문 클릭 시 textarea에 자동 입력
        questionsContainer.querySelectorAll('.question-item').forEach(item => {
            item.addEventListener('click', () => {
                const question = item.getAttribute('data-question');
                const textarea = document.getElementById('content');
                if (textarea) {
                    textarea.value = `[AI 질문에 답변]\nQ: ${question}\n\nA: `;
                    textarea.focus();
                }
                // 선택 표시
                questionsContainer.querySelectorAll('.question-item').forEach(q => q.classList.remove('selected'));
                item.classList.add('selected');
                this.selectedQuestion = question;
            });
        });
    },

    bindEvents() {
        const form = document.getElementById('writeForm');
        const regenerateBtn = document.getElementById('regenerateBtn');
        const clearBtn = document.getElementById('clearBtn');

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.loadQuestions());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('작성 중인 내용을 지우시겠습니까?')) {
                    form.reset();
                    document.getElementById('aiResponseBox').style.display = 'none';
                }
            });
        }
    },

    async handleSubmit(e) {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const recordDate = document.getElementById('recordDate').value;

        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        // 선택한 날짜를 ISO 형식으로 변환 (시간은 현재 시간으로)
        let dateISO;
        if (recordDate) {
            const selectedDate = new Date(recordDate);
            // 현재 시간을 사용하여 완전한 타임스탬프 생성
            const now = new Date();
            selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            dateISO = selectedDate.toISOString();
        } else {
            dateISO = new Date().toISOString();
        }

        // 저장
        const success = DataService.addLog(title, content, dateISO);
        if (success) {
            // AI 응답 시뮬레이션 (상담사 역할)
            this.showAIResponse(title, content);
            
            // 폼 초기화
            e.target.reset();
            document.querySelectorAll('.question-item').forEach(q => q.classList.remove('selected'));
            
            // 날짜 필드 초기화 (오늘로 다시 설정)
            this.setDefaultDate();
            
            // 목록 갱신
            this.renderRecordsList();
            
            alert('✅ 기록이 저장되었습니다!');
        }
    },

    showAIResponse(title, content) {
        const responseBox = document.getElementById('aiResponseBox');
        const responseContent = document.getElementById('aiResponse');
        
        if (!responseBox || !responseContent) return;

        // 사용자 기록 기반 지능형 AI 응답 생성
        const response = this.generateContextualResponse(title, content);
        
        responseContent.textContent = response;
        responseBox.style.display = 'block';

        // 자동 스크롤
        setTimeout(() => {
            responseBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    },

    generateContextualResponse(title, content) {
        // 내용에서 키워드 추출
        const contentLower = content.toLowerCase();
        const titleLower = title.toLowerCase();
        
        // 감정/경험 키워드 감지
        const positiveKeywords = ['좋', '즐거', '행복', '만족', '뿌듯', '성취', '재미', '흥미', '몰입', '열정'];
        const negativeKeywords = ['힘들', '어려', '고민', '걱정', '스트레스', '피곤', '지침', '불안'];
        const learningKeywords = ['배웠', '배우', '공부', '학습', '익히', '알게', '깨달'];
        const socialKeywords = ['팀', '함께', '회의', '대화', '친구', '사람', '동료'];
        const creativeKeywords = ['만들', '디자인', '기획', '아이디어', '창의', '구상'];
        const techKeywords = ['코딩', '개발', '프로그래밍', '버그', '알고리즘', '코드', '구현'];
        
        // 긍정적 경험 감지
        const hasPositive = positiveKeywords.some(keyword => contentLower.includes(keyword) || titleLower.includes(keyword));
        const hasNegative = negativeKeywords.some(keyword => contentLower.includes(keyword) || titleLower.includes(keyword));
        const hasLearning = learningKeywords.some(keyword => contentLower.includes(keyword) || titleLower.includes(keyword));
        const hasSocial = socialKeywords.some(keyword => contentLower.includes(keyword) || titleLower.includes(keyword));
        const hasCreative = creativeKeywords.some(keyword => contentLower.includes(keyword) || titleLower.includes(keyword));
        const hasTech = techKeywords.some(keyword => contentLower.includes(keyword) || titleLower.includes(keyword));
        
        // 제목이나 내용의 일부 추출 (30자 제한)
        const titlePreview = title.length > 20 ? title.slice(0, 20) + '...' : title;
        const contentPreview = content.length > 40 ? content.slice(0, 40) + '...' : content;
        
        // 맥락 기반 응답 생성
        let response = '';
        
        if (hasPositive && hasTech) {
            response = `"${titlePreview}"에서 느낀 즐거움이 인상적이네요! 기술적인 문제를 해결할 때 느끼는 성취감은 특별하죠. 이런 순간들이 당신의 에너지가 어디로 향하는지 잘 보여주고 있어요.`;
        } else if (hasPositive && hasCreative) {
            response = `"${titlePreview}"... 창의적인 작업에서 에너지를 얻는 것 같아요! 무언가를 만들어내는 과정이 당신에게 의미 있게 다가오는 것 같네요. 이런 경험들을 더 기록해보세요.`;
        } else if (hasPositive && hasSocial) {
            response = `함께하는 시간에서 긍정적인 에너지를 받는군요! "${titlePreview}"처럼 사람들과의 상호작용이 당신에게 중요한 동기 요인일 수 있어요. 흥미로운 패턴이에요.`;
        } else if (hasLearning) {
            response = `새로운 것을 배우는 과정을 기록해주셨네요. "${contentPreview}"... 배움에 대한 호기심이 느껴져요. 이런 학습 경험이 쌓이면 당신의 성장 방향이 더 명확해질 거예요.`;
        } else if (hasNegative && hasPositive) {
            response = `"${titlePreview}"에서 어려움과 만족감을 동시에 느꼈군요. 도전적인 상황에서도 의미를 찾는 당신의 태도가 인상적이에요. 이런 균형 잡힌 시각이 중요해요.`;
        } else if (hasNegative) {
            response = `"${titlePreview}"에서 어려움을 겪으셨네요. 힘든 순간도 기록해주셔서 감사해요. 이런 경험들도 당신이 무엇을 회피하고 싶어하는지, 어떤 환경이 맞지 않는지 알려주는 중요한 단서가 됩니다.`;
        } else if (hasPositive) {
            response = `"${titlePreview}"에서 긍정적인 경험을 하셨군요! 어떤 순간에 에너지가 높아지는지 기록하는 것이 진로 탐색의 핵심이에요. 계속 이런 패턴을 찾아가 보세요.`;
        } else if (hasSocial) {
            response = `"${titlePreview}"... 사람들과의 교류에 대해 기록해주셨네요. 협업이나 대화에서 어떤 감정을 느끼는지 잘 관찰하고 있어요. 이런 관찰이 쌓이면 당신에게 맞는 환경이 보일 거예요.`;
        } else if (hasCreative) {
            response = `창의적인 활동을 기록해주셨네요. "${titlePreview}"처럼 무언가를 만들고 구상하는 과정이 당신에게 어떤 의미인지 점점 보이기 시작할 거예요.`;
        } else if (hasTech) {
            response = `"${titlePreview}"에 대한 기록이네요! 기술적인 작업에 대한 당신의 태도와 접근 방식을 잘 기록하고 있어요. 5일 이상 기록하면 더 구체적인 패턴을 발견할 수 있어요.`;
        } else {
            response = `"${titlePreview}"에 대해 기록해주셨네요. ${contentPreview} 이런 일상의 순간들이 모여서 당신의 선택 기준과 에너지 사용 패턴을 만들어냅니다. 꾸준히 기록을 이어가 보세요!`;
        }
        
        return response;
    },

    showRecordDetail(id) {
        const logs = DataService.getAllLogs();
        const log = logs.find(l => l.id === id);
        
        if (!log) {
            alert('기록을 찾을 수 없습니다.');
            return;
        }

        // 모달 생성
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${log.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="date"><strong>날짜:</strong> ${Utils.formatDate(log.dateISO)}</p>
                    <hr>
                    <div class="content-detail">
                        ${log.content.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-close-btn">닫기</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 닫기 버튼 이벤트
        const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // 배경 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // ESC 키로 닫기
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    renderRecordsList() {
        const listContainer = document.getElementById('recordsList');
        const countSpan = document.getElementById('recordsCount');
        
        if (!listContainer) return;

        const logs = DataService.getAllLogs();
        
        if (countSpan) {
            countSpan.textContent = logs.length;
        }

        if (logs.length === 0) {
            listContainer.innerHTML = '<li class="empty-state">아직 작성된 기록이 없습니다.</li>';
            return;
        }

        listContainer.innerHTML = logs
            .slice(0, 10) // 최근 10개만
            .map(log => `
                <li class="record-item">
                    <div class="record-item-content">
                        <h4>${log.title}</h4>
                        <p class="date">${Utils.formatDate(log.dateISO)}</p>
                        <p class="preview">${log.content.slice(0, 50)}${log.content.length > 50 ? '...' : ''}</p>
                    </div>
                    <div class="record-item-actions">
                        <button class="btn-view" data-id="${log.id}">보기</button>
                        <button class="btn-danger" data-id="${log.id}">삭제</button>
                    </div>
                </li>
            `)
            .join('');

        // 보기 버튼 이벤트
        listContainer.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.showRecordDetail(id);
            });
        });

        // 삭제 버튼 이벤트
        listContainer.querySelectorAll('.btn-danger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('이 기록을 삭제하시겠습니까?')) {
                    DataService.deleteLog(id);
                    this.renderRecordsList();
                    alert('기록이 삭제되었습니다.');
                }
            });
        });
    },
};

// ========================================
// Report Page (report.html)
// ========================================
const ReportPage = {
    init() {
        this.updateRecordCount();
        this.bindEvents();
    },

    updateRecordCount() {
        const logs = DataService.getAllLogs();
        const countSpan = document.getElementById('recordCount');
        const generateBtn = document.getElementById('generateBtn');

        if (countSpan) {
            countSpan.textContent = logs.length;
        }

        if (generateBtn) {
            if (logs.length >= CONFIG.MIN_RECORDS_FOR_REPORT) {
                generateBtn.disabled = false;
            } else {
                generateBtn.disabled = true;
            }
        }
    },

    bindEvents() {
        const generateBtn = document.getElementById('generateBtn');
        const loadBtn = document.getElementById('loadBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateReport());
        }

        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadReport());
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteReport());
        }
    },

    async generateReport() {
        const logs = DataService.getAllLogs();

        if (logs.length < CONFIG.MIN_RECORDS_FOR_REPORT) {
            alert(`최소 ${CONFIG.MIN_RECORDS_FOR_REPORT}개의 기록이 필요합니다.`);
            return;
        }

        // UI 상태 변경
        this.showLoading(true);
        this.hideError();
        this.hideReport();

        try {
            // API 호출
            const reportText = await APIService.generateReport(logs);

            // 리포트 저장
            DataService.saveReport(reportText, logs.length);

            // 리포트 표시
            this.displayReport(reportText, logs.length, new Date().toISOString());

            alert('✅ AI 리포트가 생성되었습니다!');
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    },

    loadReport() {
        const report = DataService.getReport();

        if (!report) {
            alert('저장된 리포트가 없습니다. 먼저 리포트를 생성해주세요.');
            return;
        }

        this.displayReport(report.reportText, report.sourceCount, report.createdAtISO);
    },

    deleteReport() {
        if (!confirm('저장된 리포트를 삭제하시겠습니까?')) {
            return;
        }

        DataService.deleteReport();
        this.hideReport();
        alert('리포트가 삭제되었습니다.');
    },

    displayReport(reportText, sourceCount, createdAtISO) {
        const outputContainer = document.getElementById('reportOutput');
        const metaContainer = document.getElementById('reportMeta');
        const contentContainer = document.getElementById('reportContent');

        if (!outputContainer || !metaContainer || !contentContainer) return;

        metaContainer.innerHTML = `
            <p>📅 생성일: ${Utils.formatDate(createdAtISO)}</p>
            <p>📊 분석한 기록: ${sourceCount}개</p>
        `;

        contentContainer.textContent = reportText;

        outputContainer.style.display = 'block';
        
        // 스크롤
        setTimeout(() => {
            outputContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    },

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const generateBtn = document.getElementById('generateBtn');

        if (loadingState) {
            loadingState.style.display = show ? 'block' : 'none';
        }

        if (generateBtn) {
            generateBtn.disabled = show;
        }
    },

    showError(message) {
        const errorBox = document.getElementById('errorBox');
        if (errorBox) {
            errorBox.textContent = `❌ 오류: ${message}`;
            errorBox.style.display = 'block';
        }
    },

    hideError() {
        const errorBox = document.getElementById('errorBox');
        if (errorBox) {
            errorBox.style.display = 'none';
        }
    },

    hideReport() {
        const outputContainer = document.getElementById('reportOutput');
        if (outputContainer) {
            outputContainer.style.display = 'none';
        }
    },
};

// ========================================
// Router (Simple Page Detection)
// ========================================
function initPage() {
    const path = window.location.pathname;

    if (path.includes('write.html')) {
        WritePage.init();
    } else if (path.includes('report.html')) {
        ReportPage.init();
    }
}

// ========================================
// App Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initPage();
});
