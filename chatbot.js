// GPT API를 사용하는 챗봇

let conversationHistory = [];
let speechBubbleTimeout = null;
let speechBubbleInterval = null;

// 친근하게 말을 거는 메시지들
const friendlyMessages = [
    '안녕하세요! 궁금한 것이 있으신가요? 😊',
    '제품에 대해 물어보고 싶으신가요?',
    '도움이 필요하시면 언제든지 말씀해주세요!',
    'Soltine 제품이 궁금하신가요?',
    '성분이나 사용법에 대해 알려드릴 수 있어요!',
    '어떤 도움이 필요하신가요?',
    '궁금한 점이 있으시면 물어보세요!',
    '제품 추천이 필요하신가요?'
];

// 챗봇 모달 열기/닫기
document.addEventListener('DOMContentLoaded', function() {
    const chatbotButton = document.getElementById('chatbotButton');
    const chatbotModal = document.getElementById('chatbotModal');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotInput = document.getElementById('chatbotInput');

    // 챗봇 버튼 클릭 시 모달 열기
    if (chatbotButton) {
        chatbotButton.addEventListener('click', function() {
            hideSpeechBubble(); // 말풍선 숨기기
            if (chatbotModal) {
                chatbotModal.style.display = 'flex';
                chatbotInput.focus();
            }
        });
        
        // 말풍선 기능 시작
        startFriendlyChat();
    }

    // 닫기 버튼
    if (chatbotClose) {
        chatbotClose.addEventListener('click', function() {
            if (chatbotModal) {
                chatbotModal.style.display = 'none';
            }
        });
    }

    // 모달 외부 클릭 시 닫기
    if (chatbotModal) {
        chatbotModal.addEventListener('click', function(e) {
            if (e.target === chatbotModal) {
                chatbotModal.style.display = 'none';
            }
        });
    }

    // 전송 버튼 클릭
    if (chatbotSend) {
        chatbotSend.addEventListener('click', sendMessage);
    }

    // Enter 키로 전송
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// 메시지 전송 함수
async function sendMessage() {
    const input = document.getElementById('chatbotInput');
    const messagesContainer = document.getElementById('chatbotMessages');
    
    if (!input || !messagesContainer) return;
    
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // API Key 확인
    if (!CONFIG || !CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'YOUR_API_KEY_HERE') {
        addMessage('시스템', 'API Key가 설정되지 않았습니다. config.js 파일에서 API Key를 설정해주세요.', 'error');
        return;
    }

    // 사용자 메시지 표시
    addMessage('사용자', userMessage, 'user');
    input.value = '';
    input.disabled = true;

    // 로딩 메시지 표시
    const loadingId = addMessage('봇', '답변을 생성하는 중...', 'bot', true);

    try {
        // 대화 기록에 사용자 메시지 추가
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        // OpenAI API 호출
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [
                    { role: 'system', content: CONFIG.SYSTEM_PROMPT },
                    ...conversationHistory
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API 요청 실패');
        }

        const data = await response.json();
        const botMessage = data.choices[0].message.content;

        // 로딩 메시지 제거
        removeMessage(loadingId);

        // 봇 메시지 표시
        addMessage('봇', botMessage, 'bot');

        // 대화 기록에 봇 메시지 추가
        conversationHistory.push({
            role: 'assistant',
            content: botMessage
        });

        // 대화 기록이 너무 길어지면 최근 10개만 유지
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

    } catch (error) {
        console.error('Chatbot error:', error);
        removeMessage(loadingId);
        addMessage('시스템', `오류가 발생했습니다: ${error.message}`, 'error');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

// 메시지 추가 함수
function addMessage(sender, text, type, isLoading = false) {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return null;

    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now() + '-' + Math.random();
    messageDiv.id = messageId;
    messageDiv.className = `chatbot-message ${type}-message`;
    
    if (isLoading) {
        messageDiv.classList.add('loading');
    }

    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);

    // 스크롤을 맨 아래로
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageId;
}

// 메시지 제거 함수
function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const chatbotModal = document.getElementById('chatbotModal');
        if (chatbotModal && chatbotModal.style.display === 'flex') {
            chatbotModal.style.display = 'none';
            startFriendlyChat(); // 모달 닫으면 다시 말풍선 시작
        }
    }
});

// 친근하게 말을 거는 기능
function startFriendlyChat() {
    // 기존 인터벌 정리
    if (speechBubbleInterval) {
        clearInterval(speechBubbleInterval);
    }
    
    // 처음 말풍선 표시 (3초 후)
    setTimeout(() => {
        showRandomMessage();
    }, 3000);
    
    // 이후 주기적으로 말풍선 표시 (15-25초 간격)
    speechBubbleInterval = setInterval(() => {
        showRandomMessage();
    }, 15000 + Math.random() * 10000); // 15-25초 사이 랜덤
}

// 랜덤 메시지 표시
function showRandomMessage() {
    const chatbotButton = document.getElementById('chatbotButton');
    if (!chatbotButton) return;
    
    // 이미 말풍선이 있으면 제거
    hideSpeechBubble();
    
    // 랜덤 메시지 선택
    const randomMessage = friendlyMessages[Math.floor(Math.random() * friendlyMessages.length)];
    
    // 말풍선 생성
    const speechBubble = document.createElement('div');
    speechBubble.className = 'chatbot-speech-bubble';
    speechBubble.textContent = randomMessage;
    
    chatbotButton.appendChild(speechBubble);
    
    // 나타나는 애니메이션
    setTimeout(() => {
        speechBubble.classList.add('show');
    }, 10);
    
    // 5초 후 자동으로 사라짐
    speechBubbleTimeout = setTimeout(() => {
        hideSpeechBubble();
    }, 5000);
}

// 말풍선 숨기기
function hideSpeechBubble() {
    const chatbotButton = document.getElementById('chatbotButton');
    if (!chatbotButton) return;
    
    const speechBubble = chatbotButton.querySelector('.chatbot-speech-bubble');
    if (speechBubble) {
        speechBubble.classList.remove('show');
        setTimeout(() => {
            speechBubble.remove();
        }, 300);
    }
    
    if (speechBubbleTimeout) {
        clearTimeout(speechBubbleTimeout);
        speechBubbleTimeout = null;
    }
}
