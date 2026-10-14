import { createApi } from '@/lib/api'

const api = createApi()

export interface RfidMapItem {
  FID: number
  STATION_NAME: string
  FIELD_NAME: string
  VALUE_ASCII: string | null
  READ_TIME: string | null
  WRITE_TIME: string | null
}

interface ApiResponse<T> {
  success?: boolean
  data?: T
  message?: string
}

export const rfidApi = {
  getMap: async (station?: string): Promise<RfidMapItem[]> => {
    const { data } = await api.get<ApiResponse<RfidMapItem[]>>('/rfid/map', {
      params: station ? { station } : {},
    })
    return Array.isArray(data?.data) ? data.data : []
  },

  updateValue: async (fid: number, valueAscii: string | null): Promise<void> => {
    await api.put('/rfid/map', { fid, valueAscii })
  },

  triggerCommand: async (stationName: string, command: 'READ' | 'WRITE'): Promise<void> => {
    await api.post('/rfid/command', { stationName, command })
  },
}
