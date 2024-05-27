import * as THREE from './three.module.js';
import {PointerLockControls} from './PointerLockControls.js';
let pointsArray = [];
let texCoordsArray = [];
let ola;
let gl;
let ctm;
let modelViewMatrix;

let program;

let camera, scene, renderer, geometry, material, cube, pyramid, light, controls;

const angle = 0.02; // rotation in radians

// constants for rotating
let xAxis = 0;
let yAxis = 1;
let zAxis = 2;
let axis = xAxis;

//let cameraPosition = vec3.fromValues(0,0,0);
let speed = 0.05;   //velocidade do movimento da camera
//let viewMatrix = mat4.create();

let objectToManipulate;
let arrowY = 0;
let arrowX = 0;

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
    else{
        switch (event.key) {
            case'ArrowUp':
                arrowY ++;
                break;
            case'ArrowDown':
                arrowY --;
                break;
            case'ArrowLeft':
                arrowX --;
                break;
            case'ArrowRight':
                arrowX ++;
                break;
            default:
        }
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
    document.getElementById("manipulate-object").addEventListener('click', manipulateObject);
    //*Camera pestana TODO
    const fov = 75;
    const near = 0.1;
    const far = 100;
    const aspect = canvas.width / canvas.height;
    camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
    camera.position.x = 5;
    camera.position.y = 5;
    camera.position.z = 10;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    controls = new PointerLockControls(camera, document.body);
    scene.add(controls.getObject());

    document.addEventListener('click', function () {
        controls.lock();
    }, false);

    document.addEventListener('pointerlockchange', function () {
        if (document.pointerLockElement === document.body) {
            controls.enabled = true;
        } else {
            controls.enabled = false;
        }
    }, false);

    //** Setup room
    setupRoom();

    // *** Render ***
    render();


}

const addPrimitive = () => {
    let primitiveType = document.getElementById('primitive-type').value;
    let height = document.getElementById('primitive-height').value;
    let width = document.getElementById('primitive-width').value;
    let depth = document.getElementById('primitive-depth').value;
    let color = document.getElementById('primitive-color').value;

    let valid;
    valid = primitiveType && height && width && depth && color;

    if (valid && nPrimitivas < 10){
        switch (primitiveType) {
        case "cube":
            console.log("cube");
            geometry = new THREE.BoxGeometry(width, height, depth);
            material = new THREE.MeshBasicMaterial({color: color});
            cube = new THREE.Mesh(geometry, material);
            cube.name="cube";
            scene.add(cube);
            nPrimitivas++;
            break;
        case "pyramid":
            console.log("pyramid");
            geometry = new THREE.ConeGeometry(width, height, 4);
            material = new THREE.MeshBasicMaterial({color: color});
            pyramid = new THREE.Mesh(geometry, material);
            pyramid.name="pyramid";
            scene.add(pyramid);
            nPrimitivas++;
            break;
        default:
            return -1;
        }
    }
    updateObjectList();
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

    let valid;
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
    if (objectToManipulate !== undefined){
        console.log(objectToManipulate.name + "asdas");
        objectToManipulate.position.set(arrowX, arrowY);
    }

    if (moveCamera['w']) {
        controls.moveForward(speed);
    }
    if (moveCamera['s']) {
        controls.moveForward(-speed);
    }
    if (moveCamera['a']) {
        controls.moveRight(-speed);
    }
    if (moveCamera['d']) {
        controls.moveRight(speed);
    }
    if (moveCamera['q']) {
        camera.position.y -= speed;
    }
    if (moveCamera['r']) {
        camera.position.y += speed;
    }

    if (controls.isLocked) {
        //controls.update();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function setupRoom(){
    console.log("SETUP ROOM");
    const geometry = new THREE.PlaneGeometry(10,10);
    const material1 = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const material2 = new THREE.MeshBasicMaterial({color: 0x0000ff});
    const material3 = new THREE.MeshBasicMaterial({color: 0xffff00});

    const wall1 = new THREE.Mesh(geometry, material1);
    const wall2= new THREE.Mesh(geometry, material2);
    const wall3= new THREE.Mesh(geometry, material3);
    wall3.material.side = THREE.DoubleSide;
    wall1.rotation.set(0,0, Math.PI/2);
    wall2.rotation.set(0, Math.PI/2, 0);
    wall3.rotation.set(Math.PI/2, 0, 0);
    wall1.position.set(0,0,-5);
    wall2.position.set(-5,0,0);
    wall3.position.set(0,-5,0);
    scene.add(wall1);
    scene.add(wall2);
    scene.add(wall3)
}
const manipulateObject = () => {
    let objectList = document.getElementById("object-list");
    let objectName = objectList.value;
    objectToManipulate = scene.children.find(obj => obj.name == objectName);
    console.log(objectToManipulate.name+" found");
}

function updateObjectList(){
    let objectList = document.getElementById("object-list");
    objectList.innerHTML = "";
    objectList.value = "";
    scene.children.forEach(obj=>{
        if(obj.name !== "") {
            const option = document.createElement("option");
            option.value = obj.name;
            option.textContent = obj.name;
            objectList.appendChild(option);
        }
    })
}