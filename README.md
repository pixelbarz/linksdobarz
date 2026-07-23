<div align="center">

# linkboard

> página de links pessoal com estética de mangá/comic, terminal interativo e trilha sonora questionável (mas boa é serio)

[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-2d8659?style=flat-square&logo=github)](https://pixelbarz.github.io/linksdobarz/)
[![Feito com](https://img.shields.io/badge/feito%20com-HTML%20%2F%20CSS%20%2F%20JS-orange?style=flat-square)](#)
[![Status](https://img.shields.io/badge/status-online%20e%20tocando%20Persona%203-4ade80?style=flat-square)](#)

**[pixelbarz.github.io/linksdobarz](https://pixelbarz.github.io/linksdobarz/)**

</div>

---

## O que é isso?

Uma página de links pessoal (tipo Linktree, mas feita do zero e com personalidade). O visual imita um painel de HQ/mangá: fundo verde com halftone, contornos grossos de tinta, sombras deslocadas tipo página impressa, relógio em tempo real e um terminal funcional no canto da tela esperando você digitar `help`.

A música que toca por padrão é "Full Moon Full Life", de Persona 3 Reload. Não tem motivo técnico pra isso. Só tem que ser assim.

## Funcionalidades

**Visual**

- Tema com fundo halftone (pontos) animado, no estilo comic/mangá
- Painéis com contornos grossos e sombras deslocadas, imitando tinta e papel
- Relógio em tempo real no header da janela
- Animações com bounce nos hovers e na revelação da página
- Layout responsivo, fluido em desktop e mobile

**Terminal interativo**

- Abre com um botão dedicado na interface
- Aceita comandos customizados (`help`, `fastfetch`, `ls`, `open`, `music`, easter eggs escondidos)
- Fecha com o X ou clicando fora (como um modal normal de gente civilizada)

**Player de música**

- Toca uma faixa diretamente na página
- Animação de barras de equalização quando está reproduzindo
- Pausa sozinho quando a aba perde o foco (Page Visibility API)

**Links**

- Portfólio pessoal
- X / Twitter
- GitHub
- Your Gamer Profile
- Twitch

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura semântica da página |
| CSS3 | Layout, animações, efeitos visuais |
| JavaScript (vanilla) | Terminal, player de áudio, relógio |
| Share Tech Mono | Fonte monospace do terminal |
| Rajdhani | Fonte de exibição (título, labels) |
| Inter | Fonte principal do corpo do texto |
| GitHub Pages | Deploy e hospedagem |

Sem frameworks. Sem dependências. Sem `node_modules` com 300MB. Só três arquivos e a força de vontade.

## Estrutura do projeto

```
linksdobarz/
├── index.html   # Estrutura da página
├── style.css    # Todo o visual (halftone, animações, layout)
├── script.js    # Terminal, relógio, player de áudio
├── pfp.jpg      # Foto de perfil
├── fmfl.jpg     # Capa da música (Persona 3 Reload)
├── fmfl.mp3     # Full Moon Full Life (a música importante)
└── favicon.ico  # Ícone do site
```

## Rodando localmente

Não precisa de build, bundler, ou qualquer ritual de instalação. Só clonar e abrir.

## Licença

Sem licença formal. Usa como quiser, mas seria legal dar um crédito se for copiar a estrutura toda. Ou não. Você que sabe.

---

<div align="center">
feito por <a href="https://github.com/pixelbarz">@pixelbarz</a> // 2026
</div>