from flask import Flask, jsonify, request, render_template
import openai
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Document, GPTVectorStoreIndex
# from llama_index.vector_stores.faiss import FaissVectorStore -> 외장 Vector DB로는 무리 내장으로 써야할듯?
import faiss
from llama_index.core import StorageContext, load_index_from_storage
from groq import Groq
from openai import OpenAI
import json
import os
import jinja2
from flask_cors import CORS

# API Key 설정
# 임시로 노출
OPENAI_API_KEY = ''
GROQ_API_KEY = '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'
os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY
os.environ['GROQ_API_KEY'] = GROQ_API_KEY

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)  # 모든 도메인에서 접근 허용

app.config['JSON_AS_ASCII'] = False

# index dump 없을 때 실행시키는 코드
# document = SimpleDirectoryReader('./data').load_data()
# index = GPTVectorStoreIndex.from_documents(document)
# index.storage_context.persist('index_db_backup')



# 외장 Vector DB로 실행시키는 코드
# 왜인지는 모르겠지만 계속 에러뜸, 사용금지;;;;
# faiss_index = faiss.IndexFlatL2(1536)
# document = SimpleDirectoryReader('./data').load_data()
# vectorstore = FaissVectorStore(faiss_index=faiss_index)
# storage_context = StorageContext.from_defaults(vector_store=vectorstore)
# index = GPTVectorStoreIndex.from_documents(
#     document,
#     storage_context = storage_context
# )
# index.storage_context.persist('index_db_backup')


# 이미 생성된 VectorDB 내용 가져오기
storage_context = StorageContext.from_defaults(persist_dir='./index_db_backup')
index    = load_index_from_storage(storage_context)
query_engine = index.as_query_engine()



client_groq = Groq(
    api_key=os.environ.get(GROQ_API_KEY)
)

# 키워드를 추출하는 함수
def extract_region_and_keywords(text):
    # 예시: 한국 주요 도시 및 키워드 패턴 (프로젝트에 맞게 확장 가능)
    regions = ["종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랴구", "성북구", "강북구",
                "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구", "구로구", "금천구",
                  "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구", "강동구"]
    keywords = ["문화시설", "축제", "공연", "행사", "관광지", "여행코스", "레포츠", "숙박", "쇼핑", "음식점"]
    types = ["근처", "인근", "주변"]
    
    region = next((r for r in regions if r in text), None)
    keyword = next((k for k in keywords if k in text), None)
    types = next((t for t in types if t in text), None)
    
    return region, keyword, types

# Groq 답변
def tour_query_korean(query):
  res = query_engine.query(query)
  sys_prompt = f'''
지침:
- 도움이 되고 간결하게 답할 것. 답을 모르면 '잘 모르겠어요'라고 말할 것
- 정확하고 구체적인 정보를 얻기 위해 제공된 맥락을 활용할 것
- 기존 지식을 통합하여 답변의 깊이와 관련성을 높일 것
- 출처를 밝힐 것
- 답변은 반드시 한국어로 할 것
- 사용자가 질문한 지역과 일치하는 지역만 검색할 것
- 아래 적힌 내용만 사용해서 검색할 것
내용: {res}
'''

  completion = client_groq.chat.completions.create(
      model = 'llama3-8b-8192',
      messages = [
          {
              'role': 'system',
              'content': sys_prompt
          },
          {
              'role':'user',
              'content': query
          }
      ]
  )
  print('index query: ',res)
  return completion.choices[0].message.content



client_openai = OpenAI(
    api_key=os.environ.get(OPENAI_API_KEY)
)

# OpenAI 답변
def tour_query_openai_korean(query):
  res = query_engine.query(query)
  print('index query: ',res)
  sys_prompt = f'''
지침:
- 너는 도움되는 여행 플래너이다.
- 도움이 되고 자세하게 답할 것. 답을 모르면 '잘 모르겠어요'라고 말할 것
- 정확하고 구체적인 정보를 얻기 위해 제공된 맥락을 활용할 것
- 기존 지식을 통합하여 답변의 깊이와 관련성을 높일 것
- 출처를 밝힐 것
- 답변은 반드시 한국어로 할 것
- 사용자가 질문한 지역과 일치하는 지역만 검색할 것
- 아래 적힌 내용만 사용해서 검색할 것
내용: {res}
'''
  answer = client_openai.chat.completions.create(
      model = 'gpt-4o-mini',
      messages = [
          {
              'role': 'system',
              'content': sys_prompt
          },
          {
              'role':'user',
              'content': query
          }
      ],
      temperature=0.6,
      max_tokens=500
  )
  return answer.choices[0].message.content

def tour_query_openai_korean_jinja2(query):
  region, keyword, types = extract_region_and_keywords(query)
  print(f'추출된 키워드: {region}, {keyword}, {types}')
  res = query_engine.query(query+f"여기서 {region}, {keyword}, {types}위주로 검색해줘")
  print('index query: ',res)
  sys_prompt = f'''
지침:
- 너는 도움되는 여행 플래너이다.
- 도움이 되고 자세하게 답할 것. 답을 모르면 '잘 모르겠어요'라고 말할 것
- 정확하고 구체적인 정보를 얻기 위해 제공된 맥락을 활용할 것
- 기존 지식을 통합하여 답변의 깊이와 관련성을 높일 것
- 출처를 밝힐 것
- 답변은 반드시 한국어로 할 것
- {keyword} 지역과 일치하는 지역만 검색할 것
- 아래 적힌 내용만 사용해서 검색할 것
주요내용: {region if region is not None else ""}, {keyword if keyword is not None else ""}, {types if types is not None else ""}
내용: {res}
'''
  answer = client_openai.chat.completions.create(
      model = 'gpt-4o-mini',
      messages = [
          {
              'role': 'system',
              'content': sys_prompt
          },
          {
              'role':'user',
              'content': query
          }
      ],
      temperature=0.6,
      max_tokens=1000
  )
  return answer.choices[0].message.content


@app.route('/api/groq')
def query_groq():
  query = '영등포구 관광지 추천해줘'
  answer = tour_query_korean(query)
  return json.dumps({'answer':answer}, ensure_ascii=False)

@app.route('/api/openai')
def query_openai():
  query = '영등포구 관광지 추천해줘'
  answer = tour_query_openai_korean(query)
  return json.dumps({'answer':answer}, ensure_ascii=False)

@app.route('/api/post/groq', methods=['POST'])
def query_groq_post():
  request_data = request.get_json()
  query = request_data["query"]
  return json.dumps({'query':tour_query_korean(query)}, ensure_ascii=False)

@app.route('/api/post/openai', methods=['POST'])
def query_openai_post():
  request_data = request.get_json()
  query = request_data["query"]
  return json.dumps({'query':tour_query_openai_korean(query)}, ensure_ascii=False)

@app.route('/api/post/openai/v2', methods=['POST'])
def query_openai_post_v2():
  request_data = request.get_json()
  query = request_data["query"]
  return json.dumps({'query':tour_query_openai_korean_jinja2(query)}, ensure_ascii=False)

# Flask 실행
if __name__ == '__main__':
  app.run(debug=True)