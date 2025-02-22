import pymongo
import configparser
import certifi
from dotenv import load_dotenv
import os

load_dotenv()
URI = os.getenv('DBURI')
client = pymongo.MongoClient(URI, tlsCAFILE=certifi.where())
config = configparser.ConfigParser()
config.read_file(open(r'config.txt'))
dbName = config.get('server config', 'dbName')
db = client[dbName]
users = db['users']
temp_storage = db['temp_storage']
posts = db['posts']