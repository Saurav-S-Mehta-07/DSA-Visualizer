const treeContainer = document.getElementById('tree-container');
const generateTreeBtn = document.getElementById('generate-tree');
const treeSizeInput = document.getElementById('tree-size');
const currentArrayDiv = document.getElementById('current-array');

const preorderBtn = document.getElementById('preorder-btn');
const inorderBtn = document.getElementById('inorder-btn');
const postorderBtn = document.getElementById('postorder-btn');
const levelorderBtn = document.getElementById('levelorder-btn');

const timeComplexity = document.getElementById('tc');
const spaceComplexity = document.getElementById('sc');
const pseudoDiv = document.querySelector('.pseudo-code');

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

async function levelOrderTraversal() {
    if(treeArray.length === 0) return;
    const queue = [0]; 
    const visited = [];

    while(queue.length > 0){
        const index = queue.shift();
        if(index >= treeArray.length) continue;
        visited.push(index);
        renderTree(index, visited);
        await sleep(500);
        const leftChild = 2*index + 1;
        const rightChild = 2*index + 2;
        if(leftChild < treeArray.length) queue.push(leftChild);
        if(rightChild < treeArray.length) queue.push(rightChild);
    }
}

generateTreeBtn.addEventListener('click', ()=>{
    const size = parseInt(treeSizeInput.value) || 7;
    generateTree(size);
});

preorderBtn.addEventListener('click', () => {
    preorderTraversal();
    timeComplexity.innerText = "Time Complexity: O(n)";
    spaceComplexity.innerText = "Space Complexity: O(h)"; 
    pseudoDiv.innerHTML = `
        <h2>Preorder Traversal (Pseudo-code)</h2>
        <h3>
            function preorder(node) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;if node == null <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return <br>
            &nbsp;&nbsp;&nbsp;&nbsp;visit(node) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;preorder(node.left) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;preorder(node.right)
        </h3>
    `;
});

inorderBtn.addEventListener('click', () => {
    inorderTraversal();
    timeComplexity.innerText = "Time Complexity: O(n)";
    spaceComplexity.innerText = "Space Complexity: O(h)"; 
    pseudoDiv.innerHTML = `
        <h2>Inorder Traversal (Pseudo-code)</h2>
        <h3>
            function inorder(node) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;if node == null <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return <br>
            &nbsp;&nbsp;&nbsp;&nbsp;inorder(node.left) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;visit(node) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;inorder(node.right)
        </h3>
    `;
});

postorderBtn.addEventListener('click', () => {
    postorderTraversal();
    timeComplexity.innerText = "Time Complexity: O(n)";
    spaceComplexity.innerText = "Space Complexity: O(h)"; 
    pseudoDiv.innerHTML = `
        <h2>Postorder Traversal (Pseudo-code)</h2>
        <h3>
            function postorder(node) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;if node == null <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return <br>
            &nbsp;&nbsp;&nbsp;&nbsp;postorder(node.left) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;postorder(node.right) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;visit(node)
        </h3>
    `;
});


async function levelOrderTraversal() {
    if(treeArray.length === 0) return;
    const queue = [0]; 
    const visited = [];

    while(queue.length > 0){
        const index = queue.shift();
        if(index >= treeArray.length) continue;
        visited.push(index);
        renderTree(index, visited);
        await sleep(500);
        const leftChild = 2*index + 1;
        const rightChild = 2*index + 2;
        if(leftChild < treeArray.length) queue.push(leftChild);
        if(rightChild < treeArray.length) queue.push(rightChild);
    }
}

levelorderBtn.addEventListener('click', () => {
    levelOrderTraversal();
    timeComplexity.innerText = "Time Complexity: O(n)";
    spaceComplexity.innerText = "Space Complexity: O(n)"; 
    pseudoDiv.innerHTML = `
        <h2>Level Order Traversal (Pseudo-code)</h2>
        <h3>
            function levelOrder(root) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;if root == null <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return <br>
            &nbsp;&nbsp;&nbsp;&nbsp;queue = [root] <br>
            &nbsp;&nbsp;&nbsp;&nbsp;while queue is not empty <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;node = queue.pop() <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;visit(node) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if node.left != null queue.push(node.left) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if node.right != null queue.push(node.right)
        </h3>
    `;
});



generateTree(parseInt(treeSizeInput.value));
