/* TODO: 
1. Add second slider for end date
2. Prohibit movement of start slider after end slider and vice-versa 
    a. Consider hiding elements vice redrawing
3. Figure out how to eliminate redraw of circles - hide or remove vice delete and redraw
4. Access audio and draw waves and spectrograms
*/


//slider: https://bl.ocks.org/linoba/ecfc96ae52d5f8b8a7435ee5ab49635a

//set margin and size variables
var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

//margins and dimensions for the slider svg
var slider_margin = {top: 0, right: 30, bottom: 0, left: 30},
    slider_width = 800 - margin.left - margin.right,
    slider_height = 150 - margin.top - margin.bottom;

//start and end dates for sliders
var startDate = new Date("1985-01-01")
    endDate = new Date("2018-12-31");

//list for checkboxes
var choices = [];

//create my scales and date formatters/parsers
var x = d3.scaleLinear().domain([0, 200]).range([0, width]);
var y = d3.scaleLinear().domain([0, 200]).range([height, 0]);
var parseDate = d3.timeParse("%m/%d/%Y %H:%M");
var formatDate = d3.timeFormat("%b %Y");
var formatDateIntoYear = d3.timeFormat('%Y')
var z = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, slider_width])
    .clamp(true);

//select body
var body = d3.select("body");

//create svg to hold scatterplot
var svg = body.select('.grid-container')
    .select('.svg-container')
    .append("svg")
    //set its size
    .attr("height", height + margin.top + margin.bottom)
    //set its max width
    .attr("width", width + margin.left + margin.right)
    //append a group element
    .append("g")
    //move it to top left
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

//selects the svg for the slider
var slider_svg = body.select('.grid-container')
    .select(".slider-container")
    .append("svg")
    .attr("height", slider_height)
    .attr("width",  slider_width + slider_margin.left + slider_margin.right);

//creates the slider
var start_slider = slider_svg.append("g")
    .attr("class", "slider")
    .attr("transform","translate(" + slider_margin.left + "," + slider_height / 2 + ")");

//adds the track for the slider
start_slider.append("line")
    .attr("class", "track")
    .attr("x1", z.range()[0])
    .attr("x2", z.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { start_slider.interrupt(); })
        //.on("start drag", function(event) { hue(z.invert(event.x)); }));
        .on("start drag", function(event) { filter_dates(z.invert(event.x)); }));

//sets the tick marks for the slider
start_slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(z.ticks(10))
    .enter()
    .append("text")
    .attr("x", z)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

//the label over the circle for the slider
var label = start_slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

//the circle indicator for the slider
var handle = start_slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

function filter_dates(date) {
    handle.attr("cx", z(date));
    label
        .attr("x", z(date))
        .text(formatDate(date));
    svg.selectAll("circle")
        .filter(d=> d.checked)
        .attr("visibility", function(d) {
            if (d.date > date) {
                return "visible"
            } else {
                return "hidden"
            }
        })
} 
//function called when slider moves - change to filter data
/* function hue(h) {
    handle.attr("cx", z(h));
    label
        .attr("x", z(h))
        .text(formatDate(h));
    slider_svg.style("background-color", d3.hsl(h/1000000000, 0.8, 0.8));
    } */

//draw map
var image = svg.append("image")
.attr("xlink:href", "./map.bmp")
.attr("width", width)
.attr("height", height)
.attr("class", "map");

//set checkbox update on change
d3.selectAll('.myCheckbox')
    .on("change", update);

//functions for select all and deselect all buttons
d3.select('.select-button')
    .on("click", selectCBs);

d3.select('.deselect-button')
    .on("click", deselectCBs);

//add the x axis
svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x))
.style("stroke-width", 4)
.style("font-size", "14px")

// Add the Y Axis
svg.append("g")
.call(d3.axisLeft(y))
.style("stroke-width", 4)
.style("font-size", "14px")
.style('font', 'Times New Roman');

//add the border to the map
svg.append("rect")
.attr("x", 0)
.attr("y", 0)
.attr("height", height)
.attr("width", width)
.style("fill", "none")
.style("stroke-width", 4)
.style("stroke", "black")
.attr("class", "image-border")

//draw everything once page is loaded
draw_chart();
function update() {
    d3.selectAll(".myCheckbox").each(function(d){
        cb = d3.select(this);
        if(cb.property("checked")){
          choices.push(cb.property("value"));
        }
        else if(!cb.property("checked")) {
            choices = choices.filter(item => item !== cb.property("value"))
        }
      });

    //turns non-checked circles hidden
    svg.selectAll("circle")
        .attr("visibility", function(d) {
            if (choices.includes(d.type)) {
                console.log(d.date)
                d.checked = true;
                if (d.date > z.invert(handle.attr('cx')))
                {
                    return "visible";
                }
                else {
                    return "hidden";
                }
            }
            else {
                d.checked = false;
                return "hidden";
            }
        })
}

//get data and update svg with circles
//also handles functionality of data
function draw_chart() {    
    svg.selectAll("circle").remove()
    
    //create a list of checked choices
    d3.selectAll(".myCheckbox").each(function(d){
      cb = d3.select(this);
      if(cb.property("checked")){
        choices.push(cb.property("value"));
      }
      else if(!cb.property("checked")) {
          choices = choices.filter(item => item !== cb.property("value"))
      }
    });


    //create tooltip
    var tooltip = d3.select("body")
        .append("div")
        //.style("position", "absolute")
        .style("font", "12px sans-serif")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .attr("id", "tooltip")
    //add text areas for tooltip
    tooltip.append("div")
        .attr('class', 'type');
    tooltip.append('div')
        .attr('class', 'date')
    tooltip.append('div')
        .attr('class', 'coords')

    //load data
    d3.csv("Cleaned_All_Birds_V2.csv").then(data => {
        data.forEach(d => {
            d.textdate = d.Datetime;
            d.type = d.English_name;
            d.x = +d.X;
            d.y = +d.Y;
            d.id = +d.ID;
            d.date = parseDate(d.Datetime);
            d.checked = false
        });
        //add rect for gridlines from point
        var lines = svg.append("rect")
        .attr("x", 0)
        .attr("y", 100)
        .attr("height", 100)
        .attr("width", 100)
        .style("opacity", 0)
        .attr("class", "lines")
        .attr("z-index", 2);
        //create circles for each sample
        svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            //.filter(d => {return choices.includes(d.type)})
            .attr("visibility", function(d) {
                if (choices.includes(d.type)) {
                    return "visible";
                }
                else {
                    return "hidden";
                }
            })
            //circle size
            .attr("r", 5)
            //x coordinate
            .attr("cx", d => {return x(d.x)})
            //y coordinate
            .attr("cy", d => {return y(d.y)})
            //color set by type
            .attr("fill", d => {return color_by_type(d.type)})
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("z-index", 0)
            //on mouseover function
            .on('mouseover', function (event, d) {
                //increase stroke width of circle
                d3.select(this).transition()
                    .duration('300')
                    .attr("stroke-width", 5)
                //make grid lines visible and set position
                svg.append("rect")
                    .attr('class', 'lines')
                    .attr("x", x(0))
                    .attr("y", y(d.y))
                    .attr("width", x(d.x))
                    .attr("height",  y(0) - y(d.y))
                //show tooltip
                tooltip
                    .style("opacity", 0.8);
            })

            //when the mousemoves
            .on('mousemove', function(event, d) {
                //change tooltip text and tooltip position
                tooltip
                    .style("left", (d3.pointer(event)[0] + 400) + "px")
                    .style("top", (d3.pointer(event)[1] + 20) + "px");
                tooltip
                    .select('.type')
                    .html('<b>Type: ' + d.type +'</b>');
                tooltip
                    .select('.date')
                    .html('<b>Date: ' + d.textdate +'</b>');
                tooltip
                    .select('.coords')
                    .html('<b>Coordinates: X: ' + d.x + ', Y: ' + d.y + '</b>')
            })
            //on mouse off, get rid of tooltip and gridlines
            .on('mouseout', function () {
                d3.select(this).transition()
                    .duration('200')
                    .attr("stroke-width", 1);
                //makes div disappear
                svg.selectAll('rect.lines').remove();
                tooltip
                    .style("opacity", 0);
                
            })
            .on('click', function(event, d) {
                alert(d.type + " " + d.id)
            });


    
        });
}




function selectCBs() {
    d3.selectAll('.myCheckbox')
        .property('checked', true);
        update();
}

function deselectCBs() {
    d3.selectAll('.myCheckbox')
        .property('checked', false)
        update();
}