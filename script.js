const canvas = document.getElementById('stringCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * .7;
canvas.height = window.innerHeight * .7;

let animating = true;

class Wave {
    constructor(N) {
        this.N = N;
        this.x = Array(N + 1).fill().map((_, i) => i/this.N);

        this.y = [];
        this.y.push(Array(N + 1).fill().map(() => 0));
        this.y.push(Array(N + 1).fill().map(() => 0));
        this.y.push(Array(N + 1).fill().map(() => 0));

        this.gamma = 30;
        this.c = 1/200;
        this.dx = 1/this.N;
        this.dt = 0.1;
    }

    pull(position) {
        this.y[this.y.length - 1] = Array(this.N + 1).fill().map((_, i) => {
            if (this.x[i] < position.x) {
                return this.x[i] / position.x * position.y;
            } else {
                return position.y * (1 - (this.x[i] - position.x) / (1 - position.x));
            }

        });

        drawString(this, () => {});
    }

    pluck(position) {
        this.y.push(Array(this.N + 1).fill().map((_, i) => {
            if (this.x[i] < position.x) {
                return this.x[i] / position.x * position.y;
            } else {
                return position.y * (1 - (this.x[i] - position.x) / (1 - position.x));
            }
        }));
    }

    step() {
        const {dx, dt, c, y, gamma, N} = this;
        const y_n = y.at(-1);
        const y_nminus1 = y.at(-2);
        let y_nplus1 = Array(N + 1).fill();
        y_nplus1[0] = y_nplus1[y_nplus1.length - 1] = y_nplus1[1] = y_nplus1[y_nplus1.lenght - 2] = 0;
        
        y_nplus1 = y_nplus1.map((yVal, i) => {
            if (i === 0 || i === y_nplus1.length - 1 || i === 1 || i === y_nplus1.length - 1) return yVal;

            const terms = [
                1/dx**2 * (y_n[i + 1] - 2*y_n[i] + y_n[i-1]),
                -1 * 1/(c*dt)**2 * (y_nminus1[i] - 2*y_n[i]),
                gamma/(2*dt) * y_nminus1[i]
            ]

            return 1/(1/(c*dt)**2 + (gamma)/(2*dt)) * (
                (
                    1/dx**2 * (y_n[i + 1] - 2*y_n[i] + y_n[i-1])
                    // 0
                ) - (
                    1/(c*dt)**2 * (y_nminus1[i] - 2*y_n[i])
                    // 0
                ) + (
                    gamma/(2*dt) * y_nminus1[i]
                    // 0
                )
            )
        })

        this.y.push(y_nplus1)
        this.y = this.y.slice(1);
    }

    start(callback) {
        for (let i = 0; i < 100; i++) {
            wave.step();
        }
        drawString(wave, callback);
        requestAnimationFrame(() => {this.start(callback)});
    }
}

const wave = new Wave(256);


function drawString(wave, callback) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let i = 1; i < wave.N + 1; i++) {
        const canvasCoords = convertToCanvasCoords(wave.x[i], wave.y.at(-1)[i]);
        // if (i % 20 === 0) {

        // }
        ctx.lineTo(canvasCoords.x, canvasCoords.y);
    }
    // wave.y.at(-1).forEach((y, i) => {
    //     const nextX = wave.dx * canvas.width * (i);
    //     const nextY = canvas.height/2 + wave.y.at(-1)[i];
    //     ctx.lineTo(nextX, nextY);
    // })
    ctx.stroke();
    callback && callback()
}

let isClicked = false;

canvas.addEventListener('mousedown', () => {
    isClicked = true;
    animating = false;
});

canvas.addEventListener('mouseup', (e) => {
    isClicked = false;
    const waveCoords = convertToWaveCoords(e.offsetX, e.offsetY);
    wave.pull(waveCoords);
    wave.pluck(waveCoords);

    animating = true;
    // animate();
});

canvas.addEventListener('mousemove', (e) => {
    if (isClicked) {
        const waveCoords = convertToWaveCoords(e.offsetX, e.offsetY);
        wave.pull(waveCoords);
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        wave.step();
        drawString(wave);
    }
})

function animate(callback) {
    console.log('animate');
    if (animating) {
        for (let i = 0; i < 100; i++) {
            wave.step();
        }
        drawString(wave, callback);
        requestAnimationFrame(() => {animate(callback)});
    }
}

function convertToCanvasCoords(x, y) {
    return {
        x: x*canvas.width,
        y: canvas.height/2 - y*canvas.height/2
    }
}

/**
 * In wave coordinates, the canvas width is 1 and the canvas height is 1/2.
 * So the top right corner (1,1), bottom right (1, -1), top left (0, 1), bottom left (0, -1)
 */
function convertToWaveCoords(x, y) {
    return {
        x: x/canvas.width,
        y: (canvas.height/2 - y)/(canvas.height/2)
    }
}

window.onload = () => {
    startButton.addEventListener('click', () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        console.log('click');
        const startAudio = async (context) => {
            await context.audioWorklet.addModule('bypass-processor.js');
            const oscillator = new OscillatorNode(context);
            console.log('oscillator');
            console.log(oscillator);
            const bypasser = new AudioWorkletNode(context, 'bypass-processor');
            oscillator.connect(bypasser).connect(context.destination);
            oscillator.start();

            animate(() => {
                console.log('callback');
                bypasser.port.postMessage({
                    type: 'setAmplitudeArray', amplitudeArray: wave.y.at(-1)
                });
            });
        };

        startAudio(audioContext);
    })
}
