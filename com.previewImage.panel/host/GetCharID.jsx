var ref = new ActionReference();
ref.putEnumerated(charIDToTypeID("Path"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
var desRes = executeActionGet(ref);
var logPath = new File("~/Desktop/logPathItem.txt");
logPath.open("w");
desRes.getKey(0);
for(var i=0; i<200; i++){
    try{
        var text = typeIDToCharID(desRes.getKey(i) );
        text =(text == "")? null:text;
        logPath.writeln( text);
    }
    else{
        break;
    }
}
logPath.close();


//---------Get COlor
function getColorFillValue(layerColor){
    //app.activeDocument.activeLayer = layerColor;
    var ref = new ActionReference();
    //ref.putName( stringIDToTypeID("contentLayer"), layerColor.name);
    ref.putEnumerated(stringIDToTypeID("contentLayer"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
    var desGet = executeActionGet(ref);
    var desAdjs = desGet.getList(charIDToTypeID("Adjs"));
    var colorFill = desAdjs.getObjectValue(0) ;
    var rgbColor =  colorFill.getObjectValue(colorFill.getKey(0) ) ;
    //---------
    var solidColor = new SolidColor();
        var myRGB = new RGBColor();
        myRGB.red = rgbColor.getDouble( rgbColor.getKey(0));
        myRGB.green = rgbColor.getDouble( rgbColor.getKey(1));
        myRGB.blue = rgbColor.getDouble( rgbColor.getKey(2));
    solidColor.rgb = myRGB;
    return solidColor;
}