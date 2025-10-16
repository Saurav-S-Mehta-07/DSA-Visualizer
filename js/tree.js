const treeContainer = document.getElementById('tree-container');
const generateTreeBtn = document.getElementById('generate-tree');
const treeSizeInput = document.getElementById('tree-size');
const currentArrayDiv = document.getElementById('current-array');

const preorderBtn = document.getElementById('preorder-btn');
const inorderBtn = document.getElementById('inorder-btn');
const postorderBtn = document.getElementById('postorder-btn');

let treeArray = [];

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

function generateTree(size=7){
    treeArray = Array.from({length:size}, ()=>Math.floor(Math.random()*50)+1);
    updateCurrentArray();
    renderTree();
}

function updateCurrentArray(){
    currentArrayDiv.textContent = `[ ${treeArray.join(', ')} ]`;
}

function renderTree(activeIndex=-1, visitedIndices=[]){
    treeContainer.innerHTML='';
    const containerWidth = treeContainer.offsetWidth;
    const levels = Math.ceil(Math.log2(treeArray.length+1));
    let positions = [];

    for(let i=0;i<treeArray.length;i++){
        const level = Math.floor(Math.log2(i+1));
        const indexInLevel = i - (Math.pow(2, level)-1);
        const nodesInLevel = Math.pow(2, level);

        const x = ((indexInLevel + 0.5)/nodesInLevel) * containerWidth - 20;
        const y = level * 80 + 20;

        positions.push({x,y});

        const nodeDiv = document.createElement('div');
        nodeDiv.classList.add('tree-node');
        nodeDiv.textContent = treeArray[i];
        if(i===activeIndex) nodeDiv.classList.add('active');
        if(visitedIndices.includes(i)) nodeDiv.classList.add('visited');

        nodeDiv.style.left = x + 'px';
        nodeDiv.style.top = y + 'px';
        treeContainer.appendChild(nodeDiv);
    }

    for(let i=0;i<treeArray.length;i++){
        const leftChild = 2*i + 1;
        const rightChild = 2*i + 2;

        if(leftChild < treeArray.length){
            drawLine(positions[i], positions[leftChild]);
        }
        if(rightChild < treeArray.length){
            drawLine(positions[i], positions[rightChild]);
        }
    }
}

function drawLine(parentPos, childPos){
    const line = document.createElement('div');
    line.classList.add('tree-line');

    const x1 = parentPos.x + 20;
    const y1 = parentPos.y + 20;
    const x2 = childPos.x + 20;
    const y2 = childPos.y + 20;

    const length = Math.hypot(x2-x1, y2-y1);
    const angle = Math.atan2(y2-y1, x2-x1) * (180/Math.PI);

    line.style.width = length + 'px';
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = x1 + 'px';
    line.style.top = y1 + 'px';

    treeContainer.appendChild(line);
}

async function preorderTraversal(index=0, visited=[]){
    if(index>=treeArray.length) return;
    visited.push(index);
    renderTree(index, visited);
    await sleep(500);
    await preorderTraversal(2*index+1, visited);
    await preorderTraversal(2*index+2, visited);
}

async function inorderTraversal(index=0, visited=[]){
    if(index>=treeArray.length) return;
    await inorderTraversal(2*index+1, visited);
    visited.push(index);
    renderTree(index, visited);
    await sleep(500);
    await inorderTraversal(2*index+2, visited);
}

async function postorderTraversal(index=0, visited=[]){
    if(index>=treeArray.length) return;
    await postorderTraversal(2*index+1, visited);
    await postorderTraversal(2*index+2, visited);
    visited.push(index);
    renderTree(index, visited);
    await sleep(500);
}

generateTreeBtn.addEventListener('click', ()=>{
    const size = parseInt(treeSizeInput.value) || 7;
    generateTree(size);
});

preorderBtn.addEventListener('click', ()=>preorderTraversal());
inorderBtn.addEventListener('click', ()=>inorderTraversal());
postorderBtn.addEventListener('click', ()=>postorderTraversal());

generateTree(parseInt(treeSizeInput.value));
