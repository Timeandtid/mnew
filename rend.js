(function(){

var cam = [1, 0, 0, 0];
    
var sin = Math.sin;
var cos = Math.cos;

var renderTexture = (function(){
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = "blue"
    ctx.fillRect(50, 50, 300, 300);
    
    return ctx.getImageData(0, 0, 400, 400).data;
})();

var light = [Math.sqrt(0.5), Math.sqrt(0.5), 0];
var Objects = {
    nodes: [],
    faces: [],
    objects: [],
    update: function(){
        this.nodes = [];
        this.faces = [];
        for(var i = 0; i < this.objects.length; i++){
            var len = this.nodes.length;
            var ob = this.objects[i];
            var n = ob.nodes;
            var f = ob.faces;
            var plusX = ob.position[0];
            var plusY = ob.position[1];
            var plusZ = ob.position[2];
            for(var j = 0; j < n.length; j++){
                this.nodes.push([
                    n[j][0] + plusX,
                    n[j][1] + plusY,
                    n[j][2] + plusZ
                ]);
            }
            for(var j = 0; j < f.length; j++){
                var curF = f[j];
                var newF = [];
                for(var k = 0; k < curF.length; k++){
                    newF[k] = curF[k]+len;
                }
                this.faces.push(newF);
            }
        }
    }
};

function cross(a, b){
    return [
        a[1] * b[2] - a[2] * b[1], 
        a[2] * b[0] - a[0] * b[2], 
        a[0] * b[1] - a[1] * b[0]
    ];
};
function matrix(quat){
    var 
    w = quat[0],
    x = quat[1],
    y = quat[2],
    z = quat[3];
    
    return [
        [1 - 2*y*y - 2*z*z, 2*x*y - 2*z*w, 2*x*z + 2*y*w],
        [2*x*y + 2*z*w, 1 - 2*x*x - 2*z*z, 2*y*z - 2*x*w],
        [2*x*z - 2*y*w, 2*y*z + 2*x*w, 1 - 2*x*x - 2*y*y]
    ];
};
function normalize(quat){
    var d = Math.Math.sqrt(quat[0]*quat[0]+quat[1]*quat[1]+quat[2]*quat[2]+quat[3]*quat[3]);
    quat[0] /= d;
    quat[1] /= d;
    quat[2] /= d;
    quat[3] /= d;
};
function mult(v, mat){
    var a = v[0], b = v[1], c = v[2];
    var mat0 = mat[0], mat1 = mat[1], mat2 = mat[2];
    
    return [
        a * mat0[0] + b * mat1[0] + c * mat2[0],
        a * mat0[1] + b * mat1[1] + c * mat2[1],
        a * mat0[2] + b * mat1[2] + c * mat2[2]
    ];
};
function multQ(r, q){
    return [
        r[0]*q[0] - r[1]*q[1] - r[2]*q[2] - r[3]*q[3],
        r[0]*q[1] + r[1]*q[0] + r[2]*q[3] - r[3]*q[2],
        r[0]*q[2] - r[1]*q[3] + r[2]*q[0] + r[3]*q[1],
        r[0]*q[3] + r[1]*q[2] - r[2]*q[1] + r[3]*q[0],
    ];
};
function inverse(quat){
    return [quat[0], -quat[1], -quat[2], -quat[3]];
};
function slerp(q1, q2, t){
    var theta = acos(q1[0]*q2[0] + q1[1]*q2[1] + q1[2]*q2[2] + q1[3]*q2[3]);
    var sT = sin(theta);
    var wA = sin((1 - t) * theta) / sT;
    var wB = sin(t*theta) / sT;
    var q = [
        wA*q1[0] + wB*q2[0],
        wA*q1[1] + wB*q2[1],
        wA*q1[2] + wB*q2[2],
        wA*q1[3] + wB*q2[3],
    ];
    return q;
};
function render(pos, view){
    var 
    
    mat = matrix(view),
    tex = renderTexture,
    buffer = Array(240000),
    nodes = Objects.nodes,
    faces = Objects.faces,
    _abs = Math.abs,
    _min = Math.min,
    _max = Math.max,
    _sqrt = Math.sqrt,
    
    sinX = sin(view[0].a),
    cosX = cos(view[0].a),
    
    sinY = sin(view[1].a),
    cosY = cos(view[1].a), 
    
    sinZ = sin(view[2].a),
    cosZ = cos(view[2].a), 
    
    mat00 = mat[0][0],
    mat01 = mat[0][1],
    mat02 = mat[0][2],
    mat10 = mat[1][0],
    mat11 = mat[1][1],
    mat12 = mat[1][2],
    mat20 = mat[2][0],
    mat21 = mat[2][1],
    mat22 = mat[2][2],
    
    calcP = function(a, b, c){
        return [
            a * mat00 + b * mat10 + c * mat20,
            a * mat01 + b * mat11 + c * mat21,
            a * mat02 + b * mat12 + c * mat22
        ];
    },
    findNormal = function(f) {
        var f0 = nodes[f[0]];
        var f1 = nodes[f[1]];
        var f2 = nodes[f[2]];
        
        var a = [f1[0]-f0[0], f1[1]-f0[1], f1[2]-f0[2]];
        var b = [f2[0]-f0[0], f2[1]-f0[1], f2[2]-f0[2]];
        
        var vert = [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
        
        var m = _sqrt(vert[0] * vert[0] + vert[1] * vert[1] + vert[2] * vert[2]);
    
        vert[0] /= m;
        vert[1] /= m;
        vert[2] /= m;
        
        return vert;
    },
    dot = function(a, b) {
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    },
    
    posX = pos[0],
    posY = pos[1],
    posZ = pos[2], 
    
    imageData = ctx.createImageData(400, 400),
    data = imageData.data,
    
    i, f, fNormal, lightDot, lightIntensity, a, b, c, a1, a2, a3, b1, b2, b3, c1, c2, c3, totalA, minZ, minX, maxX, minY, maxY, x, y, ar1, ar2, ar3, textureIndex, index;
    
    for(i = faces.length; i--;){
        f = faces[i];
        fNormal = findNormal(f);
        lightDot = dot(fNormal, light);
        lightIntensity = lightDot * 0.5 + 0.5;
        a = nodes[f[0]];
        b = nodes[f[1]];
        c = nodes[f[2]];
        a = calcP(a[0]-posX, a[1]-posY, a[2]-posZ);
        b = calcP(b[0]-posX, b[1]-posY, b[2]-posZ);
        c = calcP(c[0]-posX, c[1]-posY, c[2]-posZ);
        a3 = (a[2]-100);
        a1 = (a[0])/_abs(a3)*500;
        a2 = (a[1])/_abs(a3)*500;
        b3 = (b[2]-100);
        b1 = (b[0])/_abs(b3)*500;
        b2 = (b[1])/_abs(b3)*500;
        c3 = (c[2]-100);
        c1 = (c[0])/_abs(c3)*500;
        c2 = (c[1])/_abs(c3)*500;
        
        totalA = (0.5 * ((b1-a1) * (c2-a2) - (c1-a1) * (b2-a2)));
        //minZ = _min(a3, b3, c3);
        
        if(totalA < 0){
            continue;
        }
        
        minX = _max(_min(a1, b1, c1) | 0, -300);
        maxX = _min(_max(a1, b1, c1), 300);
        minY = _max(_min(a2, b2, c2) | 0, -300);
        maxY = _min(_max(a2, b2, c2), 300);

        //draw each pixel
        for(x = minX; x < maxX; x ++){
            for(y = minY; y < maxY; y ++){
                
                ar1 = _abs(0.5 * ((b1-x) * (c2-y) - (c1-x) * (b2-y)) / totalA);
                ar2 = _abs(0.5 * ((x-a1) * (c2-a2) - (c1-a1) * (y-a2)) / totalA);
                ar3 = _abs(0.5 * ((b1-a1) * (y-a2) - (x-a1) * (b2-a2)) / totalA);
                
                //test to see if the coords are in the tri
                if((ar1 + ar2 + ar3) < 1.01){
                    var zD = ar1*a3 + ar2*b3 + ar3*c3;
                    
                    //calc index
                    index = 4 * (400 * y + x) + 320800;
                    
                    if(zD < buffer[index*0.25]){
                        continue;
                    }
                    
                    textureIndex = 4 * (
                        (ar2 * 400 | 0) * 400 + (ar1 * 400 | 0)
                    );
                    
                    data[index] = tex[textureIndex]*lightIntensity;
                    data[index+1] = tex[textureIndex+1]*lightIntensity;
                    data[index+2] = tex[textureIndex+2]*lightIntensity;
                    data[index+3] = 255;
                    
                    buffer[index*0.25] = zD;
                }
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};


window.Objects = Objects;
window.cross = cross;
window.matrix = matrix;
window.normalize = normalize;
window.mult = mult;
window.multQ = multQ;
window.inverse = inverse;
window.slerp = slerp;
window.render = render;


})();
