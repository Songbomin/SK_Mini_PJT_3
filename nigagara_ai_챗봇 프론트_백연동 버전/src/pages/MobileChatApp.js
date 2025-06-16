// MobileChatApp.js
import React, { useState, useEffect } from 'react';
import { Send, Mic, PlusCircle, ArrowLeft, MoreVertical } from 'lucide-react';

const MobileChatApp = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: '안녕하세요! 한국 관광 정보를 알려드릴게요. 어떤 지역이나 관광지에 대해 알고 싶으신가요?', sender: 'bot', time: '오전 10:00' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 서버 API 호출 함수
  const processQuery = async (query) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/post/openai/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query }) // 요청 데이터 추가
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();

      console.log("📌 백엔드에서 받은 응답:", data); // 백엔드 응답 로그 추가

      // ✅ 기존: data.answer → 변경: data.query
      if (!data.query || typeof data.query !== "string") {
        console.error("🚨 API 응답이 올바르지 않습니다:", data);
        return "죄송합니다. 응답을 받을 수 없습니다.";
      }

      return data.query; // ✅ data.answer → data.query로 변경
    } catch (error) {
      console.error('API 호출 중 오류:', error);
      return '죄송합니다. 서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    }
  };




  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    // 사용자 메시지
    const newUserMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 서버 응답
      const responseText = await processQuery(inputText);

      // 봇 메시지
      const botReply = {
        id: messages.length + 2,
        text: responseText,
        sender: 'bot',
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error('응답 처리 중 오류:', error);

      // 오류 시 안내 메시지
      const errorMessage = {
        id: messages.length + 2,
        text: '죄송합니다. 응답을 생성하는 중에 문제가 발생했습니다. 다시 시도해 주세요.',
        sender: 'bot',
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 여러 줄 메시지 줄바꿈 처리
  const formatMessageText = (text) => {
    return text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < text.split('\n').length - 1 && <br />}
        </React.Fragment>
    ));
  };

  return (
      /*
      - flex-1        : 부모(div)가 남긴 나머지 공간을 모두 채워서, 채팅창이 상하로 충분히 커지도록 함
      - flex flex-col  : 자식들을 세로 방향 배치
      * 여기에서는 h-screen, max-w-md 등을 '절대'로 적용하지 않음
        왜냐하면 이미 App.js에서 전체 화면 높이, 폭이 제한되었기 때문
    */
  <div className="flex flex-col flex-1">

    {/* 상단 헤더 */}
    <header className="bg-blue-500 text-white py-3 px-4 flex items-center">
      <button className="mr-2">
        <ArrowLeft size={20} />
      </button>
      <div className="flex-1 flex items-center">
        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
          <span className="text-sm font-bold">투어</span>
        </div>
        <div>
          <h1 className="font-medium text-base">관광 정보 안내</h1>
          <p className="text-xs text-blue-100">한국 관광지 정보 제공</p>
        </div>
      </div>
      <button>
        <MoreVertical size={20} />
      </button>
    </header>

    {/* 메시지 영역: flex-1 + overflow-y-auto로 세로 스크롤 가능 */}
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.map((message) => (
          <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* 봇 아이콘 */}
            {message.sender === 'bot' && (
                <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center mr-2 mt-1">
                  <span className="text-xs text-white font-bold">투어</span>
                </div>
            )}

            {/* 말풍선 영역 */}
            <div
                className={`max-w-xs rounded-xl p-2.5 ${
                    message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                }`}
            >
              <p className="text-sm whitespace-pre-line">{formatMessageText(message.text)}</p>
              <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {message.time}
              </p>
            </div>
          </div>
      ))}

      {/* 로딩 시 3점 애니메이션 */}
      {isLoading && (
          <div className="flex justify-start">
            <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center mr-2 mt-1">
              <span className="text-xs text-white font-bold">투어</span>
            </div>
            <div className="max-w-xs rounded-xl p-3 bg-white text-gray-800 rounded-bl-none border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
      )}
    </div>

    {/* 입력 영역 */}
    <div className="bg-white border-t border-gray-200 p-2">
      <div className="flex items-center">
        <button className="text-gray-500 p-1.5 rounded-full hover:bg-gray-100">
          <PlusCircle size={22} />
        </button>
        <div className="flex-1 mx-1.5">
          <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="질문을 입력하세요..."
              className="w-full border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
          />
        </div>
        {inputText.trim() ? (
            <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className={`p-1.5 rounded-full ${isLoading ? 'bg-gray-300' : 'bg-blue-500'} text-white`}
            >
              <Send size={18} />
            </button>
        ) : (
            <button className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100">
              <Mic size={18} />
            </button>
        )}
      </div>
    </div>

  </div>
);
};

export default MobileChatApp;
