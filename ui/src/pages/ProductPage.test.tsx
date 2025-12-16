import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest'     // <-- lisa see rida
import ProductsPage from './ProductsPage'           // kontrolli, et fail on ProductsPage.tsx, mitte ProductPage.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function renderPage() {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return render(
        <QueryClientProvider client={qc}>
            <ProductsPage />
        </QueryClientProvider>
    )
}

test('laeb ja sorteerib hinna järgi', async () => {
    renderPage()

    // ootame tabelit
    const table = await screen.findByRole('table')

    // vali "Hind ↓" (ProductsPage-s on <label>Sort:</label> ja <select> kõrval)
    const sortSelect = screen.getByLabelText(/Sort/i)
    await userEvent.selectOptions(sortSelect, 'price,desc')

    // võta 1. data-rida ja selle “Price (cents)” veeru lahter
    const firstRow = within(table).getAllByRole('row')[1] // [0]=thead
    const priceCell = within(firstRow).getAllByRole('cell')[3]
    expect(priceCell).toHaveTextContent('1600')
})

