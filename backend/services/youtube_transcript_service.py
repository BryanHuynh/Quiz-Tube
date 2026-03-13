import logging
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import WebshareProxyConfig, GenericProxyConfig
from models.transcript import Transcript
from config import PROXY_USERNAME, PROXY_PASSWORD, PROXY_URL

logger = logging.getLogger(__name__)


def _build_api() -> YouTubeTranscriptApi:
    if PROXY_USERNAME and PROXY_PASSWORD:
        logger.info("Using Webshare proxy for YouTube transcript API")
        return YouTubeTranscriptApi(
            proxy_config=WebshareProxyConfig(
                proxy_username=PROXY_USERNAME,
                proxy_password=PROXY_PASSWORD,
            )
        )
    if PROXY_URL:
        logger.info("Using generic proxy for YouTube transcript API")
        return YouTubeTranscriptApi(
            proxy_config=GenericProxyConfig(
                http_url=PROXY_URL,
                https_url=PROXY_URL,
            )
        )
    logger.warning("No proxy configured")
    return YouTubeTranscriptApi()


_api = _build_api()


def get_transcript(video_id: str) -> Transcript:
    logger.info("Fetching transcript for video_id=%s", video_id)
    fetched = _api.fetch(video_id=video_id)
    transcript = Transcript.from_fetched(fetched)
    logger.info("Fetched %d snippets for video_id=%s", len(transcript.snippets), video_id)
    return transcript
