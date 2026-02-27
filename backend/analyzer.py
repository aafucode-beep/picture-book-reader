import base64
import httpx
import json
from typing import List, Dict

# MiniMax API configuration
BASE_URL = "https://api.minimaxi.com/anthropic"
API_KEY = "sk-api-zaKUk19gv0vq9esMrsqKua1IKgE6ynGvMK16WmPEm-Iij8qwLGW5WusNWr_P0O5ABTtdwB-GlpjdSxKJ3YOa-pp1NDXLgPRnmRT2MPQBpBR5z5vTTFTvbv4"
MODEL = "MiniMax-M2.5"


def encode_image(image_path: str) -> str:
    """Encode image to base64."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


async def analyze_images(image_paths: List[str]) -> Dict:
    """Analyze images and return structured JSON with narrator, characters, and emotions."""

    # Build the prompt for analyzing picture book pages
    system_prompt = """你是一个专业的绘本分析助手。请分析用户上传的绘本图片序列，每页图片包含：
1. 旁白文本（narrator）：用温柔的语气描述画面
2. 角色台词（dialogues）：每个角色的台词、角色名、情感
3. 场景描述（scene_description）：简要描述页面内容

请按以下JSON格式返回分析结果，确保每页都有内容：
{
  "pages": [
    {
      "page_number": 1,
      "scene_description": "场景描述",
      "narrator": "旁白文本",
      "dialogues": [
        {"character": "角色名", "text": "台词", "emotion": "情感"}
      ]
    }
  ],
  "characters": {
    "角色名": {"gender": "male/female", "age": "child/adult", "voice": "voice_name"}
  }
}

重要：
- 角色voice字段使用：zh-CN-XiaoyiNeural（儿童）、zh-CN-YunxiNeural（成年男性）、zh-CN-XiaochenNeural（成年女性）、zh-CN-XiaoxiaoNeural（旁白）
- 如果是旁白，voice使用zh-CN-XiaoxiaoNeural
- 如果是儿童角色，voice使用zh-CN-XiaoyiNeural
- 如果是成年男性角色，voice使用zh-CN-YunxiNeural
- 如果是成年女性角色，voice使用zh-CN-XiaochenNeural
- 保持角色一致性，同样的角色使用同样的voice
- 用中文返回所有文本"""

    # Prepare messages with images
    messages = []

    # Add first image with full prompt
    first_image_base64 = encode_image(image_paths[0])
    messages.append({
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": first_image_base64
                }
            },
            {
                "type": "text",
                "text": f"这是绘本的第1页（封面）。请分析这张图片以及后续页面，返回完整的JSON结构。{system_prompt}"
            }
        ]
    })

    # Add subsequent images
    for i, image_path in enumerate(image_paths[1:], start=2):
        image_base64 = encode_image(image_path)
        messages.append({
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": image_base64
                    }
                },
                {
                    "type": "text",
                    "text": f"这是绘本的第{i}页。请继续分析并返回相同的JSON格式。"
                }
            ]
        })

    # Make API call
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/v1/messages",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": MODEL,
                "max_tokens": 4096,
                "messages": messages,
                "system": system_prompt
            }
        )

    if response.status_code != 200:
        raise Exception(f"MiniMax API error: {response.status_code} - {response.text}")

    result = response.json()

    # Extract JSON from response
    content = result.get("content", [])
    if isinstance(content, list) and len(content) > 0:
        # Find the text content
        for item in content:
            if item.get("type") == "text":
                text = item.get("text", "")
                # Try to extract JSON from the text
                try:
                    # Find JSON in the response
                    start_idx = text.find("{")
                    end_idx = text.rfind("}") + 1
                    if start_idx >= 0 and end_idx > start_idx:
                        json_str = text[start_idx:end_idx]
                        parsed = json.loads(json_str)
                        return parsed
                except json.JSONDecodeError:
                    pass

    # If we couldn't parse JSON, return the raw text
    raise Exception(f"Failed to parse analysis result: {result}")
