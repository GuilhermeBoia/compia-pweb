export type ProductType = 'ebook' | 'fisico'

export type Product = {
  id: string
  titulo: string
  autor?: string
  descricao?: string
  preco: number
  estoque: number
  tipo: ProductType
  categorias: string[]
  tags: string[]
  capaUrl?: string
  imageUrls?: string[]
  createdAt: number
  updatedAt: number
}

export type NewProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'capaUrl' | 'imageUrls'> & {
  capaFile?: File | null
  imageFiles?: File[]
}

export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> & {
  capaFile?: File | null
  imageFiles?: File[]
  removedImageIndexes?: number[]
}


