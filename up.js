(function(){
    
var reader = new FileReader();
upload.onchange = function(){
    reader.readAsText(this.files[0]);
    
    reader.onload = function(){
        file = String(this.result);
        
        file = file.replaceAll("\n", "\\n");

        try {
            loadAndRender(file);
        } catch (e){
            alert("Something went wrong... Check to see if your .obj file has an error.")
        }
    }
};
    
})();
