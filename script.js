//  A LIGA DO DEPLOY — ANIMAÇÕES COM ROLAGEM, PRELOADER, HERO E EXTRAS

/* ---------- FALLBACK: se o GSAP (CDN) não carregar, a página fica estática e legível ---------- */
if (!window.gsap || !window.ScrollTrigger || !window.ScrollSmoother || !window.SplitText) {
  document.getElementById("preloader")?.remove();
  document.documentElement.classList.add("fontesProntas", "reduzMovimento");
  throw new Error("GSAP indisponível: página exibida em modo estático.");
}

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

/* ---------- PREFERÊNCIAS / CAPACIDADES ---------- */
const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// desktop = tela larga + mouse (no mobile o vídeo e as partículas rodam em versão mais leve)
const ehDesktop = window.matchMedia("(min-width: 1025px) and (hover: hover) and (pointer: fine)").matches;

if (reduzMovimento) document.documentElement.classList.add("reduzMovimento");

/* ---------- SCROLLSMOOTHER (desligado com reduced-motion) ---------- */
let suavizador = null;
if (!reduzMovimento) {
  suavizador = ScrollSmoother.create({
    smooth: 1.2,
    effects: true, // habilita data-speed / data-lag
  });
  suavizador.paused(true); // pausa até o preloader terminar
}

/* ---------- ROLAGEM SUAVE PARA ÂNCORAS (dots laterais, CTA do hero, menu) ---------- */
let tweenRolagem = null;

function rolarPara(seletor) {
  const alvo = document.querySelector(seletor);
  if (!alvo) return;

  if (suavizador) {
    // anima a posição de scroll com easing; a duração cresce com a distância (0,9s a 2,2s)
    const destino = suavizador.offset(alvo, "top top");
    const posicao = { y: suavizador.scrollTop() };
    if (tweenRolagem) tweenRolagem.kill();
    tweenRolagem = gsap.to(posicao, {
      y: destino,
      duration: gsap.utils.clamp(0.9, 2.2, Math.abs(destino - posicao.y) / 2500),
      ease: "power3.inOut",
      onUpdate: () => suavizador.scrollTo(posicao.y, false),
    });
  } else {
    alvo.scrollIntoView({ behavior: "auto", block: "start" }); // reduced-motion: sem animação
  }

  // acessibilidade: leva o foco do teclado para a section de destino
  if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
  alvo.focus({ preventScroll: true });
}

// se a pessoa girar a roda ou tocar na tela durante a animação, ela cede o controle
["wheel", "touchstart", "keydown"].forEach((evento) =>
  window.addEventListener(evento, () => tweenRolagem && tweenRolagem.kill(), { passive: true })
);

document.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", (evento) => {
    const destino = link.getAttribute("href");
    evento.preventDefault(); // inclui os links fictícios do footer (href="#")
    if (destino.length > 1) rolarPara(destino);
  });
});

/* ---------- VÍDEO DO HERO (desktop e mobile; poster se houver economia de dados) ---------- */
function iniciarVideoHero() {
  const economiaDeDados = navigator.connection && navigator.connection.saveData;
  if (reduzMovimento || economiaDeDados) return; // fica só o poster
  const video = document.querySelector(".heroVideo");
  const fonte = video && video.querySelector("source[data-src]");
  if (!fonte) return;
  fonte.src = fonte.dataset.src;
  video.load();
  video.addEventListener(
    "canplay",
    () => {
      video.classList.add("pronto");
      video.play().catch(() => {});
    },
    { once: true }
  );
  // pausa o vídeo quando o hero sai da tela
  new IntersectionObserver(([entrada]) => {
    if (!video.classList.contains("pronto")) return;
    entrada.isIntersecting ? video.play().catch(() => {}) : video.pause();
  }).observe(video);
}

/* ---------- HERO: timeline montada atrás do preloader ---------- */
let tlHero = null;

function prepararHero() {
  if (reduzMovimento) return;
  tlHero = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  // fundo e grupo NÃO começam com opacity 0: assim a imagem do LCP já é pintada sob o preloader
  tlHero.from(".heroFundo", { scale: 1.12, duration: 1.6 }, 0);
  if (window.matchMedia("(max-width: 600px)").matches) {
    // mobile: pôster de 7 bustos — os laterais "surgem" primeiro e o líder por último
    const ordem = [".ph-automato", ".ph-dataman", ".ph-agile", ".ph-interface", ".ph-cache", ".ph-bashman"];
    tlHero.from(ordem.map((s) => document.querySelector(s)), {
      y: 110,
      scale: 0.6,
      opacity: 0,
      rotate: (i) => (i % 2 ? 10 : -10),
      duration: 0.8,
      ease: "back.out(1.5)",
      stagger: 0.14,
    }, 0.3);
    tlHero.from(".ph-superstack", { y: 140, scale: 0.5, opacity: 0, duration: 1, ease: "back.out(1.7)" }, 1.0);
  } else {
    tlHero.from(".heroGrupo", { y: 60, duration: 1.4 }, 0.1);
  }
  tlHero.from(".heroStatus", { opacity: 0, y: 14, duration: 0.6 }, 0.3);

  // título gigante: chars entrando com stagger (SplitText com máscara por linha)
  const splitTitulo = SplitText.create(".heroTitulo .linhaTitulo", {
    type: "chars",
    mask: "lines",
    aria: "none", // o h1 já tem aria-label; evita aria-label proibido nos spans
  });
  tlHero.from(splitTitulo.chars, { yPercent: 110, duration: 0.9, stagger: 0.045, ease: "power4.out" }, 0.3);
  tlHero.from(".heroSubtitulo", { opacity: 0, y: 20, duration: 1 }, 0.9);
  tlHero.from(".heroTagline", { opacity: 0, y: 20, duration: 0.8 }, 1.1);
  tlHero.from(".hero .botaoPrincipal", { opacity: 0, y: 20, duration: 0.8 }, 1.3);
  tlHero.from(".indicadorScroll", { opacity: 0, duration: 1 }, 1.7);
}

/* ---------- ANIMAÇÕES DA PÁGINA (liberadas após o preloader) ---------- */
function animarPagina() {
  if (suavizador) suavizador.paused(false);
  // vídeo e partículas são pesados: no mobile entram um pouco depois, para não disputar banda/CPU com o LCP
  const atraso = ehDesktop ? 0 : 2500;
  setTimeout(() => {
    iniciarVideoHero();
    iniciarParticulas();
  }, atraso);
  iniciarHerois();

  if (reduzMovimento) return;

  // ANIMAÇÕES HERO (a timeline foi montada com o preloader; aqui só dispara)
  if (tlHero) tlHero.play();

  // títulos .textoSplit (padrão da referência): chars + máscara por linha
  document.querySelectorAll(".textoSplit").forEach((texto) => {
    const split = SplitText.create(texto, { type: "lines, words, chars", mask: "lines" });
    gsap.from(split.chars, {
      y: 40,
      opacity: 0,
      duration: 0.3,
      stagger: 0.03,
      scrollTrigger: { trigger: texto, start: "top 88%" },
    });
  });

  // ANIMAÇÕES DAS SECTIONS DOS HERÓIS (template único)
  gsap.utils.toArray(".secaoHeroi").forEach((secao) => {
    const sentido = secao.dataset.lado === "esquerda" ? -1 : 1;
    const personagem = secao.querySelector(".personagem picture");
    const conteudo = secao.querySelector(".conteudoHeroi");
    const ficha = secao.querySelector(".fichaTecnica");

    // personagem entra de lado (só opacity + transform; sem blur em imagem grande)
    gsap.from(personagem, {
      opacity: 0,
      x: 90 * sentido,
      scale: 0.94,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: { trigger: secao, start: "top 65%" },
    });

    // glow cresce com a rolagem
    gsap.from(secao.querySelector(".glowHeroi"), {
      scale: 0.4,
      opacity: 0,
      scrollTrigger: { trigger: secao, start: "top 90%", end: "top 30%", scrub: true },
    });

    // blocos de texto: blur + opacity em scrub (padrão .card da referência), um gatilho por bloco
    conteudo.querySelectorAll(":scope > :not(.nomeHeroi)").forEach((bloco) => {
      gsap.from(bloco, {
        opacity: 0,
        y: 30,
        filter: "blur(8px)",
        scrollTrigger: { trigger: bloco, start: "top 94%", end: "top 72%", scrub: true },
      });
    });

    // linhas da ficha entram em sequência
    gsap.from(ficha.querySelectorAll(".linhaFicha"), {
      opacity: 0,
      x: 24,
      stagger: 0.2,
      scrollTrigger: { trigger: ficha, start: "top 85%", end: "top 55%", scrub: true },
    });

    // barras de poder preenchem em scrub
    gsap.from(ficha.querySelectorAll(".barra i"), {
      scaleX: 0,
      stagger: 0.15,
      ease: "none",
      scrollTrigger: { trigger: ficha, start: "top 80%", end: "bottom 55%", scrub: true },
    });
  });

  // Mulher-Agile: a barra "99% pronta?" sobe e a espada da Verdade desmente
  const verdade = document.querySelector("[data-verdade]");
  if (verdade) {
    const barra = verdade.querySelector(".verdadeTrilho i");
    const resultado = verdade.querySelector(".verdadeResultado");
    verdade.classList.add("confiando");
    gsap.set(barra, { scaleX: 0 });
    gsap.set(resultado, { opacity: 0 });
    const tlVerdade = gsap.timeline({
      scrollTrigger: { trigger: verdade, start: "top 80%", once: true },
    });
    tlVerdade
      .to(barra, { scaleX: 0.99, duration: 1.6, ease: "power2.out" })
      .to({}, { duration: 0.6 })
      .add(() => verdade.classList.remove("confiando"))
      .to(barra, { scaleX: 0.63, duration: 0.6, ease: "back.out(2.2)" })
      .to(resultado, { opacity: 1, duration: 0.4 }, "<0.2")
      .fromTo(verdade, { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.25)" }, "<");
  }

  // ANIMAÇÕES FOOTER
  // footer revelado por baixo da main (mesmo padrão da referência)
  gsap.from("footer", {
    y: "-30%",
    immediateRender: false,
    ease: "none",
    scrollTrigger: {
      trigger: "footer",
      scrub: true,
      invalidateOnRefresh: true,
      end: "100% 100%",
    },
  });

  // os 7 heróis do footer entram em stagger (cada layout com a sua animação)
  const mm = gsap.matchMedia();

  // desktop/tablet: fila de 7 fatias sobe em sequência
  mm.add("(min-width: 601px)", () => {
    gsap.from(".rodapeHerois .fatia", {
      y: 90,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ".rodapeHerois", start: "top 92%" },
    });
  });

  // mobile: duas fileiras (3 em cima, 4 embaixo) — os heróis "surgem" em escala, o líder por último
  mm.add("(max-width: 600px)", () => {
    const ordem = [".fh-agile", ".fh-interface", ".fh-automato", ".fh-dataman", ".fh-cache", ".fh-bashman"];
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ".ligaFila", start: "top 85%" },
    });
    tl.from(ordem.map((s) => document.querySelector(s)), {
      y: 110,
      scale: 0.6,
      opacity: 0,
      rotate: (i) => (i % 2 ? 10 : -10),
      duration: 0.8,
      ease: "back.out(1.5)",
      stagger: 0.14,
    });
    tl.from(".fh-superstack", { y: 140, scale: 0.5, opacity: 0, duration: 1, ease: "back.out(1.7)" }, "-=0.35");
  });

  // marquee: pausa quando o footer está fora da tela
  const marquee = document.querySelector(".textoInfinito");
  if (marquee) {
    new IntersectionObserver(([entrada]) => {
      marquee.querySelectorAll("h4").forEach((h4) => {
        h4.style.animationPlayState = entrada.isIntersecting ? "running" : "paused";
      });
    }).observe(marquee);
  }
}

/* ---------- PARTÍCULAS "CÓDIGO CAINDO" (Three.js; versão leve no mobile; com fallback) ---------- */
function iniciarParticulas() {
  const canvas = document.querySelector(".heroParticulas");
  if (!canvas) return;
  if (reduzMovimento) {
    canvas.remove(); // fallback: sem canvas com reduced-motion
    return;
  }

  // import dinâmico do módulo ES (a build clássica three.min.js está obsoleta)
  import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js")
    .then((THREE) => montarParticulas(canvas, THREE))
    .catch(() => canvas.remove()); // sem CDN, sem partículas — a página segue normal
}

function montarParticulas(canvas, THREE) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
  } catch (erro) {
    canvas.remove(); // WebGL indisponível
    return;
  }
  renderer.setPixelRatio(ehDesktop ? Math.min(window.devicePixelRatio, 1.5) : 1); // mobile: pixel ratio 1 para poupar bateria

  const cena = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);

  const TOTAL = ehDesktop ? 700 : 380; // menos partículas no mobile
  const posicoes = new Float32Array(TOTAL * 3);
  const sementes = new Float32Array(TOTAL);
  for (let i = 0; i < TOTAL; i++) {
    posicoes[i * 3] = Math.random() * 2 - 1; // x normalizado (multiplicado pelo aspecto no shader)
    posicoes[i * 3 + 1] = Math.random() * 2 - 1;
    posicoes[i * 3 + 2] = 0;
    sementes[i] = Math.random();
  }
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute("position", new THREE.BufferAttribute(posicoes, 3));
  geometria.setAttribute("aSemente", new THREE.BufferAttribute(sementes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTempo: { value: 0 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uAspecto: { value: 1 },
      uEscala: { value: renderer.getPixelRatio() },
    },
    vertexShader: `
      attribute float aSemente;
      uniform float uTempo; uniform vec2 uMouse; uniform float uAspecto; uniform float uEscala;
      varying float vAlfa;
      void main() {
        float vel = 0.12 + aSemente * 0.35;
        float y = mod(position.y - uTempo * vel + 1.0, 2.0) - 1.0;
        vec2 p = vec2(position.x * uAspecto, y);
        // repulsão suave pelo mouse
        vec2 d = p - uMouse;
        float forca = exp(-dot(d, d) * 7.0);
        p += normalize(d + 0.0001) * forca * 0.22;
        vAlfa = (0.25 + aSemente * 0.75) * (0.4 + 0.6 * smoothstep(-1.0, 0.6, y)) + forca * 0.5;
        gl_Position = vec4(p.x / uAspecto, p.y, 0.0, 1.0);
        gl_PointSize = (2.0 + aSemente * 5.0) * uEscala;
      }`,
    fragmentShader: `
      varying float vAlfa;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float quadrado = step(max(abs(c.x), abs(c.y)), 0.38);
        gl_FragColor = vec4(0.22, 1.0, 0.53, vAlfa * quadrado);
      }`,
  });
  cena.add(new THREE.Points(geometria, material));

  const ajustar = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    material.uniforms.uAspecto.value = w / h;
    camera.left = -w / h;
    camera.right = w / h;
    camera.updateProjectionMatrix();
  };
  ajustar();
  window.addEventListener("resize", ajustar);

  // mouse relativo ao hero (coordenadas do mundo ortográfico)
  const hero = canvas.parentElement;
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
    material.uniforms.uMouse.value.set(nx * (r.width / r.height), ny);
  });

  // só renderiza com o hero visível
  let visivel = true;
  new IntersectionObserver(([entrada]) => (visivel = entrada.isIntersecting)).observe(hero);
  const relogio = performance.now();
  renderer.setAnimationLoop(() => {
    if (!visivel || document.hidden) return;
    material.uniforms.uTempo.value = (performance.now() - relogio) / 1000;
    renderer.render(cena, camera);
  });
}

/* ---------- HERÓIS: COMPORTAMENTOS (valem também com reduced-motion) ---------- */
function iniciarHerois() {
  const secoes = gsap.utils.toArray(".secaoHeroi");
  const dots = gsap.utils.toArray(".navDots a");
  const navDots = document.querySelector(".navDots");

  // pausa as animações infinitas (CSS) das sections fora da tela
  const observador = new IntersectionObserver(
    (entradas) => entradas.forEach((e) => e.target.classList.toggle("emTela", e.isIntersecting)),
    { rootMargin: "10% 0px" }
  );
  secoes.forEach((secao) => observador.observe(secao));

  // mini-navegação lateral: mostra após o hero e marca a section ativa
  ScrollTrigger.create({
    trigger: "#super-stack",
    endTrigger: "#automato",
    start: "top 70%",
    end: "bottom 30%",
    onToggle: (self) => navDots.classList.toggle("visivel", self.isActive),
  });

  secoes.forEach((secao) => {
    ScrollTrigger.create({
      trigger: secao,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => {
        if (!self.isActive) return;
        const corTema = getComputedStyle(secao).getPropertyValue("--tema").trim();
        navDots.style.setProperty("--tema-nav", corTema);
        dots.forEach((dot) => {
          const ativo = dot.getAttribute("href") === "#" + secao.id;
          dot.classList.toggle("ativo", ativo);
          if (ativo) dot.setAttribute("aria-current", "true");
          else dot.removeAttribute("aria-current");
        });
      },
    });
  });

  iniciarBotaoLogo();
  iniciarContadorAutomato();
}

/* Interface: o botão "aumentar a logo" foge do mouse (e do toque) */
function iniciarBotaoLogo() {
  const zona = document.querySelector("[data-zona-logo]");
  const botao = document.querySelector("[data-botao-logo]");
  const resposta = document.querySelector("[data-resposta-logo]");
  if (!zona || !botao) return;

  const frases = ["Nem pensar.", "A logo já está enorme.", "Tenta de novo… sem sucesso.", "Cria um ticket no help desk."];
  let contagem = 0;

  // clique (teclado ou mouse que conseguiu alcançar) → resposta bem-humorada
  botao.addEventListener("click", () => {
    resposta.textContent = frases[contagem++ % frases.length];
  });

  if (reduzMovimento) return; // sem fuga: o botão fica parado

  const moverX = gsap.quickTo(botao, "x", { duration: 0.35, ease: "power3.out" });
  const moverY = gsap.quickTo(botao, "y", { duration: 0.35, ease: "power3.out" });

  function fugir(ponteiroX, ponteiroY) {
    const z = zona.getBoundingClientRect();
    const b = botao.getBoundingClientRect();
    const atualX = gsap.getProperty(botao, "x");
    const atualY = gsap.getProperty(botao, "y");
    const centroX = b.left + b.width / 2;
    const centroY = b.top + b.height / 2;
    let dx = centroX - ponteiroX;
    let dy = centroY - ponteiroY;
    const dist = Math.hypot(dx, dy) || 1;
    dx = (dx / dist) * 130;
    dy = (dy / dist) * 70;
    // mantém o botão dentro da zona
    const minX = z.left - (b.left - atualX) + 4;
    const maxX = z.right - b.width - (b.left - atualX) - 4;
    const minY = z.top - (b.top - atualY) + 4;
    const maxY = z.bottom - b.height - (b.top - atualY) - 4;
    let novoX = gsap.utils.clamp(minX, maxX, atualX + dx);
    let novoY = gsap.utils.clamp(minY, maxY, atualY + dy);
    // encurralado? teletransporta para outro ponto da zona
    if (Math.abs(novoX - atualX) < 10 && Math.abs(novoY - atualY) < 10) {
      novoX = gsap.utils.random(minX, maxX);
      novoY = gsap.utils.random(minY, maxY);
    }
    moverX(novoX);
    moverY(novoY);
  }

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const b = botao.getBoundingClientRect();
    const dist = Math.hypot(b.left + b.width / 2 - e.clientX, b.top + b.height / 2 - e.clientY);
    if (dist < 120) fugir(e.clientX, e.clientY);
  });

  // toque: foge ao encostar (o clique por teclado continua funcionando)
  botao.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    e.preventDefault();
    fugir(e.clientX, e.clientY);
  });
}

/* Autômato: contador "tarefas manuais destruídas" */
function iniciarContadorAutomato() {
  const alvo = document.querySelector("[data-contador-tarefas]");
  if (!alvo) return;
  const formatar = (n) => Math.floor(n).toLocaleString("pt-BR");
  let total = 12847;
  alvo.textContent = formatar(total);
  if (reduzMovimento) return;

  let intervalo = null;
  const secao = alvo.closest(".secaoHeroi");
  let jaContou = false;

  new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting) {
      if (!jaContou) {
        jaContou = true;
        const estado = { n: 0 };
        gsap.to(estado, {
          n: total,
          duration: 2.2,
          ease: "power2.out",
          onUpdate: () => (alvo.textContent = formatar(estado.n)),
        });
      }
      // depois continua destruindo tarefas enquanto estiver na tela
      intervalo =
        intervalo ||
        setInterval(() => {
          total += gsap.utils.random(1, 6, 1);
          alvo.textContent = formatar(total);
        }, 900);
    } else {
      clearInterval(intervalo);
      intervalo = null;
    }
  }).observe(secao);
}

/* ---------- PRELOADER: TIMELINE (stroke → fill + contador) ---------- */
function liberarPagina() {
  gsap.to("#preloader", {
    opacity: 0,
    duration: 0.6,
    display: "none",
    onComplete: () => document.getElementById("preloader")?.remove(),
  });
  animarPagina();
}

function rodarPreloader() {
  document.documentElement.classList.add("fontesProntas");
  if (reduzMovimento) {
    document.getElementById("preloader")?.remove();
    animarPagina();
    return;
  }

  prepararHero();

  const texto = document.querySelector("#preloader text");
  const numero = document.getElementById("contadorNumero");
  const barra = document.getElementById("barraCarga");

  // comprimento real do traço para o stroke-dashoffset
  const comprimento = Math.ceil(texto.getComputedTextLength() * 2.2);
  gsap.set(texto, { strokeDasharray: comprimento, strokeDashoffset: comprimento });

  // o contador não passa de 92% enquanto a imagem do hero não terminar de carregar
  const progresso = { valor: 0 };
  let heroPronto = false;
  const imagemHero = document.querySelector(".heroFundo img");
  const marcarPronto = () => (heroPronto = true);
  if (imagemHero.complete) marcarPronto();
  else {
    imagemHero.addEventListener("load", marcarPronto, { once: true });
    imagemHero.addEventListener("error", marcarPronto, { once: true });
  }
  setTimeout(marcarPronto, 4000); // trava de segurança

  const tl = gsap.timeline({
    onComplete() {
      liberarPagina();
    },
  });

  tl.to(texto, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0);
  tl.to(texto, { fill: "rgba(57, 255, 136, 0.9)", duration: 0.4 }, 1.0);
  tl.to(
    progresso,
    {
      valor: 92,
      duration: 1.3,
      ease: "power1.out",
      onUpdate() {
        numero.textContent = Math.round(progresso.valor);
        gsap.set(barra, { scaleX: progresso.valor / 100 });
      },
    },
    0
  );
  // espera o hero e fecha em 100%
  tl.add(() => {
    tl.pause();
    const concluir = () => {
      gsap.to(progresso, {
        valor: 100,
        duration: 0.35,
        ease: "none",
        onUpdate() {
          numero.textContent = Math.round(progresso.valor);
          gsap.set(barra, { scaleX: progresso.valor / 100 });
        },
        onComplete: () => tl.resume(),
      });
    };
    const checar = setInterval(() => {
      if (heroPronto) {
        clearInterval(checar);
        concluir();
      }
    }, 60);
  });
  tl.to({}, { duration: 0.2 }); // respiro com 100% na tela
}

// aguarda as fontes para medir o texto do preloader corretamente
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(rodarPreloader);
