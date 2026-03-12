from pydantic import BaseModel
from youtube_transcript_api import FetchedTranscriptSnippet


def _format_time(seconds: float) -> str:
    total = int(seconds)
    h, remainder = divmod(total, 3600)
    m, s = divmod(remainder, 60)
    if h:
        return f"{h}:{m:02}:{s:02}"
    return f"{m}:{s:02}"


class Snippet(BaseModel):
    text: str
    start: str
    end: str


class Transcript(BaseModel):
    snippets: list[Snippet]

    def __str__(self) -> str:
        return "\n".join(f"[{s.start} - {s.end}] {s.text}" for s in self.snippets)

    @classmethod
    def from_fetched(cls, fetched: list[FetchedTranscriptSnippet]) -> "Transcript":
        return cls(snippets=[
            Snippet(
                text=snippet.text,
                start=_format_time(snippet.start),
                end=_format_time(snippet.start + snippet.duration),
            )
            for snippet in fetched
        ])
