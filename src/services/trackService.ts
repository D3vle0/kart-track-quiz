import path from 'path';
import fs from 'fs';
import { Track, QuizSubmission, QuizGradingDetail, QuizResult } from '../types/track';

class TrackService {
    private tracks: Track[] = [];
    private trackMap: Map<string, Track> = new Map();
    private themes: string[] = [];

    constructor() {
        this.loadTracks();
    }

    private loadTracks(): void {
        let parsed: Array<{ id: string; name: string }> | null = null;

        // 1. require를 통한 정적 번들 로드 시도 (Vercel 및 번들러 자동 추적)
        try {
            parsed = require('../../public/track.json');
        } catch (_) {
            // require 실패 시 파일 시스템 탐색으로 진행
        }

        // 2. 파일 시스템 다각도 탐색 (Vercel /var/task 및 로컬 빌드 대응)
        if (!parsed || !Array.isArray(parsed)) {
            const candidates = [
                path.join(process.cwd(), 'public/track.json'),
                path.resolve(__dirname, '../../public/track.json'),
                path.resolve(__dirname, '../public/track.json')
            ];

            for (const candidate of candidates) {
                if (fs.existsSync(candidate)) {
                    try {
                        const rawData = fs.readFileSync(candidate, 'utf-8');
                        parsed = JSON.parse(rawData);
                        break;
                    } catch (e) {
                        console.warn(`[TrackService] 파일 파싱 실패: ${candidate}`, e);
                    }
                }
            }
        }

        if (!parsed || !Array.isArray(parsed)) {
            console.error('[TrackService] 트랙 데이터 로드 실패: track.json을 찾을 수 없습니다.');
            this.tracks = [];
            return;
        }

        const themeSet = new Set<string>();

        this.tracks = parsed.map((item) => {
            const theme = item.name.split(' ')[0] || '기타';
            themeSet.add(theme);
            const track: Track = {
                id: item.id,
                name: item.name,
                theme
            };
            this.trackMap.set(item.id, track);
            return track;
        });

        this.themes = Array.from(themeSet).sort();
        console.log(`[TrackService] 총 ${this.tracks.length}개 트랙, ${this.themes.length}개 테마 로드 완료`);
    }

    public getAllTracks(): Track[] {
        return this.tracks;
    }

    public getTrackById(id: string): Track | undefined {
        return this.trackMap.get(id);
    }

    public getAllThemes(): string[] {
        return this.themes;
    }

    /**
     * Fisher-Yates 셔플 기반으로 중복 없이 지정한 개수의 문제를 무작위로 선택합니다.
     */
    public createQuiz(selectedThemes: string[] = [], count: number = 10): Track[] {
        let pool = this.tracks;

        if (selectedThemes.length > 0) {
            const themeSet = new Set(selectedThemes);
            const filtered = this.tracks.filter((track) => themeSet.has(track.theme));
            // 필터링된 결과가 있다면 해당 풀 사용, 없다면 전체 풀 사용
            if (filtered.length > 0) {
                pool = filtered;
            }
        }

        // 배열 복사 후 셔플
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    /**
     * 정답 판정: 공백 및 대소문자 차이를 유연하게 처리합니다.
     */
    public isAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
        const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase().trim();
        return normalize(userAnswer) === normalize(correctAnswer);
    }

    /**
     * 제출된 답변들을 채점합니다.
     */
    public gradeQuiz(submissions: QuizSubmission[]): QuizResult {
        let correctCount = 0;
        const details: QuizGradingDetail[] = [];

        submissions.forEach((sub, idx) => {
            const track = this.trackMap.get(sub.trackId);
            const correctAnswer = track ? track.name : '알 수 없음';
            const isCorrect = this.isAnswerCorrect(sub.userAnswer || '', correctAnswer);

            if (isCorrect) {
                correctCount++;
            }

            details.push({
                index: idx + 1,
                trackId: sub.trackId,
                userAnswer: (sub.userAnswer || '').trim(),
                correctAnswer,
                isCorrect
            });
        });

        const totalCount = submissions.length;
        const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

        return {
            score,
            correctCount,
            totalCount,
            details
        };
    }
}

export const trackService = new TrackService();
