// {
//     type: 'mine',
//     x: 0,
//     y: 0
// }
// {
//     type: 'number',
//     x: 0,
//     y: 0,
//     value: 1
// }

// x-1 , y-1      x , y        x+1 , y-1 
// x-1 , y        x , y（雷）        x+1 , y
// x-1 , y+1      x , y        x+1 , y+1 

/**
 * 根据信息创建一个方块，是一个构造函数
 * @param {*} tr 行数
 * @param {*} td 列数
 * @param {*} mineNum 雷数量 
 */
function Mine(tr, td, mineNum) {
    this.tr = tr;
    this.td = td;
    this.mineNum = mineNum;
    //存储所有方块的信息，是一个二维数组，按行与列的顺序排放，存取都使用行列的形式
    this.squares = [];
    //存储所有的单元格的DOM
    this.tds = [];
    //剩余雷的数量
    this.surplusMine = mineNum;
    //右击鼠标 -> 标记的小红旗是否是雷，用来判断游戏是否成功
    this.allRight = false;
    // 表格容器
    this.parent = document.querySelector('.gameBox');
    // 剩余雷数量容器
    this.mineNumDom = document.querySelector('.minNum');
};

/**
 * 原型上面添加一个方法：页面初始化
 */
Mine.prototype.init = function () {
    // 雷在格子里面的位置
    var rn = this.randomNum();
    // 用来找到格子对应的索引
    var n = 0;
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {
            // 取一个方块在数组里的数据，要使用行与列的形式去取，找方块周围的方块的时候，要用坐标的形式去取，行与列的形式跟坐标的形式x,y是刚好相反的
            if (rn.indexOf(++n) >= 0) {
                // 如果这个条件成立，说明现在循环到的这个索引在雷的数组里面找到了，那就表示这个索引对应的是个雷
                this.squares[i][j] = { type: 'mine', x: j, y: i };
            } else {
                this.squares[i][j] = { type: 'number', x: j, y: i, value: 0 };
            }
        }
    }
    // 阻止默认鼠标 右键弹出菜单 事件
    this.parent.oncontextmenu = () => {return false};
    // 更新数据
    this.upDateNum();
    //创建表格
    this.createDom();
    // 剩余雷数量时刻在变化
    this.mineNumDom.innerHTML = this.surplusMine;
};

/**
 * 原型上面添加一个方法：生成n个不重复的数字
 */
Mine.prototype.randomNum = function () {
    //生成一个空数组，但是有长度，长度为格子的总数
    var square = new Array(this.tr * this.td);
    for (var i = 0; i < square.length; i++) {
        square[i] = i;
    }
    square.sort(() => { return 0.5 - Math.random() });
    return square.slice(0, this.mineNum);
};

/**
 * 原型上面添加一个方法：创建表格
 */
Mine.prototype.createDom = function () {
    var This = this;
    var table = document.createElement('table');
    for (var i = 0; i < this.tr; i++) {       //行
        var domTr = document.createElement('tr');
        this.tds[i] = [];                     //每一行都是一个数组
        for (var j = 0; j < this.td; j++) {   //列
            var domTd = document.createElement('td');
            domTd.pos = [i, j];//把格子对应的行与列存到格子身上，为了下面通过这个值去数组里面找到对应的数据
            // 鼠标按下
            domTd.onmousedown = function () {
                This.play(event, this);
            }
            //把所有创建的td添加到 行 这个数组当中
            this.tds[i][j] = domTd;
            // if(this.squares[i][j].type == 'mine') {
            //     domTd.className = 'mine';
            // } else if(this.squares[i][j].type == 'number') {
            //     domTd.innerHTML = this.squares[i][j].value;
            // }
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = '';//每次创建都要清空前一次的
    this.parent.appendChild(table);
};

/**
 * 找某个方格周围的其余8个格子
 */
Mine.prototype.getAround = function (square) {
    var x = square.x;
    var y = square.y;
    // 把找到的格子的坐标返回出去 -> 二维数组
    var result = [];
    // 通过坐标去循环九宫格
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (
                i < 0 || j < 0 ||                       //格子超出 左边 上边 的范围
                i > this.td - 1 || j > this.tr - 1 ||   //格子走出 右边 下边 的范围
                (i == x && j == y) ||                   //当前循环到的格子是自己
                this.squares[j][i].type == 'mine'       //周围格子都是雷
            ) {
                continue;
            }
            result.push([j, i]);//要行与列的形式返回出去，因为到时候要用它去取数组里面的数据
        }
    }
    return result;
};

/**
 * 更新所有的数字
 */
Mine.prototype.upDateNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (j = 0; j < this.td; j++) {
            //只更新 雷 周围的数字
            if (this.squares[i][j].type == 'number') {
                continue;
            }
            // 获取到每一个雷周围的数字
            var num = this.getAround(this.squares[i][j]);
            for (var k = 0; k < num.length; k++) {
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
};

/**
 * 鼠标按下
 */
Mine.prototype.play = function (e, obj) {
    var This = this;
    // 1 -> 左键 2 -> 中键 3-> 右键
    if (e.which == 1 && obj.className != 'flag') {
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
        if (curSquare.type == 'number') {//用户点击到了数字
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];
            if (curSquare.value == 0) {//如果点击到了数字0,就不显示
                obj.innerHTML = '';
                function getAllzero(square) {
                    //找到九宫格周围的n个格子
                    var around = This.getAround(square);
                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0];//行
                        var y = around[i][1];//列
                        This.tds[x][y].className = cl[This.squares[x][y].value];
                        if (This.squares[x][y].value == 0) {
                            //如果以某个格子为中心找到的格子值为0，那就需要接着调用该函数（递归）
                            if (!This.tds[x][y].check) {//一开始必然能够进去
                                //给对应的td格子添加一个属性，这个属性用于决定这个格子有没有被找过如果被找过的话，它的值就为true下一次就不会再找了
                                This.tds[x][y].check = true;
                                getAllzero(This.squares[x][y]);
                            }
                        } else {
                            //如果以某个格子为中心找到的四周格子的周围值不为0，那就把人家的显示出来
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                };
                getAllzero(curSquare);
            }
        } else { // 用户点击到了雷
            this.gameOver(obj);
        }
    }
    if (e.which == 3) {
        //如果右击的是数字，就不能点击
        if (obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag';// 点击添加取消红旗
        if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
            this.allRight = true;//用户标注的红旗都是雷
        } else {
            this.allRight = false;//用户标注的红旗不是雷
        }
        // 点击添加取消红旗，剩余雷数量也会相应的增加减少
        if (obj.className == 'flag') {
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }
        // 剩余的雷的数量为0，表示用户已经标注完小红旗了，这里要判断游戏是成功还是失败
        if (this.surplusMine == 0) {
            if (this.allRight) {
                alert('恭喜你，通关了');
            } else {
                alert('游戏失败');
                this.gameOver();
            }
        }
    }
};

/**
 * 游戏失败函数
 */
Mine.prototype.gameOver = function (clickTd) {
    // 1.显示所有的雷
    // 2.取消所有格子的点击事件
    // 3.给点中的那个格子标红
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {//显示全部的雷
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }
    if (clickTd) {
        clickTd.style.backgroundColor = '#f40';
    }
};

/**
 * 上面button功能
 */
var btns = document.querySelectorAll('.level button');
var arr = [[9, 9, 10], [16, 16, 40], [28, 28, 99]];             //不同级别的行数列数
var mine = null;                                                //用来存储生成的实例
var ln = 0;                                                     //用来处理当前选中的状态
for (var i = 0; i < btns.length - 1; i++) {
    (function (i) {
        btns[i].onclick = function () {
            btns[ln].className = '';
            this.className = 'active';
            // mine = new Mine(arr[i][0],arr[i][1],arr[i][2]);  //方法一
            mine = new Mine(...arr[i]);                         //方法二
            mine.init();
            ln = i;
        }
    }(i));
}
// 初始化一下
btns[0].onclick();
// 点击重新开始按钮
btns[3].onclick = function () {
    mine.init();
};