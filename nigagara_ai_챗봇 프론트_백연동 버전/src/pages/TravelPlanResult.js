/* TravelPlanResult.js */
import React from 'react';
import './TravelPlanResult.css';

function TravelPlanResult({ travelData }) {
    /* travelData 예:
     {
       date: "2025-04-15",
       totalCost: 68000,
       plan: [
         { time: "오전", place: "청량리역 -> 가평역 -> 아침고요수목원 산책" },
         { time: "오후", place: "자전거 라이딩 -> 잣향기푸른숲" },
         ...
       ]
     }
    */

    return (
        <div className="travel-plan-container">
            <h2>여행 일정 결과</h2>
            <p>날짜: {travelData?.date}</p>
            <p>예상 경비: {travelData?.totalCost?.toLocaleString()}원</p>

            <ul>
                {travelData?.plan?.map((item, idx) => (
                    <li key={idx}>
                        <strong>{item.time}</strong>: {item.place}
                    </li>
                ))}
            </ul>

            <button onClick={() => window.location.href = '/map'}>
                지도에서 확인하기
            </button>
        </div>
    );
}

export default TravelPlanResult;
