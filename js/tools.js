 var tipArr = ["alert-success","alert-info","alert-warning","alert-danger"];
function ajax(action,data,success,error){ 
    $.ajax({
        type: "post",
        dataType: "json",
        url: serviceUrl+action,
        data:data,
        success: function (res) {
            if(typeof success === 'function') success(res);
        },
        error:function(res){
          if(typeof error === 'function') error(res);
        }
    });
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

//生成从minNum到maxNum的随机数
function randomNum(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
} 

function modifyBase64(base64){ 
    if(base64){
      return   base64.split(',')[1];
    }
    return null;
}

function tip(msg){  
    var index = randomNum(0,3);
    var temp ="<div class=\"alert "+tipArr[index]+" alert-dismissible\"  role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><strong>提示:</strong> <span>"+msg+"</span></div>";
    $("#msg").html(temp);

}