import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest'
import ProductsPage from './ProductsPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function renderPage() {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return render(
        <QueryClientProvider client={qc}>
            <ProductsPage />
        </QueryClientProvider>
    )
}

test('sorteerib nime järgi A→Z', async () => {
    renderPage()

    const table = await screen.findByRole('table')
    const sortSelect = screen.getByLabelText(/Sort/i)
    await userEvent.selectOptions(sortSelect, 'name,asc')

    // esimese rea nimi peaks olema "Apple"
    const firstRow = within(table).getAllByRole('row')[1]
    const nameCell = within(firstRow).getAllByRole('cell')[2] // veerud: ID | SKU | Name | Price | Currency | actions
    expect(nameCell).toHaveTextContent(/Apple/i)
})
