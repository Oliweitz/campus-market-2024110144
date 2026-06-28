import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { seedListings, type Listing, type ListingType, type ListingStatus } from '@/data/listings'

export const useListingsStore = defineStore('listings', () => {
  const items = ref<Listing[]>([...seedListings.map(l => ({ ...l }))])

  function getById(id: number): Listing | undefined {
    return items.value.find(l => l.id === id)
  }

  function getByType(type: ListingType): Listing[] {
    return items.value.filter(l => l.type === type)
  }

  function add(data: Omit<Listing, 'id' | 'publishTime' | 'status'>): Listing {
    const id = Math.max(0, ...items.value.map(l => l.id)) + 1
    const listing: Listing = {
      ...data,
      id,
      status: 'active' as ListingStatus,
      publishTime: new Date().toISOString(),
    }
    items.value.unshift(listing)
    return listing
  }

  function incrementCount(id: number): boolean {
    const listing = items.value.find(l => l.id === id)
    if (!listing || listing.type !== 'pintuan' || listing.currentCount === undefined || listing.targetCount === undefined) return false
    if (listing.currentCount >= listing.targetCount) return false
    listing.currentCount++
    return true
  }

  function updateStatus(id: number, status: ListingStatus): boolean {
    const listing = items.value.find(l => l.id === id)
    if (!listing) return false
    listing.status = status
    return true
  }

  return { items, getById, getByType, add, incrementCount, updateStatus }
})
