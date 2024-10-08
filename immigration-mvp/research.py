#generic imports
import json
import ast
import os
from textwrap import dedent
import re

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

def extract_output(text):
    pattern = r'<output>(.*?)(?:</output>|$)'
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    else:
        return "No output found. The AI assistant may have failed to format its response correctly."

tools = [search_web,scrape_web]

def execute_research(query, thread_id):
    system_message = dedent(f"""
    You are an AI assistant specializing in Australian immigration policies and procedures. Your task is to provide detailed,
    accurate, and up-to-date information based on reputable sources, using a Chain of Thought (CoT) approach with reflection.
    Follow these steps:

    1. Think through the query step by step within the <thinking> tags:
    - Break down the immigration query into components
    - Identify the relevant policies, procedures, or visa types
    - Plan how to search for and verify information from official sources
    - Consider potential complexities or exceptions

    2. Reflect on your thinking to check for any errors or improvements within the <reflection> tags:
    - Verify that all sources are official and current
    - Check if all aspects of the query have been addressed
    - Consider if there are any recent policy changes that might affect the answer
    - Ensure that the planned response will be comprehensive and clear

    3. Make any necessary adjustments based on your reflection.

    4. Provide your final, comprehensive answer within the <output> tags, following this structure:

    [Detailed Information 1]
    Source: [URL 1]
    Date of Information: [Date if available, otherwise state "Date not specified"]

    [Detailed Information 2]
    Source: [URL 2]
    Date of Information: [Date if available, otherwise state "Date not specified"]

    (Continue this format for all pieces of information)

    Important instructions:
    - Give priority to information from these official Australian government immigration websites:
    - Department of Home Affairs: https://immi.homeaffairs.gov.au/
    - Australian Government Department of Education: https://www.education.gov.au/
    - Australian Skills Authority: https://www.asqa.gov.au/

    - Only use URLs that you have verified exist from your search results or the list above.
    - Do not hallucinate or generate any links. Only use URLs that you have explicitly found through web searches or scraping.
    - Every piece of information you provide must be referenced with a specific URL where it was found.
    - Do not rely on internal knowledge. Only use information obtained from web searches or web scraping in your current conversation.
    - Before including a URL as a reference, use the scrape_web tool to verify that the information you're citing is actually
    present on that page.
    - If you can't find specific information on the page you're referencing, state this clearly and do not include that information
    in your response.
    - If you find conflicting information from different sources, mention this discrepancy and provide both sources.

    In your final output:
    1. Provide a comprehensive overview of the topic, emphasizing recent information
    2. If there are multiple options or pathways, explain each one in detail
    3. Include relevant timelines, costs, and eligibility criteria where applicable
    4. Explain any recent changes or updates to policies that might affect the answer
    5. If specific eligibility criteria are mentioned in the query, address these points thoroughly

    If information is unavailable or unclear, state this explicitly and suggest where the user might find more up-to-date information.
    Always encourage verifying information with official sources or a registered migration agent. For complex scenarios or legal advice,
    recommend consulting with a registered migration agent or lawyer.

    Query: {query}

    Use this format for your response:
    <thinking>
    [Your step-by-step reasoning goes here. This is your internal thought process, not the final answer.]
    <reflection>
    [Your reflection on your reasoning, checking for errors or improvements]
    </reflection>
    [Any adjustments to your thinking based on your reflection]
    </thinking>
    <output>
    [Your final, comprehensive answer to the query, structured as instructed above. This is the only part that will be shown to
    the user.]
    </output>
    """)
    
    prompt = ChatPromptTemplate.from_messages([
    ("system", system_message),
    MessagesPlaceholder(variable_name="messages")
    ])

    agent = create_react_agent(llm, tools, messages_modifier=prompt, checkpointer=memory)
    inputs = {"messages": [("user", query)]}
    config = {"configurable": {"thread_id": thread_id}}
    try:
        result = agent.invoke(inputs, config)
        raw_content = result['messages'][-1].content
        extracted_content = extract_output(raw_content)
        return extracted_content
    except Exception as e:
        return f"Failed to execute research. Error: {str(e)}"
