from langchain_core.language_models import BaseChatModel


def create_llm(provider: str, model: str, api_key: str) -> BaseChatModel:
    if provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(model=model, google_api_key=api_key)
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model=model, api_key=api_key)
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(model=model, api_key=api_key)
    else:
        raise ValueError(f"Unsupported provider: {provider}")
