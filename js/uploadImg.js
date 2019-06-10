  function fileToBase64(){
    //var data = new FormData();
    var files = $("#upFileLoad").get(0).files;
    // if (files.length > 0) {
    //     for (var i = 0; i < files.length; i++) {
    //         data.append(i.toString(), files[i]);
    //     }
    // };
   var reader = new FileReader();
   reader.readAsDataURL(files[0]);
   reader.onload = function(){
     $("#uploadImg")[0].src = this.result; 
   } 
  }