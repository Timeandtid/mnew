function loadAndRender(file){
    var model = {
        position: [0, 0, 0], 
        nodes: [], 
        faces: []
    };
    
    Objects.objects = [model];
    Objects.update();
    
    //var offset = [0, 0, 0];
    var lines = file.split("\\n");
    
    var curLoad = 0;
    var nIndex = 0;
    
    var minX, maxX, minY, maxY, minZ, maxZ;
    
    var q = [5, (1)/100, (-2)/100, 0];
    
    var mag = Math.sqrt(q[0]*q[0]+q[1]*q[1]+q[2]*q[2]+q[3]*q[3]);
    
    q[0] /= mag;
    q[1] /= mag;
    q[2] /= mag;
    q[3] /= mag;
    
    var m = matrix(q);
    
    var parseNode = function(line){
        return line.slice(2).split(" ").map(function(a, i){
            return +a+100;
        });
    };
    var parseFace = function(line){
        return line.slice(2).split(" ").map(function(a){
            return a.split("/")[0]-1;
        });
    };
    
    var animationId = window.parent.animationLoopId + 1 || 1;
    window.parent.animationLoopId = animationId;
    
    var draw = function() {
        if(curLoad < lines.length){
            var next = Math.min(curLoad + 100, lines.length);
            
            while(curLoad < next){
                var line = lines[curLoad];
                var vMatch = line.match(/v .*/);
                var fMatch = line.match(/f .*/);
                
                if(vMatch){
                    var node = parseNode(String(vMatch));
                    model.nodes.push(node);
                    
                    minX = minX < node[0] ? minX : node[0];
                    minY = minY < node[1] ? minY : node[1];
                    minZ = minZ < node[2] ? minZ : node[2];
                    
                    maxX = maxX > node[0] ? maxX : node[0];
                    maxY = maxY > node[1] ? maxY : node[1];
                    maxZ = maxZ > node[2] ? maxZ : node[2];
                }else if(fMatch){
                    var face = parseFace(String(fMatch));
                    model.faces.push(face);
                }
                
                curLoad ++;
            }
        }else if(nIndex < model.nodes.length){
            var next = Math.min(curLoad + 100, model.nodes.length);

            while(nIndex < next){
                var node = model.nodes[nIndex];
                
                node[0] -= (minX + maxX)/2
                node[1] -= (maxY + minY)/2;
                node[2] -= (maxZ + minZ)/2;
                
                node[0] *= 400 / (maxX - minX);
                node[1] *= 400 / (maxX - minX)
                node[2] *= 400 / (maxX - minX);

                nIndex ++;
            }
        }else{
            for(var i = 0; i < model.nodes.length; i++){
                model.nodes[i] = mult(model.nodes[i], m);
            }
            
            Objects.update();
            render([0, 0, 800], [0, 0, 0, 1]);
        }
        
        if(animationId === window.parent.animationLoopId){
            window.requestAnimationFrame(draw);
        }
    };
    
    
    draw();
};

loadAndRender(file.text);
