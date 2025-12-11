"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { message } from "antd"
import { FaFacebookF } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import ContactUs from "./ContactUs"

export default function AuthForm() {
    const router = useRouter()

    const [isRightPanelActive, setIsRightPanelActive] = useState(false)
    const [loginData, setLoginData] = useState({ username: "", password: "" })
    const [registerData, setRegisterData] = useState({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        role: "CUSTOMER",
        addresses: [
            { fullName: "", phoneNumber: "", city: "", ward: "", street: "" }
        ],
    })
    const [errors, setErrors] = useState({ login: "", register: "" })

    // ====== LOGIN ======
    const handleLogin = async () => {
        setErrors({ ...errors, login: "" })
        if (!loginData.username || !loginData.password) {
            setErrors({ ...errors, login: "Vui lòng điền tài khoản và mật khẩu" })
            return
        }
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    username: loginData.username,
                    password: loginData.password
                })
            })

            const body = await res.json().catch(() => ({}))

            if (!res.ok) {
                setErrors({ ...errors, login: body?.error || body?.message || "Đăng nhập thất bại" })
                return
            }
            const accessToken = body?.data?.accessToken || body?.accessToken || body?.token

            if (accessToken) {
                const username = body?.data?.username || body?.data?.email || loginData.username
                localStorage.setItem("username", username)
            }

            message.success("Đăng nhập thành công")
            router.push("/")
        } catch (err) {
            console.error(err)
            setErrors({ ...errors, login: "Lỗi kết nối. Vui lòng thử lại" })
        }
    }

    // ====== REGISTER ======
    const handleRegister = async () => {
        setErrors({ ...errors, register: "" })
        if (!registerData.username || !registerData.email || !registerData.password || !registerData.phoneNumber) {
            setErrors({ ...errors, register: "Vui lòng điền đầy đủ thông tin bắt buộc" })
            return
        }
        if (registerData.password.length < 6) {
            setErrors({ ...errors, register: "Mật khẩu phải có ít nhất 6 ký tự" })
            return
        }
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(registerData),
            })

            const body = await res.json().catch(() => ({}))

            if (!res.ok) {
                setErrors({ ...errors, register: body?.error || body?.message || "Đăng ký thất bại" })
                return
            }

            message.success(body?.message || "Đăng ký thành công. Vui lòng đăng nhập.")
            setIsRightPanelActive(false)
        } catch (err) {
            console.error(err)
            setErrors({ ...errors, register: "Lỗi kết nối. Vui lòng thử lại" })
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <div className="flex-1 flex w-full min-h-[1080px]">

                {/* LEFT BANNER */}
                <div className="w-1/2 relative overflow-hidden">
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-indigo-100 to-gray-300 p-8">
                        <div className="max-w-md text-center">
                            <Image src="/logo-DSEV.png" alt="DSEV" width={160} height={48} className="mx-auto" />
                            <h2 className="text-3xl font-bold mt-6">DS.EV SPORT</h2>
                            <p className="mt-3 text-sm text-gray-700">Chúng tôi luôn lắng nghe — bắt đầu hành trình cùng DV.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setIsRightPanelActive(!isRightPanelActive)}
                                    className="px-6 py-3 bg-primary text-white rounded-md shadow"
                                >
                                    {isRightPanelActive ? "Đăng nhập ngay" : "Đăng ký ngay"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANELS */}
                <div className="w-1/2 relative bg-white overflow-hidden">

                    {/* SIGN-IN PANEL */}
                    <div
                        className={`absolute inset-0 transition-transform duration-700 ease-in-out 
              flex flex-col items-start justify-start p-8
              ${!isRightPanelActive ? "z-10 pointer-events-auto" : "z-0 pointer-events-none"}`}
                        style={{ transform: isRightPanelActive ? "translateX(-100%)" : "translateX(0)" }}
                    >
                        <div className="w-full max-w-md mx-auto">
                            <div className="flex justify-center mb-4">
                                <Image src="/logo-DSEV.png" alt="DSEV" width={140} height={40} />
                            </div>
                            <h1 className="text-center text-2xl font-semibold mb-3">Đăng nhập</h1>
                            <div className="flex gap-3 justify-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"><FcGoogle /></div>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"><FaFacebookF /></div>
                            </div>
                            <p className="text-center text-sm text-gray-500 mb-4">Hoặc sử dụng tài khoản của bạn</p>

                            <div className="space-y-3">
                                <input className="w-full rounded-lg px-3 py-2 border" type="text" placeholder="Tên đăng nhập"
                                    value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} />
                                <input className="w-full rounded-lg px-3 py-2 border" type="password" placeholder="Mật khẩu"
                                    value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                                <div className="text-right"><button className="text-sm text-primary">Quên mật khẩu?</button></div>
                                {errors.login && <div className="text-sm text-red-600">{errors.login}</div>}
                                <button type="button" onClick={handleLogin}
                                    className="w-full bg-primary text-white py-2 rounded-lg font-medium">Đăng nhập</button>
                            </div>
                        </div>
                        <div className="mt-5 w-full">
                            <ContactUs fullWidth className="bg-white shadow-md rounded-xl" />
                        </div>
                    </div>

                    {/* SIGN-UP PANEL */}
                    <div
                        className={`absolute inset-0 transition-transform duration-700 ease-in-out 
                            flex flex-col items-start justify-start p-8
                            ${isRightPanelActive ? "z-10 pointer-events-auto" : "z-0 pointer-events-none"}`}
                        style={{ transform: isRightPanelActive ? "translateX(0)" : "translateX(100%)" }}
                    >
                        <div className="w-full max-w-2xl mx-auto">
                            <div className="flex justify-center mb-4">
                                <Image src="/logo-DSEV.png" alt="DSEV" width={140} height={40} />
                            </div>
                            <h1 className="text-center text-2xl font-semibold mb-3">Đăng ký tài khoản</h1>
                            <div className="flex gap-3 justify-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"><FcGoogle /></div>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"><FaFacebookF /></div>
                            </div>
                            <p className="text-center text-sm text-gray-500 mb-4">Hoặc sử dụng email của bạn để đăng ký</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                <div className="col-span-1 md:col-span-2 mt-2 pt-2">
                                    <div className="text-sm font-medium mb-2">Thông tin đăng nhập</div>
                                </div>

                                <input className="w-full rounded-lg px-3 py-2 border" type="text" placeholder="Tên đăng nhập"
                                    value={registerData.username} onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })} />
                                <input className="w-full rounded-lg px-3 py-2 border" type="email" placeholder="Email"
                                    value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />
                                <input className="w-full rounded-lg px-3 py-2 border" type="password" placeholder="Mật khẩu"
                                    value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} />
                                <input className="w-full rounded-lg px-3 py-2 border" type="tel" placeholder="Số điện thoại"
                                    value={registerData.phoneNumber} onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })} />

                                <div className="col-span-1 md:col-span-2 border-t mt-2 pt-2">
                                    <div className="text-sm font-medium mb-2">Thông tin cá nhân</div>
                                </div>

                                <input className="w-full rounded-lg px-3 py-2 border" type="text" placeholder="Họ và tên"
                                    value={registerData.addresses[0].fullName} onChange={(e) => setRegisterData({ ...registerData, addresses: [{ ...registerData.addresses[0], fullName: e.target.value }] })} />
                                <input className="w-full rounded-lg px-3 py-2 border" type="tel" placeholder="Số điện thoại người nhận"
                                    value={registerData.addresses[0].phoneNumber} onChange={(e) => setRegisterData({ ...registerData, addresses: [{ ...registerData.addresses[0], phoneNumber: e.target.value }] })} />

                                <input className="w-full rounded-lg px-3 py-2 border" type="text" placeholder="Tỉnh/Thành phố"
                                    value={registerData.addresses[0].city} onChange={(e) => setRegisterData({ ...registerData, addresses: [{ ...registerData.addresses[0], city: e.target.value }] })} />
                                <input className="w-full rounded-lg px-3 py-2 border" type="text" placeholder="Phường/Xã"
                                    value={registerData.addresses[0].ward} onChange={(e) => setRegisterData({ ...registerData, addresses: [{ ...registerData.addresses[0], ward: e.target.value }] })} />

                                <input className="col-span-1 md:col-span-2 w-full rounded-lg px-3 py-2 border" type="text" placeholder="Đường/Số nhà"
                                    value={registerData.addresses[0].street} onChange={(e) => setRegisterData({ ...registerData, addresses: [{ ...registerData.addresses[0], street: e.target.value }] })} />

                                {errors.register && <div className="col-span-1 md:col-span-2 text-sm text-red-600">{errors.register}</div>}
                                <div className="col-span-1 md:col-span-2">
                                    <button type="button" onClick={handleRegister}
                                        className="w-full bg-primary text-white py-2 rounded-lg font-medium">Đăng ký</button>
                                </div>
                            </div>
                        </div>
                        <div className="w-full">
                            <ContactUs fullWidth className="bg-white shadow-md rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
