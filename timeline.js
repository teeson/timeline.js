//! timeline.js
//! @author Disen He<hedisen@qq.com>
//! @license MIT
;(function(global, factory){
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.Timeline = factory()
}(this, (function(){

function Timeline(container,width, height, options, styles){

    this.createTimelineSVG(container, width, height);

    this.width = width;
    this.height = height;

    this.centralTime = new Date();

    this.primaryUnitSeconds = 60 * 60;
    this.primaryUnitCount = 24;

    this.timelineAxisPosY = height - 28;

    this.repaint();
}

Timeline.prototype.createTimeline = function(container, width, height){
    this.container = document.getElementById(container);
    this.canvas = document.createElement('canvas');
    this.canvas.width = width; 
    this.canvas.height = height;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.backgroudColor = '#000';
}

var SVGNS = "http://www.w3.org/2000/svg";

Timeline.prototype.createTimelineSVG = function(container, width, height){
    this.container = document.getElementById(container);
    this.svg = document.createElementNS(SVGNS,"svg");
    this.svg.setAttribute('xmlns',SVGNS);
    this.svg.setAttribute('version','1.1');
    this.svg.setAttribute('width', width); 
    this.svg.setAttribute('height', height);    
    this.svg.setAttribute('viewBox', "0 0 " + width + " "+ height);
    this.svg.setAttribute('style', "backgroud-color: #000; border: solid 1px red");

    this.container.appendChild(this.svg);

    this.setupMouseHandlers();
}

Timeline.prototype.setupMouseHandlers = function(){
    function handleWheel(e)
    {
        console.log(e);
        e.preventDefault();

        if (e.deltaY < 0){
            if ( this.primaryUnitSeconds > 1)
            {
                this.primaryUnitSeconds = this.primaryUnitSeconds / 2;
            }
        }
        else if (e.deltaY > 0)
        {
            if ( this.primaryUnitSeconds < 60 * 60)
            {
                this.primaryUnitSeconds = this.primaryUnitSeconds * 2;
            }
        }
     
        this.repaint();
    }

    this.svg.addEventListener('mousedown', (function(e){
        console.log(e);
        e.preventDefault();
    }).bind(this));
    this.svg.addEventListener('mousemove', function(e){
        console.log(e);
        e.preventDefault();
    });
    this.svg.addEventListener('mouseup', function(e){
        console.log(e);
        e.preventDefault();
    });
    this.svg.addEventListener('mouseover', function(e){
        console.log(e);
        e.preventDefault();
    });
    this.svg.addEventListener('mouseout', function(e){
        console.log(e);
        e.preventDefault();
    });
    this.svg.addEventListener('wheel', handleWheel.bind(this));
};

Timeline.prototype.repaint = function(){
    this.repaintSVG();
};

Timeline.prototype.repaintCanvas = function(){
    this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

    this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
};

Timeline.prototype.visiableTimeRange = function(){
    var half = parseInt(this.primaryUnitSeconds * this.primaryUnitCount * 1000 / 2); 
    var timeMin = parseInt(this.centralTime.getTime() - half);
    var timeMax = parseInt(this.centralTime.getTime() + half);

    return [timeMin, timeMax];
};

Timeline.prototype.mapTimeToDrawPos = function(time)
{
    var timeMilliSecs = time;
    if ( time instanceof Date)
    {
        timeMilliSecs = time.getTime();
    }
    else{
        timeMilliSecs = parseInt(time);
    }
        
    var centralPosX = this.width / 2;
    var pixelsPerUnit = this.width / this.primaryUnitCount;

    var pos = centralPosX + (timeMilliSecs - this.centralTime.getTime()) * pixelsPerUnit / (this.primaryUnitSeconds * 1000);

    return pos;
}

Timeline.prototype.mapPosToTime = function(pos)
{
    var centralPosX = this.width / 2;
    var pixelsPerUnit = this.width / this.primaryUnitCount;

    var timeMilliSecs = this.centralTime.getTime() + (pos - centralPosX) * (this.primaryUnitSeconds * 1000) / pixelsPerUnit;

    return parseInt(timeMilliSecs);
}

Timeline.prototype.repaintSVG = function(){

    // remove all
    //while (this.svg.firstChild) { this.svg.removeChild(this.svg.firstChild); }
    this.svg.innerHTML = "";

    /*
    var backgroud = document.createElementNS(SVGNS, 'rect');
    backgroud.setAttribute('x', 0);
    backgroud.setAttribute('y', 0);
    backgroud.setAttribute('width', this.svg.width.baseVal.value);
    backgroud.setAttribute('height',this.svg.height.baseVal.value);
    backgroud.setAttribute('fill','black');
    //backgroud.setAttribute('style','fill: #000; stroke-width:0');

    this.svg.appendChild(backgroud);
    */

    this.drawTimelineAxisSVG();
};

Timeline.prototype.createSVGElement = function(type, attrs){
    var elem = document.createElementNS(SVGNS, type);

    for( var k in attrs)
    {
        elem.setAttribute(k, attrs[k]);
    }

    return elem;
};

Timeline.prototype.drawTimelineAxisSVG = function(){
    var elem = document.createElementNS(SVGNS, 'line');
    elem.setAttribute('x1', 0);
    elem.setAttribute('y1', this.timelineAxisPosY );
    elem.setAttribute('x2', this.svg.width.baseVal.value);
    elem.setAttribute('y2', this.timelineAxisPosY );

    elem.setAttribute('stroke','#ccc');
    elem.setAttribute('stroke-width',6);

    this.svg.appendChild(elem);

    this.drawTimelineAxisMarkers();
};

Timeline.prototype.drawTimelineAxisMarkers = function(){
   
    var mg = this.createSVGElement('g',{
         'class': 'timeline-axis-markers',
         'stroke': 'blue',
        'stroke-width':'1px'
     });

    var timeRange = this.visiableTimeRange();
    var millisecsPerUnit = parseInt(this.primaryUnitSeconds * 1000);
    var visibleIntMin = parseInt(timeRange[0] - millisecsPerUnit);
    var visibleIntMax = parseInt(timeRange[1] + millisecsPerUnit);

    var startOfHourMin = visibleIntMin - parseInt( visibleIntMin % (60 * 60 * 1000));
   
    for( var m = startOfHourMin; m <= visibleIntMax ; m+= millisecsPerUnit )
    {
        var mx = this.mapTimeToDrawPos( m );
        var me = this.createSVGElement('line',{
            x1: mx, y1: this.timelineAxisPosY , x2 : mx, y2:this.timelineAxisPosY + 10
        });

        mg.appendChild(me);

        var mt = this.createSVGElement('text',{
            x: mx, y: this.timelineAxisPosY  + 22,
            'text-anchor':'middle',
            'font-family':'Verdana', 'font-size':10
        });

        var mtime = new Date(m);
        var _pad = function(n){ return n < 10 ? '0' + n: n; };
        var markerText =  _pad(mtime.getHours()) + ':' + _pad(mtime.getMinutes());

        if ( this.primaryUnitSeconds < 60)
        {
            markerText += ':' + _pad(mtime.getSeconds());
        }
        
        mt.innerHTML = markerText;

        mg.appendChild(mt);
    }

    this.svg.appendChild(mg);
};

return Timeline;

})));