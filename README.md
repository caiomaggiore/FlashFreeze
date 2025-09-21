# ❄️ Flash Freeze

**Um jogo de guerra de bolas de neve em 3D inspirado no clássico Macromedia Flash "Snow War"**

![Flash Freeze Game](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Three.js](https://img.shields.io/badge/Three.js-r150+-blue)
![Cannon.js](https://img.shields.io/badge/Physics-Cannon.js-green)
![Offline](https://img.shields.io/badge/Mode-100%25%20Offline-brightgreen)

## 🎮 Sobre o Jogo

Flash Freeze é uma recriação moderna do clássico jogo de guerra de bolas de neve, desenvolvido com tecnologias web modernas (Three.js e Cannon.js). O jogo oferece uma experiência 3D imersiva onde você comanda um time de soldados em batalhas épicas de bolas de neve contra inimigos controlados por IA.

## ✨ Funcionalidades Atuais

### 🎯 **Mecânicas de Jogo**
- **Movimento tático**: Use as setas para mover seus personagens pelo campo de batalha
- **Sistema de corrida**: Pressione Shift + setas para movimentos mais rápidos
- **Criação de munição**: Pressione 'S' por 3 segundos para fazer uma bola de neve
- **Lançamento com força variável**: Pressione e segure 'Espaço' para carregar a força do lançamento
- **Troca de personagens**: Use Tab para alternar entre seus 3 soldados
- **Barreiras funcionais**: Use obstáculos para se proteger (exceto de ataques aéreos)

### 🎨 **Sistema Visual**
- **Gráficos 3D**: Ambiente totalmente tridimensional com iluminação e sombras
- **Animações fluidas**: Agachamento ao fazer bolas e inclinação ao lançar
- **Indicadores visuais**: Barras de vida, progresso de bola de neve e indicador de personagem ativo
- **Previsão de trajetória**: Linha roxa mostra onde sua bola de neve vai cair
- **Efeitos de impacto**: Partículas e marcas de impacto realistas

### 🤖 **Inteligência Artificial**
- **IA adaptativa**: Inimigos com comportamentos defensivos e ofensivos
- **Controle automático**: Personagens não controlados agem autonomamente
- **Escalabilidade de dificuldade**: Sistema preparado para múltiplos níveis

### ⚙️ **Configurações**
- **Painel de ajustes**: Pressione 'C' para acessar configurações em tempo real
- **Velocidades customizáveis**: Ajuste velocidade de caminhada e corrida
- **Tamanho do passo**: Configure a distância de movimento por tecla
- **Altura dos personagens**: Ajuste fino da posição vertical

## 🎯 Missão

Recriar a nostalgia dos jogos clássicos de Flash com tecnologia moderna, oferecendo:
- **Acessibilidade total**: 100% offline, sem dependências externas
- **Jogabilidade intuitiva**: Controles simples mas estratégia profunda
- **Experiência imersiva**: Gráficos 3D modernos mantendo a simplicidade do original

## 🌟 Valores do Projeto

- **🔒 Privacidade**: Totalmente offline, seus dados ficam com você
- **🎮 Diversão**: Gameplay envolvente para todas as idades  
- **🚀 Performance**: Otimizado para rodar em qualquer navegador moderno
- **📖 Código Aberto**: Transparente e modificável pela comunidade
- **🎨 Criatividade**: Incentiva modificações e personalizações

## 🕹️ Como Jogar

### Controles Básicos
| Tecla | Ação |
|-------|------|
| `Setas` | Mover personagem |
| `Shift + Setas` | Correr |
| `Tab` | Trocar personagem |
| `S` | Fazer bola de neve (3s) |
| `Espaço` | Carregar força e lançar |
| `C` | Abrir configurações |

### Controles de Câmera
| Controle | Ação |
|----------|------|
| `Click Esquerdo + Arrastar` | Rotacionar câmera |
| `Click Direito + Arrastar` | Pan (mover X/Y) |
| `Scroll` | Zoom in/out |

### Objetivo
Elimine todos os inimigos (personagens vermelhos) usando estratégia e precisão. Use as barreiras para se proteger e coordene seus 3 soldados para a vitória!

## 🚀 Como Executar

1. **Clone o repositório**:
   ```bash
   git clone git@github.com:caiomaggiore/FlashFreeze.git
   cd FlashFreeze
   ```

2. **Inicie um servidor HTTP local**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Ou Python 2
   python -m SimpleHTTPServer 8000
   
   # Ou Node.js
   npx http-server
   ```

3. **Acesse no navegador**:
   ```
   http://localhost:8000
   ```

## 🛠️ Tecnologias Utilizadas

- **[Three.js](https://threejs.org/)** - Engine 3D para renderização
- **[Cannon.js](https://cannonjs.org/)** - Physics engine para colisões realistas
- **JavaScript ES6+** - Lógica do jogo e interações
- **HTML5 Canvas** - Interface e controles
- **CSS3** - Estilização da UI

## 📁 Estrutura do Projeto

```
FlashFreeze/
├── index.html              # Página principal
├── css/
│   └── style.css           # Estilos da interface
├── js/
│   ├── core/
│   │   ├── GameEngine.js   # Motor principal do jogo
│   │   └── SimplePhysics.js # Física alternativa
│   ├── entities/
│   │   ├── Character.js    # Lógica dos personagens
│   │   ├── Snowball.js     # Física das bolas de neve
│   │   └── Barrier.js      # Obstáculos do jogo
│   ├── mechanics/
│   │   ├── GameMechanics.js # Regras e progressão
│   │   └── InputController.js # Controles do jogador
│   ├── ai/
│   │   └── SimpleAI.js     # Inteligência artificial
│   ├── ui/
│   │   ├── UIManager.js    # Interface do usuário
│   │   └── ConfigPanel.js  # Painel de configurações
│   └── main.js             # Inicialização do jogo
├── libs/
│   ├── three.min.js        # Three.js local
│   └── cannon.min.js       # Cannon.js local
└── README.md               # Este arquivo
```

## 🔮 Roadmap Futuro

- **🏆 Sistema de níveis**: Progressão através de bairros com dificuldade crescente
- **👥 Narrativa**: História de guerra entre gangues de bairro
- **🎮 Modo multiplayer**: Batalhas online entre jogadores
- **🥽 Versão VR**: Adaptação para realidade virtual com Unity
- **🎵 Audio**: Efeitos sonoros e trilha sonora imersiva
- **📱 Mobile**: Versão otimizada para dispositivos móveis

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Caio Maggiore**
- GitHub: [@caiomaggiore](https://github.com/caiomaggiore)
- Email: [seu-email@exemplo.com]

---

⭐ **Gostou do projeto? Deixe uma estrela no repositório!**

*Flash Freeze - Onde a nostalgia encontra a tecnologia moderna* ❄️🎮
