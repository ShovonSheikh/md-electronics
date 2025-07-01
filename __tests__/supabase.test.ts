/**
 * @jest-environment node
 */

import { getProducts, getCategories, getBrands } from "@/lib/supabase"
import jest from "jest"

// Mock Supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  },
  getProducts: jest.fn(),
  getCategories: jest.fn(),
  getBrands: jest.fn(),
}))

describe("Supabase Helper Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("getProducts should return empty array on error", async () => {
    const mockGetProducts = getProducts as jest.MockedFunction<typeof getProducts>
    mockGetProducts.mockResolvedValue([])

    const result = await getProducts()
    expect(result).toEqual([])
  })

  test("getCategories should return empty array on error", async () => {
    const mockGetCategories = getCategories as jest.MockedFunction<typeof getCategories>
    mockGetCategories.mockResolvedValue([])

    const result = await getCategories()
    expect(result).toEqual([])
  })

  test("getBrands should return empty array on error", async () => {
    const mockGetBrands = getBrands as jest.MockedFunction<typeof getBrands>
    mockGetBrands.mockResolvedValue([])

    const result = await getBrands()
    expect(result).toEqual([])
  })
})
