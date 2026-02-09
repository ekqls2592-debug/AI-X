/**
 * 로컬 테스트용 서버
 * Vercel Functions를 로컬에서 테스트하기 위한 Express 서버
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import handler from './api/generate-report.js';

// .env 파일 로드
dotenv.config();

const app = express();
const PORT = 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// API 라우트
app.post('/api/generate-report', async (req, res) => {
  // Vercel handler를 Express request/response로 래핑
  await handler(req, res);
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 백엔드 테스트 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📍 API 엔드포인트: http://localhost:${PORT}/api/generate-report`);
  console.log(`🔑 OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '설정됨 ✓' : '❌ 설정되지 않음'}`);
});
