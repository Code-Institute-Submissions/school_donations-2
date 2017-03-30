# School Donations
## Code Institute - Project 2, Data visualisation Dashboard
 
## Overview

The objective of this project was to create a web-based Data Dashboard.  
This dashboard was created using a dataset from [DonorsChoose.org](http://www.donorschoose.org) provided by Code Institute.   
The data represents school donations broken down by different attributes over a timeline. 
The dashboard is interactive in the senses that in each graph you can select the values you want to see reflected in 
the rest of the dashboard, e.g. select only 2016 in the time-line or select only Technology resources in the Resources graph. 

Part of the project was built by Code Institute, providing me with the code to:
1.	Create the Python app required to server the database content to the web interface.
2.	Write the HTML required to display the dashboard.
3.	Import the JavaScript libraries and write the code required to render the data to our dashboard elements.
4.	Create core CSS used to style dashboard elements.

### Modifications to code provided and additions 
From the code provided I made some modifications:
- Organise the presentation layer layout to display the data in a visually effective manner.
- Add style and background image
- Replace the select menu with an interactive map that allows to select 1 or more states (original code from )
- Add and additional data dimension and associated visualisation for "Primary Focus Area"  
- Include additional functionality that provides a Dashboard tutorial, which targets each Dashboard element with an 
    explanation of its purpose.


## Technology and Structure

The technology used in this project is:
- D3.js: A JavaScript based visualization engine, which will render interactive charts and graphs based on the data.
    D3 creates svg based charts which are passed into html div blocks.
- Dc.js: A JavaScript based wrapper library for D3.js, which makes plotting the charts a lot easier.
- Crossfilter.js: A JavaScript based data manipulation library that enables two way data binding.
- Queue.js: An asynchronous helper library for JavaScript.
- Mongo DB: NoSQL Database used to convert and present our data in JSON format.
- Flask: A Python based  micro – framework  used to serve our data from the server to our web based interface.
- Bootstrap: JavaScript library ######ADD INFO###
- keen.js: A dashboard template library. used in conjunction with keen.js to layout our dashboard elements.
- queue.js: An asynchronous helper library for data ingestion involving multivariate datasets.
- intro.js: Assign an interactive tool tip to our graphs and display helpful information to the user who is going to use the dashboard.

### Internal Structure / Process

MongoDB converts the csv file to a json file
school_donations.py (Python Flask) retrieves the data from MongoDB and creates a route to index.html
index.html contains the page structure and elements to present the dashboard.
graphs.js is where data is injected into a crossfilter instance and create dimensions based on that crossfilter instance.  
crossfilter.js filters the data before being bound to the charts, which are created using
a combination of d3.js and dc.js
Queue.js is used to create a queue that reads also from the additional database stored locally "us-states.json".




### Directory Structure

school_donations
- static/
  - css/
    - custom.css
  - geojson/
    - us-states.json
  - img/
  - js/
    - graph.js
  - lib/
    - css/ (3rd party css files)
    - js/ (3rd party css files)
- templates/
  - index.html
- README.md
- requirements.txt
- school_donations.py

## Testing

All the testing was done manually using different browsers (Chrome, Firefox, IE and Opera) 
and different screen sizes using the Element Inspector and the responsive/device mode.

- Responsiveness: Tested that the bootstrap boxes resize when the screen size decrease or increase. 
- Content: Tested that the graphs show the correct values when loading the data
- Data binding: Tested that the graphs show the correct values when the data binding is happening.
- Tour: Tested that the tooltip created with intro.js shows the right content in the right places, it's fully
    visible even in small screens - all data steps have been aligned center to achieve that.
    
   

## Challenges



## Known Issues
The main layout using bootstrap is responsive but the graphs themselves are not.   
I have tried to make the graphs responsive, but with my current knowledge and the time available I haven't been able to
do it, so when the screen is smaller the overflow is hidden and you can only see the part that fits in each bootstrap box. 


## Contributing / Getting the code up and running

1. Clone repository
2. Make sure you have installed the packages in requirements.txt
3. Upload the csv data file to MongoDB to create the json
4. Connect to MongoDB
5. Run school_donations.py
6. The project will run in localhost http://localhost:5000/