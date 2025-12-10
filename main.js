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
    timer: null
};



function init(){
    config = {
        n: parseInt(document.getElementById('input_size').value),
        k: parseInt(document.getElementById('kernel_size').value),
        p: parseInt(document.getElementById('padding').value),
        s: parseInt(document.getElementById('stride').value)
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
    state.out = out_size;
    state.padded = config.n + 2 * config.p;

    document.getElementById('info_input').innerHTML = `Size: ${state.padded} x ${state.padded}`;
    document.getElementById('info_kernel').innerText = `Size: ${config.k} x ${config.k}`;
    document.getElementById('info_output').innerText = `Size: ${state.out} x ${state.out}`;

    Data()

    Grid('grid_input', state.padded_input, state.padded)
    Grid('grid_kernel', state.kernel, config.k)
    Grid('grid_output', state.output, state.out)
    
    state.outX = 0;
    state.outY = 0;
    document.getElementById('display').innerText = "Click on 'Next Step' or 'Auto Play' to start the calculation ...";
    state.is_start = false;
}



function Data(){
    state.kernel = [];
    state.padded_input = [];
    for(let r=0; r<config.k; r++){
        let row = [];
        for(let c=0; c<config.k; c++){
            row.push(Math.floor(Math.random() * 6))
        }
        state.kernel.push(row);
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
    state.output = Array(state.out).fill(0).map(() => Array(state.out).fill(null));
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

    let sum = 0;
    let display = [];

    for (let k_r=0; k_r<config.k; k_r++){
        for (let k_c=0; k_c<config.k; k_c++){
            let i_r = startY + k_r;
            let i_c = startX + k_c;

            const i_cell = document.getElementById(`grid_input-${i_r}-${i_c}`);
            if (i_cell) { 
                i_cell.classList.add('highlight');
            }
            let i_value = state.padded_input[i_r][i_c].value;
            let k_value = state.kernel[k_r][k_c];

            sum += i_value * k_value;
            if (i_value != 0 && k_value != 0) {
                display.push(`${i_value} × ${k_value}`);
            }
        }
    }
    state.output[state.outY][state.outX] = sum;
    const out_cell = document.getElementById(`grid_output-${state.outY}-${state.outX}`);
    out_cell.innerText = sum;
    document.getElementById('display').innerText = (`Output(${state.outX},${state.outY}) = ` + display.join(' + ') + ` = ${sum}`);

    state.outX++;
    if (state.outX >= state.out) {
        state.outX = 0;
        state.outY ++;
    }

    if (state.outY >= state.out){
        state.is_stop = true;
        stop();
        document.getElementById('display').innerText = (`Calculation completed~~`)
    }
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
