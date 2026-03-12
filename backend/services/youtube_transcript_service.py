import logging
from youtube_transcript_api import YouTubeTranscriptApi
from models.transcript import Transcript

logger = logging.getLogger(__name__)
_api = YouTubeTranscriptApi()


def get_transcript(video_id: str) -> Transcript:
    logger.info("Fetching transcript for video_id=%s", video_id)
    fetched = _api.fetch(video_id=video_id)
    transcript = Transcript.from_fetched(fetched)
    logger.info("Fetched %d snippets for video_id=%s", len(transcript.snippets), video_id)
    return transcript
