const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=1000;
canvas.height=600;

const jogador={
    x:150,
    y:300,
    raio:20,
    cor:"blue",
    velocidade:4
};

const bola={
    x:500,
    y:300,
    raio:10,
    vx:0,
    vy:0
};

function desenharCampo(){

    ctx.fillStyle="#2f9e44";
    ctx.fillRect(0,0,1000,600);

    ctx.strokeStyle="white";
    ctx.lineWidth=4;

    ctx.strokeRect(40,40,920,520);

    ctx.beginPath();
    ctx.moveTo(500,40);
    ctx.lineTo(500,560);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(500,300,80,0,Math.PI*2);
    ctx.stroke();

}

function desenharJogador(){

    ctx.fillStyle=jogador.cor;

    ctx.beginPath();
    ctx.arc(
        jogador.x,
        jogador.y,
        jogador.raio,
        0,
        Math.PI*2
    );

    ctx.fill();

}

function desenharBola(){

    ctx.fillStyle="white";

    ctx.beginPath();
    ctx.arc(
        bola.x,
        bola.y,
        bola.raio,
        0,
        Math.PI*2
    );

    ctx.fill();

}

function atualizar(){

    ctx.clearRect(0,0,1000,600);

    desenharCampo();

    desenharJogador();

    desenharBola();

    requestAnimationFrame(atualizar);

}

atualizar();
