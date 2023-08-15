const canvas = document.getElementById('stringCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * .7;
canvas.height = window.innerHeight * .7;

class Wave {
    constructor(N) {
        this.N = N;
        this.x = Array(N).fill().map((_, i) => i/this.N);

        this.y = [];
        this.y.push(Array(N).fill().map(() => 0));
        this.y.push(Array(N).fill().map(() => 0));
        this.y.push(Array(N).fill().map(() => 0));

        this.gamma = 200;
        this.c = 1/100;
        this.dx = 1/this.N;
        this.dt = 0.0000001;
    }

    pull(position) {
        const transition = position.x
        const height = position.y;
        this.y[this.y.length - 1] = Array(this.N).fill().map((_, i) => {
            if (this.x[i] < position.x) {
                console.log(i, this.x[i] * position.x * position.y)
                return this.x[i] / position.x * position.y;
            } else {
                return height * (1 - (this.x[i] - position.x) / (1 - position.x));
            }

        });

        drawString(this);
    }

    pluck(position) {
        console.log('pluck');
        console.log(position);
    }
}

function drawString(wave) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let i = 0; i < wave.N; i++) {
        const canvasCoords = convertToCanvasCoords(wave.x[i], wave.y.at(-1)[i]);
        if (i % 20 === 0) {
            // console.log(wave.x[i], wave.y.at(-1)[i])
            // console.log(convertToCanvasCoords(wave.x[i], wave.y.at(-1)[i]))

        }
        ctx.lineTo(canvasCoords.x, canvasCoords.y);
    }
    // wave.y.at(-1).forEach((y, i) => {
    //     const nextX = wave.dx * canvas.width * (i);
    //     const nextY = canvas.height/2 + wave.y.at(-1)[i];
    //     ctx.lineTo(nextX, nextY);
    // })
    ctx.stroke();
}

const wave = new Wave(1000);
drawString(wave);

let isClicked = false;

canvas.addEventListener('mousedown', () => {
    isClicked = true;
});

canvas.addEventListener('mouseup', (e) => {
    isClicked = false;
    console.log(e);
    const waveCoords = convertToWaveCoords(e.offsetX, e.offsetY);
    wave.pull(waveCoords);
    wave.pluck(waveCoords);
});

canvas.addEventListener('mousemove', (e) => {
    if (isClicked) {
        const waveCoords = convertToWaveCoords(e.offsetX, e.offsetY);
        wave.pull(waveCoords);
    }
});

function convertToCanvasCoords(x, y) {
    return {
        x: x*canvas.width,
        y: canvas.height/2 - y*canvas.height/2
    }
}

function convertToWaveCoords(x, y) {
    return {
        x: x/canvas.width,
        y: (canvas.height/2 - y)/(canvas.height/2)
    }
}