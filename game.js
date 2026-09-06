const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=1000;
canvas.height=600;

const CAMPO_X_MIN=40, CAMPO_X_MAX=960;
const CAMPO_Y_MIN=40, CAMPO_Y_MAX=560;
const GOL_Y_MIN=240, GOL_Y_MAX=360;
const GOL_PROFUNDIDADE=20;

const VELOCIDADE_USUARIO=3.6;
const DURACAO_TEMPO=180; // segundos por tempo

function clamp(v,min,max){
    return Math.min(Math.max(v,min),max);
}

// ---------- Times e jogadores ----------

const FORMACAO=[
    {role:"GK",  x:70,  y:300, numero:1},
    {role:"DEF", x:220, y:180, numero:2},
    {role:"DEF", x:220, y:420, numero:3},
    {role:"MEI", x:420, y:180, numero:4},
    {role:"MEI", x:420, y:420, numero:5},
    {role:"ATA", x:600, y:300, numero:9}
];

const VELOCIDADE_POR_FUNCAO={GK:2.2, DEF:2.6, MEI:2.8, ATA:3.0};

let jogadores=[];
let bola={x:500,y:300,vx:0,vy:0,raio:9};

let controlado=null;
let posse=null;
let semDonoCooldown=0;
let driblando=0;
let carrinhoCooldown=0;
let posseGraca=0;

let placarCasa=0;
let placarVisitante=0;
let tempoDecorrido=0;
let tempoAtual=1;
let pausado=false;
let golComemorando=false;
let jogoFinalizado=false;

function criarJogador(time,x,y,numero,role){
    return {
        time,
        x, y,
        xFormacao:x, yFormacao:y,
        vx:0, vy:0,
        raio:16,
        numero,
        role,
        velocidadeBase:VELOCIDADE_POR_FUNCAO[role],
        direcaoX: time==="casa"?1:-1,
        direcaoY:0
    };
}

function criarTimes(){
    jogadores=[];
    FORMACAO.forEach(f=>{
        jogadores.push(criarJogador("casa", f.x, f.y, f.numero, f.role));
    });
    FORMACAO.forEach(f=>{
        jogadores.push(criarJogador("visitante", 1000-f.x, f.y, f.numero, f.role));
    });
}

function jogadorMaisProximo(time, alvo, ignorar, semGoleiro){
    let melhor=null, menorDist=Infinity;
    jogadores.forEach(j=>{
        if(j.time!==time || j===ignorar) return;
        if(semGoleiro && j.role==="GK") return;
        const d=Math.hypot(j.x-alvo.x, j.y-alvo.y);
        if(d<menorDist){menorDist=d; melhor=j;}
    });
    return melhor;
}

// ---------- Desenho ----------

function desenharCampo(){

    ctx.fillStyle="#2f9e44";
    ctx.fillRect(0,0,1000,600);

    ctx.strokeStyle="white";
    ctx.lineWidth=4;

    ctx.strokeRect(CAMPO_X_MIN,CAMPO_Y_MIN,CAMPO_X_MAX-CAMPO_X_MIN,CAMPO_Y_MAX-CAMPO_Y_MIN);

    ctx.beginPath();
    ctx.moveTo(500,CAMPO_Y_MIN);
    ctx.lineTo(500,CAMPO_Y_MAX);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(500,300,80,0,Math.PI*2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(500,300,4,0,Math.PI*2);
    ctx.fillStyle="white";
    ctx.fill();

    ctx.strokeRect(CAMPO_X_MIN-GOL_PROFUNDIDADE, GOL_Y_MIN, GOL_PROFUNDIDADE, GOL_Y_MAX-GOL_Y_MIN);
    ctx.strokeRect(CAMPO_X_MAX, GOL_Y_MIN, GOL_PROFUNDIDADE, GOL_Y_MAX-GOL_Y_MIN);

}

function desenharJogador(j){

    ctx.beginPath();
    ctx.arc(j.x,j.y,j.raio,0,Math.PI*2);
    ctx.fillStyle = j.time==="casa" ? "#1565c0" : "#d32f2f";
    ctx.fill();
    ctx.lineWidth=2;
    ctx.strokeStyle="white";
    ctx.stroke();

    ctx.fillStyle="white";
    ctx.font="bold 12px Arial";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(j.numero, j.x, j.y);

}

function desenharIndicadorControlado(){
    ctx.beginPath();
    ctx.arc(controlado.x, controlado.y, controlado.raio+6, 0, Math.PI*2);
    ctx.strokeStyle="yellow";
    ctx.lineWidth=3;
    ctx.stroke();
}

function desenharBola(){

    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.arc(bola.x,bola.y,bola.raio,0,Math.PI*2);
    ctx.fill();
    ctx.lineWidth=1.5;
    ctx.strokeStyle="#333";
    ctx.stroke();

}

function desenharComemoracao(){
    if(!golComemorando) return;
    ctx.fillStyle="white";
    ctx.font="bold 60px Arial";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText("GOL!", 500, 300);
}

function desenhar(){
    ctx.clearRect(0,0,1000,600);
    desenharCampo();
    jogadores.forEach(desenharJogador);
    desenharBola();
    if(controlado) desenharIndicadorControlado();
    desenharComemoracao();
}

// ---------- Entrada (joystick + teclado) ----------

let joystickVetor={x:0,y:0};
const teclas={up:false,down:false,left:false,right:false};

function obterDirecaoEntrada(){
    let x=joystickVetor.x, y=joystickVetor.y;
    if(teclas.left) x-=1;
    if(teclas.right) x+=1;
    if(teclas.up) y-=1;
    if(teclas.down) y+=1;
    const mag=Math.hypot(x,y);
    if(mag>1){ x/=mag; y/=mag; }
    return {x,y};
}

function clampJogadorNoCampo(j){
    j.x=clamp(j.x, CAMPO_X_MIN+j.raio, CAMPO_X_MAX-j.raio);
    j.y=clamp(j.y, CAMPO_Y_MIN+j.raio, CAMPO_Y_MAX-j.raio);
}

function atualizarEntradaUsuario(){
    const dir=obterDirecaoEntrada();
    const velocidade = VELOCIDADE_USUARIO * (driblando>0 ? 1.5 : 1);
    controlado.vx = dir.x*velocidade;
    controlado.vy = dir.y*velocidade;
    controlado.x += controlado.vx;
    controlado.y += controlado.vy;
    clampJogadorNoCampo(controlado);
    if(Math.hypot(dir.x,dir.y)>0.1){
        controlado.direcaoX=dir.x;
        controlado.direcaoY=dir.y;
    }
    if(driblando>0) driblando--;
    if(carrinhoCooldown>0) carrinhoCooldown--;
}

// ---------- IA ----------

function moverJogadorPara(j, alvoX, alvoY){
    const dx=alvoX-j.x, dy=alvoY-j.y;
    const dist=Math.hypot(dx,dy);
    if(dist>4){
        const nx=dx/dist, ny=dy/dist;
        j.x += nx*j.velocidadeBase;
        j.y += ny*j.velocidadeBase;
        j.direcaoX=nx;
        j.direcaoY=ny;
    }
    clampJogadorNoCampo(j);
}

function atualizarIA(){
    const donoDaBola=posse;
    let casaChaser=null, visitanteChaser=null;
    if(!donoDaBola){
        casaChaser=jogadorMaisProximo("casa", bola, controlado, true);
        visitanteChaser=jogadorMaisProximo("visitante", bola, controlado, true);
    }

    jogadores.forEach(j=>{
        if(j===controlado) return;

        let alvoX=j.xFormacao, alvoY=j.yFormacao;

        if(donoDaBola===j){
            const golAlvoX = j.time==="casa" ? CAMPO_X_MAX : CAMPO_X_MIN;
            const variacaoY = ((j.numero%5)-2)*15;
            alvoX=golAlvoX;
            alvoY=300+variacaoY;
        } else if(donoDaBola){
            if(donoDaBola.time===j.time){
                alvoX = j.xFormacao + (bola.x-j.xFormacao)*0.3;
                alvoY = j.yFormacao + (bola.y-j.yFormacao)*0.15;
            } else if(j.role==="GK"){
                const distanciaAoGol=Math.hypot(donoDaBola.x-j.xFormacao, donoDaBola.y-300);
                if(distanciaAoGol<180){
                    alvoX = donoDaBola.x;
                    alvoY = donoDaBola.y;
                } else {
                    alvoX = j.xFormacao;
                    alvoY = clamp(bola.y, GOL_Y_MIN+15, GOL_Y_MAX-15);
                }
            } else if(j===jogadorMaisProximo(j.time, donoDaBola, controlado, true)){
                alvoX = donoDaBola.x;
                alvoY = donoDaBola.y;
            } else {
                alvoX = j.xFormacao + (bola.x-j.xFormacao)*0.15;
                alvoY = j.yFormacao + (bola.y-j.yFormacao)*0.15;
            }
        } else {
            const chaser = j.time==="casa" ? casaChaser : visitanteChaser;
            if(j===chaser){
                alvoX=bola.x;
                alvoY=bola.y;
            } else {
                alvoX = j.xFormacao + (bola.x-j.xFormacao)*0.1;
                alvoY = j.yFormacao + (bola.y-j.yFormacao)*0.1;
            }
        }

        moverJogadorPara(j, alvoX, alvoY);
    });

    if(donoDaBola && donoDaBola!==controlado){
        const golAlvoX = donoDaBola.time==="casa" ? CAMPO_X_MAX : CAMPO_X_MIN;
        const distGol=Math.hypot(golAlvoX-donoDaBola.x, 300-donoDaBola.y);
        if(distGol<200){
            chutarComo(donoDaBola, golAlvoX, 300);
        }
    }
}

// ---------- Bola e posse ----------

function atualizarPosseDeBola(){
    const CAPTURA=22;

    if(posse){
        bola.x = posse.x + posse.direcaoX*(posse.raio+bola.raio-2);
        bola.y = posse.y + posse.direcaoY*(posse.raio+bola.raio-2);
        bola.vx=0;
        bola.vy=0;

        if(posseGraca>0){
            posseGraca--;
        } else {
            const donoAtual=posse;
            for(const j of jogadores){
                if(!posse) break;
                if(j===donoAtual || j.time===donoAtual.time) continue;
                const d=Math.hypot(j.x-bola.x, j.y-bola.y);
                if(d<CAPTURA && Math.random()<0.012){
                    posse=null;
                    bola.vx=(Math.random()-0.5)*3;
                    bola.vy=(Math.random()-0.5)*3;
                    semDonoCooldown=8;
                }
            }
        }
    } else {
        if(semDonoCooldown>0){
            semDonoCooldown--;
            return;
        }
        const velocidadeBola=Math.hypot(bola.vx,bola.vy);
        if(velocidadeBola<3.2){
            let candidato=null, menorDist=Infinity;
            jogadores.forEach(j=>{
                const d=Math.hypot(j.x-bola.x, j.y-bola.y);
                if(d<CAPTURA && d<menorDist){menorDist=d; candidato=j;}
            });
            if(candidato) posse=candidato;
        }
    }
}

function atualizarBola(){
    if(posse) return;

    bola.x += bola.vx;
    bola.y += bola.vy;
    bola.vx *= 0.985;
    bola.vy *= 0.985;
    if(Math.abs(bola.vx)<0.05) bola.vx=0;
    if(Math.abs(bola.vy)<0.05) bola.vy=0;

    const dentroGolY = bola.y>GOL_Y_MIN && bola.y<GOL_Y_MAX;

    if(dentroGolY && bola.x-bola.raio<=CAMPO_X_MIN-GOL_PROFUNDIDADE){
        marcarGol("visitante");
        return;
    }
    if(dentroGolY && bola.x+bola.raio>=CAMPO_X_MAX+GOL_PROFUNDIDADE){
        marcarGol("casa");
        return;
    }

    if(!dentroGolY){
        if(bola.x-bola.raio<CAMPO_X_MIN){ bola.x=CAMPO_X_MIN+bola.raio; bola.vx=Math.abs(bola.vx)*0.6; }
        if(bola.x+bola.raio>CAMPO_X_MAX){ bola.x=CAMPO_X_MAX-bola.raio; bola.vx=-Math.abs(bola.vx)*0.6; }
    }
    if(bola.y-bola.raio<CAMPO_Y_MIN){ bola.y=CAMPO_Y_MIN+bola.raio; bola.vy=Math.abs(bola.vy)*0.6; }
    if(bola.y+bola.raio>CAMPO_Y_MAX){ bola.y=CAMPO_Y_MAX-bola.raio; bola.vy=-Math.abs(bola.vy)*0.6; }
}

function resolverColisoesJogadores(){
    for(let i=0;i<jogadores.length;i++){
        for(let k=i+1;k<jogadores.length;k++){
            const a=jogadores[i], b=jogadores[k];
            const dx=b.x-a.x, dy=b.y-a.y;
            const dist=Math.hypot(dx,dy)||0.01;
            const minDist=a.raio+b.raio;
            if(dist<minDist){
                const sobra=(minDist-dist)/2;
                const nx=dx/dist, ny=dy/dist;
                a.x-=nx*sobra; a.y-=ny*sobra;
                b.x+=nx*sobra; b.y+=ny*sobra;
            }
        }
    }
    jogadores.forEach(clampJogadorNoCampo);
}

// ---------- Ações ----------

function encontrarAlvoPasse(j){
    let melhor=null, melhorScore=-Infinity;
    jogadores.forEach(t=>{
        if(t===j || t.time!==j.time) return;
        const dx=t.x-j.x, dy=t.y-j.y;
        const d=Math.hypot(dx,dy)||1;
        const alinhamento=(dx/d)*j.direcaoX + (dy/d)*j.direcaoY;
        const score = alinhamento*2 - d*0.005;
        if(score>melhorScore){ melhorScore=score; melhor=t; }
    });
    return melhor;
}

function chutarComo(j, alvoX, alvoY){
    const dx=alvoX-bola.x, dy=alvoY-bola.y;
    const d=Math.hypot(dx,dy)||1;
    const FORCA=12;
    bola.vx=(dx/d)*FORCA;
    bola.vy=(dy/d)*FORCA;
    posse=null;
    semDonoCooldown=14;
}

function chutar(){
    if(posse!==controlado) return;
    const alvoX = controlado.time==="casa" ? CAMPO_X_MAX : CAMPO_X_MIN;
    chutarComo(controlado, alvoX, 300);
}

function passar(){
    if(posse!==controlado) return;
    const alvo=encontrarAlvoPasse(controlado);
    if(!alvo) return;
    const dx=alvo.x-bola.x, dy=alvo.y-bola.y;
    const d=Math.hypot(dx,dy)||1;
    const FORCA=7.5;
    bola.vx=(dx/d)*FORCA;
    bola.vy=(dy/d)*FORCA;
    posse=null;
    semDonoCooldown=10;
}

function driblar(){
    if(posse!==controlado) return;
    driblando=18;
}

function carrinho(){
    if(posse===controlado || carrinhoCooldown>0) return;
    const FORCA_LUNGE=9;
    controlado.x += controlado.direcaoX*FORCA_LUNGE;
    controlado.y += controlado.direcaoY*FORCA_LUNGE;
    clampJogadorNoCampo(controlado);
    const d=Math.hypot(controlado.x-bola.x, controlado.y-bola.y);
    if(d<controlado.raio+bola.raio+10 && posse && posse.time!==controlado.time){
        posse=null;
        bola.vx=(Math.random()-0.5)*3;
        bola.vy=(Math.random()-0.5)*3;
        semDonoCooldown=8;
    }
    carrinhoCooldown=40;
}

function trocarJogador(){
    const candidatos=jogadores.filter(j=>j.time==="casa" && j!==controlado);
    if(candidatos.length===0) return;
    candidatos.sort((a,b)=>
        Math.hypot(a.x-bola.x,a.y-bola.y) - Math.hypot(b.x-bola.x,b.y-bola.y)
    );
    controlado=candidatos[0];
}

function pausar(){
    pausado=!pausado;
    document.getElementById("pausar").textContent = pausado ? "Continuar" : "Pausa";
}

// ---------- Placar e tempo ----------

function pad(n){ return n<10 ? "0"+n : ""+n; }

function atualizarPlacar(){
    document.getElementById("resultado").textContent = `${placarCasa} x ${placarVisitante}`;
}

function atualizarRelogio(dt){
    tempoDecorrido += dt;
    const min=Math.floor(tempoDecorrido/60);
    const seg=Math.floor(tempoDecorrido%60);
    const label = tempoAtual===1 ? "1º Tempo" : "2º Tempo";
    document.getElementById("tempo").textContent = `${label} - ${pad(min)}:${pad(seg)}`;

    if(tempoAtual===1 && tempoDecorrido>=DURACAO_TEMPO){
        tempoAtual=2;
        tempoDecorrido=0;
        reiniciarPosicoes("visitante");
    } else if(tempoAtual===2 && tempoDecorrido>=DURACAO_TEMPO){
        jogoFinalizado=true;
        document.getElementById("tempo").textContent="Fim de Jogo";
    }
}

function reiniciarPosicoes(timeDoKickoff){
    jogadores.forEach(j=>{
        j.x=j.xFormacao;
        j.y=j.yFormacao;
        j.vx=0; j.vy=0;
        j.direcaoX = j.time==="casa" ? 1 : -1;
        j.direcaoY=0;
    });
    bola.x=500; bola.y=300; bola.vx=0; bola.vy=0;
    semDonoCooldown=0;
    controlado = jogadores.find(j=>j.time==="casa" && j.role==="ATA");

    const atacante = jogadores.find(j=>j.time===timeDoKickoff && j.role==="ATA");
    atacante.x = timeDoKickoff==="casa" ? 480 : 520;
    atacante.y = 300;
    posse = atacante;
    posseGraca=45;
}

function marcarGol(quem){
    if(quem==="casa") placarCasa++; else placarVisitante++;
    atualizarPlacar();
    golComemorando=true;
    posse=null;
    bola.vx=0; bola.vy=0;
    const quemSofreu = quem==="casa" ? "visitante" : "casa";
    setTimeout(()=>{
        reiniciarPosicoes(quemSofreu);
        golComemorando=false;
    }, 1200);
}

// ---------- Loop principal ----------

let ultimoTs=null;

function loop(ts){
    if(ultimoTs===null) ultimoTs=ts;
    const dt=(ts-ultimoTs)/1000;
    ultimoTs=ts;

    if(!pausado && !golComemorando && !jogoFinalizado){
        atualizarRelogio(dt);
        atualizarEntradaUsuario();
        atualizarIA();
        atualizarPosseDeBola();
        atualizarBola();
        resolverColisoesJogadores();
    }

    desenhar();
    requestAnimationFrame(loop);
}

// ---------- Entrada: joystick ----------

const joystickEl=document.getElementById("joystick");
const stickEl=document.getElementById("stick");
let arrastando=false;
const RAIO_JOYSTICK=70;

function centroJoystick(){
    const rect=joystickEl.getBoundingClientRect();
    return {x:rect.left+rect.width/2, y:rect.top+rect.height/2};
}

function moverStick(clientX, clientY){
    const c=centroJoystick();
    let dx=clientX-c.x, dy=clientY-c.y;
    const dist=Math.hypot(dx,dy);
    const max=RAIO_JOYSTICK-30;
    if(dist>max){ dx=dx/dist*max; dy=dy/dist*max; }
    stickEl.style.left=(40+dx)+"px";
    stickEl.style.top=(40+dy)+"px";
    joystickVetor={x:dx/max, y:dy/max};
}

function resetStick(){
    arrastando=false;
    joystickVetor={x:0,y:0};
    stickEl.style.left="40px";
    stickEl.style.top="40px";
}

joystickEl.addEventListener("pointerdown", e=>{
    arrastando=true;
    joystickEl.setPointerCapture(e.pointerId);
    moverStick(e.clientX, e.clientY);
});
joystickEl.addEventListener("pointermove", e=>{
    if(arrastando) moverStick(e.clientX, e.clientY);
});
joystickEl.addEventListener("pointerup", resetStick);
joystickEl.addEventListener("pointercancel", resetStick);

// ---------- Entrada: teclado ----------

window.addEventListener("keydown", e=>{
    switch(e.key){
        case "ArrowUp": case "w": case "W": teclas.up=true; break;
        case "ArrowDown": case "s": case "S": teclas.down=true; break;
        case "ArrowLeft": case "a": case "A": teclas.left=true; break;
        case "ArrowRight": case "d": case "D": teclas.right=true; break;
        case " ": chutar(); e.preventDefault(); break;
    }
});
window.addEventListener("keyup", e=>{
    switch(e.key){
        case "ArrowUp": case "w": case "W": teclas.up=false; break;
        case "ArrowDown": case "s": case "S": teclas.down=false; break;
        case "ArrowLeft": case "a": case "A": teclas.left=false; break;
        case "ArrowRight": case "d": case "D": teclas.right=false; break;
    }
});

// ---------- Entrada: botões ----------

document.getElementById("passe").addEventListener("click", passar);
document.getElementById("chute").addEventListener("click", chutar);
document.getElementById("drible").addEventListener("click", driblar);
document.getElementById("carrinho").addEventListener("click", carrinho);
document.getElementById("trocar").addEventListener("click", trocarJogador);
document.getElementById("pausar").addEventListener("click", pausar);

// ---------- Início ----------

criarTimes();
reiniciarPosicoes("casa");
atualizarPlacar();
requestAnimationFrame(loop);
