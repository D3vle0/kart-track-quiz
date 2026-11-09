import { Router, Request, Response, NextFunction } from 'express';
import { trackService } from '../services/trackService';
import { QuizSubmission } from '../types/track';

export const quizRouter = Router();

// 테마 매핑 (기존 views/index.ejs의 theme1~theme31 매핑 지원)
const THEME_MAP: Record<string, string> = {
    theme1: '1920',
    theme2: 'WKC',
    theme3: '공동묘지',
    theme4: '광산',
    theme5: '네모',
    theme6: '노르테유',
    theme7: '놀이동산',
    theme8: '님프',
    theme9: '대저택',
    theme10: '도검',
    theme11: '동화',
    theme12: '마비노기',
    theme13: '메카닉',
    theme14: '문힐시티',
    theme15: '브로디',
    theme16: '비치',
    theme17: '빌리지',
    theme18: '사막',
    theme19: '신화',
    theme20: '아이스',
    theme21: '어비스',
    theme22: '올림포스',
    theme23: '월드',
    theme24: '쥐라기',
    theme25: '차이나',
    theme26: '카멜롯',
    theme27: '코리아',
    theme28: '팩토리',
    theme29: '포레스트',
    theme30: '해적',
    theme31: '황금문명'
};

/**
 * 메인 화면 (테마 선택 및 퀴즈 시작)
 */
quizRouter.get('/', (req: Request, res: Response) => {
    res.render('index', { themes: trackService.getAllThemes() });
});

/**
 * 퀴즈 시작: 선택된 테마를 기반으로 10문항 생성
 */
quizRouter.post('/', (req: Request, res: Response) => {
    const selectedThemes: string[] = [];

    // 1. 기존 theme1, theme2... 형태 처리
    for (const [key, themeName] of Object.entries(THEME_MAP)) {
        if (req.body[key]) {
            selectedThemes.push(themeName);
        }
    }

    // 2. 만약 themes[] 형태의 배열로 전달된 경우도 지원
    if (Array.isArray(req.body.themes)) {
        selectedThemes.push(...req.body.themes);
    } else if (typeof req.body.themes === 'string') {
        selectedThemes.push(req.body.themes);
    }

    // 퀴즈 문제 10개 생성 (중복 없음, 선택 테마 없을 시 전체 대상)
    const quiz = trackService.createQuiz(selectedThemes, 10);

    // 세션에 문제 id 목록 저장 (파일 시스템 대신 세션 메모리 격리)
    if (req.session) {
        req.session.quizTrackIds = quiz.map((t) => t.id);
    }

    res.render('game', { res: quiz });
});

/**
 * 퀴즈 제출 및 채점
 */
quizRouter.post('/submit', (req: Request, res: Response) => {
    const submissions: QuizSubmission[] = [];
    const body = req.body || {};

    // views/game.ejs의 answerX (trackId), inputX (사용자 입력) 파싱
    for (let i = 0; ; i++) {
        const trackId = body[`answer${i}`];
        if (trackId === undefined) {
            break;
        }
        const userAnswer = body[`input${i}`] || '';
        submissions.push({
            trackId: String(trackId).trim(),
            userAnswer: String(userAnswer).trim()
        });
    }

    // fallback: 만약 answer0, input0 형식이 아니라면 세션의 trackId를 참조
    if (submissions.length === 0 && req.session?.quizTrackIds) {
        req.session.quizTrackIds.forEach((id, idx) => {
            const userAnswer = body[`input${idx}`] || '';
            submissions.push({
                trackId: id,
                userAnswer: String(userAnswer).trim()
            });
        });
    }

    // 채점 진행
    const result = trackService.gradeQuiz(submissions);

    // 뷰 렌더링 (기존 result 퍼센티지 변수 및 상세 채점 정보 전달)
    res.render('result', {
        result: result.score,
        details: result.details,
        correctCount: result.correctCount,
        totalCount: result.totalCount
    });
});
