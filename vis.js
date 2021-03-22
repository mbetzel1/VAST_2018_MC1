
//set margin and size variables
var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

//create my scales
var x = d3.scaleLinear().domain([0, 200]).range([0, width]);
var y = d3.scaleLinear().domain([0, 200]).range([height, 0]);
var parseDate = d3.timeParse("%m/%d/%Y %H:%M");

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

//draw map
var image = svg.append("image")
.attr("xlink:href", "./map.bmp")
.attr("width", width)
.attr("height", height)
.attr("class", "map");

//set checkbox update on change
d3.selectAll('.myCheckbox')
    .on("change", update);

d3.select('.select-button')
    .on("click", selectCBs);

d3.select('.deselect-button')
    .on("click", deselectCBs);

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

svg.append("rect")
.attr("x", 0)
.attr("y", 0)
.attr("height", height)
.attr("width", width)
.style("fill", "none")
.style("stroke-width", 4)
.style("stroke", "black")
.attr("class", "image-border")



update();

//get data and update svg
function update() {
    svg.selectAll("circle").remove()
    var choices = [];
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
    



    //add rect for gridlines from point
    var lines = svg.append("rect")
        .attr("x", 0)
        .attr("y", 100)
        .attr("height", 100)
        .attr("width", 100)
        .style("opacity", 0)
        .attr("class", "lines");

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
            //potentially convert Datetime to a javascript time format
            d.textdate = d.Datetime;
            d.type = d.English_name;
            d.x = +d.X;
            d.y = +d.Y;
            d.id = +d.ID;
            d.date = parseDate(d.Datetime);
        });

        //create circles for each sample
        svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .filter(d => {return choices.includes(d.type)})
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
            //on mouseover function
            .on('mouseover', function (event, d) {
                //increase stroke width of circle
                d3.select(this).transition()
                    .duration('300')
                    .attr("stroke-width", 5)
                //make grid lines visible and set position
                lines
                    .style("z-index", -1)
                    .transition()
                    .duration('200')
                    .style("opacity", 1)
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
            lines.transition()
                .duration('200')
                .style("opacity", 0);
                tooltip
                .style("opacity", 0)
            tooltip
                .style("opacity", 0);
        })
        .on('click', function(event, d) {
            alert(d.type + " " + d.id)
        });


    
    });
}


//colors the circles by bird type
function color_by_type(type) {
    if (type === "Bent-beak Riffraff") {
        return "#FFFAB6";
    }
    else if (type === "Bombadil") {
        return "LightSalmon"
    }
    else if (type === "Blue-collared Zipper") {
        return "LightBlue";
    }
    else if (type === "Broad-winged Jojo") {
        return "#92f294";
    }
    else if (type === "Canadian Cootamum") {
        return "rgb(49, 129, 129)"
    }
    else if (type === "Carries Champagne Pipit") {
        return "#F3828F"
    }
    else if (type === "Darkwing Sparrow") {
        return "#478a52"
    }
    else if (type === "Eastern Corn Skeet") {
        return "rgb(255, 299, 80)"
    }
    else if (type === "Green-tipped Scarlet Pipit") {
        return "#64E987"
    }
    else if (type === "Lesser Birchbeere") {
        return "#FCCCCC"
    }
    else if (type === "Orange Pine Plover") {
        return "rgb(253, 160, 46)"
    }
    else if (type === "Ordinary Snape") {
        return "#C0F9FA"
    }
    else if (type === "Pinkfinch") {
        return "#F388C6"
    }
    else if (type === "Purple Tooting Tout") {
        return "rgb(131, 38, 131)"
    }
    else if (type === "Qax") {
        return "#5f5882"
    }
    else if (type === "Queenscoat") {
        return "Turquoise"
    }
    else if (type === "Scrawny Jay") {
        return "rgb(62, 62, 253)"
    }
    else if (type === "Vermillion Trillian") {
        return "rgb(204, 255, 65)"
    }
    else if (type === "Rose-crested Blue Pipit") {
        return "#ee0000"
    }
    else{
        return "Black"
    }
};
update
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