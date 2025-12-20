import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import ProductsPage from './ProductsPage'

// lihtne lehe render koos QueryClientiga
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
    { id: 3, sku: 'SKU-SAMSUNG-001', name: 'SAMSUNG', priceCents: 1500, currencyCode: 'EUR' },
    { id: 5, sku: 'SKU-SAMSUNG-002', name: 'SAMSUNG ULTRA S25', priceCents: 1600, currencyCode: 'EUR' },
    { id: 1, sku: 'SKU-APPLE-001', name: 'Apple', priceCents: 149, currencyCode: 'EUR' },
]

const server = setupServer(
    http.get('/api/products', ({ request }) => {
        const url = new URL(request.url)
        const q = (url.searchParams.get('q') || '').toLowerCase()
        const sorts = url.searchParams.getAll('sort') // nt ["price,desc","id,asc"]

        // filtreeri
        const filtered = PRODUCTS.filter(p =>
            !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
        )

        // sorteeri (toetame price/name/sku/id; updated/created ignoreerime siin testis)
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
        for (const s of sorts) {
            result.sort(cmpFor(s))
        }

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

describe('ProductsPage (price sort)', () => {
    it('laeb ja sorteerib hinna järgi', async () => {
        const user = userEvent.setup()
        renderPage()

        // kirjuta otsing "sam", et Samsungid tuleksid
        const search = await screen.findByPlaceholderText(/search/i)
        await user.clear(search)
        await user.type(search, 'sam')

        // vali Sort: price
        const sortSelect = screen.getByLabelText(/sort/i) as HTMLSelectElement
        await user.selectOptions(sortSelect, 'price')

        // toggelda suund desc-iks, kui vaja
        const dirBtn = screen.getByRole('button', { name: /asc|desc/i })
        if (dirBtn.textContent?.includes('asc')) {
            await user.click(dirBtn) // nüüd "desc"
        }

        // kontrolli 1. rea hinda
        const table = await screen.findByRole('table')
        const rows = within(table).getAllByRole('row').slice(1) // skip header
        expect(rows.length).toBeGreaterThan(0)

        const firstPriceCell = within(rows[0]).getAllByRole('cell')[3]
        expect(firstPriceCell).toHaveTextContent('1600')
    })
})
