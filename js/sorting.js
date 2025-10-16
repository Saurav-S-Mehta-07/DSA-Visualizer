const arrayContainer = document.getElementById('array-container');
const heapTree = document.getElementById('heap-tree');
const heapTitle = document.getElementById('heap-title');
const visualTitle = document.getElementById('visual-title');
const generateBtn = document.getElementById('generate');
const sortBtn = document.getElementById('sort');
const algorithmSelect = document.getElementById('algorithm');
const arrayLengthInput = document.getElementById('array-length');
const arrayInputField = document.getElementById('array-input');
const currentArrayDiv = document.getElementById('current-array');

let array = [];

function generateArray(length = 7) {
    array = Array.from({ length }, () => Math.floor(Math.random() * 50) + 5);
    renderArray();
    updateCurrentArray();
    renderHeapTree();
}

function renderArray(activeIndices = [], sortedIndex = null) {
    arrayContainer.innerHTML = '';
    array.forEach((value, index) => {
        const barContainer = document.createElement('div');
        barContainer.style.display = 'flex';
        barContainer.style.flexDirection = 'column';
        barContainer.style.alignItems = 'center';

        const numberDiv = document.createElement('div');
        numberDiv.textContent = value;
        numberDiv.style.marginBottom = '4px';
        numberDiv.style.fontSize = '14px';
        numberDiv.style.fontWeight = 'bold';
        numberDiv.style.color = '#333';

        const bar = document.createElement('div');
        bar.classList.add('bar');
        if (activeIndices.includes(index)) bar.classList.add('active');
        if (sortedIndex !== null && index >= sortedIndex) bar.classList.add('sorted');
        bar.style.height = `${value * 6}px`;

        barContainer.appendChild(numberDiv);
        barContainer.appendChild(bar);
        arrayContainer.appendChild(barContainer);
    });
}

function updateCurrentArray() {
    currentArrayDiv.textContent = `[ ${array.join(', ')} ]`;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function swap(i, j) { [array[i], array[j]] = [array[j], array[i]]; updateCurrentArray(); }

function updateVisualizationDisplay() {
    if (algorithmSelect.value === 'heap') {
        heapTree.style.display = 'block';
        heapTitle.style.display = 'block';
        arrayContainer.style.display = 'none';
        visualTitle.style.display = 'none';
    } else {
        heapTree.style.display = 'none';
        heapTitle.style.display = 'none';
        arrayContainer.style.display = 'flex';
        visualTitle.style.display = 'block';
    }
}

async function bubbleSort() {
    updateVisualizationDisplay();
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            renderArray([j, j + 1], n - i);
            await sleep(800);
            if (array[j] > array[j + 1]) {
                swap(j, j + 1);
                renderArray([j, j + 1], n - i);
                await sleep(300);
            }
        }
    }
    renderArray();
}

async function selectionSort() {
    updateVisualizationDisplay();
    const n = array.length;
    for (let i = 0; i < n; i++) {
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            renderArray([i, j, minIndex], i);
            await sleep(200);
            if (array[j] < array[minIndex]) minIndex = j;
        }
        swap(i, minIndex);
    }
    renderArray();
}

async function insertionSort() {
    updateVisualizationDisplay();
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;
        while (j >= 0 && array[j] > key) {
            array[j + 1] = array[j];
            renderArray([j, j + 1], i);
            await sleep(700);
            j--;
        }
        array[j + 1] = key;
        updateCurrentArray();
    }
    renderArray();
}

async function countingSort() {
    updateVisualizationDisplay();
    const max = Math.max(...array);
    const count = Array(max + 1).fill(0);
    array.forEach(n => count[n]++);
    let index = 0;
    for (let i = 0; i < count.length; i++) {
        while (count[i] > 0) {
            array[index] = i;
            renderArray([index]);
            await sleep(500);
            index++;
            count[i]--;
        }
    }
    renderArray();
}

async function heapSort() {
    updateVisualizationDisplay();
    const n = array.length;
    async function heapify(n, i) {
        let largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && array[l] > array[largest]) largest = l;
        if (r < n && array[r] > array[largest]) largest = r;

        renderHeapTree(i, largest);
        await sleep(500);

        if (largest !== i) {
            swap(i, largest);
            renderHeapTree(i, largest);
            await sleep(500);
            await heapify(n, largest);
        }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(n, i);
    for (let i = n - 1; i > 0; i--) {
        swap(0, i);
        renderHeapTree(0, i);
        await sleep(500);
        await heapify(i, 0);
    }
    renderHeapTree();
}

function renderHeapTree(active1 = -1, active2 = -1) {
    heapTree.innerHTML = '';
    const levels = Math.ceil(Math.log2(array.length + 1));
    const containerWidth = heapTree.offsetWidth;
    let index = 0;
    let levelPositions = {};

    for (let i = 0; i < levels; i++) {
        const nodesInLevel = Math.min(Math.pow(2, i), array.length - index);
        const levelDiv = document.createElement('div');
        levelDiv.classList.add('heap-level');
        levelDiv.style.position = 'relative';
        levelDiv.style.height = '60px';
        heapTree.appendChild(levelDiv);

        const spacing = containerWidth / (nodesInLevel + 1);

        for (let j = 0; j < nodesInLevel && index < array.length; j++) {
            const nodeDiv = document.createElement('div');
            nodeDiv.classList.add('heap-node');
            nodeDiv.textContent = array[index];
            nodeDiv.style.position = 'absolute';
            const x = spacing * (j + 1) - 25;
            const y = 0;
            nodeDiv.style.left = x + 'px';
            nodeDiv.style.top = y + 'px';
            if (index === active1 || index === active2) nodeDiv.classList.add('active');

            levelDiv.appendChild(nodeDiv);
            levelPositions[index] = { x: x + 25, y: y + 25 };
            index++;
        }
    }

    for (let i = 0; i < array.length; i++) {
        const leftChild = 2 * i + 1;
        const rightChild = 2 * i + 2;
        if (leftChild < array.length) drawHeapLine(levelPositions[i], levelPositions[leftChild]);
        if (rightChild < array.length) drawHeapLine(levelPositions[i], levelPositions[rightChild]);
    }
}

function drawHeapLine(parentPos, childPos) {
    const line = document.createElement('div');
    line.style.position = 'absolute';
    line.style.backgroundColor = '#555';
    const dx = childPos.x - parentPos.x;
    const dy = childPos.y - parentPos.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    line.style.width = length + 'px';
    line.style.height = '2px';
    line.style.left = parentPos.x + 'px';
    line.style.top = parentPos.y + 'px';
    line.style.transformOrigin = '0 0';
    line.style.transform = `rotate(${angle}deg)`;
    heapTree.appendChild(line);
}

algorithmSelect.addEventListener('change', updateVisualizationDisplay);

generateBtn.addEventListener('click', () => {
    const userArray = arrayInputField.value.trim();
    const length = parseInt(arrayLengthInput.value) || 7;
    if (userArray) {
        const parsed = userArray.split(',').map(x => parseInt(x.trim()));
        if (parsed.some(isNaN)) { alert('Invalid input!'); return; }
        array = parsed;
    } else generateArray(length);
    renderArray();
    updateCurrentArray();
    renderHeapTree();
});

sortBtn.addEventListener('click', async () => {
    switch (algorithmSelect.value) {
        case 'bubble': await bubbleSort(); break;
        case 'selection': await selectionSort(); break;
        case 'insertion': await insertionSort(); break;
        case 'heap': await heapSort(); break;
        case 'counting': await countingSort(); break;
    }
});

generateArray(7);
updateVisualizationDisplay();
