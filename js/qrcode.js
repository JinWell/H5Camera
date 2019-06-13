 qrCode = (function ($) {

     var qrcode = null;
     let _h = 256;
     let _w = 256;
     let _$id = null;

     function Global() {
         this.init = function ($id, h, w) {
             _h = h;
             _w = w;
             _$id = $id;
         }

         this.qrCode = function (content, f) {
             qrcode = new QRCode($(_$id)[0], {
                 text: content,
                 width: _w,
                 height: _h,
                 colorDark: '#000000',
                 colorLight: '#ffffff',
                 correctLevel: QRCode.CorrectLevel.H
             });
             setTimeout(() => {
                 var base64 = $("img:eq(0)", _$id).attr('src');
                 f(base64)
             },300);
         }

         this.makeCode = function (newContent) {
             qrcode.makeCode(newContent);
         }

         this.distinguishQRCode = function (base64, f) {
            qrcode.decode(base64);
            qrcode.callback = f;
         }
     }
     return new Global;
 }(jQuery))