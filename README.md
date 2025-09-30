# 🎮 Flash Freeze - 3D Snow War Game

Um jogo de guerra de neve 3D inspirado nos clássicos jogos Flash, desenvolvido com Three.js e Cannon.js.

## 📁 Estrutura do Projeto

```
Flash Freeze/
├── 📁 game/                    # Jogo principal
│   ├── index.html              # Página principal do jogo
│   ├── css/                    # Estilos do jogo
│   │   └── style.css
│   └── js/                     # Código JavaScript do jogo
│       ├── main.js             # Controlador principal
│       ├── core/               # Motor do jogo
│       │   ├── GameEngine.js   # Motor 3D principal
│       │   └── SimplePhysics.js # Sistema de física
│       ├── entities/           # Entidades do jogo
│       │   ├── Character.js    # Personagens
│       │   ├── Snowball.js     # Bolas de neve
│       │   └── Barrier.js      # Barreiras
│       ├── mechanics/          # Mecânicas do jogo
│       │   ├── GameMechanics.js # Lógica do jogo
│       │   └── InputController.js # Controles
│       ├── ai/                 # Inteligência artificial
│       │   └── SimpleAI.js     # IA dos inimigos
│       └── ui/                 # Interface do usuário
│           ├── UIManager.js    # Gerenciador de UI
│           └── ConfigPanel.js  # Painel de configurações
├── 📁 editor/                  # Editor 3D
│   ├── index.html              # Editor principal
│   └── css/                    # Estilos do editor
│       └── main.css
├── 📁 assets/                  # Recursos do jogo
│   ├── models/                 # Modelos 3D
│   │   └── caracter/           # Personagens
│   │       ├── Floco-Boy.glb   # Modelo principal
│   │       ├── Floco-Boy.gltf  # Versão GLTF
│   │       └── scene.json      # Cena exportada
│   └── images/                 # Imagens e texturas
│       ├── Model Sheet*.png    # Sprites e referências
│       └── download.png        # Ícones
├── 📁 libs/                    # Bibliotecas externas
│   ├── three.min.js            # Three.js core
│   ├── cannon.min.js           # Cannon.js physics
│   ├── GLTFLoader.js           # Carregador GLTF/GLB
│   ├── OBJLoader.js            # Carregador OBJ
│   ├── FBXLoader.js            # Carregador FBX
│   ├── ColladaLoader.js        # Carregador Collada
│   ├── OrbitControls.js        # Controles de câmera
│   ├── TransformControls.js    # Controles de transformação
│   ├── AnimationMixer.js       # Sistema de animações
│   ├── AnimationClip.js        # Clipes de animação
│   └── AnimationAction.js      # Ações de animação
└── 📁 docs/                    # Documentação
    ├── README.md               # Este arquivo
    ├── README-OFFLINE.md       # Documentação offline
    ├── EDITOR_3D_DOCUMENTATION.md # Documentação do editor
    ├── manifest.json           # Manifesto PWA
    └── package.json            # Dependências Node.js
```

## 🚀 Como Executar

### 1. Servidor Local
```bash
# Navegue até a pasta do projeto
cd "C:\Users\caiom\OneDrive\PROJETOS\Games\New War Snow"

# Inicie o servidor HTTP
python -m http.server 8000

# Acesse no navegador
http://localhost:8000/game/index.html
```

### 2. Editor 3D
```bash
# Acesse diretamente o editor
http://localhost:8000/editor/index.html
```

## 🎮 Controles do Jogo

### Movimento
- **WASD** - Mover personagem
- **Mouse** - Rotacionar câmera
- **Scroll** - Zoom in/out
- **Shift + Mouse** - Pan da câmera

### Ações
- **Espaço** - Carregar e arremessar bola de neve
- **E** - Abrir editor 3D
- **C** - Capturar parâmetros da câmera

## 🛠️ Editor 3D

### Formatos Suportados
- **GLB/GLTF** - Padrão da indústria (texturas, animações)
- **OBJ** - Formato clássico universal
- **FBX** - Autodesk (animações complexas)
- **DAE** - Collada (formato universal)
- **JSON** - Three.js nativo (mais leve)

### Controles do Editor
- **Arrastar arquivo** - Importar modelo
- **G** - Mover objeto
- **R** - Rotacionar objeto
- **S** - Escalar objeto
- **ESC** - Desselecionar
- **SPACE** - Play/Pause animações

## 🎯 Recursos

### Jogo Principal
- ✅ Sistema de física realista com Cannon.js
- ✅ Personagens 3D com modelos personalizados
- ✅ Sistema de bolas de neve com física
- ✅ IA para inimigos
- ✅ Interface de usuário completa
- ✅ Sistema de configurações

### Editor 3D
- ✅ Suporte a múltiplos formatos 3D
- ✅ Sistema de animações
- ✅ Iluminação profissional
- ✅ Controles de transformação
- ✅ Estatísticas em tempo real
- ✅ Exportação para JSON

## 🔧 Tecnologias

- **Three.js** - Renderização 3D
- **Cannon.js** - Física
- **JavaScript ES6+** - Linguagem principal
- **HTML5/CSS3** - Interface
- **WebGL** - Aceleração gráfica

## 📝 Versão

- **Versão Atual**: 0.2.0
- **Data**: 2025-09-21
- **Status**: Em desenvolvimento ativo

## 🤝 Contribuição

Este é um projeto pessoal em desenvolvimento. Para sugestões ou problemas, abra uma issue no repositório.

## 📄 Licença

Projeto pessoal - Todos os direitos reservados.
