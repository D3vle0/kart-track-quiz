export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    sessionSecret: process.env.SESSION_SECRET || 'kart-track-quiz-secret-2026',
    isDev: process.env.NODE_ENV !== 'production'
};
