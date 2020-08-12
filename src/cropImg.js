function cropImg(options) {
  this.target = document.getElementById(options.target) || document;
  this.width = 0;
  this.height = 0;
  this.container_width = 0;
  this.container_height = 0;
  this.container_clicked = false; //模态框是否处于点击状态
  this.symbol_clicked = false; //小三角是否处于点击状态
  this.start_x = 0;
  this.start_y = 0;
  this.timer = null;
  this.mouse_index = 0;
  this.callback = options.callback || function () {};
  this.fun_list = []; //所有绑定的事件存储起来,插件销毁时解绑
  this.init();
}

cropImg.prototype.init = function () {
  this.renderBox(); //给box框绑定事件
  this.renderSymbol(); //给右下角拉伸块绑定事件
  this.mouseUp(); //初次加载触发一次裁剪
};

/**
 * 计算截取框的宽高并渲染相互来
 */
cropImg.prototype.renderBox = function () {
  const width = (this.container_width = parseInt(
    getComputedStyle(this.target).width
  ));
  const height = (this.container_height = parseInt(
    getComputedStyle(this.target).height
  ));
  this.radio = width / height;
  this.width = parseInt(width / 3);
  this.height = parseInt(height / 3);
  const container = document.createElement('DIV');
  container.style.width = `${this.width}px`;
  container.style.height = `${this.height}px`;
  container.style.left = `${this.container_width / 2 - this.width / 2}px`; //初次加载模态框放到正中间的位置
  container.style.top = `${this.container_height / 2 - this.height / 2}px`;
  container.setAttribute('class', 'mask');

  this.bindMouseEvent({
    mousedown: {
      element: container,
    },
    mousemove: {
      element: container,
      callback(e, start_x, start_y) {
        const x = e.pageX - start_x;
        const y = e.pageY - start_y;
        let top = parseInt(getComputedStyle(this.mask).top);
        let left = parseInt(getComputedStyle(this.mask).left);
        top += y;
        left += x;
        left = left < 0 ? 0 : left;
        left =
          left > this.container_width - this.width
            ? this.container_width - this.width
            : left;
        top = top < 0 ? 0 : top;
        top =
          top > this.container_height - this.height
            ? this.container_height - this.height
            : top;
        this.mask.style.top = `${top}px`;
        this.mask.style.left = `${left}px`;
      },
    },
  });

  this.mask = container;
  this.target.appendChild(container);
};

/**
 * 渲染右下角的拉升框
 */
cropImg.prototype.renderSymbol = function () {
  const symbol = document.createElement('DIV');
  symbol.setAttribute('class', 'symbol');
  this.bindMouseEvent({
    mousedown: {
      element: symbol,
    },
    mousemove: {
      element: [this.target, this.mask],
      callback(e, start_x) {
        const x = e.pageX - start_x;
        const width = parseInt(getComputedStyle(this.mask).width) + x;
        const height = parseInt((width * 1) / this.radio);
        this.mask.style.width = `${width}px`;
        this.mask.style.height = `${height}px`;
        this.width = width;
        this.height = height;
      },
    },
  });
  this.symbol = symbol;
  this.mask.appendChild(symbol);
};

/**
 * 定义一些策略函数
 */
cropImg.prototype.strategyEvent = function (key, idx) {
  function mousedown(e) {
    //鼠标按下时的默认操作
    e.stopPropagation();
    this[`mouse_${idx}`] = true; //检测鼠标是否处于按下的状态
    this[`start_x${idx}`] = e.pageX;
    this[`start_y${idx}`] = e.pageY;
  }

  function mousemove(e, callback) {
    //鼠标移动时的默认操作
    e.stopPropagation();
    e.preventDefault();
    if (!this[`mouse_${idx}`]) {
      return false;
    }
    if (this[`timer${idx}`]) {
      return false;
    }
    this[`timer${idx}`] = setTimeout(() => {
      callback.call(this, e, this[`start_x${idx}`], this[`start_y${idx}`]);
      this[`start_x${idx}`] = e.pageX;
      this[`start_y${idx}`] = e.pageY;
      clearTimeout(this[`timer${idx}`]);
      this[`timer${idx}`] = null;
    }, 20);
  }

  const funList = { mousedown, mousemove };

  return funList[key];
};

/**
 * mouseup处理函数
 */
cropImg.prototype.mouseUp = function () {
  Array.from(Array(this.mouse_index)).forEach((value, idx) => {
    this[`mouse_${idx + 1}`] = false;
  });
  const { top, left } = this.mask.style;
  this.callback({
    width: this.width,
    height: this.height,
    top: parseInt(top),
    left: parseInt(left),
    container_height: this.container_height,
    container_width: this.container_width,
  });
};
/**
 * 对mouseup事件单独处理
 */
cropImg.prototype.mouseUpHandler = function () {
  if (this.mouse_index > 0) {
    //已经绑定过mouseup事件了
    return false;
  }
  this.fun_list.push({
    //将所有注册的事件收集起来,插件需要销毁时对事件解绑
    ele: document,
    fn: this.mouseUp,
    event: 'mouseup',
  });
  document.addEventListener('mouseup', this.mouseUp.bind(this));
  return this.mouseUp;
};

/**
 * 对dom元素保定鼠标点击弹出移动事件
 */
cropImg.prototype.bindMouseEvent = function (params) {
  this.mouseUpHandler(); //处理mouseup事件

  this.mouse_index++; //每当需要绑定一次鼠标事件,mouse_index自增1,作为唯一的id标识

  for (let key in params) {
    const value = params[key]; // 得到key和value
    let { element, callback } = value;
    const defaultFn = this.strategyEvent(key, this.mouse_index); //获取默认运行函数
    if (!defaultFn) {
      //如果发现params的参数配置里面的key没有和在策略函数里定义的默认函数匹配上,那么判定当前对应的key-value是无效的
      continue;
    }
    element = Array.isArray(element) ? element : [element]; //不是数组也转化成数组
    element.forEach((ele) => {
      const fn = (e) => {
        //开始绑定事件
        defaultFn.call(this, e, callback); //某些默认策略函数需要callback参数,所以params.callback也作为参数传入
      };
      this.fun_list.push({
        //将所有注册的事件收集起来,插件需要销毁时对事件解绑
        ele,
        fn,
        event: key,
      });
      ele.addEventListener(key, fn);
    });
  }
};

/**
 * 对绑定的事件进行销毁
 */
cropImg.prototype.destory = function () {
  this.fun_list.forEach(({ ele, fn, event }) => {
    ele.removeEventListener(event, fn);
  });
};
