from setuptools import setup, find_packages

setup(
    name="monkey",
    version="0.1.0",
    packages=find_packages(where="monkey"),
    package_dir={"": "monkey"},
    install_requires=[
        "selenium>=4.0.0",
        "webdriver-manager>=3.8.0",
        "python-dotenv>=0.19.0",
        "Pillow>=9.0.0",
        "google-cloud-aiplatform>=1.0.0",
        "google-adk>=0.1.0",
        "beautifulsoup4>=4.12.0",
        "lxml>=4.9.0",  # Fast HTML parser for BeautifulSoup
    ],
    author="Staccless",
    author_email="your.email@example.com",
    description="An intelligent web crawler agent using Selenium and Google ADK",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/automatasleuth/monkey",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.11",
) 