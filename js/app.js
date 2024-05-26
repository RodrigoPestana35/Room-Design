let pointsArray = [];
let texCoordsArray = [];

let gl;
let ctm;
let modelViewMatrix;

let program;

const angle = 0.02; // rotation in radians

// constants for rotating
let xAxis = 0;
let yAxis = 1;
let zAxis = 2;
let axis = xAxis;

//let cameraPosition = vec3.fromValues(0,0,0);
let speed = 0.05;   //velocidade do movimento da camera
let viewMatrix = mat4.create();

let moveCamera = {
    'w': false,
    's': false,
    'a': false,
    'd': false,
    'q': false,
    'r': false
};

let nPrimitivas = 0;

window.addEventListener('keydown', (event) => {
    if (event.key in moveCamera) {
        moveCamera[event.key] = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key in moveCamera) {
        moveCamera[event.key] = false;
    }
});


window.onload = function () {
    init();
}

function init() {

    // *** Get canvas ***
    const canvas = document.getElementById('gl-canvas');
    //** Setup Renderer
    renderer = new THREE.WebGLRenderer({canvas});
    renderer.setClearColor(0xffffff);

    //** Create a scene
    scene = new THREE.Scene();

    //Get button listeners
    document.getElementById('adicionar-primitiva').addEventListener('click', addPrimitive);
    document.getElementById("add-light").addEventListener('click', addLight);
    //*Camera pestana TODO
    const fov = 75;
    const near = 0.1;
    const far = 5;
    const aspect = canvas.width / canvas.height;
    camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
    camera.position.z = 3;

    // *** Render ***
    render();

}

const addPrimitive = () => {
    let primitiveType = document.getElementById('primitive-type').value;
    let height = document.getElementById('primitive-height').value;
    let width = document.getElementById('primitive-width').value;
    let depth = document.getElementById('primitive-depth').value;
    let color = document.getElementById('primitive-color').value;

    valid = primitiveType && height && width && depth && color;

    if (valid && nPrimitivas < 10){
        switch (primitiveType) {
        case "cube":
            geometry = new THREE.BoxGeometry(width, height, depth);
            material = new THREE.MeshBasicMaterial({color: color});
            cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            nPrimitivas++;
            break;
        case "pyramid":
            geometry = new THREE.ConeGeometry(width, height, 4);
            material = new THREE.MeshBasicMaterial({color: color});
            pyramid = new THREE.Mesh(geometry, material);
            scene.add(pyramid);
            nPrimitivas++;
            break;
        default:
            return -1;
        }
    }
}

const addLight = () => {
    //TODO
    let x = document.getElementById("light-position-x").value;
    let y = document.getElementById("light-position-y").value;
    let z = document.getElementById("light-position-z").value;
    let directionx = document.getElementById("light-direction-x").value;
    let directiony = document.getElementById("light-direction-y").value;
    let directionz = document.getElementById("light-direction-z").value;
    let color = document.getElementById("light-color").value;

    valid = x && y && z && directionx && directiony && directionz && color;

    if(valid){
        light = new THREE.DirectionalLight(color, 1);
        light.position.set(x,y,z);
        light.target.position.set(directionx,directiony,directionz);
        scene.add(light.target);
        scene.add(light);
        console.log("aldka");
    }
}

const render = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
