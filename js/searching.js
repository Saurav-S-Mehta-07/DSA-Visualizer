const arrayContainer = document.getElementById('array-container');
const generateBtn = document.getElementById('generate');
const startSearchBtn = document.getElementById('start-search');
const algorithmSelect = document.getElementById('algorithm');
const arrayLengthInput = document.getElementById('array-length');
const arrayInputField = document.getElementById('array-input');
const currentArrayDiv = document.getElementById('current-array');
const searchTargetInput = document.getElementById('search-target');
const searchTargetDisplay = document.getElementById('search-target-display');

let array = [];

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

function generateArray(length=10){
    array = Array.from({length}, ()=>Math.floor(Math.random()*50)+1);
    if(algorithmSelect.value==='binary'){
        array.sort((a,b)=>a-b); 
    }
    renderArray();
    updateCurrentArray();
}

function renderArray(activeIndices=[], foundIndex=-1){
    arrayContainer.innerHTML='';
    array.forEach((value,index)=>{
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value*7}px`;
        bar.textContent = value;

        if(activeIndices.includes(index)) bar.classList.add('active');
        if(index===foundIndex) bar.classList.add('found');

        arrayContainer.appendChild(bar);
    });
}

function updateCurrentArray(){
    currentArrayDiv.textContent = `[ ${array.join(', ')} ]`;
}

async function linearSearch(target){
    searchTargetDisplay.textContent = `Searching for: ${target}`;
    for(let i=0;i<array.length;i++){
        renderArray([i]);
        await sleep(600);
        if(array[i]===target){
            renderArray([], i);
            searchTargetDisplay.textContent = `Value ${target} found at index ${i}`;
            return;
        }
    }
    searchTargetDisplay.textContent = `Value ${target} not found`;
}

async function binarySearch(target){
    array.sort((a,b)=>a-b);
    updateCurrentArray();
    searchTargetDisplay.textContent = `Searching for: ${target}`;
    let left=0, right=array.length-1;
    while(left<=right){
        let mid = Math.floor((left+right)/2);
        renderArray([mid]);
        await sleep(600);
        if(array[mid]===target){
            renderArray([], mid);
            searchTargetDisplay.textContent = `Value ${target} found at index ${mid}`;
            return;
        } else if(array[mid]<target){
            left = mid+1;
        } else {
            right = mid-1;
        }
    }
    searchTargetDisplay.textContent = `Value ${target} not found`;
}

generateBtn.addEventListener('click', ()=>{
    const userArray = arrayInputField.value.trim();
    const length = parseInt(arrayLengthInput.value) || 10;

    if(userArray){
        const parsed = userArray.split(',').map(x=>parseInt(x.trim()));
        if(parsed.some(isNaN)){
            alert('Please enter valid numbers separated by commas.');
            return;
        }
        array = parsed;
        if(algorithmSelect.value==='binary'){
            array.sort((a,b)=>a-b); // sort for binary search
        }
    } else {
        generateArray(length);
    }
    renderArray();
    updateCurrentArray();
});

startSearchBtn.addEventListener('click', async ()=>{
    const target = parseInt(searchTargetInput.value);
    if(isNaN(target)){
        alert('Please enter a valid target value');
        return;
    }
    if(algorithmSelect.value==='linear') await linearSearch(target);
    else await binarySearch(target);
});

generateArray();
