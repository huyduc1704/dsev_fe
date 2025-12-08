export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-bold mb-2">Thanh toán thành công</h1>
                <p className="text-muted-foreground">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
                <div className="mt-6">
                    <a href="/" className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Về trang chủ</a>
                </div>
            </div>
        </div>
    )
}
