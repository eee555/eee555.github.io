var h, w, m; // 高、宽、雷数
var generated; // 是否已经生成局面
var enabled; // Are we allowed to click?
var squares = []; // Holds board data - 1,2,4 bits = mine,flag,opened
var toOpen; // 剩余需要打开的格数，判断游戏是否获胜
var numMines; // 剩余雷数
var startTime, curTime, timerID, time; // 计时器变量


var around = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
var lclicks, rclicks;
var lheld, rheld;
var nboards; // 当前生成的局面数

window.onkeydown=function(event){if(event.keyCode==113) resetBoard(false)};

var patterns = 
 [[[3,2], [0,0], [0,1], [0,2], [3,0], [3,1], [3,2], [1,1,2,1]],
  [[2,3], [0,0], [1,0], [2,0], [0,3], [1,3], [2,3], [1,1,1,2]],
  [[3,3], [0,0], [3,0], [0,3], [3,3], [1,1,1,2], [1,1,2,1], [1,2,2,2]]];
 
var rcolors = [10,11,12,13,14,15,16,17,18];

function initialize()//初始化一个默认的局面
{
 
 loadBoard(16, 30, 99);
}


function custom()
{
 var newH = parseInt(prompt("请输入高度:", "16"));
 var newW = parseInt(prompt("请输入宽度:", "30"));
 var newM = parseInt(prompt("请输入雷数:", "99"));
 if (newH < 5) newH = 16;
 if (newW < 5) newW = 30;
 if (newM < 1 || newM > (newH * newW - 9)) newM = Math.ceil(newH * newW * 0.20625);
 loadBoard(newH, newW, newM);
}


function loadBoard(newH, newW, newM)
{
 clearInterval(timerID);
 h = newH;
 w = newW;
 m = newM;
 numMines = m;
 toOpen = h*w-m;
 generated = false;
 enabled = true;
 lclicks = 0;
 rclicks = 0;
 nboards = 0;

 // 画局面
 s = "<table cellspacing=0 cellpadding=0 oncontextmenu='return false;'>";
 s += "<tr><td><img src='ul.png'><\/td><td background='ua.png'><\/td><td><img src='ur.png'>";
 s += "<\/td><\/tr><tr><td background='la.png'><\/td><td><table width='100%' bgcolor='#c0c0c0'><tr><td id='nMines' width='40%'>"+m+"<\/td>";
 s += "<td align='center'><img src='f0.png' id='face' onclick='resetBoard("+"false)'><\/td><td width='40%' align='right' id='time'>0<\/td>";
 s += "<\/tr><\/table><\/td><td background='ra.png'>";
 s += "<\/td><\/tr><tr><td><img src='lx.png'><\/td><td background='ub.png'><\/td><td><img src='rx.png'><\/td><\/tr>";
 s += "<tr><td background='lb.png'><\/td><td><div class='y'>";
 s += "<table cellspacing=0 cellpadding=0 oncontextmenu='return false;'>";
 for (var i=0; i<h; i++)
 {
  squares[i] = [];
  s += "<tr>";
  for (var j=0; j<w; j++)
  {
   s += "<td><img id='"+j+"."+i+"' src='00.png' onmousedown='down(event,"+j+","+i+")' onmouseup='up(event,"+j+","+i+")' onmouseover='over(event,"+j+","+i+")'><\/td>";
   squares[i][j] = 0;
  }
  s += "<\/tr>";
 }
 s += "<\/table><\/div><\/td><td background='rb.png'<\/td><\/tr><tr><td><img src='dl.png'><\/td><td background='uc.png'><\/td><td><img src='dr.png'><\/td><\/tr><\/table>";
 $("board").innerHTML = s;

 var obj=document.getElementById("bigtable")
 disableSelection(obj)
}


function clearBoard()
{
 for (var i=0; i<h; i++)
 {
  for (var j=0; j<w; j++)
  {
   squares[i][j] = 0;
  }
 }
}

function resetBoard(blank)
{
 clearInterval(timerID);
 numMines = m;
 toOpen = h*w-m;
 generated = false;
 enabled = true;
 lclicks = 0;
 rclicks = 0;
 if(blank) nboards = 0;
 $('face').src = "f0.png";
 $('time').innerHTML = "0";
 $('nMines').innerHTML = m;
 for (var i=0; i<h; i++)
 {
  for (var j=0; j<w; j++)
  {
   $(j+"."+i).src = "00.png";
  }
 }
 if (blank)
  clearBoard();
}




function changeImage(x, y, num)//如果要改皮肤
{
 if (num > 9)
  s = num;
 else
  s = "0" + num;
 $(x + "." + y).src = s + ".png";
}

function generateMines(x, y)
{
 placeMines(x, y);
 generated = true;
 nboards++;
 startTimer();
}

function placeMines(x, y)
{
 clearBoard();
 for (var i=0; i<m; i++)
 {
  var done = false;
  while (!done)
  {
   var newX = Math.floor(Math.random() * w);
   var newY = Math.floor(Math.random() * h);
   if ((squares[newY][newX] & 1) == 0  && (x != newX || y != newY))
    /*这边再加上后面这个条件就可以起手必开空    && !adjacent(x, y, newX, newY)*/
   {
    squares[newY][newX]++;
    done = true;
   }
  }
 }
}

function generateReflex()
{
 var m2 = 0;
 clearBoard();
 for (var i=1; i<h-1; i++)
 {
  for (var j=1; j<w-1; j++)
  {
   if (j==1 || j==w-2 || i==1 || i==h-2)
   {
    squares[i][j] = 1;
    m2++;
   }
  }
 }
 for (var i=0; i<h-4; i++)
  if (Math.random() > 0.6)
  {
   squares[i+2][0] = 1;
   m2++;
   i++;
  }
 for (var i=0; i<h-4; i++)
  if (Math.random() > 0.6)
  {
   squares[i+2][w-1] = 1;
   m2++;
   i++;
  }
 for (var i=0; i<w-4; i++)
  if (Math.random() > 0.6)
  {
   squares[0][i+2] = 1;
   m2++;
   i++;
  }
 for (var i=0; i<w-4; i++)
  if (Math.random() > 0.6)
  {
   squares[h-1][i+2] = 1;
   m2++;
   i++;
  }
 m = m2;
 toOpen = h*w-m;
 numMines = m;
 $('nMines').innerHTML = numMines;
}



function adjacent(x1, y1, x2, y2)
{
 for (var i=0; i<around.length; i++)
 {
  if (around[i][0]==(x1-x2) && around[i][1]==(y1-y2))
    return true;
 }
 return false;
}



function startTimer()
{
 startTime = new Date();
 timerID = setInterval(updateTimer, 10);
}



function updateTimer()
{
 curTime = new Date();
 time = curTime.getTime() - startTime.getTime();
 var time2 = Math.round(time / 10);
 $('time').innerHTML = trim(2, (time2 / 100));
}



function stopTimer()
{
 clearInterval(timerID);
 updateTimer();
}




function up(event, x, y)
{
 if (!event) event = window.event;
 if(event.preventDefault)
  event.preventDefault();
 var leftClick;
 if (event.button==0)
  leftClick=1;
 else
  leftClick=0;
 if (leftClick)
  lheld = false;
 if (!leftClick)
  rheld = false;
 if (x==-1)
  return;
 if (leftClick)
 {
  click(event, x, y);
 }
}



function down(event, x, y)
{
 if (!event)
  event = window.event;
 if(event.preventDefault)
  event.preventDefault();
 var leftClick;
 if (event.button==0)
  leftClick=1;
 else
  leftClick=0;
 if (leftClick)
  lheld = true;
 if (!leftClick)
  rheld = true;
 if (leftClick)
  lclicks++;
 if (!leftClick)
  rclicks++;
 if (!leftClick)
 {
  click(event, x, y);
 }
}



function over(event, x, y)
{
 if (!event) event = window.event;
 if(event.preventDefault) {event.preventDefault();}
 var leftClick;
 if (event.button==0)
  leftClick=1;
 else
  leftClick=0;
}




function click(event, x, y)
{
 if (!enabled) return;
 var leftClick;
 if (event.button==0)
  leftClick=1;
 else
  leftClick=0;
 if (!leftClick && !isOpen(x,y))
 {
  flag(x, y);
 }
 else
 {
  if (!generated)
   generateMines(x, y);
  if (!isFlag(x,y))
  {
   if(!isOpen(x,y))
    {
     flood(x, y);
    }
   else if ((leftClick && rheld) || (!leftClick && lheld))
   {
    chord(x, y);
   }
  }
 }
 if (toOpen == 0)//判断胜利
  victory();
}

function flag(x, y)
{
 if (isFlag(x,y))
 {
  squares[y][x] -= 2;
  numMines++;
  changeImage(x, y, 0);
 }
 else
 {
  squares[y][x] += 2;
  numMines--;
  changeImage(x, y, 3);
 }
 $('nMines').innerHTML = numMines;
}




function death(x, y)
{
 stopTimer();
 for (var i=0; i<h; i++)
  for (var j=0; j<w; j++)
   if (isMine(j,i) || isFlag(j,i))
    changeImage(j, i, isFlag(j,i) ? (isMine(j,i) ? 3 : 4) : ((i==y && j==x) ? 2 : 1));
 enabled = false;
 $('face').src = "f2.png";
 doStats();
}

function victory() {
 stopTimer();
 enabled = false;
 $('face').src = "f3.png";
 for (var i=0; i<h; i++)
  for (var j=0; j<w; j++)
   if (isMine(j,i))
    changeImage(j, i, 3);
 doStats();
}

function openSquare(x, y)
{
 var k = numAround(x, y);
 changeImage(x, y, 10+k);
 return k;
}

function isMine(x, y)
{
 if (isValid(x,y) && (squares[y][x] & 1) > 0) return 1;
 else return 0;
}
function isFlag(x, y)
{
 if (isValid(x,y) && (squares[y][x] & 2) > 0) return 1;
 else return 0;
}
function isOpen(x, y)
{
 if (isValid(x,y) && (squares[y][x] & 4) > 0) return 1;
 else return 0;
}

function isValid(x, y)//坐标是否越限
{
 if (x < 0 || y < 0 || x >= w || y >= h) return false;
 return true;
}

function chord(x, y)//双击功能
{
 var nExtraFlags = 0;
 for (var i=0; i<around.length; i++)
  if (isValid(x+around[i][0],y+around[i][1]))
  {
   if (isMine(x+around[i][0],y+around[i][1]))
    nExtraFlags--;
   if (isFlag(x+around[i][0],y+around[i][1]))
    nExtraFlags++;
  }
 if (nExtraFlags == 0)
 {
  var good = true;
  for (var i=0; i<around.length; i++)
  {
   var newX = x+around[i][0], newY = y+around[i][1];
   if (isValid(newX,newY) && !isFlag(newX,newY) && !isOpen(newX,newY))
   {
    good = good && flood(newX,newY);
   }
  }
 } else return true;
}



function flood(xTemp, yTemp)
{
 if (isMine(xTemp, yTemp))
 {
  death(xTemp, yTemp);
  return false;
 }
 if (isOpen(xTemp, yTemp)) return false;
 var queue = [[xTemp, yTemp]];
 squares[yTemp][xTemp] += 4;
 toOpen--;
 var index = 0;
 while (index < queue.length)
 {
  var x = queue[index][0];
  var y = queue[index][1];
  if (isFlag(x,y))
  {
   squares[y][x] -= 2;
   numMines++;
   $('nMines').innerHTML = numMines;
  }
  if (openSquare(x, y) == 0)
   for (var i=0; i<around.length; i++)
   {
    var x2 = x + around[i][0];
    var y2 = y + around[i][1];
    if (isValid(x2,y2) && !isOpen(x2,y2))
    {
     queue.push([x2,y2]);
     squares[y2][x2] += 4;
     toOpen--;
    }
   }
  index++;
 }
 return true;
}

function clean8()
{
 for (var i=0; i<h; i++)
  for (var j=0; j<w; j++)
   squares[i][j] = squares[i][j]%8;
}

function doOpenings()
{
 var open = 0;
 for (var i=0; i<h; i++)
  for (var j=0; j<w; j++)
  {
   if (!isMine(j,i) && (squares[i][j]&8)==0 && numAround(j,i)==0)
   { // opening
    var queue = [[j, i]];
    squares[i][j] += 8;
    open++;
    var index = 0;
    while (index < queue.length)
    {
     var x = queue[index][0];
     var y = queue[index][1];
     if (numAround(x, y) == 0)
      for (var k=0; k<around.length; k++)
      {
       var x2 = x + around[k][0];
       var y2 = y + around[k][1];
       if (isValid(x2,y2) && (squares[y2][x2]&8)==0)
       {
        queue.push([x2,y2]);
        squares[y2][x2] += 8;
       }
      }
     index++;
    }
   }
  }
 return open;
}

function numAround(x, y)
{
 var k = 0;
 for (var i=0; i<around.length; i++)
  k += isMine(x+around[i][0], y+around[i][1]);
 return k;
}

function get3BV()
{
 clean8();
 var bbbv = doOpenings();
 // add the number of unopened nonmined squares
 for (var i=0; i<h; i++)
  for (var j=0; j<w; j++)
   if (!isMine(j,i) && (squares[i][j]&8)==0)
    bbbv++;
 return bbbv;
}

function getSolved3BV()
{
 clean8();
 var solved = 0;
 for (var i=0; i<h; i++)
  for (var j=0; j<w; j++)
  {
   if (!isMine(j,i) && (squares[i][j]&8)==0 && numAround(j,i)==0)
   { // opening
    var queue = [[j, i]];
    squares[i][j] += 8;
    if (isOpen(j,i)) solved++;
    var index = 0;
    while (index < queue.length)
    {
     var x = queue[index][0];
     var y = queue[index][1];
     if (numAround(x, y) == 0)
      for (var k=0; k<around.length; k++)
      {
       var x2 = x + around[k][0];
       var y2 = y + around[k][1];
       if (isValid(x2,y2) && (squares[y2][x2]&8)==0)
       {
        queue.push([x2,y2]);
        squares[y2][x2] += 8;
       }
      }
     index++;
    }
   }
  }
 for (var i=0; i<h; i++)
  for (var j=0; j<w; j++)
   if (!isMine(j,i) && (squares[i][j]&8)==0 && isOpen(j,i))
    solved++;
 return solved;
}
 

function doStats()
{
 var time2 = time / 1000;
 var tclicks = lclicks + rclicks;
 var bbbv = get3BV();
 var s3bv = getSolved3BV();
 var est = time2 * (bbbv / s3bv);
 var s = "";
 s += "Time: " + trim(3, time2) + "<br>";
 s += "Left clicks: " + lclicks + " (" + trim(3, lclicks/time2) + " per second)<br>";
 s += "Right clicks: " + rclicks + " (" + trim(3, rclicks/time2) + " per second)<br>";
 s += "Total clicks: " + tclicks + " (" + trim(3, tclicks/time2) + " per second)<br>";
 s += "3BV: " + bbbv + "<br>";
 s += "Solved 3BV: " + s3bv + " (" + trim(3, s3bv/time2) + " 3BV/second)<br>";
 s += "Estimated time: " + trim(3, est) + "<br>";
 s += "IOE: " + trim(3, s3bv/tclicks) + "<br>";
 s += "IOS: " + trim(3, Math.log(bbbv)/Math.log(est)) + "<br>";
 s += "RQP: " + trim(3, est/(s3bv/time2)) + "<br>";
 s += "Size: " + h + "x" + w + " with " + m + " mines";
 $('stats').innerHTML = s;
}



function trim(nDigits, number)
{
 var power = Math.pow(10, nDigits);
 var trimmed = "" + Math.round(number * power);
 while (trimmed.length < nDigits + 1)
 {
  trimmed = "0" + trimmed;
 }
 var len = trimmed.length;
 return trimmed.substr(0,len - nDigits) + "." + trimmed.substr(len - nDigits, nDigits);
}


function $(str)
{
 return document.getElementById(str);
}


function disableSelection(target)
{
 if (typeof target.onselectstart!="undefined")
  target.onselectstart = function(){return false}
 else if (typeof target.style.MozUserSelect!="undefined")
  target.style.MozUserSelect="none"
 else
  target.onmousedown=function(){return false}
 target.style.cursor = "default"
}