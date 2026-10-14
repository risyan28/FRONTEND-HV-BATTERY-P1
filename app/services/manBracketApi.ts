import { createApi } from '@/lib/api'

const api = createApi()

export interface ManBracketRecord {
  FID: number
  BARCODE: string
  DESTINATION: 'ASSY' | 'CKD' | 'SERVICE PART'
  FVALUE?: number
  START_TIME?: string | null
  COMPLETED_TIME?: string | null
}

interface ApiResponse<T> {
  success?: boolean
  data?: T
  message?: string
}

export interface DestinationCount {
  destination: string
  count: number
}

interface CompletedResponse extends ApiResponse<ManBracketRecord[]> {
  countsByDestination?: DestinationCount[]
}

export const manBracketApi = {
  api,

  getCompleted: async (params?: {
    fvalue?: number
    limit?: number
  }): Promise<{
    records: ManBracketRecord[]
    countsByDestination: DestinationCount[]
  }> => {
    const { data } = await api.get<CompletedResponse>('/man-bracket', {
      params,
    })

    return {
      records: Array.isArray(data?.data) ? data.data : [],
      countsByDestination: data?.countsByDestination ?? [],
    }
  },

  getRecord: async (recordId: number): Promise<ManBracketRecord | null> => {
    const { data } = await api.get<ApiResponse<ManBracketRecord>>(
      `/man-bracket/${recordId}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      },
    )

    return data?.data ?? null
  },

  getDestinationConfig: async (): Promise<'ASSY' | 'CKD' | 'SERVICE PART' | null> => {
    const { data } = await api.get<ApiResponse<{ destination?: string }>>(
      '/man-bracket/destination-config',
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      },
    )

    const destination = data?.data?.destination
    return destination === 'CKD'
      ? 'CKD'
      : destination === 'ASSY'
        ? 'ASSY'
        : destination === 'SERVICE PART'
          ? 'SERVICE PART'
          : null
  },

  getStock: async (): Promise<{
    stdStock: number
    bufferStock: number
  }> => {
    const { data } = await api.get<
      ApiResponse<{ stdStock?: number; bufferStock?: number }>
    >('/man-bracket/stock', {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })

    return {
      stdStock: Number(data?.data?.stdStock) || 0,
      bufferStock: Number(data?.data?.bufferStock) || 0,
    }
  },

  startProcess: async (payload: {
    barcode: string
    destination: 'ASSY' | 'CKD' | 'SERVICE PART'
    startTime: Date
  }): Promise<number | undefined> => {
    const { data } = await api.post<ApiResponse<{ FID?: number }>>(
      '/man-bracket/start-process',
      payload,
    )

    return data?.data?.FID
  },

  resetProcess: async (recordId: number): Promise<void> => {
    await api.post('/man-bracket/reset-process', { recordId })
  },

  completeProcess: async (payload: {
    recordId: number
    completedTime: Date
  }): Promise<void> => {
    await api.post('/man-bracket/complete-process', payload)
  },

  setInterlockMode: async (
    interlockOn: boolean,
    password: string,
    fid?: number,
  ): Promise<void> => {
    await api.post('/man-bracket/interlock-mode', {
      interlockOn,
      password,
      ...(fid && { fid }),
    })
  },
}
