// Home.js
import React from 'react';
import '../pages/Home.css';

function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-lg font-semibold text-center">
                당신만을 위한 맞춤 여행 일정을 AI가 만들어 드려요!
            </h2>
            <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={() => window.location.href = '/chatbot'}
            >
                지금 바로 시작하기
            </button>
        </div>
    );
}

export default Home;
