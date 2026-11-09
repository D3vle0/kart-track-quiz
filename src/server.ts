import { createServer } from 'http';
import { app } from './app';
import { config } from './config';

const server = createServer(app);

/**
 * 포트 바인딩 및 에러 처리 (포트 충돌 자동 방어)
 */
function startServer(port: number, maxRetries = 5, attempt = 0) {
    server.listen(port, () => {
        console.log('\n======================================================');
        console.log('🏁 [Kart Track Quiz] 카트라이더 트랙 맞히기 서버 실행');
        console.log(`🌐 접속 주소: http://localhost:${port}`);
        console.log('======================================================\n');
    });

    server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`[Server] 포트 ${port}가 이미 사용 중입니다.`);
            if (attempt < maxRetries) {
                const nextPort = port + 1;
                console.log(`[Server] 포트 ${nextPort}로 자동 전환하여 재시도합니다... (시도 ${attempt + 1}/${maxRetries})`);
                startServer(nextPort, maxRetries, attempt + 1);
            } else {
                console.error(`[Server] 사용 가능한 포트를 찾지 못했습니다. 다른 프로세스를 종료하거나 PORT 환경변수를 지정해주세요.`);
                process.exit(1);
            }
        } else {
            console.error('[Server] 서버 시작 중 예기치 않은 오류 발생:', err);
            process.exit(1);
        }
    });
}

// 시작
startServer(config.port);

// Graceful Shutdown
const handleShutdown = (signal: string) => {
    console.log(`\n[Server] ${signal} 수신, 서버를 안전하게 종료합니다...`);
    server.close(() => {
        console.log('[Server] 서버가 정상적으로 종료되었습니다.');
        process.exit(0);
    });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
