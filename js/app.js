import * as THREE from './three.module.js';
import {PointerLockControls} from './PointerLockControls.js';
import {OBJLoader} from "./OBJLoader.js";
// *** Global variables ***
let camera, scene, renderer, geometry, material, cube, pyramid, light, controls;

// *** Camera movement speed ***
let speed = 0.05;   //velocidade do movimento da camera

// *** Object to manipulate ***
let objectToManipulate;
let posZ = [];
let posY = [];
let posX = [];

// *** Camera movement list ***
let moveCamera = {
    'w': false,
    's': false,
    'a': false,
    'd': false,
    'q': false,
    'r': false
};

let nPrimitivas = 0;
let nModels = 0;

window.addEventListener('keydown', (event) => {
    if (event.key in moveCamera) {
        moveCamera[event.key] = true;
    }
    else{
        if(objectToManipulate) {
            let id = objectToManipulate.id;
            switch (event.key) {
                case'PageUp':
                    posY[id]++;
                    break;
                case'PageDown':
                    posY[id]--;
                    break;
                case'ArrowUp':
                    posZ[id]++;
                    break;
                case'ArrowDown':
                    posZ[id]--;
                    break;
                case'ArrowLeft':
                    posX[id]--;
                    break;
                case'ArrowRight':
                    posX[id]++;
                    break;
                default:
            }
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

    //Add listeners to select to make relevant options appear
    document.getElementById('primitive-type').addEventListener('change', function(){
        if (document.getElementById('primitive-type').value === 'cube'){
            document.getElementById('primitive-depth').style.display = 'block';
        } else {
            document.getElementById('primitive-depth').style.display = 'none';
        }
    })

    document.getElementById('primitive-type').addEventListener('change', function(){
        if (document.getElementById('primitive-type').value === 'cube'){
            document.getElementById('primitive-depth').style.display = 'block';
        } else {
            document.getElementById('primitive-depth').style.display = 'none';
        }
    })
    document.getElementById('light-type').addEventListener('change', function(){
        if (document.getElementById('light-type').value === 'ambient'){
            document.getElementById('light-position-x').style.display = 'none';
            document.getElementById('light-position-y').style.display = 'none';
            document.getElementById('light-position-z').style.display = 'none';
            document.getElementById('light-direction-x').style.display = 'none';
            document.getElementById('light-direction-y').style.display = 'none';
            document.getElementById('light-direction-z').style.display = 'none';
        } else if (document.getElementById('light-type').value === 'directional'){
            document.getElementById('light-position-x').style.display = 'block';
            document.getElementById('light-position-y').style.display = 'block';
            document.getElementById('light-position-z').style.display = 'block';
            document.getElementById('light-direction-x').style.display = 'block';
            document.getElementById('light-direction-y').style.display = 'block';
            document.getElementById('light-direction-z').style.display = 'block';
        } else {
            document.getElementById('light-position-x').style.display = 'block';
            document.getElementById('light-position-y').style.display = 'block';
            document.getElementById('light-position-z').style.display = 'block';
            document.getElementById('light-direction-x').style.display = 'none';
            document.getElementById('light-direction-y').style.display = 'none';
            document.getElementById('light-direction-z').style.display = 'none';
        }
    })

    //Get button listeners
    document.getElementById('adicionar-primitiva').addEventListener('click', addPrimitive);
    document.getElementById("add-light").addEventListener('click', addLight);
    document.getElementById("manipulate-object").addEventListener('click', manipulateObject);
    document.getElementById("add-model").addEventListener('click', addModel);
    document.getElementById("manipulation-modal").addEventListener('click', openModal);
    document.getElementById("close").addEventListener('click', closeModal);
    document.getElementById("remove-object").addEventListener('click', removeObject);
    document.getElementById("change-dimension").addEventListener('click', changeDimension);
    document.getElementById("change-texture").addEventListener('click', changeTexture);
    document.getElementById("change-rotation").addEventListener('click', changeRotation);

    //*Camera
    const fov = 75;
    const near = 0.1;
    const far = 100;
    const aspect = canvas.width / canvas.height;
    camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
    camera.position.x = 5;
    camera.position.y = 5;
    camera.position.z = 10;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //** PointerLockControls
    controls = new PointerLockControls(camera, document.body);
    scene.add(controls.getObject());

    //** Add event listeners to the canvas
    canvas.addEventListener('click', function () {
        controls.lock();
        console.log("click");
    }, false);

    //** Add event listeners to the document to check if the pointer is locked
    document.addEventListener('pointerlockchange', function () {
        if (document.pointerLockElement === document.body) {
            controls.enabled = true;
            console.log("Pointer locked");
        } else {
            controls.enabled = false;
            console.log("Pointer unlocked");
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
    let x = document.getElementById('prim-position-x').value;
    let y = document.getElementById('prim-position-y').value;
    let z = document.getElementById('prim-position-z').value;
    let rotationx = document.getElementById('prim-direction-x').value;
    let rotationy = document.getElementById('prim-direction-y').value;
    let rotationz = document.getElementById('prim-direction-z').value;
    let materialType = document.querySelector('input[name="option-prim"]:checked').value;

    let valid;
    valid = primitiveType && height && width && depth && materialType;

    if (valid && nPrimitivas < 10 && (x,y,z >= -5) && (x,y,z <= 5)){
        switch (primitiveType) {
        case "cube":
            geometry = new THREE.BoxGeometry(width, height, depth);
            if (materialType == "color") {
                material = new THREE.MeshPhongMaterial({color: color});
                cube = new THREE.Mesh(geometry, material);
                cube.position.set(x,y,z);
                cube.rotation.set(rotationx,rotationy,rotationz);
                cube.name="cube "+nPrimitivas;
                scene.add(cube);
                nPrimitivas++;
                posX[cube.id]=x;
                posY[cube.id]=y;
                posZ[cube.id]=z;
            }  else if (materialType == "tex") {
                let input = document.getElementById("prim-texture");
                if(input.files.length==0){
                        console.log("Erro Textura");
                } else {
                    let file = input.files[0];
                    let reader = new FileReader();
                    reader.onload = function(event) {
                        let img = event.target.result;
                        const loader = new THREE.TextureLoader();

                        loader.load(img, function() {
                            material = new THREE.MeshPhongMaterial({ map: loader.load(img)});
                            cube = new THREE.Mesh(geometry, material);
                            cube.position.set(x,y,z);
                            cube.rotation.set(rotationx,rotationy,rotationz);
                            cube.name="cube "+nPrimitivas;
                            scene.add(cube);
                            nPrimitivas++;
                            posX[cube.id]=x;
                            posY[cube.id]=y;
                            posZ[cube.id]=z;
                        });

                        loader.onerror = function(event) {
                            console.error("An error occurred reading the file:", event);
                        };
                    };
                    reader.readAsDataURL(file);
                }
            }
            break;
        case "pyramid":
            geometry = new THREE.ConeGeometry(width, height, 4);
            if (materialType === "color") {
                material = new THREE.MeshPhongMaterial({color: color});
                pyramid = new THREE.Mesh(geometry, material);
                pyramid.position.set(x,y,z);
                pyramid.rotation.set(rotationx,rotationy,rotationz);
                pyramid.name="pyramid "+nPrimitivas;
                scene.add(pyramid);
                nPrimitivas++;
                posX[pyramid.id]=x;
                posY[pyramid.id]=y;
                posZ[pyramid.id]=z;
            }  else if (materialType == "tex") {
                let input = document.getElementById("prim-texture");
                if(input.files.length==0){
                    console.log("Erro Textura");
                } else {
                    let file = input.files[0];
                    let reader = new FileReader();
                    reader.onload = function(event) {
                        let img = event.target.result;
                        const loader = new THREE.TextureLoader();

                        loader.load(img, function() {
                            material = new THREE.MeshPhongMaterial({ map: loader.load(img)});
                            pyramid = new THREE.Mesh(geometry, material);
                            pyramid.position.set(x,y,z);
                            pyramid.rotation.set(rotationx,rotationy,rotationz);
                            pyramid.name="pyramid "+nPrimitivas;
                            scene.add(pyramid);
                            nPrimitivas++;
                            posX[pyramid.id]=x;
                            posY[pyramid.id]=y;
                            posZ[pyramid.id]=z;
                        });

                        loader.onerror = function(event) {
                            console.error("An error occurred reading the file:", event);
                        };
                    };
                    reader.readAsDataURL(file);
                };
            }
            break;
        default:
            return -1;
        }
    }
    updateObjectList();
}

const addLight = () => {
    let x = document.getElementById("light-position-x").value;
    let y = document.getElementById("light-position-y").value;
    let z = document.getElementById("light-position-z").value;
    let directionx = document.getElementById("light-direction-x").value;
    let directiony = document.getElementById("light-direction-y").value;
    let directionz = document.getElementById("light-direction-z").value;
    let color = document.getElementById("light-color").value;
    let lighttype = document.getElementById("light-type").value;
    let intensity = document.getElementById("light-intensity").value;


    switch(lighttype){
        case "ambient":
            light = new THREE.AmbientLight(color, intensity);
            scene.add(light);
            break;
        case "directional":
            light = new THREE.DirectionalLight(color, intensity);
            light.castShadow = true;
            light.position.set(x,y,z);
            light.target.position.set(directionx,directiony,directionz);
            var lightHelper = new THREE.DirectionalLightHelper(light,0.2,0x000000);
            scene.add(lightHelper);
            scene.add(light.target);
            scene.add(light);
            break;
        case "point":
            light = new THREE.PointLight(color, intensity, 20, 0.1);
            light.castShadow = true;
            light.position.set(x,y,z);
            var lightHelper = new THREE.PointLightHelper(light,0.2,0x000000);
            scene.add(lightHelper);
            scene.add(light);
            break;
    }
}

function addModel(){
    console.log("Add model");
    if (nModels >= 5){
        console.log("Maximo de modelos atingido");
        return;
    }
    let files = document.getElementById("model-file").files;
    if (files.length === 0){
        console.log("Nenhum arquivo selecionado");
        return;
    }
    let file = files[0];
    let reader = new FileReader();

    reader.onload = function(event) {
        let contents = event.target.result;

        let positionX = parseFloat(document.getElementById("model-position-x").value) || 0;
        let positionY = parseFloat(document.getElementById("model-position-y").value) || 0;
        let positionZ = parseFloat(document.getElementById("model-position-z").value) || 0;
        let rotationX = parseFloat(document.getElementById("model-direction-x").value) || 0;
        let rotationY = parseFloat(document.getElementById("model-direction-y").value) || 0;
        let rotationZ = parseFloat(document.getElementById("model-direction-z").value) || 0;
        let scale = parseFloat(document.getElementById("model-scale").value) || 1;
        let materialType = document.querySelector('input[name="material"]:checked').value;
        let colorInput = document.getElementById("model-color");
        let textureInput = document.getElementById("model-texture");

        if((positionX, positionY, positionZ) <=-5 || (positionX, positionY, positionZ) >= 5){
            console.log("Posição inválida");
            return;
        }

        const loader = new OBJLoader();

        let object = loader.parse(contents);
        let id = object.id
        object.name = "model" + nModels;
        object.position.set(positionX, positionY, positionZ);
        object.rotation.set(rotationX, rotationY, rotationZ);
        object.scale.set(scale, scale, scale);
        if (materialType === "color") {
            let color = new THREE.Color(colorInput.value);
            object.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material.color = color;
                }
            });
        }
        else if (materialType === "texture" && textureInput.files.length > 0) {
            let textureFile = textureInput.files[0];
            let textureReader = new FileReader();

            textureReader.onload = function(textureEvent) {
                let texture = new THREE.TextureLoader().load(textureEvent.target.result);
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshBasicMaterial({ map: texture });
                    }
                });
            };

            textureReader.readAsDataURL(textureFile);
        }
        scene.add(object);
        nModels++;
        updateObjectList();
        posX[id] = positionX;
        posY[id] = positionY;
        posZ[id] = positionZ;
    };

    reader.onerror = function(event) {
        console.error("An error occurred reading the file:", event);
    };

    reader.readAsText(file);

}

const render = () => {
    if (objectToManipulate !== undefined){
        let id = objectToManipulate.id;
        objectToManipulate.position.set(posX[id], posY[id], posZ[id]);
    }

    // Camera movement
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

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function setupRoom(){
    console.log("SETUP ROOM");
    const geometry = new THREE.PlaneGeometry(10,10);
    const material1 = new THREE.MeshPhongMaterial({color: 0xffffff});
    const material2 = new THREE.MeshPhongMaterial({color: 0xffffff});
    const material3 = new THREE.MeshPhongMaterial({color: 0xd2b48c});
    const wall1 = new THREE.Mesh(geometry, material1);
    const wall2= new THREE.Mesh(geometry, material2);
    const wall3= new THREE.Mesh(geometry, material3);

    const pl = new THREE.PointLight(0xffffff, 2, 20,0.1);
    pl.castShadow = true;
    pl.position.set(0,5,0);
    const plHelper = new THREE.PointLightHelper(pl,0.2, 0x000000);
    scene.add(pl);
    scene.add(plHelper);

    const al = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(al);

    wall1.material.side = THREE.DoubleSide;
    wall2.material.side = THREE.DoubleSide;
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

const removeObject = () => {
    scene.remove(objectToManipulate);
    objectToManipulate = undefined;
    closeModal();
    updateObjectList();
}

const changeRotation = () =>{
    let x = document.getElementById('new-rotation-x').value;
    let y = document.getElementById('new-rotation-y').value;
    let z = document.getElementById('new-rotation-z').value;
    if(x && y && z){
        objectToManipulate.rotation.x=x;
        objectToManipulate.rotation.y=y;
        objectToManipulate.rotation.z=z;
    }
    closeModal();
}

const changeTexture = () =>{
    let input = document.getElementById("input-texture");
    let error = document.getElementById("error");
    error.innerText="";
    if(input.files.length==0){
        error.innerText = "Nenhuma Textura Selecionada";
    } else {
        let file = input.files[0];
        let reader = new FileReader();

        reader.onload = function(event) {
            let img = event.target.result;
            const loader = new THREE.TextureLoader();

            loader.load(img, function() {
                if (objectToManipulate) {
                    objectToManipulate.traverse(function(child) {
                        if (child.isMesh) {
                            child.material = new THREE.MeshBasicMaterial({ map: loader.load(img)});
                            child.material.needsUpdate = true;
                        }
                    });
                }
            });
            loader.onerror = function(event) {
                console.error("An error occurred reading the file:", event);
            };
        };

       reader.readAsDataURL(file);
    }
    closeModal();
}

const changeDimension = () => {
    let x = document.getElementById('new-x').value;
    let y = document.getElementById('new-y').value;
    let z = document.getElementById('new-z').value;
    if(x && y && z){
        objectToManipulate.scale.set(x, y, z);
    }
    closeModal();
}

const manipulateObject = () => {
    let objectList = document.getElementById("object-list");
    let objectName = objectList.value;
    if(objectName) {
        objectToManipulate = scene.children.find(obj =>  obj.name === objectName && (obj.type === 'Mesh' || obj.type === 'Group'));
        //objectToManipulate = scene.children.find(obj =>  obj.name === objectName);
    }
    console.log(objectToManipulate);

}
const openModal = () => {
    let input = document.getElementById("input-texture");
    let objectControls = document.querySelector(".object-controls");
    let modal = document.getElementById("modal");
    let error = document.getElementById("error");
    error.innerText="";
    input.value = "";
    if(objectToManipulate !== undefined){
        modal.style.display = "block";
    }
    else {
        let p = document.createElement("p");
        p.textContent = "Nenhum objecto selecionado";
        objectControls.appendChild(p);
    }
}

const closeModal = () => {
    document.getElementById("input-texture").value="";
    document.getElementById("modal").style.display = "none";
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