let config = {};
let state = {
    padded_input: [], 
    kernel: [],
    output: [],
    out: 0,
    padded: 0, 
    outX: 0, 
    outY: 0,
    is_start: false,
    is_stop: false,
    timer: null,
    is_pooling: false,
};

const kernel_presets = {
    "sobel-x":  [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
    "sobel-y":  [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
    "outline":  [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    "sharpen":  [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    "blur":   [[1, 2, 1], [2, 4, 2], [1, 2, 1]]
};

const input_pattern = {
    "cat": [
        [0, 0, 0, 0, 0, 0, 0, 0, 0]  ,
        [0, 0, 0, 4, 6, 4, 0, 0, 0], 
        [0, 9, 9, 6, 10, 6, 0, 0, 0], 
        [0, 0, 0, 6, 6, 6, 0, 0, 0], 
        [0, 0, 5, 5, 5, 4, 6, 8, 0], 
        [0, 6, 8, 8, 8, 8, 8, 6, 0], 
        [0, 6, 8, 5, 5, 8, 6, 0, 0], 
        [0, 4, 7, 8, 8, 7, 4, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0] 
    ],
    "dog": [
        [0, 0, 0, 4, 4, 4, 0, 0, 0], 
        [0, 2, 7, 5, 5, 5, 7, 2, 0], 
        [0, 7, 8, 5, 5, 5, 8, 7, 0], 
        [0, 8, 4, 10, 4, 10, 4, 8, 0], 
        [0, 8, 4, 4, 4, 4, 4, 8, 0], 
        [0, 4, 5, 9, 10, 9, 5, 4, 0], 
        [0, 0, 5, 5, 8, 5, 5, 0, 0], 
        [0, 0, 0, 4, 4, 4, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    "face": [
        [0, 3, 6, 6, 6, 6, 6, 3, 0],
        [3, 6, 4, 4, 4, 4, 4, 6, 3],
        [6, 4, 10, 4, 4, 4, 10, 4, 6], 
        [6, 4, 4, 4, 4, 4, 4, 4, 6],
        [6, 4, 4, 4, 4, 4, 4, 4, 6],
        [6, 4, 10, 4, 4, 4, 10, 4, 6], 
        [3, 6, 4, 10, 10, 10, 4, 6, 3], 
        [0, 3, 6, 4, 4, 4, 6, 3, 0],
        [0, 0, 3, 6, 6, 6, 3, 0, 0]
    ],
    "heart": [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 8, 4, 0, 4, 8, 2, 0],
        [2, 8, 10, 8, 4, 8, 10, 8, 2],
        [4, 8, 10, 10, 10, 10, 10, 8, 4],
        [0, 4, 8, 10, 10, 10, 8, 4, 0],
        [0, 0, 4, 8, 10, 8, 4, 0, 0],
        [0, 0, 0, 4, 8, 4, 0, 0, 0],
        [0, 0, 0, 0, 4, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    "invader": [
        [0, 0, 0, 8, 0, 8, 0, 0, 0],
        [0, 0, 0, 8, 8, 8, 0, 0, 0],
        [0, 0, 8, 8, 8, 8, 8, 0, 0],
        [0, 8, 8, 0, 8, 0, 8, 8, 0],
        [8, 8, 8, 8, 8, 8, 8, 8, 8],
        [8, 0, 8, 8, 8, 8, 8, 0, 8],
        [8, 0, 8, 0, 0, 0, 8, 0, 8],
        [0, 0, 0, 8, 8, 8, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    "checker": [
        [10, 0, 10, 0, 10, 0, 10, 0, 10],
        [0, 10, 0, 10, 0, 10, 0, 10, 0],
        [10, 0, 10, 0, 10, 0, 10, 0, 10],
        [0, 10, 0, 10, 0, 10, 0, 10, 0],
        [10, 0, 10, 0, 10, 0, 10, 0, 10],
        [0, 10, 0, 10, 0, 10, 0, 10, 0],
        [10, 0, 10, 0, 10, 0, 10, 0, 10],
        [0, 10, 0, 10, 0, 10, 0, 10, 0],
        [10, 0, 10, 0, 10, 0, 10, 0, 10]
    ],
    "spiral": [
        [10, 10, 10, 10, 10, 10, 10, 10, 10],
        [0, 0, 0, 0, 0, 0, 0, 0, 10],
        [0, 10, 10, 10, 10, 10, 10, 0, 10],
        [0, 10, 0, 0, 0, 0, 10, 0, 10],
        [0, 10, 0, 10, 10, 0, 10, 0, 10],
        [0, 10, 0, 10, 0, 0, 10, 0, 10],
        [0, 10, 0, 10, 10, 10, 10, 0, 10],
        [0, 10, 0, 0, 0, 0, 0, 0, 10],
        [0, 10, 10, 10, 10, 10, 10, 10, 10]
    ],
    "gradient": [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 3, 3, 3, 3, 3, 3, 3, 1],
        [1, 3, 5, 5, 5, 5, 5, 3, 1],
        [1, 3, 5, 8, 8, 8, 5, 3, 1],
        [1, 3, 5, 8, 10, 8, 5, 3, 1], 
        [1, 3, 5, 8, 8, 8, 5, 3, 1],
        [1, 3, 5, 5, 5, 5, 5, 3, 1],
        [1, 3, 3, 3, 3, 3, 3, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
}


function init(){
    config = {
        n: parseInt(document.getElementById('input_size').value),
        k: parseInt(document.getElementById('kernel_size').value),
        p: parseInt(document.getElementById('padding').value),
        s: parseInt(document.getElementById('stride').value),
        type: parseInt(document.getElementById('type').value)
    };

    state.is_start = false;
    state.is_stop = false;
    state.outX = 0;
    state.outY = 0;

    document.getElementById("step").disabled = false;
    document.getElementById("auto").disabled = false;
    document.getElementById("reset").disabled = false;    

    let out_size = Math.floor((config.n + 2*config.p - config.k) / config.s) + 1;
    if (out_size <= 0){
        alert("错误: 输出尺寸无效！请调整参数。");
        return;
    }
    else if( (config.n + 2*config.p - config.k) % config.s != 0){
        alert("警告：(Input Size + 2 * Padding - Kernel Size)不能被Stride整除。输出将无法完全覆盖输入。");
    }
    state.o = out_size;
    state.padded = config.n + 2 * config.p;

    document.getElementById('info_input').innerHTML = `Size: ${state.padded} x ${state.padded}`;
    document.getElementById('info_kernel').innerText = `Size: ${config.k} x ${config.k}`;
    document.getElementById('info_output').innerText = `Size: ${state.o} x ${state.o}`;

    Data()
    
    reset()
}


function reset() {
    reset_output()
    Grid('grid_input', state.padded_input, state.padded)
    Grid('grid_kernel', state.kernel, config.k)
    Grid('grid_output', state.output, state.o)
    
    state.outX = 0;
    state.outY = 0;
    document.getElementById('display').innerText = "点击“单步执行”或“自动执行”开始计算...";
    state.is_start = false;
}


function Data(){
    state.kernel = [];
    state.padded_input = [];
    const preset = document.getElementById('preset').value;
    const pattern = document.getElementById('input_pattern').value;
    
    if (config.type === 0){
        if (preset !== "customize") {
            config.k = 3;
            state.kernel = JSON.parse(JSON.stringify(kernel_presets[preset]));
        }
        else {
            for(let r=0; r<config.k; r++){
                let row = [];
                for(let c=0; c<config.k; c++){
                    row.push(Math.floor(Math.random() * 6) - 2);
                }
                state.kernel.push(row);
            }
        }

    }
    else if (config.type === 1) {
        for(let r=0; r<config.k; r++){
            let row = [];
            for(let c=0; c<config.k; c++){
                row.push("max");
            }
            state.kernel.push(row);
        }
    }
    else {
        for(let r=0; r<config.k; r++){
            let row = [];
            for(let c=0; c<config.k; c++){
                row.push("avg");
            }
            state.kernel.push(row);
        }
    }

    let input_row = [];
    if (pattern === 'random') {
        for(let r=0; r<state.padded; r++){
            let row = [];
            for(let c=0; c<state.padded; c++){
                row.push(Math.floor(Math.random() * 11));
            }
            input_row.push(row);
        }
    }
    else {
        config.n = 9;
        input_row = JSON.parse(JSON.stringify(input_pattern[pattern]));
    }
    for(let r=0; r<state.padded; r++){
        let row = [];
        for(let c=0; c<state.padded; c++){
            if ( 
                r < config.p ||
                r >= config.p + config.n ||
                c < config.p ||
                c >= config.p + config.n
            ) {
                row.push({value: 0, is_pad: true });
            }
            else {
                row.push({value: input_row[r - config.p][c - config.p], is_pad: false});
            }
        }
        state.padded_input.push(row);
    }

    
}

function reset_output() {
    state.output = [];
    for(let r=0; r<state.o; r++){
        let row = [];
        for(let c=0; c<state.o; c++){
            row.push(null);
        }
        state.output.push(row);
    }
}



function Grid(grid_id, data, size){
    const grid = document.getElementById(grid_id);

    grid.innerHTML = ``;
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            const cell = document.createElement('div');
            cell.id = `${grid_id}-${r}-${c}`;

            if (grid_id === 'grid_input') {
                cell.innerText = data[r][c].value;
                if (data[r][c].is_pad) {
                    cell.className = 'cell padding_cell';
                }
                else {
                    cell.className = 'cell input_cell';
                    let alpha = 0.2 + data[r][c].value / 12.5;
                    cell.style.opacity = alpha;
                } 
            }
            else if (grid_id === 'grid_kernel') {
                cell.innerText = data[r][c];
                cell.className = 'cell kernel_cell';
            }
            else {
                cell.innerText = data[r][c];
                cell.className = 'cell output_cell';
            }

            grid.appendChild(cell);
        }
    }
}


function next_step() {
    if (state.is_stop) {
        return;
    }

    document.querySelectorAll('.highlight').forEach(e => e.classList.remove('highlight'));

    const startX = state.outX * config.s;
    const startY = state.outY * config.s;

    if (config.type === 0){
        Conv(startX, startY);
    }        
    else if (config.type === 1){
        Max(startX, startY);
    }        
    else {
        Avg(startX, startY);
    }

    document.getElementById(`grid_output-${state.outY}-${state.outX}`).style.backgroundColor = 'rgba(0, 201, 167)';
    document.getElementById(`grid_output-${state.outY}-${state.outX}`).classList.add('highlight');

    state.outX++;
    if (state.outX >= state.o) {
        state.outX = 0;
        state.outY ++;
    }

    if (state.outY >= state.o){
        state.is_stop = true;
        stop();
        document.getElementById('display').innerHTML = (`计算完成！🎉
            <br>
            通过颜色深浅，您可以直观地看到卷积过程提取了哪些图像特征。`)
        document.querySelectorAll('.highlight').forEach(e => e.classList.remove('highlight'));
    }

}


function Conv(X, Y) {    
    let sum = 0;
    let display = [];

    for (let k_r=0; k_r<config.k; k_r++){
        for (let k_c=0; k_c<config.k; k_c++){
            let i_r = Y + k_r;
            let i_c = X + k_c;

            const i_cell = document.getElementById(`grid_input-${i_r}-${i_c}`);
            if (i_cell) { 
                i_cell.classList.add('highlight');
            }
            let i_value = state.padded_input[i_r][i_c].value;
            let k_value = state.kernel[k_r][k_c];

            sum += i_value * k_value;
            if (i_value != 0 && k_value != 0) {
                display.push(`(${i_value} × ${k_value})`);
            }
        }
    }
    if (sum <= 0) {
        sum = 0;
    }
    state.output[state.outY][state.outX] = sum;
    document.getElementById(`grid_output-${state.outY}-${state.outX}`).innerText = sum;
    document.getElementById('display').innerText = (`Output(${state.outX},${state.outY}) = ReLU[` + display.join(' + ') + `] = ${sum}`);

    let max = get_max();

    let alpha  = 0.1 + (sum / max);
    if (alpha > 1) {
        alpha = 1;
    }
    else if (alpha < 0.05) {
        alpha = 0.05;
    }
    document.getElementById(`grid_output-${state.outY}-${state.outX}`).style.opacity = alpha;
    
}


function Avg(X, Y) {
    let sum = 0;
    let avg = 0;
    let display = [];

    for (let k_r=0; k_r<config.k; k_r++){
        for (let k_c=0; k_c<config.k; k_c++){
            let i_r = Y + k_r;
            let i_c = X + k_c;

            const i_cell = document.getElementById(`grid_input-${i_r}-${i_c}`);
            if (i_cell) { 
                i_cell.classList.add('highlight');
            }
            let i_value = state.padded_input[i_r][i_c].value;

            sum += i_value;
            if (i_value != 0) {
                display.push(`${i_value}`);
            }
        }
    }
    avg = Math.round(sum / (config.k**2))
    state.output[state.outY][state.outX] = avg;
    document.getElementById(`grid_output-${state.outY}-${state.outX}`).innerText = avg;
    document.getElementById('display').innerText = (`Output(${state.outX},${state.outY}) = (` + display.join(' + ') + `) / ${config.k**2} = ${avg}`);

    let alpha  = avg / 7;
    if (alpha > 1) {
        alpha = 1;
    }
    else if (alpha < 0.1) {
        alpha = 0.1;
    }
    document.getElementById(`grid_output-${state.outY}-${state.outX}`).style.opacity = alpha;
}

function Max(X, Y) {
    let i_value = []
    for (let k_r=0; k_r<config.k; k_r++){
        for (let k_c=0; k_c<config.k; k_c++){
            let i_r = Y + k_r;
            let i_c = X + k_c;

            const i_cell = document.getElementById(`grid_input-${i_r}-${i_c}`);
            if (i_cell) { 
                i_cell.classList.add('highlight');
            }
            i_value.push(state.padded_input[i_r][i_c].value);         
        }
    }
    let max = Math.max(...i_value)
    state.output[state.outY][state.outX] = max;
    document.getElementById(`grid_output-${state.outY}-${state.outX}`).innerText = max
    document.getElementById('display').innerText = (`Output(${state.outX},${state.outY}) = max{` + i_value.join(', ') + `} = ${max}`);
    let alpha  = (max**2) / 100;
    if (alpha > 1) {
        alpha = 1;
    }
    else if (alpha < 0.1) {
        alpha = 0.1;
    }
    document.getElementById(`grid_output-${state.outY}-${state.outX}`).style.opacity = alpha;
}
    
function get_max() {
    let sum = 0;
    for(let r=0; r<config.k; r++){
        for(let c=0; c<config.k; c++){
            sum += state.kernel[r][c];
        }
    }
    if (sum <= 0) {
        sum = 1;
    }
    return sum * 20;
}

function auto_play() {
    if (state.is_start) {
        stop();
    }
    else {
        if (state.is_stop) {
            init();
            return;
        }
        state.is_start = true
        document.getElementById('auto').innerText = "暂停";
        document.getElementById('auto').style.backgroundColor = "rgba(167, 41, 119, 0.73)";
        state.timer = setInterval(next_step, 100);        
    }
}

function stop(){
    state.is_start = false;
    clearInterval(state.timer);
    state.timer = null;
    document.getElementById('auto').innerText = "自动执行";
    document.getElementById('auto').style.backgroundColor = "rgba(0, 255, 0, 0.729)";
}

function Type() {
    if (document.getElementById("type").value === '0') {
        document.getElementById("preset").disabled = false;
    }
    else {
        document.getElementById("preset").value = "customize";
        document.getElementById("preset").disabled = true;
        document.getElementById("kernel_size").disabled = false;
    }
    init();
}

function Preset() {
    if (document.getElementById("preset").value === "customize") {
        document.getElementById("kernel_size").disabled = false;
    }
    else {
        document.getElementById("kernel_size").value = "3";
        document.getElementById("kernel_size").disabled = true;
    }
    init();
}

function Pattern() {
    if (document.getElementById("input_pattern").value === 'random') {
        document.getElementById("input_size").disabled = false;
    }
    else {
        document.getElementById("input_size").value = "9";
        document.getElementById("input_size").disabled = true;
    }
    init();
}