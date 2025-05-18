# 🔐 Extensão PUC-SP AutoLogin

Uma extensão Chrome elegante e consciente da privacidade que armazena seu **RA** e **Senha** localmente, permitindo **login automático** no [Portal PUC-SP](https://portal.fundasp.org.br/FrameHTML/web/app/edu/PortalEducacional/login/), e outras funcionalidades, como: **Login automático no Acervo (Biblioteca Digital)**, e 2 redirects para a página de login.

<div align="center">
  <img src="public/puc-main.png" alt="Logo PUC-SP" width="120"/>
</div>

## ✨ Funcionalidades

- ✅ Salve seu **RA** e **Senha** de forma segura usando `chrome.storage.local`
- 🔄 Preenchimento automático das credenciais de login ao visitar o portal e o Acervo
- 🎚️ Ative/desative o comportamento de preenchimento automático com um toggle
- 🎨 Interface com esquemas de cor PUC-SP

## 📸 Prévia
<div align="center">
  <img src="https://github.com/user-attachments/assets/b437f08a-80ca-4584-bfe2-15521c9998c6" alt="Captura de Tela da Prévia da Extensão" width="300"/>
  <!-- Texto alternativo ajustado e largura adicionada para melhor controle -->
</div>

## 📁 Estrutura de Arquivos
```
PUCLogin/
├── public/
│ └── puc-main.png
│ └── puc128.png
├── src/
│ ├── main.html # Interface do Popup
│ ├── main.css # Estilização customizada para o popup
│ ├── input.js # Lógica do popup (salvar credenciais, estados dos interruptores)
│ ├── contentScript.js # Lógica de preenchimento automático para a página de login principal
│ ├── background.js # Gerencia redirecionamentos e outras tarefas em segundo plano
│ └── acervoContentScript.js # Lógica de preenchimento automático para a página do Acervo
├── manifest.json # Configuração da extensão Chrome
├── .gitignore
├── LICENSE
└── README.md # Este arquivo
```
## 🔧 Como Usar (Modo Desenvolvedor)

1. Clone ou baixe este repositório.
2. Abra o **Chrome** e acesse `chrome://extensions/`.
3. Ative o **Modo Desenvolvedor** (canto superior direito).
4. Clique em **“Carregar sem compactação”** e selecione a pasta da extensão.
5. Clique no ícone da extensão para testar o popup.
6. Visite o portal de login e aproveite o preenchimento automático!

## 🔐 Privacidade em Primeiro Lugar

Todos os dados são armazenados **localmente** no seu navegador usando `chrome.storage.local`.
O seu Login não pode ser acessado online.
[Para mais informações, clique aqui.]

## ✅ Permissões Utilizadas

- `"storage"`: Para salvar seu RA e senha.
- `"activeTab"`: Para acessar a aba atualmente aberta (opcional em funcionalidades futuras).
- `"scripting"`: Para potencialmente injetar scripts na página de login.

## 📜 Licença

Licença Unlicense

---
<p align="center">
  Feito pensando nos meus colegas estudantes da PUC-SP.
</p>

[Para mais informações, clique aqui.]: https://developer.chrome.com/docs/extensions/mv2/reference/storage?hl=pt-br "explicação do chrome.storage."
