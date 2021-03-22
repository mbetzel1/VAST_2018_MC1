
//set margin and size variables
var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

//create my scales
var x = d3.scaleLinear().domain([0, 200]).range([0, width]);
var y = d3.scaleLinear().domain([0, 200]).range([height, 0]);

//select body
var body = d3.select("body");
//create svg to hold scatterplot
var svg = body.append("svg")
    //set its size
    .attr("height", height + margin.top + margin.bottom)
    //set its max width
    .attr("width", width + margin.left + margin.right)
    //append a group element
    .append("g")
    //move it to top left
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

//add bmp image to background
var image = svg.append("image")
    .attr("xlink:href", "./map.bmp")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "map");

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
    .style("position", "absolute")
    .style("font", "12px sans-serif")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .attr("id", "tooltip")

//d3.selectAll('.myCheckbox').on("change", update);

//add text areas for tooltip
tooltip.append("div")
    .attr('class', 'type');
tooltip.append('div')
    .attr('class', 'date')

//get data
d3.csv("Cleaned_All_Birds_V2.csv").then(data => {
    data.forEach(d => {
        //potentially convert Datetime to a javascript time format
        d.date = d.Datetime;
        d.type = d.English_name;
        d.x = +d.X;
        d.y = +d.Y;
        d.id = d.ID;
    });

    //create circles for each sample
    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        //circle size
        .attr("r", 5)
        //x coordinate
        .attr("cx", d => {return x(d.x)})
        //y coordinate
        .attr("cy", d => {return y(d.y)})
        //color set by type
        .attr("fill", d => {return color_by_type(d.type)})
        .attr("stroke", "black")
        //on mouseover function
        .on('mouseover', function (d) {
            //increase stroke width of circle
            d3.select(this).transition()
                 .duration('300')
                 .attr("stroke-width", 5)
            //make grid lines visible and set position
            lines
                .transition()
                .duration('200')
                .style("opacity", 1)
                .attr("x", x(0))
                .attr("y", d.y - 110)
                .attr("width", d.x - 37)
                .attr("height", height - d.y + 110)
            //show tooltip
            tooltip
                .style("opacity", 0.8);
       })
       //when the mousemoves
       .on('mousemove', function(event, d) {
           //change tooltip text and tooltip position
           tooltip
           .style("left", d3.pointer(event)[0] + "px")
           .style("top", (d3.pointer(event)[1] + 30) + "px");
           tooltip.select('.type')
            .html('<b>Type: ' + d.type +'</b>')
            tooltip.select('.date')
           .html('<b>Date: ' + d.date +'</b>')
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
   });


    
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .style("stroke-width", 4);
  
    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("stroke-width", 4);
});

//updates when checkboxes are clicked
/* function update(){
    var choices = [];
    d3.selectAll(".myCheckbox").each(function(d){
      cb = d3.select(this);
      if(cb.property("checked")){
        choices.push(cb.property("value"));
      }
    });
  
    if(choices.length > 0){
      newData = data.filter(function(d,i){return choices.includes(d.type);});
    } else {
      newData = data;     
    } 
    
         
  } */

//colors the circles by bird type
function color_by_type(type) {
    if (type === "Bent-beak Riffraff") {
        return "Yellow";
    }
    else if (type === "Bombadil") {
        return "LightSalmon"
    }
    else if (type === "Blue-collared Zipper") {
        return "LightBlue";
    }
    else if (type === "Broad-winged Jojo") {
        return "Lime";
    }
    else if (type === "Canadian Cootamum") {
        return "Teal"
    }
    else if (type === "Carries Champagne Pipit") {
        return "#F7E7CE"
    }
    else if (type === "Darkwing Sparrow") {
        return "#228833"
    }
    else if (type === "Eastern Corn Skeet") {
        return "Gold"
    }
    else if (type === "Green-tipped Scarlet Pipit") {
        return "LightGreen"
    }
    else if (type === "Lesser Birchbeere") {
        return "Plum"
    }
    else if (type === "Orange Pine Plover") {
        return "DarkOrange"
    }
    else if (type === "Ordinary Snape") {
        return "MediumSpringGreen"
    }
    else if (type === "Pinkfinch") {
        return "Fuchsia"
    }
    else if (type === "Purple Tooting Tout") {
        return "Purple"
    }
    else if (type === "Qax") {
        return "GoldenRod"
    }
    else if (type === "Queenscoat") {
        return "Turquoise"
    }
    else if (type === "Scrawny Jay") {
        return "#ee0000"
    }
    else if (type === "Vermillion Trillian") {
        return "#e34234"
    }
    else if (type === "Rose-crested Blue Pipit") {
        return "Blue"
    }
    else{
        return "Black"
    }
};