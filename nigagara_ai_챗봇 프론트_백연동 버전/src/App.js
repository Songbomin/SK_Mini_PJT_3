// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import MobileChatApp from './pages/MobileChatApp';
import TravelPlanResult from './pages/TravelPlanResult';
import MapView from './pages/MapView';
import PosterGenerator from './pages/PosterGenerator';
import FooterNav from './components/FooterNav';

function App() {
    const dummyData = {
        date: '2025-04-15',
        totalCost: 68000,
        plan: [
            { time: '오전', place: '청량리역 -> 가평역 -> 아침고요수목원 산책 -> 고로니café' },
            { time: '오후', place: '자전거 라이딩 -> 잣향기푸른숲 산책 -> 꽃코팅하기 체험' },
            { time: '저녁', place: '북한강변 산책로 -> 가평역 -> 서울 귀가' }
        ]
    };

    return (
        <div className="flex flex-col h-screen max-w-md w-full mx-auto bg-gray-50 shadow relative">
            <Router>
                <Header/>

                {/* ✅ 컨텐츠 영역 수정: flex-1 flex flex-col로 조정 */}
                <div className="flex-1 flex flex-col overflow-y-auto pb-16">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/chatbot" element={<MobileChatApp/>}/>
                        <Route path="/result" element={<TravelPlanResult travelData={dummyData}/>}/>
                        <Route path="/map" element={<MapView/>}/>
                        <Route path="/poster" element={<PosterGenerator/>}/>
                    </Routes>
                </div>

                {/* ✅ 하단 네비게이션 바 추가 */}
                <FooterNav/>
            </Router>
        </div>
    );
}

export default App;
