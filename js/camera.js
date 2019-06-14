/*
 * 创建日期:2019-05-29
 * 描    述:获取用户相关设备媒体
 * 说    明:
 *          内部及外部数据的交换均通过base64
 */

/*提示:
        延迟代表该方法需要通过回调的方式返回数据
*/

/*使用方法 
   var userMdedia = new H5Camera;  //初始化有何H5摄像机 -> 后续保持对userMdedia句柄的使用以便操作该摄像机
   userMdedia.play();              //打开摄像机
*/

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
   14.open              打开摄像机(用于后续拍照之类的)
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

   ----------------------------------------------------              扩展方法

   23.stringToBlob      参数：字符串
   24.typeArrayToBolb   参数：typearray         延迟
   25.blobToString      参数：blob              延迟
   26.arrayBufferToblob 参数：arraybuffer
   27.blobToArrayBuffer                         延迟
   28.blobToUrl
   29.splitBlob 分割文件
 * */

var H5Camera = (function ($) {
    let handleArr = [];

    /*播放器对象*/
    let videoNode = null;
    let buffers = [];
    let mediaRecorder = null;
    let mediaStream = null;
    let _$video = null;
    let _$canvas = null;
    let videType = ["blob", "arrayBuffer"]; /*ByteBuffer*/
    let selectType = videType[0];
    let photos = [];
    /*画布内容*/
    var canvasSrc = null; 

    function stringToBlob(str) {
        var blob = new Blob([str], {
            type: 'text/plain'
        });
        return blob;
    }

    function typeArrayToBolb(typeArray, f) {
        var array = new Uint16Array(typeArray);
        var blob = new Blob([array]);
        var reader = new FileReader();
        reader.readAsText(blob, 'utf-8');
        reader.onload = function (e) {
            f(reader.result);
        }
    };

    function blobToString(blob, f) {
        var reader = new FileReader();
        reader.readAsText(blob, 'utf-8');
        reader.onload = function (e) {
            f(reader.result);
        }
    };

    function arrayBufferToblob(arrayBuffer) {
        return new Blob([arrayBuffer]);
    };

    function blobToArrayBuffer(blob, f) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onload = function (e) {
            //将 ArrayBufferView  转换成Blob  方法一
            var buf = new Uint8Array(reader.result);
            reader.readAsText(new Blob([buf]), 'utf-8');
            reader.onload = function () {
                f(reader.result);
            };
            //将 ArrayBufferView  转换成Blob  方法二
            //  var buf = new DataView(reader.result);
            //  console.info(buf); //DataView {}
            //  reader.readAsText(new Blob([buf]), 'utf-8');
            //  reader.onload = function () {
            //      console.info(reader.result); //中文字符串
            //  };
        }
    };

    function blobToUrl(blob) {
        return URL.createObjectURL(blob);
    }

    function splitBlob(blob, start, end, contentType) {
        return blob.slice(start, end, contentType);
    }

    /*设备*/
    var selectVideConstraints = null;

    /*实例化对象*/
    var changeUserMedia = (new ChangeUserMedia);
     
    var task = (function () {

        /*停止的条件*/
        function timeout(time, wl, f) {
            t = setTimeout(function () {
                if (wl) {
                    f();
                } else {
                    timeout(time, wl, f);
                }
            }, time);
        };

        function Global() {
            this.wait = function (time, wl, f) {
                timeout(time, wl, f);
            }
        };
        return new Global;
    }());

    /*设备进行初始化*/
    function initDevice(videoHeight, videWidth) {
        changeUserMedia = (new ChangeUserMedia(videWidth, videoHeight));
    }

    /*切换摄像头*/
    function ChangeUserMedia(width, height) { 
        var videoDeviceIds = [];
        /*获取所有的媒体设备 await*/
        const mediaDevices = navigator.mediaDevices.enumerateDevices();
        mediaDevices.then(function (devices) {
            /*过滤处摄像头设备*/
            const videDevices = devices.filter(item => item.kind === 'videoinput');
            for (var i = 0; i < videDevices.length; i++) {
                videoDeviceIds.push(videDevices[i].deviceId);
            }
        });

        return (new function () {
            /*个数*/
            this.count = videoDeviceIds.length;
            /*获取设备*/
            this.getVideConstraintsDefault = function (index) {
                if (index == undefined || index == null) index = 0; /*默认前置*/
                if (index < 0 || index >= videoDeviceIds.length) {
                    return null;
                };
                var videoDeviceId = videoDeviceIds[index]; /*不同的索引切换 前置/后置摄像头*/
                const videConstraints = {
                    deviceId: {
                        exact: videoDeviceId
                    },
                    width: width,
                    height: height
                }
                selectVideConstraints = videConstraints;
                return videConstraints;
            }

        });
    }

    //打开设备
    function open(videoConstraints,f) {
        if (videoConstraints == null) {

        }
        /*await*/
        let userMedia = navigator.mediaDevices.getUserMedia({
            audio: true,
            video: videoConstraints
        });
        userMedia.then(function (media) {
            videoNode.srcObject = media;
            videoNode.play();
            mediaStream = media;
            for (let index = 0; index < handleArr.length; index++) {
                handleArr[index](mediaStream);
            }
            if (typeof f === "function") {
                f();
            }
        }); 
    }

    function startRecord(media) {
        var options = null;
        if (typeof MediaRecorder.isTypeSupported == 'function') {
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                options = {
                    mimeType: 'video/webm;codecs=h264'
                };
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
                options = {
                    mimeType: 'video/webm;codecs=h264'
                };
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                options = {
                    mimeType: 'video/webm;codecs=vp8'
                };
            }
            mediaRecorder = new MediaRecorder(media, options);
        } else {
            mediaRecorder = new MediaRecorder(media);
        }
        mediaRecorder.start(10);
        mediaRecorder.ondataavailable = function (event) {
            if (selectType == videType[0]) {
                buffers.push(event.data);
            } else {
                var reader = new FileReader();
                reader.addEventListener("loadend", function () {
                    var buf = new Uint8Array(reader.result);
                    if (reader.result.byteLength > 0) {
                        buffers.push(buf);
                    }
                });
                reader.readAsArrayBuffer(event.data);
            }
        }
    }

    /*开始录像(设备限制条件)*/
    function start() {
        buffers = [];
        startRecord(mediaStream); 
    }

    function resume() {
        if (!mediaRecorder) {
            throw Error("未启动录像操作");
        }
        mediaRecorder.resume();
    }

    function stop() {
        if (!mediaRecorder) {
            throw Error("未启动录像操作");
        }
        mediaRecorder.stop();
        mediaRecorder = null;
    }

    function pause() {
        if (!mediaRecorder) {
            throw Error("未启动录像操作");
        }
        mediaRecorder.pause();
    }

    function setDataType(index) {
        selectType = index < videType.length ? videType[index] : 0;
    }

    function imageToBase64(imgSrc, f) {
        var canvas = document.getElementById("canvas"),
            ctx = canvas.getContext("2d"),
            img = new Image();
        img.src = imgSrc;
        img.setAttribute("crossOrigin", 'Anonymous')
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
            var base64 = canvas.toDataURL("image/png");
            baseData = base64;
            f(base64);
        };
    }

    /*拍照保存*/
    function photograph(width, height) {
        const canvas = $("<canvas></canvas>")[0];
        const context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        context.drawImage(videoNode, 0, 0, canvas.width, canvas.height);
        var src = canvas.toDataURL("image/png");
        canvasSrc = src;
        photos.push(canvasSrc);
        return canvasSrc;
    }

    /*下载图片*/
    function download(data) {
        var _data = data || canvasSrc;
        if (!_data) {
            alert("获取拍摄照片失败");
            return;
        };
        const a = $("<a></a>")[0];
        a.setAttribute('download', new Date());
        a.href = _data;
        a.click();
    }

    /*关闭摄像设备(默认3s后关闭)*/
    function closeUserMedia(timeout) {
        var video = $(_$video)[0];
        video.pause();
        video.src = "";
        mediaStream.getTracks().forEach(track => track.stop());
    }

    function Global() {
        let self = this;
        /*只会存在前后的摄像媒体*/
        this.changeUserMedia = function () {
            return {
                count: changeUserMedia.count,
                selectedDevice: changeUserMedia.getVideConstraintsDefault
            };
        };

        this.start = function () {
            start();
        };

        this.continue = resume;

        this.stop = stop;

        this.pause = pause;

        this.state = function () {
            return (mediaRecorder && mediaRecorder.state) || null
        };

        this.mediaCount = function () {
            return changeUserMedia.count;
        };

        this.setDataType = setDataType;

        this.getvideoData = function () {
            return buffers;
        };

        /*默认前置摄像头*/
        this.selectedDevice = changeUserMedia.getVideConstraintsDefault;

        this.closeUserMedia = closeUserMedia;

        this.photograph = photograph;

        this.clearPhotos = function () {
            photos = [];
        };

        this.getphotos = function () {
            return photos;
        };

        this.downloadLastPhoto = download;

        this.downloadPhotos = function () {
            for (let index = 0; index < photos.length; index++) {
                download(photos[index]);
            }
        }

        this.open = function (f) {
            open(selectVideConstraints,f);
        };

        this.getLastPhoto = function () {
            return canvasSrc;
        }

        this.addHandle = function (func) {
            if (typeof func === 'function')
                handleArr.push(func);
        }

        /**
         * 初始化
         *  $video video对象
         *  $canvas canvas对象
         *  videoHeight video对象高度
         *  videWidth video宽度
         */
        this.init = function ($video, $canvas, videoHeight, videWidth, isOpenDetection = false) {
            videoNode = $($video)[0];
            _$video = $video;
            _$canvas = $canvas;
            /*将原来的元素修改*/
            $($video).attr("height", videoHeight);
            $($video).attr("width", videWidth);
            $($video).attr("playsinline", "true");
            $($video).attr("muted", "true");
            initDevice(videoHeight, videWidth);
            changeUserMedia.getVideConstraintsDefault();
            if (isOpenDetection) {
                self.addHandle(function () {
                    var d = $("<canvas id=\"detectionCancas\" width=\"" + videWidth + "\" height=\"" + videoHeight + "\"></canvas>")
                    $($video).after(d);
                    detection.init($video, $("#detectionCancas"));
                    detection.startDetection();
                });
            }
        };
    }

    return Global;

}(jQuery));