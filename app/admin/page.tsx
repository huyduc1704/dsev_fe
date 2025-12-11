export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Categories</h3>
                    <p className="text-2xl font-bold">-</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Products</h3>
                    <p className="text-2xl font-bold">-</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Orders</h3>
                    <p className="text-2xl font-bold">-</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Users</h3>
                    <p className="text-2xl font-bold">-</p>
                </div>
            </div>
        </div>
    )
}

