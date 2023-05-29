var treeData = {
  name: "T",
  level: "red",
  value: 10,
  children: [
    {
      name: "A",
      level: "green",
      value: 15,
      children: [
        { name: "A1",level: "blue", value: 5},
        { name: "A2" ,level: "blue", value: 8},
        { name: "A3",level: "blue",  value: 6,},
        { name: "A4",level: "blue",  value: 6},
        {
          name: "C",
          level: "yellow", 
          value: 8,
          children: [
            { name: "C1" ,level: "blue", value: 7},
            {
              name: "D",
              level: "purple", 
              value: 6,
              children: [{ name: "D1",value: 5,level: "black",value: 5  }, { name: "D2",level: "blue",value: 5  }]
            }
          ]
        }
      ]
    },
    { name: "Z" ,level: "blue", value: 8},
    {
      name: "B",
      level: "green", 
      value: 12,
      children: [{ name: "B1",level: "blue",value: 7  }, { name: "B2" ,level: "blue",value: 7}, { name: "B3",level: "blue",value: 7  }]
    }
  ]
};

var margin = { top: 20, right: 90, bottom: 30, left: 90 },
  width = 1200 - margin.left - margin.right,
  height = 900 - margin.top - margin.bottom,
  rectWidth=120, //rect width
  rectHight=50 //rectangle height
  offsetYLink=15;


var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var i = 0,
  duration = 750,
  root;
var treemap = d3.tree().size([height, width]);
root = d3.hierarchy(treeData, function(d) {
  return d.children;
});
root.x0 = height / 2;
root.y0 = 0;
root.children.forEach(collapse);

update(root);
function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

function update(source) {
  var treeData = treemap(root);
  var nodes = treeData.descendants(),
    links = treeData.descendants().slice(1);
  nodes.forEach(function(d) {
    d.y = d.depth * 180;
  });
  var node = svg.selectAll("g.node").data(nodes, function(d) {
    return d.id || (d.id = ++i);
  });
  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", click);

//------------------ draw rectangle ---------------------------------
  nodeEnter
    .attr("class", "node")
    .attr("r", 1e-6)
    .style("fill", function(d) {
      return d.parent ? "rgb(39, 43, 77)" : "#fe6e9e";
    });
  nodeEnter
    .append("rect")
    .attr("rx", function(d) {
      if (d.parent) return d.children || d._children ? 0 : 6;
      return 10;
    })
    .attr("ry", function(d) {
      if (d.parent) return d.children || d._children ? 0 : 6;
      return 10;
    })
    .attr("stroke-width", function(d) {
      return d.parent ? 1 : 0;
    })
    .attr("stroke", function(d) {
      return d.children || d._children
        ? "rgb(3, 192, 220)"
        : "rgb(38, 222, 176)";
    })
    .attr("stroke-dasharray", function(d) {
      return d.children || d._children ? "0" : "2.2";
    })
    .attr("stroke-opacity", function(d) {
      return d.children || d._children ? "1" : "0.6";
    })
    .attr("x", 0)
    .attr("y", -10)
    .attr("width", function(d) {
      return d.parent ? rectWidth : rectWidth;
    })
    .attr("height", rectHight);
//------------------------ end rectangle -------------------------------------


//-------------------- text -------------------------------------------------------------    
  nodeEnter
    .append("text")
    .style("fill", function(d) {
      if (d.parent) {
        return d.children || d._children ? "#ffffff" : "rgb(38, 222, 176)";
      }
      return "rgb(39, 43, 77)";
    })
    .attr("dy", ".35em")
    .attr("x", function(d) {
      return d.children ? (d.data.value)*(1) : d.data.value+4
    })
    .attr("text-anchor", function(d) {
      return "middle";
    })
    .text(function(d) {
      return d.data.name;
    });
  //----------------- end text --------------------------------------------

  nodeEnter
  .append("a")
  .attr("xlink:href", "http://en.wikipedia.org/wiki/")
  .on("click", (event)=>{
    console.log("d3.event",event)
    event.preventDefault();
    event.stopPropagation();
  })
  .append("image")
  .attr("xlink:href", "https://github.com/favicon.ico")
  .attr("x", 18)
  .attr("y", 18)
  .attr("width", 16)
  .attr("height", 16);


  var nodeUpdate = nodeEnter.merge(node);

  nodeUpdate
    .transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });
  var nodeExit = node
    .exit()
    .transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();
  nodeExit.select("rect").style("opacity", 1e-6);
  nodeExit.select("rect").attr("stroke-opacity", 1e-6);
  nodeExit.select("text").style("fill-opacity", 1e-6);


  //------------------------------ link -----------------------------------------------
  var link = svg.selectAll("path.link").data(links, function(d) {
    return d.id;
  });
  var linkEnter = link
    .enter()
    .insert("path", "g")
    .attr("class", "link")
    .style("stroke", function(d) { return d.data.level; })
    .attr("d", function(d) {
     // var o = { x: d.x+this.offsetYLink, y: d.y };
     // return diagonal(o, {x:d.parent.x+this.offsetYLink,y:d.parent.y+this.rectWidth});
      var o = { x: source.x0+offsetYLink, y: source.y0 };
      return diagonal(o, o);
    });
  var linkUpdate = linkEnter.merge(link);
  linkUpdate
    .transition()
    .duration(duration)
    .attr("d", function(d) {
      var o = { x: d.x+offsetYLink, y: d.y };
      return diagonal(o, {x:d.parent.x+offsetYLink,y:d.parent.y+rectWidth});
    });
  var linkExit = link
    .exit()
    .transition()
    .duration(duration)
    .attr("d", function(d) {
    // var o = { x: source.x, y: source.y };
      var o = { x: source.x+offsetYLink, y: source.y };
      return diagonal(o, o);
    })
    .remove();
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
  function diagonal(s, d) {
    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

    return path;
  }
//------------------------- end link ----------------------------------------------------------


  // function click(d) {
  //   if (d.children) {
  //     d._children = d.children;
  //     d.children = null;
  //   } else {
  //     d.children = d._children;
  //     d._children = null;
  //   }
  //   update(d);
  // }
  
  function click(d) {
    if (d.currentTarget.__data__.children) {
      d.currentTarget.__data__._children = d.currentTarget.__data__.children;
      d.currentTarget.__data__.children = null;
    } else {
      d.currentTarget.__data__.children = d.currentTarget.__data__._children;
      d.currentTarget.__data__._children = null;
    }
    update(d.currentTarget.__data__);
  }
}

// var treeData = {
//   name: "T",
//   children: [
//     {
//       name: "A",
//       children: [
//         { name: "A1" },
//         { name: "A2" },
//         { name: "A3" },
//         { name: "A4" },
//         {
//           name: "C",

//           children: [
//             { name: "C1" },
//             {
//               name: "D",
//               children: [{ name: "D1" }, { name: "D2" }]
//             }
//           ]
//         }
//       ]
//     },
//     { name: "Z" },
//     {
//       name: "B",
//       children: [{ name: "B1" }, { name: "B2" }, { name: "B3" }]
//     }
//   ]
// };

// var margin = { top: 20, right: 90, bottom: 30, left: 90 },
//   width = 960 - margin.left - margin.right,
//   height = 500 - margin.top - margin.bottom;
// var svg = d3
//   .select("body")
//   .append("svg")
//   .attr("width", width + margin.right + margin.left)
//   .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// var i = 0,
//   duration = 750,
//   root;
// var treemap = d3.tree().size([height, width]);
// root = d3.hierarchy(treeData, function(d) {
//   return d.children;
// });
// root.x0 = height / 2;
// root.y0 = 0;
// root.children.forEach(collapse);

// update(root);
// function collapse(d) {
//   if (d.children) {
//     d._children = d.children;
//     d._children.forEach(collapse);
//     d.children = null;
//   }
// }

// function update(source) {
//   var treeData = treemap(root);
//   var nodes = treeData.descendants(),
//     links = treeData.descendants().slice(1);
//   nodes.forEach(function(d) {
//     d.y = d.depth * 180;
//   });
//   var node = svg.selectAll("g.node").data(nodes, function(d) {
//     return d.id || (d.id = ++i);
//   });
//   var nodeEnter = node
//     .enter()
//     .append("g")
//     .attr("class", "node")
//     .attr("transform", function(d) {
//       return "translate(" + source.y0 + "," + source.x0 + ")";
//     })
//     .on("click", click);
//   nodeEnter
//     .attr("class", "node")
//     .attr("r", 1e-6)
//     .style("fill", function(d) {
//       return d.parent ? "rgb(39, 43, 77)" : "#ff0000";
//     });
//   nodeEnter
//     .append("rect")
//     .attr("rx", function(d) {
//       if (d.parent) return d.children || d._children ? 0 : 6;
//       return 10;
//     })
//     .attr("ry", function(d) {
//       if (d.parent) return d.children || d._children ? 0 : 6;
//       return 10;
//     })
//     .attr("stroke-width", function(d) {
//       return d.parent ? 1 : 0;
//     })
//     .attr("stroke", function(d) {
//       return d.children || d._children
//         ? "rgb(3, 192, 220)"
//         : "rgb(38, 222, 176)";
//     })
//     .attr("stroke-dasharray", function(d) {
//       return d.children || d._children ? "0" : "2.2";
//     })
//     .attr("stroke-opacity", function(d) {
//       return d.children || d._children ? "1" : "0.6";
//     })
//     .attr("x", 0)
//     .attr("y", -10)
//     .attr("width", function(d) {
//       return d.parent ? 40 : 20;
//     })
//     .attr("height", 20);

//   nodeEnter
//     .append("text")
//     .style("fill", function(d) {
//       if (d.parent) {
//         return d.children || d._children ? "#ffffff" : "rgb(38, 222, 176)";
//       }
//       return "rgb(39, 43, 77)";
//     })
//     .attr("dy", ".35em")
//     .attr("x", function(d) {
//       return d.parent ? 10 : 10;
//     })
//     .attr("text-anchor", function(d) {
//       return "middle";
//     })
//     .text(function(d) {
//       return d.data.name;
//     });

//   var nodeUpdate = nodeEnter.merge(node);

//   nodeUpdate
//     .transition()
//     .duration(duration)
//     .attr("transform", function(d) {
//       return "translate(" + d.y + "," + d.x + ")";
//     });
//   var nodeExit = node
//     .exit()
//     .transition()
//     .duration(duration)
//     .attr("transform", function(d) {
//       return "translate(" + source.y + "," + source.x + ")";
//     })
//     .remove();
//   nodeExit.select("rect").style("opacity", 1e-6);
//   nodeExit.select("rect").attr("stroke-opacity", 1e-6);
//   nodeExit.select("text").style("fill-opacity", 1e-6);
//   var link = svg.selectAll("path.link").data(links, function(d) {
//     return d.id;
//   });
//   var linkEnter = link
//     .enter()
//     .insert("path", "g")
//     .attr("class", "link")
//     .attr("d", function(d) {
//       var o = { x: source.x0, y: source.y0 };
//       return diagonal(o, o);
//     });
//   var linkUpdate = linkEnter.merge(link);
//   linkUpdate
//     .transition()
//     .duration(duration)
//     .attr("d", function(d) {
//       return diagonal(d, d.parent);
//     });
//   var linkExit = link
//     .exit()
//     .transition()
//     .duration(duration)
//     .attr("d", function(d) {
//       var o = { x: source.x, y: source.y };
//       return diagonal(o, o);
//     })
//     .remove();
//   nodes.forEach(function(d) {
//     d.x0 = d.x;
//     d.y0 = d.y;
//   });
//   function diagonal(s, d) {
//     path = `M ${s.y} ${s.x}
//             C ${(s.y + d.y) / 2} ${s.x},
//               ${(s.y + d.y) / 2} ${d.x},
//               ${d.y} ${d.x}`;

//     return path;
//   }
//   // function click(d) {
//   //   if (d.children) {
//   //     d._children = d.children;
//   //     d.children = null;
//   //   } else {
//   //     d.children = d._children;
//   //     d._children = null;
//   //   }
//   //   update(d);
//   // }


//   function click(d) {
//     if (d.currentTarget.__data__.children) {
//       d.currentTarget.__data__._children = d.currentTarget.__data__.children;
//       d.currentTarget.__data__.children = null;
//     } else {
//       d.currentTarget.__data__.children = d.currentTarget.__data__._children;
//       d.currentTarget.__data__._children = null;
//     }
//     update(d.currentTarget.__data__);
//   }
// }