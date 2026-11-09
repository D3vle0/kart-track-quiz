/**
 * 한글 문자열에서 초성을 추출하는 유틸리티
 */
const CHOSUNG_LIST = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export function getChosung(text: string): string {
    let result = '';

    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);

        // 한글 완성형 유니코드 범위: 44032 (가) ~ 55203 (힣)
        if (code >= 44032 && code <= 55203) {
            const chosungIndex = Math.floor((code - 44032) / 588);
            result += CHOSUNG_LIST[chosungIndex];
        } else {
            // 영문, 숫자, 공백 등은 그대로 유지
            result += text.charAt(i);
        }
    }

    return result;
}
