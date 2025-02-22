from flask import session, jsonify, request
from flask_jwt_extended import get_jwt_identity, get_jwt, decode_token, create_access_token
from werkzeug.exceptions import Unauthorized
from werkzeug.wrappers import Response
from database import users
from flask_socketio import SocketIO, disconnect
from flask_mail import Mail, Message
import random
from dotenv import load_dotenv, find_dotenv
from datetime import datetime, timedelta
import re
import os
from flask import Flask, jsonify, request, abort
from twilio.rest import Client


load_dotenv(override=True)


def validate_token():
    payload = get_jwt()
    
    if (payload["user_id"] != session["user"]):
        raise Unauthorized(response=Response('{"error_id": 1}', status=403))
    
def register_admin(first_name = "John",\
    last_name = "Do", email = "john_do@gmail.com", password = "donuts"):
    max_user = users.find_one(sort=[("user_id", -1)])
    new_user_id = 1
    if max_user is not None:
            new_user_id = max_user["user_id"] + 1
    if (not users.find_one({"email": email.lower()})):
        users.insert_one({"first_name": first_name, "last_name": last_name,\
            "email": email.lower(), "password": password, "account_type": "admin", "user_id": new_user_id })

def get_general_user_details(user_id):
    general_user = users.find_one({"user_id": user_id})
    if general_user is None:
        raise LookupError("user with id user_id not found")
    general_user.pop("_id")
    
    return general_user

# used to validate token for socket connections
def validate_socket_token():
    token = request.args.get('auth_token')
    payload = decode_token(token)

    if (session["user"] != payload['user_id']):
        raise Unauthorized()
    return payload

def check_password_valid(password, first_name, last_name):
    """
    Checks to see if an password is valid. 
    """

    error_id = -1

    if len(password) < 8:
        error_id = 5

    if (not(re.search(r'[a-z]', password) and \
        re.search(r'[A-Z]', password) and
        re.search(r'[0-9]', password))):
        error_id = 6

    if first_name.lower() in password.lower():
        error_id = 7

    if last_name.lower() in password.lower():
        error_id = 8

    return error_id


def check_date_valid(date):

    error_id = -1

    try:
        date_format = "%d/%m/%Y"
        datetime.strptime(date, date_format)
    except ValueError as e:
        if "does not match format" in str(e):
            error_id = 12
        else:
            error_id = 13

    return error_id

def check_emergency_contact_valid(emergency_contacts):

    error_id = -1 

    for contact in emergency_contacts:
        if contact["first_name"] == "":
            error_id = 14
        elif contact["last_name"] == "":
            error_id = 15
        elif contact["phone_number"] == "":
            error_id = 16

    return error_id

def send_register_code(email, app):
    """
    Sends random token to user via email. 
    return: “email_is_registered”: boolean 
    """

    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'emergencyrequestapp@gmail.com'
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASS')
    app.config['MAIL_DEFAULT_SENDER'] = 'emergencyrequestapp@gmail.com'

    # Create random token and save to session
    token = random.randint(1000, 9999)
    session['token'] = token
    
    token_str = f"{token:04d}"

    mail = Mail(app)
    msg = Message('Registration Confirmation', recipients=[email])
    msg.body = f'Thank you for registering with us! Your verification code is: {token_str}'
    
    try:
        mail.send(msg)
        
    except Exception:
        pass

client = Client(os.getenv('TWILIO_SID'), os.getenv('TWILIO_AUTH'))
def send_text(user_details):
    
        name = user_details["first_name"] + ' ' + user_details["last_name"]
        for contact in user_details["emergency_contacts"]:
            msg = "Hello " + contact["first_name"] + ' ' + contact["last_name"] + ', ' + name + ' has requested emergency services.'
            phoneNumber = contact["phone_number"]
            if (phoneNumber.startswith('0')):
                phoneNumber = "+61" + phoneNumber[1:]
            phoneNumber.replace(' ', '')
            try:
                client.messages.create(from_='+18163840220',body=msg, to=phoneNumber)
            except Exception:
                pass
    

def generate_auth_token(user_id, account_type):
    additional_claims = {"user_id": user_id, "account_type": account_type}

    user = users.find_one({"user_id": user_id})
    if user is None:
        abort(404, description="User ID is invalid!")

    

    if account_type not in ["user", "health_navigator", "admin", "health_org"]:
        abort(400, description="Account type is invalid!")
        

    access_token = create_access_token(identity=str(user_id), additional_claims=additional_claims, expires_delta=False)

    return access_token
