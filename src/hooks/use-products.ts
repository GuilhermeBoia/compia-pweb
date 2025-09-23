import { useCallback } from 'react'
import { api } from '@/services/api'
import type { NewProductInput, Product, UpdateProductInput } from '@/types/product'

export function useProducts() {
  const list = useCallback(async (): Promise<Product[]> => {
    return await api.products.list()
  }, [])

  const getById = useCallback(async (id: string): Promise<Product | undefined> => {
    return await api.products.getById(id)
  }, [])

  const create = useCallback(async (input: NewProductInput): Promise<Product> => {
    // Upload images if provided (converts to Base64)
    let capaUrl: string | undefined
    let imageUrls: string[] = []

    if (input.capaFile) {
      capaUrl = await api.upload.uploadImage(input.capaFile)
    }

    if (input.imageFiles && input.imageFiles.length > 0) {
      imageUrls = await api.upload.uploadImages(input.imageFiles)
    }

    // Create product with Base64 image URLs
    const productData = {
      ...input,
      capaUrl,
      imageUrls
    }

    // Remove File objects before sending
    const { capaFile, imageFiles, ...cleanInput } = productData
    return await api.products.create({ ...cleanInput, capaUrl, imageUrls } as any)
  }, [])

  const update = useCallback(async (id: string, input: UpdateProductInput): Promise<Product | undefined> => {
    // Get existing product
    const existing = await api.products.getById(id)
    if (!existing) throw new Error('Produto não encontrado')

    let capaUrl = existing.capaUrl
    let imageUrls = existing.imageUrls || []

    // Upload new cover if provided (converts to Base64)
    if (input.capaFile) {
      capaUrl = await api.upload.uploadImage(input.capaFile)
    }

    // Remove specified images
    if (input.removedImageIndexes && input.removedImageIndexes.length > 0) {
      imageUrls = imageUrls.filter((_, index) => !input.removedImageIndexes?.includes(index))
    }

    // Upload new images if provided (converts to Base64)
    if (input.imageFiles && input.imageFiles.length > 0) {
      const newImageUrls = await api.upload.uploadImages(input.imageFiles)
      imageUrls = [...imageUrls, ...newImageUrls]
    }

    // Update product with new URLs
    const updateData = {
      ...input,
      capaUrl,
      imageUrls
    }

    // Remove File objects and removedImageIndexes before sending
    const { capaFile, imageFiles, removedImageIndexes, ...cleanInput } = updateData
    return await api.products.update(id, { ...cleanInput, capaUrl, imageUrls } as UpdateProductInput)
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    await api.products.remove(id)
  }, [])

  // Helper functions for image URLs
  const getCapaUrl = useCallback(async (produto: Product): Promise<string | undefined> => {
    return produto.capaUrl
  }, [])

  const getImageUrls = useCallback(async (produto: Product): Promise<string[]> => {
    return produto.imageUrls || []
  }, [])

  // For backward compatibility
  const getCapaBlob = useCallback(async () => {
    console.warn('getCapaBlob is deprecated, images are now URLs')
    return null
  }, [])

  return { list, getById, create, update, remove, getCapaBlob, getCapaUrl, getImageUrls }
}