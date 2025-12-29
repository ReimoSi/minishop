import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type ToastKind = 'success' | 'error' | 'info'
type Toast = { id: number; kind: ToastKind; message: string; ttl: number }

type ToastCtx = {
    show: (message: string, kind?: ToastKind, ttlMs?: number) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Toast[]>([])

    const show = useCallback((message: string, kind: ToastKind = 'info', ttlMs = 3000) => {
        const id = Date.now() + Math.floor(Math.random() * 1000)
        const toast: Toast = { id, kind, message, ttl: ttlMs }
        setItems(prev => [...prev, toast])
        setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), ttlMs)
    }, [])

    const value = useMemo(() => ({ show }), [show])

    return (
        <Ctx.Provider value={value}>
            {children}
            <div style={{
                position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: 8, zIndex: 9999, maxWidth: 420
            }}>
                {items.map(t => (
                    <div key={t.id}
                         style={{
                             padding: '10px 12px',
                             borderRadius: 8,
                             boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                             background: t.kind === 'success' ? '#e6ffed'
                                 : t.kind === 'error' ? '#ffe8e6'
                                     : '#eef2ff',
                             border: `1px solid ${t.kind === 'success' ? '#b7f5c6'
                                 : t.kind === 'error' ? '#ffb3ab'
                                     : '#cbd5ff'}`,
                             color: '#111'
                         }}>
                        {t.message}
                    </div>
                ))}
            </div>
        </Ctx.Provider>
    )
}

export function useToast() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
    return ctx
}
