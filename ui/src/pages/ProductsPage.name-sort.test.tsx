import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import ProductsPage from './ProductsPage'

function renderPage() {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
        <QueryClientProvider client={qc}>
            <BrowserRouter>
                <ProductsPage />
            </BrowserRouter>
        </QueryClientProvider>,
    )
}

const PRODUCTS = [
    { id: 2, sku: 'SKU-MILK-001', name: 'Milk 1L', priceCents: 129, currencyCode: 'EUR' },
    { id: 1, sku: 'SKU-APPLE-001', name: 'Apple', priceCents: 149, currencyCode: 'EUR' },
    { id: 3, sku: 'SKU-SAMSUNG-001', name: 'SAMSUNG', priceCents: 1500, currencyCode: 'EUR' },
]

const server = setupServer(
    http.get('/api/products', ({ request }) => {
        const url = new URL(request.url)
        const q = (url.searchParams.get('q') || '').toLowerCase()
        const sorts = url.searchParams.getAll('sort')

        const filtered = PRODUCTS.filter(p =>
            !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
        )

        const cmpFor = (key: string) => (a: any, b: any) => {
            const dir = key.endsWith(',desc') ? -1 : 1
            const k = key.split(',')[0]
            const av = (a as any)[k === 'price' ? 'priceCents' : k]
            const bv = (b as any)[k === 'price' ? 'priceCents' : k]
            if (av < bv) return -1 * dir
            if (av > bv) return 1 * dir
            return 0
        }

        let result = [...filtered]
        for (const s of sorts) result.sort(cmpFor(s))

        const resp = {
            content: result,
            totalElements: result.length,
            totalPages: 1,
            number: 0,
            size: 10,
            first: true,
            last: true,
        }
        return HttpResponse.json(resp)
    }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ProductsPage (name sort)', () => {
    it('sorteerib nime järgi A→Z', async () => {
        const user = userEvent.setup()
        renderPage()

        // vali Sort: name (suund vaikimisi "asc")
        const sortSelect = await screen.findByLabelText(/sort/i)
        await user.selectOptions(sortSelect, 'name')

        const table = await screen.findByRole('table')
        const rows = within(table).getAllByRole('row').slice(1)
        expect(rows.length).toBeGreaterThan(1)

        const firstNameCell = within(rows[0]).getAllByRole('cell')[2]
        expect(firstNameCell).toHaveTextContent(/^Apple$/)
    })
})
