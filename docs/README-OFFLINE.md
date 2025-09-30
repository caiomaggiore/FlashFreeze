# New War Snow - Versão Offline Completa

## 📁 Estrutura de Arquivos Necessária

```
New War Snow/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── core/
│   │   ├── GameEngine.js
│   │   └── SimplePhysics.js
│   ├── entities/
│   │   ├── Character.js
│   │   ├── Snowball.js
│   │   └── Barrier.js
│   ├── mechanics/
│   │   ├── InputController.js
│   │   └── GameMechanics.js
│   ├── ai/
│   │   └── SimpleAI.js
│   ├── ui/
│   │   └── UIManager.js
│   └── main.js
└── libs/           ← PASTA ESSENCIAL
    ├── three.min.js    ← OBRIGATÓRIO
    └── cannon.min.js   ← RECOMENDADO
```

## 🚀 Como Garantir Funcionamento Offline

### Bibliotecas Já Incluídas:
✅ **three.min.js** - Renderização 3D (633KB)
✅ **cannon.min.js** - Física realística (132KB)
✅ **SimplePhysics.js** - Sistema de física backup

### Verificação:
1. Certifique-se que a pasta `libs/` existe
2. Verifique se `libs/three.min.js` existe (obrigatório)
3. Verifique se `libs/cannon.min.js` existe (recomendado)

## 🎮 Como Testar Offline

1. **Desconecte da internet** ou desative WiFi
2. **Abra index.html** diretamente no navegador
3. **Verifique o console** (F12) para ver mensagens:
   - `✅ Usando Cannon.js local` = Melhor caso
   - `⚡ Usando sistema de física simplificado` = Backup funcionando

## 🔧 Solução de Problemas

### Se aparecer erro de "Three.js não encontrado":
1. Baixe: https://unpkg.com/three@0.152.2/build/three.min.js
2. Salve como: `libs/three.min.js`

### Se aparecer erro de "Cannon.js não encontrado":
- **Não é crítico!** O jogo funcionará com física simplificada
- Para física completa, baixe: https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.20.0/cannon.min.js
- Salve como: `libs/cannon.min.js`

## 🌟 Vantagens da Versão Offline

- ✅ **Zero dependência de internet**
- ✅ **Carregamento instantâneo**
- ✅ **Funciona em qualquer lugar**
- ✅ **Sem problemas de CDN**
- ✅ **Sistema de backup automático**

## 🎯 Controles do Jogo

- **Setas**: Mover personagem ativo
- **Tab**: Trocar entre personagens
- **S**: Fazer bola de neve (3 segundos)
- **Espaço**: Carregar força e lançar
- **ESC**: Pausar jogo

## 📊 Status das Bibliotecas

| Biblioteca | Status | Tamanho | Função |
|------------|--------|---------|---------|
| Three.js | ✅ Local | 633KB | Renderização 3D |
| Cannon.js | ✅ Local | 132KB | Física realística |
| SimplePhysics | ✅ Incluído | 5KB | Backup de física |

**Total**: ~770KB para funcionamento completo offline!

---

🎉 **Seu jogo agora é 100% offline e portátil!**
