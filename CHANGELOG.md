# Changelog

## 1.1.0 — 2026-10-18

Composição mobile (até 600px) do hero e do footer.

- Hero mobile: o grupo agora é um pôster de 7 bustos sobrepostos, que entra com escala, rotação e ricochete (laterais primeiro, Super-Stack por último).
- Footer mobile: os heróis ficam em duas fileiras lado a lado (3 em cima, 4 embaixo), com a mesma animação de escala, rotação e ricochete.
- Ajuste do espaçamento do hero e do marquee do footer para as novas composições.
- Desktop e tablet sem mudanças.

## 1.0.0 — 2026-10-18

Primeira versão publicada.

- Preloader com logo em `stroke → fill` e contador "Deploying…".
- Hero com vídeo, camadas com parallax, título com `SplitText` e partículas em Three.js (desktop e mobile).
- 7 sections de heróis com template único e extras de personalidade.
- Mini-navegação lateral 01–07 com rolagem suave até a section.
- Footer revelado por baixo, com marquee infinito; fila de heróis (desktop) e formação de pôster (mobile).
- Composição própria do hero para mobile com os 7 bustos.
- Acessibilidade (`prefers-reduced-motion`, landmarks, foco, `alt`) e fallback sem GSAP.
- SEO: canonical, Open Graph/Twitter, JSON-LD, `robots.txt`, `sitemap.xml`, imagem de compartilhamento.
- Imagens otimizadas em `webp` com variantes responsivas; scripts do GSAP com SRI.
