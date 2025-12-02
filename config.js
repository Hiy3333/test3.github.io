// GPT API 설정
// ⚠️ 주의: 이 파일은 클라이언트에 노출되므로 API key가 보안상 위험할 수 있습니다.
// 프로덕션 환경에서는 백엔드 서버를 통해 API를 호출하는 것을 권장합니다.

const CONFIG = {
    // OpenAI API Key를 여기에 입력하세요
    // https://platform.openai.com/api-keys 에서 발급받을 수 있습니다
    OPENAI_API_KEY: 'YOUR_API_KEY_HERE',
    
    // 사용할 모델 (gpt-3.5-turbo 또는 gpt-4)
    MODEL: 'gpt-3.5-turbo',
    
    // 시스템 프롬프트 (챗봇의 역할 설정)
    SYSTEM_PROMPT: '당신은 Soltine 화장품 브랜드의 친절한 고객 서비스 담당자입니다. 제품 정보, 성분, 구매, 배송 등에 대해 도움을 드립니다. 항상 친절하고 전문적으로 답변해주세요.'
};

