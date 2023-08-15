const canvas = document.getElementById('stringCanvas');
const ctx = canvas.getContext('2d');
const width = window.innerWidth * .7;
const height = window.innerHeight * .7;
ctx.canvas.width = width;
ctx.canvas.height = height;

class Wave {
    /**
     * Constants:
     *  c: wave speed
     *  gamma: damping constant
     *  dt
     *  dx
     */
    constructor(N) {
        this.N = N;
        this.x = Array(N).fill().map((_, i) => i/this.N);

        this.y = [];
        this.y.push(Array(N).fill().map(() => 0));
        this.y.push(Array(N).fill().map(() => 0));
        this.y.push(Array(N).fill().map(() => 0));

        this.y.push(Array(N).fill().map((_, i) => {
            const transition = N / 4;
            const height = 100;
            if (i < transition) {
                return 0 + (i / transition * height);
            } else {
                return height - ((i - transition) / (N - transition) * height);
            }
        }))

        this.gamma = 200;
        this.c = 1/100;
        this.dx = 1/this.N;
        this.dt = 0.1;
    }
}

function drawString(wave) {
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    wave.y.at(-1).forEach((y, i) => {
        const nextX = wave.dx * width * (i);
        const nextY = height/2 + wave.y.at(-1)[i];
        ctx.lineTo(nextX, nextY);
    })
    ctx.stroke();
}

const wave = new Wave(100);
drawString(wave);
