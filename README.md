# A Liga do Deploy — A Sociedade da Justiça Ágil

Landing page cinematográfica (dark mode, estética HQ/cyberpunk com glow neon) sobre sete heróis da tecnologia que atendem o chamado quando *"o sistema cai às 2 da manhã de uma sexta-feira"*.

**Site publicado:** <https://vitorrosadev.github.io/LigaDoDeploy/>
**Repositório:** <https://github.com/VitorRosaDev/LigaDoDeploy>

| Hero (desktop) | Sections dos heróis | Footer |
|---|---|---|
| vídeo + camadas com parallax + partículas "código caindo" | 7 sections com o mesmo template, tingidas pela cor-tema de cada herói | heróis revelados por baixo + marquee gigante |

## Os 7 heróis

| # | Herói | Cargo | Cor-tema |
|---|---|---|---|
| 01 | Super-Stack | Full-Stack Sênior | azul / laranja |
| 02 | Bashman | DevOps & SysAdmin | verde terminal |
| 03 | Mulher-Agile | Product Manager | verde-esmeralda |
| 04 | The Cache | Front-End Mobile | vermelho / ciano |
| 05 | Interface | UI/UX Designer | roxo |
| 06 | Dataman | DBA & Eng. de Dados | azul-elétrico / dourado |
| 07 | O Autômato | RPA & Automação | cinza-aço / amarelo |

## Stack

Sem framework e sem build: **HTML + CSS + JavaScript puros**.

- [GSAP 3.14.1](https://gsap.com/) via CDN (com SRI): `gsap`, `ScrollTrigger`, `ScrollSmoother`, `SplitText`
- [Three.js 0.160](https://threejs.org/) via `import()` dinâmico (só para as partículas do hero)
- Fontes do Google Fonts: Bebas Neue (display), Poppins (corpo) e JetBrains Mono (fichas técnicas)

## Como rodar localmente

Qualquer servidor estático serve (o site usa caminhos relativos):

```bash
npx serve .          # ou extensão Live Server do VS Code
```

Abra `http://localhost:3000` (ou a porta indicada). Não há `npm install` nem etapa de build.

## Estrutura

```
index.html        marcação semântica, SEO, JSON-LD, preloader, hero, 7 sections, footer
style.css         tokens em :root, template único das sections, extras, footer, breakpoints
script.js         ScrollSmoother, preloader, hero, partículas, animações, extras dos heróis
robots.txt        regras para buscadores
sitemap.xml       mapa do site
.nojekyll         desliga o Jekyll no GitHub Pages
assets/
  *.webp            imagens-fonte (slugs sem acento)
  og-liga-do-deploy.jpg   imagem de compartilhamento (1200×630)
  video/hero.mp4          vídeo de fundo do hero
  otimizadas/             variantes redimensionadas usadas pela página
docs/
  ARQUITETURA.md    decisões técnicas, animações, performance e acessibilidade
CHANGELOG.md        histórico de versões
```

## Efeitos

- **Preloader:** logo com `stroke-dashoffset → fill` e contador "Deploying… 0–100%", que só chega a 100% quando a imagem do hero carrega.
- **Hero:** vídeo + sala de servidores + grupo de heróis em camadas com parallax (`data-speed`), título gigante com `SplitText`, partículas em Three.js que reagem ao mouse/toque.
- **Sections dos heróis:** personagem com glow e flutuação, ficha técnica estilo terminal com barras de poder em `scrub`, texto com blur+opacity.
- **Extras de personalidade:** aura azul (Super-Stack), cursor de terminal (Bashman), barra "99% pronta?" que desmente (Mulher-Agile), speed-lines e selo "3G = ⚠" (The Cache), anel pulsante e botão "aumentar a logo" que foge (Interface), queries SQL flutuando (Dataman), glitch e contador de tarefas destruídas (O Autômato).
- **Navegação:** pontos laterais 01–07 que marcam a section ativa e rolam suavemente até ela.
- **Footer:** revelado por baixo (`y:-30%` em scrub), heróis entrando em stagger (fila de 7 fatias no desktop, duas fileiras 3 + 4 com animação em escala no mobile) e marquee infinito com `mix-blend-mode`.

## Responsivo

Breakpoints em **600px** e **1024px**.

- **Mobile:** o hero usa um pôster com os 7 bustos sobrepostos (`.ligaPoster`, entrada em escala/rotação/ricochete) e o footer usa duas fileiras lado a lado, 3 em cima e 4 embaixo (`.ligaFila`, mesma animação). O vídeo e as partículas rodam em versão mais leve (menos partículas, pixel ratio 1) e entram ~2,5s após o preloader.
- **Desktop/tablet:** imagem do grupo em tela cheia e fila de 7 heróis no footer.

## Acessibilidade

- `prefers-reduced-motion`: desliga ScrollSmoother, parallax, partículas, vídeo, preloader e animações; todo o conteúdo fica visível.
- Landmarks (`header`, `nav`, `main`, `footer`), hierarquia `h1 → h2 → h3`, `aria-label` descritivos, foco visível, link "Pular para o conteúdo".
- Imagens dos personagens com `alt` descritivo; elementos decorativos com `aria-hidden`.
- Os pontos laterais levam o foco do teclado para a section de destino.

## Desempenho e SEO (Lighthouse, build servida localmente)

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Desktop | 94 | 100 | 100 | 100 | 1,2 s | 0 | 30 ms |
| Mobile (4G lento, CPU 4×) | 91 | 100 | 100 | 100 | 3,1 s | 0 | 60 ms |

Principais técnicas: imagens `webp` com `width/height`, `srcset` e `<picture>` com variantes mobile, `loading="lazy"` fora do hero, preload da imagem do LCP, fontes não-bloqueantes, animações só em `transform`/`opacity`, loops de CSS pausados fora da tela, SRI nos scripts do GSAP. SEO: `title`, `description`, canonical, Open Graph/Twitter Card com imagem 1200×630, JSON-LD `WebSite`, `robots.txt` e `sitemap.xml`.

Se o GSAP (CDN) não carregar, a página aparece em modo estático e legível.

## Personalização rápida

- **Cor de um herói:** variáveis `--tema-*` / `--tema2-*` em `:root` (`style.css`) e o atributo `style="--tema:…"` da section em `index.html`.
- **Novo herói:** copie uma `<section class="secaoHeroi">`, ajuste `id`, `data-lado`, `data-num` e o tema, e inclua o link no `nav.navDots`.
- **Posição dos heróis do pôster mobile (hero):** variáveis `--x`, `--y`, `--w`, `--r` das classes `.ph-*`.
- **Fileiras do footer mobile:** ordem dos `<figure class="fh">` em `.ligaFila` (os 3 primeiros são a fileira de cima; `grid-column: span 4` / `span 3` no `style.css`).
- **Velocidade do marquee:** `animation` de `.textoInfinito h4`.

## Publicação (GitHub Pages)

O site é servido direto da branch `main` (raiz do repositório). Qualquer `git push` na `main` republica a página em alguns minutos.

## Créditos e licença

Arte dos personagens e vídeo gerados por IA. A técnica de animação (GSAP, ScrollSmoother, SplitText, footer revelado, marquee) segue padrões de um site de estudo; nenhum conteúdo de terceiros é reutilizado. Todos os direitos reservados ao autor, **Vitor Rosa**, salvo indicação em contrário.

> © Liga do Deploy — testado em produção
