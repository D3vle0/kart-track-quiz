import { Track, QuizSubmission, QuizGradingDetail, QuizResult } from '../types/track';
import rawTrackData from '../data/track.json';

class TrackService {
    private tracks: Track[] = [];
    private trackMap: Map<string, Track> = new Map();
    private themes: string[] = [];

    constructor() {
        this.loadTracks();
    }

    private loadTracks(): void {
        const parsed = rawTrackData as Array<{ id: string; name: string }>;
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
            if (filtered.length > 0) {
                pool = filtered;
            }
        }

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
