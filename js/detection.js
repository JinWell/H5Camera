/*
 *人脸侦测js 
 * 需要配合视频录像功能识别人脸
 */
detection = (function ($) {
 
   let listen = null;
  //视频dom对象
  let $video = null;
  let overlay_eye = null;
  let ctrack = new clm.tracker();
  let isClose = false;

  //根据输出的数组中人脸相应位置的坐标，圈出眼睛的位置
  function getEyes(positions) {
    const minX = positions[23][0] - 6;
    const maxX = positions[28][0] + 6;
    const minY = positions[24][1] - 6;
    const maxY = positions[26][1] + 6;
    const width = maxX - minX;
    const height = maxY - minY;
    return [minX, minY, width, height];
  }

  function clear() {
    var c = document.getElementById("detectionCancas");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 300, 150);
    ctx.clearRect(0, 0, 400, 300);
  }

  // 持续监测人脸
  function detect() {
    if (isClose) {
      overlay_eye.clearRect(0, 0, 400, 300);
      ctrack.stop();
      ctrack = null;
      setTimeout(() => { 
        tip("完全关闭"); 
        clear();
      }, 300);
      return false;
    };

    // 检查是否检测到人脸
    requestAnimationFrame(detect);
    let currentPosition = ctrack.getCurrentPosition();

    //清空矩阵(之前检测到的)
    overlay_eye.clearRect(0, 0, 400, 300);

    if (currentPosition) {
      //在overlay canvas上画出检测到的人脸:
      //此处扩展绘制矩形
      //ctrack.draw(overlay); 

      // 用红色画出人眼位置:
      const eyesRect = getEyes(currentPosition);
      overlay_eye.strokeStyle = 'red';
      //暂时方案利用眼睛位置绘制轮廓
      overlay_eye.strokeRect(eyesRect[0], eyesRect[1], eyesRect[2], eyesRect[3]);
      //tip("检测到人脸");
      if(listen !=null){
        listen(currentPosition);
      }
    } else {
      //tip("没有检测到人脸");
    }
  }

  //根据视频内容检测人脸
  function onStreaming() {
    ctrack.start($video);
    detect();
  }

  function Global() {

    this.init = function (video, dectCanvas) {
      $video = $(video)[0];
      isClose = false;
      overlay_eye = $(dectCanvas)[0].getContext('2d');
      ctrack.init();
    }

    this.startDetection = function () {
      onStreaming();
    }

    //关闭
    this.stop = function () {
      isClose = true;
      ctrack.stop();
      tip("已关闭检测");
    } 

    this.startListen = function(f){
      if(typeof f === "function")
             listen = f;
    }

    this.stopListen = function(){
      listen = null;
    }
  }

  return new Global;

}(jQuery));