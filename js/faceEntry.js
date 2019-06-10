//识别
function faceRecognitionForIamge(base64, f) {
    ajax('/Home/FaceRecognitionForIamge', {
        "": base64
    }, function (res) {
        if (typeof f === "function") {
            f();
        }
  
        if (res != "没有数据") {
            $("#sb").attr("src", "data:image/jpeg;base64,"+res);
            tip("识别成功");
        }else{
            tip(res);
        }
    }, function (res) {
        tip("识别失败");
        if (typeof f === "function") {
            f();
        }
    });
}

//录入
function faceEntry(base64, name) {
    ajax('/Home/FaceEntry', {
        base64: base64,
        name: name
    }, function (res) {
        tip("录入成功");
    }, function (res) {
        tip("录入失败");
    });
}


//测试连接
function testConnected() {
    ajax('/Home/TestConnected', {}, function (res) {
        tip(res);
    }, function (res) {
        tip("连接服务失败");
    });
}

//重新加载人脸模型
function resetFaceEncodings() {
    alert('111');
    ajax('/Home/FaceEntry', {
        base64: base64,
        name: name
    }, function (res) {

    }, function (res) {

    });
}