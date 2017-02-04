/**
 * Created by Irene on 30/01/2017.
 */

//queue() function utilises the queue library for asynchronous loading.
//Useful to get data from multiple API's for a single analysis.
//This function processes the data and inserts it into the apiData Variable
queue()
    .defer(d3.json, "/donorsUS/projects")
    .defer(d3.json, "static/geojson/us-states.json")
    .await(makeGraphs);

function makeGraphs(error, projectsJson, statesJson){

    //Clean projectJson data
    var donorsUSProjects = projectsJson; //Pass the data inside the projectsJson variable into our dataSet variable
    var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S"); // Parse the date data type to suit our charting needs
    donorsUSProjects.forEach(function(d){
        d["date_posted"] = dateFormat.parse(d["date_posted"]); //Set the data type as number using the + operator
        d["date_posted"].setDate(1); // we set all projects date days to 1.
        // All projects from the same month will have the same dateime value
        d["total_donations"] = +d["total_donations"]
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
    var totalDonationsDim = ndx.dimension(function (d) {
        return d["total_donations"];
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
    //Charts
    var timeChart = dc.barChart("#time-chart");
    var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
    var numberProjectsND = dc.numberDisplay("#number-projects-nd");
    var totalDonationsND = dc.numberDisplay("#total-donations-nd");
    var fundingStatusChart = dc.pieChart("#funding-chart");
    var usChart = dc.geoChoroplethChart("#us-chart");
   // var primaryFocusAreaChart = dc.barChart("#primary-focus-area-row-chart");
    var primaryFocusAreaChart2 = dc.pieChart("#primary-focus-area-pie-chart")

    //We assign properties and values to our charts.
    //We also include a select manu to choose between any of all US states for a particlar date
    selectField = dc.selectMenu('#menu-select')
        .dimension(stateDim)
        .group(stateGroup);

    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d){
            return d;
        })
        .group(all);

    totalDonationsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d){
            return d;
        })
        .group(totalDonations)
        .formatNumber(d3.format(".3s"));

    timeChart
        .width(800)
        .height(200)
        .margins({top:20, right:50, bottom:30, left:50})
        .dimension(dateDim)
        .group(numProjectsByDate)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(4);

    resourceTypeChart
        .width(300)
        .height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .xAxis().ticks(4);

  /*  primaryFocusAreaChart
        .width(500)
        .height(300)
        .dimension(primaryFocusAreaDim)
        .group(numProjectsByPrimaryFocusArea)
        .x(d3.scale.ordinal().domain(primaryFocusAreaDim))
        .xUnits(dc.units.ordinal)
        .yAxis().ticks(4)
        ;
        */

    primaryFocusAreaChart2
        .height(250)
        .width(450)
        .radius(120)
        .dimension(primaryFocusAreaDim)
        .group(numProjectsByPrimaryFocusArea)
        .legend(dc.legend().x(0).y(10))
        .minAngleForLabel(0.6)
        .slicesCap(5)
        .label(function (d) {
            if (primaryFocusAreaChart2.hasFilter() && !primaryFocusAreaChart2.hasFilter(d.key)) {
                return d.key + '(0%)';
            }
            var label = d.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        })
        .renderLabel(true)
        .transitionDuration(500);

    povertyLevelChart
        .width(300)
        .height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .xAxis().ticks(4);

    fundingStatusChart
        .height(220)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(fundingStatus)
        .group(numProjectsByFundingStatus);

    usChart
        .width(400)
        .height(165)
        .dimension(stateDim)
        .group(totalDonationsByState)
        .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
        .colorDomain([0, max_state])
        .overlayGeoJson(statesJson["features"], "state", function (d) {
            return d.properties.name;
        })
        .projection(d3.geo.albersUsa()
                    .scale(350)
                    .translate([150, 80]))
        .title(function (p) {
            return "State: " + p["key"]
                    + "\n"
                    + "Total Donations: " + Math.round(p["value"]) + " $";
        });



    dc.renderAll();
}