import "./index.css"
import Navbar from "../../commons/navbar"
import QRCode from "react-qr-code"
import { FaExclamationCircle } from "react-icons/fa";
import html2canvas from "html2canvas";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import d  from "../../../lib/decryptor";
import sensorNama from "../../../lib/censor";
import { useRouter } from "next/navigation";

export default function GenerateVoucherComp() {
    const navigate = useRouter();
    const captureRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(false);

    const [trx, setTrx] = useState<string | undefined>();
    const [form, setForm] = useState<any>();

    useEffect(() => {
        console.log(localStorage?.category);
        const withdrawCookie = Cookies.get("withdraw");
        const depositCookie = Cookies.get("deposit");

        if (localStorage?.category === "1" && withdrawCookie) {
            setTrx('Tarikan Tunai');
            setForm(JSON.parse(d(withdrawCookie)));
        } else if (depositCookie) {
            setTrx('Setoran Tunai');
            setForm(JSON.parse(d(depositCookie)));
        }
    }, [])

    const handleScreenshot = async () => {
        if (!captureRef.current) return;
        setLoading(true)
        const element = captureRef.current;
        const canvas = await html2canvas(element, { scale: 2 });

        const image = canvas.toDataURL("image/jpeg", 0.9);

        const link = document.createElement("a");
        link.href = image;
        link.download = Cookies.get("reffid") + ".jpg";
        link.click();
        setTimeout(() => {
            setLoading(false)
        }, 2000)

        // setTimeout(() => {
        //     backtoHome()
        // }, 2100)
    };

    const backtoHome = () => {
        Cookies.remove("reffid");
        Cookies.remove("withdraw");
        Cookies.remove("deposit");
        Cookies.remove("branchId");
        localStorage.removeItem("category")
        navigate.push("/")
    }
    

    return (
        <div className="qr-comp" ref={captureRef}>
            {/* {loading &&
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', width: '100vw', position: 'fixed', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                    <img src={"./images/loading.gif"} alt='loading' style={{ width: '50px' }} />
                </div>
            } */}
            <Navbar />
            <div className="card-form invisible-scrollbar">
                <div style={{ marginTop: '42px' }} className="progress-bar">
                    <div style={{ backgroundColor: 'white' }} className="progress-start">
                        <div className="progress-title" style={{ color: 'white' }}>Isi form</div>
                    </div>
                    <div style={{ backgroundColor: 'white' }} className="progress-ongoing">
                        <div className="progress-title" style={{ color: 'white' }} >Konfirmasi form</div>
                    </div>
                    <div style={{ backgroundColor: 'white' }} className="progress-done">
                        <div className="progress-title" style={{ color: 'white' }} >Reservasi</div>
                    </div>
                </div>
                <div className="title-card">
                    <div className="title-form"></div>
                </div>
                <div className="warning"><FaExclamationCircle size={18} style={{ transform: 'scaleX(-1)' }} />
                    <div style={{ marginLeft: '8px' }}>Sebelum menutup halaman pastikan&nbsp;<b>kode voucher</b>&nbsp; Anda telah disimpan</div>
                </div>
                <div className="card-section-qr">
                    <div className="document-qr">
                        <div className="icon-success" >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="card-qr">
                            <div className="success-text">Pengisian Form Berhasil</div>
                            <div className="success-sub">Gunakan kode voucher untuk transaksi di cabang Bank Sumut </div>
                            <div style={{ height: "auto", padding: '12px 12px', borderRadius: '12px', margin: "0 auto", maxWidth: 120, width: "100%", marginTop: '32px', border: '1px solid #0058A0' }}>
                                <QRCode
                                    size={356}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={Cookies.get("reffid") || ""}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                            <div className="ref-box">
                                <div className="reservasi-label">Kode Voucher</div>
                                <div className="reservasi-value">{Cookies.get("reffid")}</div>
                            </div>

                            <div className="detail-box">
                                <div style={{ display: 'flex', width:'90%', justifyContent:'space-between', alignItems:'center' }}>
                                    <div className="detail-label" style={{ width:'50%' }}>Transaksi</div>
                                    <div className="detail-value" style={{ width:'50%',  textAlign:'end' }}>{localStorage?.category === "1" ? "Tarikan Tunai" : "Setoran Tunai"}</div>
                                </div>
                                <div style={{ display: 'flex', width:'90%', justifyContent:'space-between', alignItems:'center' }}>
                                    <div className="detail-label style={{ width:'50%' }}">Nama</div>
                                    <div className="detail-value" style={{ width:'50%',  textAlign:'end' }}>{localStorage?.category === "1" ? sensorNama(form?.["tt-name"]) : sensorNama(form?.["st-name"])}</div>
                                </div>
                                <div style={{ display: 'flex', width:'90%', justifyContent:'space-between', alignItems:'center' }}>
                                    <div className="detail-label" style={{ width:'50%' }}>Nomor Rekening</div>
                                    <div className="detail-value" style={{ width:'50%', textAlign:'end' }}>{localStorage?.category === "1" ? form?.["tt-rek"] : form?.["st-rek"]}</div>
                                </div>
                            </div>
                            <div onClick={handleScreenshot} style={{ cursor: 'pointer' }} className="btn btn-qr">Simpan</div>
                            <div onClick={() => backtoHome()} style={{ cursor: 'pointer' }} className="btn btn-outline">Selanjutnya</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}