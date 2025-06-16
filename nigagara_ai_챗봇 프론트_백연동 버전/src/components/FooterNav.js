// FooterNav.js
import React from 'react';
import { Link } from 'react-router-dom';

function FooterNav() {
    return (
        <nav
            className="bg-blue-500 text-white fixed bottom-0 w-full max-w-md mx-auto h-14 flex justify-around items-center text-xs sm:text-sm shadow-lg z-50">
            <Link to="/">🏠 홈</Link>
            <Link to="/chatbot">💬 여행 챗봇</Link>
            <Link to="/map">🗺️ 지도</Link>
            <Link to="/poster">🖼️ 포스터</Link>
        </nav>
    );
}

export default FooterNav;
