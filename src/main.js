(function (context) {
  const img_types = ['image/jpeg', 'image/png'];

  let img = null,
    compress_img = null,
    crop_obj = null;

  function crop() {
    const obj = new cropImg({
      target: 'box',
      callback({
        left,
        top,
        width,
        height,
        container_height,
        container_width,
      }) {
        const canvas_bak = document.createElement('CANVAS');
        const ctx_bak = canvas_bak.getContext('2d');
        canvas_bak.width = container_width;
        canvas_bak.height = container_height;
        ctx_bak.drawImage(img, 0, 0, container_width, container_height);

        const canvas = document.createElement('CANVAS');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(
          canvas_bak,
          left,
          top,
          width,
          height,
          0,
          0,
          width,
          height
        );

        const value = Number(document.getElementById('sel').value);
        const code = canvas.toDataURL('image/jpeg', value);
        const image = new Image();
        image.src = code;
        image.onload = () => {
          const des = document.getElementById('production');
          des.innerHTML = '';
          des.appendChild(image);
          compress_img = image;
        };
      },
    });

    return obj;
  }

  /**
   * 给input绑定事件
   */
  async function updateFile(e) {
    const file = e.target.files[0];

    if (!verify(file)) {
      //参数校验
      return false;
    }

    const base64Code = await getBase64(file); //获取base64编码

    placeImg(base64Code); //放置图片
  }

  /**
   * 下载图片
   * @param {*}
   */
  function generate() {
    if (!compress_img) {
      return false;
    }
    const a = document.createElement('A');
    a.href = compress_img.src;
    a.download = 'download';
    a.click();
  }

  /**
   * 压缩图片
   */
  function compress() {
    if (!img) {
      return false;
    }
    const value = Number(document.getElementById('sel').value);
    const canvas = document.createElement('CANVAS');
    const w = parseInt(img.style.width),
      h = parseInt(img.style.height);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const code = canvas.toDataURL('image/jpeg', value);
    const image = new Image();
    image.src = code;
    image.onload = () => {
      const des = document.getElementById('production');
      des.innerHTML = '';
      des.appendChild(image);
      compress_img = image;
    };
  }

  /**
   * 给图片设置合适的宽高放置在容器中
   */
  function placeImg(code) {
    const target = document.getElementById('original');
    const max_width = parseInt(getComputedStyle(target).width);
    const max_height = parseInt(getComputedStyle(target).height);
    let width, height;
    const image = new Image();
    image.src = code;
    image.onload = () => {
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      const radio = naturalWidth / naturalHeight;
      if (radio >= 1) {
        //宽比高大
        width = naturalWidth < max_width ? naturalWidth : max_width;
        height = (width * 1) / radio;
        if (height > max_height) {
          height = max_height;
          width = height * radio;
        }
      } else {
        height = naturalHeight < max_height ? naturalHeight : max_height;
        width = height * radio;
        if (width > max_width) {
          width = max_width;
          height = (width * 1) / radio;
        }
      }
      width = parseInt(width);
      height = parseInt(height);
      const box = document.getElementById('box');
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
      image.style.width = `${width}px`;
      image.style.height = `${height}px`;
      box.style.background = `url(${code}) no-repeat`;
      box.style.backgroundSize = '100% 100%';
      img = image;
      compress();
    };
  }

  /**
   * 参数校验
   * @param {*} file
   */
  function verify(file) {
    const { size, type } = file;
    if (size > 5 * 1024 * 1024) {
      alert('上传图片大小不能超过5M');
      return false;
    }
    if (!img_types.includes(type)) {
      alert('请上传图片');
      return false;
    }
    return true;
  }

  function getBase64(file) {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        resolve(e.target.result);
      };
      fileReader.readAsDataURL(file);
    });
  }

  context.updateFile = updateFile;

  context.compress = compress;

  context.generate = generate;

  context.crop = function () {
    if (crop_obj || !img) {
      return false;
    }
    crop_obj = crop();
  };
})(window);
