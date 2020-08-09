function cropImg(options){
   this.target = document.getElementById(options.target) || document;
   this.width = 0;
   this.height = 0;
   this.container_clicked = false;//模态框是否处于点击状态
   this.symbol_clicked = false; //小三角是否处于点击状态
   this.start_x = 0;
   this.start_y = 0;
   this.timer = null;
   this.mouse_index = 0;
   this.init();  
}

cropImg.prototype.init = function(){
    this.renderBox();
    this.bindEvent();
}

/**
 * 计算截取框的宽高并渲染相互来
 */
cropImg.prototype.renderBox = function(){
  const width = parseInt(getComputedStyle(this.target).width);
  const height = parseInt(getComputedStyle(this.target).height);
  this.radio = width/height;
  this.width = parseInt(width/3);
  this.height = parseInt(height/3);
  const container = document.createElement("DIV");
  container.style.width = `${this.width}px`;
  container.style.height = `${this.height}px`;
  container.setAttribute("class","mask");
  container.addEventListener("mousedown",this.containerDown.bind(this));
  this.target.addEventListener("mouseup",this.containerUp.bind(this));
  container.addEventListener("mousemove",this.containerMove.bind(this));
  this.mask = container;
  this.target.appendChild(container);
  this.renderSymbol();
}

/**
 * 渲染右下角的拉升框
 */
cropImg.prototype.renderSymbol = function(){
    const symbol = document.createElement("DIV");
    symbol.setAttribute("class","symbol");
    //symbol.addEventListener("mousedown",this.symbolDown.bind(this));
    //this.target.addEventListener("mousemove",this.symbolMove.bind(this));
    this.bindMouseEvent({
        mousedown:{
            element:symbol
        },
        mousemove:{
            element:this.target,
            callback(e,start_x){
                const x =  e.pageX - start_x;
                const width = parseInt(getComputedStyle(this.mask).width) + x;
                const height = parseInt(width * 1/this.radio);
                this.mask.style.width = `${width}px`;
                this.mask.style.height = `${height}px`;
            }
        },
        mouseup:{
            element:this.target
        }
    });
    this.symbol = symbol;
    this.mask.appendChild(symbol);
}

/**
 * 定义一些策略函数
 */
cropImg.prototype.strategyEvent = function(key,idx){

    function mousedown(e){  //鼠标按下时的默认操作
        e.stopPropagation();
        this[`mouse_${idx}`] = true; //检测鼠标是否处于按下的状态
        this[`start_${idx}`] = e.pageX;
        this[`start_${idx}`] = e.pageY;
    }

    function mousemove(e,callback){//鼠标移动时的默认操作
        e.stopPropagation();
        e.preventDefault();
        if(!this[`mouse_${idx}`]){
            return false;
        }
        if(this[`timer${idx}`]){
            return false;
        }
        this[`timer${idx}`] = setTimeout(()=>{
            callback(e,this[`start_x${idx}`],this[`start_y${idx}`]);
            this[`start_x${idx}`] = e.pageX;
            this[`start_y${idx}`] = e.pageY;
            clearTimeout(this[`timer${idx}`]);
            this[`timer${idx}`] = null;
        },20)
    } 

    function mouseup(e){ //鼠标松开时的默认操作
        this[`mouse_${idx}`] = false;
    }

    const funList = {mousedown,mousemove,mouseup};

    return funList[key];

}

/**
 * 对dom元素保定鼠标点击弹出移动事件
 */
cropImg.prototype.bindMouseEvent = function(params){

    this.mouse_index++; //每当需要绑定一次鼠标事件,mouse_index自增1,作为唯一的id标识
   
    for(let key in params){
        const value = params[key]; // 得到key和value
        const { element,callback } = value;
        const defaultFn = this.strategyEvent(key,this.mouse_index); //获取默认运行函数
        if(!defaultFn){//如果发现params的参数配置里面的key没有和在策略函数里定义的默认函数匹配上,那么判定当前对应的key-value是无效的
            continue;
        }
        element.addEventListener(key,(e)=>{ //开始绑定事件
            const fn = callback || defaultFn; //如果用户传入了callback就覆盖默认的执行函数
            fn.call(this,e,callback);//某些默认策略函数需要callback参数,所以params.callback也作为参数传入
        })
    }

}


cropImg.prototype.symbolDown = function(e){
    e.stopPropagation();
    this.symbol_clicked = true;
    this.start_x2 = e.pageX;
    this.start_y2 = e.pageY;
}

cropImg.prototype.symbolMove = function(e){
        e.stopPropagation();
        e.preventDefault();
        if(!this.symbol_clicked){
            return false;
        }
        if(this.timer2){
            return false;
        }
        this.timer2 = setTimeout(()=>{
            const x =  e.pageX - this.start_x2;
            const width = parseInt(getComputedStyle(this.mask).width) + x;
            const height = parseInt(width * 1/this.radio);
            this.mask.style.width = `${width}px`;
            this.mask.style.height = `${height}px`;
            this.start_x2 = e.pageX;
            this.start_y2 = e.pageY;
            clearTimeout(this.timer2);
            this.timer2 = null;
        },20)
}



cropImg.prototype.containerDown = function(e){
    e.preventDefault();
   this.container_clicked = true;
   this.start_x = e.pageX;
   this.start_y = e.pageY;
}

cropImg.prototype.containerUp = function(e){
    this.container_clicked = false;
    this.symbol_clicked = false;
}

cropImg.prototype.containerMove = function(e){
    e.preventDefault();
    if(!this.container_clicked){
        return false;
    }
    if(this.timer){
        return false;
    }
    this.timer = setTimeout(()=>{
        const x =  e.pageX - this.start_x;
        const y =  e.pageY - this.start_y;
        let top = parseInt(getComputedStyle(this.mask).top);
        let left = parseInt(getComputedStyle(this.mask).left);
        top += y;
        left += x;
        this.mask.style.top = `${top}px`;
        this.mask.style.left = `${left}px`;
        this.start_x = e.pageX;
        this.start_y = e.pageY;
        clearTimeout(this.timer);
        this.timer = null;
    },20)
}



cropImg.prototype.bindEvent =function(){
    this.target.addEventListener("click",this.cropHandler);
}

cropImg.prototype.cropHandler = function(){
   
}