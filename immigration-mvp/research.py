#generic imports
import json
import ast
import os
#langchain imports

from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain.prompts import MessagesPlaceholder
from langchain.pydantic_v1 import BaseModel,HttpUrl
from langchain_community.retrievers import TavilySearchAPIRetriever
from langgraph.checkpoint.memory import MemorySaver
from langchain_community.document_loaders import FireCrawlLoader

#load env variables

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv(), override=True)

#define LLM

llm = ChatOpenAI(model = "gpt-4o-mini")

#memory to persist conversation within a session
memory = MemorySaver()

#langchain tool definitions

@tool
def search_web(query: str) -> str:
    "Tool used for searching the internet"
    try:
        retriever = TavilySearchAPIRetriever(k=3)
        result = retriever.invoke(query)
        return result
    except Exception as e:
        return f"Failed to perform web search. Error: {str(e)}"

class URLToolInput(BaseModel):
    url: HttpUrl

@tool("scrape_web", args_schema=URLToolInput)
def scrape_web(url: str):
    """Tool used for scraping contents from a website.
    Useful for getting better insights about a topic that is not possible with simple web search.
    Please note this tool can only accept URLs in the format 'http://abc.com'.
    Do not pass any other input to the tool other than the URL.

    Args:
        url (str): The URL of the website or a string representation of a dictionary containing the URL.

    Returns:
        str: A string containing the scraped content.
    """
    
    try:
        # First, try to parse as JSON
        url_dict = json.loads(url)
        if isinstance(url_dict, dict) and 'url' in url_dict:
            url = url_dict['url']
    except json.JSONDecodeError:
        try:
            # If JSON parsing fails, try to evaluate as a Python literal
            url_dict = ast.literal_eval(url)
            if isinstance(url_dict, dict) and 'url' in url_dict:
                url = url_dict['url']
        except (ValueError, SyntaxError):
            # If both methods fail, assume the input is the URL itself
            pass

    # Validate the URL format
    if not url.startswith('http://') and not url.startswith('https://'):
        return "Invalid URL format. Please provide a URL starting with 'http://' or 'https://'."
    
    try:
        loader = FireCrawlLoader(
        api_key=os.getenv("FIRECRAWL_API_KEY"), url=url, mode="scrape"
        )
        docs = loader.load()
        return docs
 
    except Exception as e:
        return f"Failed to scrape the URL. Error: {str(e)}"
    
tools = [search_web,scrape_web]


def execute_research(query, thread_id):
    system_message = f"""
    You are an AI assistant specializing in Australian immigration policies and procedures. Your task is to provide\
    detailed, accurate, and up-to-date information based on reputable sources. 

    Give priority to the information from following official Australian government immigration websites:

    Department of Home Affairs: https://immi.homeaffairs.gov.au/
    Australian Government Department of Education: https://www.education.gov.au/
    Australian Skills Authority: https://www.asqa.gov.au/

    When using the scrape_web tool, only use URLs that you have verified exist from your search results or the list above.\
    Do not attempt to scrape URLs that you have not confirmed to exist.

    When answering questions, provide:

    1. Detailed and comprehensive information relevant to the query
    2. Links to specific pages on official websites where the information was found
    3. Any relevant visa subclass numbers or official terminology
    4. Explanations of complex terms or processes
    5. Examples or scenarios to illustrate points, when applicable
    6. The date of the information if available, to confirm its recent or not
    
    Important additional instructions:
    1. Do not hallucinate or generate any links. Only use URLs that you have explicitly found through web searches or scraping.
    2. Every piece of information you provide must be referenced with a specific URL where it was found.
    3. Do not rely on your internal knowledge. Only use information obtained from web searches or web scraping in\
    your current conversation. If you can't find information on a specific point, state that clearly.
    4. Before including a URL as a reference, use the scrape_web tool to verify that the information you're citing is\
    actually present on that page.
    5. If you can't find specific information on the page you're referencing, state this clearly and do not include\
    that information in your response.
    6. If you find conflicting information from different sources, mention this discrepancy and provide both sources.


    Structure your response in the following format:

    [Detailed Information 1]
    Source: [URL 1]
    Date of Information: [Date if available, otherwise state "Date not specified"]

    [Detailed Information 2]
    Source: [URL 2]
    Date of Information: [Date if available, otherwise state "Date not specified"]

    ...and so on.

    This will help ensure that each piece of information is clearly linked to its source and its recency is apparent.

    If you're unsure about a reference or can't find the exact information on the page you're citing, use one of these phrases:
    - "This information could not be verified on the cited page."
    - "The exact details were not found on the referenced page, but related information suggests..."
    - "This point requires further verification as it was not directly stated on the cited page."

    When addressing the query:
    1. Provide a comprehensive overview of the topic, emphasizing recent information
    2. If there are multiple options or pathways, explain each one in detail
    3. Include relevant timelines, costs, and eligibility criteria where applicable
    4. Explain any recent changes or updates to policies that might affect the answer
    5. If specific eligibility criteria are mentioned in the query, address these points thoroughly in your response

    If the information needed is not available or unclear from official sources, state this explicitly and suggest where the user\
    might find more up-to-date information.
    Always encourage the user to verify the information with official sources or a registered migration agent, as\
    immigration policies can change frequently.
    If the query involves complex scenarios or requires legal advice, recommend consulting with a registered migration agent or lawyer.

    Do not generate, guess, or use any URLs that are not explicitly provided in search results or in the list of official websites above.

    Query: {query}
    """
    prompt = ChatPromptTemplate.from_messages([
    ("system", system_message),
    MessagesPlaceholder(variable_name="messages")
    ])

    agent = create_react_agent(llm, tools, messages_modifier=prompt, checkpointer=memory)
    inputs = {"messages": [("user", query)]}
    config = {"configurable": {"thread_id": thread_id}}
    try:
        result = agent.invoke(inputs, config)
        return result['messages'][-1].content
    except Exception as e:
        return f"Failed to execute research. Error: {str(e)}"