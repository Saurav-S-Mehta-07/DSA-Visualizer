const graphContainer = document.getElementById('graph-container');
const generateGraphBtn = document.getElementById('generate-graph');
const numNodesInput = document.getElementById('num-nodes');
const edgesInput = document.getElementById('edges-input');
const graphTypeSelect = document.getElementById('graph-type');
const outputDiv = document.getElementById('output');

const bfsBtn = document.getElementById('bfs-btn');
const dfsBtn = document.getElementById('dfs-btn');
const componentsBtn = document.getElementById('components-btn');
const dijkstraBtn = document.getElementById('dijkstra-btn');
const primsBtn = document.getElementById('prims-btn');

const timeComplexity = document.getElementById('tc');
const spaceComplexity = document.getElementById('sc');
const pseudoDiv = document.querySelector('.pseudo-code');

let edges = [];
let positions = {};
let numNodes = 6;
let directed = false;

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

function generatePositions(n){
    positions = {};
    const radius = Math.min(graphContainer.offsetWidth, graphContainer.offsetHeight)/2 - 50;
    const centerX = graphContainer.offsetWidth/2;
    const centerY = graphContainer.offsetHeight/2;
    for(let i=1;i<=n;i++){
        const angle = (i-1)*(2*Math.PI/n);
        positions[i] = {x:centerX+radius*Math.cos(angle), y:centerY+radius*Math.sin(angle)};
    }
}

function renderGraph(highlightNodes=[], highlightEdges=[], edgeColor='black', showOnlyEdges=false){
    graphContainer.innerHTML='';

    edges.forEach(edge=>{
        if(showOnlyEdges && !highlightEdges.includes(`${edge.from}-${edge.to}`)) return;

        const from = positions[edge.from];
        const to = positions[edge.to];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.hypot(dx,dy);
        const angle = Math.atan2(dy,dx)*180/Math.PI;

        const edgeDiv = document.createElement('div');
        edgeDiv.classList.add('edge');
        edgeDiv.style.width = length + 'px';
        edgeDiv.style.left = from.x + 'px';
        edgeDiv.style.top = from.y + 'px';
        edgeDiv.style.transform = `rotate(${angle}deg)`;
        edgeDiv.style.backgroundColor = highlightEdges.includes(`${edge.from}-${edge.to}`) ? edgeColor : (directed?'black':'blue');
        graphContainer.appendChild(edgeDiv);

        if(edge.weight!==undefined){
            const wDiv = document.createElement('div');
            wDiv.classList.add('edge-text');
            wDiv.style.left = (from.x+to.x)/2 + 'px';
            wDiv.style.top = (from.y+to.y)/2 + 'px';
            wDiv.textContent = edge.weight;
            graphContainer.appendChild(wDiv);
        }
    });

    for(let i=1;i<=numNodes;i++){
        const nodeDiv = document.createElement('div');
        nodeDiv.classList.add('node');
        nodeDiv.textContent = i;
        nodeDiv.style.left = positions[i].x - 20 + 'px';
        nodeDiv.style.top = positions[i].y - 20 + 'px';
        if(highlightNodes.includes(i)) nodeDiv.classList.add('active-node');
        graphContainer.appendChild(nodeDiv);
    }
}

function parseEdges(input){
    edges=[];
    const raw=input.split(',');
    raw.forEach(r=>{
        const parts=r.trim().split('-');
        if(parts.length>=2){
            const from=parseInt(parts[0]);
            const to=parseInt(parts[1]);
            const weight = parts[2]?parseInt(parts[2]):1;
            edges.push({from,to,weight});
            if(!directed && !edges.find(e=>e.from===to && e.to===from)){
                edges.push({from:to,to:from,weight});
            }
        }
    });
}

async function bfs(start=1){
    const visited={};
    const queue=[start];
    const highlightEdges=[];
    outputDiv.textContent='BFS traversal: ';
    while(queue.length){
        const node=queue.shift();
        if(visited[node]) continue;
        visited[node]=true;
        renderGraph([node], highlightEdges);
        outputDiv.textContent+=node+' ';
        await sleep(600);
        const neighbors=edges.filter(e=>e.from===node).map(e=>e.to);
        neighbors.forEach(n=>{
            if(!visited[n]){
                queue.push(n);
                highlightEdges.push(`${node}-${n}`);
            }
        });
    }
}

async function dfs(start=1, visited={}, highlightEdges=[]){
    visited[start]=true;
    renderGraph([start], highlightEdges);
    outputDiv.textContent+=start+' ';
    await sleep(600);
    const neighbors=edges.filter(e=>e.from===start).map(e=>e.to);
    for(let n of neighbors){
        if(!visited[n]){
            highlightEdges.push(`${start}-${n}`);
            await dfs(n, visited, highlightEdges);
        }
    }
}

async function connectedComponents(){
    let visited={};
    let comp=0;
    outputDiv.textContent='Connected Components:\n';
    for(let i=1;i<=numNodes;i++){
        if(!visited[i]){
            comp++;
            outputDiv.textContent+=`Component ${comp}: `;
            await dfsComponent(i, visited);
            outputDiv.textContent+='\n';
        }
    }
}
async function dfsComponent(node, visited){
    visited[node]=true;
    renderGraph([node]);
    outputDiv.textContent+=node+' ';
    await sleep(400);
    const neighbors=edges.filter(e=>e.from===node).map(e=>e.to);
    for(let n of neighbors){
        if(!visited[n]) await dfsComponent(n, visited);
    }
}

async function dijkstra(start=1){
    const dist=Array(numNodes+1).fill(Infinity);
    dist[start]=0;
    const visited=Array(numNodes+1).fill(false);
    outputDiv.textContent='Dijkstra shortest distances:\n';
    for(let i=1;i<=numNodes;i++){
        let u=-1;
        let minDist=Infinity;
        for(let j=1;j<=numNodes;j++){
            if(!visited[j] && dist[j]<minDist){
                minDist=dist[j];
                u=j;
            }
        }
        if(u===-1) break;
        visited[u]=true;
        renderGraph([u]);
        await sleep(600);
        const neighbors=edges.filter(e=>e.from===u);
        for(let edge of neighbors){
            if(dist[edge.to]>dist[u]+edge.weight){
                dist[edge.to]=dist[u]+edge.weight;
            }
        }
    }
    outputDiv.textContent+=dist.slice(1).join(', ');
}

async function prims(start=1){
    const mstSet=Array(numNodes+1).fill(false);
    const key=Array(numNodes+1).fill(Infinity);
    const parent=Array(numNodes+1).fill(-1);
    key[start]=0;
    let mstEdges=[];

    for(let count=0;count<numNodes;count++){
        let u=-1;
        let minKey=Infinity;
        for(let i=1;i<=numNodes;i++){
            if(!mstSet[i] && key[i]<minKey){
                minKey=key[i];
                u=i;
            }
        }
        if(u===-1) break;
        mstSet[u]=true;
        if(parent[u]>0) mstEdges.push({from: parent[u], to: u});

        const neighbors=edges.filter(e=>e.from===u);
        for(let e of neighbors){
            if(!mstSet[e.to] && e.weight<key[e.to]){
                key[e.to]=e.weight;
                parent[e.to]=u;
            }
        }
    }

    renderGraph([], mstEdges.map(e=>`${e.from}-${e.to}`), 'green', true);
    outputDiv.textContent="Prim's MST edges:\n"+mstEdges.map(e=>`${e.from}-${e.to}`).join(', ');
}

generateGraphBtn.addEventListener('click', ()=>{
    numNodes=parseInt(numNodesInput.value)||6;
    directed = graphTypeSelect.value==='directed';
    parseEdges(edgesInput.value);
    generatePositions(numNodes);
    renderGraph();
    outputDiv.textContent='';
});


bfsBtn.addEventListener('click', async () => {
    outputDiv.textContent = '';
    await bfs(1); 

    timeComplexity.innerText = "Time Complexity: O(V + E)";
    spaceComplexity.innerText = "Space Complexity: O(V)"; 
    pseudoDiv.innerHTML = `
        <h2>BFS (Breadth-First Search) Pseudo-code</h2>
        <h3>
            function bfs(startNode) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;initialize queue <br>
            &nbsp;&nbsp;&nbsp;&nbsp;mark startNode as visited <br>
            &nbsp;&nbsp;&nbsp;&nbsp;enqueue startNode <br>
            &nbsp;&nbsp;&nbsp;&nbsp;while queue is not empty <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;node = dequeue() <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;visit(node) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for each neighbor of node <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if neighbor not visited <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mark neighbor visited <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;enqueue neighbor
        </h3>
    `;
});

dfsBtn.addEventListener('click', async () => {
    outputDiv.textContent = 'DFS traversal: ';
    await dfs(1, {}); // call DFS starting from node 1 with empty visited object

    timeComplexity.innerText = "Time Complexity: O(V + E)";
    spaceComplexity.innerText = "Space Complexity: O(V)"; // recursion stack + visited
    pseudoDiv.innerHTML = `
        <h2>DFS (Depth-First Search) Pseudo-code</h2>
        <h3>
            function dfs(node, visited) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;if node is visited <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return <br>
            &nbsp;&nbsp;&nbsp;&nbsp;mark node as visited <br>
            &nbsp;&nbsp;&nbsp;&nbsp;visit(node) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;for each neighbor of node <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dfs(neighbor, visited)
        </h3>
    `;
});

componentsBtn.addEventListener('click', async () => {
    await connectedComponents(); // call connected components function

    timeComplexity.innerText = "Time Complexity: O(V + E)";
    spaceComplexity.innerText = "Space Complexity: O(V)"; // for visited array
    pseudoDiv.innerHTML = `
        <h2>Connected Components Pseudo-code</h2>
        <h3>
            function connectedComponents() <br>
            &nbsp;&nbsp;&nbsp;&nbsp;initialize visited array <br>
            &nbsp;&nbsp;&nbsp;&nbsp;for each node in graph <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if node not visited <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DFS(node, visited) or BFS(node) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;increment component count
        </h3>
    `;
});

dijkstraBtn.addEventListener('click', async () => {
    outputDiv.textContent = '';
    await dijkstra(1); // start Dijkstra from node 1

    timeComplexity.innerText = "Time Complexity: O(E log V)";
    spaceComplexity.innerText = "Space Complexity: O(V + E)";
    pseudoDiv.innerHTML = `
        <h2>Dijkstra's Algorithm Pseudo-code</h2>
        <h3>
            function dijkstra(start) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;initialize distance array with INF <br>
            &nbsp;&nbsp;&nbsp;&nbsp;distance[start] = 0 <br>
            &nbsp;&nbsp;&nbsp;&nbsp;initialize min-priority queue and insert start <br>
            &nbsp;&nbsp;&nbsp;&nbsp;while queue is not empty <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;u = extract node with min distance <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for each neighbor v of u <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if distance[u] + weight(u,v) < distance[v] <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;distance[v] = distance[u] + weight(u,v) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;update v in priority queue
        </h3>
    `;
});

primsBtn.addEventListener('click', async () => {
    outputDiv.textContent = '';
    await prims(1); // start Prim's algorithm from node 1

    timeComplexity.innerText = "Time Complexity: O(E log V)";
    spaceComplexity.innerText = "Space Complexity: O(V + E)";
    pseudoDiv.innerHTML = `
        <h2>Prim's Algorithm Pseudo-code</h2>
        <h3>
            function prims(start) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;initialize key array with INF <br>
            &nbsp;&nbsp;&nbsp;&nbsp;key[start] = 0 <br>
            &nbsp;&nbsp;&nbsp;&nbsp;initialize min-priority queue and insert start <br>
            &nbsp;&nbsp;&nbsp;&nbsp;while queue is not empty <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;u = extract node with min key <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mark u as included in MST <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for each neighbor v of u <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if v not in MST and weight(u,v) < key[v] <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;key[v] = weight(u,v) <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;update v in priority queue
        </h3>
    `;
});

