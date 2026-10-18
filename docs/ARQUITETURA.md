# Arquitetura e decisões técnicas

## Visão geral

Página única estática. Três arquivos de código (`index.html`, `style.css`, `script.js`), sem build. Toda a lógica de movimento depende do GSAP; todo o conteúdo funciona sem ele.

```
#preloader (fixo)  ·  header fixo  ·  nav.navDots (fixo)      ← fora do smooth-wrapper
#smooth-wrapper
  #smooth-content
    main#conteudo        z-index 2, fundo sólido (cobre o footer)
      section.hero#topo
      section.secaoHeroi × 7
    footer.rodape        revelado por baixo (y:-30% em scrub)
```

Elementos `position: fixed` ficam fora do `#smooth-wrapper`, porque o ScrollSmoother aplica `transform` no conteúdo e quebraria o `fixed`.

## Ordem de execução (`script.js`)

1. **Guarda de falha:** se o GSAP não carregou, remove o preloader e deixa a página estática.
2. Detecta `prefers-reduced-motion` e capacidades (`ehDesktop`).
3. Cria o `ScrollSmoother` (pausado) — exceto com reduced-motion.
4. `rodarPreloader()` espera `document.fonts.ready`, monta a timeline do hero (pausada, atrás do preloader) e roda a timeline do preloader. O contador pára em 92% até a imagem do hero carregar.
5. `animarPagina()` (ao fim do preloader): libera o scroll, dispara a timeline do hero, cria os `SplitText` e todos os `ScrollTrigger`s. Vídeo e partículas iniciam logo (desktop) ou após 2,5s (mobile).

## Template único das sections

Cada herói é uma `<section class="secaoHeroi" data-lado data-num style="--tema:…;--tema2:…">` com a mesma estrutura. O CSS é um só; **só `--tema`/`--tema2` variam**. `data-lado="direita"` inverte o layout. Os extras de personalidade são elementos extras opcionais dentro do template (ex.: `.auraAzul`, `.speedLines`, `.ondasSql`).

Animações por section (em `animarPagina`): personagem entra de lado, glow cresce em `scrub`, cada bloco de texto faz blur+opacity em `scrub` (um gatilho por bloco), linhas da ficha e barras de poder preenchem em `scrub`.

## Footer

- **Reveal:** `gsap.from("footer", { y: "-30%", scrub })` com a `main` cobrindo o footer. Por isso há `padding-top` generoso no footer: sem ele, a cabeça dos heróis ficaria escondida sob a `main` durante o efeito.
- **Desktop/tablet:** a imagem `liga-footer-opt-*.webp` é fatiada em 7 colunas (`background-size: 700%`) para entrar em stagger.
- **Mobile (≤600px):** a fila é substituída por uma formação de pôster com 7 bustos (`.ligaPoster`), animada com `gsap.matchMedia`.
- **Marquee:** dois `h4` com `translateX(-100%)` em loop, `mix-blend-mode: color-dodge`, opacidade reduzida e posicionado à frente dos heróis.

## Imagens

| Uso | Arquivo |
|---|---|
| Hero desktop (LCP) | `otimizadas/liga-grupo-800/1280.webp` (+ original 1672w) |
| Hero mobile (LCP) | `otimizadas/liga-busto-m.webp` — composição dos 7 bustos, transparente |
| Fundo do hero | `otimizadas/main-edit-1280.webp` / `main-edit-m.webp` |
| Heróis nas sections | `otimizadas/<slug>-640/960.webp` |
| Footer desktop | `otimizadas/liga-footer-opt-1920/1100.webp` |
| Compartilhamento | `og-liga-do-deploy.jpg` (1200×630) |

As variantes foram geradas com Pillow a partir das imagens-fonte. `liga-busto-m.webp` é composta com recortes do topo (cabeça até o peito) de cada personagem, com brilho na cor-tema e fade na base.

## Performance

- Só `transform`/`opacity` nas animações contínuas; blur apenas pequeno (8px) e em `scrub`, nunca em imagens grandes.
- Animações CSS infinitas pausam fora da tela (classe `.emTela` via `IntersectionObserver`); o vídeo, o canvas e o marquee também pausam.
- O hero começa visível sob o preloader (sem `opacity: 0` na imagem do LCP) e o conteúdo textual só aparece quando as fontes chegam (evita CLS).
- Fontes com `display=block` e carregamento não-bloqueante; scripts do GSAP com SRI.
- O vídeo só carrega depois do preloader, nunca com `saveData` ativo.
- Partículas: shader próprio em `Points` (700 no desktop, 380 no mobile), pixel ratio ≤ 1,5 (1 no mobile).

## Acessibilidade

Ver `README.md`. Pontos de atenção do código: o `SplitText` do título do hero usa `aria: "none"` e o `h1` tem `aria-label`; o selo "3G = ⚠" tem texto equivalente só para leitor de tela; `rolarPara()` move o foco para a section de destino.

## Decisões e limitações conhecidas

- **Typos do briefing** foram corrigidos nos textos (ex.: "cavaleiro sombrio").
- **Mulher-Agile** não tem "fraqueza" no briefing, então a section mostra ARMAS e a barra "99% pronta?".
- **Valores das barras de poder** são fictícios, decorativos.
- **Links do footer** (institucionais e redes sociais) são fictícios (`href="#"`).
- **Three.js** é importado dinamicamente de CDN, sem SRI (limitação de `import()`); se falhar, as partículas somem e a página segue normal.
- **LCP no mobile** (≈3,1s na simulação do Lighthouse) é o ponto mais fraco; reduzir ainda mais o JS/imagens do hero é o próximo passo.
