export default function CheckoutFailurePage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold mb-2">Thanh toán thất bại</h1>
                <p className="text-muted-foreground">Có lỗi xảy ra khi thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.</p>
                <div className="mt-6 flex gap-3 justify-center">
                    <a href="/checkout" className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Thử lại</a>
                    <a href="/" className="px-4 py-2 rounded-md border">Về trang chủ</a>
                </div>
            </div>
        </div>
    )
}
