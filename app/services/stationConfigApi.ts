import { createApi } from '@/lib/api'

const api = createApi()

export interface StationConfigItem {
  FID: number
  STATION_NAME: string
  DISPLAY_NAME: string
  STATION_ID_SUFFIX: string | null
  IS_MANDATORY: number // 0 or 1
  SORT_ORDER: number
  IS_ACTIVE: number // 0 or 1
}

interface ApiResponse<T> {
  success?: boolean
  data?: T
  message?: string
}

export const stationConfigApi = {
  api,

  getAll: async (): Promise<StationConfigItem[]> => {
    const { data } = await api.get<ApiResponse<StationConfigItem[]>>(
      '/station-config',
    )

    return Array.isArray(data?.data) ? data.data : []
  },

  updateConfig: async (
    station4Active: boolean,
    station5Active: boolean,
  ): Promise<StationConfigItem[]> => {
    const { data } = await api.put<ApiResponse<StationConfigItem[]>>(
      '/station-config',
      { station4Active, station5Active },
    )

    return Array.isArray(data?.data) ? data.data : []
  },
}
