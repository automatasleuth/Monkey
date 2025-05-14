import asyncio
from google.adk.app import AdkApp
from stacc.agent import root_agent

async def main():
    # Create the ADK app
    app = AdkApp(agent=root_agent, enable_tracing=True)
    
    try:
        # Example: Navigate to a website and take a screenshot
        response = await app.run("""
        Please go to example.com, wait for the page to load,
        take a screenshot named 'example.png', and tell me
        what you see on the page.
        """)
        print("Agent Response:", response)
        
        # Example: Search for something
        response = await app.run("""
        Please go to google.com, find the search box (which has name='q'),
        enter "Python web scraping", and click the search button.
        Wait for the element with tag_name 'body' to be present.
        """)
        print("Agent Response:", response)
        
    finally:
        # Clean up
        await app.close()

if __name__ == "__main__":
    asyncio.run(main()) 