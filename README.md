# H5Camera
  H5Camera 基于chrom浏览器进行api方法封装调用，未作其他浏览器兼容处理

#本功能主要是用于人脸识别功能前端基于H5调用摄像头传输到后台进行认证

## 前置
需要自己提供一个video的容器，摄像机基于该容器进行初始化

## 说明
基于HTML5调用摄像头，封装了相关方法，支持拍照，录制视频 js方法有详细API使用

# 核心功能  

1.H5摄像头调用，拍照，录制视频  

2.识别二维码使用(目前只能识别完整的二维码，不能包含其他内容，需要完善)  

3.内置人脸检测模块  

# 使用方法  
   var userMdedia = new H5Camera;  //初始化一个摄像机 -> 后续保持对userMdedia句柄的使用以便操作该摄像机  
   userMdedia.play();              //打开摄像机  
   userMdedia.stop();  
   
### API
1.new H5Camera  创建一个摄像设备，保持该句柄进行相关的操作  

/**
 * API
 * 
 * 01.init               初始化  
 *                          参数列表:$video, $canvas, videoHeight, videWidth, isOpenDetection = false  
 *              
 * 02.addHandle          初始化完成之后要做的其他操作(在init之前加入)  
 
 * ---------------------------------------------------------        视频  
   03.continue          继续拍摄  
   04.stop              停止拍摄  
   05.pause             暂停拍摄  
   06.state             获取拍摄视频状态(停止，暂停等)  
   07.setDataType       设置视频数据格式 ["blob", "arrayBuffer"] 默认:blob  参数:index  
   09.getvideoData      获取视频内容  
   10.start             开始录制视频  
   
   ---------------------------------------------------------        摄像机  
   11.selectedDevice    切换摄像头  
   12.closeUserMedia    关闭摄像头  
   13.mediaCount        获取设备数量(只有前置和后置摄像头)  
   14.open              打开摄像机(用于后续拍照之类的)               参数:f 打开之后的回调操作  
   15.changeUserMedia   切换设备  (已有替代方法)  
                        返    回:{count:0,getVideConstraintsDefault:null }  
   16.closeUserMedia    关闭摄像机  
   
   -------------------------------------------------------          拍摄照片  
   17.getLastPhoto      获取最近一次拍照  
   18.clearPhotos       清空拍摄的照片  
   19.getphotos         获取拍摄的照片  
   20.download          下载最近一次拍摄的照片  
   21.downloadPhotos    下载所有照片  
   22.photograph        拍照  
   
   ----------------------------------------------------             扩展方法  
   
   23.stringToBlob      参数：字符串  
   24.typeArrayToBolb   参数：typearray         延迟  
   25.blobToString      参数：blob              延迟  
   26.arrayBufferToblob 参数：arraybuffer  
   27.blobToArrayBuffer                         延迟  
   28.blobToUrl  
   29.splitBlob 分割文件  
 * */
