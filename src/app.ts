import express from 'express';
import session from 'express-session';
import path from 'path';
import { config } from './config';
import { quizRouter } from './routes/quizRouter';

export const app = express();

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, '../views'));

// 정적 파일 제공
app.use(express.static(path.resolve(__dirname, '../public')));

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
