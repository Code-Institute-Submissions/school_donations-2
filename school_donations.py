from flask import Flask, render_template
from pymongo import MongoClient
import json
import os

# Create Flaks app
app = Flask(__name__)

# Connect to MONGODB Database
MONGODB_HOST = 'ds131900.mlab.com:31900'
# MONGODB_PORT = 27017
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DBS_NAME = os.getenv('MONGO_DB_NAME', 'donorsUSA')
# DBS_NAME = 'heroku_dfzvlfvw'
COLLECTION_NAME = 'projects'
FIELDS = {'funding_status': True, 'school_state': True, 'resource_type': True, 'poverty_level': True,
          'date_posted': True, 'total_donations': True, '_id': False, 'primary_focus_area': True}


# Route to index to render the html template with the graphs
@app.route('/')
def index():
    return render_template("index.html")


# Route to connect to Mongo DB, get the data from the DB and store it in json_projects
@app.route("/donorsUS/projects")
def donor_projects():

# Open a connection to MongoDB using a with statement such that the
# connection will be closed as soon as we exit the with statement
# The MONGO_URI connection is required when hosted using a remote mongo db.
    with MongoClient(MONGO_URI) as conn:
        # Define which collection we wish to access
        collection = conn[DBS_NAME][COLLECTION_NAME]
        # Retrieve a result set only with the fields defined in FIELDS
        # and limit the the results to a lower limit of 20000
        projects = collection.find(projection=FIELDS, limit=20000)
        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(projects))


# Initiate the app
if __name__ == '__main__':
    app.run(debug=True) # If debug=True it track the changes while running.
