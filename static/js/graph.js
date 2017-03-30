/**
 * Created by Irene on 30/01/2017.
 */

//queue() function utilises the queue library for asynchronous loading.
//Useful to get data from multiple API's for a single analysis.
//This function processes the data and inserts it into the apiData Variable
queue()
    .defer(d3.json, "/donorsUS/projects") // Get the data from MongoDB
    .defer(d3.json, "static/geojson/us-states.json") // json file stored locally
    .await(makeGraphs);


function makeGraphs(error, projectsJson, statesJson){

    //Clean projectJson data
    var donorsUSProjects = projectsJson; //Pass the data inside the projectsJson variable into our dataSet variable

    var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S"); // Parse the date data type to suit our charting needs
    donorsUSProjects.forEach(function(d){
        d["date_posted"] = dateFormat.parse(d["date_posted"]);
        d["date_posted"].setDate(1); // we set all projects date days to 1.
        d["total_donations"] = +d["total_donations"] // Set the total donations as number using the + operator
    });


    //Ingesting the data into a crossfilter instance and creating dimensions based on the crossfilter instance
    //Crossfilter acts as a two way data binding pipeline.
    //Whenever you make a selection on the data, it is automatically applied to other charts,
    // as well enabling our drill down functionality.

    //Create a Crossfilter instance
    var ndx = crossfilter(donorsUSProjects);


    //Define Dimensions
    var dateDim = ndx.dimension(function(d){
        return d["date_posted"];
    });
    var resourceTypeDim = ndx.dimension(function(d){
        return d["resource_type"];
    });
    var povertyLevelDim = ndx.dimension(function(d){
        return d["poverty_level"];
    });
    var stateDim = ndx.dimension(function (d) {
        return d["school_state"];
    });
    var fundingStatus = ndx.dimension(function(d){
        return d["funding_status"];
    });
    var primaryFocusAreaDim = ndx.dimension(function(d){
        return d["primary_focus_area"];
    });

    //Calculate metrics and groups for grouping and counting our data
    var numProjectsByDate = dateDim.group();
    var numProjectsByResourceType = resourceTypeDim.group();
    var numProjectsByPovertyLevel = povertyLevelDim.group();
    var numProjectsByFundingStatus = fundingStatus.group();
    var totalDonationsByState = stateDim.group().reduceSum(function (d){
        return d["total_donations"];
    });
    var stateGroup = stateDim.group();
    var numProjectsByPrimaryFocusArea = primaryFocusAreaDim.group();

    var all=ndx.groupAll();
    var totalDonations = ndx.groupAll().reduceSum(function (d){
        return d["total_donations"];
    });

    var max_state = totalDonationsByState.top(1)[0].value;

    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["date_posted"];
    var maxDate = dateDim.top(1)[0]["date_posted"];

    //We define the chart types objects using DC.js library.
    //We also bind the charts to the div ID's in index.html
    var usChart = dc.geoChoroplethChart("#us-chart"); // US map with States
    var numberProjectsND = dc.numberDisplay("#number-projects-nd");
    var totalDonationsND = dc.numberDisplay("#total-donations-nd");
    var timeChart = dc.barChart("#time-chart");
    var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    var fundingStatusChart = dc.pieChart("#funding-chart");
    var primaryFocusAreaChart = dc.pieChart("#primary-focus-area-pie-chart")
    var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");

   //We assign properties and values to our charts.

    //US Map with States to select which ones to apply to the data shown.
    //Uses data from DonorUSProjects to bind with the other graphs and data from us-states (geoJson) to overlay
    //the states in the map. Color scale means amount donated: dark = bigger donations and light = smaller donations.
    usChart
        .width(600)
        .height(300)
        .dimension(stateDim)
        .group(totalDonationsByState)
        .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF",
            "#1E96FF", "#0089FF", "#0061B5"])
        .colorDomain([0, max_state])
        .overlayGeoJson(statesJson["features"], "state", function (d) {
            return d.properties.name;
        })
        .projection(d3.geo.albersUsa()
                    .scale(550)
                    .translate([250, 150]))
        .title(function (p) {
            return "State: " + p["key"]
                    + "\n"
                    + "Total Donations: " + Math.round(p["value"]) + " $";
        });

    // Metric Total Projects
    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d){
            return d;
        })
        .height(100)
        .group(all);

    // Metric Total Donations
    totalDonationsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d){
            return d;
        })
        .group(totalDonations)
        .height(100)
        .formatNumber(d3.format(".3s"));

    //Time-line in Years
    timeChart
        .width(800)
        .height(200)
        .margins({top:20, right:50, bottom:30, left:50})
        .dimension(dateDim)
        .group(numProjectsByDate)
        .colors(d3.scale.ordinal().range(["#4682B4"]))
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(4);


   // Pie Chart Funding Status
    fundingStatusChart
        .height(220)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(fundingStatus)
        .group(numProjectsByFundingStatus)
        .colors(d3.scale.ordinal().range(["#5F9EA0", "#4682B4", "#B0C4DE", "#ADD8E6", "#87CEFA",
            "#6495ED", "#00BFFF", "#1E90FF"]));

    // Pie Chart Primary Focus Area
    primaryFocusAreaChart
        .height(250)
        .width(520)
        .radius(120)
        .dimension(primaryFocusAreaDim)
        .group(numProjectsByPrimaryFocusArea)
        .colors(d3.scale.ordinal().range(["#5F9EA0", "#4682B4", "#B0C4DE", "#ADD8E6", "#87CEFA",
            "#6495ED", "#00BFFF", "#1E90FF"]))
        .legend(dc.legend().x(0).y(10))
        .minAngleForLabel(0.7)
        .externalLabels(0)
        .slicesCap(7)
        .renderLabel(true)
        .transitionDuration(500);



    // Bar Chart Resource Type
    resourceTypeChart
        .width(300)
        .height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .colors(d3.scale.ordinal().range(["#5F9EA0", "#4682B4", "#B0C4DE", "#ADD8E6", "#87CEFA",
            "#6495ED", "#00BFFF", "#1E90FF"]))
        .xAxis().ticks(4);

    // Bar Chart Poverty Level
    povertyLevelChart
        .width(300)
        .height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .colors(d3.scale.ordinal().range(["#5F9EA0", "#4682B4", "#B0C4DE", "#ADD8E6", "#87CEFA",
            "#6495ED", "#00BFFF", "#1E90FF"]))
        .xAxis().ticks(4);

     dc.renderAll();
}