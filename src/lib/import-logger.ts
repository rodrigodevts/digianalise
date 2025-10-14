import { prisma } from '@/lib/db'

interface LogData {
  operation: 'conversations' | 'analyze' | 'metrics' | 'reset'
  fileName?: string
  fileSize?: number
  userAgent?: string
  ipAddress?: string
}

interface LogUpdate {
  totalItems?: number
  processedItems?: number
  errorCount?: number
  errors?: string[]
  processingTime?: number
}

export class ImportLogger {
  private logId: string

  constructor(logId: string) {
    this.logId = logId
  }

  static async start(data: LogData): Promise<ImportLogger> {
    const log = await prisma.importLog.create({
      data: {
        operation: data.operation,
        status: 'started',
        fileName: data.fileName,
        fileSize: data.fileSize,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        startedAt: new Date()
      }
    })

    return new ImportLogger(log.id)
  }

  async update(data: LogUpdate): Promise<void> {
    await prisma.importLog.update({
      where: { id: this.logId },
      data: {
        totalItems: data.totalItems,
        processedItems: data.processedItems,
        errorCount: data.errorCount,
        errors: data.errors ? JSON.stringify(data.errors) : undefined,
        processingTime: data.processingTime,
        updatedAt: new Date()
      }
    })
  }

  async complete(success: boolean, finalData?: LogUpdate): Promise<void> {
    const completedAt = new Date()
    
    // Calcular tempo de processamento se não fornecido
    const existingLog = await prisma.importLog.findUnique({
      where: { id: this.logId },
      select: { startedAt: true }
    })
    
    const processingTime = finalData?.processingTime || 
      (existingLog ? completedAt.getTime() - existingLog.startedAt.getTime() : 0)

    await prisma.importLog.update({
      where: { id: this.logId },
      data: {
        status: success ? 'completed' : 'failed',
        totalItems: finalData?.totalItems,
        processedItems: finalData?.processedItems,
        errorCount: finalData?.errorCount,
        errors: finalData?.errors ? JSON.stringify(finalData.errors) : undefined,
        processingTime,
        completedAt,
        updatedAt: completedAt
      }
    })
  }

  static async getRecentLogs(limit: number = 10) {
    return await prisma.importLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  static async getLogsByOperation(operation: string, limit: number = 10) {
    return await prisma.importLog.findMany({
      where: { operation },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }
}

// Função helper para extrair informações da requisição
export function extractRequestInfo(request: Request) {
  const userAgent = request.headers.get('user-agent') || undefined
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   request.headers.get('cf-connecting-ip') || 
                   'unknown'

  return { userAgent, ipAddress }
}