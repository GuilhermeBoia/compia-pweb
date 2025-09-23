import type { Product, NewProductInput, UpdateProductInput } from '@/types/product'
import { nanoid } from 'nanoid'

// Storage key for localStorage
const MOCK_PRODUCTS_KEY = 'mock_products'

// Helper to convert File to Base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Helper to get mock products from localStorage
function getMockProducts(): Product[] {
  const stored = localStorage.getItem(MOCK_PRODUCTS_KEY)
  if (stored) {
    return JSON.parse(stored)
  }

  // Initial mock data
  const initialProducts: Product[] = [
    {
      id: '1',
      titulo: 'Código Limpo',
      autor: 'Robert C. Martin',
      descricao: 'Um manual de artesanato de software ágil',
      preco: 89.90,
      estoque: 15,
      tipo: 'fisico',
      categorias: ['Programação', 'Boas Práticas'],
      tags: ['codigo-limpo', 'refatoracao', 'agil'],
      capaUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      imageUrls: [],
      createdAt: Date.now() - 86400000 * 7,
      updatedAt: Date.now() - 86400000 * 2
    },
    {
      id: '2',
      titulo: 'Padrões de Projeto',
      autor: 'Gang of Four',
      descricao: 'Elementos de software orientado a objetos reutilizável',
      preco: 129.90,
      estoque: 8,
      tipo: 'ebook',
      categorias: ['Programação', 'Arquitetura'],
      tags: ['padroes', 'poo', 'projeto-de-software'],
      capaUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
      imageUrls: [],
      createdAt: Date.now() - 86400000 * 14,
      updatedAt: Date.now() - 86400000 * 5
    },
    {
      id: '3',
      titulo: 'O Programador Pragmático',
      autor: 'David Thomas, Andrew Hunt',
      descricao: 'Sua jornada rumo à maestria',
      preco: 79.90,
      estoque: 20,
      tipo: 'fisico',
      categorias: ['Programação', 'Carreira'],
      tags: ['pragmatico', 'boas-praticas', 'carreira'],
      capaUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      imageUrls: [],
      createdAt: Date.now() - 86400000 * 21,
      updatedAt: Date.now() - 86400000 * 3
    },
    {
      id: '4',
      titulo: 'Introdução aos Algoritmos',
      autor: 'Thomas H. Cormen',
      descricao: 'Publicação da MIT Press',
      preco: 199.90,
      estoque: 5,
      tipo: 'fisico',
      categorias: ['Algoritmos', 'Ciência da Computação'],
      tags: ['algoritmos', 'estruturas-de-dados', 'mit'],
      capaUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
      imageUrls: [],
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 10
    },
    {
      id: '5',
      titulo: 'Inteligência Artificial: Uma Abordagem Moderna',
      autor: 'Stuart Russell, Peter Norvig',
      descricao: 'O principal livro-texto em IA',
      preco: 249.90,
      estoque: 12,
      tipo: 'ebook',
      categorias: ['IA', 'Aprendizado de Máquina'],
      tags: ['ia', 'am', 'redes-neurais'],
      capaUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400',
      imageUrls: [],
      createdAt: Date.now() - 86400000 * 45,
      updatedAt: Date.now() - 86400000 * 1
    }
  ]

  localStorage.setItem(MOCK_PRODUCTS_KEY, JSON.stringify(initialProducts))
  return initialProducts
}

// Helper to save mock products
function saveMockProducts(products: Product[]) {
  localStorage.setItem(MOCK_PRODUCTS_KEY, JSON.stringify(products))
}

// API Service
export const api = {
  products: {
    // List all products
    async list(): Promise<Product[]> {
      return getMockProducts()
    },

    // Get a single product
    async getById(id: string): Promise<Product | undefined> {
      const products = getMockProducts()
      return products.find(p => p.id === id)
    },

    // Create a new product
    async create(input: NewProductInput & { capaUrl?: string; imageUrls?: string[] }): Promise<Product> {
      const now = Date.now()
      const newProduct: Product = {
        id: nanoid(),
        titulo: input.titulo,
        autor: input.autor,
        descricao: input.descricao,
        preco: input.preco,
        estoque: input.estoque,
        tipo: input.tipo,
        categorias: input.categorias || [],
        tags: input.tags || [],
        capaUrl: input.capaUrl, // Now uses the Base64 URL passed from useProducts
        imageUrls: input.imageUrls || [],
        createdAt: now,
        updatedAt: now
      }

      const products = getMockProducts()
      products.push(newProduct)
      saveMockProducts(products)
      return newProduct
    },

    // Update a product
    async update(id: string, input: UpdateProductInput): Promise<Product | undefined> {
      const products = getMockProducts()
      const index = products.findIndex(p => p.id === id)

      if (index === -1) return undefined

      const existing = products[index]
      const updated: Product = {
        ...existing,
        ...input,
        id: existing.id, // Keep original ID
        createdAt: existing.createdAt, // Keep original creation date
        updatedAt: Date.now()
      }

      products[index] = updated
      saveMockProducts(products)
      return updated
    },

    // Delete a product
    async remove(id: string): Promise<boolean> {
      const products = getMockProducts()
      const filtered = products.filter(p => p.id !== id)

      if (filtered.length === products.length) return false

      saveMockProducts(filtered)
      return true
    }
  },

  // Image upload service
  upload: {
    async uploadImage(file: File): Promise<string> {
      // Convert image to Base64 and store in localStorage
      try {
        const base64 = await fileToBase64(file)
        console.log('Image converted to Base64, size:', Math.round(base64.length / 1024), 'KB')
        return base64
      } catch (error) {
        console.error('Error converting image to Base64:', error)
        // Fallback to placeholder URL
        return `https://images.unsplash.com/photo-${Date.now()}?w=400`
      }
    },

    async uploadImages(files: File[]): Promise<string[]> {
      return Promise.all(files.map(file => this.uploadImage(file)))
    }
  }
}