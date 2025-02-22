
import certifi
from flask import Flask, jsonify, request, abort
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt,decode_token
from flask import session
from flask_cors import CORS
import pymongo
from dotenv import load_dotenv, find_dotenv
import os
import configparser
import random
from flask_mail import Mail, Message
import re
import pycountry
from datetime import datetime, timedelta
from helpers import validate_token, get_general_user_details, validate_socket_token, send_register_code, check_emergency_contact_valid, check_date_valid, check_password_valid, generate_auth_token, send_text
import requests
import re
from flask_socketio import SocketIO, disconnect, emit, join_room, close_room
from database import users, temp_storage, db, posts



app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins = '*', cors_credentials = True)
CORS(app, supports_credentials=True)
load_dotenv(override=True)


card_api = os.getenv('CARD_AUTH')


app.secret_key = os.getenv('SECRET_KEY')

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')
app.config['JWT_JSON_KEY'] = 'auth_token'
app.config['JWT_QUERY_STRING_NAME'] = 'auth_token'
#app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = False

app.permanent_session_lifetime = timedelta(days=365 * 100)

@app.before_request
def add_custom_header():
    
    session.permanent = True 
    
    

jwt = JWTManager(app)

connected_health_navs = [] # list of {"sid": string, "user_id": int }

#[list of {"request_id": string, "user_id": int, "mode": string}] where user_id is the id of user who made the request
# mode is "video-call" or "chat".
live_emergency_requests = []

# define a callback when receiving an invalid jwt
@jwt.invalid_token_loader 
def invalid_token_callback(message):
    return jsonify({"error_id": 1, "message": message}), 403



@app.route('/user/register-request', methods=['POST'])
def register_user():
    data = request.json
    

    if data.get("first_name") == "":
        return jsonify({"error_id": 3}), 400

    if data.get("last_name") == "":
        return jsonify({"error_id": 4}), 400

    error_id = check_password_valid(data.get("password"), data.get("first_name"),data.get("last_name"))
    if error_id > 0:
        return jsonify({"error_id": error_id}), 400
    
    error_id = check_date_valid(data.get("DOB"))
    if error_id > 0:
        return jsonify({"error_id": error_id}), 400
    
    error_id = check_emergency_contact_valid(data.get("emergency_contacts"))
    if error_id > 0:
        return jsonify({"error_id": error_id}), 400

    if data.get("address") == "" or data.get("suburb") == "" or data.get("postcode") == "":
        return jsonify({"error_id": 10}), 400

    # Checks language is a ISO639 full English language name
    try:
        pycountry.languages.lookup(data.get("language"))
    except LookupError:
        return jsonify({"error_id": 11}), 400

    # Generate new temp id
    new_temp_id = 1
    max_temp = temp_storage.find_one(sort=[("temp_id", -1)])
    if max_temp is not None:
        new_temp_id = max_temp['temp_id'] + 1

    new_user_data = {
        "first_name": data.get("first_name"),
        "last_name": data.get("last_name"),
        "email": data.get("email").lower(),
        "password": data.get("password"),
        "sex": data.get("sex"),
        "address": data.get("address"),
        "suburb": data.get("suburb"),
        "postcode": data.get("postcode"),
        "DOB": data.get("DOB"),
        "language": data.get("language"),
        "phone_number": data.get("phone_number"),
        "current_medical_conditions": data.get("current_medical_conditions"),
        "current_medications": data.get("current_medications"),
        "other_medical_info": data.get("other_medical_info"),
        "emergency_contacts": data.get("emergency_contacts"),
        "subscription_plan": None,
        "temp_id": new_temp_id,
        "account_type": "user"
    }

    # Save user's data to temporary storage
    temp_storage.insert_one(new_user_data)

    # Save temp_id to session, send email with verification code
    session['temp_id'] = new_temp_id
    

    send_register_code(data.get("email"), app)

    return jsonify({"user_register_request_id": new_temp_id}), 201


@app.route('/email-already-registered', methods=['GET'])
def email_already_registered():
    """
    Checks to see if an account already exists with the input email. 
    """
    email = request.args.get("email").lower()

    registered_user = users.find_one({"email": email})
    if registered_user is not None:
        return jsonify({"is_registered": True}), 200

    return jsonify({"is_registered": False}), 200




        


@app.route('/user/forget-password-request', methods=['GET'])
def forget_password_request():
    data = request.json
    email = data.get("email")

    registered_user = users.find_one({"email": email.lower()})
    if registered_user is None:
        return jsonify({"error_id": 1}), 400
    
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'emergencyrequestapp@gmail.com'
    app.config['MAIL_PASSWORD'] = 'ahrc ioqw qtus unin'
    app.config['MAIL_DEFAULT_SENDER'] = 'emergencyrequestapp@gmail.com'

    # Create random token and save to session
    token = random.randint(1000, 9999)
    session['email_reset_code'] = token
    session['email'] = email
    token_str = f"{token:04d}"

    mail = Mail(app)
    msg = Message('Password reset code', recipients=[email])
    msg.body = f'We have received your request for password reset. Here is your code: {token_str}'
    
    try:
        mail.send(msg)
        
    except Exception as e:
        pass

    return jsonify()


@app.route('/user/password-request-code', methods=['POST'])
def password_request_code():
    data = request.json
    token = session.get("email_reset_code")
    reset_token = data.get("code")

    if reset_token == token:
        password = data.get("password")
        user = users.find_one({"email": session['email']})

        error_id = check_password_valid(data.get("password"), user["first_name"], user["last_name"]) - 3
        if error_id > 0:
            return jsonify({"error_id": error_id}), 400

        query = {"email": session['email']}
        update = { "$set": {"password": password}}
        db["users"].update_one(query, update)

        auth_token = generate_auth_token(user["user_id"], user["account_type"])

        return jsonify({"auth_token": auth_token}), 201
    else:
        return jsonify({"error_id": 1}), 400


@app.route('/user/register-request-code', methods=['POST'])
def register_request_code():

    
    data = request.json
    temp_id = session.get("temp_id")
    
    token = session.get("token")
    
    provided_token = data.get("code")



    if provided_token == token:
        
        # Find user's details in temp storage and removes it
        user = temp_storage.find_one({"temp_id": temp_id})
        temp_storage.delete_one({"temp_id": temp_id})

        # Generate user_id
        new_user_id = 1
        max_user = users.find_one(sort=[("user_id", -1)])
        if max_user is not None:
            new_user_id = max_user["user_id"] + 1
        user["user_id"] = new_user_id

        

        users.insert_one(user)
        auth_token = generate_auth_token(new_user_id, "user")

        session["user"] = new_user_id
    
        del user["temp_id"]

        return jsonify({"auth_token": auth_token}), 201
    else:
        return jsonify({"error_id": 1}), 400


#TODO
@app.route('/sign-in', methods=['POST'])
def sign_in():
    """
    Desc: Starts user session and returns auth token for that user.
    return: auth_token.
    """
    # Parameters
    data = request.json
    email = data.get("email").lower()
    password = data.get("password") 
    user = users.find_one({"email": email})
    if user is None:
        return jsonify({"error_id": 1}), 400
    if user.get("password") != password:
       return jsonify({"error_id": 2}), 400
    access_token = generate_auth_token(user["user_id"], user["account_type"])
    session["user"] = user["user_id"]
    

    return jsonify({"auth_token": access_token})

@app.route('/user/get_details', methods=['GET'])
@jwt_required(locations='query_string')
def user_get_details():
    
    validate_token()
    user_id = get_jwt()["user_id"]
    user_details = get_general_user_details(user_id)
    user_details.pop("temp_id")
    user_details.pop("password")
    user_details.pop("account_type")
    
    user_details.pop("user_id")
   
    

    return jsonify(user_details), 200

@app.route('/health_org/get_details', methods=['GET'])
@jwt_required(locations='query_string')
def health_org_get_details():
    """
    Desc: Gets the health organization's details.
    return: Health organization's information.
    """
    try:
        validate_token()
        user_id = get_jwt()["user_id"]
        org_details = get_general_user_details(user_id)

        org_details.pop("password", None)
        org_details.pop("account_type", None)
        org_details.pop("_id", None)
        org_details.pop("user_id", None)

        return jsonify(org_details), 200

    except Exception:
         
        return jsonify({"error": "An internal error occurred"}), 500



@app.route('/health_navigator/get_details', methods=['GET'])
@jwt_required(locations='query_string')
def health_navigator_get_details():
    try:
        validate_token()
        user_id = get_jwt()["user_id"]
        health_nav_details = get_general_user_details(user_id)

        health_nav_details.pop("password", None)
        health_nav_details.pop("account_type", None)
        health_nav_details.pop("_id", None) 
        health_nav_details.pop("user_id", None)

        return jsonify(health_nav_details), 200

    except Exception as e:
       
        return jsonify({"error": "An internal error occurred"}), 500
   

@app.route('/admin/get_details', methods=['GET'])
@jwt_required(locations='query_string')
def admin_get_details():
    """
    Desc: Retrieves the admin's information.
    Returns: JSON containing admin details.
    """
    try:
        validate_token()
        user_id = get_jwt()["user_id"]
        
        admin_data = db["users"].find_one({"user_id": user_id, "account_type": "admin"})
        
        if not admin_data:
            return jsonify({"error": "Admin not found"}), 404

        admin_data.pop("password", None)  
        admin_data.pop("_id", None)       
        admin_data.pop("user_id", None)   

        return jsonify(admin_data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch admin information", "details": str(e)}), 500


@app.route('/user/log-out', methods=['POST'])
@jwt_required(locations='json')
def user_log_out():
    """
    Desc: Ends user session
    return: Nothing.
    """
   
    validate_token()
    session.pop('user')
    

    return jsonify({})


@app.route('/get-subscription-plans', methods=['GET'])
def get_subscription_plans():
    """
    Desc: Gets subscription plans.
    return: {"subscription_plans”: [{“id”: int, “name”: string,  “features”: [string], “price_per_month”:  int}]} 
    """
    subscriptions = db['subscription_plans']
    list_subscriptions = list(subscriptions.find({}, {'_id': 0}))
    return jsonify({"subscription_plans": list_subscriptions})


@app.route('/user/select-subscription-plans', methods=['POST'])
@jwt_required(locations='json')
def select_subscription_plans():
    """
    Desc: User selects subscription plan and pays with card. 
    return: Nothing.
    """
    # Parameters
    data = request.json 

    subscription_plan_id = data.get("subscription_plan_id")
    card_number = data.get("card_number")
    cvv = data.get("cvv")
    expiry_date = data.get("expiry_date")

    validate_token()
    user_id = get_jwt()["user_id"]
    user = users.find_one({"user_id": user_id})

    if verify_card(card_number, cvv, expiry_date) == False:
        return jsonify({"error_id": 3, "message": "Card details are invalid"}), 400

    subscription_plans = get_subscription_plans().get_json().get('subscription_plans', [])
    subscription_plan_exists = any(subscription['id'] == int(subscription_plan_id) for subscription in subscription_plans)
    if (not subscription_plan_exists):
        return jsonify({"error_id": 2, "message": "Subscription not valid"}), 400

    query = {"user_id": user_id}
    update = { "$set": {"subscription_plan": subscription_plan_id}}
    db["users"].update_one(query, update)

    return jsonify()


def verify_card(card_number, cvv, expiry_date):
    """
    Desc: Verifies card is valid. 
    return: Bool.
    """

    if len(str(cvv)) not in [3, 4]:
        return False

    current_month = datetime.today().month
    current_year = datetime.today().year
    month, year = expiry_date.split("/")

    if current_year > int(year):
        return False
    elif int(year) == current_year:
        if current_month > int(month):
            return False

    # API to validate card number
    url = "https://api.apiverve.com/v1/cardvalidator"
    params = {
        'number': card_number
    }
    headers = {
        'x-api-key': card_api
    }

    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200:
        return True
    else:
        return False


@app.route('/clear-general-users', methods=['DELETE'])
def clear_general_users():
    """
    Deletes all general users except admins. Only for Testing Purposes.
    """
    return jsonify()

@app.route('/add-emergency-contact', methods=['POST'])
def add_emergency_contact():
    """
    Desc: Adds contact information for loved ones/emergency contacts.
    return: {“name”: string, “phone number”: string, “relation”: string}
    """
    return jsonify()

@app.route('/update-medinfo', methods=['PUT'])
def update_medical_info():
    """
    Desc: Updates medical information.
    return: Nothing.
    """
    # Parameters
    data = request.json
    auth_token = data.get("auth_token")
    current_medical_conditions = data.get("current_medical_conditions")
    current_medications = data.get("current_medications")
    other_medical_info = data.get("other_medical_info")

    return jsonify()

@app.route('/user/delete-account', methods=['DELETE'])
def delete_account(user_id):
    """
    Desc: Deletes user and their data.
    return: None.
    """
    # Parameters
    data = request.json 
    auth_token = data.get("auth_token")

    return jsonify()


@app.route('/health_org/register', methods=['POST'])
def register_health_org():
    """
    Registers health organisation.
    """
    data = request.json

    registered_user = users.find_one({"email": data.get("email").lower()})
    if registered_user is not None:
        return jsonify({"error_id": 2}), 400

    if data.get("name") == "":
        return jsonify({"error_id": 1}), 400
    
    if data.get("email") == "":
        return jsonify({"error_id": 6}), 400

    password = data.get("password")

    if len(password) < 8:
        return jsonify({"error_id": 3}), 400

    if (not(re.search(r'[a-z]', password) and \
        re.search(r'[A-Z]', password) and
        re.search(r'[0-9]', password))):
        return jsonify({"error_id": 4}), 400

    if data.get("name") in password.lower():
        return jsonify({"error_id": 5}), 400

    new_user_data = {
        "name": data.get("name"),
        "email": data.get("email").lower(),
        "password": data.get("password"),
        "description": data.get("description"),
        "url": data.get("url"),
        "account_type": "health_org"
    }

    new_user_id = 1
    max_user = users.find_one(sort=[("user_id", -1)])
    if max_user is not None:
        new_user_id = max_user["user_id"] + 1
    new_user_data["user_id"] = new_user_id
    
    users.insert_one(new_user_data)
    session["user"] = new_user_id
    
    
    return jsonify({"auth_token": generate_auth_token(new_user_id, "health_org")})
@app.route('/admin/register', methods=['POST'])
def register_admin():
    """
    Registers Admin.
    """
    data = request.json

    
    registered_user = users.find_one({"email": data.get("email").lower()})
    if registered_user is not None:
        return jsonify({"error_id": 4, "message": "email already registered"}), 400
    if data.get("first_name") == "":
        return jsonify({"error_id": 1, "message": "first name must be provided"}), 400
    if data.get("last_name") == "":
        return jsonify({"error_id": 2, "message": "last name must be provided" }), 400
    
    if data.get("email") == "":
        return jsonify({"error_id": 3, "message": "An email must be provided"}), 400
    

    password = data.get("password")
    error_id = check_password_valid(password, data.get("first_name"), data.get("last_name"))
    if password == "":
        return jsonify({"message": "No password provided" }), 400
    if error_id == 5:
        return jsonify({"error_id": 5, "message": "password must be at least 8 characters" }), 400
    if error_id == 6:
        return jsonify({"error_id": 6, "message": "password must contain an upper case, lower case and number"}), 400
    if error_id == 7:
        return jsonify({"error_id": 7, "message": "password must not contain first name"}), 400
    if error_id == 8:
        return jsonify({"error_id": 8, "message": "password must not contain last name"}), 400
    if data.get("admin_key") != os.getenv('ADMIN_KEY'):
        return jsonify({"error_id": 9, "message": "Incorrect Admin key"}), 400
    



    new_user_data = {
        "first_name": data.get("first_name"),
        "last_name": data.get("last_name"),
        "email": data.get("email").lower(),
        "password": data.get("password"),
        "account_type": "admin"
    }

    new_user_id = 1
    max_user = users.find_one(sort=[("user_id", -1)])
    if max_user is not None:
        new_user_id = max_user["user_id"] + 1
    new_user_data["user_id"] = new_user_id
    
    users.insert_one(new_user_data)
    session["user"] = new_user_id
    
    
    return jsonify({"auth_token": generate_auth_token(new_user_id, "admin")})


@app.route('/admin/register-health-navigator', methods=['POST'])
@jwt_required(locations='json')
def register_health_navigator():
    """
    Registers health navigator.
    """
    data = request.json
    validate_token()

    user_id = get_jwt()["user_id"]
    user = users.find_one({"user_id": user_id})
    if user["account_type"] != "admin":
        return jsonify({"error_id": 12}), 400

    registered_user = users.find_one({"email": data.get("email").lower()})
    if registered_user is not None:
        return jsonify({"error_id": 13}), 400

    if data.get("first_name") == "":
        return jsonify({"error_id": 2}), 400

    if data.get("last_name") == "":
        return jsonify({"error_id": 3}), 400

    if data.get("email") == "":
        return jsonify({"error_id": 4}), 400

    error_id = check_password_valid(data.get("password"), data.get("first_name"),data.get("last_name"))
    if error_id > 0:
        return jsonify({"error_id": error_id}), 400

    if data.get("languages") == []:
        return jsonify({"error_id": 9}), 400

    english = False
    for language in data.get("languages"):
        if language.lower() == "english":
            english = True
        # Checks language is a ISO639 full English language name
        try:
            pycountry.languages.lookup(language)
        except LookupError:
            return jsonify({"error_id": 10}), 400
    
    if english == False:
        return jsonify({"error_id": 11}), 400

    new_user_data = {
        "first_name": data.get("first_name"),
        "last_name": data.get("last_name"),
        "email": data.get("email").lower(),
        "password": data.get("password"),
        "languages": data.get("languages"),
        "account_type": "health_navigator"
    }

    new_user_id = 1
    max_user = users.find_one(sort=[("user_id", -1)])
    if max_user is not None:
        new_user_id = max_user["user_id"] + 1
    new_user_data["user_id"] = new_user_id
    
    users.insert_one(new_user_data)
    
    
    return jsonify()


@app.route('/general-user/change-password', methods=['PUT'])
@jwt_required(locations='json')
def change_password():
    """
    Desc: Changes user password.
    return: None.
    """
    data = request.json 
    auth_token = data.get("auth_token")
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    validate_token()
    user_id = get_jwt()["user_id"]
    user = users.find_one({"user_id": user_id})

    

    if user["password"] != current_password:
        return jsonify({"error_id": 6, "message": "Current password is incorrect."}), 401
    
    if(user["account_type"] == "health_org"):
        
        error_id = check_password_valid(new_password, user["name"], user["name"]) - 3
    else:
        error_id = check_password_valid(new_password, user["first_name"], user["last_name"]) - 3
    
    if error_id > 0:
        if (error_id == 2):
            return jsonify({"error_id": error_id, "message": "New Password must be at least 8 characters"}), 400
        if (error_id == 3):
            return jsonify({"error_id": error_id, "message": "New Password must contain an upper case, lower case and number"}), 400
        if (error_id == 4):
            if(user["account_type"] == "health_org"):
                return jsonify({"error_id": error_id, "message": "New Password must not contain name "}), 400
            else:
                return jsonify({"error_id": error_id, "message": "New Password must not contain first name"}), 400
        if (error_id == 5):
            if(user["account_type"] == "health_org"):
                return jsonify({"error_id": error_id, "message": "New Password must not contain name "}), 400
            else:
                return jsonify({"error_id": error_id, "message": "New Password must not contain last name"}), 400
        

    query = {"user_id": user_id}
    update = {"$set": {"password": new_password}}
    db["users"].update_one(query, update)

    return jsonify({"message": "Password changed successfully."}), 200



@app.route('/health_org/make_post', methods=['POST'])
@jwt_required(locations='json')
def make_post():
    """
    Desc: Creates post.
    return: None.
    """
    # Parameters
    data = request.json
    auth_token = data.get("auth_token")
    validate_token()

    user_id = get_jwt()["user_id"]

    # Generate post_id
    post_id = 1
    max_post = posts.find_one(sort=[("post_id", -1)])
    if max_post is not None:
        post_id = max_post["post_id"] + 1
    
    if data.get("title") == "":
        return jsonify({"error_id": 2}), 400

    if data.get("description") == "":
        return jsonify({"error_id": 3}), 400

    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    post_data = {
        "title": data.get("title"),
        "description": data.get("description"),
        "location": data.get("location"),
        "post_id": post_id,
        "user_id": user_id,
        "time": time,
        "last_updated": time
    }

    posts.insert_one(post_data)

    return jsonify({"post_id": post_id}), 201

@app.route('/health_org/edit_post', methods=['PUT'])
@jwt_required(locations='json')
def edit_post():
    """
    Desc: Edits post.
    return: None.
    """
    # Parameters: “post_id”: int, “title”: string, “description”: string, “location”: string

    data = request.json
    auth_token = data.get("auth_token")
    validate_token()
    user_id = get_jwt()["user_id"]

    post_id = data.get("post_id")
    post = posts.find_one({"post_id": post_id})

    if data.get("title") == "":
        return jsonify({"error_id": 2, "message": "title cannot be empty"}), 400

    if data.get("description") == "":
        return jsonify({"error_id": 3,  "message": "description cannot be empty"}), 400
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    updated_post_data = {key: value for key, value in {
        "title": data.get("title"),
        "description": data.get("description"),
        "location": data.get("location"),
        "last_updated": time
    }.items() if value is not None}

    result = db["posts"].update_one({"post_id": post_id}, {"$set": updated_post_data})

    if result.matched_count == 0:
        return jsonify({"error_id": 4, "message":"Post not found"}), 404
    if post["user_id"] != user_id:
        return jsonify({"error_id": 5, "message":"Permission denied"}), 404
    return jsonify({ "time": time}), 200


@app.route('/health_org/get_posts/', methods=['GET'])
@jwt_required(locations='query_string')
def get_posts():
    """
    Desc: Retrieves all posts made by the user.
    return: List of posts, in reverse chronological order.
    """
    # Parameters
    
    validate_token()

    user_id = get_jwt()["user_id"]
    

    query = {"user_id": user_id}
    results = posts.find(query).sort("time", -1).to_list()
    health_org_details = get_general_user_details(user_id)
    name = health_org_details['name']
    url = health_org_details['url']
    
    
    for post in results:
        post.pop("_id")
        post["poster_name"] = name
        post["poster_url"] = url
        
    
    
    return jsonify(results), 201

@app.route('/user/get_posts/', methods=['GET'])
@jwt_required(locations='query_string')
def user_get_posts():
    """
    Desc: Retrieves all posts made by the user.
    return: List of posts, in reverse chronological order.
    """
    # Parameters
    
    validate_token()

    user_id = get_jwt()["user_id"]
    

    
    results = posts.find().sort("time", -1).to_list()
    
    for post in results:
        post.pop("_id")
        poster_id = post["user_id"]
        health_org_details = get_general_user_details(poster_id)
        name = health_org_details['name']
        url = health_org_details['url']
        post["poster_name"] = name
        post["poster_url"] = url
       
    
    
    
    
    return jsonify(results), 201

@app.route('/health_org/delete_post', methods=['DELETE'])
@jwt_required(locations='json')
def delete_post():
    """
    Desc: Deletes the post assosciated with the given post id.
    return: None.
    """
    # Parameters
    data = request.json 
    auth_token = data.get("auth_token")
    validate_token()

    post_id = data.get("post_id")

    user_id = get_jwt()["user_id"]

    post = posts.find_one({"post_id": post_id})
    if post["user_id"] != user_id:
        return jsonify({"error_id": 2}), 400

    query = {"post_id": post_id}
    results = posts.delete_one(query)

    return jsonify()

# on connection with health navigators
@socketio.on('connect', namespace='/health_navigator')
def handle_connection(): 
    try:
        payload = validate_socket_token()
    except Exception:
        disconnect()
        return
    
    # store the socket session id and health navigator id
    connected_health_navs.append({"sid": request.sid, "user_id": payload['user_id']})
    
   
@socketio.on('get_requests', namespace='/health_navigator')
def handle_get_requests():
    payload = validate_socket_token()

    if (session["user"] != payload['user_id']):
        
        disconnect()
        return
    
    # store the socket session id and health navigator id
    matching_requests = [live_request for live_request in live_emergency_requests if (live_request["user_details"]["language"] in get_general_user_details(payload['user_id'])["languages"])]
    return {"requests": matching_requests}
    
@socketio.on('disconnect', namespace='/health_navigator')
def handle_disconnection():
    validate_socket_token()
    
   
    # remove disconnected health navigator socket session
    global connected_health_navs
    connected_health_navs = [connected_health_nav for connected_health_nav in connected_health_navs if (connected_health_nav["sid"] != request.sid)]
    
@app.route('/health_navigator/accept-request', methods=['POST'])
@jwt_required(locations='json')
def accept_request():
    validate_token()
    
    request_exists = False
    for live_request in live_emergency_requests:
        if live_request["request_id"] == request.json["request_id"]:
            request_exists = live_request
        
    if not request_exists:
        return jsonify({"error_id": 2}), 400
    else:
        socketio.emit("request_accepted", request_exists, namespace='/user-emergency-request', to=request.json["request_id"])
        return {}
    
@socketio.on('connect', namespace='/user-emergency-request')
def handle_emergency_request_connect():
    try:
        payload = validate_socket_token()
    except Exception:
        disconnect()
        return
    
    mode = request.args.get("mode")
    
    
    user_details = get_general_user_details(payload["user_id"])
    
    
    
    # each request contains the request id (which is equal to the socket session id), the
    # user id of the the who made the request, mode of the request ('chat' or 'video call')
    # and the user details
    emergency_request = {"request_id": request.sid, "user_id": payload['user_id'], "mode": mode, "user_details": user_details}

    
    
    live_emergency_requests.append(emergency_request)
    for health_nav in connected_health_navs:
        if (user_details["language"] in get_general_user_details(health_nav["user_id"])["languages"]):
            emit("new_request", emergency_request,namespace="/health_navigator", to=health_nav["sid"])
    
@socketio.on('disconnect', namespace='/user-emergency-request')
def handle_emergency_request_disconnect():
    payload = validate_socket_token()
    user_details = get_general_user_details(payload["user_id"])
    global live_emergency_requests
    live_emergency_requests = [live_request for live_request in live_emergency_requests if (live_request["request_id"] != request.sid)]
    for health_nav in connected_health_navs:
        if (user_details["language"] in get_general_user_details(health_nav["user_id"])["languages"]):
            emit("remove_request", {"request_id": request.sid}, namespace="/health_navigator", to=health_nav["sid"])


@socketio.on('connect', namespace='/chat')
def handle_connect_chat(data):
    try:
        validate_socket_token()
    except Exception:
        disconnect()
        return
    room_id = request.args.get("room_id")
    join_room(room=room_id)

@socketio.on('send_message', namespace='/chat')
def handle_chat_send_message(data):
    
    payload = validate_socket_token()
    message = data['message']
    user_details = get_general_user_details(payload["user_id"])
    first_name = user_details["first_name"]
    last_name = user_details["last_name"]
    emit("receive_message", {"message": message, "sender_name": f"{first_name} {last_name}"}, broadcast=True, skip_sid=request.sid, to=request.args.get("room_id"))

@socketio.on('disconnect', namespace='/chat')
def handle_chat_disocnnect():
    payload = validate_socket_token()
    user_details = get_general_user_details(payload["user_id"])
    if(user_details["account_type"] == 'user'):
        send_text(user_details)
    room_id = request.args.get("room_id")
    emit("other_user_disconnected",  broadcast=True, to=room_id)
    

    close_room(room=room_id)
    


@app.route('/user/edit-info', methods=['PUT'])
@jwt_required(locations='json')
def edit_user():
    """
    Desc: Updates user info.
    return: None.
    """
    data = request.json
    validate_token()
    user_id = get_jwt()["user_id"]

    if "email" in data and data.get("email"):
        existing_user = db["users"].find_one({"email": data.get("email").lower()})
        if existing_user and existing_user["user_id"] != user_id:
            return jsonify({"error_id": 1, "message": "Email is already registered to another account"}), 400

        # If changing the email, send a verification code and store in temp_storage
        if existing_user["email"] != data.get("email").lower():
            session["temp_id"] = f"update-{user_id}"  # Unique ID for email change
            send_register_code(data.get("email"), app)  # Send verification code to new email
            temp_storage.update_one(
                {"temp_id": session["temp_id"]},
                {"$set": {"new_email": data.get("email").lower()}},
                upsert=True
            )
            return jsonify({"message": "Verification code sent to new email. Please verify to update."}), 200


    # 2. Check if first_name or last_name is empty
    if data.get("first_name") == "":
        return jsonify({"error_id": 3, "message": "First name cannot be empty"}), 400
    if data.get("last_name") == "":
        return jsonify({"error_id": 4, "message": "Last name cannot be empty"}), 400

    # 4. Validate sex if provided
    if "sex" in data and data.get("sex") not in ["M", "F", "O"]:
        return jsonify({"error_id": 8, "message": "Invalid sex. Must be 'M', 'F', or 'O'"}), 400

    # 5. Check if address fields are provided and not empty
    if any(field in data and data.get(field) == "" for field in ["address", "suburb", "postcode"]):
        return jsonify({"error_id": 10, "message": "Address, suburb, and postcode cannot be empty"}), 400

    # 6. Validate language if provided (ISO639 full English language name)
    if "language" in data and data.get("language"):
        try:
            pycountry.languages.lookup(data.get("language"))
        except LookupError:
            return jsonify({"error_id": 11, "message": "Invalid language. Must be an ISO639 full English language name"}), 400

    # 7. Validate DOB if provided
    if "DOB" in data and data.get("DOB"):
        try:
            datetime.strptime(data.get("DOB"), "%d/%m/%Y")
        except ValueError:
            return jsonify({"error_id": 12, "message": "DOB must be in DD/MM/YYYY format"}), 400

    # 8. Validate emergency contacts if provided
    if "emergency_contacts" in data and data.get("emergency_contacts"):
        for contact in data.get("emergency_contacts"):
            if not contact.get("first_name") or not contact.get("last_name") or not contact.get("phone_number"):
                return jsonify({"error_id": 13, "message": "Emergency contacts must have first name, last name, and phone number"}), 400

    # Prepare the updated data with only provided fields
    updated_user_data = {key: value for key, value in {
        "first_name": data.get("first_name"),
        "last_name": data.get("last_name"),
        "email": data.get("email").lower() if data.get("email") else None,
        "password": data.get("password"),
        "sex": data.get("sex"),
        "address": data.get("address"),
        "suburb": data.get("suburb"),
        "postcode": data.get("postcode"),
        "DOB": data.get("DOB"),
        "language": data.get("language"),
        "phone_number": data.get("phone_number"),
        "current_medical_conditions": data.get("current_medical_conditions"),
        "current_medications": data.get("current_medications"),
        "other_medical_info": data.get("other_medical_info"),
        "emergency_contacts": data.get("emergency_contacts"),
    }.items() if value is not None}  

    query = {"user_id": user_id}
    update = {"$set": updated_user_data}
    db["users"].update_one(query, update)
    return jsonify({"message": "Information updated successfully."}), 200



@app.route('/health_navigator/edit_info', methods=['PUT'])
@jwt_required(locations='json')
def edit_health_navigator_info():
    data = request.json
    validate_token()
    user_id = get_jwt().get("user_id")

   

    # 2. Validate required fields
    if data.get("first_name") == "":
        return jsonify({"error_id": 3, "message": "First name cannot be empty"}), 400
    if data.get("last_name") == "":
        return jsonify({"error_id": 4, "message": "Last name cannot be empty"}), 400

    

    # 4. Validate languages
    if "languages" in data and (not isinstance(data["languages"], list) or not data["languages"]):
        return jsonify({"error_id": 6, "message": "Languages must be a non-empty list"}), 400
    for language in data.get("languages", []):
        try:
            pycountry.languages.lookup(language)
        except LookupError:
            return jsonify({"error_id": 7, "message": f"Invalid language: {language}. Must be an ISO639 full English language name"}), 400

    # Prepare data and update
    updated_health_navigator_data = {key: value for key, value in {
        "first_name": data.get("first_name"),
        "last_name": data.get("last_name"),
        
        "languages": data.get("languages"),
    }.items() if value is not None}

    query = {"user_id": user_id}
    update = {"$set": updated_health_navigator_data}
    result = db["users"].update_one(query, update)

    if result.matched_count == 0:
        return jsonify({"error": "Health navigator not found"}), 404
    return jsonify({"message": "Information updated successfully."}), 200



@app.route('/admin/edit_info', methods=['PUT'])
@jwt_required(locations='json')
def admin_edit_info():
    validate_token()
    data = request.json
    user_id = get_jwt().get("user_id")  

    # Validate required fields
    if data.get("first_name") == "":
        return jsonify({"error_id": 2, "message": "First name cannot be empty"}), 400
    if data.get("last_name") == "":
        return jsonify({"error_id": 3, "message": "Last name cannot be empty"}), 400
   
    

    # Prepare data and update
    updated_admin_data = {
        "first_name": data.get("first_name"),
        "last_name": data.get("last_name"),
        
    }
    result = db["users"].update_one({"user_id": user_id}, {"$set": updated_admin_data})
    if result.matched_count == 0:
        return jsonify({"error": "Admin not found"}), 404
    return jsonify({"message": "Information updated successfully."}), 200



@app.route('/user/change-email-request', methods=['POST'])
@jwt_required(locations='json')
def change_email_request():
    data = request.json
    validate_token()
    user_id = get_jwt()["user_id"]

    new_email = data.get("new_email")
    if not new_email:
        return jsonify({"error_id": 2, "message": "New email is required"}), 400

    existing_user = db["users"].find_one({"email": new_email.lower()})
    if existing_user:
        return jsonify({"error_id": 3, "message": "Email is already registered"}), 400

    # Generate new temp id
    new_temp_id = 1
    max_temp = temp_storage.find_one(sort=[("temp_id", -1)])
    if max_temp is not None:
        new_temp_id = max_temp['temp_id'] + 1


    session["temp_id"] = new_temp_id
    send_register_code(new_email, app)  # Send verification code to the new email

    temp_storage.update_one(
        {"temp_id": session["temp_id"]},
        {"$set": {"new_email": new_email.lower()}},
        upsert=True
    )

    return jsonify({"message": "Verification code sent to new email. Please verify to complete the change."}), 200


@app.route('/user/verify-change-email', methods=['POST'])
@jwt_required(locations='json')
def verify_change_email():
    """
    Desc: Verifies the email change request using the code.
    return: None.
    """
    data = request.json
    validate_token()
    user_id = get_jwt()["user_id"]

    verification_code = data.get("code")
    if not verification_code:
        return jsonify({"error_id": 4, "message": "Verification code is required"}), 400

    temp_id = session.get("temp_id")
    if not temp_id:
        return jsonify({"error_id": 5, "message": "No pending email change request found"}), 400

    token = session.get("token")
    if verification_code != str(token):
        return jsonify({"error_id": 6, "message": "Invalid verification code"}), 400

    temp_record = temp_storage.find_one({"temp_id": temp_id})
    if not temp_record or "new_email" not in temp_record:
        return jsonify({"error_id": 7, "message": "Invalid or expired email change request"}), 400

    new_email = temp_record["new_email"]
    db["users"].update_one(
        {"user_id": user_id},
        {"$set": {"email": new_email}}
    )

    temp_storage.delete_one({"temp_id": temp_id})

    return jsonify({"message": "Email updated successfully."}), 200

@app.route('/health_org/edit_info', methods=['PUT'])
@jwt_required(locations='json')
def health_org_edit_info():
    """
    Desc: Edits health organization information.
    return: Confirmation message.
    """
    try:
        validate_token()
        data = request.json
        user_id = get_jwt().get("user_id")

        if data.get("name") == "":
            return jsonify({"error_id": 2, "message": "Name cannot be empty"}), 400
        

        updated_org_data = {
            "name": data.get("name"),
            "description": data.get("description"),
            "url": data.get("url"),
        }

        result = db["users"].update_one({"user_id": user_id}, {"$set": updated_org_data})
        if result.matched_count == 0:
            return jsonify({"message": "Health organization not found"}), 404

        return jsonify({"message": "Information updated successfully."}), 200

    except Exception as e:
         
        return jsonify({"message": "An internal error occurred"}), 500


@app.route('/general-user/get-email', methods=['GET'])
@jwt_required(locations='query_string')
def get_user_email():
    """
    Desc: Retrieves the current email of the user.
    return: JSON with the user's email.
    """
    validate_token()
    user_id = get_jwt()["user_id"]

    user = users.find_one({"user_id": user_id}, {"email": 1})

    if not user or "email" not in user:
        return jsonify({"error_id": 1, "message": "User email not found."}), 404

    return jsonify({"email": user["email"]}), 200

@socketio.on('connect', namespace='/video_call')
def handle_connect_video_call(data):
    try:
        validate_socket_token()
    except Exception:
        disconnect()
        return
    room_id = request.args.get("room_id")
    join_room(room=room_id)

@socketio.on('send_peer_id', namespace='/video_call')
def handle_video_call_receiver_peer_id(data):
    
    try:
        validate_socket_token()
    except Exception:
        disconnect()
        return
    room_id = request.args.get("room_id")
    
    emit("receive_remote_peer_id", {"peer_id": data["peer_id"]}, broadcast=True, to=room_id, skip_sid=request.sid)

    
@socketio.on('disconnect', namespace='/video_call')
def handle_video_call_disconnect():
    payload = validate_socket_token()
    user_details = get_general_user_details(payload["user_id"])
    if(user_details["account_type"] == 'user'):
        send_text(user_details)
    room_id = request.args.get("room_id")
    emit("other_user_disconnected",  broadcast=True, to=room_id)
    close_room(room=room_id)

if __name__ == '__main__':
    
    
    socketio.run(app, debug=True, host='0.0.0.0', allow_unsafe_werkzeug=True, port=6001)
    
