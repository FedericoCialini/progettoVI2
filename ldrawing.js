

//---------------- constants ----------------//

const updateTime = 300
const workarea_width = 1600;
const workarea_height = 900;
const workarea_center_x = workarea_width/2;
const workarea_center_y = workarea_height/2;

const distance = 80;
const cluster_rect_width = 60;
const cluster_rect_height = 60;
const node_circle_r = 20;  // -> diameter is 2*r

const animations_duration = 300; // in milliseconds

let panOnExplode = true;
let panOnImplode = true;

let hueRange = 360;   //HSL
let nodeHue = 60;
let nodeSaturation = 100;
let clusterSaturation = 85;
let lightness = 50;

let base_bg_opacity = 0.25;
let max_bg_opacity = 1;
let bg_opacity_decay = 1 - (1/(max_bg_opacity/base_bg_opacity));

let examples = [["graphs/small.json"],["graphs/medium.json"],["graphs/big.json"],["graphs/empty.json"]];

let defaultGraph = examples[1];

let menu_bg_color = "#36393f"
let menu_stroke_color = "#202225"
let menu_text_color = "#eaeaeb"

let base_container_width = 1600   //we based menu sizes around these
let base_container_height = 900



//---------------- workarea ----------------//


let currentZoomScale = 1;
let currentZoomX = 0;
let currentZoomY = 0;

let zoom = d3.zoom().on("zoom", function () {
    currentZoomScale = d3.event.transform.k;
    currentZoomX = d3.event.transform.x;
    currentZoomY = d3.event.transform.y;
    workarea.attr("transform", d3.event.transform);
});

let svg = d3.select("body")
    .append("svg");

let container = svg
    .attr("width", base_container_width).attr("height", base_container_height)
    .attr("style", "outline: medium solid black;")
    .call(zoom)
    .on("dblclick.zoom", null);

var workarea = container.append("g");
let currentMenuScale = 1;

function resize_container() {
    let newWidth = window.innerWidth - 20;
    let newHeight = window.innerHeight - 20;
    let oldWidth = container.attr("width");
    let oldHeight = container.attr("height");

    container.attr("width",newWidth).attr("height",newHeight);
    updateMenuScale(base_container_width, base_container_height, newWidth, newHeight);

    try {
        light_on("resize")
    }catch (e) {

    }

    //if(typeof id2plane !== 'undefined') panAndZoomToRootPlaneCenter(id2plane['0']);
    panAndZoomToCurrentWorkareaCenter(oldWidth, oldHeight, newWidth, newHeight);
}

resize_container();

window.addEventListener("resize", resize_container);

//--------Editor-Menu-----------//
let arrow=false
let clustercolors  = {}
let  on_off_click = false
let editor_mode = false
let add_node = false
let remove_node = false
let add_edge = false
let remove_edge = false
let add_cluster = false
let global_plane = null
let global_plane_bool = false
let global_nodes = []
let selected = null
let first_selected_node = null
let second_selected_node = null
let remove_cluster = false

let x = 0;
let l = 'None';
data=['addNode','DelNode','addEdge','DelEdge','addCluster','DelCluster','arrow','help','text','text2','texthelp']
data2=['addOn','DelOn','add-a-On','Del-a-On','add-c-On','Del-c-On','arrowOn','helpOn']
let lights = container.selectAll('light').data(data2, (d) => d.id)
lights.exit().remove()
let options = container.selectAll('option').data(data, (d) => d.id)
options.exit().remove()
var start=true
var is_help=false
var screenX;
var screenY;
var dimIcon;
var dimIconLight;
var spaceIcon;
var lastNodeActivated = 'arrowOn'
active()
function light_on(id) {
    screenX=window.innerWidth -20
    screenY=window.innerHeight
    dimIcon=screenY/10
    dimIconLight=dimIcon+(dimIcon/8)
    spaceIcon=((screenY/8)-dimIcon)-(((screenY/8)-dimIcon)/8)
    let border =((screenX-(dimIcon+(dimIcon * (3/8))))-(dimIcon))
    start=false
    container.selectAll("[id='text']").remove()
    container.selectAll("[id='text2']").remove()
    container.selectAll("[id='arrow']").remove()
    container.selectAll(".option").remove()
    container.selectAll(".menuDx").remove()
    container.append("rect").attr("fill", menu_bg_color).attr("stroke", menu_stroke_color).attr("stroke-width", 3)
        .attr("class", "menuDx").attr("x", screenX-(dimIcon+(dimIcon * (3/8)))).attr("y", 0).attr("width", dimIcon+(dimIcon/2.5)).attr("height", screenY).attr("opacity", 0.9);
    if(id!='helpOn'){container.selectAll("[id='texthelp']").remove(),is_help=false}
    let light = lights.enter()
        .append('g')
        .attr('class', 'light')
        .attr('id', (d) => d.id)
    container.selectAll("[id='" + l + "']").remove()
    if (!(id==='resize')) {
        container.selectAll("[id='" + lastNodeActivated + "']").remove()
        lastNodeActivated = id
    }
    clearNodes(id)

    l = id
    x = 0
    active()
    x = 1
    if (id === 'addOn' || (id === 'resize' && lastNodeActivated === 'addOn')) {
        light
            .append("svg:image")
            .attr("id", "addOn")
            .attr("x", (d) => screenX - (dimIcon + (dimIcon / 3)))
            .attr("y", (d) => dimIcon + spaceIcon)
            .attr("xlink:href", "images/new-on.svg")
            .attr("height", (d) => dimIconLight)
            .attr("width", (d) => dimIconLight)

        container.selectAll("[id='addNode']").remove()

    } else if (id === 'DelOn' || (id === 'resize' && lastNodeActivated === 'DelOn')) {
        light
            .append("svg:image")
            .attr("id", "DelOn")
            .attr("x", (d) => screenX - (dimIcon + (dimIcon / 3)))
            .attr("y", (d) => (dimIcon + spaceIcon) * 2)
            .attr("xlink:href", "images/canc-on.svg")
            .attr("height", (d) => dimIconLight)
            .attr("width", (d) => dimIconLight)
        container.selectAll("[id='DelNode']").remove()
    } else if (id === 'add-a-On'|| (id === 'resize' && lastNodeActivated === 'add-a-On') ) {
        if(id==='resize'){
            container.selectAll("[id='add-a-On']").remove()
        }
        light
            .append("svg:image")
            .attr("id", "add-a-On")
            .attr("x", (d) => screenX - (dimIcon + (dimIcon / 3)))
            .attr("y", (d) => (dimIcon + spaceIcon) * 3)
            .attr("xlink:href", "images/new-a-on.svg")
            .attr("height", (d) => dimIconLight)
            .attr("width", (d) => dimIconLight)
        container.selectAll("[id='addEdge']").remove()
    } else if (id === 'Del-a-On'|| (id === 'resize' && lastNodeActivated === 'Del-a-On') ) {

        light
            .append("svg:image")
            .attr("id", "Del-a-On")
            .attr("x", (d) => screenX - (dimIcon + (dimIcon / 3)))
            .attr("y", (d) => (dimIcon + spaceIcon) * 4)
            .attr("xlink:href", "images/canc-a-on.svg")
            .attr("height", (d) => dimIconLight)
            .attr("width", (d) => dimIconLight)
        container.selectAll("[id='DelEdge']").remove()
    } else if (id === 'add-c-On' || (id === 'resize' && lastNodeActivated === 'add-c-On')) {
        light
            .append("svg:image")
            .attr("id", "add-c-On")
            .attr("x", (d) => screenX - (dimIcon + (dimIcon / 3)))
            .attr("y", (d) => (dimIcon + spaceIcon) * 5)
            .attr("xlink:href", "images/new-c-on.svg")
            .attr("height", (d) => dimIconLight)
            .attr("width", (d) => dimIconLight)
        container.selectAll("[id='addCluster']").remove()
    } else if (id === 'Del-c-On' || (id === 'resize' && lastNodeActivated === 'Del-c-On')) {
        light
            .append("svg:image")
            .attr("id", "Del-c-On")
            .attr("x", (d) => screenX - (dimIcon + (dimIcon / 3)))
            .attr("y", (d) => (dimIcon + spaceIcon) * 6)
            .attr("xlink:href", "images/canc-c-on.svg")
            .attr("height", (d) => dimIconLight)
            .attr("width", (d) => dimIconLight)
        container.selectAll("[id='DelCluster']").remove()
    } else if (id === 'arrowOn' || (id === 'resize' && lastNodeActivated === 'arrowOn')) {
        light
            .append("svg:image")
            .attr("id", "arrowOn")
            .attr("x", (d) => screenX - (dimIcon + (dimIcon / 3)))
            .attr("y", (d) => 0)
            .attr("xlink:href", "images/arrow-on.svg")
            .attr("height", (d) => dimIconLight)
            .attr("width", (d) => dimIconLight)
        container.selectAll("[id='arrow']").remove()
    } else if (id === 'helpOn' || (id === 'resize' && lastNodeActivated === 'helpOn')) {
        light
            .append("svg:image")
            .attr("id", "helpOn")
            .attr("x", (d) => screenX - (dimIcon + (dimIcon / 3)))
            .attr("y", (d) => (dimIcon + spaceIcon) * 7)
            .attr("xlink:href", "images/help-on.svg")
            .attr("height", (d) => dimIconLight)
            .attr("width", (d) => dimIconLight)
            .on("mouseover",function () {
                light.append("text")
                    .attr("x", (d) => border - dimIcon * 5)
                    .attr("y", (d) => ((dimIcon + spaceIcon) * 7) + spaceIcon)
                    .attr("id", "text")//easy to style with CSS
                    .text("move on icon to know how it work")
                    .style("font-size", function (d) {
                        return Math.min(dimIcon / 3, dimIcon / 3) + "px";
                    })

            })
            .on("mouseout",function(){container.selectAll("[id='text']").remove()})
        if (id==='resize'){
            is_help = true
        }
        container.selectAll("[id='help']").remove()
        container.selectAll("[id='texthelp']").remove()
    }


}
function clearNodes(id) {
    if(id==='resize'){
        container.selectAll("[id='Del-c-On']").remove()
        container.selectAll("[id='arrowOn']").remove()
        container.selectAll("[id='helpOn']").remove()
        container.selectAll("[id='add-c-On']").remove()
        container.selectAll("[id='Del-a-On']").remove()
        container.selectAll("[id='add-a-On']").remove()
        container.selectAll("[id='DelOn']").remove()
        container.selectAll("[id='addOn']").remove()
    }
    if (id!=='resize'){
        container.selectAll("[id='"+lastNodeActivated+"']").remove()
    }
}


function active() {
    screenX=window.innerWidth -15
    screenY=window.innerHeight
    dimIcon=screenY/11
    dimIconLight=dimIcon+(dimIcon/8)
    spaceIcon=((screenY/8)-dimIcon)-(((screenY/8)-dimIcon)/8)
    if( container.select(".menuDx")._groups[0][0]===undefined)
        container.append("rect").attr("fill", menu_bg_color).attr("stroke", menu_stroke_color).attr("stroke-width", 3)
            .attr("class", "menuDx").attr("x", screenX-(dimIcon+(dimIcon * (3/8)))).attr("y", 0).attr("width", dimIcon+(dimIcon/2.5)).attr("height", screenY).attr("opacity", 0.9);
    let border =((screenX-(dimIcon+(dimIcon * (3/8))))-(dimIcon))
    if (x === 0) {
        var arrowId,arrowH,arrowW,arrowX,arrowY
        if(start==true){arrowId='arrow-on',arrowH=dimIconLight,arrowW=dimIconLight,arrowX=screenX-(dimIcon+(dimIcon/3)),arrowY=0}else{arrowId='arrow',arrowH=dimIcon,arrowW=dimIcon,arrowX=screenX-(dimIcon+(dimIcon/3)),arrowY=0}
        editor_mode = true
        x=1
        let option = options.enter()
            .append('g')
            .attr('class', 'option')
            .attr('id', (d) => d.id)
        option
            .append("svg:image")
            .attr("id", "arrow")
            .attr("x", (d) => arrowX )
            .attr("y", (d) => arrowY)
            .attr("xlink:href", "images/"+arrowId+".svg")
            .attr("height", (d) => arrowH)
            .attr("width", (d) => arrowW)
            .on("click", function () {
                light_on('arrowOn')
                on_off_click=true
                arrow = true
                remove_node = false
                remove_edge = false
                add_edge = false
                add_node = false
                remove_cluster = false
                add_cluster = false
                plane = id2plane[0]
                restoreSelectedNodes()
                plane.displayPlane()
            })
            .on("mouseover",function () {

                if(start==false && is_help==true){
                    option.append("text")
                        .attr("x", (d) =>border - dimIcon*5)
                        .attr("y", (d) => arrowY + dimIcon)
                        .attr("id", "text")//easy to style with CSS
                        .attr("height", (d) => screenY/11 - dimIcon*10)
                        .text("Go back in exploration mode")
                        .style("font-size", function (d) {
                            return Math.min(dimIcon/3, dimIcon/3) + "px";
                        })}


            })
            .on("mouseout",function(){if(start==false ){container.selectAll("[id='text']").remove()}})

        option
            .append("svg:image")
            .attr("id", "addNode")
            .attr("x", (d) => screenX-(dimIcon+(dimIcon/3)))
            .attr("y", (d) => dimIcon+spaceIcon)
            .attr("xlink:href", "images/new.svg")
            .attr("height", (d) =>dimIcon)
            .attr("width", (d) =>dimIcon)
            .on("click",function() {
                light_on('addOn')
                on_off_click=true
                arrow = false
                remove_node=false
                remove_edge=false
                add_edge = false
                add_node = true
                remove_cluster = false
                add_cluster = false
                plane = id2plane[0]
                restoreSelectedNodes()
                plane.displayPlane()
            })
            .on("mouseover",function () {
                if(is_help==true){
                    option.append("text")
                        .attr("x", (d) =>border - dimIcon*5)
                        .attr("y", (d) => dimIcon+spaceIcon)
                        .attr("id", "text")//easy to style with CSS
                        .text("add node on screen: double click")
                        .style("font-size", function (d) {
                            return Math.min(dimIcon/3, dimIcon/3) + "px";
                        }),
                        option.append("text")
                            .attr("x", (d) =>border - dimIcon*5)
                            .attr("id", "text2")//easy to style with CSS
                            .attr("y", (d) =>(dimIcon+spaceIcon) + (screenY/15))
                            .text("add node inside a cluster :")
                            .style("font-size", function (d) {
                                return Math.min(dimIcon/3, dimIcon/3) + "px";
                            }),
                        option.append("text").attr("x", (d) =>border - dimIcon*5)
                            .attr("id", "text2")//easy to style with CSS
                            .attr("y", (d) =>(dimIcon+spaceIcon) + ((screenY/15)*2))
                            .text("click on cluster background")
                            .style("font-size", function (d) {
                                return Math.min(dimIcon/3, dimIcon/3) + "px";
                            })}



            })
            .on("mouseout",function(){container.selectAll("[id='text']").remove(),container.selectAll("[id='text2']").remove()})
        option
            .append("svg:image")
            .attr("id", "DelNode")
            .attr("x", (d) => screenX-(dimIcon+(dimIcon/3)))
            .attr("y", (d) => (dimIcon + spaceIcon)*2)
            .attr("xlink:href", "images/canc.svg")
            .attr("height", (d) => dimIcon)
            .attr("width", (d) => dimIcon)
            .on("click",function() {
                light_on('DelOn')
                on_off_click=true
                arrow = false
                remove_node=true
                remove_edge=false
                add_edge = false
                add_node = false
                remove_cluster = false
                add_cluster = false
                plane = id2plane[0]
                restoreSelectedNodes()
                plane.displayPlane()

            })
            .on("mouseover",function () {
                if(is_help==true){
                    option.append("text")
                        .attr("x", (d) =>border - dimIcon*5)
                        .attr("y", (d) => ((dimIcon + spaceIcon)*2)+spaceIcon)
                        .attr("id", "text")//easy to style with CSS
                        .text("click on  node you want to delete")
                        .style("font-size", function (d) {
                            return Math.min(dimIcon/3, dimIcon/3) + "px";
                        })}

            })
            .on("mouseout",function(){container.selectAll("[id='text']").remove()})
        option
            .append("svg:image")
            .attr("id", "addEdge")
            .attr("x", (d) => screenX-(dimIcon+(dimIcon/3)))
            .attr("y", (d) => (dimIcon+ spaceIcon)*3)
            .attr("xlink:href", "images/new-a.svg")
            .attr("height", (d) => dimIcon)
            .attr("width", (d) => dimIcon)
            .on("click",function() {
                light_on('add-a-On')
                on_off_click=true
                arrow = false
                remove_node=false
                remove_edge=false
                add_edge = true
                add_node = false
                remove_cluster = false
                add_cluster = false
                plane = id2plane[0]
                restoreSelectedNodes()
                plane.displayPlane()
            })
            .on("mouseover",function () {
                if(is_help==true){
                    option.append("text")
                        .attr("x", (d) =>border - dimIcon*5)
                        .attr("y", (d) => ((dimIcon+ spaceIcon)*3)+spaceIcon)
                        .attr("id", "text")//easy to style with CSS
                        .text("click first on source node,")
                        .style("font-size", function (d) {
                            return Math.min(dimIcon/3, dimIcon/3) + "px";
                        }),
                        option.append("text")
                            .attr("x", (d) =>border - dimIcon*5)
                            .attr("id", "text2")//easy to style with CSS
                            .attr("y", (d) =>(((dimIcon+ spaceIcon)*3)+spaceIcon) + (screenY/15))
                            .text("then click on destination node")
                            .style("font-size", function (d) {
                                return Math.min(dimIcon/3, dimIcon/3) + "px";
                            }),
                        option.append("text").attr("x", (d) =>border - dimIcon*5)
                            .attr("id", "text2")//easy to style with CSS
                            .attr("y", (d) =>(((dimIcon+ spaceIcon)*3)+spaceIcon) + ((screenY/15)*2))
                            .text("in order to create an edge")
                            .style("font-size", function (d) {
                                return Math.min(dimIcon/3, dimIcon/3) + "px";
                            })}


            })
            .on("mouseout",function(){container.selectAll("[id='text']").remove(),container.selectAll("[id='text2']").remove()})
        option
            .append("svg:image")
            .attr("id", "DelEdge")
            .attr("x", (d) => screenX-(dimIcon+(dimIcon/3)))
            .attr("y", (d) => (dimIcon+ spaceIcon)*4)
            .attr("xlink:href", "images/canc-a.svg")
            .attr("height", (d) => dimIcon)
            .attr("width", (d) =>dimIcon)
            .on("click",function () {
                light_on('Del-a-On')
                on_off_click=true
                arrow = false
                remove_node=false
                remove_edge=true
                add_edge = false
                add_node = false
                remove_cluster = false
                add_cluster = false
                plane = id2plane[0]
                restoreSelectedNodes()
                plane.displayPlane()
            })
            .on("mouseover",function () {
                if(is_help==true){
                    option.append("text")
                        .attr("x", (d) =>border - dimIcon*5)
                        .attr("y", (d) => ((dimIcon+ spaceIcon)*4)+spaceIcon)
                        .attr("id", "text")//easy to style with CSS
                        .text("click first on source node,")
                        .style("font-size", function (d) {
                            return Math.min(dimIcon/3, dimIcon/3) + "px";
                        }),
                        option.append("text")
                            .attr("x", (d) =>border - dimIcon*5)
                            .attr("id", "text2")//easy to style with CSS
                            .attr("y", (d) =>(((dimIcon+ spaceIcon)*4)+spaceIcon) + (screenY/15))
                            .text("then click on destination node")
                            .style("font-size", function (d) {
                                return Math.min(dimIcon/3, dimIcon/3) + "px";
                            }),
                        option.append("text").attr("x", (d) =>border - dimIcon*5)
                            .attr("id", "text2")//easy to style with CSS
                            .attr("y", (d) =>(((dimIcon+ spaceIcon)*4)+spaceIcon) + ((screenY/15)*2))
                            .text("in order to delete an edge")
                            .style("font-size", function (d) {
                                return Math.min(dimIcon/3, dimIcon/3) + "px";
                            })}


            })
            .on("mouseout",function(){container.selectAll("[id='text']").remove(),container.selectAll("[id='text2']").remove()})


        option
            .append("svg:image")
            .attr("id", "addCluster")
            .attr("x", (d) => screenX-(dimIcon+(dimIcon/3)))
            .attr("y", (d) => (dimIcon+ spaceIcon)*5)
            .attr("xlink:href", "images/new-c.svg")
            .attr("height", (d) => dimIcon)
            .attr("width", (d) => dimIcon)
            .on("click",function() {
                light_on('add-c-On')
                on_off_click=true
                arrow = false
                remove_node=false
                remove_edge=false
                add_edge = false
                add_node = false
                remove_cluster = false
                add_cluster = true
                plane = id2plane[0]
                restoreSelectedNodes()
                plane.displayPlane()
            })
            .on("mouseover",function () {
                if (is_help == true) {
                    option.append("text")
                        .attr("x", (d) => border - dimIcon * 5)
                        .attr("y", (d) => ((dimIcon+ spaceIcon)*5)+spaceIcon)
                        .attr("id", "text")//easy to style with CSS
                        .text("add cluster on screen:")
                        .style("font-size", function (d) {
                            return Math.min(dimIcon / 3, dimIcon / 3) + "px";
                        }),
                        option.append("text")
                            .attr("x", (d) => border - dimIcon * 5)
                            .attr("id", "text2")//easy to style with CSS
                            .attr("y", (d) => ((dimIcon+ spaceIcon)*5)+spaceIcon + (screenY / 15))
                            .text("double click")
                            .style("font-size", function (d) {
                                return Math.min(dimIcon / 3, dimIcon / 3) + "px";
                            }),
                        option.append("text")
                            .attr("x", (d) => border - dimIcon * 5)
                            .attr("id", "text2")//easy to style with CSS
                            .attr("y", (d) => ((dimIcon+ spaceIcon)*5)+spaceIcon + (screenY / 15)*2)
                            .text("add cluster inside a cluster :")
                            .style("font-size", function (d) {
                                return Math.min(dimIcon / 3, dimIcon / 3) + "px";
                            }),
                        option.append("text").attr("x", (d) => border - dimIcon * 5)
                            .attr("id", "text2")//easy to style with CSS
                            .attr("y", (d) => ((dimIcon+ spaceIcon)*5)+spaceIcon + ((screenY / 15) * 3))
                            .text("click on cluster background")
                            .style("font-size", function (d) {
                                return Math.min(dimIcon / 3, dimIcon / 3) + "px";
                            })
                }
            })
            .on("mouseout",function(){container.selectAll("[id='text']").remove(),container.selectAll("[id='text2']").remove()})
        option
            .append("svg:image")
            .attr("id", "DelCluster")
            .attr("x", (d) => screenX-(dimIcon+(dimIcon/3)))
            .attr("y", (d) => (dimIcon+ spaceIcon)*6)
            .attr("xlink:href", "images/canc-c.svg")
            .attr("height", (d) => dimIcon)
            .attr("width", (d) => dimIcon)
            .on("click",function() {
                light_on('Del-c-On')
                on_off_click=true
                arrow = false
                remove_node=false
                remove_edge=false
                add_edge = false
                add_node = false
                remove_cluster = true
                add_cluster = false
                plane = id2plane[0]
                restoreSelectedNodes()
                plane.displayPlane()
            })
            .on("mouseover",function () {
                if (is_help == true) {
                    option.append("text")
                        .attr("x", (d) => border - dimIcon * 5)
                        .attr("y", (d) => ((dimIcon + spaceIcon) * 6) + spaceIcon)
                        .attr("id", "text")//easy to style with CSS
                        .text("click on cluster node to delete ")
                        .style("font-size", function (d) {
                            return Math.min(dimIcon / 3, dimIcon / 3) + "px";
                        })
                }
            })
            .on("mouseout",function(){container.selectAll("[id='text']").remove()})
        option
            .append("svg:image")
            .attr("id", "help")
            .attr("x", (d) => screenX-(dimIcon+(dimIcon/3)))
            .attr("y", (d) => (dimIcon+ spaceIcon)*7)
            .attr("xlink:href", "images/help.svg")
            .attr("height", (d) => dimIcon)
            .attr("width", (d) => dimIcon)
            .on("click", function () {
                light_on('helpOn')
                on_off_click=true
                arrow = true
                remove_node = false
                remove_edge = false
                add_edge = false
                add_node = false
                remove_cluster = false
                add_cluster = false
                plane = id2plane[0]
                is_help=true
                restoreSelectedNodes()
                plane.displayPlane()
            })
    }
    else{
        on_off_click=false
        arrow = false
        editor_mode = false
        remove_node=false
        remove_edge=false
        add_edge = false
        add_node = false
        remove_cluster = false
        add_cluster = false
        data.forEach(i=>container.selectAll("[id='"+i+"']").remove())
        data2.forEach(i=>container.selectAll("[id='"+i+"']").remove())
        x=0
    }
}
//---------------Menu----------------//
function generateHamburger(color, stroke_color) {
    container.selectAll(".hamburger").remove();

    let hamburger = container.append("g").attr("class", "hamburger");
    hamburger.append("rect")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 50)
        .attr("height", 50)
        .attr("opacity", 0.0)
    hamburger.append("rect").attr("fill", color)
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 50)
        .attr("height", 10)
        .attr("stroke",stroke_color).attr("stroke-width",2)
    hamburger.append("rect").attr("fill", color)
        .attr("x", 10)
        .attr("y", 30)
        .attr("width", 50)
        .attr("height", 10)
        .attr("stroke",stroke_color).attr("stroke-width",2)
    hamburger.append("rect").attr("fill", color)
        .attr("x", 10)
        .attr("y", 50)
        .attr("width", 50)
        .attr("height", 10)
        .attr("stroke",stroke_color).attr("stroke-width",2)
    hamburger.on("click", function(){showListMenu(menuIsVisible)});
    hamburger.attr("transform", "scale("+currentMenuScale+")");
}

function changeHamburgerColors(color, stroke_color) {
    hamburger = container.select(".hamburger")
    hamburger.selectAll("rect")
        .attr("fill", color)
        .attr("stroke", stroke_color)
    hamburger.moveToFront()
}

generateHamburger("black", null);

var menuIsVisible = false;
let creditsIsVisible = false;
let infoIsVisible = false;
let listJsonIsVisible = false;
let currentJson;
let small, medium, big,empty, download, info, credits, load;

let fileSelector = document.getElementById('file-selector');
fileSelector.addEventListener('change', (event) => {
    let fileList = event.target.files;
    let file = fileList[0];
    let reader = new FileReader();
    reader.addEventListener('load', event => {
        let json = event.target.result;
        clearWorkarea();
        loadGraph([json]);
    });
    reader.readAsDataURL(file);
});

function clearWorkarea(){
    workarea.selectAll('*').remove();
    container.selectAll(".menu").remove();
    menuIsVisible = false;
    try{
        for (let key in id2plane){
            id2plane[key] = undefined
        }
    }
    catch (e) {
    }
}

function showListMenu(thisMenuIsVisible){

    if(thisMenuIsVisible){
        changeHamburgerColors("black", null);
        container.selectAll(".menu").remove();
        menuIsVisible = false;
    }

    else {

        let sfondo = container.append("rect").attr("fill", menu_bg_color).attr("stroke", menu_stroke_color).attr("stroke-width", 3)
            .attr("class", "menu").attr("x", 0).attr("y", 0).attr("width", workarea_width / 4).attr("height", workarea_height * 3 / 4).attr("opacity", 0.9);

        let list = container.append("foreignObject").attr("class", "menu").attr("x", 0).attr("y", 50)
            .attr("width", workarea_width / 4).attr("height", workarea_height * 3 / 4).append("xhtml:body").append("ul").style("line-height", "2em")
            .style("list-style", "none").style("color", menu_text_color).style("font-size", "32px").style("text-shadow", "2px 2px #000000").style("font-family", "Ubuntu");
        let zero = 0;
        load = list.append("li").html("Load graph:").append("ul").style("list-style","none");
        small = load.append("li").html("small example").on("click", function(){
            clearWorkarea();
            changeHamburgerColors("black", null);
            loadGraph(examples[0]);});
        medium = load.append("li").html("medium example").on("click", function(){
            clearWorkarea();
            changeHamburgerColors("black", null);
            loadGraph(examples[1]);});
        big = load.append("li").html("big example").on("click", function(){
            clearWorkarea();
            changeHamburgerColors("black", null);
            loadGraph(examples[2]);});
        empty = load.append("li").html("empty").on("click", function(){
            clearWorkarea();
            changeHamburgerColors("black", null);
            loadGraph(examples[3]);});
        load.append(function(){return fileSelector;});
        download = list.append("li").html("Download graph").on("click", downloadGraph);
        info = list.append("li").html("Show help").on("click", function(){printInfo(infoIsVisible);});
        credits = list.append("li").html("Show credits").on("click", function(){printCredits(creditsIsVisible);});

        container.selectAll(".menu").attr("transform", "scale("+currentMenuScale+")");

        changeHamburgerColors(menu_text_color, "black");

        menuIsVisible = true;
    }

}

function applyInfoTransform() {
    let tx = window.innerWidth - 20 - base_container_width * currentMenuScale;
    container.selectAll(".info").attr("transform", "translate("+tx+")scale("+currentMenuScale+")");
}

function printInfo(thisInfoIsVisible){

    if(!thisInfoIsVisible){

        let textString = "- circles = nodes <br><br>";
        textString += "- curved rectangles = clusters <br><br>"
        textString += "- left click on a cluster to expand it <br><br>"
        textString += "- double-click on an exploded cluster to implode it (as well as implode all of its inner exploded clusters) <br><br>"
        textString += "- zoom-in/out with the mouse wheel <br><br>"
        textString += "- hold left click and drag the cursor to pan <br><br>"
        textString += "- click on any of the Load graph options to load a new example, or upload your own graph <br><br>"
        textString += "- Download graph lets you download the JSON file of the currently drawn graph <br><br>"
        textString += "- JSON graph format: two name/value pairs, clusters and edges <br><br>"
        textString += "--- clusters: a list of node numbers and lists representing the tree structure of the clustered graph <br><br>"
        textString += "--- edges: adjacency lists representing directed edges between nodes";

        let plane = container.append("rect")
            .attr("class", "info")
            .attr("fill", menu_bg_color)
            .attr("stroke", menu_stroke_color)
            .attr("stroke-width", 3)
            //.attr("x", window.innerWidth-500)
            .attr("x", base_container_width - 500)
            .attr("y", 0)
            .attr("width", 500)
            //.attr("height", window.innerHeight-102)
            .attr("height", base_container_height - 82)
            .attr("opacity", 0.9)
            .on("click", removeInfoArea);

        let htmlBody = container.append("foreignObject")
            .attr("class", "info")
            //.attr("x", window.innerWidth-500)
            .attr("x", base_container_width - 500)
            .attr("y", 0)
            .attr("width", 480)
            //.attr("height", window.innerHeight-102)
            .attr("height", base_container_height - 82)
            .on("click", removeInfoArea)
            .append("xhtml:body")
            .style("color", menu_text_color)
            .style("font-size", "22px")
            .style("text-shadow", "2px 2px #000000")
            .style("font-family", "Ubuntu")
            .style("line-height", "1.25em")
            .on("click", removeInfoArea);

        htmlBody.html(textString).on("click",removeInfoArea);

        applyInfoTransform();

        infoIsVisible = true;

    } else {

        removeInfoArea();
        infoIsVisible = false;

    }

}

function removeInfoArea(){

    container.selectAll(".info").remove();
    infoIsVisible = false;

}

function applyCreditsTransform() {
    let tx = window.innerWidth - 20 - base_container_width * currentMenuScale;
    let ty = window.innerHeight - 20 - base_container_height * currentMenuScale;
    container.selectAll(".credits").attr("transform", "translate("+tx/2+","+ty+")scale("+currentMenuScale+")");
    container.selectAll(".credits_bg").attr("transform", "translate("+0+","+ty+")scale("+currentMenuScale+")");
}

function printCredits(thisCreditsIsVisible){

    if(!thisCreditsIsVisible){

        let textString = "Authors: Luca Emili, Matteo Cesari, Federico Cialini, Teodosio Vezza<br>";
        textString += "Project made for <a href='https://www.uniroma3.it/en'>Roma Tre</a>'s <a href='https://www.dia.uniroma3.it/~infovis/'>Information Visualization course</a>, academic year 2019-2020";

        let plane = container.append("rect")
            .attr("class", "credits_bg")
            .attr("fill", menu_bg_color)
            .attr("stroke", menu_stroke_color)
            .attr("stroke-width", 3)
            .attr("x", 0)
            //.attr("y", window.innerHeight-100)
            .attr("y", base_container_height - 80)
            //.attr("width", window.innerWidth)
            .attr("width", window.innerWidth / currentMenuScale)
            .attr("height", 100)
            .attr("opacity", 0.9)
            .on("click", removeCreditsArea);

        let htmlBody = container.append("foreignObject")
            .attr("class", "credits")
            .attr("x", 0)
            //.attr("y", window.innerHeight-100)
            .attr("y", base_container_height - 80)
            //.attr("width", window.innerWidth)
            .attr("width", base_container_width)
            .attr("height", 100)
            .on("click", removeCreditsArea)
            .append("xhtml:body")
            .style("color", menu_text_color)
            .style("font-size", "22px")
            .style("text-shadow", "2px 2px #000000")
            .style("font-family", "Ubuntu")
            .style("line-height", "1.25em")
            .style("text-align", "center")
            .on("click", removeCreditsArea);

        htmlBody.html(textString).on("click",removeCreditsArea);

        applyCreditsTransform();

        creditsIsVisible = true;

    } else {

        removeCreditsArea();
        creditsIsVisible = false;

    }

}

function removeCreditsArea(){

    container.selectAll(".credits").remove();
    container.selectAll(".credits_bg").remove();
    creditsIsVisible = false;

}



//---------------- plane support functions ----------------//


function getRandomIntInRange(min, max) {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateIntArrayWithRange(start, end) {
    let array = [];
    for(let i=start; i<=end; i++) {
        array.push(i);
    }
    return array;
}

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function centerRectX(x) {
    return x - cluster_rect_width/2;
}

function centerRectY(y) {
    return y - cluster_rect_height/2;
}

function codeToRealHue(number){
    if(number + nodeHue > hueRange) {
        return number + nodeHue - hueRange;
    } else {
        return number + nodeHue;
    }
}

function generateColors(amount) {
    let colorList = [];
    let step = hueRange / (amount + 1);
    for(i=1; i<=amount; i++) {
        let coded = codeToRealHue(step * (i));
        colorList.push("hsl("+coded+", "+clusterSaturation+"%, "+lightness+"%)");
    }
    return colorList;
}

//---------------- plane ----------------//


var id2plane = {};

// this class represent a logical plane, through which we're going to display a cluster's elements
class Plane {


    constructor(this_node, element_list, is_root_node) {
        this.node = this_node;
        this.numberOfElements = element_list.length;
        this.elements = element_list;
        this.elementCoords = this.generateElementsCoords();
        this.is_root_node = is_root_node;
        this.isDisplayed = true;
        this.elementsIds = {}
        this.isAdded = false
        this.elementCoordsEditor = []
    }



    generateElementsCoords() {
        let element2coords = [];
        let Xcoords = shuffle(generateIntArrayWithRange(1, this.numberOfElements));
        let Ycoords = shuffle(generateIntArrayWithRange(1, this.numberOfElements));
        for(let i=0; i<this.numberOfElements; i++) {
            let x = Xcoords[i];
            let y = Ycoords[i];
            element2coords[i] = [x,y];
        }
        return element2coords;
    }

    countClusterChildren() {
        let count = 0;
        this.elements.forEach(function(d, i) {
            if(d[0]!=null) {
                count += 1;
            }
        });
        return count;
    }

    displayChildren(plane) {
        let thisId = this.node.attributes.id.value;
        let x = parseInt(this.node.attributes.x.value) + cluster_rect_width / 2;
        let y = parseInt(this.node.attributes.y.value) + cluster_rect_height / 2;
        let colorList ;
        let num_of_cluster_children = this.countClusterChildren();
        if(this.is_root_node) {
            colorList = generateColors(num_of_cluster_children);
        } else {
            let color = this.node.attributes.fill.value;
            colorList = [];
            for(let i=0; i<num_of_cluster_children; i++) {
                colorList.push(color);
            }
        }
        try {
            let j = 0;
            this.elements = deleteElementFromPlane(this.elements,-1)
            this.elements.forEach(function (d, i) {

                let childId = thisId + "," + i
                if(Array.isArray(d) && d[0] === "0.C," + i){
                    childId = "0.C," + i}
                let color;
                if (clustercolors[childId]!==undefined){
                    color = clustercolors[childId]
                }
                else {
                    color = colorList[j];
                    clustercolors[childId] = color;
                }
                if (d[0] != null && d!=="deleted" ) {
                    let child_node = workarea
                        .append("rect")
                        .attr("id", childId)
                        .attr("class", "cluster_node")
                        .attr("x", centerRectX(x + (this.elementCoords[i][0] - 1) * distance))
                        .attr("y", centerRectY(y + (this.elementCoords[i][1] - 1) * distance))
                        .attr("rx", 10)
                        .attr("ry", 10)
                        .attr("width", cluster_rect_width)
                        .attr("height", cluster_rect_height)
                        .attr("fill", color)
                        .attr("stroke-width", 2)
                        .attr("stroke", "black")
                        .on("click", explode)
                        ._groups[0][0];
                    plane.elementsIds[childId] = i

// I need to update the child cluster's plane node if it already exists
                    if (id2plane.hasOwnProperty(childId)) {
                        id2plane[childId].node = child_node;
                    }
                    j += 1;

                } else if( d!=="deleted" && d!=="0.C") {
                    if (!circle2Id.hasOwnProperty(childId)){
                        circle2Id[childId] = d
                    }
                    let node = workarea
                        .append("g")
                        .attr("id", childId)
                        //.attr("class","node")
                        .attr("info", d);

                    node
                        .append("circle")
                        .attr("id", childId)
                        .attr("class", "circle")
                        .attr("cx", x + (this.elementCoords[i][0] - 1) * distance)
                        .attr("cy", y + (this.elementCoords[i][1] - 1) * distance)
                        .attr("r", node_circle_r)
                        .attr("info", d)
                        .attr("fill", "hsl(" + nodeHue + ", " + nodeSaturation + "%, " + lightness + "%)")
                        .attr("stroke-width", 2)
                        .attr("stroke", "black")
                    node
                        .append("text")
                        .attr("id", childId)
                        .attr("class", "node")
                        .attr("x", x + (this.elementCoords[i][0] - 1) * distance)
                        .attr("y", y + (this.elementCoords[i][1] - 1) * distance)
                        .attr("font-family", "Ubuntu")
                        .style("text-anchor", "middle")
                        .text(d)
                        .style("font-size", function (d) {
                            let d2csf = 1 / Math.sqrt(2);  // d2csf = diameter_2_circumscribed_square_factor
                            let v1 = 2 * node_circle_r * d2csf;
                            let v2 = (v1 / this.getComputedTextLength() * 24) * d2csf;
                            return Math.min(v1, v2) + "px";
                        })
                        .attr("dy", ".35em");
                    plane.elementsIds[childId] = i
                }
                /*
                else if(thisId.startsWith("0.C") && d[0] === null){
                  let child_node = workarea
                      .append("rect")
                      .attr("id", childId)
                      .attr("class", "cluster_node")
                      .attr("x", centerRectX(x + (this.elementCoords[0][0] - 1) * distance))
                      .attr("y", centerRectY(y + (this.elementCoords[0][1] - 1) * distance))
                      .attr("rx", 10)
                      .attr("ry", 10)
                      .attr("width", cluster_rect_width)
                      .attr("height", cluster_rect_height)
                      .attr("fill", colorList[j])
                      .attr("stroke-width", 2)
                      .attr("stroke", "black")
                      .on("click", explode)
                      ._groups[0][0];

                }*/
            }, this)
        }
        catch (e) {

        }

    }





    getParentOpacity(thisId) {
        let i = thisId.lastIndexOf(",");
        let parentId = thisId.substring(0, i);
        if(parentId !== "0" && parentId!=="0.C") {
            return workarea.select("[id='"+parentId+"']").attr("fill-opacity");
        }
        else {
            return 0;
        }
    }

    displayBackgroundCluster() {
        let thisId = this.node.attributes.id.value;
        let x = parseInt(this.node.attributes.x.value) + cluster_rect_width / 2;
        let y = parseInt(this.node.attributes.y.value) + cluster_rect_height / 2;
        let color = this.node.attributes.fill.value;
        let opacity = this.getParentOpacity(thisId);
        let dimension = this.elementCoords.filter(x=>x!=="deleted").length
        if (dimension===0)
            dimension=1
        if (opacity == 0) {
            opacity = base_bg_opacity;
        } else {
            opacity = opacity * bg_opacity_decay;
        }
        return workarea
            .append("rect")
            .attr("id", thisId)
            .attr("class", "cluster_bg")
            .attr("x", x - distance / 2)
            .attr("y", y - distance / 2)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("width", dimension * distance)
            .attr("height", dimension * distance)
            .attr("fill", color)
            .attr("fill-opacity", opacity)
            .attr("stroke-width", 2)
            .attr("stroke", color)
            .attr("stroke-opacity", opacity * 2)
            .on("click", implode);
    }
    getParentClustersIds(thisId) {
        let clusterIds = [];
        while(thisId.includes(",")) {
            let i = thisId.lastIndexOf(",");
            thisId = thisId.substring(0, i);
            if(thisId != "0" && thisId!="0.C") { clusterIds.push(thisId); }
        }
        return clusterIds;
    }

    updateOtherCoordsAfterExplode() {
        let thisId = this.node.attributes.id.value;
        let this_x = parseInt(this.node.attributes.x.value);
        let this_y = parseInt(this.node.attributes.y.value);
        let dimension = this.elementCoords.filter(x=>x!=="deleted").length
        if(dimension===0)
            dimension=1
        let delta = (dimension - 1) * distance;

        let toTranslate = workarea.selectAll("*").filter(function () {
            let elem = d3.select(this);
            let is_of_right_class = elem.attr("class") === "node" || elem.attr("class") === "cluster_node" || elem.attr("class") === "circle" || elem.attr("class") === "cluster_bg";
            return is_of_right_class && !elem.attr("id").startsWith(thisId);
        });
        toTranslate.attr("x", function(d, i) {
            let xStr = d3.select(this).attr("x");
            if(xStr === null) { // if it's null it's because it's a circle!
                let cx = parseInt(d3.select(this).attr("cx"));
                if(cx > this_x) { d3.select(this).attr("cx", cx + delta); }
                return xStr;
            }
            let x = parseInt(xStr);
            if(x > this_x) { return x + delta; }
            else { return x; }
        }).attr("y", function(d, i) {
            let yStr = d3.select(this).attr("y");
            if(yStr === null) {
                let cy = parseInt(d3.select(this).attr("cy"));
                if(cy > this_y) { d3.select(this).attr("cy", cy + delta); }
                return yStr;
            }
            let y = parseInt(d3.select(this).attr("y"));
            if(y > this_y) { return y + delta; }
            else { return y; }
        })

        // I also need to enlarge the parent cluster(s)
        let parentIds = this.getParentClustersIds(thisId);
        parentIds.forEach(function(id, i) {
            let parent = d3.select("[id='" + id + "']")
            if((node_removed) && (id2plane[thisId].elementCoords.filter(x=>x!=="deleted").length===0)){
                parent.transition().duration(5)
                    .attr("width", parseInt(parent.attr("width")))
                    .attr("height", parseInt(parent.attr("height")));
            }
            else if(node_added){
                parent.transition().duration(5)
                    .attr("width", parseInt(parent.attr("width")) + distance)
                    .attr("height", parseInt(parent.attr("height")) + distance);
            }
            else if (node_removed){
                parent.transition().duration(5)
                    .attr("width", parseInt(parent.attr("width")) - distance)
                    .attr("height", parseInt(parent.attr("height")) - distance);
            }
            else {
                parent.transition().duration(5)
                    .attr("width", parseInt(parent.attr("width")) + delta)
                    .attr("height", parseInt(parent.attr("height")) + delta);
            }

        });


    }

    getDisplayedChildrenClustersAddedSize(thisId) {
        let totalAddedSize = 0;
        for(let id in id2plane) {
            let child = id2plane[id];
            if(id != thisId && id.startsWith(thisId) && child.isDisplayed) {
                //if(id != thisId && checkId(id.toString(),thisId.toString()) && child.isDisplayed) {
                let dimension = child.elementCoords.filter(x=>x!=="deleted").length
                let addedSize = (dimension - 1) * distance;
                totalAddedSize += addedSize;
                child.isDisplayed = false;  // this child will be closed!
            }
        }
        return totalAddedSize;
    }

    updateOtherCoordsAfterImplode() {
        let thisId = this.node.attributes.id.value;
        let this_x = parseInt(this.node.attributes.x.value);
        let this_y = parseInt(this.node.attributes.y.value);
        let dimension = this.elementCoords.filter(x=>x!=="deleted").length
        if(dimension===0)
            dimension=1
        let delta;
        delta =(dimension - 1) * distance;
        delta += this.getDisplayedChildrenClustersAddedSize(thisId);
        let toTranslate = workarea.selectAll("*").filter(function () {
            let elem = d3.select(this);
            let is_of_right_class = elem.attr("class") === "node" || elem.attr("class") === "cluster_node" || elem.attr("class") === "circle" || elem.attr("class") === "cluster_bg";
            //return is_of_right_class && !checkId(elem.attr("id").toString(),thisId.toString())
            return is_of_right_class && !elem.attr("id").startsWith(thisId);
        });
        toTranslate.attr("x", function(d, i) {implode
            let xStr = d3.select(this).attr("x");
            if(xStr === null) {
                let cx = parseInt(d3.select(this).attr("cx"));
                if(cx > this_x) { d3.select(this).attr("cx", cx - delta); }
                return xStr;
            }
            let x = parseInt(xStr);
            if(x > this_x) { return x - delta; }
            else { return x; }
        }).attr("y", function(d, i) {
            let yStr = d3.select(this).attr("y");
            if(yStr === null) {
                let cy = parseInt(d3.select(this).attr("cy"));
                if(cy > this_y) { d3.select(this).attr("cy", cy - delta); }
                return yStr;
            }
            let y = parseInt(d3.select(this).attr("y"));
            if(y > this_y) { return y - delta; }
            else { return y; }
        })

// I also need to reduce the parent cluster(s) size
        let parentIds = this.getParentClustersIds(thisId);
        parentIds.forEach(function(id, i) {
            let parent = d3.select("[id='" + id + "']");
            parent.transition().duration(updateTime) //aggiorna l'area del cluster padre
                .attr("width", parseInt(parent.attr("width"))-delta)
                .attr("height", parseInt(parent.attr("height"))-delta);
        });
    }

    displayPlane() {
        if(this.is_root_node && ! on_off_click) {
            this.displayChildren(this)
            panAndZoomToRootPlaneCenter(this)
        }
        else if (this.is_root_node && add_external_node){
            this.displayChildren(this)
        }
        else if(this.is_root_node && (remove_cluster || remove_node) && remove_external_node){
            this.displayChildren(this)
        }

        else if(!this.is_root_node) {
            var bg = this.displayBackgroundCluster();
            this.displayChildren(this);
        }
        else  {
            addNode()
            addEdges()
            removeEdges()
            removeNodes()
            removeClusters()
            addCluster()
        }

        if(!this.is_root_node) {
            this.updateOtherCoordsAfterExplode();
            if(panOnExplode && !add_node && !add_cluster) {
                panToElement(bg);
            }
        }
        this.isDisplayed = true;

        if (editor_mode) {
            addNode()
            addEdges()
            removeEdges()
            removeNodes()
            removeClusters()
            addCluster()
        }

    }



    hidePlane() {
        let thisId = this.node.attributes.id.value;
        let x = parseInt(workarea.select("[id='" + thisId + "']").attr("x")) + distance / 2 - cluster_rect_width / 2;
        let y = parseInt(workarea.select("[id='" + thisId + "']").attr("y")) + distance / 2 - cluster_rect_height / 2;
        let color = this.node.attributes.fill.value;
        workarea.selectAll("[id^='"+thisId+"']").remove();
        let new_node = workarea.append("rect")
            .attr("id", thisId)
            .attr("class", "cluster_node")
            .attr("x", x)
            .attr("y", y)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("width", cluster_rect_width)
            .attr("height", cluster_rect_height)
            .attr("fill", color)
            .attr("stroke-width", 2)
            .attr("stroke", "black")
            .on("click", explode);
        if(remove_cluster){
            removeClusters()
        }

        new_node.transition().duration(updateTime)

        this.node = new_node._groups[0][0];

        this.updateOtherCoordsAfterImplode();
        if(panOnImplode && !add_node && !add_cluster) {
            panToElement(new_node);
        }
        this.isDisplayed = false;
    }

}


function checkId(id1,id2) {
    let id1components = id1.split(",");
    let id2components = id2.split(",");
    if (id1components.length === id2components.length)
        return id1 === id2
    else
        for (let i =0;i<id1components.length;i++){
            if (id1components[i]!==id2components[i])

                return false
        }
    return true
}
//---------------- main ----------------//
let startingNodeNumber = 0;
let editorMode = true;
let graph = [];
let numbers = [];
let edges = new Map();
let cluster2nodeNumbers = {};
let id2clusterInside = {};
let cluster2InsideNumbers={};
let circle2Id = {}
let nodeNumber2elementId = {};



function resetGlobalVariables(){
    startingNodeNumber = 0;
    graph = [];
    numbers = [];
    edges = new Map();
    cluster2nodeNumbers = {};
    nodeNumber2elementId = {};
    numbers = []
    id2plane = {};
    editor_mode = false
    on_off_click = false
    arrow=true
    add_cluster=false
    add_edge=false
    remove_edge=false
    is_help=false
    add_node=false
    remove_node=false
    remove_cluster=false
    id2clusterInside = {}
    cluster2InsideNumbers = {}
    circle2Id = {}
    light_on('arrowOn')
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        let firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

loadGraph(defaultGraph);

function downloadGraph(){
    function download(content, fileName, contentType) {
        let a = document.createElement("a");
        let file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
    currentJson = createJsonFile()
    download(currentJson, 'graph.json', 'application/json');
}

function loadGraph(file){
    resetGlobalVariables();
    let promises = [];

    file.forEach(function(url) {
        promises.push(d3.json(url))
    });
    Promise.all(promises).then(function(values) {
        //currentJson = values[0];
        global_nodes = (values[0].clusters)[0]
        graph[0] = values[0].clusters;
        edges = values[0].edges;
        buildCluster2nodeNumbers();
        buildNodeNumber2element();
        buildId2ClusterInside();
        buildCluster2NodeNumbersInside()
        workarea.selectAll(".rect")
            .data(values[0].clusters)
            .enter()
            .append("g")
            .attr("id",0)
            .attr("class","plane")
            .attr("x", workarea_center_x)
            .attr("y", workarea_center_y)

        workarea.selectAll(".rect")
            .append("g")
            .attr("id",0)
            .attr("class","plane")
            .attr("x", workarea_center_x)
            .attr("y", workarea_center_y)
        let thisId = "0";
        let thisIdAsPath = [0];
        let thisJsonSubtree = retrieveElementFromGraphByPathId(thisIdAsPath);
        let this_node = workarea.select("[id='" + thisId + "']")._groups[0][0];
        let plane = new Plane(this_node, thisJsonSubtree, true);
        id2plane[thisId] = plane;
        for(let key in cluster2nodeNumbers) {
            cluster2nodeNumbers[key].forEach(function (el,i) {
                if (el===-1)
                    cluster2nodeNumbers[key][i]='deleted'
            })
        }
        for(let key in cluster2InsideNumbers) {
            cluster2nodeNumbers[key].forEach(function (el,i) {
                if (el===-1)
                    cluster2nodeNumbers[key][i]='deleted'
            })
        }
        plane.elements = deleteElementFromPlane(plane.elements,-1)
        plane.displayPlane();
        numbers = buildNumbersList();
        numbers = numbers.filter(x=>x!=='deleted')
        if(numbers.length!==0) {
            startingNodeNumber = Math.max.apply(null, numbers) + 1
        }
        drawAllEdges();

    });
}



//--------------------------------------//

function drawEdgeByCoordinates(x1,y1,x2,y2,startIsCircle,endIsCircle,startId){
    let xDirection = 0, yDirection = 0;
    if(x1 - x2 > 0) {
        xDirection = -1;
    } else if (x2 - x1 > 0) {
        xDirection = +1;
    }
    if(y1 - y2 > 0) {
        yDirection = +1;
    } else if (y2 - y1 > 0) {
        yDirection = -1;
    }

    let drawEdge = function (d) {
        let curveDistance = distance / 2.5;

        let curve_x2 = d.x1 + d.xDir * curveDistance;
        let curve_y2 = d.y2;

        let edge = d3.path();
        if (d.startIsCircle) {
            edge.moveTo(d.x1, d.y1 - d.yDir * (node_circle_r + 1));
        } else {
            edge.moveTo(d.x1, d.y1 - d.yDir * (cluster_rect_height / 2 + 1));
        }
        edge.lineTo(d.x1, d.y2 + d.yDir * curveDistance);
        edge.quadraticCurveTo(d.x1, d.y2, curve_x2, curve_y2);
        if (d.endIsCircle) {
            edge.lineTo(d.x2 - d.xDir * (node_circle_r + 1), d.y2);
        } else {
            edge.lineTo(d.x2 - d.xDir * (cluster_rect_width / 2 + 1), d.y2);
        }

        return edge;
    };

    if(xDirection != 0 && yDirection != 0) {

        let coords = {};
        coords["x1"] = x1;
        coords["y1"] = y1;
        coords["x2"] = x2;
        coords["y2"] = y2;
        coords["xDir"] = xDirection;
        coords["yDir"] = yDirection;
        coords["startIsCircle"] = startIsCircle;
        coords["endIsCircle"] = endIsCircle;
        workarea.append("path")
            .attr("d", drawEdge(coords))
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("class", "edge")
            .attr("id", "edge" + startId);

        let xTriPoint, yTriPoint, xTriUp, yTriUp, xTriBottom, yTriBottom;

        if(endIsCircle) {
            xTriPoint = x2 - xDirection * (node_circle_r + 1);
        } else {
            xTriPoint = x2 - xDirection * (cluster_rect_width/2 + 1);
        }
        yTriPoint = y2;
        yTriUp = yTriPoint - 7;
        yTriBottom = yTriPoint + 7;
        xTriUp = xTriPoint - xDirection * 10;
        xTriBottom = xTriPoint - xDirection * 10;

        let Tri = workarea
            .append("polygon")
            .attr("class", "edge")
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("points",
                xTriPoint + "," + yTriPoint + " " +
                xTriUp + "," + yTriUp + " " +
                xTriBottom + "," + yTriBottom);
    }

}

function drawEdgeByNodes(startId,endId){
    try{
        let x1, y1, x2, y2;
        let endIsCircle = true;
        let startIsCircle = true;
        if (cluster2nodeNumbers.hasOwnProperty(startId)) {
            startIsCircle = false;
            let startNode = d3.select("[id='" + startId + "']")._groups[0][0];
            x1 = parseInt(startNode.attributes.x.value) + cluster_rect_width / 2;
            y1 = parseInt(startNode.attributes.y.value) + cluster_rect_height / 2;
        } else {
            let startNode = workarea.select("[id='" + startId + "']").select(".circle")._groups[0][0];
            x1 = parseInt(startNode.attributes.cx.value);
            y1 = parseInt(startNode.attributes.cy.value);
        }


        if (cluster2nodeNumbers.hasOwnProperty(endId)) {
            endIsCircle = false;
            let endNode = workarea.select("[id='" + endId + "']")._groups[0][0];
            x2 = parseInt(endNode.attributes.x.value) + cluster_rect_width / 2;
            y2 = parseInt(endNode.attributes.y.value) + cluster_rect_height / 2;
        } else {
            let endNode = workarea.select("[id='" + endId + "']").select(".circle")._groups[0][0];
            x2 = parseInt(endNode.attributes.cx.value);
            y2 = parseInt(endNode.attributes.cy.value);
        }


        drawEdgeByCoordinates(x1,y1,x2,y2,startIsCircle,endIsCircle,startId);
    }
    catch (e) {
        console.log(startId,endId)
    }
}

function drawAllEdges(){
    numbers.forEach(function(nodeNumber, i){
        if(edges[nodeNumber]!=null){
            edges[nodeNumber].forEach(function(edgeEnd, i) {
                let startId = nodeNumber2elementId[nodeNumber];
                let endId = nodeNumber2elementId[edgeEnd];
                drawEdgeByNodes(startId,endId);
            });
        }
    });
}

function buildNumbersList(){
    let clusterElements = d3.selectAll(".cluster_node")._groups[0];
    let clusterIds = [];
    let numbers = [];
    clusterElements.forEach(function(cluster, i) {
        clusterIds.push(cluster.attributes.id.value);
    });
    clusterIds.forEach(function(clusterid, i) {
        cluster2nodeNumbers[clusterid].forEach(function(nodeNumber, i) {
            numbers.push(nodeNumber);
        });
    });
    let circleElements = d3.selectAll(".circle")._groups[0];
    circleElements.forEach(function(circle, i) {
        numbers.push(parseInt(circle.attributes.info.value));
    });
    return numbers;
}


//--------------------------------------//

function clusterIdsDfs(idStrOld, clusterIds) {
    let children = retrieveElementFromGraphByPathId(idStringToList(idStrOld));
    children.forEach(function(child, i) {
        if(child[0]!=null) {
            let idStr = idStrOld + "," + i;
            clusterIds.push(idStr);
            clusterIdsDfs(idStr, clusterIds);
        }
    });
}

function findAllClusterIds() {
    try {
        let clusterIds = [];
        clusterIds.push("0");
        let children = retrieveElementFromGraphByPathId([0]);
        children.forEach(function (child, i) {
            if (child[0] != null) {
                let idStr = "0," + i;
                clusterIds.push(idStr);
                clusterIdsDfs(idStr, clusterIds);
            }
        });
        return clusterIds;
    }
    catch (e) {
        return []
    }

}

function nodeNumbersDfs(idStrOld, nodeNumbers) {
    let children = retrieveElementFromGraphByPathId(idStringToList(idStrOld));
    children.forEach(function(child, i) {
        if(child[0]!=null) {
            let idStr = idStrOld + "," + i;
            nodeNumbersDfs(idStr, nodeNumbers);
        } else {
            nodeNumbers.push(child);
        }
    });
}

function findAllNodeNumbersInside(clusterId) {
    let nodeNumbers = [];
    let children = retrieveElementFromGraphByPathId(idStringToList(clusterId));
    children.forEach(function(child, i) {
        if(child[0]!=null && child[0]) {
            let idStr = clusterId + "," + i;
            nodeNumbersDfs(idStr, nodeNumbers);
        } else {
            nodeNumbers.push(child);
        }
    });
    return nodeNumbers;
}

function buildCluster2nodeNumbers() {
    let clusterIds = findAllClusterIds();
    clusterIds.forEach(function (clusterId,i) {
        let nodeNumbers = findAllNodeNumbersInside(clusterId);
        cluster2nodeNumbers[clusterId] = nodeNumbers;
    });
}

function buildId2ClusterInside() {
    let ids = []
    for (let key in cluster2nodeNumbers) {
        ids.push(key)
    }
    ids.forEach(function (id,i) {
        ids.forEach(function (id2,j) {
            if(id2clusterInside.hasOwnProperty(id)){
                if(id2.startsWith(id) && id2!==id){
                    id2clusterInside[id].push(id2)
                }
            }
            else{
                if(id2.startsWith(id) && id2!==id) {
                    id2clusterInside[id] = [id2]
                }
            }
        })
    })
    for (let key in id2clusterInside){
        id2clusterInside[key].sort(function(a, b){
            return a.length - b.length;
        });

    }
}

function buildCluster2NodeNumbersInside(){
    cluster2InsideNumbers = JSON.parse(JSON.stringify(cluster2nodeNumbers))
    for(let key in id2clusterInside){
        id2clusterInside[key].forEach(function (id,i) {
            cluster2nodeNumbers[id].forEach(function (num,i) {
                cluster2InsideNumbers[key]=cluster2InsideNumbers[key].filter(x=>x!==num)
            })
        })
    }
}


function updateNN2EafterExplode(explodedClusterId) {
    let children;
    try {
        children = retrieveElementFromGraphByPathId(idStringToList(explodedClusterId));
    }
    catch (e) {
        if (explodedClusterId.startsWith("0.C") && cluster2nodeNumbers[explodedClusterId]===undefined){
            cluster2nodeNumbers[explodedClusterId] = ["deleted"]

        }
        children = cluster2nodeNumbers[explodedClusterId]
    }
    finally {
        children = findIds(explodedClusterId)
        children.forEach(function(child, i) {
            let idStr = child
            let nodeNumbers = [];
            nodes = []
            workarea.selectAll("text").each(function(d,i) {
                let node = d3.select(this).attr("id")
                if (node.startsWith(explodedClusterId)){
                    nodes.push(node)
                }

            })
            nodes.forEach(function (n,e) {
                let num = (workarea.select("[id='" + n + "']").attr("info"))
            })

            try {
                if (cluster2nodeNumbers.hasOwnProperty(idStr)) {
                    nodeNumbers = cluster2nodeNumbers[idStr];
                } else {
                    nodeNumbers.push(retrieveElementFromGraphByPathId(idStringToList(idStr)));
                }
            }
            catch (e) {

            }
            finally {
                let circles = findcirclesids(explodedClusterId)
                nodeNumbers.forEach(function(nodeNumber, i) {



                    if (cluster2nodeNumbers.hasOwnProperty(idStr))
                        nodeNumber2elementId[nodeNumber] = idStr;
                });
                circles.forEach(function (circle,i) {
                    nodeNumber2elementId[circle[0]] = circle[1];

                })
            }


        });
    }

}
function findIds(explodedId) {
    let childs = []
    let explodedIdlen = explodedId.split(",").length
    for (let id in cluster2nodeNumbers) {
        if (id.startsWith(explodedId) && id.split(",").length === (explodedIdlen + 1)) {
            childs.push(id)
        }
    }
    for (let id in circle2Id) {
        if (id.startsWith(explodedId) && id.split(",").length === (explodedIdlen + 1)) {
            childs.push(id)
        }
    }
    return childs
}
function findcirclesids(explodedId) {
    let childs = []
    let explodedIdlen = explodedId.split(",").length
    for (let id in circle2Id) {
        if (id.startsWith(explodedId) && id.split(",").length === (explodedIdlen + 1)) {
            childs.push([circle2Id[id],id])
        }
    }
    return childs
}

function updateNN2EafterImplode(implodedClusterId) {
    let nodeNumbers = cluster2nodeNumbers[implodedClusterId];

    nodeNumbers.forEach(function(nodeNumber, i) {
        nodeNumber2elementId[nodeNumber] = implodedClusterId;
    });
}

function buildNodeNumber2element() {
    let children = retrieveElementFromGraphByPathId([0]);
    children.forEach(function(child, i) {
        let idStr = "0," + i;
        let nodeNumbers = [];
        if(cluster2nodeNumbers.hasOwnProperty(idStr)) {
            nodeNumbers = cluster2nodeNumbers[idStr];
        } else {
            nodeNumbers.push(retrieveElementFromGraphByPathId(idStringToList(idStr)));
        }
        nodeNumbers.forEach(function(nodeNumber, i) {
            nodeNumber2elementId[nodeNumber] = idStr;
        });
    });
}


function retrieveElementFromGraphByPathId(path){   //path as to be list: [0,1,0]
    let i = 0;
    let g = graph[0];
    while (path[i]!=null) {
        if(path.length==i+1){
            return g[path[i]];
        }
        else {
            g = g[path[i]];
            i=i+1;
        }
    }
    return null;
}

function idStringToList(string){
    let i = 0;
    let list = [];
    let buffer = "";
    while (string[i]!=null){
        if(string[i]!=","){
            buffer = buffer + string[i]
        }
        else {
            list.push(buffer);
            buffer = "";
        }
        i=i+1;
    }
    list.push(buffer);
    return list;
}
function explode(event){
    let thisId = this.attributes.id.value;
    let thisIdAsPath = idStringToList(thisId);
    let thisJsonSubtree;
    try {
        thisJsonSubtree = retrieveElementFromGraphByPathId(thisIdAsPath);
    }
    catch (e) {
        thisJsonSubtree = cluster2nodeNumbers[thisId];
    }
    finally {
        let plane = null;
        if(!id2plane.hasOwnProperty(thisId)) {
            try {
                plane = new Plane(this, thisJsonSubtree, false);
            }
            catch (e) {
                plane = new Plane(this, ["deleted"], false);
            }
            id2plane[thisId] = plane;
            plane.displayPlane();
        } else {
            plane = id2plane[thisId];
            plane.displayPlane();
        }
        this.remove();
        updateNN2EafterExplode(thisId);
        workarea.selectAll(".edge").remove();
        drawAllEdges();
        if (first_selected_node_id!==null){
            d3.selectAll("[id='" + "edge" + first_selected_node_id +"']").attr("stroke","red").attr("stroke-width",5)
        }
    }

}

function implode(event){
    let thisId = this.attributes.id.value;
    let plane = id2plane[thisId];
    plane.hidePlane();
    updateNN2EafterImplode(thisId);
    workarea.selectAll(".edge").remove();
    drawAllEdges();
    if (first_selected_node_id!==null){
        d3.selectAll("[id='" + "edge" + first_selected_node_id +"']").attr("stroke","red").attr("stroke-width",5)
    }
}


//---------Editor-----------------------//
let first_selected_node_id_add_edge = null
let first_selected_node_color_add_edge = null
let first_selected_node_color = null
let first_selected_node_id = null
let node_removed = false
let remove_external_node = false
let add_external_node = false
let node_added = false
function restoreSelectedNodes(){
    workarea.selectAll("text").on("click",null)
    if (first_selected_node!==null){
        d3.select("[id='"+first_selected_node_id+"']").attr("fill","black")
        d3.selectAll("[id='" + "edge" + first_selected_node_id +"']").attr("stroke","black").attr("stroke-width",3)
    }
    if (first_selected_node_id_add_edge!=null){
        d3.select("[id='"+first_selected_node_id_add_edge+"']").attr("fill","black")
    }
    selected = null
    first_selected_node = null
    first_selected_node_color = null
    first_selected_node_color_add_edge = null
    first_selected_node_id = null
}

function addEdges(){
    if(add_edge) {
        workarea.selectAll("text")
            .on("click", function () {
                let nodeId = (d3.select(this).attr("id"));
                let colorNode = (d3.select(this).attr("fill"));
                if (selected == null) {
                    selected = true
                    first_selected_node = this.firstChild.data
                    first_selected_node_id_add_edge = nodeId
                    first_selected_node_color_add_edge = colorNode
                    d3.select("[id='"+nodeId+"']").attr("fill","red")
                } else {
                    d3.select("[id='"+first_selected_node_id_add_edge+"']").attr("fill",null)
                    first_selected_node_id_add_edge = null
                    first_selected_node_color_add_edge = null
                    second_selected_node = this.firstChild.data
                    try{
                        if (! edges[first_selected_node.toString()].includes(parseInt(second_selected_node)))
                            edges[first_selected_node.toString()].push(parseInt(second_selected_node))
                    }
                    catch (e) {
                        edges[first_selected_node.toString()] = []
                        edges[first_selected_node.toString()].push(parseInt(second_selected_node))
                    }
                    selected = null
                    first_selected_node = null
                    second_selected_node = null
                    workarea.selectAll(".edge").remove()
                    drawAllEdges()
                }
            })
    }
}

function  removeEdges() {
    if (remove_edge) {
        workarea.selectAll("text")
            .on("click", function () {

                try {
                    if (selected == null) {
                        let nodeId = (d3.select(this).attr("id"));
                        let colorNode = (d3.select(this).attr("fill"));
                        d3.select("[id='"+nodeId+"']").attr("fill","red")
                        d3.selectAll("[id='" + "edge" + nodeId +"']").attr("stroke","red").attr("stroke-width",5)
                        first_selected_node_color = colorNode
                        first_selected_node_id = nodeId
                        selected = true
                        first_selected_node = this.firstChild.data
                    } else {
                        d3.select("[id='"+first_selected_node_id+"']").attr("fill",first_selected_node_color)
                        d3.select("[id='"+first_selected_node_id+"']").attr("stroke",first_selected_node_color).attr("storke-width",3)
                        first_selected_node_color = null
                        first_selected_node_id = null
                        second_selected_node = this.firstChild.data
                        edges[first_selected_node.toString()] = edges[first_selected_node.toString()].filter(number => number !== parseInt(second_selected_node))
                        selected = null
                        first_selected_node = null
                        second_selected_node = null
                        workarea.selectAll(".edge").remove()
                        drawAllEdges()
                    }
                } catch (e) {
                    d3.select("[id='"+first_selected_node_id+"']").attr("stroke",first_selected_node_color).attr("storke-width",3)
                    selected = null
                    first_selected_node = null
                    second_selected_node = null
                }

            })
    }
}

function  removeNodes() {
    if(remove_node) {

        workarea.selectAll("text")
            .on("click", function () {
                if (detectOpenPlanesContainer() && (this.id.split(",").slice(0,-1).join())==='0') {
                    closeOpenPlanesContainer()
                }else {
                    let plane = null;
                    let p = id2plane[0];
                    let selected_node_number = this.firstChild.data;
                    delete edges[selected_node_number];
                    for (var key in edges) {
                        edges[key] = edges[key].filter(x => x !== parseInt(selected_node_number))
                    }
                    for (var key in cluster2nodeNumbers) {
                        cluster2nodeNumbers[key] = cluster2nodeNumbers[key].filter(x => x !== parseInt(selected_node_number))
                    }
                    let id = this.id.split(",").slice(0, -1).join(",")
                    cluster2InsideNumbers[id] = cluster2InsideNumbers[id].filter(num => num !== parseInt(selected_node_number))
                    numbers = numbers.filter(x => x !== parseInt(selected_node_number))
                    //graph[0][0] = deleteElementFromPlane(graph[0][0], parseInt(selected_node_number))
                    workarea.selectAll(".edge").remove()
                    let nodeId = (d3.select(this).attr("id"));
                    delete circle2Id[nodeId]
                    d3.select("[id='" + nodeId + "']").remove()
                    let planeId = nodeNumber2elementId[selected_node_number].toString();
                    planeId = planeId.split(",").slice(0, -1).join(",")
                    try {
                        if (planeId !== "0" && planeId !== "0.C") {
                            subPlaneId = planeId.split(",").slice(0, -1).join(",")
                            subPlane = id2plane[subPlaneId]
                            subPlane.elements = deleteElementFromPlane(subPlane.elements, parseInt(selected_node_number))
                        }
                    } catch (e) {

                    }
                    plane = id2plane[planeId]
                    if (planeId !== "0" && planeId !== "0.C") {
                        plane.hidePlane()
                        updateNN2EafterImplode(planeId)
                    }
                    plane.elements = deleteElementFromPlane(plane.elements, parseInt(selected_node_number))
                    let ind = plane.elementsIds[this.id]
                    let coords = plane.elementCoords[ind]
                    if (plane.is_root_node) {
                        workarea.selectAll("*").remove()
                        remove_external_node = true
                        plane.elementCoords = updateRootPlaneAfterDelete(plane, coords[0], coords[1])
                        plane.elements[ind] = "deleted"
                        plane.displayPlane()
                        workarea.select("[id='" + this.id + "']").remove()
                        remove_external_node = false
                    }
                    plane.elementCoords[ind] = "deleted"
                    //plane.numberOfElements--
                    p.elements = deleteElementFromPlane(p.elements, parseInt(selected_node_number))
                    if (!plane.is_root_node) {
                        plane.elementCoords = updateCoordsAfterDelete(plane.elementCoords, coords[0], coords[1])
                        workarea.select("[id='" + planeId + "']").remove()
                    }
                    if (planeId !== "0" && planeId !== "0.C") {
                        node_removed = true
                        plane.displayPlane()
                        updateNN2EafterExplode(planeId)
                        node_removed = false
                    }


                    drawAllEdges()
                }
            })

    }
}

function deleteElementFromPlane(arr,value) {
    let l = [];
    arr.forEach(i => {
        if (Array.isArray(i)) {
            l.push((deleteElementFromPlane(i, value)))
        } else if (i !== value) {
            l.push(i)
        }
        else{
            l.push("deleted")
        }
    })
    return l
}
function  removeClusters() {
    if (remove_cluster) {
        workarea.selectAll("rect[class='cluster_node'")
            .on("click", function () {
                if (detectOpenPlanesContainer() && (this.id.split(",").slice(0,-1).length)===1) {
                    closeOpenPlanesContainer()
                }else {
                    let removed_edges_node = []
                    let p = id2plane[0]
                    let planeId;
                    let plane;
                    deleteClusterIncluster2InsideNumbers(this.id)
                    if (d3.select(this).attr("class") === "cluster_node") {
                        let lastPlaneId = this.id
                        if (this.id.startsWith("0.C") && this.id.split(",").length > 2) {
                            planeId = this.id
                            let subplaneId = this.id.split(",").slice(0, -1).join(",")
                            let subplane = id2plane[subplaneId]
                            subplane.elements.forEach(function (el, i) {
                                if (Array.isArray(el) && (el[0].split(":"))[1] === lastPlaneId) {
                                    subplane.elements[i] = "deleted"
                                }
                            })
                        } else if (this.id.startsWith("0.C")) {
                            planeId = this.id
                        } else {
                            planeId = this.id.split(",").slice(0, -1).join(",")
                        }
                        plane = id2plane[planeId]
                        let subplaneid = planeId
                        if (planeId === this.id) {
                            subplaneid = this.id.split(",").slice(0, -1).join(",")
                            if (subplaneid === "0.C")
                                subplaneid = "0"
                        }
                        let subplane = id2plane[subplaneid]
                        if (!subplane.is_root_node) {
                            subplane.hidePlane()
                            updateNN2EafterImplode(subplaneid)
                        }
                        cluster2nodeNumbers[this.id].forEach(function (node, i) {
                            subplane.elements = deleteElementFromPlane(subplane.elements, parseInt(node))
                            p.elements = deleteElementFromPlane(p.elements, parseInt(node))
                            numbers.filter(x => x !== parseInt(node))
                            delete nodeNumber2elementId[parseInt(node)]
                            removed_edges_node.push(node)
                        })
                        removed_edges_node.forEach(function (node, i) {
                            delete edges[node]
                            for (let key in edges) {
                                edges[key] = edges[key].filter(x => x !== parseInt(node))
                            }
                        })
                        let ind = subplane.elementsIds[this.id]
                        let coords = subplane.elementCoords[ind]
                        if (!subplane.is_root_node) {
                            let coords = subplane.elementCoords[ind]
                            subplane.elementCoords[ind] = "deleted"
                            subplane.elementCoords = updateCoordsAfterDelete(subplane.elementCoords, coords[0], coords[1])
                        }
                        if (subplane.is_root_node) {
                            workarea.selectAll("*").remove()
                            remove_external_node = true
                            subplane.elementCoords = updateRootPlaneAfterDelete(subplane, coords[0], coords[1])
                            subplane.elements[ind] = "deleted"
                            subplane.displayPlane()
                            workarea.select("[id='" + this.id + "']").remove()
                            remove_external_node = false
                            drawAllEdges()
                        }
                        delete cluster2nodeNumbers[this.id]
                        workarea.select("[id='" + subplaneid + "']").remove()
                        subplane.elements[ind] = "deleted"
                        p.elements = removeExternalArrayCluster(p, subplane)
                        delete id2plane[lastPlaneId]
                        node_removed = true
                        if (!subplane.is_root_node) {
                            subplane.displayPlane()
                            updateNN2EafterExplode(subplaneid)

                        }
                        node_removed = false
                        workarea.selectAll(".edge").remove()
                        d3.select(this).remove()
                        drawAllEdges()
                    }
                }
            })
    } else {
        workarea.selectAll("rect[class='cluster_node'").on("click",explode)
    }
}
function deleteClusterIncluster2InsideNumbers(id){
    delete cluster2InsideNumbers[id]
    for (let key in cluster2InsideNumbers){
        if(key.startsWith(id)) {
            delete cluster2InsideNumbers[key]
        }
    }
}


function updateRootPlaneAfterDelete(plane,x,y){
    let xcoord= 830 + cluster_rect_width / 2;
    let ycoord = 480 + cluster_rect_height / 2;
    let finalx;
    let finaly;
    let newcoords = []
    let ids =[]
    for (let key in plane.elementsIds){
        ids.push(key)
    }
    plane.elementCoords.forEach(function (coord,i) {
        if(coord!=="deleted") {
            let actualX = coord[0]
            let actualY = coord[1]
            if (actualX >= x)
                actualX = actualX - 1
            if (actualY >= y)
                actualY = actualY - 1
            newcoords.push([actualX, actualY])
            finalx = xcoord + (actualX-1) * 80
            finaly = ycoord + (actualY-1) * 80
        }
        else{
            newcoords.push("deleted")
        }

    })
    return newcoords
}

function updateCoordsAfterDelete(coords,x,y) {
    let newcoords = []
    coords.forEach(function(coord,i){
        if(coord!="deleted") {
            let actualX = coord[0]
            let actualY = coord[1]
            if (actualX > x)
                actualX = actualX - 1
            if (actualY > y)
                actualY = actualY - 1
            newcoords.push([actualX, actualY])
        }
        else{
            newcoords.push("deleted")
        }
    })
    return newcoords
}





function removeExternalArrayCluster(p,planeId) {
    p.elements.forEach(function (val,i) {
        if (Array.isArray(val)) {
            if (val[0]===planeId){
                p.elements[i] = "deleted"
            }

        }
    })
    return p.elements
}

function allDeleted(l){
    let verifyed = true;
    l.forEach(function (node,i) {

        if (node!=="deleted" && !Array.isArray(node)){
            verifyed = false
        }
        if (Array.isArray(node)){
            verifyed = verifyed && allDeleted(node)
        }

    })
    return verifyed
}

function addNode(){
    if (add_node) {
        workarea.selectAll("rect[class='cluster_bg'")
            .on("click", function () {
                if (DetectOpenPlanesCluster(this.id)) {
                    CloseOpenPlanesCluster(this.id)
                } else {
                    node_added = true
                    let planeId = this.id;
                    let plane = id2plane[planeId];
                    let rect = d3.select(("[id='" + planeId + "']"))._groups[0][0]
                    let coords = (d3.mouse(rect));
                    let x = parseInt(this.attributes.x.value) + cluster_rect_width / 2;
                    let y = parseInt(this.attributes.y.value) + cluster_rect_height / 2;
                    let width = parseInt(this.attributes.width.value) + cluster_rect_width / 2;
                    let height = parseInt(this.attributes.height.value) + cluster_rect_height / 2;
                    let elements_num = plane.elements.filter(x=>x!=="deleted").length
                    let bgx;
                    let bgy;
                    if (elements_num===0) {
                        bgx = 1
                        bgy = 1
                    }
                    else
                    {
                        bgx = Math.round((coords[0] - x + width / (elements_num+2)) / 80);
                        bgy = Math.round((coords[1] - y + height / (elements_num+2)) / 80);
                    }
                    let nodeId;
                    nodeId = this.id + "," + plane.numberOfElements
                    let newcoords = updatecoordsafterinsert(bgx, bgy, plane)
                    bgx = newcoords[0]
                    bgy = newcoords[1]
                    let bgxcoord = (x + (bgx - 1) * 80);
                    let bgycoord = (y + (bgy - 1) * 80);
                    updateClusterToNodeNumber(this.id, startingNodeNumber)
                    plane.hidePlane()
                    updateNN2EafterImplode(this.id)
                    plane.elementCoords.push([bgx, bgy])
                    plane.elementsIds[nodeId] = plane.numberOfElements
                    plane.numberOfElements++
                    numbers.push(startingNodeNumber)
                    plane.elements.push(startingNodeNumber)
                    workarea.select("[id='" + this.id + "']").remove()
                    plane.displayPlane()
                    updateNN2EafterExplode(this.id)
                    workarea.select("[id='" + nodeId + "']").remove()
                    if (!circle2Id.hasOwnProperty(nodeId)) {
                        circle2Id[nodeId] = startingNodeNumber
                    }
                    let node = workarea
                        .append("g")
                        .attr("id", nodeId)
                        .attr("info", "test");
                    //coords = findAviableCoordsInCluster(plane)
                    node
                        .append("circle")
                        .attr("id", nodeId)
                        .attr("class", "circle")
                        .attr("cx", coords[0])
                        .attr("cy", coords[1])
                        .attr("r", node_circle_r)
                        .attr("info", "test")
                        .attr("fill", "hsl(" + nodeHue + ", " + nodeSaturation + "%, " + lightness + "%)")
                        .attr("stroke-width", 2)
                        .attr("stroke", "black")
                    node
                        .append("text")
                        .attr("id", nodeId)
                        .attr("class", "node")
                        .attr("x", coords[0])
                        .attr("y", coords[1])
                        .attr("font-family", "Ubuntu")
                        .style("text-anchor", "middle")
                        .text(startingNodeNumber)
                        .style("font-size", function (d) {
                            let d2csf = 1 / Math.sqrt(2);  // d2csf = diameter_2_circumscribed_square_factor
                            let v1 = 2 * node_circle_r * d2csf;
                            let v2 = (v1 / this.getComputedTextLength() * 24) * d2csf;
                            return Math.min(v1, v2) + "px";
                        })
                        .attr("dy", ".35em");
                    workarea.select("[id='" + nodeId + "']").select(".circle").transition().duration(300).attr("cx", bgxcoord).attr("cy", bgycoord)._groups[0][0]
                    workarea.select("[id='" + nodeId + "']").select("text").transition().duration(300).attr("x", bgxcoord).attr("y", bgycoord)._groups[0][0]
                    id2plane[this.id] = plane
                    workarea.selectAll(".edge").remove()
                    drawAllEdges()
                    try {
                        if(!cluster2InsideNumbers[this.id].includes(startingNodeNumber))
                            cluster2InsideNumbers[this.id].push(startingNodeNumber)
                    }
                    catch (e) {
                        cluster2InsideNumbers[this.id] = [startingNodeNumber]
                    }
                    if(this.id.split(",").length>2) {
                        let firstCluster = this.id.split(",")[0] + "," + this.id.split(",")[1]
                        cluster2InsideNumbers[firstCluster] = cluster2InsideNumbers[firstCluster].filter(x => x !== startingNodeNumber)
                    }
                    startingNodeNumber++
                    elements_num++
                    node_added = false
                }
            })

        container.on("dblclick",function () {
            if (detectOpenPlanesContainer()) {
                closeOpenPlanesContainer()
            } else {
                try {
                    cluster2InsideNumbers[0].push(startingNodeNumber)
                }
                catch (e) {
                    cluster2InsideNumbers[0] = [startingNodeNumber]
                }
                let plane = id2plane[0];
                let planes = closeOpenPlanesContainer()
                let coords = (d3.mouse(workarea.node()));
                let nodeId = "0," + (plane.numberOfElements)
                let x = Math.round((coords[0] - 710) / 80);
                let y = Math.round((coords[1] - 380) / 80);
                let angularcoords = findAviableCoords(x, y, plane)
                x = angularcoords[0]
                y = angularcoords[1]
                let xcoord = (830 + (x - 1) * 80);
                let ycoord = (480 + (y - 1) * 80);
                updatecoordsafterinsert(x, y, plane);
                add_external_node = true
                workarea.selectAll("*").remove()
                plane.displayPlane()
                add_external_node = false
                plane.elementsIds[nodeId] = plane.numberOfElements
                plane.numberOfElements++

                plane.elementCoords.push([x, y])
                drawAllEdges()
                numbers.push(startingNodeNumber)
                plane.elements.push(startingNodeNumber)
                nodeNumber2elementId[startingNodeNumber] = nodeId
                id2plane[0] = plane
                let node = workarea
                    .append("g")
                    .attr("id", nodeId)
                    //.attr("class","node")
                    .attr("info", "test");

                node
                    .append("circle")
                    .attr("id", nodeId)
                    .attr("class", "circle")
                    .attr("cx", coords[0])
                    .attr("cy", coords[1])
                    .attr("r", node_circle_r)
                    .attr("info", "test")
                    .attr("fill", "hsl(" + nodeHue + ", " + nodeSaturation + "%, " + lightness + "%)")
                    .attr("stroke-width", 2)
                    .attr("stroke", "black")
                node
                    .append("text")
                    .attr("id", nodeId)
                    .attr("class", "node")
                    .attr("x", coords[0])
                    .attr("y", coords[1])
                    .attr("font-family", "Ubuntu")
                    .style("text-anchor", "middle")
                    .text(startingNodeNumber)
                    .style("font-size", function (d) {
                        let d2csf = 1 / Math.sqrt(2);  // d2csf = diameter_2_circumscribed_square_factor
                        let v1 = 2 * node_circle_r * d2csf;
                        let v2 = (v1 / this.getComputedTextLength() * 24) * d2csf;
                        return Math.min(v1, v2) + "px";
                    })
                    .attr("dy", ".35em");

                let animationTime = defineAnimationTime(coords[0],coords[1],xcoord,ycoord)
                workarea.select("[id='" + nodeId + "']")
                    .select(".circle").transition().duration(animationTime)
                    .attr("cx", xcoord)
                    .attr("cy", ycoord)._groups[0][0]
                workarea.select("[id='" + nodeId + "']").select("text").transition().duration(animationTime).attr("x", xcoord).attr("y", ycoord)._groups[0][0]
                workarea.selectAll(".edge").remove()
                startingNodeNumber++
                drawAllEdges()
            }
        })

    }
    else {
        workarea.selectAll("rect[class='cluster_bg'")
            .on("click",implode)
        container.on("dblclick",null)
    }
}

function defineAnimationTime(actualX,actualY,newX,newY) {
    if(Math.abs(actualX-newX)>=100 || (Math.abs((actualY-newY)))>=80)
        return 500
    else return 300
}
function updatecoordsafterinsert(x,y,plane) {
    let coords = plane.elementCoords.filter(x=>x!=="deleted")
    let xcoords = coords.map(x=> x[0])
    let ycoords = coords.map(x=>x[1])
    if(!plane.is_root_node){
        if(x<1)
            x=1
        if(y<1)
            y=1
    }
    coords.forEach(function (coordinate,i) {
        if (xcoords.includes(x) && coordinate[0]>=x){
            coords[i][0] = coordinate[0] +1
        }
        if (ycoords.includes(y) && coordinate[1]>=y){
            coords[i][1] = coordinate[1] +1
        }
    })
    return [x,y]
}

function detectOpenPlanesContainer() {
    for (let key in id2plane){
        if (key!=='0'){
            if(id2plane[key].isDisplayed){
                return true
            }
        }
    }
    return false
}
function closeOpenPlanesContainer() {
    let openplanes= []
    for (let key in id2plane){
        if (key!=='0'){
            if (id2plane[key].isDisplayed){
                id2plane[key].hidePlane()
                updateNN2EafterImplode(key)
                openplanes.push(key)
                workarea.selectAll(".edge").remove()
                drawAllEdges()
            }
        }
    }
    return openplanes
}
function DetectOpenPlanesCluster(clusterId) {
    for (let key in id2plane) {
        if (key.startsWith(clusterId) && key !== clusterId && id2plane[key].isDisplayed) {
            return true
        }
    }
    return false
}
function CloseOpenPlanesCluster(clusterId){
    for ( let key in id2plane){
        if (key.startsWith(clusterId) && key!==clusterId){
            if (id2plane[key].isDisplayed){
                id2plane[key].hidePlane()
                updateNN2EafterImplode(key)
                workarea.selectAll(".edge").remove()
                drawAllEdges()
            }
        }
    }
}

function updateClusterToNodeNumber(id,num) {
    let ids = id.split(",")
    let first = ids[0] + "," + ids[1]
    cluster2nodeNumbers[first].push(num)
    for (let i=2;i<ids.length;i++){
        first = first + "," + ids[i]
        if (!cluster2nodeNumbers[first].includes(num))
            cluster2nodeNumbers[first].push(num)
    }
}

function  findAviableCoords(x,y,plane) {
    let elements = plane.elementCoords.filter(x=>x!=="deleted")
    let maxX = Math.max.apply(null,elements.map(el=>el[0]))
    let minX =  Math.min.apply(null,elements.map(el=>el[0]))
    let maxY = Math.max.apply(null,elements.map(el=>el[1]))
    let minY = Math.min.apply(null,elements.map(el=>el[1]))
    if (x< minX)
        x = minX -1
    if (y< minY)
        y = minY -1
    if (x> maxX)
        x = maxX +1
    if (y> maxY)
        y= maxY +1
    return [x,y]
}

function addCluster() {
    if (add_cluster){
        container.on("dblclick",function () {
            if (detectOpenPlanesContainer()) {
                closeOpenPlanesContainer()
            } else {
                let plane = id2plane[0];
                let coords = (d3.mouse(workarea.node()));
                let nodeId = "0.C," + (plane.numberOfElements);
                cluster2InsideNumbers[nodeId] = []
                let x = Math.round((coords[0] - 725) / 80);
                let y = Math.round((coords[1] - 410) / 80);
                let angularcoords = findAviableCoords(x, y, plane)
                x = angularcoords[0]
                y = angularcoords[1]
                updatecoordsafterinsert(x, y, plane);
                add_external_node = true
                closeOpenPlanesContainer()
                workarea.selectAll("*").remove()
                plane.displayPlane()
                drawAllEdges()
                add_external_node = false
                plane.elementCoords.push([x, y])
                let xcoord = (830 + (x - 1) * 80);
                let ycoord = (480 + (y - 1) * 80);
                plane.elements.push(["0.C," + plane.numberOfElements, "deleted"])
                plane.elementsIds[nodeId] = plane.numberOfElements
                plane.numberOfElements++
                let colorList = generateColors(1000);
                let color = colorList[colorList.length * Math.random() | 0]
                clustercolors[nodeId] = color
                var newnode = workarea
                    //.append("g")
                    .append("rect")
                    .attr("id", nodeId)
                    .attr("class", "cluster_node")
                    .attr("x", centerRectX(coords[0]))
                    .attr("y", centerRectY(coords[1]))
                    .attr("rx", 10)
                    .attr("ry", 10)
                    .attr("width", cluster_rect_width)
                    .attr("height", cluster_rect_height)
                    .attr("fill", color)
                    .attr("stroke-width", 2)
                    .attr("stroke", "black")
                    .on("click", explode)
                let animationTime = defineAnimationTime(coords[0],coords[1],xcoord,ycoord)
                newnode = workarea.select("[id='" + nodeId + "']").transition().duration(animationTime).attr("x", centerRectX(xcoord)).attr("y", centerRectX(ycoord))._groups[0][0];
                let newplane = new Plane(newnode, [], false);
                newplane.elements.push("deleted")
                newplane.elementCoords.push([1, 1])
                newplane.numberOfElements++
                newplane.isDisplayed = false
                id2plane[nodeId] = newplane;
                newplane.isAdded = true
                cluster2nodeNumbers[nodeId] = ["deleted"]
            }
        })
        workarea.selectAll("rect[class='cluster_bg'")
            .on("click", function () {
                if(DetectOpenPlanesCluster(this.id)) {
                    CloseOpenPlanesCluster(this.id)
                }else {
                    node_added = true
                    let planeId = this.id;
                    let plane = id2plane[planeId];
                    let rect = d3.select(("[id='" + planeId + "']"))._groups[0][0]
                    let coords = (d3.mouse(rect));
                    let x = parseInt(this.attributes.x.value) + cluster_rect_width / 2;
                    let y = parseInt(this.attributes.y.value) + cluster_rect_height / 2;
                    let width = parseInt(this.attributes.width.value) + cluster_rect_width / 2;
                    let height = parseInt(this.attributes.height.value) + cluster_rect_height / 2;
                    let elements_num = plane.elements.filter(x=>x!=="deleted").length
                    let bgx;
                    let bgy;
                    if (elements_num===0) {
                        bgx = 1
                        bgy = 1
                    }
                    else
                    {
                        bgx = Math.round((coords[0] - x + width / (elements_num+4)) / 80);
                        bgy = Math.round((coords[1] - y + height / (elements_num+4)) / 80);
                    }
                    let nodeId;
                    nodeId = this.id + "," + plane.numberOfElements
                    if (!nodeId.startsWith("0.C"))
                        cluster2nodeNumbers[nodeId] = ["deleted"]
                    plane.elementsIds[nodeId] = plane.numberOfElements
                    let newcoords = updatecoordsafterinsert(bgx, bgy, plane)
                    bgx = newcoords[0]
                    bgy = newcoords[1]
                    let bgxcoord = (x + (bgx - 1) * 80);
                    let bgycoord = (y + (bgy - 1) * 80);
                    if (nodeId.startsWith("0.C"))
                        plane.elements.push(["deleted:" + nodeId])
                    else
                        plane.elements.push(["deleted:" + nodeId])

                    plane.hidePlane()
                    updateNN2EafterImplode(this.id)
                    plane.elementCoords.push([bgx, bgy])
                    workarea.select("[id='" + this.id + "']").remove()
                    plane.displayPlane()
                    updateNN2EafterExplode(this.id)
                    plane.numberOfElements++
                    let node = workarea.transition().duration(animations_duration).select(("[id='" + nodeId + "']")).attr("x", bgxcoord).attr("y", bgycoord)._groups[0][0]
                    let newplane = new Plane(node, [], false)
                    newplane.elements.push("deleted")
                    newplane.elementCoords.push([1, 1])
                    newplane.numberOfElements++
                    newplane.isDisplayed = false
                    id2plane[nodeId] = newplane;
                    newplane.isAdded = true
                    cluster2InsideNumbers[nodeId] = []
                    cluster2nodeNumbers[nodeId] = ["deleted"]
                    workarea.selectAll(".edge").remove()
                    drawAllEdges()
                    elements_num++
                    node_added=false
                }
            })
    }else{

    }
}

//---------------- Download Graph ----------------//

function createJsonFile(){
    let clusters = JSON.stringify(createJsonClusterList())
    let e = JSON.stringify(edges)
    let file = '{"clusters" :' + '['+clusters+'],'  + '"edges" :' +  ' '+ e
        + "}"
    return file
}
function createJsonClusterList(){
    fillEmptyClusters()
    let dictClusterInside = {}
    return createFinalListOfClusters(dictClusterInside)
}
function fillEmptyClusters() {
    if(!cluster2InsideNumbers.hasOwnProperty(0)){
        cluster2InsideNumbers[0] = [-1]
    }
    for (let key in cluster2InsideNumbers){
        if (cluster2InsideNumbers[key].length===0 || cluster2InsideNumbers[key].every(x=>(Array.isArray(x)))){
            cluster2InsideNumbers[key].push(-1)
        }
    }
}
/*
function restoreEmptyClusters() {

    for (let key in cluster2InsideNumbers){
        cluster2InsideNumbers[key] = cluster2InsideNumbers[key].filter(x=>x!==-1)
    }
}
 */
function createFinalListOfClusters(dictClusterInside) {
    let l = []
    for (let key in cluster2InsideNumbers){
        l.push(key)
    }
    l.sort(function(a, b){
        // ASC  -> a.length - b.length
        // DESC -> b.length - a.length
        return b.split(",").length - a.split(",").length;
    });
    l.forEach(function (id,i) {
        let dimId = id.split(",").length
        if(!dictClusterInside.hasOwnProperty(id)){
            dictClusterInside[id] = []
        }
        l.forEach(function (id2,j) {
            if (id2.split(",").length===(dimId+1) && id2.startsWith(id)){
                dictClusterInside[id].push(id2)
            }
        })
    })
    let finalDict = {}
    let top = findLastClusters(l)
    while(top.length !==0) {
        top.forEach(function (id, i) {
            if (!finalDict.hasOwnProperty(id)) {
                finalDict[id] = [...cluster2InsideNumbers[id]]
            }
            dictClusterInside[id].forEach(function (insideId, j) {
                let insideList = [...finalDict[insideId]]
                finalDict[id].push(insideList)
            })
        })
        top.forEach(function (DeletedId,i) {
            l = l.filter(x=>x!==DeletedId)
        })
        top = findLastClusters(l)
    }
    return (finalDict[0])

}

function findLastClusters(l) {
    let top = []
    l.forEach(function (id,i) {
        let is_top = true
        l.forEach(function (id2,j) {
            if(id2.startsWith(id) && !(id===id2)){
                is_top = false
            }
        })
        if(is_top)
            top.push(id)
    })
    return top
}

//---------------- animations ----------------//


function panToElement(elem) {
    let x = parseInt(elem.attr("x"));
    let y = parseInt(elem.attr("y"));
    let width = parseInt(elem.attr("width"));
    let height = parseInt(elem.attr("height"));

    let tx = (-width / 2 - x) * currentZoomScale + container.attr("width") / 2;
    let ty = (-height / 2 - y) * currentZoomScale + container.attr("height") / 2;

    workarea.transition()
        .duration(animations_duration)
        .attr("transform", "translate("+tx+","+ty+")scale("+currentZoomScale+")")
        .on("end", function() {
            container.call(zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(currentZoomScale));
            currentZoomX = tx;
            currentZoomY = ty;
        });
}

function panToRootPlaneCenter(rootPlane) {

    let x = parseInt(rootPlane.node.attributes.x.value);
    let y = parseInt(rootPlane.node.attributes.y.value);
    let width = rootPlane.elementCoords.length * distance;
    let height = rootPlane.elementCoords.length * distance;

    let tx = (-width / 2 - x) * currentZoomScale + container.attr("width") / 2;
    let ty = (-height / 2 - y) * currentZoomScale + container.attr("height") / 2;

    workarea.transition()
        .duration(animations_duration)
        .attr("transform", "translate("+tx+","+ty+")scale("+currentZoomScale+")")
        .on("end", function() {
            container.call(zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(currentZoomScale));
            currentZoomX = tx;
            currentZoomY = ty;
        });
}

function panAndZoomToRootPlaneCenter(rootPlane) {

    let x = parseInt(rootPlane.node.attributes.x.value);
    let y = parseInt(rootPlane.node.attributes.y.value);
    let width = rootPlane.elementCoords.length * distance;
    let height = rootPlane.elementCoords.length * distance;

    currentZoomScale = Math.min(container.attr("width")/(width + 2*distance), container.attr("height")/(height + 2*distance))

    let tx = (-width / 2 - x) * currentZoomScale + container.attr("width") / 2;
    let ty = (-height / 2 - y) * currentZoomScale + container.attr("height") / 2;

    workarea.transition()
        .duration(animations_duration)
        .attr("transform", "translate("+tx+","+ty+")scale("+currentZoomScale+")")
        .on("end", function() {
            container.call(zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(currentZoomScale));
            currentZoomX = tx;
            currentZoomY = ty;
        });
}

function updateZoomScaleAfterWindowResize(oldWidth, oldHeight, newWidth, newHeight) {
    currentZoomScale = Math.min(newWidth/oldWidth, newHeight/oldHeight);

    workarea.transition()
        .duration(animations_duration)
        .attr("transform", "scale("+currentZoomScale+")")
        .on("end", function() {
            container.call(zoom.transform, d3.zoomIdentity.scale(currentZoomScale));
        });
}

// WIP
function panAndZoomToCurrentWorkareaCenter(oldWidth, oldHeight, newWidth, newHeight) {

    let x = currentZoomX;
    let y = currentZoomY;
    let oldZoomScale = currentZoomScale;

    let areaDiff = newWidth * newHeight - oldWidth * oldHeight;
    if(areaDiff >= 0)
        currentZoomScale = currentZoomScale * Math.max(newWidth/oldWidth, newHeight/oldHeight);
    else
        currentZoomScale = currentZoomScale * Math.min(newWidth/oldWidth, newHeight/oldHeight);

    /*var dx = newWidth/oldWidth;
            var dy = newHeight/oldHeight;

            var px = 0;
            var py = 0;

            if(areaDiff >= 0) {
                px = (oldHeight-newHeight)*dy;  // seems to work
                py = (oldWidth-newWidth)*dx;    // doesn't work :<
            } else {
                px = (oldHeight-newHeight)*dx;  // seems to work
                py = (oldWidth-newWidth)*dy;    // doesn't work :<
            }*/

    let tx = (x * currentZoomScale / oldZoomScale); //+ px;
    let ty = (y * currentZoomScale / oldZoomScale); //+ py;

    currentZoomX = tx;
    currentZoomY = ty;

    workarea.transition()
        //.duration(animations_duration)
        .attr("transform", "translate("+tx+","+ty+")scale("+currentZoomScale+")")
        .on("end", function() {
            container.call(zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(currentZoomScale));
        });
}


function updateMenuScale(oldWidth, oldHeight, newWidth,newHeight) {
    currentMenuScale = Math.min(newWidth/oldWidth, newHeight/oldHeight);
    let tx = newWidth - oldWidth * currentMenuScale;
    let ty = newHeight - oldHeight * currentMenuScale;
    container.selectAll(".hamburger").attr("transform", "scale("+currentMenuScale+")");
    container.selectAll(".menu").attr("transform", "scale("+currentMenuScale+")");
    container.selectAll(".info").attr("transform", "translate("+tx+")scale("+currentMenuScale+")");
    container.selectAll(".credits").attr("transform", "translate("+tx/2+","+ty+")scale("+currentMenuScale+")");
    container.selectAll(".credits_bg").attr("width", window.innerWidth / currentMenuScale);
    container.selectAll(".credits_bg").attr("transform", "translate("+0+","+ty+")scale("+window.innerWidth / currentMenuScale+")");
}
