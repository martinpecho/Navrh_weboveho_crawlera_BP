import requests
from requests_html import HTMLSession
from bs4 import BeautifulSoup
from langdetect import detect
from langdetect import DetectorFactory
DetectorFactory.seed = 0
import feedparser

# funkcia vrati obsah stranky
def get_source(url):
    try:
        session = HTMLSession()
        response = session.get(url)
        return response

    except requests.exceptions.RequestException as e:
        print(e)

#funkcia ziska rss link a odtestuje, ci funguje
def get_rss(url):
    soup = BeautifulSoup(get_source(url).content, 'html.parser') 
    link = soup.find('link', type='application/rss+xml')
    try:
        # overujem ci link existuje
        if requests.get(link['href'],timeout=30).status_code==200:
            return link['href']
        else:
            return None
    except:
        return None
#vrati feed url stranky
def get_feed(url):
    feed = feedparser.parse(url)
    return feed

#zistuje jazyk clanku
def detect_language(d): 
    lang_rss_description=detect(d.feed.description)
    lang_rss_tag=d.feed.language[0:2]
    lang_first_article_desc=detect(d.entries[0].description)

    if (lang_rss_description == lang_rss_tag == lang_first_article_desc):
        return lang_rss_description
    elif (lang_rss_description == lang_rss_tag):
        return lang_rss_description
    elif (lang_rss_description == lang_first_article_desc):
        return lang_rss_description
    elif (lang_rss_tag == lang_first_article_desc):
        return lang_rss_tag
    elif lang_rss_tag:
        return lang_rss_tag
    elif lang_rss_description:
        return lang_rss_description
    else:
        return lang_first_article_desc

#vrati kategorie rss suboru
def get_categories(feed):
    categories = []
    for item in feed['items']:
        if not item.get('category') in categories:
            categories.append(item.get('category'))           
    return [x for x in categories if x is not None]

#vrati udaje pre json
def get_json_record(url,origin,lan,categories,tld):
    if categories is not None:
        return {"url": url,"origin":origin, "language": lan, "categories": categories, "tld":tld}
    else:
        return {"url": url,"origin":origin, "language": lan, "categories": [], "tld":tld}
