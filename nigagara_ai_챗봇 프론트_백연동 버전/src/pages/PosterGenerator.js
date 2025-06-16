/* PosterGenerator.js */
import React, { useState } from 'react';

function PosterGenerator() {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleGenerate = async () => {
        try {
            const res = await fetch('/api/image-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            setImageUrl(data?.imageUrl);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2>여행 포스터 생성</h2>
            <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="생성할 포스터의 컨셉이나 키워드를 입력하세요."
            />
            <button onClick={handleGenerate}>생성하기</button>

            {imageUrl && (
                <div>
                    <img src={imageUrl} alt="poster preview" style={{ maxWidth: '300px' }} />
                    <button onClick={() => window.open(imageUrl, '_blank')}>이미지 새창으로 보기</button>
                </div>
            )}
        </div>
    );
}

export default PosterGenerator;
