import express from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { config } from './config';
import { quizRouter } from './routes/quizRouter';

export const app = express();

// 뷰 템플릿 디렉터리 경로 자동 감지
const resolveViewsDir = (): string => {
    const candidates = [
        path.join(process.cwd(), 'views'),
        path.resolve(__dirname, '../views'),
        path.resolve(__dirname, '../../views')
    ];
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return path.join(process.cwd(), 'views');
};

// 뷰 엔진 설정
app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', resolveViewsDir());

// 정적 파일 제공 경로 자동 감지
const resolvePublicDir = (): string => {
    const candidates = [
        path.join(process.cwd(), 'public'),
        path.resolve(__dirname, '../public'),
        path.resolve(__dirname, '../../public')
    ];
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return path.join(process.cwd(), 'public');
};

app.use(express.static(resolvePublicDir()));

// 바디 파서 미들웨어
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 세션 미들웨어
app.use(
    session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60, // 1시간
            httpOnly: true
        }
    })
);

// 라우터 연결 (루트 및 Vercel rewrite /api 경로 동시 지원)
app.use('/', quizRouter);
app.use('/api', quizRouter);

// 404 핸들러
app.use((req, res) => {
    res.status(404).render('index', { error: '페이지를 찾을 수 없습니다.' });
});

// 전역 에러 핸들러 (Vercel에서 500 크래시 방지 및 원인 출력)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Server Error]:', err);
    res.status(500).send(`
        <div style="font-family: sans-serif; padding: 24px;">
            <h2>500 - 서버 오류가 발생했습니다</h2>
            <pre style="background: #f8f9fa; padding: 16px; border-radius: 8px; border: 1px solid #ddd; overflow: auto;">
${err.stack || err.message || err}
            </pre>
            <a href="/">메인으로 돌아가기</a>
        </div>
    `);
});

export default app;

