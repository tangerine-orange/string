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

    pull(position) {
        console.log('pull');
        console.log(position);
        const transition = Math.floor(position.x / canvas.width * this.N);
        const height = canvas.height/2 - position.y;
        console.log({transition, height});
        this.y[this.y.length - 1] = Array(this.N).fill().map((_, i) => {
            if (i < transition) {
                return 0 - (i / transition * height);
            } else {
                return -height + ((i - transition) / (this.N - transition) * height);
            }
        });
        // console.log(this.y.at(-1));
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
    wave.y.at(-1).forEach((y, i) => {
        const nextX = wave.dx * canvas.width * (i);
        const nextY = canvas.height/2 + wave.y.at(-1)[i];
        ctx.lineTo(nextX, nextY);
    })
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
    wave.pull({x: e.offsetX, y: e.offsetY});
    wave.pluck({x: e.offsetX, y: e.offsetY});
});

canvas.addEventListener('mousemove', (e) => {
    if (isClicked) {
        wave.pull({x: e.offsetX, y: e.offsetY});
    }
});