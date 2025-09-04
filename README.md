# 🛍️ Compia - Loja Virtual

Uma plataforma moderna de e-commerce desenvolvida com React, TypeScript e Tailwind CSS para a venda de livros e produtos editoriais.

## 📋 Sobre o Projeto

O **Compia** é uma loja virtual completa desenvolvida para editoras, oferecendo uma experiência de compra moderna e intuitiva. O projeto foi construído com foco em performance, acessibilidade e escalabilidade.

### 🎯 Principais Funcionalidades

- **Catálogo de Produtos**: Exibição organizada de livros físicos, e-books e kits
- **Sistema de Carrinho**: Adição e remoção de produtos com cálculo automático
- **Checkout Simplificado**: Processo de compra responsivo e intuitivo
- **Gestão de Pedidos**: Controle completo de pedidos e clientes
- **Painel Administrativo**: Interface intuitiva para acompanhamento de pedidos
- **Integração com Pagamentos**: Suporte a principais gateways (PagSeguro, Mercado Pago, Stripe, PayPal)
- **Notificações Automáticas**: E-mails automáticos para confirmações
- **Suporte a PIX**: QR Code e chave aleatória para pagamentos
- **Integração com Correios**: Cálculo automático de frete e impostos

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento client-side
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes UI reutilizáveis
- **Lucide React** - Ícones modernos
- **Class Variance Authority** - Utilitário para variantes de componentes

### Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **Prettier** - Formatador de código
- **PostCSS** - Processador CSS
- **Autoprefixer** - Prefixos CSS automáticos

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/GuilhermeBoia/compia-pweb.git
cd compia-pweb
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto em desenvolvimento**
```bash
npm run dev
```

4. **Acesse a aplicação**
```
http://localhost:5173
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento

# Build
npm run build        # Gera build de produção
npm run preview      # Visualiza o build de produção

# Linting
npm run lint         # Executa o ESLint
npm run lint:fix     # Corrige problemas de linting automaticamente
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── layout/         # Componentes de layout
│   └── new-file.tsx    # Componente criado
├── pages/              # Páginas da aplicação
│   ├── Home.tsx        # Página inicial
│   ├── Page.tsx       # Sobre nós
│   └── NotFound.tsx    # Página 404
├── lib/                # Utilitários e configurações
├── assets/             # Recursos estáticos
├── App.tsx             # Componente principal
├── main.tsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## 🎨 Componentes Shadcn/ui

O projeto utiliza o [shadcn/ui](https://ui.shadcn.com/) para componentes UI consistentes e acessíveis.

### Como Adicionar Novos Componentes

1. **Instale um componente**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

2. **Importe e use**
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Clique aqui</Button>
      </CardContent>
    </Card>
  )
}
```
A partir dos componentes importados pode criar os novos componentes utilizando eses.

## 📄 Criando Novas Páginas

### 1. Crie o arquivo da página
```tsx
// src/pages/Products.tsx
export default function Products() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Nossos Produtos
        </h1>
        {/* Conteúdo da página */}
      </div>
    </div>
  )
}
```

### 2. Adicione a rota no App.tsx
```tsx
// src/App.tsx
import Products from './pages/Products'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} /> {/* Nova rota */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

## 🎯 Convenções de Código

### Estrutura de Componentes
```tsx
// Componente funcional com TypeScript
interface ComponentProps {
  title: string
  children?: React.ReactNode
}

export default function Component({ title, children }: ComponentProps) {
  return (
    <div className="component-container">
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

### Nomenclatura
- **Arquivos**: kebab-case para arquivos (`product-card.tsx`)
- **Componentes**: PascalCase (`ProductCard`)
- **Funções**: camelCase (`getProductById`)
- **Variáveis**: camelCase (`productList`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Estilização
- Use **Tailwind CSS** para estilização
- Prefira classes utilitárias sobre CSS customizado
- Mantenha consistência com o design system
- Use variáveis CSS para cores e espaçamentos

## 🔧 Configurações

### Tailwind CSS
O projeto está configurado com Tailwind CSS v4. As configurações estão em:
- `tailwind.config.js` - Configurações do Tailwind
- `src/index.css` - Estilos globais e imports

### TypeScript
- `tsconfig.json` - Configurações gerais
- `tsconfig.app.json` - Configurações da aplicação
- `tsconfig.node.json` - Configurações do Node.js

### ESLint
- `eslint.config.js` - Configurações do linter
- Regras específicas para React e TypeScript
