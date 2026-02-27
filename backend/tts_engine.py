import asyncio
import edge_tts
import os
from pathlib import Path
from typing import Dict, List

# Voice mappings
VOICE_MAP = {
    "narrator": "zh-CN-XiaoxiaoNeural",
    "child": "zh-CN-XiaoyiNeural",
    "male": "zh-CN-YunxiNeural",
    "female": "zh-CN-XiaochenNeural",
}


async def synthesize_text(text: str, voice: str, output_file: str) -> str:
    """Synthesize text to speech and save to file."""
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)
    return output_file


async def synthesize_page_audio(
    page: Dict,
    characters: Dict,
    output_dir: str,
    page_index: int
) -> List[str]:
    """Synthesize audio for a single page, returns list of audio file paths."""
    audio_paths = []

    # Synthesize narrator
    narrator_text = page.get("narrator", "")
    if narrator_text:
        narrator_path = os.path.join(output_dir, f"page_{page_index}_narrator.mp3")
        await synthesize_text(narrator_text, VOICE_MAP["narrator"], narrator_path)
        audio_paths.append(narrator_path)

    # Synthesize dialogues
    dialogues = page.get("dialogues", [])
    for i, dialogue in enumerate(dialogues):
        character_name = dialogue.get("character", "")
        text = dialogue.get("text", "")

        if not text:
            continue

        # Get voice for this character
        voice = VOICE_MAP["narrator"]  # default

        if character_name in characters:
            char_info = characters[character_name]
            char_voice = char_info.get("voice", "")
            if char_voice:
                voice = char_voice

        dialogue_path = os.path.join(output_dir, f"page_{page_index}_dialogue_{i}.mp3")
        await synthesize_text(text, voice, dialogue_path)
        audio_paths.append(dialogue_path)

    return audio_paths


async def synthesize_speech(
    page: Dict,
    characters: Dict,
    output_dir: str,
    page_index: int
) -> str:
    """Main function to synthesize speech for a page.
    Returns the path to the main audio file (first audio or combined)."""
    audio_paths = await synthesize_page_audio(page, characters, output_dir, page_index)

    if not audio_paths:
        # Create empty placeholder
        placeholder_path = os.path.join(output_dir, f"page_{page_index}_narrator.mp3")
        return placeholder_path

    # Return the first audio file path as the main one
    return audio_paths[0]
