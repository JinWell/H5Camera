     /*
     * 创建日期:2019-05-29
     * 描    述:获取用户相关设备媒体
     */
    
    var userMedia = (function ($) {
        let handleArr  = [];

        //播放器对象
        let videoNode = null;

        var _$video = null;
        var _$canvas = null;

        //画布内容
        var canvasSrc = null;

        //设备
        var selectVideConstraints = null;

        //实例化对象
        var changeUserMedia = (new ChangeUserMedia);

        var mediaStream = null;

        var task = (function () {

            //停止的条件
            function timeout(time, wl, f) {
                t = setTimeout(function () {
                    if (wl) {
                        f();
                    } else {
                        timeout(time, wl, f);
                    }
                }, time);
            }
             
            function Global() { 
                this.white = function (time,wl, f) {
                    timeout(time, wl, f);
                }
            };
            return new Global;

        }());
        
        //切换摄像头
        function ChangeUserMedia(width, height) {
            var videoDeviceIds = [];
            //获取所有的媒体设备 await
            const mediaDevices = navigator.mediaDevices.enumerateDevices();
            mediaDevices.then(function (devices) {
                //过滤处摄像头设备
                const videDevices = devices.filter(item => item.kind === 'videoinput');
                for (var i = 0; i < videDevices.length; i++) {
                    videoDeviceIds.push(videDevices[i].deviceId);
                }
            });

            return (new function () {

                //个数
                this.count = videoDeviceIds.length;

                //获取设备
                this.getVideConstraintsDefault = function (index) {
                    if (index == undefined || index == null) index = 0; //默认前置
                    if (index < 0 || index >= videoDeviceIds.length) {
                        return null;
                    };
                    var videoDeviceId = videoDeviceIds[index]; //不同的索引切换 前置/后置摄像头
                    console.log("当前设备ID:" + videoDeviceId);
                    //获取前置摄像头
                    const videConstraints = {
                        deviceId: { exact: videoDeviceId },
                        width: width,
                        height: height
                    }
                    selectVideConstraints = videConstraints;
                    return videConstraints;
                }

            });
        }

        //开始拍摄(设备限制条件)
        function play(videoConstraints) {
            // await
            let userMedia = navigator.mediaDevices.getUserMedia({ audio: true, video: videoConstraints });
            userMedia.then(function (media) {
                videoNode.srcObject = media;
                videoNode.play();
                mediaStream = media;
                for (let index = 0; index < handleArr.length; index++) {
                    handleArr[index](mediaStream);
                }
            });
        }

        //图片转换成base64（图片地址,绘制成功返回base64）
        function imageToBase64(imgSrc, f) {
            var canvas = document.getElementById("canvas"),//获取canvas
                ctx = canvas.getContext("2d"), //对应的CanvasRenderingContext2D对象(画笔)
                img = new Image();//创建新的图片对象

            img.src = imgSrc;
            img.setAttribute("crossOrigin", 'Anonymous')
            img.onload = function () {//图片加载完，再draw 和 toDataURL
                ctx.drawImage(img, 0, 0);
                var base64 = canvas.toDataURL("image/png");
                baseData = base64;
                f(base64);
            };
        }

        //拍照保存
        function photograph(width, height) { 
            //画布
            const canvas = $("<canvas></canvas>")[0];
            const context = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            context.drawImage(videoNode, 0, 0, canvas.width, canvas.height);
            var src = canvas.toDataURL("image/png");
            canvasSrc = src;
            return canvasSrc;
        }

        //下载图片
        function download() {
            if (!canvasSrc) {
                alert("获取拍摄照片失败");
                return;
            };
            const a = $("<a></a>")[0];
            a.setAttribute('download', new Date());
            a.href = src;
            a.click();
        }

        //关闭摄像设备(默认3s后关闭)
        function closeUserMedia(timeout) {
            var video = $(_$video)[0];
            video.pause();
            video.src = "";
            mediaStream.getTracks().forEach(track => track.stop());
        }

        function Global() {

            //设备进行初始化
            function initDevice(videoHeight, videWidth) {
                changeUserMedia = (new ChangeUserMedia(videWidth, videoHeight));
            }

            this.changeUserMedia = function () {
                return {
                    count: changeUserMedia.count,
                    selectedDevice: changeUserMedia.getVideConstraintsDefault
                };
            };

            this.closeUserMedia = closeUserMedia;

            this.photograph = photograph;

            this.download = download;

            this.play = function () {
                play(selectVideConstraints);
            };

            this.getLastPhotoBase64 = function(){
                 return canvasSrc;
            }

            this.addHandle = function(func){
                if(typeof func === 'function')
                   handleArr.push(func);
            }

            /**
             * 初始化
             *  $video video对象
             *  $canvas canvas对象
             *  videoHeight video对象高度
             *  videWidth video宽度
             */
            this.init = function ($video, $canvas, videoHeight, videWidth) {
                videoNode = $($video)[0];
                _$video = $video;
                _$canvas = $canvas;
                //将原来的元素修改
                $($video).attr("height",videoHeight);
                $($video).attr("width",videWidth);
                $($video).attr("playsinline","");
                $($video).attr("muted",""); 
                initDevice(videoHeight, videWidth);
                changeUserMedia.getVideConstraintsDefault();
                //打开人脸侦测( 确保引入侦测相关js )
                userMedia.addHandle(function () { 
                    //创建一个canvas
                    var d = $("<canvas id=\"detectionCancas\" width=\""+videWidth+"\" height=\""+videoHeight+"\"></canvas>")
                     $($video).after(d);
                    //初始化人脸侦测器
                    detection.init($video, $("#detectionCancas"));
                    detection.startDetection();
                });
            };
        } 
        return new Global;
    }(jQuery))