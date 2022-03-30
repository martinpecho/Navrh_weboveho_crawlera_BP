from multiprocessing.connection import wait
from socket import timeout
from unittest import result

from duckduckgo_search import ddg
from flask import Flask, jsonify, request
from datetime import timedelta
from main import *
from constants import constants
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from queue import Queue
from threading import Thread

import logging
import time
import datetime;
from hashlib import sha256
import smtplib, ssl
import json

__version__ = constants.VERSION
__date__ = '2022-03-17'
__updated__ = '2022-03-17'

app = Flask(__name__)
app.config['SECRET_KEY'] ='{fy9fe"Gxg9<I}R>oQWvbh.#_9YQam'
app.permanent_session_lifetime = timedelta(minutes=constants.PERMANENT_SESSION_LIFETIME)

logging.basicConfig(filename='records.log', level=logging.DEBUG, format=f'%(asctime)s %(levelname)s %(threadName)s : %(message)s')

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per day"]
)

@app.post("/setUser")
@limiter.limit("1/second", override_defaults=False)
def api_set_email():
    try:
        json_data = request.json
        email = json_data[constants.EMAIL]
        f = open('emails.json',encoding=constants.UTF_ENCODING)
        emails = json.load(f)
        f.close()
        if {"email": email} not in emails:
            emails.append({"email":email})
            with open('emails.json', 'w', encoding=constants.UTF_ENCODING) as f:
                json.dump(emails, f, ensure_ascii=False)
            f.close()
        response = jsonify(email=email)
        return response
    except:
        return "Error, invalid input", 400
    
# na zaklade url zisti, ci existuje rss subor, ak ano, tak ho vrati
@app.get("/getRss")
@limiter.limit("1/second", override_defaults=False)
def api_get_rss():
    try:
        url = request.args.get("url")
        if url is None:
            return "Error, bad request", 400
        rss = get_rss(url)
        response = jsonify(url=rss)
        return response
    except:
        return "Error, bad request", 400

@app.get('/task')
@limiter.limit("1/second", override_defaults=False)
def index():
    try:
        keyword = request.args.get("key")
        if keyword is not None:
            cur_time = str(time.time())
            myhash = str(sha256(str(keyword+cur_time).encode(constants.UTF_ENCODING)).hexdigest())
            print(myhash)
            if myhash:
                q.put([myhash,keyword])

            return jsonify(hash=myhash),200
        else: 
            return "Error, no keyword!", 400
    except:
        return "Error, bad request", 400

@app.get("/isCompleted")
@limiter.limit("1/second", override_defaults=False)
def check_if_request_completed():
    key = request.args.get("key")
    if key is not None:
        if len(hash_map) > 0:
            for x in hash_map:
                if key == x[0]:
                    if x[1] is not None:
                        response = jsonify(result=x[1])
                        hash_map.remove(x)
                        return response,200
                else:
                    continue
            return jsonify({"result":""}),200
        else:
            return jsonify({"result":""}),200
    else:
        return "Error, bad request!",400

def worker():
    while True:
        data = q.get()
        if data is None:
            time.sleep(2)
            break
        q.task_done
        hash = data[0]
        keyword = data[1]
        results = ddg(keyword, region='wt-wt', safesearch='On', time='None', max_results=20)
        #zoznam ziskanych URL adries
        origin_list = [item.get('href') for item in results]
        rss_list = []
        timeout = time.time() + 30
        for origin_url in origin_list:
            if len(rss_list)<5 and time.time() < timeout:
                try:
                    rss = get_rss(origin_url)
                    if rss is not None and rss not in rss_list:
                        rss_list.append(rss)
                        print("Nasiel sa novy RSS")                   
                except:
                    print("Error")
            else:
                break
        hash_map.append([hash,rss_list])

@app.post('/tasks')
@limiter.limit("1/second", override_defaults=False)
def pro_index():
    data = request.get_json()
    keys = data[constants.KEYS]
    keylist = [keys[item] for item in keys]
    if len(keylist) == 0:
        return "Error, bad request",400
    region = data[constants.REGION]
    max = data[constants.MAXIMUM]
    email = data[constants.EMAIL]
    period = data[constants.TIME]
    if email is None:
        return "Error, email is required.",400
    Thread(target=search_rss_pro,args=(region,period,max,email, keylist)).start()
    return jsonify(message="After your request has been processed, you will receive an email."),200

def search_rss_pro(region,period,max,email,keylist):
    request_time = str(datetime.datetime.now())
    time_hash = str(sha256(str(request_time).encode(constants.UTF_ENCODING)).hexdigest())

    if max < constants.MIN_RESULTS:
        max = constants.MIN_RESULTS
    if max > constants.MAX_RESULTS:
        max = constants.MAX_RESULTS

    if region is None:
        region = "wt-wt"

    if period is None:
        period = "None"  
    
    rss_records=[]
    for keyword in keylist:
        key = keyword[constants.KEY]
        print("Klucove slovo je: " + key)   
        rss_list = []
        #inicializacia duckduckgo
        results = ddg(key, region=region, safesearch='On', time=period, max_results=max)
        #zoznam ziskanych URL adries
        origin_list = [item.get('href') for item in results]
        
        for origin_url in origin_list:
            try:
                rss = get_rss(origin_url)
                if rss is not None and rss not in rss_list:
                    lan = None
                    rss_list.append(rss)
                    feed = get_feed(rss)
                    lan = detect_language(feed)
                    rss_records.append({"url":rss,"language":lan, "key":key})
                    print("Nasiel sa novy RSS")
                else:
                    print("Nepodarilo sa ziskat RSS")
            except Exception as e:
                print("Nepodarilo sa ziskat RSS")
    try:
        f = open('results.json',encoding=constants.UTF_ENCODING)
        results_json = json.load(f)
        f.close()
        results_json.append({"hash":time_hash,"email":email, "time": request_time,"rss":rss_records})
        with open('results.json', 'w', encoding=constants.UTF_ENCODING) as f:
            json.dump(results_json, f, ensure_ascii=False)
        f.close()
    except:
        print("Chyba pri uložení.")
    #poslat na mail 
    receiver_email = email
    subject = "RSS Engine"
    text= """Hello,\n\nthank you for choosing our engine.\nThere is link with your RSS.\n{}/detail?task={}\n\nThis email is sent from an account we use for sending messages only. So if you want to contact us, don't reply to this email.""".format(constants.ALLOW_ORIGIN,time_hash)
    message ='Subject: {}\n\n{}'.format(subject, text)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(constants.SMTP_SERVER, constants.SMTP_PORT, context=context) as server:
        server.login(constants.SENDER_EMAIL, constants.SENDER_PASSWORD)
        server.sendmail(constants.SENDER_EMAIL, receiver_email, message)
    return

@app.get("/detail")
@limiter.limit("1/second", override_defaults=False)
def get_rss_from_task():
    hash = request.args.get("key")
    if hash is not None:
        f = open('results.json',encoding=constants.UTF_ENCODING)
        results = json.load(f)
        f.close()
        for x in results:
            pairs = x.items()
            for key, value in pairs:
                if key == 'hash' and value == hash:
                    return jsonify(result=x),200
                else:
                    continue

        return jsonify({"result":""}),200
    else:
        return "Error, bad request!",400

@app.get("/getRegions")
@limiter.limit("1/second", override_defaults=False)
def get_regions():
    try:
        f = open('regions.json',encoding=constants.UTF_ENCODING)
        regions = json.load(f)
        f.close()
        return jsonify(result=regions),200
    except:
        return "Error",500

@app.get("/getPeriods")
@limiter.limit("1/second", override_defaults=False)
def get_times():
    try:
        f = open('periods.json',encoding=constants.UTF_ENCODING)
        periods = json.load(f)
        f.close()
        return jsonify(result=periods),200
    except:
        return "Error",500

@app.after_request
def apply_cors(response):
    response.headers['Access-Control-Allow-Origin'] = constants.ALLOW_ORIGIN
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'OPTIONS, HEAD, GET, POST, DELETE, PUT'
    return response

if __name__ == '__main__':
    q = Queue()
    t = Thread(target=worker)
    hash_map = []
    t.start()
    app.run(host=constants.SRV_IP, port=constants.SRV_PORT)
