export interface HawkerCentre {
  id: number
  name: string
  address: string | null
  lat: number
  lng: number
}

export interface Stall {
  id: number
  centre_id: number
  name: string
  unit_no: string | null
  cuisine: string | null
}
