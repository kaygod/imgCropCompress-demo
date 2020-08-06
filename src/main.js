(function(context){

    const img_types= ["image/jpeg","image/png"];

    let img = null;

    /**
     * 给input绑定事件
     */
    async function updateFile(e){
        const file = e.target.files[0];

        if(!verify(file)){ //参数校验
            return false;
        }

        const base64Code = await getBase64(file);//获取base64编码

        placeImg(base64Code); //放置图片

    }

    /**
     * 压缩图片
     */
    function compress(){
        if(!img){
            return false;
        }
        const value = Number(document.getElementById("sel").value);
        const canvas = document.createElement("CANVAS");
        const w = img.width,h = img.height;
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0,w,h);
        const code = canvas.toDataURL("image/jpeg",value);
        const image = new Image();
        image.src = code;
        image.onload = ()=>{
            const des = document.getElementById("production");
            des.innerHTML = "";
            des.appendChild(image);
        }
    }


    /**
     * 给图片设置合适的宽高放置在容器中
     */
    function placeImg(code){
        const target = document.getElementById("original");
        const max_width = parseInt(getComputedStyle(target).width);
        const max_height = parseInt(getComputedStyle(target).height);
        let width,height;
        const image = new Image();
        image.src = code;
        image.onload = ()=>{
            const naturalWidth = image.naturalWidth;
            const naturalHeight = image.naturalHeight;
            const radio = naturalWidth / naturalHeight;
            if(radio >= 1){ //宽比高大
                width =  naturalWidth < max_width?naturalWidth:max_width;
                height = width * 1/radio;
                if(height > max_height){
                    height = max_height;
                    width = height * radio;
                }
            }else{
                height = naturalHeight < max_height?naturalHeight:max_height;
                width = height * radio; 
                if(width > max_width){
                    width = max_width;
                    height = width * 1/radio;
                }
            }
            width = parseInt(width);
            height = parseInt(height);
            image.style.width = `${width}px`;
            image.style.height = `${height}px`;
            target.innerHTML = "";
            target.appendChild(image);
            img = image;
            compress();
        }
    }


    /**
     * 参数校验
     * @param {*} file 
     */
    function verify(file){
        const { size,type } = file;
        if(size > 5 * 1024 * 1024 ){
            alert("上传图片大小不能超过5M");
            return false;
        }
        if(!img_types.includes(type)){
            alert("请上传图片");
            return false;
        }
        return true;
    }

    function getBase64(file){
        return new Promise((resolve)=>{
            const fileReader = new FileReader();
            fileReader.onload = (e)=>{
                resolve(e.target.result);
            }
            fileReader.readAsDataURL(file);
        }) 
    }


    context.updateFile = updateFile;

    context.compress = compress;

})(window)