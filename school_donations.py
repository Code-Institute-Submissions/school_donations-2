from flask import Flask, render_template
from pymongo import MongoClient
import json

# Create Flaks app
app = Flask(__name__)

# Connect to MONGODB Database
MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'donorsUSA'
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
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    projects = collection.find(projection=FIELDS, limit=55000)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects)
    connection.close()
    return json_projects

# Initiate the app
if __name__ == '__main__':
    app.run(debug=True) # If debug=True it track the changes while running.
