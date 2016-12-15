var socket = io.connect('http://cluster.capella.pro/');

var svg = d3.select("svg"),
    margin = {
        top: 20,
        right: 80,
        bottom: 30,
        left: 50
    },
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y%m%d");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveCardinal)
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return y(d.value);
    });


socket.on('pcs', function(pcs_avalible) {

    var clusters = pcs_avalible.map(function(d){
      return {id: d, values: []};
    });

    console.log(clusters);

    x.domain([
        d3.min(clusters, function(c) {
            return d3.min(c.values, function(d) {
                return d.date;
            });
        }),
        d3.max(clusters, function(c) {
            return d3.max(c.values, function(d) {
                return d.date;
            });
        })
    ]);

    y.domain([0, 100]);

    z.domain(clusters.map(function(c) {
        return c.id;
    }));

    g.append("g")
        .attr("class", "axis x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis y axis")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("% CPU");
    var pc = svg.selectAll(".pc")
        .data(clusters);

    var pc = g.selectAll(".pc")
        .data(clusters)
        .enter().append("g")
        .attr("class", "pc");

    pc.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return line(d.values);
        })
        .style("stroke", function(d) {
            return z(d.id);
        });


    socket.on('info', function(data) {
        clusters[0].values.push({
            value: Math.random() * 100,
            date: new Date()
        });
        clusters[1].values.push({
            value: Math.random() * 100,
            date: new Date()
        });
        if (clusters[0].values.length > 70) clusters[0].values.shift();
        if (clusters[1].values.length > 70) clusters[1].values.shift();


        x.domain([
            d3.min(clusters, function(c) {
                return d3.min(c.values, function(d) {
                    return d.date;
                });
            }),
            d3.max(clusters, function(c) {
                return d3.max(c.values, function(d) {
                    return d.date;
                });
            })
        ]);


        svg.select(".x.axis")
            .transition() // change the x axis
            .duration(500)
            .call(d3.axisBottom(x));


        var pc = svg.selectAll(".pc")
            .data(clusters);

        // sub selection to transition line   
        pc.select(".line")
            .transition()
            .duration(0)
            .attr("d", function(d) {
                return line(d.values);
            })
            .style("stroke", function(d) {
                return z(d.id);
            });

    });

});