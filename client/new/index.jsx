function previewImage(){
    var logImg = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/linkImg.log");
    logImg.open("r");
    var linkImg = logImg.read();
    logImg.close();
    return linkImg;
}