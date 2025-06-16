import React, { useEffect, useState } from 'react';

// ✅ 환경 변수에서 카카오 API 키 가져오기
const KAKAO_API_KEY = process.env.REACT_APP_KAKAO_API_KEY;

function MapView() {
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [geocoder, setGeocoder] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUserModified, setIsUserModified] = useState(false);

    // ✅ 카카오 맵 API를 동적으로 로드하는 함수
    const loadKakaoMap = () => {
        return new Promise((resolve) => {
            if (window.kakao && window.kakao.maps) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    };

    // ✅ 지도 초기화 및 저장된 위치 로드
    useEffect(() => {
        loadKakaoMap().then(() => {
            initializeMap();
        });
    }, []);

    const initializeMap = () => {
        if (!window.kakao || !window.kakao.maps) {
            console.error("❌ 카카오맵 API가 아직 로드되지 않았습니다.");
            return;
        }

        const container = document.getElementById('map');
        const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 기본 위치: 서울
            level: 5,
        };

        const newMap = new window.kakao.maps.Map(container, options);
        setMap(newMap);
        setGeocoder(new window.kakao.maps.services.Geocoder());

        // ✅ 로컬스토리지에서 저장된 위치 불러오기 (새로고침 유지)
        const savedPosition = localStorage.getItem("savedPosition");
        if (savedPosition) {
            const { lat, lng } = JSON.parse(savedPosition);
            updateMarkerPosition(lat, lng, false);
        }
    };

    // ✅ 현재 위치 가져오기 (GPS 기반 또는 저장된 위치)
    const handleLocationClick = () => {
        const savedPosition = localStorage.getItem("savedPosition");

        if (savedPosition) {
            // ✅ 저장된 위치로 이동
            const { lat, lng } = JSON.parse(savedPosition);
            updateMarkerPosition(lat, lng, false);
        } else {
            // ✅ GPS를 이용하여 현재 위치 가져오기
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        updateMarkerPosition(lat, lng, true);
                    },
                    (error) => {
                        console.error("❌ 위치 가져오기 실패:", error);
                        alert("위치 정보를 가져올 수 없습니다.");
                    },
                    {
                        enableHighAccuracy: true, // 높은 정확도 요청
                        timeout: 10000, // 10초 내 응답 없으면 타임아웃
                        maximumAge: 0 // 캐시된 위치 데이터 사용 안 함
                    }
                );
            } else {
                alert("❌ 브라우저에서 위치 정보를 지원하지 않습니다.");
            }
        }
    };

    // ✅ 마커 위치 업데이트 함수
    const updateMarkerPosition = (lat, lng, userModified = false) => {
        if (!map) {
            console.error("❌ 지도 객체(map)가 아직 생성되지 않았습니다.");
            return;
        }

        const position = new window.kakao.maps.LatLng(lat, lng);
        setCurrentPosition({ lat, lng });

        if (!marker) {
            const newMarker = new window.kakao.maps.Marker({
                position,
                map,
                draggable: isEditing
            });
            setMarker(newMarker);
        } else {
            marker.setPosition(position);
            marker.setDraggable(isEditing);
        }

        map.setCenter(position);

        // ✅ 사용자가 직접 위치를 수정한 경우, 변경된 위치를 로컬스토리지에 저장
        if (userModified) {
            localStorage.setItem("savedPosition", JSON.stringify({ lat, lng }));
        }

        // ✅ 현재 위치의 주소 변환
        if (geocoder) {
            geocoder.coord2Address(lng, lat, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    console.log("📌 현재 위치 주소:", result[0].address.address_name);
                }
            });
        }
    };

    // ✅ 현재 위치 수정 모드 변경
    const toggleEditMode = () => {
        if (!marker) {
            alert("📍 먼저 현재 위치를 가져오세요!");
            return;
        }

        setIsEditing((prev) => !prev);
        marker.setDraggable(!isEditing);

        if (!isEditing) {
            console.log("✏️ 현재 위치 수정 모드 활성화 (마커를 드래그하세요!)");
        } else {
            const position = marker.getPosition();
            const lat = position.getLat();
            const lng = position.getLng();
            console.log("✅ 현재 위치 수정 완료:", lat, lng);

            // ✅ 수정한 위치를 로컬스토리지에 저장하여 새로고침 후에도 유지됨
            localStorage.setItem("savedPosition", JSON.stringify({ lat, lng }));

            setCurrentPosition({ lat, lng });
            map.setCenter(position);
            setIsUserModified(true);
        }
    };

    return (
        <div className="flex flex-col h-full pb-16">
            <h2 className="text-center text-lg font-bold">📍 현재 위치 보기</h2>
            <div className="flex justify-center space-x-4 mt-4">
                <button
                    onClick={handleLocationClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    현재 위치 가져오기
                </button>
                <button
                    onClick={toggleEditMode}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition"
                >
                    {isEditing ? "현재 위치 수정 완료" : "현재 위치 수정"}
                </button>
            </div>
            <div id="map" className="w-full flex-1 mx-auto border border-gray-300 mt-4"></div>
        </div>
    );
}

export default MapView;
