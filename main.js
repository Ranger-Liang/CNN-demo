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
    is_pooling: false
};



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

    let out_size = Math.floor((config.n + 2*config.p - config.k) / config.s) + 1;
    if (out_size <= 0){
        alert("ERROR: Output size is non-positive! Please adjust the parameters.");
        return;
    }
    else if( (config.n + 2*config.p - config.k) % config.s != 0){
        alert("WARNING: (Input Size + 2 * Padding - Kernel Size) is not divisible by Stride. The output size will be rounded down.");
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
    document.getElementById('display').innerText = "Click on 'Next Step' or 'Auto Play' to start the calculation ...";
    state.is_start = false;
}


function Data(){
    state.kernel = [];
    state.padded_input = [];
    
    if (config.type === 0){
        for(let r=0; r<config.k; r++){
            let row = [];
            for(let c=0; c<config.k; c++){
                row.push(Math.floor(Math.random() * 5) + 1)
            }
            state.kernel.push(row);
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
            else{
                row.push({value: Math.floor(Math.random() * 11), is_pad: false });
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
                cell.className = data[r][c].is_pad ? 'cell padding_cell' : 'cell input_cell';
            }
            else if (grid_id === 'grid_kernel') {
                cell.innerText = data[r][c];
                cell.className = 'cell kernel_cell' ;
            }
            else {
                cell.innerText = data[r][c];
                cell.className = 'cell output_cell' ;
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


    state.outX++;
    if (state.outX >= state.o) {
        state.outX = 0;
        state.outY ++;
    }

    if (state.outY >= state.o){
        state.is_stop = true;
        stop();
        document.getElementById('display').innerText = (`Calculation completed~~`)
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
    state.output[state.outY][state.outX] = sum;
    document.getElementById(`grid_output-${state.outY}-${state.outX}`).innerText = sum;
    document.getElementById(`grid_output-${state.outY}-${state.outX}`).classList.add('highlight');
    document.getElementById('display').innerText = (`Output(${state.outX},${state.outY}) = ` + display.join(' + ') + ` = ${sum}`);
}

function Max(X, Y) {

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
        document.getElementById('auto').innerText = "Pause";
        document.getElementById('auto').style.backgroundColor = "rgba(167, 41, 119, 0.73)";
        state.timer = setInterval(next_step, 300);        
    }
}

function stop(){
    state.is_start = false;
    clearInterval(state.timer);
    state.timer = null;
    document.getElementById('auto').innerText = "Auto Play";
    document.getElementById('auto').style.backgroundColor = "rgba(0, 255, 0, 0.729)";

}
