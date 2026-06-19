<div align="center">

# linkboard

> página de links pessoal com estética cyberpunk dark, terminal interativo e trilha sonora questionável (mas boa é serio)

[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue?style=flat-square&logo=github)](https://pixelbarz.github.io/linksdobarz/)
[![Feito com](https://img.shields.io/badge/feito%20com-HTML%20%2F%20CSS%20%2F%20JS-orange?style=flat-square)](#)
[![Status](https://img.shields.io/badge/status-online%20e%20tocando%20Evangelion-green?style=flat-square)](#)

**[pixelbarz.github.io/linksdobarz](https://pixelbarz.github.io/linksdobarz/)**

</div>

---

## O que é isso?

Uma página de links pessoal (tipo Linktree, mas feita do zero e com personalidade). O visual imita uma interface de sistema antigo: scanlines, fundo escuro, relógio em tempo real e um terminal funcional no canto da tela esperando você digitar `help`.

A música que toca por padrão é o opening do Evangelion. Não tem motivo técnico pra isso. Só tem que ser assim.

## Funcionalidades

**Visual**

- Tema dark com efeito de scanline animado
- Grid de fundo estilo terminal / HUD
- Relógio em tempo real no header da janela
- Layout em painéis inspirado em interfaces de sistema

**Terminal interativo**

- Abre com um botão dedicado na interface
- Aceita comandos customizados
- Fecha com o X ou clicando fora (como um modal normal de gente civilizada)

**Player de música**

- Toca uma faixa diretamente na página
- Animação de barras de equalização quando está reproduzindo
- Ícone de capa da música integrado ao layout

**Links**

- Portfólio pessoal
- X / Twitter
- GitHub
- Twitch

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura semântica da página |
| CSS3 | Layout, animações, efeitos visuais |
| JavaScript (vanilla) | Terminal, player de áudio, relógio |
| JetBrains Mono | Fonte monospace do terminal |
| Space Grotesk | Fonte principal da interface |
| GitHub Pages | Deploy e hospedagem |

Sem frameworks. Sem dependências. Sem `node_modules` com 300MB. Só três arquivos e a força de vontade.

## Estrutura do projeto

```
linksdobarz/
├── index.html       # Estrutura da página
├── style.css        # Todo o visual (scanlines, animações, layout)
├── script.js        # Terminal, relógio, player de áudio
├── barzpfpwoah.jpg  # Foto de perfil
├── 4555.jpg         # Capa da música
├── 4555.mp3         # A música em si
├── eva.png          # Capa alternativa (Evangelion)
├── eva.mp3          # Opening do Evangelion (a música importante)
└── favicon.ico      # Ícone do site
```

## Rodando localmente

Não precisa de build, bundler, ou qualquer ritual de instalação. Só clonar e abrir.

## Licença

Sem licença formal. Usa como quiser, mas seria legal dar um crédito se for copiar a estrutura toda. Ou não. Você que sabe.

---

<div align="center">
feito por <a href="https://github.com/pixelbarz">@pixelbarz</a> // 2026
</div>
