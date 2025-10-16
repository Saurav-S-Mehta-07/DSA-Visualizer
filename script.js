const arrayContainer = document.getElementById('array-container');
const heapTree = document.getElementById('heap-tree');
const heapTitle = document.getElementById('heap-title');
const visualTitle = document.getElementById('visual-title');
const generateBtn = document.getElementById('generate');
const sortBtn = document.getElementById('sort');
const algorithmSelect = document.getElementById('algorithm');
const arrayLengthInput = document.getElementById('array-length');
const arrayInputField = document.getElementById('array-input');
const autoGenerateCheckbox = document.getElementById('auto-generate');
const currentArrayDiv = document.getElementById('current-array');

let array = [];

// Generate random array
function generateArray(length = 7) {
    array = Array.from({length}, () => Math.floor(Math.random() * 50) + 5);
    renderArray();
    updateCurrentArray();
    renderHeapTree();
}

// Render array bars
function renderArray(activeIndices = [], sortedIndex = null) {
    arrayContainer.innerHTML = '';
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        if (activeIndices.includes(index)) bar.classList.add('active');
        if (sortedIndex !== null && index >= sortedIndex) bar.classList.add('sorted');
        bar.style.height = `${value * 6}px`;
        arrayContainer.appendChild(bar);
    });
}

// Update array display
function updateCurrentArray() {
    currentArrayDiv.textContent = `[ ${array.join(', ')} ]`;
}

// Sleep helper
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function swap(i,j){ [array[i], array[j]]=[array[j], array[i]]; updateCurrentArray(); }

// Show only tree for heap, bars for others
function updateVisualizationDisplay() {
    if(algorithmSelect.value === 'heap'){
        heapTree.style.display='block';
        heapTitle.style.display='block';
        arrayContainer.style.display='none';
        visualTitle.style.display='none';
    } else {
        heapTree.style.display='none';
        heapTitle.style.display='none';
        arrayContainer.style.display='flex';
        visualTitle.style.display='block';
    }
}

// Bubble Sort
async function bubbleSort() {
    updateVisualizationDisplay();
    const n = array.length;
    for(let i=0;i<n-1;i++){
        for(let j=0;j<n-i-1;j++){
            renderArray([j,j+1], n-i);
            await sleep(800);
            if(array[j]>array[j+1]){
                swap(j,j+1);
                renderArray([j,j+1], n-i);
                await sleep(300);
            }
        }
    }
    renderArray();
}

// Selection Sort
async function selectionSort() {
    updateVisualizationDisplay();
    const n=array.length;
    for(let i=0;i<n;i++){
        let minIndex=i;
        for(let j=i+1;j<n;j++){
            renderArray([i,j,minIndex], i);
            await sleep(200);
            if(array[j]<array[minIndex]) minIndex=j;
        }
        swap(i,minIndex);
    }
    renderArray();
}

// Insertion Sort
async function insertionSort() {
    updateVisualizationDisplay();
    for(let i=1;i<array.length;i++){
        let key=array[i];
        let j=i-1;
        while(j>=0 && array[j]>key){
            array[j+1]=array[j];
            renderArray([j,j+1],i);
            await sleep(700);
            j--;
        }
        array[j+1]=key;
        updateCurrentArray();
    }
    renderArray();
}

// Counting Sort
async function countingSort(){
    updateVisualizationDisplay();
    const max=Math.max(...array);
    const count=Array(max+1).fill(0);
    array.forEach(n=>count[n]++);
    let index=0;
    for(let i=0;i<count.length;i++){
        while(count[i]>0){
            array[index]=i;
            renderArray([index]);
            await sleep(500);
            index++;
            count[i]--;
        }
    }
    renderArray();
}

// Heap Sort
async function heapSort(){
    updateVisualizationDisplay();
    const n=array.length;
    async function heapify(n,i){
        let largest=i, l=2*i+1, r=2*i+2;
        if(l<n && array[l]>array[largest]) largest=l;
        if(r<n && array[r]>array[largest]) largest=r;

        renderHeapTree(i,largest);
        await sleep(500);

        if(largest!==i){
            swap(i,largest);
            renderHeapTree(i,largest);
            await sleep(500);
            await heapify(n,largest);
        }
    }

    for(let i=Math.floor(n/2)-1;i>=0;i--) await heapify(n,i);
    for(let i=n-1;i>0;i--){
        swap(0,i);
        renderHeapTree(0,i);
        await sleep(500);
        await heapify(i,0);
    }
    renderHeapTree();
}

// Render Heap Tree
function renderHeapTree(active1=-1, active2=-1){
    heapTree.innerHTML='';
    const levels=Math.ceil(Math.log2(array.length+1));
    let index=0;
    for(let i=0;i<levels;i++){
        const levelDiv=document.createElement('div');
        levelDiv.classList.add('heap-level');
        let nodesInLevel=Math.pow(2,i);
        for(let j=0;j<nodesInLevel && index<array.length;j++){
            const nodeDiv=document.createElement('div');
            nodeDiv.classList.add('heap-node');
            nodeDiv.textContent=array[index];
            if(index===active1 || index===active2) nodeDiv.classList.add('active');
            levelDiv.appendChild(nodeDiv);
            index++;
        }
        heapTree.appendChild(levelDiv);
    }
}

// Event Listeners

// Algorithm change
algorithmSelect.addEventListener('change', updateVisualizationDisplay);

// Generate array
generateBtn.addEventListener('click', ()=>{
    const userArray=arrayInputField.value.trim();
    const length=parseInt(arrayLengthInput.value)||7;
    if(!autoGenerateCheckbox.checked && userArray){
        const parsed=userArray.split(',').map(x=>parseInt(x.trim()));
        if(parsed.some(isNaN)){ alert('Invalid input!'); return; }
        array=parsed;
    } else generateArray(length);
    renderArray();
    updateCurrentArray();
    renderHeapTree();
});

// Start sorting
sortBtn.addEventListener('click', async ()=>{
    switch(algorithmSelect.value){
        case 'bubble': await bubbleSort(); break;
        case 'selection': await selectionSort(); break;
        case 'insertion': await insertionSort(); break;
        case 'heap': await heapSort(); break;
        case 'counting': await countingSort(); break;
    }
});

// Initialize
generateArray(7);
updateVisualizationDisplay();
