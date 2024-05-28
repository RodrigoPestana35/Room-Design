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

let objectToManipulate;

let posZ = [];
let posY = [];
let posX = [];

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
        if(objectToManipulate) {
            let id = objectToManipulate.id;
            console.log("id: "+objectToManipulate.id + " " +objectToManipulate.name);
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
                    console.log(id+ " arrow left : "+posX[id]);
                    break;
                case'ArrowRight':
                    posX[id]++;
                    break;
                default:
            }
            console.log("2: " + posX);
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
    document.getElementById("manipulation-modal").addEventListener('click', openModal);
    document.getElementById("close").addEventListener('click', closeModal);
    document.getElementById("remove-object").addEventListener('click', removeObject);
    document.getElementById("change-dimension").addEventListener('click', changeDimension);
    document.getElementById("change-texture").addEventListener('click', changeTexture);
    document.getElementById("change-rotation").addEventListener('click', changeRotation);
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

    valid = primitiveType && height && width && depth && color;

    if (valid && nPrimitivas < 10){
        switch (primitiveType) {
        case "cube":
            geometry = new THREE.BoxGeometry(width, height, depth);
            material = new THREE.MeshBasicMaterial({color: color});
            cube = new THREE.Mesh(geometry, material);
            cube.name="cube "+nPrimitivas;
            //cube.id=Id;
            console.log(cube.id);
            scene.add(cube);
            nPrimitivas++;
            posX[cube.id]=0;
            posY[cube.id]=0;
            posZ[cube.id]=0;
            break;
        case "pyramid":
            console.log("pyramid");
            geometry = new THREE.ConeGeometry(width, height, 4);
            material = new THREE.MeshBasicMaterial({color: color});
            pyramid = new THREE.Mesh(geometry, material);
            pyramid.name="pyramid "+nPrimitivas;
            //pyramid.id = Id;
            scene.add(pyramid);
            nPrimitivas++;
            posX[pyramid.id]=0;
            posY[pyramid.id]=0;
            posZ[pyramid.id]=0;
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
        let id = objectToManipulate.id;
        console.log(objectToManipulate.name + " " + posX[id]);
        objectToManipulate.position.set(posX[id], posY[id], posZ[id]);
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
        console.log("valid");
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
            objectToManipulate.material = new THREE.MeshBasicMaterial({map: loader.load(img)});
            objectToManipulate.material.needsUpdate = true;
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
        console.log("valid");
        objectToManipulate.scale.set(x, y, z);
    }
    closeModal();
}

const manipulateObject = () => {
    let objectList = document.getElementById("object-list");
    let objectName = objectList.value;
    objectToManipulate = scene.children.find(obj => obj.name == objectName);
    console.log(objectToManipulate.name+" found");
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