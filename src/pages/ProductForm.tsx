/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { NewProductInput, ProductType, UpdateProductInput } from '@/types/product'
import { useProducts } from '@/hooks/use-products'
import { useFileUpload, formatBytes, type FileMetadata } from '@/hooks/use-file-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  Package,
  FileText,
  DollarSign,
  Hash,
  Tag,
  BookOpen,
  Code2,
  Database,
  Terminal,
  Binary,
  Cpu,
  Sparkles,
  UploadIcon,
  AlertCircleIcon,
  XIcon,
} from 'lucide-react'

const categoryIcons: Record<string, React.ReactNode> = {
  'algoritmos': <Binary className="w-3 h-3" />,
  'programação': <Code2 className="w-3 h-3" />,
  'dados': <Database className="w-3 h-3" />,
  'sistemas': <Cpu className="w-3 h-3" />,
  'web': <Terminal className="w-3 h-3" />,
  'default': <BookOpen className="w-3 h-3" />
}

const getCategoryIcon = (category: string) => {
  const key = category.toLowerCase()
  return categoryIcons[key] || categoryIcons['default']
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

const suggestedCategories = [
  'Algoritmos',
  'Programação',
  'Dados',
  'Sistemas',
  'Web',
  'Mobile',
  'IA',
  'Machine Learning',
  'DevOps',
  'Segurança',
  'Redes',
  'Cloud'
]

const suggestedTags = [
  'Python',
  'JavaScript',
  'Java',
  'C++',
  'React',
  'Node.js',
  'Docker',
  'Kubernetes',
  'AWS',
  'SQL',
  'NoSQL',
  'Git'
]

const getFileIcon = (file: any) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  if (fileType.startsWith("image/")) {
    return <ImageIcon className="size-5 opacity-60" />
  }
  return <FileText className="size-5 opacity-60" />
}

const getFilePreview = (file: any) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const fileName = file.file instanceof File ? file.file.name : file.file.name

  return (
    <div className="bg-accent flex aspect-square items-center justify-center overflow-hidden rounded-t-[inherit]">
      {fileType.startsWith("image/") ? (
        (() => {
          const previewUrl = file.file instanceof File ? URL.createObjectURL(file.file) : file.file.url
          return (
            <img
              src={previewUrl}
              alt={fileName}
              className="size-full rounded-t-[inherit] object-cover"
            />
          )
        })()
      ) : (
        getFileIcon(file)
      )}
    </div>
  )
}

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { getById, create, update, getCapaUrl, getImageUrls } = useProducts()
  const navigate = useNavigate()

  const [form, setForm] = useState<NewProductInput>({
    titulo: '',
    autor: '',
    descricao: '',
    preco: 0,
    estoque: 0,
    tipo: 'fisico',
    categorias: [],
    tags: [],
    capaFile: null,
    imageFiles: []
  })

  const [preview, setPreview] = useState<string | undefined>()
  const [initialImageFiles, setInitialImageFiles] = useState<FileMetadata[]>([])
  const [originalImageIds, setOriginalImageIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [categoryInput, setCategoryInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [priceInput, setPriceInput] = useState('')

  // File uploader for multiple images
  const [
    { files: imageFiles, isDragging, errors: uploadErrors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: "image/*",
    initialFiles: initialImageFiles,
  })

  useEffect(() => {
    if (!isEdit || !id) return
    ;(async () => {
      setLoading(true)
      const p = await getById(id)
      if (!p) {
        navigate('/admin/catalogo')
        return
      }
      setForm({
        titulo: p.titulo,
        autor: p.autor || '',
        descricao: p.descricao || '',
        preco: p.preco,
        estoque: p.estoque,
        tipo: p.tipo,
        categorias: p.categorias,
        tags: p.tags,
        capaFile: null,
        imageFiles: []
      })
      setPriceInput(formatNumberBRL(p.preco))
      const capaUrl = await getCapaUrl(p)
      setPreview(capaUrl)
      // Load existing images as FileMetadata
      const imageUrls = await getImageUrls(p)
      const imageMetadata: FileMetadata[] = imageUrls.map((url, index) => ({
        id: `existing-${index}`,
        name: `Imagem ${index + 1}`,
        size: 0,
        type: 'image/jpeg',
        url,
      }))
      setInitialImageFiles(imageMetadata)
      setOriginalImageIds(imageUrls)
      setLoading(false)
    })()
  }, [id, isEdit, getById, getCapaUrl, getImageUrls, navigate])

  useEffect(() => {
    // Update form with selected image files
    const files = imageFiles.map(f => f.file instanceof File ? f.file : null).filter(Boolean) as File[]
    setForm(prev => ({ ...prev, imageFiles: files }))
  }, [imageFiles])

  const canSave = useMemo(() =>
    form.titulo.trim().length > 0 &&
    form.preco >= 0 &&
    form.estoque >= 0
  , [form])

  function updateField<K extends keyof NewProductInput>(key: K, value: NewProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      updateField('capaFile', file)
      setPreview(URL.createObjectURL(file))
    }
  }

  function addCategory() {
    if (categoryInput.trim() && !form.categorias.includes(categoryInput.trim())) {
      updateField('categorias', [...form.categorias, categoryInput.trim()])
      setCategoryInput('')
    }
  }

  function removeCategory(category: string) {
    updateField('categorias', form.categorias.filter(c => c !== category))
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      updateField('tags', [...form.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    updateField('tags', form.tags.filter(t => t !== tag))
  }


  function formatNumberBRL(value: number) {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 0) {
      setPriceInput('')
      updateField('preco', 0)
      return
    }
    const cents = parseInt(digits, 10)
    const numeric = cents / 100
    setPriceInput(formatNumberBRL(numeric))
    updateField('preco', numeric)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return

    setLoading(true)
    try {
      if (isEdit && id) {
        // Calculate which original images were removed
        const remainingOriginalIds = imageFiles
          .filter(f => !(f.file instanceof File) && f.id.startsWith('existing-'))
          .map(f => parseInt(f.id.replace('existing-', '')))

        const removedIndexes = originalImageIds
          .map((_, index) => !remainingOriginalIds.includes(index) ? index : -1)
          .filter(index => index !== -1)

        const input: UpdateProductInput = {
          ...form,
          removedImageIndexes: removedIndexes
        }
        await update(id, input)
      } else {
        await create(form)
      }
      navigate('/catalogo')
    } catch (error) {
      console.error('Error saving product:', error)
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse">
          <Terminal className="w-12 h-12 text-slate-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="absolute inset-0 bg-white/50 opacity-20"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <motion.div {...fadeInUp} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/catalogo')}
            className="mb-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-slate-700" />
            <h1 className="text-4xl font-bold text-slate-900">
              {isEdit ? 'Editar' : 'Novo'} Livro
            </h1>
          </div>
        </motion.div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-slate-700" />
                      Informações Básicas
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Dados principais do livro
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="titulo" className="text-slate-700">
                        Título *
                      </Label>
                      <Input
                        id="titulo"
                        value={form.titulo}
                        onChange={(e) => updateField('titulo', e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                        placeholder="Ex: Clean Code"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="autor" className="text-slate-700">
                        Autor
                      </Label>
                      <Input
                        id="autor"
                        value={form.autor}
                        onChange={(e) => updateField('autor', e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                        placeholder="Ex: Robert C. Martin"
                      />
                    </div>

                    <div>
                      <Label htmlFor="descricao" className="text-slate-700">
                        Descrição
                      </Label>
                      <Textarea
                        id="descricao"
                        value={form.descricao}
                        onChange={(e) => updateField('descricao', e.target.value)}
                        className="bg-white border-slate-300 text-slate-900 min-h-[120px]"
                        placeholder="Uma breve descrição do livro..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stock & Price */}
              <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-slate-700" />
                      Estoque e Preço
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Informações comerciais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="preco" className="text-slate-700">
                          Preço (R$) *
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input
                            id="preco"
                            type="text"
                            inputMode="numeric"
                            value={priceInput}
                            onChange={handlePriceChange}
                            placeholder="0,00"
                            className="bg-white border-slate-300 text-slate-900 pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="estoque" className="text-slate-700">
                          Estoque *
                        </Label>
                        <div className="relative">
                          <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input
                            id="estoque"
                            type="number"
                            value={form.estoque}
                            onChange={(e) => updateField('estoque', Number(e.target.value))}
                            className="bg-white border-slate-300 text-slate-900 pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="tipo" className="text-slate-700">
                          Tipo *
                        </Label>
                        <Select
                          value={form.tipo}
                          onValueChange={(value: ProductType) => updateField('tipo', value)}
                        >
                          <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="fisico" className="text-slate-900">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Físico
                              </div>
                            </SelectItem>
                            <SelectItem value="ebook" className="text-slate-900">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                eBook
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Categories & Tags */}
              <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-slate-700" />
                      Categorias e Tags
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Organize seu livro
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Categories */}
                    <div>
                      <Label className="text-slate-700">Categorias</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={categoryInput}
                          onChange={(e) => setCategoryInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                          className="bg-white border-slate-300 text-slate-900"
                          placeholder="Adicionar categoria..."
                        />
                        <Button
                          type="button"
                          onClick={addCategory}
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.categorias.map((cat) => (
                          <Badge
                            key={cat}
                            variant="secondary"
                            className="bg-slate-100 text-slate-700 border-slate-300 pl-2"
                          >
                            {getCategoryIcon(cat)}
                            <span className="mx-1">{cat}</span>
                            <button
                              type="button"
                              onClick={() => removeCategory(cat)}
                              className="ml-1 hover:text-purple-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {suggestedCategories.map((cat) => (
                          !form.categorias.includes(cat) && (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => updateField('categorias', [...form.categorias, cat])}
                              className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                            >
                              + {cat}
                            </button>
                          )
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label className="text-slate-700">Tags</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="bg-white border-slate-300 text-slate-900"
                          placeholder="Adicionar tag..."
                        />
                        <Button
                          type="button"
                          onClick={addTag}
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-slate-300 text-slate-600"
                          >
                            <Hash className="w-3 h-3 mr-1" />
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 hover:text-blue-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {suggestedTags.map((tag) => (
                          !form.tags.includes(tag) && (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => updateField('tags', [...form.tags, tag])}
                              className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                            >
                              + {tag}
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Cover Image */}
              <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-slate-700" />
                      Capa do Livro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[3/4] bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg overflow-hidden flex items-center justify-center relative group">
                      {preview ? (
                        <>
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => document.getElementById('cover-input')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Trocar
                            </Button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => document.getElementById('cover-input')?.click()}
                          className="flex flex-col items-center gap-2 text-slate-500 hover:text-slate-700"
                        >
                          <Upload className="w-8 h-8" />
                          <span className="text-sm">Enviar capa</span>
                        </button>
                      )}
                    </div>
                    <input
                      id="cover-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverChange}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Additional Images */}
              <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-slate-700" />
                      Imagens Adicionais
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Até 10 imagens do produto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        data-dragging={isDragging || undefined}
                        data-files={imageFiles.length > 0 || undefined}
                        className="border-input data-[dragging=true]:bg-slate-100 relative flex min-h-32 flex-col items-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 p-4 transition-colors not-data-[files]:justify-center bg-slate-50"
                      >
                        <input
                          {...getInputProps()}
                          className="sr-only"
                          aria-label="Upload image files"
                        />

                        {imageFiles.length > 0 ? (
                          <div className="flex w-full flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-600">{imageFiles.length} arquivo(s)</p>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-500 hover:text-slate-900"
                                  onClick={openFileDialog}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-500 hover:text-slate-900"
                                  onClick={clearFiles}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {imageFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className="relative flex flex-col rounded-md border border-slate-300 bg-white"
                                >
                                  {getFilePreview(file)}
                                  <Button
                                    type="button"
                                    onClick={() => removeFile(file.id)}
                                    size="icon"
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 hover:bg-red-700"
                                    aria-label="Remove image"
                                  >
                                    <XIcon className="h-3 w-3" />
                                  </Button>
                                  <div className="p-2">
                                    <p className="truncate text-[10px] text-slate-600">
                                      {file.file instanceof File ? file.file.name : file.file.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {formatBytes(file.file instanceof File ? file.file.size : file.file.size)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600">
                              Arraste imagens aqui
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              ou clique para selecionar
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-3 border-slate-300 text-slate-700 hover:bg-slate-100"
                              onClick={openFileDialog}
                            >
                              <UploadIcon className="w-3 h-3 mr-1" />
                              Selecionar
                            </Button>
                          </div>
                        )}
                      </div>

                      {uploadErrors.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-400" role="alert">
                          <AlertCircleIcon className="w-3 h-3 shrink-0" />
                          <span>{uploadErrors[0]}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Actions */}
              <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardContent className="pt-6 space-y-3">
                    <Button
                      type="submit"
                      disabled={!canSave || loading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isEdit ? 'Salvar Alterações' : 'Criar Livro'}
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/produtos')}
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      Cancelar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}