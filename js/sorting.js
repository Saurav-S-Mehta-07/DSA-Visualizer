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

const timeComplexity = document.getElementById('tc');
const spaceComplexity = document.getElementById('sc');
const pseudoDiv = document.querySelector('.pseudo-code');

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
    heapTree.innerHTML = ''; // Clear previous visualization
    const levels = Math.ceil(Math.log2(array.length + 1));
    const containerWidth = heapTree.offsetWidth;
    let index = 0;

    // Loop through each level of the heap
    for (let i = 0; i < levels; i++) {
        const nodesInLevel = Math.min(Math.pow(2, i), array.length - index);
        const levelDiv = document.createElement('div');
        levelDiv.classList.add('heap-level');
        levelDiv.style.position = 'relative';
        levelDiv.style.height = '60px';
        heapTree.appendChild(levelDiv);

        const spacing = containerWidth / (nodesInLevel + 1);

        // Create heap nodes (no connecting lines)
        for (let j = 0; j < nodesInLevel && index < array.length; j++) {
            const nodeDiv = document.createElement('div');
            nodeDiv.classList.add('heap-node');
            nodeDiv.textContent = array[index];
            nodeDiv.style.position = 'absolute';

            // Set position
            const x = spacing * (j + 1) - 25;
            nodeDiv.style.left = x + 'px';
            nodeDiv.style.top = '0px';

            // Highlight active nodes
            if (index === active1 || index === active2)
                nodeDiv.classList.add('active');

            levelDiv.appendChild(nodeDiv);
            index++;
        }
    }
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
        case 'bubble': await bubbleSort();
              timeComplexity.innerText = "Time Complexity: O(n^2)";
              spaceComplexity.innerText = "Space Complexity : O(1)";
              pseudoDiv.innerHTML = `
                  <h2>Bubble Sort (Pseudo-code)</h2>
                  <h3>
                      function bubbleSort(array, n) <br>
                      &nbsp;&nbsp;&nbsp;&nbsp;for i = 0 to n - 1 <br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for j = 0 to n - i - 2 <br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if array[j] > array[j + 1] <br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;swap array[j] and array[j + 1] <br>
                      &nbsp;&nbsp;&nbsp;&nbsp;return array
                  </h3>
              `;

              break;
        case 'selection': 
            await selectionSort();
            timeComplexity.innerText = "Time Complexity: O(n^2)";
            spaceComplexity.innerText = "Space Complexity : O(1)";
            pseudoDiv.innerHTML = `
                <h2>Selection Sort (Pseudo-code)</h2>
                <h3>
                    function selectionSort(array, n) <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;for i = 0 to n - 2 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;minIndex = i <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for j = i + 1 to n - 1 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if array[j] < array[minIndex] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;minIndex = j <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if minIndex != i <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;swap array[i] and array[minIndex] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;return array
                </h3>
            `;
            break;

        case 'insertion': 
            await insertionSort();
            timeComplexity.innerText = "Time Complexity: O(n^2)";
            spaceComplexity.innerText = "Space Complexity : O(1)";
            pseudoDiv.innerHTML = `
                <h2>Insertion Sort (Pseudo-code)</h2>
                <h3>
                    function insertionSort(array, n) <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;for i = 1 to n - 1 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;key = array[i] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;j = i - 1 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;while j >= 0 and array[j] > key <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;array[j + 1] = array[j] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;j = j - 1 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;array[j + 1] = key <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;return array
                </h3>
            `;
            break;

        case 'heap': 
            await heapSort();
            timeComplexity.innerText = "Time Complexity: O(n log n)";
            spaceComplexity.innerText = "Space Complexity : O(1)";
            pseudoDiv.innerHTML = `
                <h2>Heap Sort (Pseudo-code)</h2>
                <h3>
                    function heapSort(array, n) <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;buildMaxHeap(array, n) <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;for i = n - 1 down to 1 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;swap array[0] and array[i] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;heapify(array, 0, i) <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;return array <br><br>
        
                    function buildMaxHeap(array, n) <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;for i = floor(n/2) - 1 down to 0 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;heapify(array, i, n) <br><br>
        
                    function heapify(array, i, heapSize) <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;largest = i <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;left = 2 * i + 1 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;right = 2 * i + 2 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;if left < heapSize and array[left] > array[largest] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;largest = left <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;if right < heapSize and array[right] > array[largest] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;largest = right <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;if largest != i <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;swap array[i] and array[largest] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;heapify(array, largest, heapSize)
                </h3>
            `;
            break;

       case 'counting': 
            await countingSort();
            timeComplexity.innerText = "Time Complexity: O(n + k)";
            spaceComplexity.innerText = "Space Complexity : O(k)";
            pseudoDiv.innerHTML = `
                <h2>Counting Sort (Pseudo-code)</h2>
                <h3>
                    function countingSort(array, n) <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;find max = maximum element in array <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;initialize count[0..max] = 0 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;for i = 0 to n - 1 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;count[array[i]] = count[array[i]] + 1 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;for i = 1 to max <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;count[i] = count[i] + count[i - 1] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;initialize output[0..n-1] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;for i = n - 1 down to 0 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;output[count[array[i]] - 1] = array[i] <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;count[array[i]] = count[array[i]] - 1 <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;copy output array back to original array <br>
                    &nbsp;&nbsp;&nbsp;&nbsp;return array
                </h3>
            `;
            break;

    }
});

generateArray(7);
updateVisualizationDisplay();
