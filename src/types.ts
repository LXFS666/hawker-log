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

export interface VisitWithStall {
  id: number
  rating: number
  dish: string | null
  would_reorder: boolean
  visited_on: string
  notes: string | null
  stall: {
    id: number
    name: string
    centre_id: number
  }
}
