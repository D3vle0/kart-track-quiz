import express from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { config } from './config';
import { quizRouter } from './routes/quizRouter';

export const app = express();

// 뷰 템플릿 디렉터리 경로 자동 감지 (로컬 및 Vercel 서버리스 환경 완벽 호환)
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

// 라우터 연결
app.use('/', quizRouter);

// 404 핸들러
app.use((req, res) => {
    res.status(404).render('index', { error: '페이지를 찾을 수 없습니다.' });
});
